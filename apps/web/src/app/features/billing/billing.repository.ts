import { inject, Injectable } from '@angular/core';
import {
  collection,
  doc,
  getFirestore,
  limit,
  onSnapshot,
  orderBy,
  query,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service';
import { getOdontoGestFirebaseApp } from '../../core/firebase-app';

export type BillingPlanId = 'starter' | 'pro' | 'enterprise';
export type BillingStatus =
  'TRIAL' | 'CHECKOUT_STARTED' | 'PENDING' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED' | 'NONE';

export interface BillingPlan {
  readonly id: BillingPlanId;
  readonly name: string;
  readonly price: string;
  readonly note: string;
  readonly description: string;
  readonly features: readonly string[];
  readonly featured?: boolean;
  readonly checkoutEnabled: boolean;
}

export interface BillingState {
  readonly clinicId: string;
  readonly planId: BillingPlanId | null;
  readonly planName: string;
  readonly status: BillingStatus;
  readonly provider: 'ASAAS' | null;
  readonly checkoutUrl: string | null;
  readonly updatedAt: string;
}

export interface BillingEvent {
  readonly id: string;
  readonly provider: 'ASAAS' | null;
  readonly event: string | null;
  readonly status: BillingStatus;
  readonly planId: BillingPlanId | null;
  readonly planName: string | null;
  readonly providerPaymentId: string | null;
  readonly providerSubscriptionId: string | null;
  readonly providerPaymentLinkId: string | null;
  readonly checkoutUrl: string | null;
  readonly actorUserId: string | null;
  readonly receivedAt: string;
}

export const BILLING_PLANS: readonly BillingPlan[] = [
  {
    id: 'starter',
    name: 'Starter',
    price: 'R$ 49,90',
    note: 'por mês',
    description: 'Para consultórios iniciando a organização digital.',
    features: ['Agenda e cadastros essenciais', 'Pacientes e procedimentos', 'Suporte por email'],
    checkoutEnabled: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 'R$ 49,90',
    note: 'nos primeiros 3 meses. Depois R$ 79,90/mês.',
    description: 'Para clínicas que precisam de visão operacional e financeira.',
    features: [
      'Tudo do Starter',
      'Financeiro e indicadores',
      'Equipe com permissões',
      'Suporte prioritário',
    ],
    featured: true,
    checkoutEnabled: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 'Sob consulta',
    note: 'contrato personalizado',
    description: 'Para operações maiores com necessidades específicas.',
    features: [
      'Fluxos personalizados',
      'Acompanhamento dedicado',
      'Condições comerciais sob medida',
    ],
    checkoutEnabled: false,
  },
];

@Injectable({ providedIn: 'root' })
export class BillingRepository {
  private readonly firebaseAuth = inject(FirebaseAuthService);
  private readonly firestore: Firestore = getFirestore(getOdontoGestFirebaseApp());

  async subscribe(
    clinicId: string,
    onNext: (state: BillingState) => void,
    onError: (error: unknown) => void,
  ): Promise<Unsubscribe> {
    return onSnapshot(
      doc(this.firestore, 'clinics', clinicId, 'billing', 'current'),
      (snapshot) =>
        onNext(
          snapshot.exists()
            ? this.fromFirestore(clinicId, snapshot.data())
            : this.emptyState(clinicId),
        ),
      onError,
    );
  }

  async subscribeEvents(
    clinicId: string,
    onNext: (events: readonly BillingEvent[]) => void,
    onError: (error: unknown) => void,
  ): Promise<Unsubscribe> {
    return onSnapshot(
      query(
        collection(this.firestore, 'clinics', clinicId, 'billingEvents'),
        orderBy('receivedAt', 'desc'),
        limit(20),
      ),
      (snapshot) =>
        onNext(
          snapshot.docs.map((document) => this.eventFromFirestore(document.id, document.data())),
        ),
      onError,
    );
  }

  async startCheckout(clinicId: string, planId: BillingPlanId): Promise<string> {
    const token = await this.firebaseAuth.getIdToken();
    const response = await fetch('/api/billing/checkout', {
      method: 'POST',
      headers: {
        authorization: `Bearer ${token}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ clinicId, planId }),
    });
    const payload = (await response.json().catch(() => ({}))) as {
      checkoutUrl?: string;
      error?: string;
    };
    if (!response.ok || !payload.checkoutUrl) {
      throw new Error(payload.error || 'Não foi possível iniciar o checkout.');
    }
    return payload.checkoutUrl;
  }

  private emptyState(clinicId: string): BillingState {
    return {
      clinicId,
      planId: null,
      planName: 'Sem plano',
      status: 'NONE',
      provider: null,
      checkoutUrl: null,
      updatedAt: '',
    };
  }

  private fromFirestore(clinicId: string, data: Record<string, unknown>): BillingState {
    return {
      clinicId,
      planId: this.planIdField(data['planId']),
      planName: this.stringField(data, 'planName') || 'Plano OdontoGest',
      status: this.statusField(data['status']),
      provider: data['provider'] === 'ASAAS' ? 'ASAAS' : null,
      checkoutUrl: typeof data['checkoutUrl'] === 'string' ? data['checkoutUrl'] : null,
      updatedAt: this.stringField(data, 'updatedAt'),
    };
  }

  private eventFromFirestore(id: string, data: Record<string, unknown>): BillingEvent {
    return {
      id,
      provider: data['provider'] === 'ASAAS' ? 'ASAAS' : null,
      event: typeof data['event'] === 'string' ? data['event'] : null,
      status: this.statusField(data['status']),
      planId: this.planIdField(data['planId']),
      planName: typeof data['planName'] === 'string' ? data['planName'] : null,
      providerPaymentId:
        typeof data['providerPaymentId'] === 'string' ? data['providerPaymentId'] : null,
      providerSubscriptionId:
        typeof data['providerSubscriptionId'] === 'string' ? data['providerSubscriptionId'] : null,
      providerPaymentLinkId:
        typeof data['providerPaymentLinkId'] === 'string' ? data['providerPaymentLinkId'] : null,
      checkoutUrl: typeof data['checkoutUrl'] === 'string' ? data['checkoutUrl'] : null,
      actorUserId: typeof data['actorUserId'] === 'string' ? data['actorUserId'] : null,
      receivedAt: this.stringField(data, 'receivedAt'),
    };
  }

  private planIdField(value: unknown): BillingPlanId | null {
    return value === 'starter' || value === 'pro' || value === 'enterprise' ? value : null;
  }

  private statusField(value: unknown): BillingStatus {
    return value === 'TRIAL' ||
      value === 'CHECKOUT_STARTED' ||
      value === 'PENDING' ||
      value === 'ACTIVE' ||
      value === 'PAST_DUE' ||
      value === 'CANCELED'
      ? value
      : 'NONE';
  }

  private stringField(data: Record<string, unknown>, key: string): string {
    const value = data[key];
    return typeof value === 'string' ? value : '';
  }
}
