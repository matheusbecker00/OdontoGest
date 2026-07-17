# Firebase Spark e Vercel Hobby

## Estado atual

O projeto Firebase `odongest` está associado ao repositório e o aplicativo Web
`odontogest-web` está registrado. O serviço SQL Connect `odontogest`, seu schema
e o conector `api` estão implantados em `southamerica-east1`. A instância
`odontogest-spark` foi solicitada no trial sem custo e pode levar alguns minutos
para concluir o provisionamento.

O Authentication por e-mail/senha ainda precisa ser habilitado pelo proprietário
no Firebase Console.

## 1. Criar e associar o projeto Firebase

Para reproduzir a associação em outra estação, autentique e selecione o projeto:

```bash
pnpm exec firebase login
pnpm exec firebase use odongest
```

Em Authentication, habilite apenas **E-mail/senha** nesta etapa. Os scripts de
emulador continuam usando explicitamente `demo-odontogest`, para que testes
locais não alcancem recursos remotos por engano.

## 2. Provisionar SQL Connect

O serviço usa `southamerica-east1`, banco `odontogest` e instância
`odontogest-spark`, conforme `dataconnect/dataconnect.yaml`.

Para gerar novamente o SDK ou publicar uma alteração revisada, execute:

```bash
pnpm firebase:sdk:generate
pnpm exec firebase deploy --only dataconnect
```

Não use `--force` em produção. Alterações destrutivas devem ser revisadas no diff
de schema antes da migração.

## 3. Desenvolvimento local

```bash
pnpm firebase:emulators
```

Serviços locais:

- Authentication: `127.0.0.1:9099`;
- SQL Connect: `127.0.0.1:9399`;
- Emulator UI: `127.0.0.1:4000`.

O prefixo `demo-` garante que testes não tentem acessar recursos reais caso um
emulador esteja indisponível.

## 4. Variáveis da API na Vercel

Configure somente no projeto da API:

- `FIREBASE_PROJECT_ID`;
- `FIREBASE_CLIENT_EMAIL`;
- `FIREBASE_PRIVATE_KEY`;
- `APP_ORIGINS` com a URL exata da aplicação web;
- `REDIS_URL` quando o rate limit distribuído for ativado.

Nunca use a credencial do Admin SDK no Angular. A configuração Web do Firebase
não concede acesso administrativo, mas deve apontar para o mesmo projeto.

## 5. Projetos Vercel

Crie dois projetos Hobby ligados ao mesmo repositório:

| Projeto          | Root Directory | Framework |
| ---------------- | -------------- | --------- |
| `odontogest-web` | `apps/web`     | Angular   |
| `odontogest-api` | `apps/api`     | NestJS    |

Cada pasta contém um `vercel.json`. Depois do primeiro deploy, defina a URL da
API no frontend e a origem do frontend na allowlist da API.

O plano Hobby só pode ser usado enquanto o ambiente for pessoal e não
comercial. Antes de atender clínicas pagantes, é obrigatório revisar custos,
subir a Vercel para Pro e sair do trial Spark do SQL Connect.

## Checklist antes do primeiro deploy

- Firebase CLI autenticado na conta correta;
- projeto continua no Spark e elegível ao trial;
- Authentication e-mail/senha habilitado;
- nenhum segredo presente no Git;
- SDK administrativo regenerado após qualquer mudança `.gql`;
- lint, tipos, testes e build verdes;
- domínios de preview não adicionados indiscriminadamente ao CORS;
- dados de teste exclusivamente fictícios.
