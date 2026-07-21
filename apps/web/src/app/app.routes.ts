import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth.guard';
import { permissionGuard } from './core/auth/permission.guard';
import { AppShellComponent } from './features/app/app-shell.component';
import { DashboardPage } from './features/app/dashboard.page';

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
    path: 'app',
    canActivate: [authGuard],
    component: AppShellComponent,
    children: [
      {
        path: 'dashboard',
        data: { title: 'Dashboard' },
        component: DashboardPage,
      },
      {
        path: 'agenda',
        data: { title: 'Agenda' },
        canActivate: [permissionGuard(['appointment.read'])],
        loadComponent: () =>
          import('./features/app/calendar.page').then((module) => module.CalendarPage),
      },
      {
        path: 'pacientes',
        data: { title: 'Pacientes' },
        canActivate: [permissionGuard(['patient.read'])],
        loadComponent: () =>
          import('./features/patients/patients.page').then((module) => module.PatientsPage),
      },
      {
        path: 'profissionais',
        data: { title: 'Profissionais' },
        canActivate: [permissionGuard(['dentist.read'])],
        loadComponent: () =>
          import('./features/dentists/dentists.page').then((module) => module.DentistsPage),
      },
      {
        path: 'procedimentos',
        data: { title: 'Procedimentos' },
        canActivate: [permissionGuard(['procedure.read'])],
        loadComponent: () =>
          import('./features/procedures/procedures.page').then((module) => module.ProceduresPage),
      },
      {
        path: 'financeiro',
        data: { title: 'Financeiro' },
        canActivate: [permissionGuard(['finance.read'])],
        loadComponent: () =>
          import('./features/finance/finance.page').then((module) => module.FinancePage),
      },
      {
        path: 'estoque',
        data: { title: 'Estoque' },
        canActivate: [permissionGuard(['inventory.read'])],
        loadComponent: () =>
          import('./features/inventory/inventory.page').then((module) => module.InventoryPage),
      },
      {
        path: 'relatorios',
        data: { title: 'Relatórios' },
        canActivate: [permissionGuard(['report.read'])],
        loadComponent: () =>
          import('./features/reports/reports.page').then((module) => module.ReportsPage),
      },
      {
        path: 'configuracoes',
        data: { title: 'Configurações' },
        canActivate: [permissionGuard(['settings.manage'])],
        loadComponent: () =>
          import('./features/settings/settings.page').then((module) => module.SettingsPage),
      },
      {
        path: 'equipe',
        data: { title: 'Equipe' },
        canActivate: [permissionGuard(['team.manage'])],
        loadComponent: () => import('./features/team/team.page').then((module) => module.TeamPage),
      },
      {
        path: 'assinatura',
        data: { title: 'Assinatura' },
        canActivate: [permissionGuard(['billing.manage'])],
        loadComponent: () =>
          import('./features/billing/billing.page').then((module) => module.BillingPage),
      },
      {
        path: 'ajuda',
        data: { title: 'Ajuda e suporte' },
        loadComponent: () => import('./features/help/help.page').then((module) => module.HelpPage),
      },
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () =>
      import('./features/landing/landing.page').then((module) => module.LandingPage),
  },
  { path: '**', redirectTo: '' },
];
