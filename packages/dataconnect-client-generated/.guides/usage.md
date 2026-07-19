# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createOwnerClinic, createMyPatient, updateMyPatient, inactivateMyPatient, createMyDentist, updateMyDentist, inactivateMyDentist, createMyProcedure, updateMyProcedure, inactivateMyProcedure } from '@odontogest/dataconnect-client';


// Operation CreateOwnerClinic:  For variables, look at type CreateOwnerClinicVars in ../index.d.ts
const { data } = await CreateOwnerClinic(dataConnect, createOwnerClinicVars);

// Operation CreateMyPatient:  For variables, look at type CreateMyPatientVars in ../index.d.ts
const { data } = await CreateMyPatient(dataConnect, createMyPatientVars);

// Operation UpdateMyPatient:  For variables, look at type UpdateMyPatientVars in ../index.d.ts
const { data } = await UpdateMyPatient(dataConnect, updateMyPatientVars);

// Operation InactivateMyPatient:  For variables, look at type InactivateMyPatientVars in ../index.d.ts
const { data } = await InactivateMyPatient(dataConnect, inactivateMyPatientVars);

// Operation CreateMyDentist:  For variables, look at type CreateMyDentistVars in ../index.d.ts
const { data } = await CreateMyDentist(dataConnect, createMyDentistVars);

// Operation UpdateMyDentist:  For variables, look at type UpdateMyDentistVars in ../index.d.ts
const { data } = await UpdateMyDentist(dataConnect, updateMyDentistVars);

// Operation InactivateMyDentist:  For variables, look at type InactivateMyDentistVars in ../index.d.ts
const { data } = await InactivateMyDentist(dataConnect, inactivateMyDentistVars);

// Operation CreateMyProcedure:  For variables, look at type CreateMyProcedureVars in ../index.d.ts
const { data } = await CreateMyProcedure(dataConnect, createMyProcedureVars);

// Operation UpdateMyProcedure:  For variables, look at type UpdateMyProcedureVars in ../index.d.ts
const { data } = await UpdateMyProcedure(dataConnect, updateMyProcedureVars);

// Operation InactivateMyProcedure:  For variables, look at type InactivateMyProcedureVars in ../index.d.ts
const { data } = await InactivateMyProcedure(dataConnect, inactivateMyProcedureVars);


```