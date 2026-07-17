# Backlog inicial

Priorização: **P0** bloqueia segurança/funcionamento do MVP; **P1** necessário para
lançamento; **P2** evolução pós-baseline. Os itens têm critério verificável e não
representam funcionalidade já implementada.

## Fase 1 — Fundação

| ID    | Pri. | Item                   | Critério de aceite resumido                                |
| ----- | :--: | ---------------------- | ---------------------------------------------------------- |
| F1-01 |  P0  | Bootstrap do workspace | install limpo, lint/typecheck/test/build em CI             |
| F1-02 |  P0  | PostgreSQL/Redis local | Compose saudável, persistência e reset de dev documentados |
| F1-03 |  P0  | Config segura          | app falha ao iniciar com variável ausente/inválida         |
| F1-04 |  P0  | Prisma e migrações     | deploy/review de migração e role runtime separada          |
| F1-05 |  P0  | Request ID/erros       | resposta estável, sem stack em produção                    |
| F1-06 |  P0  | Redaction de logs      | canários de senha/token/CPF não aparecem                   |
| F1-07 |  P0  | Cadastro e verificação | token hash, uso único, expiração e anti-enumeração         |
| F1-08 |  P0  | Login seguro           | Argon2id, rate limit e atraso progressivo                  |
| F1-09 |  P0  | Refresh rotation       | concorrência e replay revogam corretamente                 |
| F1-10 |  P0  | Logout/global          | sessão atual/todas deixam de renovar                       |
| F1-11 |  P0  | Tenant context         | `clinicId` externo rejeitado e contexto imutável           |
| F1-12 |  P0  | RLS fail-closed        | sem `SET LOCAL`, query tenant retorna nada/erro seguro     |
| F1-13 |  P0  | RBAC backend           | default deny e testes de role positivos/negativos          |
| F1-14 |  P0  | Auditoria inicial      | auth/membership/config geram evento redigido               |
| F1-15 |  P1  | OpenAPI/contracts      | diff controlado e cliente gerado deterministicamente       |
| F1-16 |  P1  | Health/readiness       | dependências com timeout e status correto                  |
| F1-17 |  P1  | Security headers/CORS  | allowlist e testes por ambiente                            |
| F1-18 |  P1  | CI de segurança        | SCA, secret scan e CodeQL bloqueiam achado definido        |

## Fase 2 — Clínica e cadastros

| ID    | Pri. | Item                    | Critério de aceite resumido                     |
| ----- | :--: | ----------------------- | ----------------------------------------------- |
| F2-01 |  P0  | Onboarding transacional | falha não deixa User/Clinic/trial parcial       |
| F2-02 |  P0  | Trial/aceite            | versão e evidência vinculadas à clínica/usuário |
| F2-03 |  P0  | App shell responsivo    | 390/1024/1440 sem overflow do shell             |
| F2-04 |  P1  | Biblioteca de estados   | loading/empty/error/denied/read-only acessíveis |
| F2-05 |  P0  | Pacientes               | CRUD paginado, CPF validado e tenant-safe       |
| F2-06 |  P1  | Export do paciente      | permissão, reauth, arquivo cifrado e expiração  |
| F2-07 |  P0  | Dentistas               | CRO único por UF/clínica e vínculo seguro       |
| F2-08 |  P0  | Procedimentos           | preço centavos, duração e status validados      |
| F2-09 |  P1  | Usuários/convites       | token único, papel permitido e auditoria        |
| F2-10 |  P1  | Sessões visíveis        | lista resumida e revogação de dispositivo       |

## Fase 3 — Agenda

| ID    | Pri. | Item                      | Critério de aceite resumido                   |
| ----- | :--: | ------------------------- | --------------------------------------------- |
| F3-01 |  P0  | Disponibilidade/bloqueios | intervalos válidos e sem relação cross-tenant |
| F3-02 |  P0  | Criar/reagendar           | UTC no banco e fuso correto na UI             |
| F3-03 |  P0  | Constraint de conflito    | concorrência cria exatamente uma consulta     |
| F3-04 |  P0  | Máquina de status         | transições inválidas rejeitadas pelo backend  |
| F3-05 |  P1  | Dia/semana/lista          | filtros e teclado funcionais                  |
| F3-06 |  P1  | Histórico                 | mudança de horário/status rastreável          |
| F3-07 |  P1  | Agenda do dentista        | política de acesso próprio testada            |

