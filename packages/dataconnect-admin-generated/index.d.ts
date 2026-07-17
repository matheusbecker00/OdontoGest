import { ConnectorConfig, DataConnect, OperationOptions, ExecuteOperationResponse } from 'firebase-admin/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;

export enum AuditOutcome {
  SUCCESS = "SUCCESS",
  DENIED = "DENIED",
  FAILURE = "FAILURE",
}
export enum UserStatus {
  PENDING_ONBOARDING = "PENDING_ONBOARDING",
  ACTIVE = "ACTIVE",
  LOCKED = "LOCKED",
  DISABLED = "DISABLED",
}

export interface AuditLog_Key {
  id: UUIDString;
  __typename?: 'AuditLog_Key';
}

export interface ClinicMembership_Key {
  id: UUIDString;
  __typename?: 'ClinicMembership_Key';
}

export interface ClinicSettings_Key {
  id: UUIDString;
  __typename?: 'ClinicSettings_Key';
}

export interface Clinic_Key {
  id: UUIDString;
  __typename?: 'Clinic_Key';
}

export interface GetPrincipalData {
  user?: {
    id: string;
    name: string;
    email: string;
    status: UserStatus;
    authorizationVersion: number;
  } & User_Key;
  clinicMemberships: ({
    authorizationVersion: number;
    clinic: {
      id: UUIDString;
      tradeName: string;
      status: ClinicStatus;
      timezone: string;
      locale: string;
      currency: string;
    } & Clinic_Key;
    role: {
      code: RoleCode;
      name: string;
      rolePermissions_on_role: ({
        permission: {
          code: string;
        };
      })[];
    };
  })[];
}

export interface GetPrincipalVariables {
  uid: string;
}

export interface HealthCheckData {
  users: ({
    id: string;
  } & User_Key)[];
}

export interface InsertSecurityEventData {
  securityEvent_insert: SecurityEvent_Key;
}

export interface InsertSecurityEventVariables {
  userId?: string | null;
  action: string;
  outcome: AuditOutcome;
  requestId: string;
  ipPrefix?: string | null;
  userAgentSummary?: string | null;
  metadataRedacted?: unknown | null;
}

export interface InsertTenantAuditEventData {
  auditLog_insert: AuditLog_Key;
}

export interface InsertTenantAuditEventVariables {
  clinicId: UUIDString;
  actorUserId?: string | null;
  action: string;
  entityType: string;
  entityId?: UUIDString | null;
  outcome: AuditOutcome;
  requestId: string;
  ipPrefix?: string | null;
  userAgentSummary?: string | null;
  metadataRedacted?: unknown | null;
}

export interface ListTenantAuditEventsData {
  auditLogs: ({
    id: UUIDString;
    actorUserId?: string | null;
    action: string;
    entityType: string;
    entityId?: UUIDString | null;
    outcome: AuditOutcome;
    requestId: string;
    occurredAt: TimestampString;
    metadataRedacted?: unknown | null;
  } & AuditLog_Key)[];
}

export interface ListTenantAuditEventsVariables {
  clinicId: UUIDString;
  limit?: number | null;
}

export interface OutboxEvent_Key {
  id: UUIDString;
  __typename?: 'OutboxEvent_Key';
}

export interface Permission_Key {
  id: UUIDString;
  __typename?: 'Permission_Key';
}

export interface RolePermission_Key {
  roleId: UUIDString;
  permissionId: UUIDString;
  __typename?: 'RolePermission_Key';
}

export interface Role_Key {
  id: UUIDString;
  __typename?: 'Role_Key';
}

export interface SecurityEvent_Key {
  id: UUIDString;
  __typename?: 'SecurityEvent_Key';
}

export interface TermsAcceptance_Key {
  id: UUIDString;
  __typename?: 'TermsAcceptance_Key';
}

export interface UpsertFirebaseUserData {
  user_upsert: User_Key;
}

export interface UpsertFirebaseUserVariables {
  uid: string;
  name: string;
  email: string;
  emailCanonical: string;
  emailVerifiedAt?: TimestampString | null;
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

/** Generated Node Admin SDK operation action function for the 'UpsertFirebaseUser' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertFirebaseUser(dc: DataConnect, vars: UpsertFirebaseUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertFirebaseUserData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertFirebaseUser' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertFirebaseUser(vars: UpsertFirebaseUserVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertFirebaseUserData>>;

/** Generated Node Admin SDK operation action function for the 'InsertSecurityEvent' Mutation. Allow users to execute without passing in DataConnect. */
export function insertSecurityEvent(dc: DataConnect, vars: InsertSecurityEventVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertSecurityEventData>>;
/** Generated Node Admin SDK operation action function for the 'InsertSecurityEvent' Mutation. Allow users to pass in custom DataConnect instances. */
export function insertSecurityEvent(vars: InsertSecurityEventVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertSecurityEventData>>;

/** Generated Node Admin SDK operation action function for the 'InsertTenantAuditEvent' Mutation. Allow users to execute without passing in DataConnect. */
export function insertTenantAuditEvent(dc: DataConnect, vars: InsertTenantAuditEventVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertTenantAuditEventData>>;
/** Generated Node Admin SDK operation action function for the 'InsertTenantAuditEvent' Mutation. Allow users to pass in custom DataConnect instances. */
export function insertTenantAuditEvent(vars: InsertTenantAuditEventVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InsertTenantAuditEventData>>;

/** Generated Node Admin SDK operation action function for the 'HealthCheck' Query. Allow users to execute without passing in DataConnect. */
export function healthCheck(dc: DataConnect, options?: OperationOptions): Promise<ExecuteOperationResponse<HealthCheckData>>;
/** Generated Node Admin SDK operation action function for the 'HealthCheck' Query. Allow users to pass in custom DataConnect instances. */
export function healthCheck(options?: OperationOptions): Promise<ExecuteOperationResponse<HealthCheckData>>;

/** Generated Node Admin SDK operation action function for the 'GetPrincipal' Query. Allow users to execute without passing in DataConnect. */
export function getPrincipal(dc: DataConnect, vars: GetPrincipalVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetPrincipalData>>;
/** Generated Node Admin SDK operation action function for the 'GetPrincipal' Query. Allow users to pass in custom DataConnect instances. */
export function getPrincipal(vars: GetPrincipalVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetPrincipalData>>;

/** Generated Node Admin SDK operation action function for the 'ListTenantAuditEvents' Query. Allow users to execute without passing in DataConnect. */
export function listTenantAuditEvents(dc: DataConnect, vars: ListTenantAuditEventsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTenantAuditEventsData>>;
/** Generated Node Admin SDK operation action function for the 'ListTenantAuditEvents' Query. Allow users to pass in custom DataConnect instances. */
export function listTenantAuditEvents(vars: ListTenantAuditEventsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListTenantAuditEventsData>>;

