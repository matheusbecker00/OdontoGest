const {
  getClinicSubscription,
  getPrincipal,
} = require("@odontogest/dataconnect-admin");
const { syncClinicSubscription } = require("../_lib/dataconnect-subscription");
const { firestore, verifyBearerToken } = require("../_lib/firebase-admin");

const TRIAL_DAYS = 15;
const PRESERVED_STATUSES = new Set([
  "TRIAL",
  "CHECKOUT_STARTED",
  "PENDING",
  "ACTIVE",
  "PAST_DUE",
  "CANCELED",
]);

function send(response, statusCode, payload) {
  response.status(statusCode).json(payload);
}

function addDays(date, days) {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

function toDate(value) {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value.toDate === "function") return value.toDate();
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
  return null;
}

function stringField(value) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

async function getMembership(uid, clinicId) {
  const result = await getPrincipal({ uid });
  const memberships = result.data.clinicMemberships || [];
  return memberships.find((membership) => membership.clinic.id === clinicId);
}

async function getSqlSubscription(clinicId) {
  const result = await getClinicSubscription({ clinicId });
  return result.data.clinicSubscription || null;
}

function stateFromExisting({ clinicId, firestoreBilling, sqlSubscription }) {
  const status =
    stringField(sqlSubscription?.status) ||
    stringField(firestoreBilling?.status);
  if (!PRESERVED_STATUSES.has(status)) return null;

  return {
    clinicId,
    status,
    planId:
      stringField(sqlSubscription?.planId) ||
      stringField(firestoreBilling?.planId),
    planName:
      stringField(sqlSubscription?.planName) ||
      stringField(firestoreBilling?.planName) ||
      "Plano OdontoGest",
    provider:
      stringField(sqlSubscription?.provider) ||
      stringField(firestoreBilling?.provider),
    providerSubscriptionId:
      stringField(sqlSubscription?.providerSubscriptionId) ||
      stringField(firestoreBilling?.providerSubscriptionId),
    checkoutUrl:
      stringField(sqlSubscription?.checkoutUrl) ||
      stringField(firestoreBilling?.checkoutUrl),
    currentPeriodEnd:
      toDate(sqlSubscription?.currentPeriodEnd) ||
      toDate(firestoreBilling?.currentPeriodEnd),
  };
}

module.exports = async function handler(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return send(response, 405, { error: "Metodo nao permitido." });
  }

  try {
    const decoded = await verifyBearerToken(request);
    const { clinicId } = request.body || {};
    if (!clinicId || typeof clinicId !== "string") {
      return send(response, 400, { error: "clinicId obrigatorio." });
    }

    const membership = await getMembership(decoded.uid, clinicId);
    if (!membership) {
      return send(response, 403, {
        error: "Usuario nao pertence a esta clinica.",
      });
    }

    const now = new Date();
    const nowIso = now.toISOString();
    const db = firestore();
    const billingRef = db.doc(`clinics/${clinicId}/billing/current`);
    const memberRef = db.doc(`clinics/${clinicId}/members/${decoded.uid}`);
    const billingSnapshot = await billingRef.get();
    const firestoreBilling = billingSnapshot.data() || null;
    const sqlSubscription = await getSqlSubscription(clinicId);
    const existingState = stateFromExisting({
      clinicId,
      firestoreBilling,
      sqlSubscription,
    });
    const isNewTrial = existingState === null;
    const nextState = existingState || {
      clinicId,
      status: "TRIAL",
      planId: null,
      planName: "Trial gratuito",
      provider: null,
      providerSubscriptionId: null,
      checkoutUrl: null,
      currentPeriodEnd: addDays(now, TRIAL_DAYS),
    };

    await syncClinicSubscription(nextState);

    await db.runTransaction(async (transaction) => {
      const memberSnapshot = await transaction.get(memberRef);
      transaction.set(
        billingRef,
        {
          ...nextState,
          currentPeriodEnd: nextState.currentPeriodEnd,
          trialDays: nextState.status === "TRIAL" ? TRIAL_DAYS : null,
          updatedAt: nowIso,
          createdAt: firestoreBilling?.createdAt || nowIso,
        },
        { merge: true },
      );
      transaction.set(
        memberRef,
        {
          userId: decoded.uid,
          clinicId,
          name:
            stringField(resultUserName(membership)) ||
            stringField(decoded.name) ||
            stringField(decoded.email) ||
            "Usuario",
          email: stringField(decoded.email) || "",
          accessCode: null,
          role: membership.role.code,
          status: "ACTIVE",
          createdAt: memberSnapshot.data()?.createdAt || nowIso,
          updatedAt: nowIso,
        },
        { merge: true },
      );

      if (isNewTrial) {
        transaction.set(
          db.doc(`clinics/${clinicId}/billingEvents/trial-started`),
          {
            id: "trial-started",
            provider: null,
            event: "TRIAL_STARTED",
            status: "TRIAL",
            clinicId,
            planId: null,
            planName: "Trial gratuito",
            providerPaymentId: null,
            providerSubscriptionId: null,
            providerPaymentLinkId: null,
            checkoutUrl: null,
            actorUserId: decoded.uid,
            receivedAt: nowIso,
          },
          { merge: true },
        );
      }
    });

    return send(response, 200, {
      clinicId,
      status: nextState.status,
      currentPeriodEnd: nextState.currentPeriodEnd?.toISOString() || null,
      created: isNewTrial,
    });
  } catch (error) {
    console.error("billing.trial.failed", error);
    return send(response, error.statusCode || 500, {
      error: error.message || "Nao foi possivel iniciar trial.",
    });
  }
};

function resultUserName(membership) {
  return membership?.user?.name;
}
