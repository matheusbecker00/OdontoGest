# Roadmap detalhado

O roadmap é sequencial por gates, não uma promessa de datas. Cada fase começa
somente após a anterior passar em lint, typecheck, testes e build aplicáveis, além
de revisão de migrações e riscos. Segurança, privacidade, observabilidade e
documentação são critérios contínuos, não uma etapa final.

## Fase 0 — Análise e arquitetura

### Entregas

- inspeção visual do Scaleo nos três viewports e áreas autenticadas;
- tokens SCSS sem telas;
- arquitetura, limites de módulos e fluxos críticos;
- modelo lógico de dados, constraints e estratégia de tenant;
- modelo de ameaças e inventário inicial;
- matriz de permissões;
- ADRs, roadmap e backlog.

### Gate de saída

- escopo do MVP e exclusões aprovados;
- decisão sobre monólito modular e RLS aceita;
- dúvidas de negócio de alta criticidade registradas;
- Markdown e SCSS validados;
- autorização explícita para iniciar a Fase 1.

## Fase 1 — Fundação segura

Status em 16 de julho de 2026: implementada e validada. A Fase 2 foi autorizada
e iniciada pelo cadastro seguro de pacientes.

### 1.1 Monorepo e qualidade

- Inicializar pnpm workspace, `apps/web`, `apps/api` e `packages/contracts`.
- Pin de runtime/toolchain, lockfile e política de atualização.
- TypeScript strict, ESLint sem `any` implícito, Prettier e testes.
- Convenções de commit/migração e checks de fronteira de módulos.
- CI: install limpo, lint, typecheck, testes, build, SCA, secret scan e CodeQL.

### 1.2 Infraestrutura local

- Docker Compose com PostgreSQL e Redis, health checks e volumes de dev.
- Configuração validada por schema e `.env.example` sem segredo.
- Prisma baseline, role de runtime e role de migração.
- Migração para extensões, RLS e helpers de tenant.

### 1.3 API e observabilidade mínima

- `/api/v1`, ValidationPipe estrito, filtro de erros e request ID.
- Helmet/headers, CORS allowlist, limite de body e OpenAPI condicionado.
- Logger JSON com redaction testada; liveness e readiness.

### 1.4 Identidade e sessão

- Cadastro de usuário, verificação de e-mail, login, logout, reset e logout global.
- Argon2id, tokens com hash, refresh rotation/family e detecção de replay.
- Rate limit Redis, atraso progressivo e respostas anti-enumeração.
- Provedor fake de e-mail em dev/test.

### 1.5 Tenant, RBAC e auditoria

- Clinic, Membership, Role, Permission e clínica ativa.
- RequestContext imutável, tenant repository e RLS fail-closed.
- AuthorizationGuard, permission decorator e versão de autorização.
- Auditoria inicial de auth, membership, falhas e configurações críticas.

### Testes/gate

- unitários e integração com PostgreSQL/Redis reais;
- refresh normal, concorrente, replay, revogação e expiração;
- teste direto de RLS e isolamento A/B;
- matriz mínima de papel e revogação em sessão ativa;
- headers, CORS, body limit, erro sem stack e redaction;
- lint, typecheck, testes e builds verdes em CI.

## Fase 2 — Clínica e cadastros

### 2.1 Onboarding transacional

- `/cadastro`, verificação, trial e aceite versionado.
- Transação única para User, Clinic, OWNER membership, settings, trial e outbox.
- Compensação não substitui atomicidade do banco.

### 2.2 Shell e design system

- App shell responsivo, sidebar/drawer, navbar e headers.
- Cards, badges, tabela, estados loading/empty/error e dialog.
- Tema Material alinhado aos tokens; acessibilidade e navegação por teclado.

### 2.3 Administração

- Configurações da clínica, usuários, convites e papéis permitidos.
- Sessões ativas e logout de dispositivos.
- Estado/limites do trial visíveis sem integrar produção.

### 2.4 Cadastros

- Pacientes com busca, filtros, paginação, edição, inativação e resumo.
- Dentistas, CRO, vínculo de usuário, horários e intervalos.
- Procedimentos, categoria, preço em centavos, duração e status.
- Export inicial autorizado com worker fake/storage local de desenvolvimento.

### Testes/gate

- onboarding falha sem deixar clínica parcial;
- CPF/CNPJ e telefone validados no servidor;
- CRUDs rejeitam IDs de outro tenant, inclusive relações aninhadas;
- permissões por papel e formulários acessíveis;
- E2E cadastro → e-mail fake → login → três cadastros;
- builds desktop/mobile sem overflow horizontal.

## Fase 3 — Agenda

### Entregas

- visualizações dia, semana, lista e por dentista;
- criação, edição, confirmação, atendimento, conclusão, cancelamento, falta e
  reagendamento;
- disponibilidade, intervalo e bloqueio;
- histórico operacional e auditoria;
- filtros por dentista/status/período e timezone consistente;
- constraint de exclusão PostgreSQL com erro de conflito amigável.

### Testes/gate

