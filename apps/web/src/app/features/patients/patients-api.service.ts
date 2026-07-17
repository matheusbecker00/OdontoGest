import { Injectable, inject } from '@angular/core';
import {
  createMyPatient,
  inactivateMyPatient,
  listMyPatients,
  updateMyPatient,
} from '@odontogest/dataconnect-client';
import { from, map } from 'rxjs';
import { AuthStore } from '../../core/auth/auth.store';
import { FirebaseDataService } from '../../core/firebase-data.service';

export type PatientRegistrationStatus = 'ACTIVE' | 'INACTIVE';

export interface Patient {
  id: string;
  fullName: string;
  cpfMasked: string;
  birthDate: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  addressLine: string | null;
  administrativeNotes: string | null;
  registrationStatus: PatientRegistrationStatus;
  financialStatus: 'UP_TO_DATE';
  createdAt: string;
  updatedAt: string;
}

export interface PatientInput {
  fullName: string;
  cpf?: string;
  birthDate?: string;
  phone?: string;
  whatsapp?: string;
  email?: string;
  addressLine?: string;
  administrativeNotes?: string;
}

export interface PatientListResponse {
  items: Patient[];
  pagination: {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
  };
}

@Injectable({ providedIn: 'root' })
export class PatientsApiService {
  private readonly auth = inject(AuthStore);
  private readonly data = inject(FirebaseDataService);

  list(input: {
    page: number;
    pageSize: number;
    search?: string;
    status?: PatientRegistrationStatus;
  }) {
    const clinicId = this.activeClinicId();
    return from(listMyPatients(this.data.connection, { clinicId, limit: 500 })).pipe(
      map((result) => {
        const rows = result.data.clinicMemberships[0]?.clinic.patients_on_clinic ?? [];
        const search = input.search?.trim().toLocaleLowerCase('pt-BR');
        const filtered = rows
          .map((patient) => this.toPatient(patient))
          .filter(
            (patient) =>
              (!input.status || patient.registrationStatus === input.status) &&
              (!search ||
                patient.fullName.toLocaleLowerCase('pt-BR').includes(search) ||
                patient.cpfMasked.includes(search)),
          );
        const total = filtered.length;
        const totalPages = total === 0 ? 0 : Math.ceil(total / input.pageSize);
        const page = Math.max(1, Math.min(input.page, totalPages || 1));
        const start = (page - 1) * input.pageSize;
        return {
          items: filtered.slice(start, start + input.pageSize),
          pagination: { page, pageSize: input.pageSize, total, totalPages },
        } satisfies PatientListResponse;
      }),
    );
  }

  create(input: PatientInput & { cpf: string }) {
    const cpf = input.cpf.replace(/\D/g, '');
    return from(
      createMyPatient(this.data.connection, {
        id: crypto.randomUUID(),
        clinicId: this.activeClinicId(),
        fullName: input.fullName.trim(),
        cpf,
        birthDate: input.birthDate || null,
        phone: input.phone || null,
        whatsapp: input.whatsapp || null,
        email: input.email || null,
        addressLine: input.addressLine || null,
        administrativeNotes: input.administrativeNotes || null,
        auditId: crypto.randomUUID(),
        requestId: crypto.randomUUID(),
      }),
    );
  }

  update(id: string, input: PatientInput) {
    return from(
      updateMyPatient(this.data.connection, {
        id,
        clinicId: this.activeClinicId(),
        fullName: input.fullName.trim(),
        birthDate: input.birthDate || null,
        phone: input.phone || null,
        whatsapp: input.whatsapp || null,
        email: input.email || null,
        addressLine: input.addressLine || null,
        administrativeNotes: input.administrativeNotes || null,
        auditId: crypto.randomUUID(),
        requestId: crypto.randomUUID(),
      }),
    );
  }

  inactivate(id: string) {
    return from(
      inactivateMyPatient(this.data.connection, {
        id,
        clinicId: this.activeClinicId(),
        auditId: crypto.randomUUID(),
        requestId: crypto.randomUUID(),
      }),
    );
  }

  private activeClinicId(): string {
    const clinicId = this.auth.tenantContext()?.activeClinicId;
    if (!clinicId) throw new Error('Select an active clinic first.');
    return clinicId;
  }

  private toPatient(patient: {
    id: string;
    fullName: string;
    cpf: string;
    birthDate?: string | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    addressLine?: string | null;
    administrativeNotes?: string | null;
    registrationStatus: PatientRegistrationStatus;
    createdAt: string;
    updatedAt: string;
  }): Patient {
    const digits = patient.cpf.replace(/\D/g, '');
    return {
      ...patient,
      cpfMasked: `***.***.***-${digits.slice(-2).padStart(2, '*')}`,
      birthDate: patient.birthDate ?? null,
      phone: patient.phone ?? null,
      whatsapp: patient.whatsapp ?? null,
      email: patient.email ?? null,
      addressLine: patient.addressLine ?? null,
      administrativeNotes: patient.administrativeNotes ?? null,
      financialStatus: 'UP_TO_DATE',
    };
  }
}
