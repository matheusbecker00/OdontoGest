# OdontoGest Web

Frontend Angular da fundação segura. Consulte o
[README do workspace](../../README.md) e a
[entrega da Fase 1](../../docs/fase-1.md).

```bash
corepack pnpm --filter @odontogest/web dev
corepack pnpm --filter @odontogest/web test
corepack pnpm --filter @odontogest/web build
```

O access token permanece apenas em memória. A renovação usa cookie HttpOnly e o
proxy local encaminha `/api` para `http://localhost:3000`.
