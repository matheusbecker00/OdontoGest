const { validateAdminArgs } = require('firebase-admin/data-connect');

const AuditOutcome = {
  SUCCESS: "SUCCESS",
  DENIED: "DENIED",
  FAILURE: "FAILURE",
}
exports.AuditOutcome = AuditOutcome;

const PatientRegistrationStatus = {
  ACTIVE: "ACTIVE",
  INACTIVE: "INACTIVE",
}
exports.PatientRegistrationStatus = PatientRegistrationStatus;

const SubscriptionStatus = {
  NONE: "NONE",
  CHECKOUT_STARTED: "CHECKOUT_STARTED",
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  TRIAL: "TRIAL",
  PAST_DUE: "PAST_DUE",
  CANCELED: "CANCELED",
}
exports.SubscriptionStatus = SubscriptionStatus;

const UserStatus = {
  PENDING_ONBOARDING: "PENDING_ONBOARDING",
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
  DISABLED: "DISABLED",
}
exports.UserStatus = UserStatus;

const connectorConfig = {
  connector: 'api',
  serviceId: 'odontogest',
  location: 'southamerica-east1'
};
exports.connectorConfig = connectorConfig;

function upsertFirebaseUser(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpsertFirebaseUser', inputVars, inputOpts);
}
exports.upsertFirebaseUser = upsertFirebaseUser;

function insertSecurityEvent(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('InsertSecurityEvent', inputVars, inputOpts);
}
exports.insertSecurityEvent = insertSecurityEvent;

function insertTenantAuditEvent(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('InsertTenantAuditEvent', inputVars, inputOpts);
}
exports.insertTenantAuditEvent = insertTenantAuditEvent;

function upsertClinicSubscription(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpsertClinicSubscription', inputVars, inputOpts);
}
exports.upsertClinicSubscription = upsertClinicSubscription;

function createPatient(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('CreatePatient', inputVars, inputOpts);
}
exports.createPatient = createPatient;

function updatePatient(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpdatePatient', inputVars, inputOpts);
}
exports.updatePatient = updatePatient;

function inactivatePatient(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('InactivatePatient', inputVars, inputOpts);
}
exports.inactivatePatient = inactivatePatient;

function healthCheck(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('HealthCheck', undefined, inputOpts);
}
exports.healthCheck = healthCheck;

function getPrincipal(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetPrincipal', inputVars, inputOpts);
}
exports.getPrincipal = getPrincipal;

function listTenantAuditEvents(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListTenantAuditEvents', inputVars, inputOpts);
}
exports.listTenantAuditEvents = listTenantAuditEvents;

function listPatients(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListPatients', inputVars, inputOpts);
}
exports.listPatients = listPatients;

function getPatient(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetPatient', inputVars, inputOpts);
}
exports.getPatient = getPatient;

