# Segurança da Fase 1

Este documento registra controles implementados, fronteiras de confiança e
limitações. Ele não substitui revisão jurídica, pentest ou operação segura.

## Identidade e sessão

- senha com Argon2id, 64 MiB, três iterações e paralelismo um;
- access token HS256 de curta duração e mantido somente em memória no Angular;
- refresh token de 256 bits em cookie HttpOnly, SameSite Strict, path restrito e
  `Secure` obrigatório em produção;
- banco armazena apenas SHA-256 do refresh, verificação e reset;
- refresh rotativo com predecessor, substituto, expiração ociosa/absoluta e
  revogação da família em replay ou concorrência;
- logout global incrementa `sessionVersion` e invalida access tokens emitidos;
- mudanças de role/membership são recarregadas em cada requisição autenticada;
- mutações de autenticação verificam `Origin` exato.

## Tenant e autorização

- candidato a clínica ativa é validado contra membership ativa;
- handlers declaram permissões com `@RequirePermissions`; a API é a autoridade;
- transações tenant-aware usam `SET LOCAL app.current_user_id` e
  `app.current_clinic_id`;
- RLS está habilitada e forçada em clínica, membership, configurações, aceite e
  auditoria;
- a função `is_active_member` impede que um `clinicId` de contexto adulterado
  conceda acesso;
- o papel de runtime usa `NOBYPASSRLS`, sem criação de banco, role ou superuser.

## API e dados

- DTOs com whitelist, rejeição de propriedades extras e limite de payload;
- CORS com allowlist e credenciais, Helmet, CSP restritiva e HSTS em produção;
- request ID validado, resposta de erro estável e sem stack;
- rate limit distribuído no Redis falha fechado quando a dependência cai;
- respostas genéricas em cadastro e recuperação reduzem enumeração;
- IP é reduzido antes de auditoria e user agent é limitado;
- logger Pino redige segredos, cookies e campos pessoais listados;
- eventos tenant-aware passam por RLS; eventos de segurança globais não levam
  senha ou token.

## Supply chain e CI

- dependências e runtime fixados por lockfile e `packageManager`;
- scripts nativos de instalação usam allowlist no workspace;
- CI faz instalação imutável, lint, tipos, testes, build e valida contrato;
- `pnpm audit`, dependency review, Gitleaks e Dependabot estão configurados;
- CodeQL depende de GitHub Code Security enquanto o repositório permanecer privado
  e, por isso, não integra o plano gratuito atual.

## Riscos e pendências conhecidos

- o provedor de e-mail é fake; entrega real, SPF/DKIM/DMARC e tratamento de bounce
  ainda não existem, e `NODE_ENV=production` é bloqueado enquanto ele for o único
  provider;
- MFA, passkeys, gestão administrativa de dispositivos e alerta externo de replay
  não pertencem a esta fase;
- não há KMS, cofre de segredos, TLS gerenciado, backup, PITR ou restore testado;
- a auditoria inicial não substitui um pipeline imutável externo;
- dependências transitivas depreciadas e o alerta baixo do `esbuild` de
  desenvolvimento no Windows devem continuar monitorados;
- RLS cobre somente tabelas tenant criadas nesta fase; cada nova tabela exige
  policy e teste negativo antes de merge;
- conformidade LGPD depende de processos, contratos, base legal, retenção e
  revisão jurídica ainda não concluídos.
