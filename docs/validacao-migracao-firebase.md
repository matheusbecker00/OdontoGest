# Validação do scaffold Firebase e Vercel

Data: 16 de julho de 2026.

## Escopo validado

- Firebase CLI 15.24.0 instalada como dependência de desenvolvimento;
- Firebase JavaScript SDK 12.16.0 e Admin SDK 13.10.0 adicionados;
- schema SQL Connect compilado na região `southamerica-east1`;
- conector administrativo `api` compilado com todas as operações em
  `NO_ACCESS`;
- SDK Node administrativo gerado em
  `packages/dataconnect-admin-generated`;
- SQL Connect Emulator 3.4.16 iniciou com o projeto isolado
  `demo-odontogest`;
- a operação `HealthCheck` respondeu usando o SDK administrativo;
- configurações Vercel adicionadas para Angular e NestJS;
- nenhum projeto remoto ou recurso faturável foi criado.

O emulador encerrou com um aviso `ECONNRESET` do PostgreSQL embutido após o
script já ter terminado com código zero. A consulta respondeu e o comando
`emulators:exec` retornou sucesso; o aviso deve ser acompanhado em novas versões
do emulador, mas não foi ocultado.

## Gate de qualidade

Executados com sucesso após as mudanças:

- `pnpm firebase:sdk:generate`;
- `pnpm format:check`;
- `pnpm lint`;
- `pnpm typecheck`;
- `pnpm test` — 8 testes da API e 8 testes web aprovados;
- `pnpm build` — NestJS e Angular aprovados.

## Pendente antes da troca de runtime

- autenticar o Firebase CLI na conta do proprietário;
- criar ou selecionar o projeto Spark;
- ativar Authentication por e-mail/senha;
- substituir o guard JWT e os repositórios Prisma pelo Firebase Admin e pelo
  SDK SQL Connect;
- criar testes equivalentes nos emuladores Auth e SQL Connect;
- vincular os dois projetos Hobby da Vercel;
- repetir a bateria completa e o teste crítico de isolamento entre clínicas.
