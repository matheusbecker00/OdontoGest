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

async function syncClinicSubscription(input) {
  await upsertClinicSubscription({
    clinicId: input.clinicId,
    status: input.status,
    planId: nullableString(input.planId),
    planName: nullableString(input.planName),
    provider: nullableString(input.provider),
    providerSubscriptionId: nullableString(input.providerSubscriptionId),
    checkoutUrl: nullableString(input.checkoutUrl),
    currentPeriodEnd: timestampFromAsaasDate(input.currentPeriodEnd),
  });
}

module.exports = { syncClinicSubscription, timestampFromAsaasDate };
