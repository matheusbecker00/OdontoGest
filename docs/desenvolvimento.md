# Desenvolvimento local

## Requisitos

- Node.js 24.15 ou superior;
- Corepack e pnpm 11.13.1, conforme `packageManager`;
- Docker Compose para PostgreSQL 18 e Redis 8.

## Configuração

1. Copie `.env.example` para `.env`.
2. Substitua todos os placeholders por valores aleatórios exclusivos do ambiente.
3. Mantenha `DATABASE_URL` no papel `odontogest_app` e
   `MIGRATION_DATABASE_URL` no proprietário `odontogest_owner`.
4. Não versione `.env`, tokens, senhas ou saídas de e-mail fake.

Em desenvolvimento HTTP, use `COOKIE_NAME=odontogest_refresh` e
`COOKIE_SECURE=false`. Em produção, a validação exige cookie seguro com prefixo
`__Secure-`.

## Bootstrap

```bash
corepack enable
corepack install
pnpm install --frozen-lockfile
docker compose up -d
pnpm db:migrate:deploy
pnpm db:seed
pnpm dev
```

O proxy de desenvolvimento do Angular encaminha `/api` para a API local.

## Comandos úteis

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm db:validate
pnpm db:generate
pnpm openapi:generate
```

`pnpm openapi:generate` recompila a API, atualiza a especificação e regenera o
pacote de contratos. Mudanças nesses dois arquivos devem acompanhar a alteração
do endpoint.

## Testes E2E

O comando `pnpm test:e2e`:

1. aplica migrations com `MIGRATION_DATABASE_URL`;
2. executa o seed de papéis e permissões;
3. cria ou atualiza um papel `NOBYPASSRLS` de teste;
4. executa a API com `DATABASE_URL`;
5. limpa somente dados fictícios criados pela suíte.

Variáveis adicionais obrigatórias:

- `TEST_DB_APP_USER`, normalmente `odontogest_test_app`;
- `TEST_DB_APP_PASSWORD`, aleatória e com no mínimo 16 caracteres.

`TEST_DATABASE_RUNTIME_ROLE` existe apenas para o PostgreSQL efêmero local do
Prisma, cujo proxy autentica conexões como proprietário. A validação rejeita essa
variável fora de `NODE_ENV=test`; ela não é usada no CI com PostgreSQL normal.

## Migrations

- Nunca altere uma migration já aplicada em ambiente compartilhado.
- Use a role proprietária somente para migrations e seed estrutural.
- Revise manualmente SQL de RLS, constraints, grants e funções `SECURITY DEFINER`.
- A API nunca deve iniciar usando a credencial de migração.

## Diagnóstico

- `GET /api/v1/health/live` confirma que o processo responde.
- `GET /api/v1/health/ready` exige banco e Redis disponíveis.
- Logs são JSON e usam `x-request-id`; cabeçalhos de autenticação, cookies,
  senhas, tokens e campos pessoais configurados são redigidos.
