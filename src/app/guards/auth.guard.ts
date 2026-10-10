import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { map } from 'rxjs';

export const authGuard: CanActivateFn = (_route, _state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // If already authenticated in memory
  if (authService.isAuthenticated()) {
    return true;
  }

  // Otherwise check session with backend
  return authService.checkSession().pipe(
    map(isAuthenticated => {
      if (isAuthenticated) {
        return true;
      }
      router.navigate(['/admin/login']);
      return false;
    })
  );
};
