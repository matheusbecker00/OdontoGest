import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthStore } from '../../core/auth/auth.store';
import { IconComponent } from '../../shared/components/icon.component';
import {
  BILLING_PLANS,
  BillingRepository,
  type BillingPlan,
  type BillingState,
  type BillingStatus,
} from './billing.repository';

@Component({
  selector: 'og-billing-page',
  imports: [MatButtonModule, IconComponent],
  template: `
    <main class="billing-page">
      <section class="page-heading">
        <div>
          <span class="eyebrow">ASSINATURA</span>
          <h2>Plano e cobrança</h2>
          <p>Gerencie a assinatura da clínica com checkout recorrente pelo Asaas.</p>
        </div>
      </section>

      <section class="status-card" [class.status-card--warning]="isAttentionStatus()">
        <span><og-icon name="credit_card" /></span>
        <div>
          <small>STATUS ATUAL</small>
          <h3>{{ statusLabel(currentState().status) }}</h3>
          <p>
            {{ currentState().planName }}
            @if (currentState().provider) {
              · {{ currentState().provider }}
            }
          </p>
          @if (currentState().checkoutUrl && currentState().status === 'CHECKOUT_STARTED') {
            <a [href]="currentState().checkoutUrl" target="_blank" rel="noopener"
              >Continuar checkout</a
            >
          }
        </div>
      </section>

      @if (pageError()) {
        <p class="form-error">{{ pageError() }}</p>
      }

      <section class="plans-grid" aria-label="Planos disponíveis">
        @for (plan of plans; track plan.id) {
          <article class="plan-card" [class.plan-card--featured]="plan.featured">
            @if (plan.featured) {
              <span class="badge">Mais escolhido</span>
            }
            <h3>{{ plan.name }}</h3>
            <p>{{ plan.description }}</p>
            <div class="price">
              <strong>{{ plan.price }}</strong>
              <small>{{ plan.note }}</small>
            </div>
            <ul>
              @for (feature of plan.features; track feature) {
                <li><og-icon name="check" /> {{ feature }}</li>
              }
            </ul>
            <button
              mat-flat-button
              type="button"
              [disabled]="loadingPlanId() === plan.id"
              (click)="selectPlan(plan)"
            >
              {{ actionLabel(plan) }}
            </button>
          </article>
        }
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
      color: #10213a;
    }
    .page-heading {
      margin-bottom: 1rem;
    }
    .eyebrow {
      color: #2563eb;
      font-size: 0.67rem;
      font-weight: 850;
      letter-spacing: 0.12em;
    }
    h2,
    h3,
    p {
      margin: 0;
    }
    h2 {
      margin-top: 0.25rem;
      font-size: clamp(1.65rem, 3vw, 2.15rem);
    }
    .page-heading p,
    .status-card p,
    .plan-card p,
    .price small,
    li {
      margin-top: 0.25rem;
      color: #718198;
      font-size: 0.82rem;
      line-height: 1.55;
    }
    .status-card,
    .plan-card {
      border: 1px solid #e4eaf1;
      border-radius: 1rem;
      background: #fff;
      box-shadow: 0 5px 18px rgb(15 23 42 / 4%);
    }
    .status-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 1rem;
    }
    .status-card--warning {
      border-color: #fed7aa;
      background: #fffaf5;
    }
    .status-card > span {
      display: grid;
      flex: 0 0 auto;
      width: 3.25rem;
      height: 3.25rem;
      place-items: center;
      border-radius: 0.95rem;
      color: #2563eb;
      background: #eaf2ff;
    }
    .status-card og-icon {
      width: 1.65rem;
      height: 1.65rem;
    }
    .status-card small {
      color: #2563eb;
      font-size: 0.62rem;
      font-weight: 850;
      letter-spacing: 0.1em;
    }
    .status-card a {
      display: inline-block;
      margin-top: 0.5rem;
      color: #2563eb;
      font-size: 0.78rem;
      font-weight: 800;
      text-decoration: none;
    }
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
    }
    .plan-card {
      position: relative;
      display: grid;
      gap: 0.85rem;
      padding: 1.1rem;
    }
    .plan-card--featured {
      border-color: #8bb3f5;
      box-shadow: 0 12px 28px rgb(37 99 235 / 10%);
    }
    .badge {
      justify-self: start;
      border-radius: 99px;
      padding: 0.28rem 0.6rem;
      color: #1d4ed8;
      background: #eaf2ff;
      font-size: 0.65rem;
      font-weight: 850;
    }
    .price strong,
    .price small {
      display: block;
    }
    .price strong {
      font-size: 1.65rem;
      letter-spacing: -0.04em;
    }
    ul {
      display: grid;
      gap: 0.5rem;
      margin: 0;
      padding: 0;
      list-style: none;
    }
    li {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }
    li og-icon {
      width: 1rem;
      height: 1rem;
      color: #059669;
    }
    button {
      margin-top: auto;
      border-radius: 0.75rem;
    }
    .form-error {
      margin: 0 0 1rem;
      border-radius: 0.65rem;
      padding: 0.75rem;
      color: #b42318;
      background: #fff0ee;
      font-size: 0.74rem;
      font-weight: 650;
    }
    @media (width < 76rem) {
      .plans-grid {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BillingPage {
  private readonly auth = inject(AuthStore);
  private readonly billing = inject(BillingRepository);

  protected readonly plans = BILLING_PLANS;
  protected readonly pageError = signal<string | null>(null);
  protected readonly loadingPlanId = signal<string | null>(null);
  protected readonly currentState = signal<BillingState>({
    clinicId: this.activeClinicId(),
    planId: null,
    planName: 'Sem plano',
    status: 'NONE',
    provider: null,
    checkoutUrl: null,
    updatedAt: '',
  });
  protected readonly isAttentionStatus = computed(() =>
    ['NONE', 'PAST_DUE', 'CANCELED'].includes(this.currentState().status),
  );

  constructor() {
    effect((onCleanup) => {
      const clinicId = this.activeClinicId();
      let disposed = false;
      let unsubscribe: (() => void) | null = null;
      void this.billing
        .subscribe(
          clinicId,
          (state) => {
            if (disposed) return;
            this.currentState.set(state);
          },
          (error) => {
            console.warn('Could not subscribe billing state.', error);
            this.pageError.set('Não foi possível carregar a assinatura agora.');
          },
        )
        .then((nextUnsubscribe) => {
          if (disposed) {
            nextUnsubscribe();
            return;
          }
          unsubscribe = nextUnsubscribe;
        })
        .catch((error) => {
          console.warn('Could not subscribe billing state.', error);
          this.pageError.set('Não foi possível carregar a assinatura agora.');
        });

      onCleanup(() => {
        disposed = true;
        unsubscribe?.();
      });
    });
  }

  protected async selectPlan(plan: BillingPlan): Promise<void> {
    if (!plan.checkoutEnabled) {
      globalThis.location.href = 'mailto:comercial@odontogest.app?subject=Plano%20Enterprise';
      return;
    }

    this.loadingPlanId.set(plan.id);
    this.pageError.set(null);
    try {
      const checkoutUrl = await this.billing.startCheckout(this.activeClinicId(), plan.id);
      globalThis.location.href = checkoutUrl;
    } catch (error) {
      console.warn('Could not start checkout.', error);
      this.pageError.set(
        error instanceof Error ? error.message : 'Não foi possível abrir o checkout.',
      );
    } finally {
      this.loadingPlanId.set(null);
    }
  }

  protected actionLabel(plan: BillingPlan): string {
    if (this.loadingPlanId() === plan.id) return 'Abrindo checkout...';
    if (!plan.checkoutEnabled) return 'Falar com vendas';
    if (this.currentState().planId === plan.id && this.currentState().status === 'ACTIVE') {
      return 'Plano atual';
    }
    return 'Contratar com Asaas';
  }

  protected statusLabel(status: BillingStatus): string {
    return {
      NONE: 'Sem assinatura ativa',
      TRIAL: 'Trial ativo',
      CHECKOUT_STARTED: 'Checkout iniciado',
      PENDING: 'Pagamento pendente',
      ACTIVE: 'Assinatura ativa',
      PAST_DUE: 'Pagamento em atraso',
      CANCELED: 'Assinatura cancelada',
    }[status];
  }

  private activeClinicId(): string {
    return this.auth.tenantContext()?.activeClinicId ?? 'provisional-clinic';
  }
}