## Fase 4 — Tratamentos e financeiro

| ID    | Pri. | Item                   | Critério de aceite resumido                 |
| ----- | :--: | ---------------------- | ------------------------------------------- |
| F4-01 |  P0  | Cálculo de orçamento   | servidor ignora total adulterado            |
| F4-02 |  P0  | Aprovar venda          | venda/itens/parcelas/auditoria atômicos     |
| F4-03 |  P0  | Parcelamento           | soma exata e regra de vencimento testada    |
| F4-04 |  P0  | Receivables/status     | aberto/parcial/pago/vencido reconciliam     |
| F4-05 |  P0  | Pagamento idempotente  | retry não duplica e conflito é detectado    |
| F4-06 |  P0  | Estorno                | append-only, motivo/ator e limite de valor  |
| F4-07 |  P0  | Status do paciente     | calculado, nunca editável                   |
| F4-08 |  P1  | Inadimplentes/fluxo    | agregação backend e paginação               |
| F4-09 |  P1  | Confirmação financeira | mostra paciente, valor, método, data e ação |

## Fase 5 — Billing SaaS

| ID    | Pri. | Item                     | Critério de aceite resumido                     |
| ----- | :--: | ------------------------ | ----------------------------------------------- |
| F5-01 |  P0  | Plan/feature versionados | limites vêm do banco                            |
| F5-02 |  P0  | Usage/limit guard        | plano/quantidade do frontend não são confiados  |
| F5-03 |  P0  | BillingProvider          | fake e Mercado Pago sandbox passam contrato     |
| F5-04 |  P0  | Checkout hospedado       | nenhum dado de cartão toca o sistema            |
| F5-05 |  P0  | Webhook assinado         | assinatura inválida falha e gera métrica segura |
| F5-06 |  P0  | Webhook idempotente      | mesmo ID processa uma vez                       |
| F5-07 |  P0  | Reconciliação            | divergência sandbox é detectada/corrigida       |
| F5-08 |  P0  | Grace/read-only          | escrita bloqueada; cobrança/export liberadas    |
| F5-09 |  P1  | Gestão da assinatura     | plano, uso, próxima cobrança e ações exibidos   |

## Fases 6–7 — Operação e lançamento

| ID    | Pri. | Item                    | Critério de aceite resumido                               |
| ----- | :--: | ----------------------- | --------------------------------------------------------- |
| F6-01 |  P1  | Dashboard agregado      | queries server-side medidas                               |
| F6-02 |  P1  | Acessibilidade          | teclado, contraste e auditoria automatizada/manual        |
| F6-03 |  P1  | Observabilidade         | traces/métricas úteis sem PII                             |
| F6-04 |  P1  | Privacidade operacional | export/correção/retenção ensaiados                        |
| F7-01 |  P0  | Backup/PITR             | restore realizado e evidenciado                           |
| F7-02 |  P0  | Runbook de incidente    | tabletop e contatos aprovados                             |
| F7-03 |  P0  | Staging isolado         | nenhum segredo/dado de produção em demo/staging           |
| F7-04 |  P0  | Revisão de segurança    | achados críticos/altos corrigidos ou lançamento bloqueado |
| F7-05 |  P0  | Billing produção        | habilitação manual revisada após sandbox                  |
| F7-06 |  P1  | Checklist/rollback      | go/no-go, rollback e responsáveis definidos               |

## P2 pós-MVP

- TOTP para OWNER/ADMIN, recovery codes e política de reautenticação adaptativa.
- Papéis customizados por clínica.
- Integrações de mensagens com consentimento e templates.
- Restore seletivo por clínica com tooling e validação de consistência.
- Extração de billing/notifications somente se carga ou isolamento justificar.
- Prontuário e arquivos apenas após projeto dedicado de privacidade, segurança,
  storage, acesso, retenção e requisitos profissionais.
