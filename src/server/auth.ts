import { Request, Response, NextFunction } from 'express';
import crypto from 'node:crypto';
import bcrypt from 'bcryptjs';
import { db } from './db.js';

interface Session {
  token: string;
  username: string;
  expiresAt: number;
}

// In-memory active session registry (24-hour expiry)
const sessions = new Map<string, Session>();

// Brute-force rate limiting registry
interface RateLimitRecord {
  attempts: number;
  lockUntil: number;
}
const loginAttempts = new Map<string, RateLimitRecord>();

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const SESSION_DURATION_MS = 24 * 60 * 60 * 1000; // 24 hours

export function getClientIp(req: Request): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
}

export function handleLogin(req: Request, res: Response): void {
  const ip = getClientIp(req);
  const now = Date.now();

  // Check rate limit lockout
  const attemptRecord = loginAttempts.get(ip);
  if (attemptRecord && attemptRecord.lockUntil > now) {
    const remainingMins = Math.ceil((attemptRecord.lockUntil - now) / 60000);
    res.status(429).json({
      success: false,
      error: `Too many failed login attempts. Please wait ${remainingMins} minute(s) before trying again.`
    });
    return;
  }

  const { username, password } = req.body || {};

  if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
    res.status(400).json({
      success: false,
      error: 'Username and password are required.'
    });
    return;
  }

  const admin = db.getAdmin();

  // Timing safe or safe comparison
  const usernameMatch = username.trim() === admin.username;
  const passwordMatch = usernameMatch ? bcrypt.compareSync(password, admin.passwordHash) : false;

  if (!usernameMatch || !passwordMatch) {
    // Increment failed attempt counter
    const current = attemptRecord || { attempts: 0, lockUntil: 0 };
    current.attempts += 1;
    if (current.attempts >= MAX_FAILED_ATTEMPTS) {
      current.lockUntil = now + LOCKOUT_DURATION_MS;
    }
    loginAttempts.set(ip, current);

    const attemptsLeft = Math.max(0, MAX_FAILED_ATTEMPTS - current.attempts);
    res.status(401).json({
      success: false,
      error: current.attempts >= MAX_FAILED_ATTEMPTS
        ? 'Account temporarily locked due to multiple failed login attempts. Please wait 15 minutes.'
        : `Invalid username or password. (${attemptsLeft} attempt(s) remaining)`
    });
    return;
  }

  // Login successful: reset rate limiter
  loginAttempts.delete(ip);
  db.updateAdminLoginTime();

  // Generate cryptographically secure session token
  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = now + SESSION_DURATION_MS;

  sessions.set(token, {
    token,
    username: admin.username,
    expiresAt
  });

  // Set secure HttpOnly cookie
  res.cookie('manthalir_admin_session', token, {
    httpOnly: true,
    secure: process.env['NODE_ENV'] === 'production',
    sameSite: 'lax',
    maxAge: SESSION_DURATION_MS,
    path: '/'
  });

  res.json({
    success: true,
    token, // Return token for API authorization header compatibility
    user: {
      username: admin.username,
      mustChangePassword: admin.mustChangePassword
    }
  });
}

export function handleLogout(req: Request, res: Response): void {
  const token = extractToken(req);
  if (token) {
    sessions.delete(token);
  }

  res.clearCookie('manthalir_admin_session', { path: '/' });
  res.json({ success: true, message: 'Logged out successfully.' });
}

export function handleMe(req: Request, res: Response): void {
  const session = getAuthenticatedSession(req);
  if (!session) {
    res.status(401).json({ authenticated: false });
    return;
  }

  const admin = db.getAdmin();
  res.json({
    authenticated: true,
    user: {
      username: admin.username,
      mustChangePassword: admin.mustChangePassword
    }
  });
}

export function handleChangePassword(req: Request, res: Response): void {
  const session = getAuthenticatedSession(req);
  if (!session) {
    res.status(401).json({ success: false, error: 'Unauthorized.' });
    return;
  }

  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || !newPassword) {
    res.status(400).json({ success: false, error: 'Current password and new password are required.' });
    return;
  }

  const admin = db.getAdmin();

  // Validate current password
  const currentValid = bcrypt.compareSync(currentPassword, admin.passwordHash);
  if (!currentValid) {
    res.status(400).json({ success: false, error: 'Current password is incorrect.' });
    return;
  }

  // Validate new password rules (minimum 8 characters, at least 1 number or special symbol)
  if (newPassword.length < 8) {
    res.status(400).json({ success: false, error: 'New password must be at least 8 characters long.' });
    return;
  }

  if (currentPassword === newPassword) {
    res.status(400).json({ success: false, error: 'New password must be different from current password.' });
    return;
  }

  // Hash new password with fresh salt
  const salt = bcrypt.genSaltSync(10);
  const newHash = bcrypt.hashSync(newPassword, salt);

  db.updateAdminPassword(newHash);

  res.json({
    success: true,
    message: 'Password changed successfully.'
  });
}

// Middleware for protecting Admin Endpoints
export function requireAdminAuth(req: Request, res: Response, next: NextFunction): void {
  const session = getAuthenticatedSession(req);
  if (!session) {
    res.status(401).json({ success: false, error: 'Authentication required to access admin resources.' });
    return;
  }
  next();
}

function extractToken(req: Request): string | undefined {
  // Check cookie first
  if (req.cookies && req.cookies['manthalir_admin_session']) {
    return req.cookies['manthalir_admin_session'];
  }

  // Check Authorization Bearer header
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return undefined;
}

function getAuthenticatedSession(req: Request): Session | null {
  const token = extractToken(req);
  if (!token) return null;

  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }

  return session;
}
