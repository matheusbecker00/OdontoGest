# ADR 0002 — Multitenancy em schema compartilhado

- Estado: aceita
- Data: 2026-07-16

## Contexto

O MVP precisa atender várias clínicas com custo operacional previsível e impedir
acesso cruzado. Um banco ou schema por clínica aumentaria provisionamento,
migrações e restore antes da escala necessária.

## Decisão

Usar PostgreSQL compartilhado e `clinicId` obrigatório em toda entidade tenant.
Aplicar quatro camadas: contexto autenticado imutável, repositories tenant-aware,
filtro explícito nas queries e Row-Level Security. A role de runtime não terá
`BYPASSRLS`. Unicidades e índices começam por `clinicId`.

Entidades globais são uma allowlist documentada. O valor de clínica enviado ao
seletor é apenas candidato e precisa ser validado contra membership antes de virar
contexto de sessão.

## Consequências

- Custo e migração são simples no começo.
- Um erro de escopo encontra barreira adicional no banco.
- Toda operação tenant precisa de transação/contexto RLS corretamente configurado.
- Restore isolado por clínica não é trivial e exigirá procedimento específico.
- Testes cross-tenant são gate obrigatório de CI.
