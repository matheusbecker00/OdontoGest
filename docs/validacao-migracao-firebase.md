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
- projeto remoto `odongest` associado e app Web `odontogest-web` registrado;
- Authentication por e-mail/senha habilitado;
- schema e conector implantados no SQL Connect em `southamerica-east1`;
- instância `odontogest-spark` provisionada no trial sem custo, com o banco
  `odontogest` compatível com o schema implantado.

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

- trocar os repositórios Prisma pelo SDK SQL Connect;
- criar testes equivalentes nos emuladores Auth e SQL Connect;
- vincular os dois projetos Hobby da Vercel;
- repetir a bateria completa e o teste crítico de isolamento entre clínicas.

## Troca de identidade Firebase

O Angular usa o SDK Firebase com persistência em memória. A API valida o ID
token, exige e-mail confirmado, vincula o `firebaseUid` a um usuário já
provisionado e somente então emite a sessão OdontoGest. Uma conta Firebase sem
usuário interno não recebe acesso nem cria clínica automaticamente.

Validações executadas nesta integração:

- schema Prisma validado e SDK SQL Connect regenerado;
- typecheck da API e do Angular aprovado;
- 11 testes unitários da API aprovados;
- 11 testes do Angular aprovados;
- teste E2E de troca de token adicionado, mas não executado localmente porque
  esta estação não possui Docker nem PostgreSQL instalados.

## Onboarding inicial

A rota `/cadastro` cria a identidade diretamente no Firebase e envia à API
somente um ID token. Uma função `SECURITY DEFINER`, com assinatura restrita,
provisiona atomicamente o usuário pendente, a clínica, configurações, membership
`OWNER`, aceites de termos e privacidade e auditoria. Repetir a operação com o mesmo UID
retorna a clínica existente.

O teste E2E dessa transação foi adicionado, incluindo a verificação de
idempotência, mas também depende do PostgreSQL indisponível nesta estação. O
runtime ainda usa Prisma durante a migração; gravar simultaneamente no SQL
Connect foi evitado para não criar duas fontes de verdade.
