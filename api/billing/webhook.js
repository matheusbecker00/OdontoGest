const { firestore } = require("../_lib/firebase-admin");
const { getPlan } = require("../_lib/billing-plans");
const { syncClinicSubscription } = require("../_lib/dataconnect-subscription");

function send(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

function clinicAndPlanFromReference(reference) {
  const match = /^clinic:([^:]+):plan:([^:]+)$/.exec(String(reference || ""));
  return match ? { clinicId: match[1], planId: match[2] } : null;
}

function providerRefId(value) {
  const id = typeof value === "string" ? value.trim() : "";
  return id ? id.replace(/\//g, "_") : null;
}

function providerRefDoc(db, value) {
  const id = providerRefId(value);
  return id ? db.doc(`billingProviderRefs/${id}`) : null;
}

function uniqueStrings(values) {
  return [
    ...new Set(values.filter((value) => typeof value === "string" && value)),
  ];
}

function referenceCandidates(payload, payment) {
  return uniqueStrings([
    payment.externalReference,
    payload.externalReference,
    payload.payment?.externalReference,
    payload.subscription?.externalReference,
    payload.paymentLink?.externalReference,
  ]);
}

function providerIdCandidates(payload, payment) {
  return uniqueStrings([
    payment.paymentLink,
    payment.paymentLinkId,
    payload.paymentLink?.id,
    payload.paymentLink,
    payload.paymentLinkId,
    payment.subscription,
    payload.subscription?.id,
    payload.subscription,
    payment.id,
    payload.payment?.id,
  ]);
}

async function contextFromProviderRefs(db, ids) {
  for (const id of ids) {
    const ref = providerRefDoc(db, id);
    if (!ref) continue;
    const snapshot = await ref.get();
    if (!snapshot.exists) continue;
    const data = snapshot.data() || {};
    if (data.clinicId && data.planId) {
      return {
        clinicId: data.clinicId,
        planId: data.planId,
        planName: data.planName || null,
        checkoutUrl: data.checkoutUrl || null,
        providerPaymentLinkId: data.providerPaymentLinkId || null,
      };
    }
  }
  return null;
}

async function resolveContext(db, payload, payment) {
  for (const reference of referenceCandidates(payload, payment)) {
    const context = clinicAndPlanFromReference(reference);
    if (context) return context;
  }
  return contextFromProviderRefs(db, providerIdCandidates(payload, payment));
}

function statusFromEvent(event) {
  if (event === "PAYMENT_RECEIVED" || event === "PAYMENT_CONFIRMED")
    return "ACTIVE";
  if (event === "PAYMENT_OVERDUE") return "PAST_DUE";
  if (event === "PAYMENT_DELETED" || event === "PAYMENT_REFUNDED")
    return "CANCELED";
  if (event === "SUBSCRIPTION_DELETED" || event === "SUBSCRIPTION_INACTIVATED")
    return "CANCELED";
  return "PENDING";
}

function currentPeriodEndFromPayment(payment) {
  return (
    payment.nextDueDate ||
    payment.dueDate ||
    payment.confirmedDate ||
    payment.paymentDate ||
    null
  );
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return send(response, 405, { error: "Metodo nao permitido." });
  }

  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN;
  if (
    expectedToken &&
    request.headers["asaas-access-token"] !== expectedToken
  ) {
    return send(response, 401, { error: "Webhook nao autorizado." });
  }

  try {
    const payload = request.body || {};
    const payment = payload.payment || payload.subscription || {};
    const db = firestore();
    const context = await resolveContext(db, payload, payment);
    if (!context) {
      console.warn("billing.webhook.ignored_without_reference", {
        event: payload.event,
        providerIds: providerIdCandidates(payload, payment),
      });
      return send(response, 200, { ignored: true });
    }

    const now = new Date().toISOString();
    const nextStatus = statusFromEvent(payload.event);
    const plan = getPlan(context.planId);
    const currentPeriodEnd = currentPeriodEndFromPayment(payment);
    const providerPaymentLinkId =
      payment.paymentLink ||
      payment.paymentLinkId ||
      payload.paymentLink?.id ||
      payload.paymentLink ||
      payload.paymentLinkId ||
      context.providerPaymentLinkId ||
      null;
    const providerSubscriptionId =
      payment.subscription || payload.subscription?.id || payment.id || null;
    const eventId =
      payload.id ||
      `${payload.event || "UNKNOWN"}-${payment.id || payment.subscription || Date.now()}`;
    const billingRef = db.doc(`clinics/${context.clinicId}/billing/current`);
    const clinicEventRef = db.doc(
      `clinics/${context.clinicId}/billingEvents/${eventId}`,
    );
    const globalEventRef = db.doc(`billingEvents/${eventId}`);
    const providerRefs = providerIdCandidates(payload, payment)
      .map((id) => ({ id, ref: providerRefDoc(db, id) }))
      .filter((item) => item.ref);

    await db.runTransaction(async (transaction) => {
      const billingUpdate = {
        clinicId: context.clinicId,
        planId: context.planId,
        status: nextStatus,
        provider: "ASAAS",
        providerPaymentId: payment.id || null,
        providerPaymentLinkId,
        providerSubscriptionId,
        currentPeriodEnd: currentPeriodEnd ? new Date(currentPeriodEnd) : null,
        lastEvent: payload.event || null,
        lastEventId: payload.id || null,
        updatedAt: now,
      };
      if (context.checkoutUrl) billingUpdate.checkoutUrl = context.checkoutUrl;
      transaction.set(billingRef, billingUpdate, { merge: true });

      const eventPayload = {
        id: eventId,
        provider: "ASAAS",
        event: payload.event || null,
        status: nextStatus,
        clinicId: context.clinicId,
        planId: context.planId,
        providerPaymentId: payment.id || null,
        providerPaymentLinkId,
        providerSubscriptionId,
        receivedAt: now,
      };
      transaction.set(clinicEventRef, eventPayload, { merge: true });
      transaction.set(globalEventRef, eventPayload, { merge: true });
      for (const { id, ref } of providerRefs) {
        transaction.set(
          ref,
          {
            id,
            type: "ASAAS_PROVIDER_REFERENCE",
            provider: "ASAAS",
            clinicId: context.clinicId,
            planId: context.planId,
            planName: plan?.name || context.planName || null,
            providerPaymentLinkId,
            providerPaymentId: payment.id || null,
            providerSubscriptionId,
            checkoutUrl: context.checkoutUrl || null,
            updatedAt: now,
          },
          { merge: true },
        );
      }
    });
    await syncClinicSubscription({
      clinicId: context.clinicId,
      status: nextStatus,
      planId: context.planId,
      planName: plan?.name || context.planName || null,
      provider: "ASAAS",
      providerSubscriptionId,
      checkoutUrl: context.checkoutUrl || null,
      currentPeriodEnd,
    });

    return send(response, 200, { ok: true });
  } catch (error) {
    console.error("billing.webhook.failed", error);
    return send(response, 500, {
      error: "Nao foi possivel processar webhook.",
    });
  }
};
