# Validação da Fase 1

Data da execução local: 16 de julho de 2026.

## Ambiente

- Windows, Node.js 24.18.0 e pnpm 11.13.1 via Corepack;
- PostgreSQL 18 real fornecido pelo servidor local efêmero do Prisma;
- papel de teste `NOBYPASSRLS` aplicado com `SET LOCAL ROLE` devido ao proxy local;
- store Redis em memória nos E2E locais; o workflow de CI usa Redis 8 real;
- Docker CLI indisponível neste host, portanto o Compose será exercitado pelo CI.

## Evidências executadas

- três migrations da fundação, RLS reforçada e privilégios aplicadas;
- seed idempotente de cinco roles e permissões executado;
- testes unitários da API: 4 arquivos, 8 testes aprovados;
- testes web: 4 arquivos, 8 testes aprovados;
- E2E da API: 3 cenários aprovados;
- lint e typecheck isolados de API e web aprovados;
- build Angular de produção aprovado;
- geração de OpenAPI e contratos aprovada.

Os E2E cobrem health checks, cadastro, verificação, login, sessões, refresh
rotation, concorrência, replay, revogação de família, reset de senha, headers,
origem inválida, RBAC com mudança de role em sessão ativa, privilégios mínimos e
leituras RLS entre tenants A/B, inclusive contexto adulterado.

## Validação final do workspace

Os resultados consolidados de `format:check`, `lint`, `typecheck`, `test`, `build`,
`db:validate`, geração de contrato e peers devem permanecer verdes no gate de CI.

## Limitações da evidência local

- o workflow GitHub Actions foi criado, mas não pode ser executado sem publicar o
  repositório em um runner GitHub;
- o Compose não foi iniciado neste host por ausência do Docker;
- não foram realizados pentest, teste de carga, restore de backup ou validação
  jurídica;
- nenhum dado real ou credencial de produção foi usado.

`pnpm audit --audit-level high` foi aprovado. Permanece um aviso de severidade
baixa no `esbuild` transitivo usado por ferramentas de desenvolvimento no Windows;
o salto para a linha 0.28 não foi forçado sobre Angular/tsx sem compatibilidade
declarada. O servidor de desenvolvimento deve permanecer restrito a localhost.
