import express from 'express';
import cookieParser from 'cookie-parser';
import { handleLogin, handleLogout, handleMe, handleChangePassword } from './auth.js';
import apiRouter from './api.js';

const app = express();

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

app.get('/api/ping', (_req, res) => res.json({ ok: true, timestamp: Date.now() }));
app.get('/ping', (_req, res) => res.json({ ok: true, timestamp: Date.now() }));

app.post('/api/auth/login', handleLogin);
app.post('/auth/login', handleLogin);
app.post('/api/auth/logout', handleLogout);
app.post('/auth/logout', handleLogout);
app.get('/api/auth/me', handleMe);
app.get('/auth/me', handleMe);
app.post('/api/auth/change-password', handleChangePassword);
app.post('/auth/change-password', handleChangePassword);

app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
