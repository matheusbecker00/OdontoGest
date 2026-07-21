const { upsertClinicSubscription } = require("@odontogest/dataconnect-admin");

function nullableString(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function timestampFromAsaasDate(value) {
  if (!value || typeof value !== "string") return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return `${value}T23:59:59.000Z`;
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

function timestampFromInput(value) {
  if (value instanceof Date) return value.toISOString();
  if (value && typeof value.toDate === "function")
    return value.toDate().toISOString();
  return timestampFromAsaasDate(value);
}

async function syncClinicSubscription(input) {
  await upsertClinicSubscription({
    clinicId: input.clinicId,
    status: input.status,
    planId: nullableString(input.planId),
    planName: nullableString(input.planName),
    provider: nullableString(input.provider),
    providerSubscriptionId: nullableString(input.providerSubscriptionId),
    checkoutUrl: nullableString(input.checkoutUrl),
    currentPeriodEnd: timestampFromInput(input.currentPeriodEnd),
  });
}

module.exports = { syncClinicSubscription, timestampFromAsaasDate };
