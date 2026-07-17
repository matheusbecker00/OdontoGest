import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthStore } from './auth.store';

export const authGuard: CanActivateFn = async (_route, state) => {
  const auth = inject(AuthStore);
  const router = inject(Router);
  return (await auth.restoreSession())
    ? true
    : router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
};
