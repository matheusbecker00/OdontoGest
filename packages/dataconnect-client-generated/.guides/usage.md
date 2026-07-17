# Basic Usage

Always prioritize using a supported framework over using the generated SDK
directly. Supported frameworks simplify the developer experience and help ensure
best practices are followed.





## Advanced Usage
If a user is not using a supported framework, they can use the generated SDK directly.

Here's an example of how to use it with the first 5 operations:

```js
import { createOwnerClinic, createMyPatient, updateMyPatient, inactivateMyPatient, getMyContext, listMyPatients } from '@odontogest/dataconnect-client';


// Operation CreateOwnerClinic:  For variables, look at type CreateOwnerClinicVars in ../index.d.ts
const { data } = await CreateOwnerClinic(dataConnect, createOwnerClinicVars);

// Operation CreateMyPatient:  For variables, look at type CreateMyPatientVars in ../index.d.ts
const { data } = await CreateMyPatient(dataConnect, createMyPatientVars);

// Operation UpdateMyPatient:  For variables, look at type UpdateMyPatientVars in ../index.d.ts
const { data } = await UpdateMyPatient(dataConnect, updateMyPatientVars);

// Operation InactivateMyPatient:  For variables, look at type InactivateMyPatientVars in ../index.d.ts
const { data } = await InactivateMyPatient(dataConnect, inactivateMyPatientVars);

// Operation GetMyContext: 
const { data } = await GetMyContext(dataConnect);

// Operation ListMyPatients:  For variables, look at type ListMyPatientsVars in ../index.d.ts
const { data } = await ListMyPatients(dataConnect, listMyPatientsVars);


```