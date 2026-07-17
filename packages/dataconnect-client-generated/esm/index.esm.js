import { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } from 'firebase/data-connect';

export const UserStatus = {
  PENDING_ONBOARDING: "PENDING_ONBOARDING",
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
  DISABLED: "DISABLED",
}

export const connectorConfig = {
  connector: 'client',
  service: 'odontogest',
  location: 'southamerica-east1'
};
export const createOwnerClinicRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateOwnerClinic', inputVars);
}
createOwnerClinicRef.operationName = 'CreateOwnerClinic';

export function createOwnerClinic(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createOwnerClinicRef(dcInstance, inputVars));
}

export const createMyPatientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMyPatient', inputVars);
}
createMyPatientRef.operationName = 'CreateMyPatient';

export function createMyPatient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createMyPatientRef(dcInstance, inputVars));
}

export const updateMyPatientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMyPatient', inputVars);
}
updateMyPatientRef.operationName = 'UpdateMyPatient';

export function updateMyPatient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateMyPatientRef(dcInstance, inputVars));
}

export const inactivateMyPatientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'InactivateMyPatient', inputVars);
}
inactivateMyPatientRef.operationName = 'InactivateMyPatient';

export function inactivateMyPatient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(inactivateMyPatientRef(dcInstance, inputVars));
}

export const getMyContextRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyContext');
}
getMyContextRef.operationName = 'GetMyContext';

export function getMyContext(dcOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getMyContextRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}

export const listMyPatientsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyPatients', inputVars);
}
listMyPatientsRef.operationName = 'ListMyPatients';

export function listMyPatients(dcOrVars, varsOrOptions, options) {
  
  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listMyPatientsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}

