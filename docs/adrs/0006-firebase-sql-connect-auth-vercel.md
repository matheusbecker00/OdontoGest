# ADR 0006 — Firebase SQL Connect, Authentication e Vercel Hobby

## Estado

Aceita em 16 de julho de 2026. Substitui a persistência definida no ADR 0002 e
a emissão própria de credenciais definida no ADR 0003. Os princípios de
isolamento, tokens fora de armazenamento persistente no navegador e revogação
de sessão continuam obrigatórios.

## Contexto

O produto será validado inicialmente sem custo recorrente usando o plano Spark
do Firebase e o plano Hobby da Vercel. O modelo permanece relacional e exige
transações, integridade referencial, auditoria e isolamento entre clínicas.

O SQL Connect usa PostgreSQL gerenciado e operações GraphQL pré-definidas. O
Firebase Authentication passa a ser a autoridade de identidade. A Vercel recebe
dois projetos independentes, um para Angular e outro para NestJS.

## Decisão

- SQL Connect é a fonte de verdade do schema relacional.
- Firebase Authentication emite a identidade e gerencia senha, verificação de
  e-mail e recuperação de conta.
- O Angular não acessa SQL Connect diretamente e não persiste tokens em
  `localStorage`.
- O NestJS verifica o ID token do Firebase e resolve membership, clínica ativa,
  role e permissões no servidor.
- O conector `api` usa `@auth(level: NO_ACCESS)` e só pode ser executado pelo
  Admin SDK no backend.
- `clinicId` fornecido pelo cliente nunca é suficiente: toda operação deve
  validar membership ativa antes de acessar dados do tenant.
- Operações compostas usam `@transaction`; autorização e auditoria permanecem
  no backend.
- A região inicial é `southamerica-east1` para manter os dados no Brasil e
  reduzir latência.
- O projeto Firebase versionado usa `demo-odontogest`; o ID real fica associado
  localmente pelo Firebase CLI e não é inferido pelo código.

## Migração

A migração será incremental para preservar a evidência já existente:

1. versionar schema, conector e SDK administrativo gerado;
2. provisionar o projeto Spark e ativar e-mail/senha;
3. substituir a emissão própria de JWT pelo Firebase Authentication;
4. trocar repositórios Prisma pelo SDK administrativo do SQL Connect;
5. remover Prisma, PostgreSQL e sessões legadas somente depois dos testes de
   tenant isolation no emulador;
6. implantar web e API como projetos separados na Vercel.

Durante a transição, a base Prisma é apenas uma referência temporária e não pode
ser usada simultaneamente com SQL Connect em produção.

## Consequências

- o protótipo hospedado pode operar sem cobrança durante o trial do SQL Connect;
- após 90 dias, o SQL Connect deixa de ser gratuito e o banco é arquivado se o
  projeto não migrar para Blaze;
- Vercel Hobby é restrito a uso pessoal e não comercial;
- criação da identidade e onboarding da clínica não formam uma única transação
  distribuída; o fluxo deve ser idempotente e manter usuários sem clínica em
  `PENDING_ONBOARDING` até a transação do tenant terminar;
- credenciais do Admin SDK são segredos exclusivos da API e devem ficar nas
  variáveis protegidas da Vercel.
