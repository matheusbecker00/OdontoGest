import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient, RoleCode } from '../src/generated/prisma/client';

const databaseUrl =
  process.env.MIGRATION_DATABASE_URL ?? process.env.DATABASE_URL;
if (!databaseUrl)
  throw new Error('MIGRATION_DATABASE_URL ou DATABASE_URL é obrigatória.');

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: databaseUrl }),
});

const permissions = [
  ['dashboard.read', 'Consultar indicadores operacionais', 1],
  ['appointment.read.all', 'Consultar agenda de todos os dentistas', 2],
  ['appointment.read.own', 'Consultar agenda própria', 1],
  ['appointment.create', 'Criar consultas', 2],
  ['appointment.update', 'Editar e reagendar consultas', 2],
  ['appointment.status.manage', 'Gerenciar atendimento e conclusão', 2],
  ['appointment.cancel', 'Cancelar consultas', 2],
  ['appointment.no_show', 'Registrar ausência', 2],
  ['schedule.block.manage', 'Gerenciar bloqueios de agenda', 2],
  ['patient.read', 'Consultar pacientes autorizados', 3],
  ['patient.create', 'Cadastrar pacientes', 3],
  ['patient.update', 'Atualizar pacientes', 3],
  ['patient.inactivate', 'Inativar pacientes', 3],
  ['patient.export', 'Exportar dados de paciente', 4],
  [
    'patient.privacy_request.manage',
    'Gerenciar solicitações de privacidade',
    4,
  ],
  ['dentist.read', 'Consultar dentistas', 1],
  ['dentist.manage', 'Gerenciar dentistas', 3],
  ['procedure.read', 'Consultar procedimentos', 1],
  ['procedure.manage', 'Gerenciar procedimentos', 2],
  ['treatment.read', 'Consultar tratamentos', 2],
  ['treatment.create', 'Criar tratamentos', 2],
  ['treatment.update_draft', 'Editar tratamentos em rascunho', 2],
  ['treatment.approve', 'Aprovar venda de tratamento', 4],
  ['treatment.cancel', 'Cancelar venda de tratamento', 4],
  ['receivable.read', 'Consultar contas a receber', 3],
  ['receivable.manage', 'Gerenciar contas a receber', 4],
  ['payment.create.basic', 'Registrar pagamento básico', 4],
  ['payment.create.partial', 'Registrar pagamento parcial', 4],
  ['payment.reverse', 'Estornar pagamento', 5],
  ['financial_report.read', 'Consultar relatórios financeiros', 3],
  ['clinic_settings.read', 'Consultar configurações da clínica', 2],
  ['clinic_settings.manage', 'Alterar configurações da clínica', 4],
  ['membership.read', 'Consultar usuários da clínica', 3],
  ['membership.invite', 'Convidar usuários', 4],
  ['membership.manage', 'Gerenciar usuários e papéis', 5],
  ['role.read', 'Consultar papéis e permissões', 3],
  ['role.manage', 'Gerenciar papéis customizados', 5],
  ['ownership.transfer', 'Transferir propriedade da clínica', 5],
  ['subscription.read', 'Consultar assinatura do SaaS', 3],
  ['subscription.manage', 'Alterar assinatura do SaaS', 5],
  ['audit.read', 'Consultar trilha de auditoria', 4],
  ['retention_policy.manage', 'Gerenciar política de retenção', 5],
] as const;

const roleMetadata: Record<RoleCode, { name: string; description: string }> = {
  OWNER: { name: 'Proprietário', description: 'Controle completo da clínica' },
  ADMIN: {
    name: 'Administrador',
    description: 'Gestão operacional da clínica',
  },
  DENTIST: { name: 'Dentista', description: 'Atendimento e agenda autorizada' },
  RECEPTIONIST: {
    name: 'Recepção',
    description: 'Agenda e cadastro operacional',
  },
  FINANCE: {
    name: 'Financeiro',
    description: 'Vendas, recebíveis e relatórios',
  },
};

const deniedByRole: Record<RoleCode, ReadonlySet<string>> = {
  OWNER: new Set(),
  ADMIN: new Set([
    'ownership.transfer',
    'role.manage',
    'subscription.manage',
    'retention_policy.manage',
  ]),
  DENTIST: new Set(
    permissions
      .map(([code]) => code)
      .filter(
        (code) =>
          ![
            'dashboard.read',
            'appointment.read.own',
            'appointment.create',
            'appointment.update',
            'appointment.status.manage',
            'appointment.cancel',
            'appointment.no_show',
            'patient.read',
            'patient.update',
            'dentist.read',
            'procedure.read',
            'treatment.read',
            'treatment.create',
            'treatment.update_draft',
            'treatment.approve',
            'receivable.read',
          ].includes(code),
      ),
  ),
  RECEPTIONIST: new Set(
    permissions
      .map(([code]) => code)
      .filter(
        (code) =>
          ![
            'dashboard.read',
            'appointment.read.all',
            'appointment.create',
            'appointment.update',
            'appointment.cancel',
            'appointment.no_show',
            'schedule.block.manage',
            'patient.read',
            'patient.create',
            'patient.update',
            'patient.inactivate',
            'dentist.read',
            'procedure.read',
            'treatment.read',
            'treatment.create',
            'treatment.update_draft',
            'receivable.read',
            'payment.create.basic',
          ].includes(code),
      ),
  ),
  FINANCE: new Set(
    permissions
      .map(([code]) => code)
      .filter(
        (code) =>
          ![
            'dashboard.read',
            'appointment.read.all',
            'patient.read',
            'dentist.read',
            'procedure.read',
            'treatment.read',
            'treatment.create',
            'treatment.update_draft',
            'treatment.approve',
            'treatment.cancel',
            'receivable.read',
            'receivable.manage',
            'payment.create.basic',
            'payment.create.partial',
            'payment.reverse',
            'financial_report.read',
          ].includes(code),
      ),
  ),
};

async function main(): Promise<void> {
  const permissionIds = new Map<string, string>();
  for (const [code, description, riskLevel] of permissions) {
    const permission = await prisma.permission.upsert({
      where: { code },
      update: { description, riskLevel },
      create: { code, description, riskLevel },
      select: { id: true },
    });
    permissionIds.set(code, permission.id);
  }

  for (const code of Object.values(RoleCode)) {
    const metadata = roleMetadata[code];
    const role = await prisma.role.upsert({
      where: { code },
      update: { ...metadata, isSystem: true },
      create: { code, ...metadata, isSystem: true },
      select: { id: true },
    });
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } });
    const allowed = permissions.filter(
      ([permissionCode]) => !deniedByRole[code].has(permissionCode),
    );
    await prisma.rolePermission.createMany({
      data: allowed.map(([permissionCode]) => {
        const permissionId = permissionIds.get(permissionCode);
        if (!permissionId)
          throw new Error(`Permissão não encontrada: ${permissionCode}`);
        return { roleId: role.id, permissionId };
      }),
    });
  }
}

async function run(): Promise<void> {
  try {
    await main();
  } finally {
    await prisma.$disconnect();
  }
}

void run();
