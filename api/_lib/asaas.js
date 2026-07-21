function asaasBaseUrl() {
  const configured = process.env.ASAAS_API_BASE_URL;
  if (configured) return configured.replace(/\/$/, "");
  return process.env.ASAAS_ENVIRONMENT === "production"
    ? "https://api.asaas.com/v3"
    : "https://api-sandbox.asaas.com/v3";
}

async function createPaymentLink(input) {
  const apiKey = process.env.ASAAS_API_KEY;
  if (!apiKey) {
    const error = new Error("ASAAS_API_KEY nao configurada.");
    error.statusCode = 503;
    throw error;
  }

  const response = await fetch(`${asaasBaseUrl()}/paymentLinks`, {
    method: "POST",
    headers: {
      accept: "application/json",
      access_token: apiKey,
      "content-type": "application/json",
    },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message =
      payload?.errors?.[0]?.description ||
      payload?.message ||
      "Nao foi possivel criar o checkout no Asaas.";
    const error = new Error(message);
    error.statusCode = response.status;
    error.payload = payload;
    throw error;
  }
  return payload;
}

module.exports = { createPaymentLink };
