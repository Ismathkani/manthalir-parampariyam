import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class AdminLoginComponent implements OnInit {
  private authService = inject(AuthService);
  private router = inject(Router);

  username = '';
  password = '';
  showPassword = false;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor() {
    // If already logged in, redirect to dashboard
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  ngOnInit(): void {
    // ⚡ Instantly wake up the backend serverless container in the background
    this.authService.prewarmBackend();

    // ⚡ Preload the dashboard chunk into browser cache so login transitions instantly
    import('../dashboard/dashboard').catch(() => {});
  }

  onInputFocus(): void {
    this.authService.prewarmBackend();
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.errorMessage = '';
    this.successMessage = '';

    const trimmedUser = this.username.trim();
    if (!trimmedUser) {
      this.errorMessage = 'Please enter your administrator username.';
      return;
    }

    if (!this.password) {
      this.errorMessage = 'Please enter your password.';
      return;
    }

    this.isLoading = true;

    this.authService.login({ username: trimmedUser, password: this.password }).subscribe({
      next: (res) => {
        this.isLoading = false;
        if (res.success) {
          this.router.navigate(['/admin/dashboard']);
        } else {
          this.errorMessage = res.error || 'Authentication failed. Please check your credentials.';
        }
      },
      error: (err) => {
        this.isLoading = false;
        if (err.status === 429) {
          this.errorMessage = err.error?.error || 'Too many failed login attempts. Please wait 15 minutes before trying again.';
        } else if (err.status === 401) {
          if (err.error?.message && err.error.message.includes('Vercel Authentication')) {
            this.errorMessage = 'Vercel Deployment Protection is active. Please turn off "Vercel Authentication" in your Vercel Project Settings.';
          } else {
            this.errorMessage = err.error?.error || 'Invalid administrator username or password.';
          }
        } else if (err.name === 'TimeoutError') {
          this.errorMessage = 'Login request timed out. Please verify your connection or Vercel Deployment Protection settings.';
        } else {
          this.errorMessage = err.error?.error || err.error?.message || 'An unexpected connection error occurred. Please try again.';
        }
      }
    });
  }
}
