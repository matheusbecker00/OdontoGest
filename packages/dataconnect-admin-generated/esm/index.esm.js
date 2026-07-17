import { validateAdminArgs } from 'firebase-admin/data-connect';

export const AuditOutcome = {
  SUCCESS: "SUCCESS",
  DENIED: "DENIED",
  FAILURE: "FAILURE",
}

export const UserStatus = {
  PENDING_ONBOARDING: "PENDING_ONBOARDING",
  ACTIVE: "ACTIVE",
  LOCKED: "LOCKED",
  DISABLED: "DISABLED",
}

export const connectorConfig = {
  connector: 'api',
  serviceId: 'odontogest',
  location: 'southamerica-east1'
};

export function upsertFirebaseUser(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('UpsertFirebaseUser', inputVars, inputOpts);
}

export function insertSecurityEvent(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('InsertSecurityEvent', inputVars, inputOpts);
}

export function insertTenantAuditEvent(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeMutation('InsertTenantAuditEvent', inputVars, inputOpts);
}

export function healthCheck(dcOrOptions, options) {
  const { dc: dcInstance, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrOptions, options, undefined);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('HealthCheck', undefined, inputOpts);
}

export function getPrincipal(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('GetPrincipal', inputVars, inputOpts);
}

export function listTenantAuditEvents(dcOrVarsOrOptions, varsOrOptions, options) {
  const { dc: dcInstance, vars: inputVars, options: inputOpts} = validateAdminArgs(connectorConfig, dcOrVarsOrOptions, varsOrOptions, options, true, true);
  dcInstance.useGen(true);
  return dcInstance.executeQuery('ListTenantAuditEvents', inputVars, inputOpts);
}

