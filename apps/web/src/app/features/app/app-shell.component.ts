import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenav, MatSidenavModule } from '@angular/material/sidenav';
import { MatTooltipModule } from '@angular/material/tooltip';
import {
  ActivatedRoute,
  NavigationEnd,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { filter } from 'rxjs';
import { AuthStore } from '../../core/auth/auth.store';
import { IconComponent } from '../../shared/components/icon.component';

interface NavigationItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly permissions?: readonly string[];
}

const SIDEBAR_COLLAPSED_KEY = 'og.sidebar-collapsed';

@Component({
  selector: 'og-app-shell',
  imports: [
    MatButtonModule,
    IconComponent,
    MatSidenavModule,
    MatTooltipModule,
    RouterLink,
    RouterLinkActive,
    RouterOutlet,
  ],
  templateUrl: './app-shell.component.html',
  styleUrl: './app-shell.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppShellComponent implements OnDestroy {
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly media =
    typeof globalThis.matchMedia === 'function'
      ? globalThis.matchMedia('(max-width: 63.99rem)')
      : null;
  private readonly mediaListener = (event: MediaQueryListEvent) => this.isMobile.set(event.matches);

  protected readonly isMobile = signal(this.media?.matches ?? false);
  protected readonly sidebarCollapsed = signal(this.readSidebarPreference());
  protected readonly pageTitle = signal('Dashboard');
  protected readonly today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date());
  protected readonly navigation: readonly NavigationItem[] = [
    { label: 'Dashboard', icon: 'grid_view', route: '/app/dashboard' },
    {
      label: 'Agenda',
      icon: 'calendar_month',
      route: '/app/agenda',
      permissions: ['appointment.read'],
    },
    { label: 'Pacientes', icon: 'groups', route: '/app/pacientes', permissions: ['patient.read'] },
    {
      label: 'Profissionais',
      icon: 'medical_services',
      route: '/app/profissionais',
      permissions: ['dentist.read'],
    },
    {
      label: 'Procedimentos',
      icon: 'dentistry',
      route: '/app/procedimentos',
      permissions: ['procedure.read'],
    },
    {
      label: 'Financeiro',
      icon: 'account_balance_wallet',
      route: '/app/financeiro',
      permissions: ['finance.read'],
    },
    {
      label: 'Estoque',
      icon: 'inventory_2',
      route: '/app/estoque',
      permissions: ['inventory.read'],
    },
    {
      label: 'Relatórios',
      icon: 'monitoring',
      route: '/app/relatorios',
      permissions: ['report.read'],
    },
  ];
  protected readonly visibleNavigation = computed(() =>
    this.navigation.filter((item) => this.canShow(item)),
  );

  constructor() {
    this.media?.addEventListener('change', this.mediaListener);
    this.updatePageTitle();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updatePageTitle();
    });
  }

  ngOnDestroy(): void {
    this.media?.removeEventListener('change', this.mediaListener);
  }

  protected closeMobile(drawer: MatSidenav): void {
    if (this.isMobile()) void drawer.close();
  }

  protected toggleSidebar(drawer: MatSidenav): void {
    if (this.isMobile()) {
      void drawer.toggle();
      return;
    }

    this.sidebarCollapsed.update((value) => {
      const next = !value;
      this.writeSidebarPreference(next);
      return next;
    });
  }

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }

  private updatePageTitle(): void {
    let active = this.route;
    while (active.firstChild) active = active.firstChild;
    const title = active.snapshot?.data?.['title'];
    this.pageTitle.set(typeof title === 'string' && title.length > 0 ? title : 'OdontoGest');
  }

  private readSidebarPreference(): boolean {
    try {
      return globalThis.localStorage?.getItem(SIDEBAR_COLLAPSED_KEY) === 'true';
    } catch {
      return false;
    }
  }

  private writeSidebarPreference(collapsed: boolean): void {
    try {
      globalThis.localStorage?.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
    } catch {
      // If storage is unavailable, the in-memory signal still updates for this session.
    }
  }

  private canShow(item: NavigationItem): boolean {
    return !item.permissions || this.auth.hasEveryPermission(item.permissions);
  }
}
