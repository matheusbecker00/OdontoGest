const { validateAdminArgs } = require('firebase-admin/data-connect');

const AuditOutcome = {
  SUCCESS: "SUCCESS",
  DENIED: "DENIED",
  FAILURE: "FAILURE",
}
exports.AuditOutcome = AuditOutcome;

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

