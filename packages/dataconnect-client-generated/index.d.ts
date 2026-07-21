import { ConnectorConfig, DataConnect, QueryRef, QueryPromise, ExecuteQueryOptions, MutationRef, MutationPromise } from 'firebase/data-connect';

export const connectorConfig: ConnectorConfig;

export type TimestampString = string;
export type UUIDString = string;
export type Int64String = string;
export type DateString = string;


export enum UserStatus {
  PENDING_ONBOARDING = "PENDING_ONBOARDING",
  ACTIVE = "ACTIVE",
  LOCKED = "LOCKED",
  DISABLED = "DISABLED",
};



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

export interface CreateMyDentistData {
  dentist_insert: Dentist_Key;
  auditLog_insert: AuditLog_Key;
}

export interface CreateMyDentistVariables {
  id: UUIDString;
  clinicId: UUIDString;
  name: string;
  cro: string;
  croState: string;
  specialty: string;
  phone?: string | null;
  email?: string | null;
  calendarColor: string;
  defaultAppointmentMinutes: number;
  auditId: UUIDString;
  requestId: string;
}

export interface CreateMyPatientData {
  patient_insert: Patient_Key;
  auditLog_insert: AuditLog_Key;
}

export interface CreateMyPatientVariables {
  id: UUIDString;
  clinicId: UUIDString;
  fullName: string;
  cpf: string;
  birthDate?: DateString | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  addressLine?: string | null;
  administrativeNotes?: string | null;
  auditId: UUIDString;
  requestId: string;
}

export interface CreateMyProcedureData {
  procedure_insert: Procedure_Key;
  auditLog_insert: AuditLog_Key;
}

export interface CreateMyProcedureVariables {
  id: UUIDString;
  clinicId: UUIDString;
  name: string;
  category: string;
  description?: string | null;
  defaultPriceCents: number;
  durationMinutes: number;
  auditId: UUIDString;
  requestId: string;
}

export interface CreateOwnerClinicData {
  user_upsert: User_Key;
  role_upsert: Role_Key;
  clinic_insert: Clinic_Key;
  clinicSettings_insert: ClinicSettings_Key;
  clinicMembership_insert: ClinicMembership_Key;
  termsAcceptance_insert: TermsAcceptance_Key;
  privacyAcceptance: TermsAcceptance_Key;
  auditLog_insert: AuditLog_Key;
}

export interface CreateOwnerClinicVariables {
  clinicId: UUIDString;
  settingsId: UUIDString;
  membershipId: UUIDString;
  ownerRoleId: UUIDString;
  termsId: UUIDString;
  privacyId: UUIDString;
  auditId: UUIDString;
  responsibleName: string;
  clinicName: string;
  email: string;
  emailCanonical: string;
  termsEvidenceDigest: string;
  privacyEvidenceDigest: string;
  requestId: string;
}

export interface Dentist_Key {
  id: UUIDString;
  __typename?: 'Dentist_Key';
}

export interface GetMyContextData {
  users: ({
    id: string;
    name: string;
    email: string;
    status: UserStatus;
    authorizationVersion: number;
  } & User_Key)[];
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
    };
  })[];
}

export interface InactivateMyDentistData {
  dentist_updateMany: number;
  auditLog_insert: AuditLog_Key;
}

export interface InactivateMyDentistVariables {
  id: UUIDString;
  clinicId: UUIDString;
  auditId: UUIDString;
  requestId: string;
}

export interface InactivateMyPatientData {
  patient_updateMany: number;
  auditLog_insert: AuditLog_Key;
}

export interface InactivateMyPatientVariables {
  id: UUIDString;
  clinicId: UUIDString;
  auditId: UUIDString;
  requestId: string;
}

export interface InactivateMyProcedureData {
  procedure_updateMany: number;
  auditLog_insert: AuditLog_Key;
}

export interface InactivateMyProcedureVariables {
  id: UUIDString;
  clinicId: UUIDString;
  auditId: UUIDString;
  requestId: string;
}

export interface ListMyDentistsData {
  clinicMemberships: ({
    clinic: {
      dentists_on_clinic: ({
        id: UUIDString;
        name: string;
        cro: string;
        croState: string;
        specialty: string;
        phone?: string | null;
        email?: string | null;
        calendarColor: string;
        defaultAppointmentMinutes: number;
        status: DentistStatus;
        createdAt: TimestampString;
        updatedAt: TimestampString;
      } & Dentist_Key)[];
    };
  })[];
}

export interface ListMyDentistsVariables {
  clinicId: UUIDString;
  limit?: number | null;
}

