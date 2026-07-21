const { firestore } = require("../_lib/firebase-admin");

function send(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

function clinicAndPlanFromReference(reference) {
  const match = /^clinic:([^:]+):plan:([^:]+)$/.exec(String(reference || ""));
  return match ? { clinicId: match[1], planId: match[2] } : null;
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
    const reference = payment.externalReference || payload.externalReference;
    const context = clinicAndPlanFromReference(reference);
    if (!context) {
      console.warn("billing.webhook.ignored_without_reference", payload.event);
      return send(response, 200, { ignored: true });
    }

    const now = new Date().toISOString();
    await firestore()
      .doc(`clinics/${context.clinicId}/billing/current`)
      .set(
        {
          clinicId: context.clinicId,
          planId: context.planId,
          status: statusFromEvent(payload.event),
          provider: "ASAAS",
          providerPaymentId: payment.id || null,
          providerSubscriptionId: payment.subscription || payment.id || null,
          lastEvent: payload.event || null,
          lastEventId: payload.id || null,
          updatedAt: now,
        },
        { merge: true },
      );

    if (payload.id) {
      await firestore()
        .doc(`billingEvents/${payload.id}`)
        .set(
          {
            provider: "ASAAS",
            event: payload.event || null,
            clinicId: context.clinicId,
            planId: context.planId,
            receivedAt: now,
          },
          { merge: true },
        );
    }

    return send(response, 200, { ok: true });
  } catch (error) {
    console.error("billing.webhook.failed", error);
    return send(response, 500, {
      error: "Nao foi possivel processar webhook.",
    });
  }
};
