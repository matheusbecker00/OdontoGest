import { computed, effect, inject, Injectable, Injector, signal } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';
import { AuthStore } from '../../core/auth/auth.store';
import type { BillingState, BillingStatus } from './billing.repository';

type SubscriptionNoticeLevel = 'hidden' | 'info' | 'warning' | 'danger';

const EMPTY_BILLING_STATE: BillingState = {
  clinicId: '',
  planId: null,
  planName: 'Sem plano',
  status: 'NONE',
  provider: null,
  checkoutUrl: null,
  updatedAt: '',
};

@Injectable({ providedIn: 'root' })
export class SubscriptionAccessService {
  private readonly auth = inject(AuthStore);
  private readonly injector = inject(Injector);
  private readonly router = inject(Router);

  readonly billingState = signal<BillingState>(EMPTY_BILLING_STATE);
  readonly canManageBilling = computed(() => this.auth.hasEveryPermission(['billing.manage']));
  readonly status = computed(() => this.billingState().status);
  readonly currentUrl = signal(this.router.url || '/');
  readonly isReadOnly = computed(
    () => this.status() === 'PAST_DUE' || this.status() === 'CANCELED',
  );
  readonly blocksWrites = computed(
    () => this.isReadOnly() && !this.isReadonlyExemptRoute(this.currentUrl()),
  );
  readonly isOperational = computed(() => this.status() === 'ACTIVE' || this.status() === 'TRIAL');
  readonly noticeLevel = computed<SubscriptionNoticeLevel>(() => {
    const status = this.status();
    if (status === 'CHECKOUT_STARTED' || status === 'PENDING') return 'warning';
    if (status === 'PAST_DUE' || status === 'CANCELED') return 'danger';
    if (status === 'NONE') return 'info';
    return 'hidden';
  });
  readonly showNotice = computed(
    () => this.noticeLevel() !== 'hidden' && (this.canManageBilling() || this.isReadOnly()),
  );
  readonly noticeTitle = computed(() => this.noticeCopy(this.status()).title);
  readonly noticeDescription = computed(() => this.noticeCopy(this.status()).description);
  readonly noticeActionLabel = computed(() => {
    if (!this.canManageBilling()) return 'Ver ajuda';
    return this.billingState().checkoutUrl ? 'Continuar checkout' : 'Ver assinatura';
  });

  constructor() {
    this.router.events
      .pipe(filter((event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event) => {
        this.currentUrl.set(event.urlAfterRedirects);
      });

    effect((onCleanup) => {
      const clinicId = this.auth.tenantContext()?.activeClinicId;
      if (!clinicId) {
        this.billingState.set({ ...EMPTY_BILLING_STATE });
        return;
      }

      let disposed = false;
      let unsubscribe: (() => void) | null = null;

      void import('./billing.repository')
        .then(({ BillingRepository }) =>
          this.injector.get(BillingRepository).subscribe(
            clinicId,
            (state) => {
              if (disposed) return;
              this.billingState.set(state);
            },
            (error) => {
              if (disposed) return;
              console.warn('Could not load subscription access state.', error);
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
          console.warn('Could not subscribe subscription access state.', error);
          this.billingState.set({ ...EMPTY_BILLING_STATE, clinicId });
        });

      onCleanup(() => {
        disposed = true;
        unsubscribe?.();
      });
    });
  }

  openBillingAction(): void {
    if (!this.canManageBilling()) {
      void this.router.navigateByUrl('/app/ajuda');
      return;
    }

    const checkoutUrl = this.billingState().checkoutUrl;
    if (checkoutUrl) {
      globalThis.open(checkoutUrl, '_blank', 'noopener');
      return;
    }

    void this.router.navigateByUrl('/app/assinatura');
  }

  canWrite(): boolean {
    return !this.blocksWrites();
  }

  private isReadonlyExemptRoute(url: string): boolean {
    const path = url.split('?')[0] ?? url;
    return (
      path === '/app/dashboard' ||
      path.startsWith('/app/assinatura') ||
      path.startsWith('/app/ajuda')
    );
  }

  private noticeCopy(status: BillingStatus): { title: string; description: string } {
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
        title: 'Modo somente leitura ativo',
        description:
          'A assinatura está com pendência. A clínica continua consultando dados, mas novas alterações ficam bloqueadas até a regularização.',
      },
      CANCELED: {
        title: 'Modo somente leitura ativo',
        description:
          'A assinatura foi cancelada. Reative um plano para voltar a criar e editar registros.',
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
