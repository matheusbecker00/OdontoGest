const PLANS = {
  starter: {
    id: "starter",
    name: "Starter",
    value: 49.9,
    description:
      "Agenda, cadastros essenciais, pacientes, procedimentos e suporte por email.",
  },
  pro: {
    id: "pro",
    name: "Pro",
    value: 49.9,
    description:
      "Plano promocional com financeiro, indicadores, equipe com permissoes e suporte prioritario.",
  },
  enterprise: {
    id: "enterprise",
    name: "Enterprise",
    value: null,
    description: "Plano sob consulta para operacoes maiores.",
  },
};

function getPlan(planId) {
  const plan = PLANS[String(planId || "").toLowerCase()];
  if (!plan || plan.value === null) return null;
  return plan;
}

module.exports = { PLANS, getPlan };