export interface ListMyPatientsData {
  clinicMemberships: ({
    clinic: {
      patients_on_clinic: ({
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
    };
  })[];
}

export interface ListMyPatientsVariables {
  clinicId: UUIDString;
  limit?: number | null;
}

export interface ListMyProceduresData {
  clinicMemberships: ({
    clinic: {
      procedures_on_clinic: ({
        id: UUIDString;
        name: string;
        category: string;
        description?: string | null;
        defaultPriceCents: number;
        durationMinutes: number;
        status: ProcedureStatus;
        createdAt: TimestampString;
        updatedAt: TimestampString;
      } & Procedure_Key)[];
    };
  })[];
}

export interface ListMyProceduresVariables {
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

export interface UpdateMyDentistData {
  dentist_updateMany: number;
  auditLog_insert: AuditLog_Key;
}

export interface UpdateMyDentistVariables {
  id: UUIDString;
  clinicId: UUIDString;
  name: string;
  cro: string;
  croState: string;
  specialty: string;
  phone?: string | null;
  email?: string | null;
  calendarColor: string;
  defaultAppointmentMinutes: number;
  auditId: UUIDString;
  requestId: string;
}

export interface UpdateMyPatientData {
  patient_updateMany: number;
  auditLog_insert: AuditLog_Key;
}

export interface UpdateMyPatientVariables {
  id: UUIDString;
  clinicId: UUIDString;
  fullName: string;
  birthDate?: DateString | null;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  addressLine?: string | null;
  administrativeNotes?: string | null;
  auditId: UUIDString;
  requestId: string;
}

export interface UpdateMyProcedureData {
  procedure_updateMany: number;
  auditLog_insert: AuditLog_Key;
}

export interface UpdateMyProcedureVariables {
  id: UUIDString;
  clinicId: UUIDString;
  name: string;
  category: string;
  description?: string | null;
  defaultPriceCents: number;
  durationMinutes: number;
  auditId: UUIDString;
  requestId: string;
}

export interface User_Key {
  id: string;
  __typename?: 'User_Key';
}

interface CreateOwnerClinicRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateOwnerClinicVariables): MutationRef<CreateOwnerClinicData, CreateOwnerClinicVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateOwnerClinicVariables): MutationRef<CreateOwnerClinicData, CreateOwnerClinicVariables>;
  operationName: string;
}
export const createOwnerClinicRef: CreateOwnerClinicRef;

export function createOwnerClinic(vars: CreateOwnerClinicVariables): MutationPromise<CreateOwnerClinicData, CreateOwnerClinicVariables>;
export function createOwnerClinic(dc: DataConnect, vars: CreateOwnerClinicVariables): MutationPromise<CreateOwnerClinicData, CreateOwnerClinicVariables>;

interface CreateMyPatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMyPatientVariables): MutationRef<CreateMyPatientData, CreateMyPatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateMyPatientVariables): MutationRef<CreateMyPatientData, CreateMyPatientVariables>;
  operationName: string;
}
export const createMyPatientRef: CreateMyPatientRef;

export function createMyPatient(vars: CreateMyPatientVariables): MutationPromise<CreateMyPatientData, CreateMyPatientVariables>;
export function createMyPatient(dc: DataConnect, vars: CreateMyPatientVariables): MutationPromise<CreateMyPatientData, CreateMyPatientVariables>;

interface UpdateMyPatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMyPatientVariables): MutationRef<UpdateMyPatientData, UpdateMyPatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateMyPatientVariables): MutationRef<UpdateMyPatientData, UpdateMyPatientVariables>;
  operationName: string;
}
export const updateMyPatientRef: UpdateMyPatientRef;

export function updateMyPatient(vars: UpdateMyPatientVariables): MutationPromise<UpdateMyPatientData, UpdateMyPatientVariables>;
export function updateMyPatient(dc: DataConnect, vars: UpdateMyPatientVariables): MutationPromise<UpdateMyPatientData, UpdateMyPatientVariables>;

interface InactivateMyPatientRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: InactivateMyPatientVariables): MutationRef<InactivateMyPatientData, InactivateMyPatientVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: InactivateMyPatientVariables): MutationRef<InactivateMyPatientData, InactivateMyPatientVariables>;
  operationName: string;
}
export const inactivateMyPatientRef: InactivateMyPatientRef;

export function inactivateMyPatient(vars: InactivateMyPatientVariables): MutationPromise<InactivateMyPatientData, InactivateMyPatientVariables>;
export function inactivateMyPatient(dc: DataConnect, vars: InactivateMyPatientVariables): MutationPromise<InactivateMyPatientData, InactivateMyPatientVariables>;

interface CreateMyDentistRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMyDentistVariables): MutationRef<CreateMyDentistData, CreateMyDentistVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateMyDentistVariables): MutationRef<CreateMyDentistData, CreateMyDentistVariables>;
  operationName: string;
}
export const createMyDentistRef: CreateMyDentistRef;

export function createMyDentist(vars: CreateMyDentistVariables): MutationPromise<CreateMyDentistData, CreateMyDentistVariables>;
export function createMyDentist(dc: DataConnect, vars: CreateMyDentistVariables): MutationPromise<CreateMyDentistData, CreateMyDentistVariables>;

interface UpdateMyDentistRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMyDentistVariables): MutationRef<UpdateMyDentistData, UpdateMyDentistVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateMyDentistVariables): MutationRef<UpdateMyDentistData, UpdateMyDentistVariables>;
  operationName: string;
}
export const updateMyDentistRef: UpdateMyDentistRef;