- transições válidas/inválidas por papel;
- cancelado deixa de ocupar horário;
- limite de início/fim e mudança de fuso;
- duas requisições concorrentes: exatamente uma cria a consulta;
- cross-tenant em paciente, dentista, procedimento, bloqueio e consulta;
- E2E agendamento e bloqueio de conflito.

## Fase 4 — Tratamentos e financeiro da clínica

### 4.1 Orçamento e venda

- rascunho, itens, desconto, aprovação, cancelamento e histórico;
- snapshots de preço/descrição; cálculo server-side;
- geração de parcelas por regra explícita de datas e arredondamento.

### 4.2 Recebíveis e pagamentos

- contas abertas, vencidas, parciais, pagas e canceladas;
- registro idempotente, pagamento parcial e métodos suportados;
- estorno append-only com motivo, ator e confirmação contextual;
- status financeiro calculado e consultas por paciente/período.

### 4.3 Relatórios básicos

- recebimentos, aberto/atrasado, inadimplentes e fluxo de caixa básico;
- agregações no backend, paginação e export controlado.

### Testes/gate

- totais adulterados pelo navegador são ignorados/rejeitados;
- rollback integral em falha de venda/parcela/auditoria;
- idempotency key igual/diferente, concorrência e duplicate payment;
- estorno nunca supera pagamento; saldo e status reconciliam;
- cross-tenant em toda relação financeira;
- E2E venda → parcelas → pagamento → status do paciente → estorno.

## Fase 5 — Assinatura do SaaS

### 5.1 Planos e limites

- TRIAL, BASIC e PRO versionados no banco;
- feature catalog e usage counters no backend;
- guard de limite e modo somente leitura com grace period.

### 5.2 Adapter Mercado Pago sandbox

- `BillingProvider` e implementação sandbox;
- checkout hospedado, customer/subscription e cancel/update/get;
- credenciais e URLs por ambiente; nenhum dado de cartão no OdontoGest.

### 5.3 Webhooks e reconciliação

- endpoint mínimo, assinatura oficial, persistência/deduplicação e resposta rápida;
- worker idempotente, ordem de estados, retry/DLQ e alertas;
- reconciliação agendada server-to-server;
- histórico e tela de assinatura.

### Testes/gate

- sandbox exclusivamente; produção tecnicamente bloqueada por configuração;
- assinatura válida/inválida, evento duplicado, fora de ordem e retry;
- redirect não ativa plano;
- limite não confia em payload do frontend;
- inadimplência entra em tolerância/read-only sem excluir dados;
- cobrança e export continuam acessíveis;
- E2E sandbox aprovado antes de qualquer credencial de produção.

## Fase 6 — Dashboard, relatórios e polimento

### Entregas

- KPIs agregados por API: agenda, pacientes e financeiro;
- próximas consultas, atrasos, procedimentos e agenda por dentista;
- relatórios avançados conforme plano;
- acessibilidade WCAG testada, performance, responsividade e mensagens;
- OpenTelemetry/Sentry via adapters redigidos; métricas, filas e alertas;
- política/termos integrados após revisão jurídica;
- fluxos de privacidade e retenção operacionais.

### Testes/gate

- dashboard não carrega coleções completas;
- queries medidas com dataset sintético e planos revisados;
- axe/teclado/contraste e viewports obrigatórios;
- logs/telemetria passam em scanner canário;
- carga, rate limit e degradação de provedores testados.

## Fase 7 — Produção

### Entregas

- ambientes Staging/Production isolados e infraestrutura como código quando
  suportada;
- banco/Redis gerenciados, pool, TLS, backups e PITR configurados;
- teste real de restore e runbook de incidente;
- rotação de segredos, menor privilégio e acesso just-in-time;
- pentest/revisão ASVS proporcional, correção de achados críticos/altos;
- domínio, proxy seguro, CSP/HSTS e monitoramento;
- checklist de lançamento, rollback e plantão inicial.

### Gate de lançamento

- todos os critérios funcionais do MVP demonstrados em Staging;
- zero segredo no Git e zero dado real em teste/demo;
- tenant isolation e fluxos financeiros sem falha crítica;
- billing sandbox reconciliado; produção habilitada por mudança revisada;
- backup/restore evidenciado, não apenas documentado;
- riscos residuais aceitos formalmente por responsáveis;
- textos jurídicos aprovados; nenhuma alegação ampla de conformidade sem auditoria.

## Dependências de decisão de produto

Precisam ser fechadas antes da fase indicada:

| Decisão                                     | Prazo máximo     | Impacto                          |
| ------------------------------------------- | ---------------- | -------------------------------- |
| Acesso de DENTIST a pacientes não agendados | início da Fase 2 | RBAC e privacidade               |
| Regras de arredondamento/parcelamento       | início da Fase 4 | invariantes financeiras          |
| Cancelamento após pagamento                 | início da Fase 4 | estornos e UX                    |
| Limites exatos BASIC/PRO                    | início da Fase 5 | plano/usage                      |
| Região e provedores                         | Fase 6           | privacidade, latência e contrato |
| Retenção por categoria                      | Fase 6           | workflow LGPD e backup           |
| Processo de suporte privilegiado            | Fase 6           | auditoria e incidente            |
