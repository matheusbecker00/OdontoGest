# Firebase Spark e Vercel Hobby

## Estado atual

O schema da fundação e o conector administrativo estão versionados. O SDK é
gerado por `pnpm firebase:sdk:generate`. Nenhum projeto remoto foi criado ou
implantado ainda, pois o Firebase CLI precisa ser autenticado pelo proprietário.

## 1. Criar e associar o projeto Firebase

1. Crie um projeto no plano Spark no Firebase Console.
2. Em Authentication, habilite apenas **E-mail/senha** nesta etapa.
3. No terminal, autentique e associe o projeto:

```bash
pnpm exec firebase login
pnpm exec firebase use --add
```

Escolha um alias explícito, como `development`. Não substitua o projeto demo por
um ID de produção em testes automatizados.

## 2. Provisionar SQL Connect

O serviço usa `southamerica-east1`, banco `odontogest` e instância
`odontogest-spark`, conforme `dataconnect/dataconnect.yaml`.

Antes do primeiro deploy, revise no console se o projeto ainda é elegível ao
trial Spark de 90 dias. Depois execute:

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
