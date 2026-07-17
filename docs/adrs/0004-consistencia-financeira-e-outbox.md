# ADR 0004 — Consistência financeira, idempotência e outbox

- Estado: aceita
- Data: 2026-07-16

## Contexto

Vendas, parcelas, pagamentos, estornos e webhooks podem ser repetidos por duplo
clique, timeout ou retry. E-mail e provedor de cobrança não participam de uma
transação PostgreSQL.

## Decisão

Operações financeiras usam transação serializável quando necessário, constraints
de unicidade e chaves de idempotência com escopo de clínica/operação. Registros
confirmados são imutáveis; correção ocorre por reversão vinculada. Eventos para
fila são gravados em outbox na mesma transação e publicados posteriormente.
Webhooks autenticados são persistidos antes do processamento e deduplicados pelo
ID do provedor.

## Consequências

- Retries seguros exigem armazenar resultado e hash semântico da requisição.
- Workers precisam ser idempotentes e tolerar entrega pelo menos uma vez.
- Reconciliação periódica com o provedor continua necessária.
- O financeiro da clínica e a assinatura SaaS usam módulos e tabelas separados.
