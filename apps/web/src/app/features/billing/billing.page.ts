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
  type BillingPlanId,
  type BillingState,
  type BillingStatus,
} from './billing.repository';

@Component({
  selector: 'og-billing-page',
  imports: [MatButtonModule, IconComponent],
  template: `
    <main class="billing-page">
      <section class="billing-hero">
        <div>
          <span class="eyebrow">ASSINATURA</span>
          <h2>Escolha o plano da sua clínica</h2>
          <p>
            Contrate com segurança pelo Asaas e libere a operação comercial do OdontoGest em poucos
            minutos.
          </p>
          <div class="hero-actions">
            <a href="#planos">Ver planos</a>
            <span><og-icon name="verified_user" /> Pagamento protegido pelo Asaas</span>
          </div>
        </div>

        <aside class="status-card" [class.status-card--warning]="isAttentionStatus()">
          <small>STATUS ATUAL</small>
          <strong>{{ statusLabel(currentState().status) }}</strong>
          <span>
            {{ currentState().planName }}
            @if (currentState().provider) {
              · {{ currentState().provider }}
            }
          </span>
          @if (currentState().checkoutUrl && currentState().status === 'CHECKOUT_STARTED') {
            <a [href]="currentState().checkoutUrl" target="_blank" rel="noopener">
              Continuar checkout aberto
            </a>
          }
        </aside>
      </section>

      @if (pageError()) {
        <p class="form-error">{{ pageError() }}</p>
      }

      <section class="billing-layout" id="planos">
        <div class="plans-column">
          <header>
            <span class="eyebrow">PLANOS</span>
            <h3>Comece simples e evolua quando precisar</h3>
          </header>

          <div class="plans-grid" aria-label="Planos disponíveis">
            @for (plan of plans; track plan.id) {
              <button
                type="button"
                class="plan-card"
                [class.plan-card--featured]="plan.featured"
                [class.plan-card--selected]="selectedPlanId() === plan.id"
                (click)="choosePlan(plan)"
              >
                <span class="plan-card__topline">
                  <strong>{{ plan.name }}</strong>
                  @if (plan.featured) {
                    <em>Mais escolhido</em>
                  }
                </span>
                <span class="plan-card__description">{{ plan.description }}</span>
                <span class="price">
                  <strong>{{ plan.price }}</strong>
                  <small>{{ plan.note }}</small>
                </span>
                <span class="feature-list">
                  @for (feature of plan.features; track feature) {
                    <span><og-icon name="check" /> {{ feature }}</span>
                  }
                </span>
              </button>
            }
          </div>
        </div>

        <aside class="checkout-card">
          <span class="checkout-card__badge"><og-icon name="credit_card" /> Checkout seguro</span>
          <h3>{{ selectedPlan().name }}</h3>
          <p>{{ selectedPlan().description }}</p>

          <div class="checkout-price">
            <span>Total mensal</span>
            <strong>{{ selectedPlan().price }}</strong>
            <small>{{ selectedPlan().note }}</small>
          </div>

          <div class="summary-list">
            <div>
              <span>Plano</span>
              <strong>OdontoGest {{ selectedPlan().name }}</strong>
            </div>
            <div>
              <span>Frequência</span>
              <strong>Mensal</strong>
            </div>
            <div>
              <span>Formas de pagamento</span>
              <strong>Boleto e cartão no Asaas</strong>
            </div>
          </div>

          <button
            mat-flat-button
            type="button"
            [disabled]="loadingPlanId() === selectedPlan().id"
            (click)="startCheckout(selectedPlan())"
          >
            {{ checkoutLabel(selectedPlan()) }}
          </button>

          <div class="trust-grid" aria-label="Garantias do checkout">
            <span><og-icon name="lock" /> Sem cartão salvo no OdontoGest</span>
            <span><og-icon name="verified_user" /> Webhook com token seguro</span>
            <span><og-icon name="check" /> Liberação automática após pagamento</span>
          </div>
        </aside>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
      color: #10213a;
    }
    .billing-page {
      display: grid;
      gap: 1rem;
    }
    .billing-hero,
    .billing-layout,
    .checkout-card,
    .plan-card {
      border: 1px solid #e4eaf1;
      border-radius: 1.1rem;
      background: #fff;
      box-shadow: 0 10px 30px rgb(15 23 42 / 5%);
    }
    .billing-hero {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(18rem, 24rem);
      gap: 1rem;
      overflow: hidden;
      padding: clamp(1.15rem, 3vw, 1.75rem);
      background:
        radial-gradient(circle at top right, rgb(37 99 235 / 18%), transparent 34rem),
        linear-gradient(135deg, #ffffff, #f5f8ff);
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
      max-width: 46rem;
      margin-top: 0.3rem;
      font-size: clamp(1.9rem, 4vw, 3.1rem);
      line-height: 1.03;
      letter-spacing: -0.06em;
    }
    .billing-hero p,
    .checkout-card p,
    .plan-card__description {
      color: #667895;
      font-size: 0.9rem;
      line-height: 1.65;
    }
    .billing-hero p {
      max-width: 42rem;
      margin-top: 0.65rem;
    }
    .hero-actions {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 0.75rem;
      margin-top: 1.15rem;
    }
    .hero-actions a,
    .status-card a {
      border-radius: 99px;
      padding: 0.55rem 0.85rem;
      color: #fff;
      background: #2563eb;
      font-size: 0.78rem;
      font-weight: 850;
      text-decoration: none;
    }
    .hero-actions span,
    .trust-grid span,
    .checkout-card__badge {
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      color: #047857;
      font-size: 0.75rem;
      font-weight: 800;
    }
    .hero-actions og-icon,
    .trust-grid og-icon,
    .checkout-card__badge og-icon {
      width: 1rem;
      height: 1rem;
    }
    .status-card {
      align-self: stretch;
      display: grid;
      align-content: center;
      gap: 0.35rem;
      border: 1px solid #dbeafe;
      border-radius: 0.95rem;
      padding: 1rem;
      background: rgb(255 255 255 / 74%);
      backdrop-filter: blur(14px);
    }
    .status-card--warning {
      border-color: #fed7aa;
      background: rgb(255 250 245 / 78%);
    }
    .status-card small {
      color: #2563eb;
      font-size: 0.62rem;
      font-weight: 850;
      letter-spacing: 0.1em;
    }
    .status-card strong {
      font-size: 1.25rem;
      letter-spacing: -0.04em;
    }
    .status-card span {
      color: #718198;
      font-size: 0.82rem;
    }
    .status-card a {
      justify-self: start;
      margin-top: 0.4rem;
      color: #2563eb;
      background: #eaf2ff;
    }
    .billing-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(20rem, 26rem);
      gap: 1rem;
      padding: 1rem;
      background: #f8fbff;
    }
    .plans-column {
      display: grid;
      gap: 1rem;
    }
    .plans-column header h3 {
      margin-top: 0.2rem;
      font-size: 1.25rem;
      letter-spacing: -0.04em;
    }
    .plans-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.85rem;
    }
    .plan-card {
      position: relative;
      display: grid;
      gap: 0.85rem;
      padding: 1rem;
      color: inherit;
      text-align: left;
      cursor: pointer;
      transition:
        border-color 150ms,
        box-shadow 150ms,
        transform 150ms;
    }
    .plan-card:hover,
    .plan-card--selected {
      border-color: #7daaf3;
      box-shadow: 0 16px 34px rgb(37 99 235 / 12%);
      transform: translateY(-2px);
    }
    .plan-card--featured::before {
      content: '';
      position: absolute;
      inset: 0;
      border-radius: inherit;
      pointer-events: none;
      box-shadow: inset 0 0 0 1px rgb(37 99 235 / 22%);
    }
    .plan-card__topline {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
    }
    .plan-card__topline strong {
      font-size: 1rem;
    }
    .plan-card__topline em {
      border-radius: 99px;
      padding: 0.25rem 0.55rem;
      color: #1d4ed8;
      background: #eaf2ff;
      font-size: 0.62rem;
      font-style: normal;
      font-weight: 850;
      white-space: nowrap;
    }
    .price strong,
    .price small,
    .checkout-price strong,
    .checkout-price small {
      display: block;
    }
    .price strong,
    .checkout-price strong {
      color: #0f2141;
      font-size: 1.65rem;
      letter-spacing: -0.05em;
    }
    .price small,
    .checkout-price small {
      color: #718198;
      font-size: 0.76rem;
      line-height: 1.5;
    }
    .feature-list {
      display: grid;
      gap: 0.45rem;
    }
    .feature-list span {
      display: flex;
      align-items: center;
      gap: 0.42rem;
      color: #52657e;
      font-size: 0.78rem;
      line-height: 1.45;
    }
    .feature-list og-icon {
      width: 0.95rem;
      height: 0.95rem;
      color: #059669;
    }
    .checkout-card {
      position: sticky;
      top: 1rem;
      display: grid;
      align-self: start;
      gap: 1rem;
      padding: 1.1rem;
    }
    .checkout-card__badge {
      justify-self: start;
      border: 1px solid #b9f0d3;
      border-radius: 99px;
      padding: 0.35rem 0.6rem;
      background: #ecfdf5;
    }
    .checkout-card h3 {
      font-size: 1.45rem;
      letter-spacing: -0.04em;
    }
    .checkout-price {
      border: 1px solid #e4eaf1;
      border-radius: 0.9rem;
      padding: 0.85rem;
      background: linear-gradient(135deg, #f8fbff, #ffffff);
    }
    .checkout-price > span,
    .summary-list span {
      color: #718198;
      font-size: 0.72rem;
      font-weight: 800;
    }
    .summary-list {
      display: grid;
      gap: 0.75rem;
    }
    .summary-list div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border-bottom: 1px solid #edf1f5;
      padding-bottom: 0.75rem;
    }
    .summary-list strong {
      color: #10213a;
      font-size: 0.8rem;
      text-align: right;
    }
    button[mat-flat-button] {
      min-height: 3rem;
      border-radius: 0.85rem;
      font-weight: 850;
    }
    .trust-grid {
      display: grid;
      gap: 0.55rem;
      border-radius: 0.9rem;
      padding: 0.85rem;
      background: #f8fafc;
    }
    .trust-grid span {
      color: #52657e;
      font-size: 0.72rem;
      font-weight: 750;
    }
    .form-error {
      margin: 0;
      border-radius: 0.65rem;
      padding: 0.75rem;
      color: #b42318;
      background: #fff0ee;
      font-size: 0.74rem;
      font-weight: 650;
    }
    @media (width < 86rem) {
      .plans-grid {
        grid-template-columns: 1fr;
      }
    }
    @media (width < 70rem) {
      .billing-hero,
      .billing-layout {
        grid-template-columns: 1fr;
      }
      .checkout-card {
        position: static;
      }
    }
    @media (width < 42rem) {
      .billing-hero,
      .billing-layout {
        padding: 0.85rem;
      }
      .summary-list div {
        align-items: flex-start;
        flex-direction: column;
      }
      .summary-list strong {
        text-align: left;
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
  protected readonly selectedPlanId = signal<BillingPlanId>('pro');
  protected readonly currentState = signal<BillingState>({
    clinicId: this.activeClinicId(),
    planId: null,
    planName: 'Sem plano',
    status: 'NONE',
    provider: null,
    checkoutUrl: null,
    updatedAt: '',
  });
  protected readonly selectedPlan = computed(
    () => this.plans.find((plan) => plan.id === this.selectedPlanId()) ?? this.plans[1],
  );
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
            if (state.planId) this.selectedPlanId.set(state.planId);
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

  protected choosePlan(plan: BillingPlan): void {
    this.selectedPlanId.set(plan.id);
    this.pageError.set(null);
  }

  protected async startCheckout(plan: BillingPlan): Promise<void> {
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

  protected checkoutLabel(plan: BillingPlan): string {
    if (this.loadingPlanId() === plan.id) return 'Abrindo checkout seguro...';
    if (!plan.checkoutEnabled) return 'Falar com vendas';
    if (this.currentState().planId === plan.id && this.currentState().status === 'ACTIVE') {
      return 'Plano atual';
    }
    return 'Continuar para pagamento no Asaas';
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
