import {
  ChangeDetectionStrategy,
  Component,
  Injector,
  OnDestroy,
  computed,
  effect,
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
import type { BillingState, BillingStatus } from '../billing/billing.repository';

interface NavigationItem {
  readonly label: string;
  readonly icon: string;
  readonly route: string;
  readonly permissions?: readonly string[];
}

const SIDEBAR_COLLAPSED_KEY = 'og.sidebar-collapsed';

const EMPTY_BILLING_STATE: BillingState = {
  clinicId: '',
  planId: null,
  planName: 'Sem plano',
  status: 'NONE',
  provider: null,
  checkoutUrl: null,
  updatedAt: '',
};

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
  private readonly injector = inject(Injector);
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
    {
      label: 'Assinatura',
      icon: 'credit_card',
      route: '/app/assinatura',
      permissions: ['billing.manage'],
    },
  ];
  protected readonly visibleNavigation = computed(() =>
    this.navigation.filter((item) => this.canShow(item)),
  );
  protected readonly billingState = signal<BillingState>(EMPTY_BILLING_STATE);
  protected readonly canManageBilling = computed(() =>
    this.auth.hasEveryPermission(['billing.manage']),
  );
  protected readonly showBillingNotice = computed(
    () => this.canManageBilling() && this.billingNoticeLevel() !== 'hidden',
  );
  protected readonly billingNoticeLevel = computed<'hidden' | 'info' | 'warning' | 'danger'>(() => {
    const status = this.billingState().status;
    if (status === 'CHECKOUT_STARTED' || status === 'PENDING') return 'warning';
    if (status === 'PAST_DUE' || status === 'CANCELED') return 'danger';
    if (status === 'NONE') return 'info';
    return 'hidden';
  });
  protected readonly billingNoticeTitle = computed(
    () => this.billingNoticeCopy(this.billingState().status).title,
  );
  protected readonly billingNoticeDescription = computed(
    () => this.billingNoticeCopy(this.billingState().status).description,
  );
  protected readonly billingNoticeActionLabel = computed(() =>
    this.billingState().checkoutUrl ? 'Continuar checkout' : 'Ver assinatura',
  );

  constructor() {
    this.media?.addEventListener('change', this.mediaListener);
    this.updatePageTitle();
    this.router.events.pipe(filter((event) => event instanceof NavigationEnd)).subscribe(() => {
      this.updatePageTitle();
    });

    effect((onCleanup) => {
      const clinicId = this.auth.tenantContext()?.activeClinicId;
      if (!clinicId || !this.canManageBilling()) {
        this.billingState.set({ ...EMPTY_BILLING_STATE, clinicId: clinicId ?? '' });
        return;
      }

      let disposed = false;
      let unsubscribe: (() => void) | null = null;

      void import('../billing/billing.repository')
        .then(({ BillingRepository }) =>
          this.injector.get(BillingRepository).subscribe(
            clinicId,
            (state) => {
              if (disposed) return;
              this.billingState.set(state);
            },
            (error) => {
              if (disposed) return;
              console.warn('Could not load billing state on shell.', error);
              this.billingState.set({ ...EMPTY_BILLING_STATE, clinicId });
            },
          ),
        )
        .then((nextUnsubscribe) => {
          if (disposed) {
            nextUnsubscribe();
            return;
          }
          unsubscribe = nextUnsubscribe;
        })
        .catch((error) => {
          if (disposed) return;
          console.warn('Could not subscribe billing state on shell.', error);
          this.billingState.set({ ...EMPTY_BILLING_STATE, clinicId });
        });

      onCleanup(() => {
        disposed = true;
        unsubscribe?.();
      });
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

  protected openBillingAction(): void {
    const checkoutUrl = this.billingState().checkoutUrl;
    if (checkoutUrl) {
      globalThis.open(checkoutUrl, '_blank', 'noopener');
      return;
    }

    void this.router.navigateByUrl('/app/assinatura');
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

  private billingNoticeCopy(status: BillingStatus): { title: string; description: string } {
    const copy: Partial<Record<BillingStatus, { title: string; description: string }>> = {
      NONE: {
        title: 'Configure a assinatura da clínica',
        description:
          'Escolha um plano para deixar a cobrança recorrente pronta antes da operação comercial.',
      },
      CHECKOUT_STARTED: {
        title: 'Checkout de assinatura em andamento',
        description:
          'Existe um checkout aberto no Asaas. Conclua o pagamento para ativar o plano automaticamente.',
      },
      PENDING: {
        title: 'Pagamento em processamento',
        description:
          'Estamos aguardando a confirmação do Asaas. O status será atualizado pelo webhook.',
      },
      PAST_DUE: {
        title: 'Assinatura com pendência',
        description:
          'Regularize a cobrança para evitar restrições de uso e manter a clínica operacional.',
      },
      CANCELED: {
        title: 'Assinatura cancelada',
        description:
          'Reative um plano para manter o acesso comercial do OdontoGest sem interrupções.',
      },
    };

    return (
      copy[status] ?? {
        title: 'Assinatura ativa',
        description: 'A cobrança da clínica está regular.',
      }
    );
  }
}
