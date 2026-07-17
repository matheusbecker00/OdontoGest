import { Client } from 'pg';

function requiredEnvironment(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} é obrigatória para testes E2E.`);
  return value;
}

const ownerUrl = requiredEnvironment('MIGRATION_DATABASE_URL');
const appUser = process.env.TEST_DB_APP_USER ?? 'odontogest_test_app';
const appPassword = requiredEnvironment('TEST_DB_APP_PASSWORD');

if (appPassword.length < 16) {
  throw new Error('TEST_DB_APP_PASSWORD deve ter pelo menos 16 caracteres.');
}
if (!/^[a-z_][a-z0-9_]{2,62}$/.test(appUser)) {
  throw new Error('TEST_DB_APP_USER inválido.');
}

async function formattedStatement(
  client: Client,
  template: string,
  parameters: readonly string[],
): Promise<string> {
  const placeholders = parameters
    .map((_, index) => `$${index + 2}::text`)
    .join(', ');
  const result = await client.query<{ statement: string }>(
    `SELECT format($1, ${placeholders}) AS statement`,
    [template, ...parameters],
  );
  const statement = result.rows[0]?.statement;
  if (!statement)
    throw new Error('Não foi possível preparar a instrução de teste.');
  return statement;
}

async function main(): Promise<void> {
  const client = new Client({ connectionString: ownerUrl });
  await client.connect();
  try {
    const exists = await client.query<{ exists: boolean }>(
      'SELECT EXISTS(SELECT 1 FROM pg_roles WHERE rolname = $1) AS exists',
      [appUser],
    );
    if (!exists.rows[0]?.exists) {
      await client.query(
        await formattedStatement(
          client,
          'CREATE ROLE %I LOGIN PASSWORD %L NOSUPERUSER NOCREATEDB NOCREATEROLE NOINHERIT NOBYPASSRLS',
          [appUser, appPassword],
        ),
      );
    } else {
      await client.query(
        await formattedStatement(
          client,
          'ALTER ROLE %I PASSWORD %L NOBYPASSRLS',
          [appUser, appPassword],
        ),
      );
    }

    const database = await client.query<{ name: string }>(
      'SELECT current_database() AS name',
    );
    const databaseName = database.rows[0]?.name;
    if (!databaseName) throw new Error('Banco de testes não identificado.');

    const grants = [
      ['GRANT CONNECT ON DATABASE %I TO %I', [databaseName, appUser]],
      ['GRANT USAGE ON SCHEMA public TO %I', [appUser]],
      ['GRANT USAGE ON SCHEMA app_private TO %I', [appUser]],
      [
        'GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO %I',
        [appUser],
      ],
      [
        'GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO %I',
        [appUser],
      ],
      ['GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA app_private TO %I', [appUser]],
      ['REVOKE DELETE ON ALL TABLES IN SCHEMA public FROM %I', [appUser]],
      [
        'REVOKE INSERT, UPDATE, DELETE ON TABLE public.roles, public.permissions, public.role_permissions FROM %I',
        [appUser],
      ],
      [
        'REVOKE UPDATE, DELETE ON TABLE public.audit_logs, public.security_events, public.terms_acceptances FROM %I',
        [appUser],
      ],
    ] as const;
    for (const [template, parameters] of grants) {
      await client.query(
        await formattedStatement(client, template, parameters),
      );
    }
  } finally {
    await client.end();
  }
}

void main();
