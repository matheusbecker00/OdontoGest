import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login.page').then((module) => module.LoginPage),
  },
  {
    path: 'esqueci-senha',
    loadComponent: () =>
      import('./features/auth/forgot-password.page').then((module) => module.ForgotPasswordPage),
  },
  {
    path: 'verificar-email',
    loadComponent: () =>
      import('./features/auth/verify-email.page').then((module) => module.VerifyEmailPage),
  },
  {
    path: 'redefinir-senha',
    loadComponent: () =>
      import('./features/auth/reset-password.page').then((module) => module.ResetPasswordPage),
  },
  {
    path: 'acesso-negado',
    loadComponent: () =>
      import('./features/app/access-denied.page').then((module) => module.AccessDeniedPage),
  },
  {
    path: 'app/dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/app/dashboard.page').then((module) => module.DashboardPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
