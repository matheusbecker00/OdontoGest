const admin = require("firebase-admin");

function credentialFromEnvironment() {
  const rawJson = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (rawJson) {
    return admin.credential.cert(JSON.parse(rawJson));
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n");
  if (projectId && clientEmail && privateKey) {
    return admin.credential.cert({ projectId, clientEmail, privateKey });
  }

  return admin.credential.applicationDefault();
}

function getAdminApp() {
  if (admin.apps.length > 0) return admin.apps[0];
  return admin.initializeApp({ credential: credentialFromEnvironment() });
}

async function verifyBearerToken(request) {
  const authorization =
    request.headers.authorization || request.headers.Authorization;
  const token =
    typeof authorization === "string"
      ? authorization.replace(/^Bearer\s+/i, "")
      : "";
  if (!token) {
    const error = new Error("Token Firebase ausente.");
    error.statusCode = 401;
    throw error;
  }
  return getAdminApp().auth().verifyIdToken(token);
}

function firestore() {
  return getAdminApp().firestore();
}

module.exports = { firestore, verifyBearerToken };
