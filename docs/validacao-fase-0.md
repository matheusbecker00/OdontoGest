# Validação da Fase 0

Data: 16 de julho de 2026

## Resultado

| Verificação           | Resultado                                 |
| --------------------- | ----------------------------------------- |
| Markdown lint         | 18 arquivos, 0 erros                      |
| Compilação SCSS       | `_tokens.scss` compilado sem erro         |
| Mermaid — arquitetura | 3 diagramas renderizados                  |
| Mermaid — dados       | 1 diagrama renderizado                    |
| Mermaid — ameaças     | 1 diagrama renderizado                    |
| Links locais          | 18 arquivos verificados, sem alvo ausente |
| Capturas obrigatórias | 1440×900, 1024×768 e 390×844 confirmadas  |
| Credencial temporária | não persistida em arquivo textual         |

## Comandos executados

```powershell
npx markdownlint-cli2 "README.md" "docs/**/*.md"
npx sass --no-source-map apps/web/src/styles/_tokens.scss <arquivo-temporario>
npx mmdc -i docs/arquitetura.md -o <arquivo-temporario>
npx mmdc -i docs/modelo-de-dados.md -o <arquivo-temporario>
npx mmdc -i docs/modelo-de-ameacas.md -o <arquivo-temporario>
```

Dimensões de PNG, links relativos e ausência da credencial demonstrativa foram
verificados por scripts de leitura executados no workspace.

## Verificações ainda não aplicáveis

Typecheck, testes automatizados da aplicação e build de Angular/NestJS não foram
executados porque a solicitação limita esta entrega à Fase 0 e ainda não existe
manifesto, fonte TypeScript ou aplicação. Criar esses artefatos anteciparia a
Fase Um. Eles passam a ser gates obrigatórios no primeiro commit de implementação.

## Riscos que permanecem abertos

- prova técnica de RLS com Prisma e pool de conexões;
- parâmetros finais de Argon2id, rate limit e expiração após benchmark;
- política de acesso de DENTIST a pacientes sem vínculo direto;
- regras de parcelamento, arredondamento e cancelamento pós-pagamento;
- limites comerciais de BASIC/PRO;
- provedores, regiões, retenção e papéis LGPD sob revisão técnica/jurídica;
- backup, restore, observabilidade e infraestrutura ainda não configurados;
- MFA para OWNER/ADMIN planejado, não implementado.
