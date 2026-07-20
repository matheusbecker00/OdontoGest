import { computed, Injectable, Injector, signal, inject } from '@angular/core';
import { getOdontoGestFirebaseApp } from '../firebase-app';
import { FirebaseAuthService } from './firebase-auth.service';
import type { AuthenticatedUser, ClinicSummary, TenantContext } from './auth.models';

type RoleCode = NonNullable<TenantContext['roleCode']>;

const ADMIN_PERMISSIONS = [
  'appointment.read',
  'appointment.create',
  'appointment.update',
  'patient.read',
  'patient.create',
  'patient.update',
  'patient.inactivate',
  'dentist.read',
  'dentist.create',
  'dentist.update',
  'dentist.inactivate',
  'procedure.read',
  'procedure.create',
  'procedure.update',
  'procedure.inactivate',
  'finance.read',
  'finance.create',
  'finance.update',
  'inventory.read',
  'inventory.create',
  'inventory.update',
  'report.read',
  'settings.manage',
  'team.manage',
] as const;

const ROLE_PERMISSIONS: Record<RoleCode, readonly string[]> = {
  OWNER: ADMIN_PERMISSIONS,
  ADMIN: ADMIN_PERMISSIONS,
  RECEPTIONIST: [
    'appointment.read',
    'appointment.create',
    'appointment.update',
    'patient.read',
    'patient.create',
    'patient.update',
    'dentist.read',
    'procedure.read',
  ],
  DENTIST: [
    'appointment.read',
    'appointment.update',
    'patient.read',
    'dentist.read',
    'procedure.read',
  ],
  FINANCE: ['finance.read', 'finance.create', 'finance.update', 'report.read'],
};

@Injectable({ providedIn: 'root' })
export class AuthStore {
  private readonly firebase = inject(FirebaseAuthService);
  private readonly injector = inject(Injector);
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
    try {
      const data = await this.getDataService();
      const context = await data.getMyContext();
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
      const roleCode = (membership?.role.code as RoleCode | undefined) ?? null;
      this.tenantContextState.set({
        activeClinicId,
        roleCode,
        authorizationVersion: membership?.authorizationVersion ?? null,
        permissions: this.permissionsForRole(roleCode),
      });
    } catch (error) {
      console.warn('Using provisional auth context.', error);
      if (!(await this.loadFirestoreTeamContext())) {
        await this.loadProvisionalContext();
      }
    }
  }

  private async loadFirestoreTeamContext(): Promise<boolean> {
    const profile = await this.firebase.getCurrentUserProfile();
    if (!profile?.id) return false;

    const { collectionGroup, getDocs, getFirestore, query, where } =
      await import('firebase/firestore');
    const firestore = getFirestore(getOdontoGestFirebaseApp());
    const snapshot = await getDocs(
      query(
        collectionGroup(firestore, 'members'),
        where('userId', '==', profile.id),
        where('status', '==', 'ACTIVE'),
      ),
    );
    if (snapshot.empty) return false;

    const clinics: ClinicSummary[] = snapshot.docs.map((document, index) => {
      const data = document.data();
      return {
        id: this.stringField(data, 'clinicId'),
        name: index === 0 ? 'Clínica ativa' : `Clínica ${index + 1}`,
        role: this.roleField(data['role']),
      };
    });
    const preferredClinicId = this.tenantContextState()?.activeClinicId ?? clinics[0]?.id ?? null;
    const activeClinic =
      clinics.find((candidate) => candidate.id === preferredClinicId) ?? clinics[0];
    const activeClinicId = activeClinic?.id ?? null;
    const roleCode = activeClinic?.role ?? null;
    this.userState.set({
      id: profile.id,
      name: profile.name || profile.email?.split('@')[0] || 'Usuário',
      email: profile.email ?? '',
    });
    this.clinicsState.set(clinics);
    this.tenantContextState.set({
      activeClinicId,
      roleCode,
      authorizationVersion: 1,
      permissions: this.permissionsForRole(roleCode),
    });
    return true;
  }

  private async loadProvisionalContext(): Promise<void> {
    const profile = await this.firebase.getCurrentUserProfile();
    if (!profile?.email) throw new Error('Authenticated user has no usable Firebase profile.');

    const name = profile.name?.trim() || profile.email.split('@')[0] || 'Usuário';
    const clinic: ClinicSummary = {
      id: 'provisional-clinic',
      name: 'Clínica ativa',
      role: 'OWNER',
    };
    this.userState.set({ id: profile.id, name, email: profile.email });
    this.clinicsState.set([clinic]);
    this.tenantContextState.set({
      activeClinicId: clinic.id,
      roleCode: clinic.role,
      authorizationVersion: 1,
      permissions: this.permissionsForRole(clinic.role),
    });
  }

  async login(email: string, password: string): Promise<void> {
    await this.firebase.signIn(email, password);
    await this.loadContext();
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
      const data = await this.getDataService();
      await data.createOwnerClinic({
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
      await this.firebase.signOut().catch(() => undefined);
      this.clear();
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
      permissions: this.permissionsForRole(clinic.role as RoleCode),
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

  private async getDataService() {
    const { FirebaseDataService } = await import('../firebase-data.service');
    return this.injector.get(FirebaseDataService);
  }

  private permissionsForRole(roleCode: RoleCode | null): string[] {
    return roleCode ? [...(ROLE_PERMISSIONS[roleCode] ?? [])] : [];
  }

  private roleField(value: unknown): RoleCode {
    return value === 'OWNER' ||
      value === 'ADMIN' ||
      value === 'RECEPTIONIST' ||
      value === 'DENTIST' ||
      value === 'FINANCE'
      ? value
      : 'RECEPTIONIST';
  }

  private stringField(data: Record<string, unknown>, key: string): string {
    const value = data[key];
    return typeof value === 'string' ? value : '';
  }
}
