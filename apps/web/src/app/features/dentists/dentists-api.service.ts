import { Injectable, inject } from '@angular/core';
import {
  createMyDentist,
  inactivateMyDentist,
  listMyDentists,
  updateMyDentist,
} from '@odontogest/dataconnect-client';
import { defer, from, map } from 'rxjs';
import { AuthStore } from '../../core/auth/auth.store';
import { FirebaseDataService } from '../../core/firebase-data.service';
import { SubscriptionAccessService } from '../billing/subscription-access.service';

export type DentistStatus = 'ACTIVE' | 'INACTIVE';

export interface Dentist {
  id: string;
  name: string;
  cro: string;
  croState: string;
  specialty: string;
  phone: string | null;
  email: string | null;
  calendarColor: string;
  defaultAppointmentMinutes: number;
  status: DentistStatus;
}

export type DentistInput = Omit<Dentist, 'id' | 'status' | 'phone' | 'email'> & {
  phone?: string;
  email?: string;
};

@Injectable({ providedIn: 'root' })
export class DentistsApiService {
  private readonly auth = inject(AuthStore);
  private readonly data = inject(FirebaseDataService);
  private readonly subscription = inject(SubscriptionAccessService);

  list() {
    return from(
      listMyDentists(this.data.connection, { clinicId: this.activeClinicId(), limit: 500 }),
    ).pipe(
      map((result) =>
        (result.data.clinicMemberships[0]?.clinic.dentists_on_clinic ?? []).map((item) => ({
          ...item,
          phone: item.phone ?? null,
          email: item.email ?? null,
        })),
      ),
    );
  }

  create(input: DentistInput) {
    return defer(() => {
      this.subscription.assertCanMutateOperationalData();
      return createMyDentist(this.data.connection, {
        ...this.variables(input),
        id: crypto.randomUUID(),
        clinicId: this.activeClinicId(),
        auditId: crypto.randomUUID(),
        requestId: crypto.randomUUID(),
      });
    });
  }

  update(id: string, input: DentistInput) {
    return defer(() => {
      this.subscription.assertCanMutateOperationalData();
      return updateMyDentist(this.data.connection, {
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
      return inactivateMyDentist(this.data.connection, {
        id,
        clinicId: this.activeClinicId(),
        auditId: crypto.randomUUID(),
        requestId: crypto.randomUUID(),
      });
    });
  }

  private variables(input: DentistInput) {
    return {
      name: input.name.trim(),
      cro: input.cro.replace(/\s/g, '').toUpperCase(),
      croState: input.croState.toUpperCase(),
      specialty: input.specialty.trim(),
      phone: input.phone?.trim() || null,
      email: input.email?.trim().toLowerCase() || null,
      calendarColor: input.calendarColor.toUpperCase(),
      defaultAppointmentMinutes: input.defaultAppointmentMinutes,
    };
  }

  private activeClinicId(): string {
    const clinicId = this.auth.tenantContext()?.activeClinicId;
    if (!clinicId) throw new Error('Select an active clinic first.');
    return clinicId;
  }
}
