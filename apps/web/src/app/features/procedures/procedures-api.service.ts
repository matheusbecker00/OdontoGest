import { Injectable, inject } from '@angular/core';
import {
  createMyProcedure,
  inactivateMyProcedure,
  listMyProcedures,
  updateMyProcedure,
} from '@odontogest/dataconnect-client';
import { defer, from, map } from 'rxjs';
import { AuthStore } from '../../core/auth/auth.store';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { SubscriptionAccessService } from '../billing/subscription-access.service';

export type ProcedureStatus = 'ACTIVE' | 'INACTIVE';

export interface Procedure {
  id: string;
  name: string;
  category: string;
  description: string | null;
  defaultPriceCents: number;
  durationMinutes: number;
  status: ProcedureStatus;
}

export type ProcedureInput = Omit<Procedure, 'id' | 'status' | 'description'> & {
  description?: string;
};

@Injectable({ providedIn: 'root' })
export class ProceduresApiService {
  private readonly auth = inject(AuthStore);
  private readonly data = inject(FirebaseDataService);
  private readonly subscription = inject(SubscriptionAccessService);

  list() {
    return from(
      listMyProcedures(this.data.connection, { clinicId: this.activeClinicId(), limit: 500 }),
    ).pipe(
      map((result) =>
        (result.data.clinicMemberships[0]?.clinic.procedures_on_clinic ?? []).map((item) => ({
          ...item,
          description: item.description ?? null,
        })),
      ),
    );
  }

  create(input: ProcedureInput) {
    return defer(() => {
      this.subscription.assertCanMutateOperationalData();
      return createMyProcedure(this.data.connection, {
        ...this.variables(input),
        id: crypto.randomUUID(),
        clinicId: this.activeClinicId(),
        auditId: crypto.randomUUID(),
        requestId: crypto.randomUUID(),
      });
    });
  }

  update(id: string, input: ProcedureInput) {
    return defer(() => {
      this.subscription.assertCanMutateOperationalData();
      return updateMyProcedure(this.data.connection, {
        ...this.variables(input),
        id,
        clinicId: this.activeClinicId(),
        auditId: crypto.randomUUID(),
        requestId: crypto.randomUUID(),
      });
    });
  }

  inactivate(id: string) {
    return defer(() => {
      this.subscription.assertCanMutateOperationalData();
      return inactivateMyProcedure(this.data.connection, {
        id,
        clinicId: this.activeClinicId(),
        auditId: crypto.randomUUID(),
        requestId: crypto.randomUUID(),
      });
    });
  }

  private variables(input: ProcedureInput) {
    return {
      name: input.name.trim(),
      category: input.category.trim(),
      description: input.description?.trim() || null,
      defaultPriceCents: input.defaultPriceCents,
      durationMinutes: input.durationMinutes,
    };
  }

  private activeClinicId(): string {
    const clinicId = this.auth.tenantContext()?.activeClinicId;
    if (!clinicId) throw new Error('Select an active clinic first.');
    return clinicId;
  }
}