export function updateMyDentist(vars: UpdateMyDentistVariables): MutationPromise<UpdateMyDentistData, UpdateMyDentistVariables>;
export function updateMyDentist(dc: DataConnect, vars: UpdateMyDentistVariables): MutationPromise<UpdateMyDentistData, UpdateMyDentistVariables>;

interface InactivateMyDentistRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: InactivateMyDentistVariables): MutationRef<InactivateMyDentistData, InactivateMyDentistVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: InactivateMyDentistVariables): MutationRef<InactivateMyDentistData, InactivateMyDentistVariables>;
  operationName: string;
}
export const inactivateMyDentistRef: InactivateMyDentistRef;

export function inactivateMyDentist(vars: InactivateMyDentistVariables): MutationPromise<InactivateMyDentistData, InactivateMyDentistVariables>;
export function inactivateMyDentist(dc: DataConnect, vars: InactivateMyDentistVariables): MutationPromise<InactivateMyDentistData, InactivateMyDentistVariables>;

interface CreateMyProcedureRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMyProcedureVariables): MutationRef<CreateMyProcedureData, CreateMyProcedureVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: CreateMyProcedureVariables): MutationRef<CreateMyProcedureData, CreateMyProcedureVariables>;
  operationName: string;
}
export const createMyProcedureRef: CreateMyProcedureRef;

export function createMyProcedure(vars: CreateMyProcedureVariables): MutationPromise<CreateMyProcedureData, CreateMyProcedureVariables>;
export function createMyProcedure(dc: DataConnect, vars: CreateMyProcedureVariables): MutationPromise<CreateMyProcedureData, CreateMyProcedureVariables>;

interface UpdateMyProcedureRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMyProcedureVariables): MutationRef<UpdateMyProcedureData, UpdateMyProcedureVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: UpdateMyProcedureVariables): MutationRef<UpdateMyProcedureData, UpdateMyProcedureVariables>;
  operationName: string;
}
export const updateMyProcedureRef: UpdateMyProcedureRef;

export function updateMyProcedure(vars: UpdateMyProcedureVariables): MutationPromise<UpdateMyProcedureData, UpdateMyProcedureVariables>;
export function updateMyProcedure(dc: DataConnect, vars: UpdateMyProcedureVariables): MutationPromise<UpdateMyProcedureData, UpdateMyProcedureVariables>;

interface InactivateMyProcedureRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: InactivateMyProcedureVariables): MutationRef<InactivateMyProcedureData, InactivateMyProcedureVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: InactivateMyProcedureVariables): MutationRef<InactivateMyProcedureData, InactivateMyProcedureVariables>;
  operationName: string;
}
export const inactivateMyProcedureRef: InactivateMyProcedureRef;

export function inactivateMyProcedure(vars: InactivateMyProcedureVariables): MutationPromise<InactivateMyProcedureData, InactivateMyProcedureVariables>;
export function inactivateMyProcedure(dc: DataConnect, vars: InactivateMyProcedureVariables): MutationPromise<InactivateMyProcedureData, InactivateMyProcedureVariables>;

interface GetMyContextRef {
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyContextData, undefined>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect): QueryRef<GetMyContextData, undefined>;
  operationName: string;
}
export const getMyContextRef: GetMyContextRef;

export function getMyContext(options?: ExecuteQueryOptions): QueryPromise<GetMyContextData, undefined>;
export function getMyContext(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyContextData, undefined>;

interface ListMyPatientsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListMyPatientsVariables): QueryRef<ListMyPatientsData, ListMyPatientsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListMyPatientsVariables): QueryRef<ListMyPatientsData, ListMyPatientsVariables>;
  operationName: string;
}
export const listMyPatientsRef: ListMyPatientsRef;

export function listMyPatients(vars: ListMyPatientsVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyPatientsData, ListMyPatientsVariables>;
export function listMyPatients(dc: DataConnect, vars: ListMyPatientsVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyPatientsData, ListMyPatientsVariables>;

interface ListMyDentistsRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListMyDentistsVariables): QueryRef<ListMyDentistsData, ListMyDentistsVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListMyDentistsVariables): QueryRef<ListMyDentistsData, ListMyDentistsVariables>;
  operationName: string;
}
export const listMyDentistsRef: ListMyDentistsRef;

export function listMyDentists(vars: ListMyDentistsVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyDentistsData, ListMyDentistsVariables>;
export function listMyDentists(dc: DataConnect, vars: ListMyDentistsVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyDentistsData, ListMyDentistsVariables>;

interface ListMyProceduresRef {
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListMyProceduresVariables): QueryRef<ListMyProceduresData, ListMyProceduresVariables>;
  /* Allow users to pass in custom DataConnect instances */
  (dc: DataConnect, vars: ListMyProceduresVariables): QueryRef<ListMyProceduresData, ListMyProceduresVariables>;
  operationName: string;
}
export const listMyProceduresRef: ListMyProceduresRef;

export function listMyProcedures(vars: ListMyProceduresVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyProceduresData, ListMyProceduresVariables>;
export function listMyProcedures(dc: DataConnect, vars: ListMyProceduresVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyProceduresData, ListMyProceduresVariables>;

