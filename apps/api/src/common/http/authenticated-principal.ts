export interface AuthenticatedPrincipal {
  userId: string;
  sessionFamilyId: string;
  sessionVersion: number;
  activeClinicId: string | null;
  roleCode: string | null;
  authorizationVersion: number | null;
  permissions: ReadonlySet<string>;
}
