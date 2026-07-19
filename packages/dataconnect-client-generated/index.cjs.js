const { queryRef, executeQuery, validateArgsWithOptions, mutationRef, executeMutation, validateArgs } = require('firebase/data-connect');

const UserStatus = {
  PENDING_ONBOARDING: "PENDING_ONBOARDING",
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
  DISABLED: "DISABLED",
}
exports.UserStatus = UserStatus;

const connectorConfig = {
  connector: 'client',
  service: 'odontogest',
  location: 'southamerica-east1'
};
exports.connectorConfig = connectorConfig;

const createOwnerClinicRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateOwnerClinic', inputVars);
}
createOwnerClinicRef.operationName = 'CreateOwnerClinic';
exports.createOwnerClinicRef = createOwnerClinicRef;

exports.createOwnerClinic = function createOwnerClinic(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createOwnerClinicRef(dcInstance, inputVars));
}
;

const createMyPatientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMyPatient', inputVars);
}
createMyPatientRef.operationName = 'CreateMyPatient';
exports.createMyPatientRef = createMyPatientRef;

exports.createMyPatient = function createMyPatient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createMyPatientRef(dcInstance, inputVars));
}
;

const updateMyPatientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMyPatient', inputVars);
}
updateMyPatientRef.operationName = 'UpdateMyPatient';
exports.updateMyPatientRef = updateMyPatientRef;

exports.updateMyPatient = function updateMyPatient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateMyPatientRef(dcInstance, inputVars));
}
;

const inactivateMyPatientRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'InactivateMyPatient', inputVars);
}
inactivateMyPatientRef.operationName = 'InactivateMyPatient';
exports.inactivateMyPatientRef = inactivateMyPatientRef;

exports.inactivateMyPatient = function inactivateMyPatient(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(inactivateMyPatientRef(dcInstance, inputVars));
}
;

const createMyDentistRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMyDentist', inputVars);
}
createMyDentistRef.operationName = 'CreateMyDentist';
exports.createMyDentistRef = createMyDentistRef;

exports.createMyDentist = function createMyDentist(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createMyDentistRef(dcInstance, inputVars));
}
;

const updateMyDentistRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMyDentist', inputVars);
}
updateMyDentistRef.operationName = 'UpdateMyDentist';
exports.updateMyDentistRef = updateMyDentistRef;

exports.updateMyDentist = function updateMyDentist(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateMyDentistRef(dcInstance, inputVars));
}
;

const inactivateMyDentistRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'InactivateMyDentist', inputVars);
}
inactivateMyDentistRef.operationName = 'InactivateMyDentist';
exports.inactivateMyDentistRef = inactivateMyDentistRef;

exports.inactivateMyDentist = function inactivateMyDentist(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(inactivateMyDentistRef(dcInstance, inputVars));
}
;

const createMyProcedureRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'CreateMyProcedure', inputVars);
}
createMyProcedureRef.operationName = 'CreateMyProcedure';
exports.createMyProcedureRef = createMyProcedureRef;

exports.createMyProcedure = function createMyProcedure(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(createMyProcedureRef(dcInstance, inputVars));
}
;

const updateMyProcedureRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'UpdateMyProcedure', inputVars);
}
updateMyProcedureRef.operationName = 'UpdateMyProcedure';
exports.updateMyProcedureRef = updateMyProcedureRef;

exports.updateMyProcedure = function updateMyProcedure(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(updateMyProcedureRef(dcInstance, inputVars));
}
;

const inactivateMyProcedureRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return mutationRef(dcInstance, 'InactivateMyProcedure', inputVars);
}
inactivateMyProcedureRef.operationName = 'InactivateMyProcedure';
exports.inactivateMyProcedureRef = inactivateMyProcedureRef;

exports.inactivateMyProcedure = function inactivateMyProcedure(dcOrVars, vars) {
  const { dc: dcInstance, vars: inputVars } = validateArgs(connectorConfig, dcOrVars, vars, true);
  return executeMutation(inactivateMyProcedureRef(dcInstance, inputVars));
}
;

const getMyContextRef = (dc) => {
  const { dc: dcInstance} = validateArgs(connectorConfig, dc, undefined);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'GetMyContext');
}
getMyContextRef.operationName = 'GetMyContext';
exports.getMyContextRef = getMyContextRef;

exports.getMyContext = function getMyContext(dcOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrOptions, options, undefined,false, false);
  return executeQuery(getMyContextRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listMyPatientsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyPatients', inputVars);
}
listMyPatientsRef.operationName = 'ListMyPatients';
exports.listMyPatientsRef = listMyPatientsRef;

exports.listMyPatients = function listMyPatients(dcOrVars, varsOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listMyPatientsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listMyDentistsRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyDentists', inputVars);
}
listMyDentistsRef.operationName = 'ListMyDentists';
exports.listMyDentistsRef = listMyDentistsRef;

exports.listMyDentists = function listMyDentists(dcOrVars, varsOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listMyDentistsRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;

const listMyProceduresRef = (dcOrVars, vars) => {
  const { dc: dcInstance, vars: inputVars} = validateArgs(connectorConfig, dcOrVars, vars, true);
  dcInstance._useGeneratedSdk();
  return queryRef(dcInstance, 'ListMyProcedures', inputVars);
}
listMyProceduresRef.operationName = 'ListMyProcedures';
exports.listMyProceduresRef = listMyProceduresRef;

exports.listMyProcedures = function listMyProcedures(dcOrVars, varsOrOptions, options) {

  const { dc: dcInstance, vars: inputVars, options: inputOpts } = validateArgsWithOptions(connectorConfig, dcOrVars, varsOrOptions, options, true, true);
  return executeQuery(listMyProceduresRef(dcInstance, inputVars), inputOpts && { fetchPolicy: inputOpts.fetchPolicy });
}
;
