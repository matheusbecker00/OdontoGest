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
  - [*ListMyDentists*](#listmydentists)
  - [*ListMyProcedures*](#listmyprocedures)
- [**Mutations**](#mutations)
  - [*CreateOwnerClinic*](#createownerclinic)
  - [*CreateMyPatient*](#createmypatient)
  - [*UpdateMyPatient*](#updatemypatient)
  - [*InactivateMyPatient*](#inactivatemypatient)
  - [*CreateMyDentist*](#createmydentist)
  - [*UpdateMyDentist*](#updatemydentist)
  - [*InactivateMyDentist*](#inactivatemydentist)
  - [*CreateMyProcedure*](#createmyprocedure)
  - [*UpdateMyProcedure*](#updatemyprocedure)
  - [*InactivateMyProcedure*](#inactivatemyprocedure)

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

## ListMyDentists
You can execute the `ListMyDentists` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-client-generated/index.d.ts](./index.d.ts):
```typescript
listMyDentists(vars: ListMyDentistsVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyDentistsData, ListMyDentistsVariables>;

interface ListMyDentistsRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListMyDentistsVariables): QueryRef<ListMyDentistsData, ListMyDentistsVariables>;
}
export const listMyDentistsRef: ListMyDentistsRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyDentists(dc: DataConnect, vars: ListMyDentistsVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyDentistsData, ListMyDentistsVariables>;

interface ListMyDentistsRef {
  ...
  (dc: DataConnect, vars: ListMyDentistsVariables): QueryRef<ListMyDentistsData, ListMyDentistsVariables>;
}
export const listMyDentistsRef: ListMyDentistsRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyDentistsRef:
```typescript
const name = listMyDentistsRef.operationName;
console.log(name);
```

### Variables
The `ListMyDentists` query requires an argument of type `ListMyDentistsVariables`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListMyDentistsVariables {
  clinicId: UUIDString;
  limit?: number | null;
}
```
### Return Type
Recall that executing the `ListMyDentists` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyDentistsData`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListMyDentists`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyDentists, ListMyDentistsVariables } from '@odontogest/dataconnect-client';

// The `ListMyDentists` query requires an argument of type `ListMyDentistsVariables`:
const listMyDentistsVars: ListMyDentistsVariables = {
  clinicId: ...,
  limit: ..., // optional
};

// Call the `listMyDentists()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyDentists(listMyDentistsVars);
// Variables can be defined inline as well.
const { data } = await listMyDentists({ clinicId: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyDentists(dataConnect, listMyDentistsVars);

console.log(data.clinicMemberships);

// Or, you can use the `Promise` API.
listMyDentists(listMyDentistsVars).then((response) => {
  const data = response.data;
  console.log(data.clinicMemberships);
});
```

### Using `ListMyDentists`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyDentistsRef, ListMyDentistsVariables } from '@odontogest/dataconnect-client';

// The `ListMyDentists` query requires an argument of type `ListMyDentistsVariables`:
const listMyDentistsVars: ListMyDentistsVariables = {
  clinicId: ...,
  limit: ..., // optional
};

// Call the `listMyDentistsRef()` function to get a reference to the query.
const ref = listMyDentistsRef(listMyDentistsVars);
// Variables can be defined inline as well.
const ref = listMyDentistsRef({ clinicId: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyDentistsRef(dataConnect, listMyDentistsVars);

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

## ListMyProcedures
You can execute the `ListMyProcedures` query using the following action shortcut function, or by calling `executeQuery()` after calling the following `QueryRef` function, both of which are defined in [dataconnect-client-generated/index.d.ts](./index.d.ts):
```typescript
listMyProcedures(vars: ListMyProceduresVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyProceduresData, ListMyProceduresVariables>;

interface ListMyProceduresRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: ListMyProceduresVariables): QueryRef<ListMyProceduresData, ListMyProceduresVariables>;
}
export const listMyProceduresRef: ListMyProceduresRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `QueryRef` function.
```typescript
listMyProcedures(dc: DataConnect, vars: ListMyProceduresVariables, options?: ExecuteQueryOptions): QueryPromise<ListMyProceduresData, ListMyProceduresVariables>;

interface ListMyProceduresRef {
  ...
  (dc: DataConnect, vars: ListMyProceduresVariables): QueryRef<ListMyProceduresData, ListMyProceduresVariables>;
}
export const listMyProceduresRef: ListMyProceduresRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the listMyProceduresRef:
```typescript
const name = listMyProceduresRef.operationName;
console.log(name);
```

### Variables
The `ListMyProcedures` query requires an argument of type `ListMyProceduresVariables`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface ListMyProceduresVariables {
  clinicId: UUIDString;
  limit?: number | null;
}
```
### Return Type
Recall that executing the `ListMyProcedures` query returns a `QueryPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `ListMyProceduresData`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
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
```
### Using `ListMyProcedures`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, listMyProcedures, ListMyProceduresVariables } from '@odontogest/dataconnect-client';

// The `ListMyProcedures` query requires an argument of type `ListMyProceduresVariables`:
const listMyProceduresVars: ListMyProceduresVariables = {
  clinicId: ...,
  limit: ..., // optional
};

// Call the `listMyProcedures()` function to execute the query.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await listMyProcedures(listMyProceduresVars);
// Variables can be defined inline as well.
const { data } = await listMyProcedures({ clinicId: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await listMyProcedures(dataConnect, listMyProceduresVars);

console.log(data.clinicMemberships);

// Or, you can use the `Promise` API.
listMyProcedures(listMyProceduresVars).then((response) => {
  const data = response.data;
  console.log(data.clinicMemberships);
});
```

### Using `ListMyProcedures`'s `QueryRef` function

```typescript
import { getDataConnect, executeQuery } from 'firebase/data-connect';
import { connectorConfig, listMyProceduresRef, ListMyProceduresVariables } from '@odontogest/dataconnect-client';

// The `ListMyProcedures` query requires an argument of type `ListMyProceduresVariables`:
const listMyProceduresVars: ListMyProceduresVariables = {
  clinicId: ...,
  limit: ..., // optional
};

// Call the `listMyProceduresRef()` function to get a reference to the query.
const ref = listMyProceduresRef(listMyProceduresVars);
// Variables can be defined inline as well.
const ref = listMyProceduresRef({ clinicId: ..., limit: ..., });

// You can also pass in a `DataConnect` instance to the `QueryRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = listMyProceduresRef(dataConnect, listMyProceduresVars);

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

## CreateMyDentist
You can execute the `CreateMyDentist` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-client-generated/index.d.ts](./index.d.ts):
```typescript
createMyDentist(vars: CreateMyDentistVariables): MutationPromise<CreateMyDentistData, CreateMyDentistVariables>;

interface CreateMyDentistRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMyDentistVariables): MutationRef<CreateMyDentistData, CreateMyDentistVariables>;
}
export const createMyDentistRef: CreateMyDentistRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createMyDentist(dc: DataConnect, vars: CreateMyDentistVariables): MutationPromise<CreateMyDentistData, CreateMyDentistVariables>;

interface CreateMyDentistRef {
  ...
  (dc: DataConnect, vars: CreateMyDentistVariables): MutationRef<CreateMyDentistData, CreateMyDentistVariables>;
}
export const createMyDentistRef: CreateMyDentistRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createMyDentistRef:
```typescript
const name = createMyDentistRef.operationName;
console.log(name);
```

### Variables
The `CreateMyDentist` mutation requires an argument of type `CreateMyDentistVariables`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateMyDentist` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateMyDentistData`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateMyDentistData {
  dentist_insert: Dentist_Key;
  auditLog_insert: AuditLog_Key;
}
```
### Using `CreateMyDentist`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createMyDentist, CreateMyDentistVariables } from '@odontogest/dataconnect-client';

// The `CreateMyDentist` mutation requires an argument of type `CreateMyDentistVariables`:
const createMyDentistVars: CreateMyDentistVariables = {
  id: ...,
  clinicId: ...,
  name: ...,
  cro: ...,
  croState: ...,
  specialty: ...,
  phone: ..., // optional
  email: ..., // optional
  calendarColor: ...,
  defaultAppointmentMinutes: ...,
  auditId: ...,
  requestId: ...,
};

// Call the `createMyDentist()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createMyDentist(createMyDentistVars);
// Variables can be defined inline as well.
const { data } = await createMyDentist({ id: ..., clinicId: ..., name: ..., cro: ..., croState: ..., specialty: ..., phone: ..., email: ..., calendarColor: ..., defaultAppointmentMinutes: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createMyDentist(dataConnect, createMyDentistVars);

console.log(data.dentist_insert);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
createMyDentist(createMyDentistVars).then((response) => {
  const data = response.data;
  console.log(data.dentist_insert);
  console.log(data.auditLog_insert);
});
```

### Using `CreateMyDentist`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createMyDentistRef, CreateMyDentistVariables } from '@odontogest/dataconnect-client';

// The `CreateMyDentist` mutation requires an argument of type `CreateMyDentistVariables`:
const createMyDentistVars: CreateMyDentistVariables = {
  id: ...,
  clinicId: ...,
  name: ...,
  cro: ...,
  croState: ...,
  specialty: ...,
  phone: ..., // optional
  email: ..., // optional
  calendarColor: ...,
  defaultAppointmentMinutes: ...,
  auditId: ...,
  requestId: ...,
};

// Call the `createMyDentistRef()` function to get a reference to the mutation.
const ref = createMyDentistRef(createMyDentistVars);
// Variables can be defined inline as well.
const ref = createMyDentistRef({ id: ..., clinicId: ..., name: ..., cro: ..., croState: ..., specialty: ..., phone: ..., email: ..., calendarColor: ..., defaultAppointmentMinutes: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createMyDentistRef(dataConnect, createMyDentistVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.dentist_insert);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.dentist_insert);
  console.log(data.auditLog_insert);
});
```

## UpdateMyDentist
You can execute the `UpdateMyDentist` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-client-generated/index.d.ts](./index.d.ts):
```typescript
updateMyDentist(vars: UpdateMyDentistVariables): MutationPromise<UpdateMyDentistData, UpdateMyDentistVariables>;

interface UpdateMyDentistRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMyDentistVariables): MutationRef<UpdateMyDentistData, UpdateMyDentistVariables>;
}
export const updateMyDentistRef: UpdateMyDentistRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateMyDentist(dc: DataConnect, vars: UpdateMyDentistVariables): MutationPromise<UpdateMyDentistData, UpdateMyDentistVariables>;

interface UpdateMyDentistRef {
  ...
  (dc: DataConnect, vars: UpdateMyDentistVariables): MutationRef<UpdateMyDentistData, UpdateMyDentistVariables>;
}
export const updateMyDentistRef: UpdateMyDentistRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateMyDentistRef:
```typescript
const name = updateMyDentistRef.operationName;
console.log(name);
```

### Variables
The `UpdateMyDentist` mutation requires an argument of type `UpdateMyDentistVariables`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateMyDentist` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateMyDentistData`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateMyDentistData {
  dentist_updateMany: number;
  auditLog_insert: AuditLog_Key;
}
```
### Using `UpdateMyDentist`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateMyDentist, UpdateMyDentistVariables } from '@odontogest/dataconnect-client';

// The `UpdateMyDentist` mutation requires an argument of type `UpdateMyDentistVariables`:
const updateMyDentistVars: UpdateMyDentistVariables = {
  id: ...,
  clinicId: ...,
  name: ...,
  cro: ...,
  croState: ...,
  specialty: ...,
  phone: ..., // optional
  email: ..., // optional
  calendarColor: ...,
  defaultAppointmentMinutes: ...,
  auditId: ...,
  requestId: ...,
};

// Call the `updateMyDentist()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateMyDentist(updateMyDentistVars);
// Variables can be defined inline as well.
const { data } = await updateMyDentist({ id: ..., clinicId: ..., name: ..., cro: ..., croState: ..., specialty: ..., phone: ..., email: ..., calendarColor: ..., defaultAppointmentMinutes: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateMyDentist(dataConnect, updateMyDentistVars);

console.log(data.dentist_updateMany);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
updateMyDentist(updateMyDentistVars).then((response) => {
  const data = response.data;
  console.log(data.dentist_updateMany);
  console.log(data.auditLog_insert);
});
```

### Using `UpdateMyDentist`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateMyDentistRef, UpdateMyDentistVariables } from '@odontogest/dataconnect-client';

// The `UpdateMyDentist` mutation requires an argument of type `UpdateMyDentistVariables`:
const updateMyDentistVars: UpdateMyDentistVariables = {
  id: ...,
  clinicId: ...,
  name: ...,
  cro: ...,
  croState: ...,
  specialty: ...,
  phone: ..., // optional
  email: ..., // optional
  calendarColor: ...,
  defaultAppointmentMinutes: ...,
  auditId: ...,
  requestId: ...,
};

// Call the `updateMyDentistRef()` function to get a reference to the mutation.
const ref = updateMyDentistRef(updateMyDentistVars);
// Variables can be defined inline as well.
const ref = updateMyDentistRef({ id: ..., clinicId: ..., name: ..., cro: ..., croState: ..., specialty: ..., phone: ..., email: ..., calendarColor: ..., defaultAppointmentMinutes: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateMyDentistRef(dataConnect, updateMyDentistVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.dentist_updateMany);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.dentist_updateMany);
  console.log(data.auditLog_insert);
});
```

## InactivateMyDentist
You can execute the `InactivateMyDentist` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-client-generated/index.d.ts](./index.d.ts):
```typescript
inactivateMyDentist(vars: InactivateMyDentistVariables): MutationPromise<InactivateMyDentistData, InactivateMyDentistVariables>;

interface InactivateMyDentistRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: InactivateMyDentistVariables): MutationRef<InactivateMyDentistData, InactivateMyDentistVariables>;
}
export const inactivateMyDentistRef: InactivateMyDentistRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
inactivateMyDentist(dc: DataConnect, vars: InactivateMyDentistVariables): MutationPromise<InactivateMyDentistData, InactivateMyDentistVariables>;

interface InactivateMyDentistRef {
  ...
  (dc: DataConnect, vars: InactivateMyDentistVariables): MutationRef<InactivateMyDentistData, InactivateMyDentistVariables>;
}
export const inactivateMyDentistRef: InactivateMyDentistRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the inactivateMyDentistRef:
```typescript
const name = inactivateMyDentistRef.operationName;
console.log(name);
```

### Variables
The `InactivateMyDentist` mutation requires an argument of type `InactivateMyDentistVariables`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface InactivateMyDentistVariables {
  id: UUIDString;
  clinicId: UUIDString;
  auditId: UUIDString;
  requestId: string;
}
```
### Return Type
Recall that executing the `InactivateMyDentist` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `InactivateMyDentistData`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface InactivateMyDentistData {
  dentist_updateMany: number;
  auditLog_insert: AuditLog_Key;
}
```
### Using `InactivateMyDentist`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, inactivateMyDentist, InactivateMyDentistVariables } from '@odontogest/dataconnect-client';

// The `InactivateMyDentist` mutation requires an argument of type `InactivateMyDentistVariables`:
const inactivateMyDentistVars: InactivateMyDentistVariables = {
  id: ...,
  clinicId: ...,
  auditId: ...,
  requestId: ...,
};

// Call the `inactivateMyDentist()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await inactivateMyDentist(inactivateMyDentistVars);
// Variables can be defined inline as well.
const { data } = await inactivateMyDentist({ id: ..., clinicId: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await inactivateMyDentist(dataConnect, inactivateMyDentistVars);

console.log(data.dentist_updateMany);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
inactivateMyDentist(inactivateMyDentistVars).then((response) => {
  const data = response.data;
  console.log(data.dentist_updateMany);
  console.log(data.auditLog_insert);
});
```

### Using `InactivateMyDentist`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, inactivateMyDentistRef, InactivateMyDentistVariables } from '@odontogest/dataconnect-client';

// The `InactivateMyDentist` mutation requires an argument of type `InactivateMyDentistVariables`:
const inactivateMyDentistVars: InactivateMyDentistVariables = {
  id: ...,
  clinicId: ...,
  auditId: ...,
  requestId: ...,
};

// Call the `inactivateMyDentistRef()` function to get a reference to the mutation.
const ref = inactivateMyDentistRef(inactivateMyDentistVars);
// Variables can be defined inline as well.
const ref = inactivateMyDentistRef({ id: ..., clinicId: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = inactivateMyDentistRef(dataConnect, inactivateMyDentistVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.dentist_updateMany);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.dentist_updateMany);
  console.log(data.auditLog_insert);
});
```

## CreateMyProcedure
You can execute the `CreateMyProcedure` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-client-generated/index.d.ts](./index.d.ts):
```typescript
createMyProcedure(vars: CreateMyProcedureVariables): MutationPromise<CreateMyProcedureData, CreateMyProcedureVariables>;

interface CreateMyProcedureRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: CreateMyProcedureVariables): MutationRef<CreateMyProcedureData, CreateMyProcedureVariables>;
}
export const createMyProcedureRef: CreateMyProcedureRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
createMyProcedure(dc: DataConnect, vars: CreateMyProcedureVariables): MutationPromise<CreateMyProcedureData, CreateMyProcedureVariables>;

interface CreateMyProcedureRef {
  ...
  (dc: DataConnect, vars: CreateMyProcedureVariables): MutationRef<CreateMyProcedureData, CreateMyProcedureVariables>;
}
export const createMyProcedureRef: CreateMyProcedureRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the createMyProcedureRef:
```typescript
const name = createMyProcedureRef.operationName;
console.log(name);
```

### Variables
The `CreateMyProcedure` mutation requires an argument of type `CreateMyProcedureVariables`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `CreateMyProcedure` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `CreateMyProcedureData`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface CreateMyProcedureData {
  procedure_insert: Procedure_Key;
  auditLog_insert: AuditLog_Key;
}
```
### Using `CreateMyProcedure`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, createMyProcedure, CreateMyProcedureVariables } from '@odontogest/dataconnect-client';

// The `CreateMyProcedure` mutation requires an argument of type `CreateMyProcedureVariables`:
const createMyProcedureVars: CreateMyProcedureVariables = {
  id: ...,
  clinicId: ...,
  name: ...,
  category: ...,
  description: ..., // optional
  defaultPriceCents: ...,
  durationMinutes: ...,
  auditId: ...,
  requestId: ...,
};

// Call the `createMyProcedure()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await createMyProcedure(createMyProcedureVars);
// Variables can be defined inline as well.
const { data } = await createMyProcedure({ id: ..., clinicId: ..., name: ..., category: ..., description: ..., defaultPriceCents: ..., durationMinutes: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await createMyProcedure(dataConnect, createMyProcedureVars);

console.log(data.procedure_insert);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
createMyProcedure(createMyProcedureVars).then((response) => {
  const data = response.data;
  console.log(data.procedure_insert);
  console.log(data.auditLog_insert);
});
```

### Using `CreateMyProcedure`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, createMyProcedureRef, CreateMyProcedureVariables } from '@odontogest/dataconnect-client';

// The `CreateMyProcedure` mutation requires an argument of type `CreateMyProcedureVariables`:
const createMyProcedureVars: CreateMyProcedureVariables = {
  id: ...,
  clinicId: ...,
  name: ...,
  category: ...,
  description: ..., // optional
  defaultPriceCents: ...,
  durationMinutes: ...,
  auditId: ...,
  requestId: ...,
};

// Call the `createMyProcedureRef()` function to get a reference to the mutation.
const ref = createMyProcedureRef(createMyProcedureVars);
// Variables can be defined inline as well.
const ref = createMyProcedureRef({ id: ..., clinicId: ..., name: ..., category: ..., description: ..., defaultPriceCents: ..., durationMinutes: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = createMyProcedureRef(dataConnect, createMyProcedureVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.procedure_insert);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.procedure_insert);
  console.log(data.auditLog_insert);
});
```

## UpdateMyProcedure
You can execute the `UpdateMyProcedure` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-client-generated/index.d.ts](./index.d.ts):
```typescript
updateMyProcedure(vars: UpdateMyProcedureVariables): MutationPromise<UpdateMyProcedureData, UpdateMyProcedureVariables>;

interface UpdateMyProcedureRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: UpdateMyProcedureVariables): MutationRef<UpdateMyProcedureData, UpdateMyProcedureVariables>;
}
export const updateMyProcedureRef: UpdateMyProcedureRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
updateMyProcedure(dc: DataConnect, vars: UpdateMyProcedureVariables): MutationPromise<UpdateMyProcedureData, UpdateMyProcedureVariables>;

interface UpdateMyProcedureRef {
  ...
  (dc: DataConnect, vars: UpdateMyProcedureVariables): MutationRef<UpdateMyProcedureData, UpdateMyProcedureVariables>;
}
export const updateMyProcedureRef: UpdateMyProcedureRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the updateMyProcedureRef:
```typescript
const name = updateMyProcedureRef.operationName;
console.log(name);
```

### Variables
The `UpdateMyProcedure` mutation requires an argument of type `UpdateMyProcedureVariables`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
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
```
### Return Type
Recall that executing the `UpdateMyProcedure` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `UpdateMyProcedureData`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface UpdateMyProcedureData {
  procedure_updateMany: number;
  auditLog_insert: AuditLog_Key;
}
```
### Using `UpdateMyProcedure`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, updateMyProcedure, UpdateMyProcedureVariables } from '@odontogest/dataconnect-client';

// The `UpdateMyProcedure` mutation requires an argument of type `UpdateMyProcedureVariables`:
const updateMyProcedureVars: UpdateMyProcedureVariables = {
  id: ...,
  clinicId: ...,
  name: ...,
  category: ...,
  description: ..., // optional
  defaultPriceCents: ...,
  durationMinutes: ...,
  auditId: ...,
  requestId: ...,
};

// Call the `updateMyProcedure()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await updateMyProcedure(updateMyProcedureVars);
// Variables can be defined inline as well.
const { data } = await updateMyProcedure({ id: ..., clinicId: ..., name: ..., category: ..., description: ..., defaultPriceCents: ..., durationMinutes: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await updateMyProcedure(dataConnect, updateMyProcedureVars);

console.log(data.procedure_updateMany);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
updateMyProcedure(updateMyProcedureVars).then((response) => {
  const data = response.data;
  console.log(data.procedure_updateMany);
  console.log(data.auditLog_insert);
});
```

### Using `UpdateMyProcedure`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, updateMyProcedureRef, UpdateMyProcedureVariables } from '@odontogest/dataconnect-client';

// The `UpdateMyProcedure` mutation requires an argument of type `UpdateMyProcedureVariables`:
const updateMyProcedureVars: UpdateMyProcedureVariables = {
  id: ...,
  clinicId: ...,
  name: ...,
  category: ...,
  description: ..., // optional
  defaultPriceCents: ...,
  durationMinutes: ...,
  auditId: ...,
  requestId: ...,
};

// Call the `updateMyProcedureRef()` function to get a reference to the mutation.
const ref = updateMyProcedureRef(updateMyProcedureVars);
// Variables can be defined inline as well.
const ref = updateMyProcedureRef({ id: ..., clinicId: ..., name: ..., category: ..., description: ..., defaultPriceCents: ..., durationMinutes: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = updateMyProcedureRef(dataConnect, updateMyProcedureVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.procedure_updateMany);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.procedure_updateMany);
  console.log(data.auditLog_insert);
});
```

## InactivateMyProcedure
You can execute the `InactivateMyProcedure` mutation using the following action shortcut function, or by calling `executeMutation()` after calling the following `MutationRef` function, both of which are defined in [dataconnect-client-generated/index.d.ts](./index.d.ts):
```typescript
inactivateMyProcedure(vars: InactivateMyProcedureVariables): MutationPromise<InactivateMyProcedureData, InactivateMyProcedureVariables>;

interface InactivateMyProcedureRef {
  ...
  /* Allow users to create refs without passing in DataConnect */
  (vars: InactivateMyProcedureVariables): MutationRef<InactivateMyProcedureData, InactivateMyProcedureVariables>;
}
export const inactivateMyProcedureRef: InactivateMyProcedureRef;
```
You can also pass in a `DataConnect` instance to the action shortcut function or `MutationRef` function.
```typescript
inactivateMyProcedure(dc: DataConnect, vars: InactivateMyProcedureVariables): MutationPromise<InactivateMyProcedureData, InactivateMyProcedureVariables>;

interface InactivateMyProcedureRef {
  ...
  (dc: DataConnect, vars: InactivateMyProcedureVariables): MutationRef<InactivateMyProcedureData, InactivateMyProcedureVariables>;
}
export const inactivateMyProcedureRef: InactivateMyProcedureRef;
```

If you need the name of the operation without creating a ref, you can retrieve the operation name by calling the `operationName` property on the inactivateMyProcedureRef:
```typescript
const name = inactivateMyProcedureRef.operationName;
console.log(name);
```

### Variables
The `InactivateMyProcedure` mutation requires an argument of type `InactivateMyProcedureVariables`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:

```typescript
export interface InactivateMyProcedureVariables {
  id: UUIDString;
  clinicId: UUIDString;
  auditId: UUIDString;
  requestId: string;
}
```
### Return Type
Recall that executing the `InactivateMyProcedure` mutation returns a `MutationPromise` that resolves to an object with a `data` property.

The `data` property is an object of type `InactivateMyProcedureData`, which is defined in [dataconnect-client-generated/index.d.ts](./index.d.ts). It has the following fields:
```typescript
export interface InactivateMyProcedureData {
  procedure_updateMany: number;
  auditLog_insert: AuditLog_Key;
}
```
### Using `InactivateMyProcedure`'s action shortcut function

```typescript
import { getDataConnect } from 'firebase/data-connect';
import { connectorConfig, inactivateMyProcedure, InactivateMyProcedureVariables } from '@odontogest/dataconnect-client';

// The `InactivateMyProcedure` mutation requires an argument of type `InactivateMyProcedureVariables`:
const inactivateMyProcedureVars: InactivateMyProcedureVariables = {
  id: ...,
  clinicId: ...,
  auditId: ...,
  requestId: ...,
};

// Call the `inactivateMyProcedure()` function to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await inactivateMyProcedure(inactivateMyProcedureVars);
// Variables can be defined inline as well.
const { data } = await inactivateMyProcedure({ id: ..., clinicId: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the action shortcut function.
const dataConnect = getDataConnect(connectorConfig);
const { data } = await inactivateMyProcedure(dataConnect, inactivateMyProcedureVars);

console.log(data.procedure_updateMany);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
inactivateMyProcedure(inactivateMyProcedureVars).then((response) => {
  const data = response.data;
  console.log(data.procedure_updateMany);
  console.log(data.auditLog_insert);
});
```

### Using `InactivateMyProcedure`'s `MutationRef` function

```typescript
import { getDataConnect, executeMutation } from 'firebase/data-connect';
import { connectorConfig, inactivateMyProcedureRef, InactivateMyProcedureVariables } from '@odontogest/dataconnect-client';

// The `InactivateMyProcedure` mutation requires an argument of type `InactivateMyProcedureVariables`:
const inactivateMyProcedureVars: InactivateMyProcedureVariables = {
  id: ...,
  clinicId: ...,
  auditId: ...,
  requestId: ...,
};

// Call the `inactivateMyProcedureRef()` function to get a reference to the mutation.
const ref = inactivateMyProcedureRef(inactivateMyProcedureVars);
// Variables can be defined inline as well.
const ref = inactivateMyProcedureRef({ id: ..., clinicId: ..., auditId: ..., requestId: ..., });

// You can also pass in a `DataConnect` instance to the `MutationRef` function.
const dataConnect = getDataConnect(connectorConfig);
const ref = inactivateMyProcedureRef(dataConnect, inactivateMyProcedureVars);

// Call `executeMutation()` on the reference to execute the mutation.
// You can use the `await` keyword to wait for the promise to resolve.
const { data } = await executeMutation(ref);

console.log(data.procedure_updateMany);
console.log(data.auditLog_insert);

// Or, you can use the `Promise` API.
executeMutation(ref).then((response) => {
  const data = response.data;
  console.log(data.procedure_updateMany);
  console.log(data.auditLog_insert);
});
```

