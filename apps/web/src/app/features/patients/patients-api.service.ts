import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

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
  private readonly http = inject(HttpClient);
  private readonly root = '/api/v1/patients';

  list(input: {
    page: number;
    pageSize: number;
    search?: string;
    status?: PatientRegistrationStatus;
  }) {
    let params = new HttpParams().set('page', input.page).set('pageSize', input.pageSize);
    if (input.search) params = params.set('search', input.search);
    if (input.status) params = params.set('status', input.status);
    return this.http.get<PatientListResponse>(this.root, { params });
  }

  create(input: PatientInput & { cpf: string }) {
    return this.http.post<Patient>(this.root, input);
  }

  update(id: string, input: PatientInput) {
    return this.http.patch<Patient>(`${this.root}/${id}`, input);
  }

  inactivate(id: string) {
    return this.http.post<Patient>(`${this.root}/${id}/inactivate`, {});
  }
}
