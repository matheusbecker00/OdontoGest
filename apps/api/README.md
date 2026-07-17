# OdontoGest API

API NestJS da fundação segura. Consulte o [README do workspace](../../README.md),
a [entrega da Fase 1](../../docs/fase-1.md) e o
[guia de desenvolvimento](../../docs/desenvolvimento.md).

```bash
corepack pnpm --filter @odontogest/api dev
corepack pnpm --filter @odontogest/api test
corepack pnpm --filter @odontogest/api build
```

A API usa `/api/v1`; migrations devem rodar com a credencial proprietária e o
processo da aplicação com o papel restrito `NOBYPASSRLS`.
