import { computed, Injectable, signal, inject } from '@angular/core';
import { FirebaseDataService } from '../firebase-data.service';
import { FirebaseAuthService } from './firebase-auth.service';
import type { AuthenticatedUser, ClinicSummary, TenantContext } from './auth.models';

const OWNER_PERMISSIONS = [
  'patient.read',
  'patient.create',
  'patient.update',
  'patient.inactivate',
] as const;

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly firebase = inject(FirebaseAuthService);
  private readonly data = inject(FirebaseDataService);
  private readonly userState = signal<AuthenticatedUser | null>(null);
  private readonly clinicsState = signal<readonly ClinicSummary[]>([]);
  private readonly tenantContextState = signal<TenantContext | null>(null);

  readonly user = this.userState.asReadonly();
  readonly clinics = this.clinicsState.asReadonly();
  readonly tenantContext = this.tenantContextState.asReadonly();
  readonly isAuthenticated = computed(() => this.userState() !== null);
  readonly permissions = computed(() => new Set(this.tenantContextState()?.permissions ?? []));

  hasEveryPermission(required: readonly string[]): boolean {
    const available = this.permissions();
    return required.every((permission) => available.has(permission));
  }

  private async loadContext(): Promise<void> {
    const context = await this.data.getMyContext();
    const user = context.users[0];
    if (!user) throw new Error('Authenticated user has no OdontoGest profile.');

    const clinics: ClinicSummary[] = context.clinicMemberships.map((membership) => ({
      id: membership.clinic.id,
      name: membership.clinic.tradeName,
      role: membership.role.code as ClinicSummary['role'],
    }));
    this.userState.set({ id: user.id, name: user.name, email: user.email });
    this.clinicsState.set(clinics);

    const activeClinicId = this.tenantContextState()?.activeClinicId ?? clinics[0]?.id ?? null;
    const membership = context.clinicMemberships.find(
      (candidate) => candidate.clinic.id === activeClinicId,
    );
    this.tenantContextState.set({
      activeClinicId,
      roleCode: (membership?.role.code as TenantContext['roleCode']) ?? null,
      authorizationVersion: membership?.authorizationVersion ?? null,
      permissions: membership?.role.code === 'OWNER' ? [...OWNER_PERMISSIONS] : [],
    });
  }

  async login(email: string, password: string): Promise<void> {
    await this.firebase.signIn(email, password);
    try {
      await this.loadContext();
    } catch (error) {
      await this.firebase.signOut().catch(() => undefined);
      throw error;
    }
  }

  async register(input: {
    responsibleName: string;
    clinicName: string;
    email: string;
    password: string;
  }): Promise<void> {
    const normalized = { ...input, email: input.email.trim().toLowerCase() };
    await this.firebase.createAccount(
      normalized.email,
      normalized.password,
      normalized.responsibleName,
    );
    try {
      await this.data.createOwnerClinic({
        responsibleName: normalized.responsibleName,
        clinicName: normalized.clinicName,
        email: normalized.email,
      });
      await this.loadContext();
    } catch (error) {
      await this.firebase.signOut().catch(() => undefined);
      throw error;
    }
  }

  async restoreSession(): Promise<boolean> {
    if (this.isAuthenticated()) return true;
    try {
      if (!(await this.firebase.waitUntilReady())) return false;
      await this.loadContext();
      return true;
    } catch {
      return false;
    }
  }

  async selectClinic(clinicId: string): Promise<void> {
    const clinic = this.clinicsState().find((candidate) => candidate.id === clinicId);
    if (!clinic) throw new Error('Clinic is not available to this user.');
    this.tenantContextState.set({
      activeClinicId: clinic.id,
      roleCode: clinic.role,
      authorizationVersion: 1,
      permissions: clinic.role === 'OWNER' ? [...OWNER_PERMISSIONS] : [],
    });
  }

  async logout(): Promise<void> {
    await this.firebase.signOut().catch(() => undefined);
    this.clear();
  }

  clear(): void {
    this.userState.set(null);
    this.clinicsState.set([]);
    this.tenantContextState.set(null);
  }
}
