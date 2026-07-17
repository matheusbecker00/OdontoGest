# Fase 1 — fundação segura

## Resultado

A Fase 1 entrega uma base executável e testável sem iniciar funcionalidades da
Fase 2. O backend continua um monólito modular, com web e API implantáveis de
forma independente.

## Entregas implementadas

- workspace pnpm com Turbo, lockfile, versões fixadas e política de builds de
  dependências nativas;
- Angular com Material, tokens SCSS, rotas lazy, telas de autenticação,
  `AuthStore`, interceptor coordenado, guards e diretiva de permissão;
- NestJS em `/api/v1`, validação estrita, filtro de erros, request ID, Helmet,
  CORS por allowlist, limites de body e health checks;
- PostgreSQL e Redis em Compose, com volumes, health checks e portas limitadas a
  localhost;
- Prisma 7 com migrations versionadas, seed idempotente e contrato OpenAPI
  versionado;
- cadastro de usuário, confirmação de e-mail, login, refresh, logout, logout
  global, recuperação de senha e listagem de sessões;
- Argon2id, access JWT curto, refresh aleatório com hash, rotação por família e
  revogação quando um token anterior é reutilizado;
- rate limit Redis com falha fechada, atraso progressivo e respostas genéricas
  nos fluxos sujeitos a enumeração;
- `Clinic`, `ClinicSettings`, `Membership`, `Role`, `Permission`, clínica ativa,
  RBAC e revalidação de permissões a cada requisição;
- contexto transacional com `SET LOCAL`, RLS forçada e vínculo obrigatório com
  membership ativa;
- eventos globais de segurança e trilha de auditoria tenant-aware;
- CI com lint, formatação, tipos, testes, build, migrations, E2E, SCA,
  dependency review e secret scan.

## Contrato e superfície HTTP

A especificação fica em `apps/api/openapi/openapi.json`; os tipos gerados ficam
em `packages/contracts/src/generated.ts`.

Endpoints da fundação:

- `/api/v1/health/live` e `/api/v1/health/ready`;
- `/api/v1/auth/signup`, `/email/verify`, `/login`, `/refresh`, `/logout`;
- `/api/v1/auth/logout-all`, `/password/forgot`, `/password/reset`;
- `/api/v1/auth/active-clinic` e `/api/v1/auth/sessions`;
- `/api/v1/tenancy/clinics` e `/api/v1/tenancy/context`;
- `/api/v1/audit`, protegido por `audit.read`.

## Limites mantidos

- O cadastro desta fase cria a identidade; a criação transacional de clínica e
  trial pertence à Fase 2.
- O dashboard atual é apenas uma rota autenticada provisória, não o app shell.
- O provedor de e-mail é fake e mantém mensagens somente em memória.
- A validação bloqueia tecnicamente o provedor fake em produção.
- Não há prontuário, agenda, financeiro, billing ou integração externa.
- Swagger é tecnicamente proibido em produção pela validação de ambiente.

## Próximo gate

A Fase 2 só deve começar após revisão desta entrega e autorização explícita.

## Migração de infraestrutura aprovada

Após a validação original desta fase, a persistência e a identidade foram
redirecionadas para Firebase SQL Connect e Firebase Authentication, com deploy
inicial na Vercel Hobby. O ADR 0006 define a migração incremental. A evidência
Prisma acima continua histórica; a nova fundação só será considerada concluída
quando os mesmos testes de autenticação, RBAC e isolamento passarem nos
emuladores Firebase.
