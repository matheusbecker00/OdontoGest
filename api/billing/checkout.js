const { createPaymentLink } = require("../_lib/asaas");
const { getPlan } = require("../_lib/billing-plans");
const { syncClinicSubscription } = require("../_lib/dataconnect-subscription");
const { firestore, verifyBearerToken } = require("../_lib/firebase-admin");

function send(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return send(response, 405, { error: "Metodo nao permitido." });
  }

  try {
    const decoded = await verifyBearerToken(request);
    const { clinicId, planId } = request.body || {};
    const plan = getPlan(planId);
    if (!clinicId || typeof clinicId !== "string") {
      return send(response, 400, { error: "clinicId obrigatorio." });
    }
    if (!plan) {
      return send(response, 400, {
        error: "Plano invalido para checkout automatico.",
      });
    }

    const memberRef = firestore().doc(
      `clinics/${clinicId}/members/${decoded.uid}`,
    );
    const memberSnapshot = await memberRef.get();
    const member = memberSnapshot.data();
    if (!memberSnapshot.exists || member?.status !== "ACTIVE") {
      return send(response, 403, {
        error: "Usuario nao pertence a esta clinica.",
      });
    }
    if (!["OWNER", "ADMIN"].includes(member.role)) {
      return send(response, 403, {
        error: "Somente dono ou admin pode contratar plano.",
      });
    }

    const publicUrl =
      process.env.ODONTOGEST_PUBLIC_URL || "https://odontogest-web.vercel.app";
    const successUrl = `${publicUrl.replace(/\/$/, "")}/app/assinatura?checkout=success`;
    const paymentLink = await createPaymentLink({
      name: `OdontoGest ${plan.name}`,
      description: plan.description,
      value: plan.value,
      billingType: "UNDEFINED",
      chargeType: "RECURRENT",
      subscriptionCycle: "MONTHLY",
      dueDateLimitDays: 5,
      maxInstallmentCount: 1,
      externalReference: `clinic:${clinicId}:plan:${plan.id}`,
      callback: {
        successUrl,
        autoRedirect: true,
      },
    });

    const now = new Date().toISOString();
    const db = firestore();
    const billingRef = db.doc(`clinics/${clinicId}/billing/current`);
    const eventId = `checkout-${paymentLink.id || Date.now()}`;
    const eventRef = db.doc(`clinics/${clinicId}/billingEvents/${eventId}`);

    await db.runTransaction(async (transaction) => {
      transaction.set(
        billingRef,
        {
          clinicId,
          planId: plan.id,
          planName: plan.name,
          status: "CHECKOUT_STARTED",
          provider: "ASAAS",
          providerPaymentLinkId: paymentLink.id || null,
          checkoutUrl: paymentLink.url || null,
          lastCheckoutByUserId: decoded.uid,
          updatedAt: now,
          createdAt: now,
        },
        { merge: true },
      );
      transaction.set(
        eventRef,
        {
          id: eventId,
          provider: "ASAAS",
          event: "CHECKOUT_STARTED",
          status: "CHECKOUT_STARTED",
          clinicId,
          planId: plan.id,
          planName: plan.name,
          providerPaymentLinkId: paymentLink.id || null,
          checkoutUrl: paymentLink.url || null,
          actorUserId: decoded.uid,
          receivedAt: now,
        },
        { merge: true },
      );
    });
    await syncClinicSubscription({
      clinicId,
      status: "CHECKOUT_STARTED",
      planId: plan.id,
      planName: plan.name,
      provider: "ASAAS",
      providerSubscriptionId: paymentLink.id || null,
      checkoutUrl: paymentLink.url || null,
      currentPeriodEnd: null,
    });

    return send(response, 200, {
      checkoutUrl: paymentLink.url,
      providerPaymentLinkId: paymentLink.id,
    });
  } catch (error) {
    console.error("billing.checkout.failed", error);
    return send(response, error.statusCode || 500, {
      error: error.message || "Nao foi possivel iniciar assinatura.",
    });
  }
};
