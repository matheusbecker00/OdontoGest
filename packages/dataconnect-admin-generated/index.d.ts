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
export enum PatientRegistrationStatus {
  ACTIVE = "ACTIVE",
  INACTIVE = "INACTIVE",
}
export enum SubscriptionStatus {
  NONE = "NONE",
  CHECKOUT_STARTED = "CHECKOUT_STARTED",
  PENDING = "PENDING",
  ACTIVE = "ACTIVE",
  TRIAL = "TRIAL",
  PAST_DUE = "PAST_DUE",
  CANCELED = "CANCELED",
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

export interface ClinicSubscription_Key {
  clinicId: UUIDString;
  __typename?: 'ClinicSubscription_Key';
}

export interface Clinic_Key {
  id: UUIDString;
  __typename?: 'Clinic_Key';
}

export interface CreatePatientData {
  patient_insert: Patient_Key;
  auditLog_insert: AuditLog_Key;
}

export interface CreatePatientVariables {
  id: UUIDString;
  clinicId: UUIDString;
  actorUserId: string;
  fullName: string;
  cpf: string;
  birthDate?: DateString | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  addressLine?: string | null;
  administrativeNotes?: string | null;
  requestId: string;
  ipPrefix?: string | null;
  userAgentSummary?: string | null;
}

export interface Dentist_Key {
  id: UUIDString;
  __typename?: 'Dentist_Key';
}

export interface GetPatientData {
  patients: ({
    id: UUIDString;
    fullName: string;
    cpf: string;
    birthDate?: DateString | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    addressLine?: string | null;
    administrativeNotes?: string | null;
    registrationStatus: PatientRegistrationStatus;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & Patient_Key)[];
}

export interface GetPatientVariables {
  clinicId: UUIDString;
  id: UUIDString;
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

export interface InactivatePatientData {
  patient_updateMany: number;
  auditLog_insert: AuditLog_Key;
}

export interface InactivatePatientVariables {
  id: UUIDString;
  clinicId: UUIDString;
  actorUserId: string;
  requestId: string;
  ipPrefix?: string | null;
  userAgentSummary?: string | null;
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

export interface ListPatientsData {
  patients: ({
    id: UUIDString;
    fullName: string;
    cpf: string;
    birthDate?: DateString | null;
    phone?: string | null;
    whatsapp?: string | null;
    email?: string | null;
    addressLine?: string | null;
    administrativeNotes?: string | null;
    registrationStatus: PatientRegistrationStatus;
    createdAt: TimestampString;
    updatedAt: TimestampString;
  } & Patient_Key)[];
}

export interface ListPatientsVariables {
  clinicId: UUIDString;
  limit?: number | null;
  offset?: number | null;
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

export interface Patient_Key {
  id: UUIDString;
  __typename?: 'Patient_Key';
}

export interface Permission_Key {
  id: UUIDString;
  __typename?: 'Permission_Key';
}

export interface Procedure_Key {
  id: UUIDString;
  __typename?: 'Procedure_Key';
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

export interface UpdatePatientData {
  patient_updateMany: number;
  auditLog_insert: AuditLog_Key;
}

export interface UpdatePatientVariables {
  id: UUIDString;
  clinicId: UUIDString;
  actorUserId: string;
  fullName: string;
  cpf: string;
  birthDate?: DateString | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  addressLine?: string | null;
  administrativeNotes?: string | null;
  requestId: string;
  ipPrefix?: string | null;
  userAgentSummary?: string | null;
}

export interface UpsertClinicSubscriptionData {
  clinicSubscription_upsert: ClinicSubscription_Key;
}

export interface UpsertClinicSubscriptionVariables {
  clinicId: UUIDString;
  status: SubscriptionStatus;
  planId?: string | null;
  planName?: string | null;
  provider?: string | null;
  providerSubscriptionId?: string | null;
  checkoutUrl?: string | null;
  currentPeriodEnd?: TimestampString | null;
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

/** Generated Node Admin SDK operation action function for the 'UpsertClinicSubscription' Mutation. Allow users to execute without passing in DataConnect. */
export function upsertClinicSubscription(dc: DataConnect, vars: UpsertClinicSubscriptionVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertClinicSubscriptionData>>;
/** Generated Node Admin SDK operation action function for the 'UpsertClinicSubscription' Mutation. Allow users to pass in custom DataConnect instances. */
export function upsertClinicSubscription(vars: UpsertClinicSubscriptionVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpsertClinicSubscriptionData>>;

/** Generated Node Admin SDK operation action function for the 'CreatePatient' Mutation. Allow users to execute without passing in DataConnect. */
export function createPatient(dc: DataConnect, vars: CreatePatientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePatientData>>;
/** Generated Node Admin SDK operation action function for the 'CreatePatient' Mutation. Allow users to pass in custom DataConnect instances. */
export function createPatient(vars: CreatePatientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<CreatePatientData>>;

/** Generated Node Admin SDK operation action function for the 'UpdatePatient' Mutation. Allow users to execute without passing in DataConnect. */
export function updatePatient(dc: DataConnect, vars: UpdatePatientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePatientData>>;
/** Generated Node Admin SDK operation action function for the 'UpdatePatient' Mutation. Allow users to pass in custom DataConnect instances. */
export function updatePatient(vars: UpdatePatientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<UpdatePatientData>>;

/** Generated Node Admin SDK operation action function for the 'InactivatePatient' Mutation. Allow users to execute without passing in DataConnect. */
export function inactivatePatient(dc: DataConnect, vars: InactivatePatientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InactivatePatientData>>;
/** Generated Node Admin SDK operation action function for the 'InactivatePatient' Mutation. Allow users to pass in custom DataConnect instances. */
export function inactivatePatient(vars: InactivatePatientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<InactivatePatientData>>;

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

/** Generated Node Admin SDK operation action function for the 'ListPatients' Query. Allow users to execute without passing in DataConnect. */
export function listPatients(dc: DataConnect, vars: ListPatientsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPatientsData>>;
/** Generated Node Admin SDK operation action function for the 'ListPatients' Query. Allow users to pass in custom DataConnect instances. */
export function listPatients(vars: ListPatientsVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<ListPatientsData>>;

/** Generated Node Admin SDK operation action function for the 'GetPatient' Query. Allow users to execute without passing in DataConnect. */
export function getPatient(dc: DataConnect, vars: GetPatientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetPatientData>>;
/** Generated Node Admin SDK operation action function for the 'GetPatient' Query. Allow users to pass in custom DataConnect instances. */
export function getPatient(vars: GetPatientVariables, options?: OperationOptions): Promise<ExecuteOperationResponse<GetPatientData>>;

