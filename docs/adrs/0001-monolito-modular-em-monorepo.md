# ADR 0001 — Monólito modular em monorepo

- Estado: aceita
- Data: 2026-07-16

## Contexto

O produto precisa de frontend Angular, API NestJS, transações financeiras e uma
equipe inicial pequena. Microserviços aumentariam deploys, observabilidade, filas,
consistência distribuída e resposta a incidentes antes de existir carga que os
justifique.

## Decisão

Manter `apps/web` e `apps/api` no mesmo monorepo, com deploys independentes. A API
é um monólito modular: cada domínio tem módulos, casos de uso, entidades e portas
próprios. Acesso cruzado a tabelas ou imports internos de outro módulo é proibido.
Integrações externas ficam atrás de interfaces.

## Consequências

- Transações e testes de ponta a ponta são mais simples.
- Contratos e mudanças coordenadas continuam rastreáveis em um commit.
- Um defeito pode afetar mais domínios; limites e testes de arquitetura são
  obrigatórios.
- Módulos com escala ou risco operacional próprio poderão ser extraídos quando
  métricas justificarem.
