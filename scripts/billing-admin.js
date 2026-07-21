#!/usr/bin/env node

const { getClinicSubscription } = require("@odontogest/dataconnect-admin");
const { getPlan } = require("../api/_lib/billing-plans");
const {
  syncClinicSubscription,
} = require("../api/_lib/dataconnect-subscription");
const { firestore } = require("../api/_lib/firebase-admin");

const STATUSES = new Set([
  "NONE",
  "CHECKOUT_STARTED",
  "PENDING",
  "ACTIVE",
  "TRIAL",
  "PAST_DUE",
  "CANCELED",
]);

function usage() {
  console.log(`Uso:
  node scripts/billing-admin.js get <clinicId>
  node scripts/billing-admin.js search <email|uid|clinicId>
  node scripts/billing-admin.js set <clinicId> <STATUS> [--plan=pro] [--days=15] [--checkout-url=https://...]
  node scripts/billing-admin.js extend-trial <clinicId> <days>

Exemplos:
  corepack pnpm billing:admin get 00000000-0000-4000-8000-000000000000
  corepack pnpm billing:admin search cliente@clinica.com
  corepack pnpm billing:admin set 00000000-0000-4000-8000-000000000000 ACTIVE --plan=pro
  corepack pnpm billing:admin extend-trial 00000000-0000-4000-8000-000000000000 7`);
}

function parseOptions(args) {
  return Object.fromEntries(
    args
      .filter((arg) => arg.startsWith("--"))
      .map((arg) => {
        const [key, ...value] = arg.slice(2).split("=");
        return [key, value.join("=") || "true"];
      }),
  );
}

function addDays(days) {
  const date = new Date();
  date.setUTCDate(date.getUTCDate() + Number(days));
  return date;
}

function toIso(value) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  if (typeof value.toDate === "function") return value.toDate().toISOString();
  if (typeof value === "string") return value;
  return null;
}

async function getSqlSubscription(clinicId) {
  const result = await getClinicSubscription({ clinicId });
  return result.data.clinicSubscription || null;
}

async function getBilling(clinicId) {
  const db = firestore();
  const [sql, firestoreSnapshot] = await Promise.all([
    getSqlSubscription(clinicId),
    db.doc(`clinics/${clinicId}/billing/current`).get(),
  ]);

  return {
    clinicId,
    sql,
    firestore: firestoreSnapshot.exists ? firestoreSnapshot.data() : null,
  };
}

async function printBilling(clinicId) {
  console.log(JSON.stringify(await getBilling(clinicId), null, 2));
}

async function search(term) {
  const db = firestore();
  const memberQueries = [
    db.collectionGroup("members").where("email", "==", term).limit(20).get(),
    db.collectionGroup("members").where("userId", "==", term).limit(20).get(),
    db.collectionGroup("members").where("clinicId", "==", term).limit(20).get(),
  ];
  const snapshots = await Promise.all(memberQueries);
  const seen = new Set();
  const results = [];
  for (const snapshot of snapshots) {
    for (const document of snapshot.docs) {
      const data = document.data();
      const key = `${data.clinicId}:${data.userId}`;
      if (seen.has(key)) continue;
      seen.add(key);
      results.push({
        clinicId: data.clinicId,
        userId: data.userId,
        name: data.name,
        email: data.email,
        role: data.role,
        status: data.status,
      });
    }
  }
  console.log(JSON.stringify(results, null, 2));
}

async function setStatus(clinicId, status, options = {}) {
  if (!STATUSES.has(status)) {
    throw new Error(`Status invalido: ${status}`);
  }

  const now = new Date().toISOString();
  const current = await getBilling(clinicId);
  const plan = options.plan ? getPlan(options.plan) : null;
  const currentPeriodEnd = options.days ? addDays(options.days) : null;
  const nextState = {
    clinicId,
    status,
    planId:
      plan?.id || current.sql?.planId || current.firestore?.planId || null,
    planName:
      plan?.name ||
      current.sql?.planName ||
      current.firestore?.planName ||
      (status === "TRIAL" ? "Trial gratuito" : "Plano OdontoGest"),
    provider: current.sql?.provider || current.firestore?.provider || null,
    providerSubscriptionId:
      current.sql?.providerSubscriptionId ||
      current.firestore?.providerSubscriptionId ||
      null,
    checkoutUrl:
      options["checkout-url"] ||
      current.sql?.checkoutUrl ||
      current.firestore?.checkoutUrl ||
      null,
    currentPeriodEnd:
      currentPeriodEnd ||
      (status === "ACTIVE"
        ? null
        : current.firestore?.currentPeriodEnd || null),
  };

  await syncClinicSubscription(nextState);
  await firestore()
    .doc(`clinics/${clinicId}/billing/current`)
    .set(
      {
        ...nextState,
        updatedAt: now,
        createdAt: current.firestore?.createdAt || now,
      },
      { merge: true },
    );

  console.log(
    JSON.stringify(
      {
        ok: true,
        ...nextState,
        currentPeriodEnd: toIso(nextState.currentPeriodEnd),
      },
      null,
      2,
    ),
  );
}

async function main() {
  const args = process.argv.slice(2).filter((arg) => arg !== "--");
  const [command, clinicId, value, ...rest] = args;
  if (!command || command === "help" || command === "--help") {
    usage();
    return;
  }

  if (command === "search") {
    if (!clinicId) throw new Error("Informe email, uid ou clinicId.");
    await search(clinicId);
    return;
  }

  if (!clinicId) throw new Error("Informe clinicId.");

  if (command === "get") {
    await printBilling(clinicId);
    return;
  }

  if (command === "set") {
    if (!value) throw new Error("Informe STATUS.");
    await setStatus(clinicId, value.toUpperCase(), parseOptions(rest));
    return;
  }

  if (command === "extend-trial") {
    const days = Number(value || 0);
    if (!Number.isInteger(days) || days <= 0) {
      throw new Error("Informe uma quantidade positiva de dias.");
    }
    await setStatus(clinicId, "TRIAL", { days: String(days) });
    return;
  }

  throw new Error(`Comando desconhecido: ${command}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
