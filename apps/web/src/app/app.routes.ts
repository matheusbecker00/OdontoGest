import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { permissionGuard } from './core/auth/permission.guard';

export const routes: Routes = [
  {
    path: 'cadastro',
    loadComponent: () => import('./features/auth/signup.page').then((module) => module.SignupPage),
  },
  {
    path: 'termos',
    data: { document: 'terms' },
    loadComponent: () => import('./features/legal/legal.page').then((module) => module.LegalPage),
  },
  {
    path: 'privacidade',
    data: { document: 'privacy' },
    loadComponent: () => import('./features/legal/legal.page').then((module) => module.LegalPage),
  },
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
  {
    path: 'app/pacientes',
    canActivate: [permissionGuard(['patient.read'])],
    loadComponent: () =>
      import('./features/patients/patients.page').then((module) => module.PatientsPage),
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
