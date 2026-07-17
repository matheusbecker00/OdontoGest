# ADR 0005 — OpenAPI como fonte de contratos

- Estado: aceita
- Data: 2026-07-16

## Contexto

Compartilhar classes NestJS diretamente com Angular acopla validação, decorators e
detalhes internos. Duplicar DTOs manualmente causa divergência.

## Decisão

A API publica OpenAPI versionado para `/api/v1`. O pacote `contracts` contém tipos
e cliente gerados em build controlado. DTOs de entrada do servidor permanecem na
API e fazem validação server-side. O diff da especificação participa do review.

## Consequências

- Frontend recebe tipos sem importar implementação do backend.
- Mudanças incompatíveis ficam visíveis no CI.
- Geração deve ser determinística e o artefato não pode conter segredo nem rotas
  administrativas não publicadas.
