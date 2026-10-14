import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of, map, timeout } from 'rxjs';

export interface AdminUser {
  username: string;
  mustChangePassword: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  // Reactive state signals
  readonly currentUser = signal<AdminUser | null>(null);
  readonly isAuthenticated = computed(() => this.currentUser() !== null);
  readonly checkingSession = signal<boolean>(true);

  private isPrewarmed = false;

  prewarmBackend(): void {
    if (this.isPrewarmed) return;
    this.isPrewarmed = true;
    this.http.get('/api/ping').subscribe({
      next: () => {},
      error: () => {}
    });
  }

  constructor() {
    this.checkSession().subscribe();
  }

  checkSession(): Observable<boolean> {
    this.checkingSession.set(true);
    return this.http.get<{ authenticated: boolean; user?: AdminUser }>('/api/auth/me', {
      withCredentials: true
    }).pipe(
      map(res => {
        if (res && res.authenticated && res.user) {
          this.currentUser.set(res.user);
          this.checkingSession.set(false);
          return true;
        }
        this.currentUser.set(null);
        this.checkingSession.set(false);
        return false;
      }),
      catchError(() => {
        this.currentUser.set(null);
        this.checkingSession.set(false);
        return of(false);
      })
    );
  }

  login(credentials: { username: string; password: string }): Observable<any> {
    return this.http.post<{ success: boolean; token?: string; user?: AdminUser; error?: string }>(
      '/api/auth/login',
      credentials,
      { withCredentials: true }
    ).pipe(
      timeout(10000),
      tap(res => {
        if (res.success && res.user) {
          this.currentUser.set(res.user);
        }
      })
    );
  }

  logout(): Observable<any> {
    return this.http.post('/api/auth/logout', {}, { withCredentials: true }).pipe(
      tap(() => {
        this.currentUser.set(null);
        this.router.navigate(['/admin/login']);
      }),
      catchError(err => {
        this.currentUser.set(null);
        this.router.navigate(['/admin/login']);
        return of(err);
      })
    );
  }

  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    return this.http.post<{ success: boolean; message?: string; error?: string }>(
      '/api/auth/change-password',
      data,
      { withCredentials: true }
    ).pipe(
      tap(res => {
        if (res.success) {
          const current = this.currentUser();
          if (current) {
            this.currentUser.set({ ...current, mustChangePassword: false });
          }
        }
      })
    );
  }
}
