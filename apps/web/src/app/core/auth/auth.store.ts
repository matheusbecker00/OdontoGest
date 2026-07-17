import { computed, Injectable, signal, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from './auth-api.service';
import { FirebaseAuthService } from './firebase-auth.service';
import type { AuthenticatedUser, ClinicSummary, TenantContext } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly api = inject(AuthApiService);
  private readonly firebase = inject(FirebaseAuthService);
  private readonly accessTokenState = signal<string | null>(null);
  private readonly userState = signal<AuthenticatedUser | null>(null);
  private readonly clinicsState = signal<readonly ClinicSummary[]>([]);
  private readonly tenantContextState = signal<TenantContext | null>(null);
  private refreshInFlight: Promise<string> | null = null;

  readonly user = this.userState.asReadonly();
  readonly clinics = this.clinicsState.asReadonly();
  readonly tenantContext = this.tenantContextState.asReadonly();
  readonly isAuthenticated = computed(() => this.accessTokenState() !== null);
  readonly permissions = computed(() => new Set(this.tenantContextState()?.permissions ?? []));

  accessToken(): string | null {
    return this.accessTokenState();
  }

  hasEveryPermission(required: readonly string[]): boolean {
    const available = this.permissions();
    return required.every((permission) => available.has(permission));
  }

  private async loadTenantContext(): Promise<void> {
    this.tenantContextState.set(await firstValueFrom(this.api.context()));
  }

  async login(email: string, password: string): Promise<void> {
    const idToken = await this.firebase.signIn(email, password);
    try {
      const response = await firstValueFrom(this.api.exchangeFirebaseToken(idToken));
      this.accessTokenState.set(response.accessToken);
      this.userState.set(response.user);
      this.clinicsState.set(response.clinics);
      if (response.activeClinicId) await this.loadTenantContext();
    } catch (error) {
      await this.firebase.signOut().catch(() => undefined);
      throw error;
    }
  }

  refreshAccessToken(): Promise<string> {
    if (this.refreshInFlight) return this.refreshInFlight;
    this.refreshInFlight = firstValueFrom(this.api.refresh())
      .then(async (response) => {
        this.accessTokenState.set(response.accessToken);
        if (response.activeClinicId) await this.loadTenantContext();
        return response.accessToken;
      })
      .catch((error: unknown) => {
        this.clear();
        throw error;
      })
      .finally(() => {
        this.refreshInFlight = null;
      });
    return this.refreshInFlight;
  }

  async restoreSession(): Promise<boolean> {
    if (this.isAuthenticated()) return true;
    try {
      await this.refreshAccessToken();
      return true;
    } catch {
      return false;
    }
  }

  async selectClinic(clinicId: string): Promise<void> {
    const response = await firstValueFrom(this.api.selectClinic(clinicId));
    this.accessTokenState.set(response.accessToken);
    await this.loadTenantContext();
  }

  async logout(): Promise<void> {
    try {
      await firstValueFrom(this.api.logout());
    } finally {
      await this.firebase.signOut().catch(() => undefined);
      this.clear();
    }
  }

  clear(): void {
    this.accessTokenState.set(null);
    this.userState.set(null);
    this.clinicsState.set([]);
    this.tenantContextState.set(null);
  }
}
