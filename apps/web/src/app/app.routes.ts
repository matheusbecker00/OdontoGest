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
        loadComponent: () =>
          import('./features/finance/finance.page').then((module) => module.FinancePage),
      },
      ...[
        {
          path: 'estoque',
          title: 'Estoque',
          description: 'Materiais, movimentações e alertas de reposição.',
          icon: 'inventory_2',
        },
        {
          path: 'relatorios',
          title: 'Relatórios',
          description: 'Indicadores operacionais e visão gerencial.',
          icon: 'monitoring',
        },
        {
          path: 'configuracoes',
          title: 'Configurações',
          description: 'Preferências da clínica, usuários e permissões.',
          icon: 'settings',
        },
        {
          path: 'ajuda',
          title: 'Ajuda e suporte',
          description: 'Orientações e canais de atendimento do OdontoGest.',
          icon: 'help_outline',
        },
      ].map(({ path, title, description, icon }) => ({
        path,
        data: { title, description, icon },
        loadComponent: () =>
          import('./features/app/workspace-placeholder.page').then(
            (module) => module.WorkspacePlaceholderPage,
          ),
      })),
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
    ],
  },
  { path: '', pathMatch: 'full', redirectTo: 'login' },
  { path: '**', redirectTo: 'login' },
];
