# Generated TypeScript README
This README will guide you through the process of using the generated JavaScript SDK package for the connector `client`. It will also provide examples on how to use your generated SDK to call your Data Connect queries and mutations.

***NOTE:** This README is generated alongside the generated SDK. If you make changes to this file, they will be overwritten when the SDK is regenerated.*

# Table of Contents
- [**Overview**](#generated-javascript-readme)
- [**Accessing the connector**](#accessing-the-connector)
  - [*Connecting to the local Emulator*](#connecting-to-the-local-emulator)
- [**Queries**](#queries)
  - [*GetMyContext*](#getmycontext)
  - [*ListMyPatients*](#listmypatients)
- [**Mutations**](#mutations)
  - [*CreateOwnerClinic*](#createownerclinic)
  - [*CreateMyPatient*](#createmypatient)
  - [*UpdateMyPatient*](#updatemypatient)
  - [*InactivateMyPatient*](#inactivatemypatient)

# Accessing the connector
A connector is a collection of Queries and Mutations. One SDK is generated for each connector - this SDK is generated for the connector `client`. You can find more information about connectors in the [Data Connect documentation](https://firebase.google.com/docs/data-connect#how-does).

You can use this generated SDK by importing from the package `@odontogest/dataconnect-client` as shown below. Both CommonJS and ESM imports are supported.

You can also follow the instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#set-client).

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@odontogest/dataconnect-client';

const dataConnect = getDataConnect(connectorConfig);
```

## Connecting to the local Emulator
By default, the connector will connect to the production service.

To connect to the emulator, you can use the following code.
You can also follow the emulator instructions from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#instrument-clients).

```typescript
import { connectDataConnectEmulator, getDataConnect } from 'firebase/data-connect';
import { connectorConfig } from '@odontogest/dataconnect-client';

const dataConnect = getDataConnect(connectorConfig);
connectDataConnectEmulator(dataConnect, 'localhost', 9399);
```

After it's initialized, you can call your Data Connect [queries](#queries) and [mutations](#mutations) from your generated SDK.

# Queries

There are two ways to execute a Data Connect Query using the generated Web SDK:
- Using a Query Reference function, which returns a `QueryRef`
  - The `QueryRef` can be used as an argument to `executeQuery()`, which will execute the Query and return a `QueryPromise`
- Using an action shortcut function, which returns a `QueryPromise`
  - Calling the action shortcut function will execute the Query and return a `QueryPromise`

The following is true for both the action shortcut function and the `QueryRef` function:
- The `QueryPromise` returned will resolve to the result of the Query once it has finished executing
- If the Query accepts arguments, both the action shortcut function and the `QueryRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Query
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `client` connector's generated functions to execute each query. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-queries).

## GetMyContext
You can execute the `GetMyContext` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-client-generated/index.d.ts](./index.d.ts):
```typescript
getMyContext(options?: ExecuteQueryOptions): QueryPromise<GetMyContextData, undefined>;

interface GetMyContextRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (): QueryRef<GetMyContextData, undefined>;
}
export const getMyContextRef: GetMyContextRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
getMyContext(dc: DataConnect, options?: ExecuteQueryOptions): QueryPromise<GetMyContextData, undefined>;

interface GetMyContextRef {
  ...
  (dc: DataConnect): QueryRef<GetMyContextData, undefined>;
}
export const getMyContextRef: GetMyContextRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the getMyContextRef:
```typescript
const name = getMyContextRef.operationName;
console.log(name);
```

### Variables
The `GetMyContext` query has no variables.
### Return Type
Recall that executing the `GetMyContext` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `GetMyContextData`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `GetMyContext`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, getMyContext } from '@odontogest/dataconnect-client';


// Call the `getMyContext()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await getMyContext();

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await getMyContext(dataConnect);

console.log(data.users);
console.log(data.clinicMemberships);

// Or, you can use the `Promise` API.
getMyContext().then((response) => {
  const data = response.data;
  console.log(data.users);
  console.log(data.clinicMemberships);
});
```

### Using `GetMyContext`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, getMyContextRef } from '@odontogest/dataconnect-client';


// Call the `getMyContextRef()` function to get a reference to the query.
const ref = getMyContextRef();

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = getMyContextRef(dataConnect);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.users);
console.log(data.clinicMemberships);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.users);
  console.log(data.clinicMemberships);
});
```

## ListMyPatients
You can execute the `ListMyPatients` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-client-generated/index.d.ts](./index.d.ts):
```typescript
listMyPatients(vars: ListMyPatientsVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyPatientsData, ListMyPatientsVariables>;

interface ListMyPatientsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListMyPatientsVariables): QueryRef<ListMyPatientsData, ListMyPatientsVariables>;
}
export const listMyPatientsRef: ListMyPatientsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyPatients(dc: DataConnect, vars: ListMyPatientsVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyPatientsData, ListMyPatientsVariables>;

interface ListMyPatientsRef {
  ...
  (dc: DataConnect, vars: ListMyPatientsVariables): QueryRef<ListMyPatientsData, ListMyPatientsVariables>;
}
export const listMyPatientsRef: ListMyPatientsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyPatientsRef:
```typescript
const name = listMyPatientsRef.operationName;
console.log(name);
```

### Variables
The `ListMyPatients` query requires an argument of type `ListMyPatientsVariables`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListMyPatientsVariables {
  clinicId: UUIDString;
  limit?: number | null;
}
```
### Return Type
Recall that executing the `ListMyPatients` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyPatientsData`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListMyPatients`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyPatients, ListMyPatientsVariables } from '@odontogest/dataconnect-client';

// The `ListMyPatients` query requires an argument of type `ListMyPatientsVariables`:
const listMyPatientsVars: ListMyPatientsVariables = {
  clinicId: ..., 
  limit: ..., // optional
};

// Call the `listMyPatients()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyPatients(listMyPatientsVars);
// Variables can be defined inline as well.
const { data } = await listMyPatients({ clinicId: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyPatients(dataConnect, listMyPatientsVars);

console.log(data.clinicMemberships);

// Or, you can use the `Promise` API.
listMyPatients(listMyPatientsVars).then((response) => {
  const data = response.data;
  console.log(data.clinicMemberships);
});
```

### Using `ListMyPatients`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyPatientsRef, ListMyPatientsVariables } from '@odontogest/dataconnect-client';

// The `ListMyPatients` query requires an argument of type `ListMyPatientsVariables`:
const listMyPatientsVars: ListMyPatientsVariables = {
  clinicId: ..., 
  limit: ..., // optional
};

// Call the `listMyPatientsRef()` function to get a reference to the query.
const ref = listMyPatientsRef(listMyPatientsVars);
// Variables can be defined inline as well.
const ref = listMyPatientsRef({ clinicId: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyPatientsRef(dataConnect, listMyPatientsVars);

// Call `executeQuery()` on the reference to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeQuery(ref);

console.log(data.clinicMemberships);

// Or, you can use the `Promise` API.
executeQuery(ref).then((response) => {
  const data = response.data;
  console.log(data.clinicMemberships);
});
```

# Mutations

There are two ways to execute a Data Connect Mutation using the generated Web SDK:
- Using a Mutation Reference function, which returns a `MutationRef`
  - The `MutationRef` can be used as an argument to `executeMutation()`, which will execute the Mutation and return a `MutationPromise`
- Using an action shortcut function, which returns a `MutationPromise`
  - Calling the action shortcut function will execute the Mutation and return a `MutationPromise`

The following is true for both the action shortcut function and the `MutationRef` function:
- The `MutationPromise` returned will resolve to the result of the Mutation once it has finished executing
- If the Mutation accepts arguments, both the action shortcut function and the `MutationRef` function accept a single argument: an object that contains all the required variables (and the optional variables) for the Mutation
- Both functions can be called with or without passing in a `DataConnect` instance as an argument. If no `DataConnect` argument is passed in, then the generated SDK will call `getDataConnect(connectorConfig)` behind the scenes for you.

Below are examples of how to use the `client` connector's generated functions to execute each mutation. You can also follow the examples from the [Data Connect documentation](https://firebase.google.com/docs/data-connect/web-sdk#using-mutations).

## CreateOwnerClinic
You can execute the `CreateOwnerClinic` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-client-generated/index.d.ts](./index.d.ts):
```typescript
createOwnerClinic(vars: CreateOwnerClinicVariables): MutationPromise<CreateOwnerClinicData, CreateOwnerClinicVariables>;

interface CreateOwnerClinicRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateOwnerClinicVariables): MutationRef<CreateOwnerClinicData, CreateOwnerClinicVariables>;
}
export const createOwnerClinicRef: CreateOwnerClinicRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createOwnerClinic(dc: DataConnect, vars: CreateOwnerClinicVariables): MutationPromise<CreateOwnerClinicData, CreateOwnerClinicVariables>;

interface CreateOwnerClinicRef {
  ...
  (dc: DataConnect, vars: CreateOwnerClinicVariables): MutationRef<CreateOwnerClinicData, CreateOwnerClinicVariables>;
}
export const createOwnerClinicRef: CreateOwnerClinicRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createOwnerClinicRef:
```typescript
const name = createOwnerClinicRef.operationName;
console.log(name);
```

### Variables
The `CreateOwnerClinic` mutation requires an argument of type `CreateOwnerClinicVariables`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateOwnerClinic` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateOwnerClinicData`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `CreateOwnerClinic`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createOwnerClinic, CreateOwnerClinicVariables } from '@odontogest/dataconnect-client';

// The `CreateOwnerClinic` mutation requires an argument of type `CreateOwnerClinicVariables`:
const createOwnerClinicVars: CreateOwnerClinicVariables = {
  clinicId: ..., 
  settingsId: ..., 
  membershipId: ..., 
  ownerRoleId: ..., 
  termsId: ..., 
  privacyId: ..., 
  auditId: ..., 
  responsibleName: ..., 
  clinicName: ..., 
  email: ..., 
  emailCanonical: ..., 
  termsEvidenceDigest: ..., 
  privacyEvidenceDigest: ..., 
  requestId: ..., 
};

// Call the `createOwnerClinic()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createOwnerClinic(createOwnerClinicVars);
// Variables can be defined inline as well.
const { data } = await createOwnerClinic({ clinicId: ..., settingsId: ..., membershipId: ..., ownerRoleId: ..., termsId: ..., privacyId: ..., auditId: ..., responsibleName: ..., clinicName: ..., email: ..., emailCanonical: ..., termsEvidenceDigest: ..., privacyEvidenceDigest: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createOwnerClinic(dataConnect, createOwnerClinicVars);

console.log(data.user_upsert);
console.log(data.role_upsert);
console.log(data.clinic_insert);
console.log(data.clinicSettings_insert);
console.log(data.clinicMembership_insert);
console.log(data.termsAcceptance_insert);
console.log(data.privacyAcceptance);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
createOwnerClinic(createOwnerClinicVars).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
  console.log(data.role_upsert);
  console.log(data.clinic_insert);
  console.log(data.clinicSettings_insert);
  console.log(data.clinicMembership_insert);
  console.log(data.termsAcceptance_insert);
  console.log(data.privacyAcceptance);
  console.log(data.auditLog_insert);
});
```

### Using `CreateOwnerClinic`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createOwnerClinicRef, CreateOwnerClinicVariables } from '@odontogest/dataconnect-client';

// The `CreateOwnerClinic` mutation requires an argument of type `CreateOwnerClinicVariables`:
const createOwnerClinicVars: CreateOwnerClinicVariables = {
  clinicId: ..., 
  settingsId: ..., 
  membershipId: ..., 
  ownerRoleId: ..., 
  termsId: ..., 
  privacyId: ..., 
  auditId: ..., 
  responsibleName: ..., 
  clinicName: ..., 
  email: ..., 
  emailCanonical: ..., 
  termsEvidenceDigest: ..., 
  privacyEvidenceDigest: ..., 
  requestId: ..., 
};

// Call the `createOwnerClinicRef()` function to get a reference to the mutation.
const ref = createOwnerClinicRef(createOwnerClinicVars);
// Variables can be defined inline as well.
const ref = createOwnerClinicRef({ clinicId: ..., settingsId: ..., membershipId: ..., ownerRoleId: ..., termsId: ..., privacyId: ..., auditId: ..., responsibleName: ..., clinicName: ..., email: ..., emailCanonical: ..., termsEvidenceDigest: ..., privacyEvidenceDigest: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createOwnerClinicRef(dataConnect, createOwnerClinicVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.user_upsert);
console.log(data.role_upsert);
console.log(data.clinic_insert);
console.log(data.clinicSettings_insert);
console.log(data.clinicMembership_insert);
console.log(data.termsAcceptance_insert);
console.log(data.privacyAcceptance);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.user_upsert);
  console.log(data.role_upsert);
  console.log(data.clinic_insert);
  console.log(data.clinicSettings_insert);
  console.log(data.clinicMembership_insert);
  console.log(data.termsAcceptance_insert);
  console.log(data.privacyAcceptance);
  console.log(data.auditLog_insert);
});
```

## CreateMyPatient
You can execute the `CreateMyPatient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-client-generated/index.d.ts](./index.d.ts):
```typescript
createMyPatient(vars: CreateMyPatientVariables): MutationPromise<CreateMyPatientData, CreateMyPatientVariables>;

interface CreateMyPatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMyPatientVariables): MutationRef<CreateMyPatientData, CreateMyPatientVariables>;
}
export const createMyPatientRef: CreateMyPatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createMyPatient(dc: DataConnect, vars: CreateMyPatientVariables): MutationPromise<CreateMyPatientData, CreateMyPatientVariables>;

interface CreateMyPatientRef {
  ...
  (dc: DataConnect, vars: CreateMyPatientVariables): MutationRef<CreateMyPatientData, CreateMyPatientVariables>;
}
export const createMyPatientRef: CreateMyPatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createMyPatientRef:
```typescript
const name = createMyPatientRef.operationName;
console.log(name);
```

### Variables
The `CreateMyPatient` mutation requires an argument of type `CreateMyPatientVariables`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateMyPatient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateMyPatientData`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateMyPatientData {
  patient_insert: Patient_Key;
  auditLog_insert: AuditLog_Key;
}
```
### Using `CreateMyPatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createMyPatient, CreateMyPatientVariables } from '@odontogest/dataconnect-client';

// The `CreateMyPatient` mutation requires an argument of type `CreateMyPatientVariables`:
const createMyPatientVars: CreateMyPatientVariables = {
  id: ..., 
  clinicId: ..., 
  fullName: ..., 
  cpf: ..., 
  birthDate: ..., // optional
  phone: ..., // optional
  whatsapp: ..., // optional
  email: ..., // optional
  addressLine: ..., // optional
  administrativeNotes: ..., // optional
  auditId: ..., 
  requestId: ..., 
};

// Call the `createMyPatient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createMyPatient(createMyPatientVars);
// Variables can be defined inline as well.
const { data } = await createMyPatient({ id: ..., clinicId: ..., fullName: ..., cpf: ..., birthDate: ..., phone: ..., whatsapp: ..., email: ..., addressLine: ..., administrativeNotes: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createMyPatient(dataConnect, createMyPatientVars);

console.log(data.patient_insert);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
createMyPatient(createMyPatientVars).then((response) => {
  const data = response.data;
  console.log(data.patient_insert);
  console.log(data.auditLog_insert);
});
```

### Using `CreateMyPatient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createMyPatientRef, CreateMyPatientVariables } from '@odontogest/dataconnect-client';

// The `CreateMyPatient` mutation requires an argument of type `CreateMyPatientVariables`:
const createMyPatientVars: CreateMyPatientVariables = {
  id: ..., 
  clinicId: ..., 
  fullName: ..., 
  cpf: ..., 
  birthDate: ..., // optional
  phone: ..., // optional
  whatsapp: ..., // optional
  email: ..., // optional
  addressLine: ..., // optional
  administrativeNotes: ..., // optional
  auditId: ..., 
  requestId: ..., 
};

// Call the `createMyPatientRef()` function to get a reference to the mutation.
const ref = createMyPatientRef(createMyPatientVars);
// Variables can be defined inline as well.
const ref = createMyPatientRef({ id: ..., clinicId: ..., fullName: ..., cpf: ..., birthDate: ..., phone: ..., whatsapp: ..., email: ..., addressLine: ..., administrativeNotes: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createMyPatientRef(dataConnect, createMyPatientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.patient_insert);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.patient_insert);
  console.log(data.auditLog_insert);
});
```

## UpdateMyPatient
You can execute the `UpdateMyPatient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-client-generated/index.d.ts](./index.d.ts):
```typescript
updateMyPatient(vars: UpdateMyPatientVariables): MutationPromise<UpdateMyPatientData, UpdateMyPatientVariables>;

interface UpdateMyPatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMyPatientVariables): MutationRef<UpdateMyPatientData, UpdateMyPatientVariables>;
}
export const updateMyPatientRef: UpdateMyPatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateMyPatient(dc: DataConnect, vars: UpdateMyPatientVariables): MutationPromise<UpdateMyPatientData, UpdateMyPatientVariables>;

interface UpdateMyPatientRef {
  ...
  (dc: DataConnect, vars: UpdateMyPatientVariables): MutationRef<UpdateMyPatientData, UpdateMyPatientVariables>;
}
export const updateMyPatientRef: UpdateMyPatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateMyPatientRef:
```typescript
const name = updateMyPatientRef.operationName;
console.log(name);
```

### Variables
The `UpdateMyPatient` mutation requires an argument of type `UpdateMyPatientVariables`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateMyPatient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateMyPatientData`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateMyPatientData {
  patient_updateMany: number;
  auditLog_insert: AuditLog_Key;
}
```
### Using `UpdateMyPatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateMyPatient, UpdateMyPatientVariables } from '@odontogest/dataconnect-client';

// The `UpdateMyPatient` mutation requires an argument of type `UpdateMyPatientVariables`:
const updateMyPatientVars: UpdateMyPatientVariables = {
  id: ..., 
  clinicId: ..., 
  fullName: ..., 
  birthDate: ..., // optional
  phone: ..., // optional
  whatsapp: ..., // optional
  email: ..., // optional
  addressLine: ..., // optional
  administrativeNotes: ..., // optional
  auditId: ..., 
  requestId: ..., 
};

// Call the `updateMyPatient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateMyPatient(updateMyPatientVars);
// Variables can be defined inline as well.
const { data } = await updateMyPatient({ id: ..., clinicId: ..., fullName: ..., birthDate: ..., phone: ..., whatsapp: ..., email: ..., addressLine: ..., administrativeNotes: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateMyPatient(dataConnect, updateMyPatientVars);

console.log(data.patient_updateMany);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
updateMyPatient(updateMyPatientVars).then((response) => {
  const data = response.data;
  console.log(data.patient_updateMany);
  console.log(data.auditLog_insert);
});
```

### Using `UpdateMyPatient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateMyPatientRef, UpdateMyPatientVariables } from '@odontogest/dataconnect-client';

// The `UpdateMyPatient` mutation requires an argument of type `UpdateMyPatientVariables`:
const updateMyPatientVars: UpdateMyPatientVariables = {
  id: ..., 
  clinicId: ..., 
  fullName: ..., 
  birthDate: ..., // optional
  phone: ..., // optional
  whatsapp: ..., // optional
  email: ..., // optional
  addressLine: ..., // optional
  administrativeNotes: ..., // optional
  auditId: ..., 
  requestId: ..., 
};

// Call the `updateMyPatientRef()` function to get a reference to the mutation.
const ref = updateMyPatientRef(updateMyPatientVars);
// Variables can be defined inline as well.
const ref = updateMyPatientRef({ id: ..., clinicId: ..., fullName: ..., birthDate: ..., phone: ..., whatsapp: ..., email: ..., addressLine: ..., administrativeNotes: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateMyPatientRef(dataConnect, updateMyPatientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.patient_updateMany);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.patient_updateMany);
  console.log(data.auditLog_insert);
});
```

## InactivateMyPatient
You can execute the `InactivateMyPatient` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-client-generated/index.d.ts](./index.d.ts):
```typescript
inactivateMyPatient(vars: InactivateMyPatientVariables): MutationPromise<InactivateMyPatientData, InactivateMyPatientVariables>;

interface InactivateMyPatientRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: InactivateMyPatientVariables): MutationRef<InactivateMyPatientData, InactivateMyPatientVariables>;
}
export const inactivateMyPatientRef: InactivateMyPatientRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
inactivateMyPatient(dc: DataConnect, vars: InactivateMyPatientVariables): MutationPromise<InactivateMyPatientData, InactivateMyPatientVariables>;

interface InactivateMyPatientRef {
  ...
  (dc: DataConnect, vars: InactivateMyPatientVariables): MutationRef<InactivateMyPatientData, InactivateMyPatientVariables>;
}
export const inactivateMyPatientRef: InactivateMyPatientRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the inactivateMyPatientRef:
```typescript
const name = inactivateMyPatientRef.operationName;
console.log(name);
```

### Variables
The `InactivateMyPatient` mutation requires an argument of type `InactivateMyPatientVariables`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface InactivateMyPatientVariables {
  id: UUIDString;
  clinicId: UUIDString;
  auditId: UUIDString;
  requestId: string;
}
```
### Return Type
Recall that executing the `InactivateMyPatient` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `InactivateMyPatientData`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface InactivateMyPatientData {
  patient_updateMany: number;
  auditLog_insert: AuditLog_Key;
}
```
### Using `InactivateMyPatient`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, inactivateMyPatient, InactivateMyPatientVariables } from '@odontogest/dataconnect-client';

// The `InactivateMyPatient` mutation requires an argument of type `InactivateMyPatientVariables`:
const inactivateMyPatientVars: InactivateMyPatientVariables = {
  id: ..., 
  clinicId: ..., 
  auditId: ..., 
  requestId: ..., 
};

// Call the `inactivateMyPatient()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await inactivateMyPatient(inactivateMyPatientVars);
// Variables can be defined inline as well.
const { data } = await inactivateMyPatient({ id: ..., clinicId: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await inactivateMyPatient(dataConnect, inactivateMyPatientVars);

console.log(data.patient_updateMany);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
inactivateMyPatient(inactivateMyPatientVars).then((response) => {
  const data = response.data;
  console.log(data.patient_updateMany);
  console.log(data.auditLog_insert);
});
```

### Using `InactivateMyPatient`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, inactivateMyPatientRef, InactivateMyPatientVariables } from '@odontogest/dataconnect-client';

// The `InactivateMyPatient` mutation requires an argument of type `InactivateMyPatientVariables`:
const inactivateMyPatientVars: InactivateMyPatientVariables = {
  id: ..., 
  clinicId: ..., 
  auditId: ..., 
  requestId: ..., 
};

// Call the `inactivateMyPatientRef()` function to get a reference to the mutation.
const ref = inactivateMyPatientRef(inactivateMyPatientVars);
// Variables can be defined inline as well.
const ref = inactivateMyPatientRef({ id: ..., clinicId: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = inactivateMyPatientRef(dataConnect, inactivateMyPatientVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.patient_updateMany);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.patient_updateMany);
  console.log(data.auditLog_insert);
});
```

