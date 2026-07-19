import { ChangeDetectionStrategy, Component, OnDestroy, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
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

interface NavigationItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
}

@Component({
  selector: 'og-app-shell',
  imports: [
    MatButtonModule,
    MatIconModule,
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
  protected readonly pageTitle = signal('Dashboard');
  protected readonly today = new Intl.DateTimeFormat('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
  }).format(new Date());
  protected readonly navigation: readonly NavigationItem[] = [
    { label: 'Dashboard', icon: 'grid_view', route: '/app/dashboard' },
    { label: 'Agenda', icon: 'calendar_month', route: '/app/agenda' },
    { label: 'Pacientes', icon: 'groups', route: '/app/pacientes' },
    { label: 'Profissionais', icon: 'medical_services', route: '/app/profissionais' },
    { label: 'Procedimentos', icon: 'dentistry', route: '/app/procedimentos' },
    { label: 'Financeiro', icon: 'account_balance_wallet', route: '/app/financeiro' },
    { label: 'Estoque', icon: 'inventory_2', route: '/app/estoque' },
    { label: 'Relatórios', icon: 'monitoring', route: '/app/relatorios' },
  ];

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

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }

  private updatePageTitle(): void {
    let active = this.route;
    while (active.firstChild) active = active.firstChild;
    this.pageTitle.set(active.snapshot.data['title'] ?? 'OdontoGest');
  }
}
