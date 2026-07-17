# OdontoGest

Micro SaaS para gestão de clínicas odontológicas, projetado como monólito
modular multi-tenant com Angular, NestJS, Firebase Authentication, Firebase SQL
Connect e PostgreSQL gerenciado.

## Estado do projeto

As Fases 0 e 1 foram implementadas e a fundação está migrando para Firebase. A base inclui monorepo, aplicação
web, API versionada, autenticação, sessões rotativas, RBAC, isolamento por RLS,
auditoria inicial, schema SQL Connect, infraestrutura local, contrato OpenAPI e
CI de segurança.

A decisão de usar Firebase Spark e Vercel Hobby está registrada no
[ADR 0006](docs/adrs/0006-firebase-sql-connect-auth-vercel.md). A migração ainda
não está concluída: Prisma e as sessões próprias só serão removidos depois que
os testes equivalentes estiverem verdes no emulador.

O sistema **não está pronto para produção** e não faz afirmação de
conformidade com a LGPD. O onboarding transacional de clínica, cadastros e app
shell pertencem à Fase 2 e não foram antecipados.

Documentação principal:

- [Entrega da Fase 1](docs/fase-1.md)
- [Desenvolvimento local](docs/desenvolvimento.md)
- [Segurança da fundação](docs/seguranca-fase-1.md)
- [Firebase Spark e Vercel Hobby](docs/deploy-firebase-vercel.md)
- [Validação da Fase 1](docs/validacao-fase-1.md)
- [Arquitetura](docs/arquitetura.md) e [modelo de dados](docs/modelo-de-dados.md)
- [Modelo de ameaças](docs/modelo-de-ameacas.md)
- [Matriz de permissões](docs/matriz-de-permissoes.md)
- [Roadmap](docs/roadmap.md) e [backlog](docs/backlog.md)
- [ADRs](docs/adrs/README.md)

## Estrutura

```text
apps/
  web/                 Angular 22, Material, SCSS, standalone e signals
  api/                 NestJS 11, REST /api/v1, Prisma e OpenAPI
packages/
  contracts/           Tipos TypeScript gerados do OpenAPI
  dataconnect-admin-generated/ SDK administrativo gerado do SQL Connect
dataconnect/            Schema relacional e operações exclusivas da API
infra/postgres/init/   Papel restrito de runtime do PostgreSQL
docs/                   Arquitetura, segurança e operação
```

## Início rápido local

Pré-requisitos: Node.js 24.15 ou superior, Corepack e Docker Compose.

```bash
corepack enable
corepack install
pnpm install --frozen-lockfile
pnpm firebase:sdk:generate
```

Copie `.env.example` para `.env`, substitua todos os placeholders por valores
aleatórios locais e depois execute:

```bash
docker compose up -d
pnpm db:migrate:deploy
pnpm db:seed
pnpm dev
```

A web usa `http://localhost:4200`; a API usa `http://localhost:3000/api/v1`.
Swagger só é exposto em `http://localhost:3000/api/docs` quando
`SWAGGER_ENABLED=true` fora de produção.

O seed cria apenas papéis e permissões do sistema. Não cria usuários, clínicas
ou dados demonstrativos.

## Validação

```bash
pnpm format:check
pnpm lint
pnpm typecheck
pnpm test
pnpm build
pnpm db:validate
pnpm openapi:generate
```

Os testes E2E exigem PostgreSQL com uma URL de migração e outra de runtime;
consulte [docs/desenvolvimento.md](docs/desenvolvimento.md). O CI também executa
PostgreSQL e Redis reais, auditoria de dependências, Gitleaks e CodeQL.

## Regras de segurança preservadas

- `clinicId` de negócio vem do contexto autenticado, nunca do cliente.
- A role da aplicação usa `NOBYPASSRLS`; a role de migração é separada.
- Access token fica apenas em memória; refresh token fica em cookie HttpOnly.
- Senhas usam Argon2id; tokens persistidos são armazenados somente como hash.
- Logs redigem credenciais e dados pessoais configurados.
- Seeds e testes usam somente identidades fictícias.
- Mercado Pago e qualquer cobrança real permanecem fora desta fase.
