import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import type { LoginResponse, RefreshResponse, TenantContext } from './auth.models';

const API_ROOT = '/api/v1';

@Injectable({ providedIn: 'root' })
export class AuthApiService {
  private readonly http = inject(HttpClient);

  login(input: { email: string; password: string }) {
    return this.http.post<LoginResponse>(`${API_ROOT}/auth/login`, input, {
      withCredentials: true,
    });
  }

  refresh() {
    return this.http.post<RefreshResponse>(
      `${API_ROOT}/auth/refresh`,
      {},
      { withCredentials: true },
    );
  }

  logout() {
    return this.http.post<void>(`${API_ROOT}/auth/logout`, {}, { withCredentials: true });
  }

  logoutAll() {
    return this.http.post<void>(`${API_ROOT}/auth/logout-all`, {}, { withCredentials: true });
  }

  selectClinic(clinicId: string) {
    return this.http.post<{ accessToken: string; activeClinicId: string }>(
      `${API_ROOT}/auth/active-clinic`,
      { clinicId },
      { withCredentials: true },
    );
  }

  context() {
    return this.http.get<TenantContext>(`${API_ROOT}/tenancy/context`, {
      withCredentials: true,
    });
  }

  forgotPassword(email: string) {
    return this.http.post<{ message: string }>(
      `${API_ROOT}/auth/password/forgot`,
      { email },
      { withCredentials: true },
    );
  }

  verifyEmail(token: string) {
    return this.http.post<void>(
      `${API_ROOT}/auth/email/verify`,
      { token },
      { withCredentials: true },
    );
  }

  resetPassword(token: string, password: string) {
    return this.http.post<void>(
      `${API_ROOT}/auth/password/reset`,
      { token, password },
      { withCredentials: true },
    );
  }
}
