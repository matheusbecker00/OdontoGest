import { inject } from '@angular/core';
import type { CanActivateFn } from '@angular/router';
import { Router } from '@angular/router';
import { AuthStore } from './auth.store';

export function permissionGuard(required: readonly string[]): CanActivateFn {
  return async () => {
    const auth = inject(AuthStore);
    const router = inject(Router);
    if (!(await auth.restoreSession())) return router.parseUrl('/login');
    return auth.hasEveryPermission(required) ? true : router.parseUrl('/acesso-negado');
  };
}
