# Diretrizes iniciais de privacidade e LGPD

## Aviso

Este documento é um baseline técnico de privacy by design. Não é parecer jurídico,
RIPD concluído nem declaração de conformidade. A LGPD, bases legais, obrigações
setoriais odontológicas, prazos fiscais e contratos precisam de revisão por
profissionais habilitados antes do uso real.

A ANPD destaca governança e medidas técnicas/administrativas para mitigar riscos e
aumentar transparência e confiança:
<https://www.gov.br/anpd/pt-br/acesso-a-informacao/perguntas-frequentes/perguntas-frequentes>.

## Papéis preliminares

Hipótese a validar: a clínica decide finalidades e meios do atendimento e tende a
atuar como controladora dos dados de seus pacientes; o OdontoGest tende a operar
esses dados conforme contrato. O OdontoGest é controlador dos dados necessários à
própria conta, segurança, assinatura e obrigações empresariais. O contrato deve
separar os papéis por operação, não por rótulo genérico.

## Princípios traduzidos em arquitetura

- **Finalidade/adequação:** cada campo e evento possui finalidade no inventário.
- **Necessidade:** prontuário e imagens ficam fora do MVP; DTOs não aceitam campos
  excedentes.
- **Livre acesso/qualidade:** workflows de exportação e correção com identidade
  verificada.
- **Transparência:** termos e política versionados, linguagem `pt-BR` e histórico de
  aceite.
- **Segurança/prevenção:** tenant scope, RLS, RBAC, cifragem, sessão revogável,
  auditoria redigida e testes.
- **Não discriminação/responsabilização:** dados não serão usados para perfil ou
  decisão automatizada; evidências técnicas e operacionais serão mantidas.

## Direitos e workflows

Solicitações não executam exclusão direta por botão CRUD.

1. Registrar pedido e canal sem expor detalhes em e-mail.
2. Verificar identidade e autoridade do solicitante.
3. Confirmar clínica e escopo dos dados.
4. Classificar acesso, confirmação, correção, portabilidade, anonimização,
   bloqueio ou exclusão.
5. Avaliar retenção obrigatória/defesa de direitos com pessoa autorizada.
6. Gerar resposta/export em worker, cifrada e com link curto de uso único.
7. Registrar decisão, execução e comunicação com dados minimizados.
8. Propagar exclusão/retificação aos operadores aplicáveis e registrar evidência.

## Retenção

Não há prazos inventados nesta fase. A política será versionada por categoria,
base/finalidade e evento inicial. A execução deve suportar `retain`, `block`,
`anonymize` e `delete`, respeitando integridade financeira e obrigação legal.
Backups seguem expiração própria: itens excluídos podem persistir cifrados até o
ciclo de rotação, sem retorno ao ambiente ativo salvo restore controlado.

## Segurança e resposta a incidente

- Incidentes possuem classificação, contenção, preservação de evidência, análise de
  impacto, comunicação e lições aprendidas.
- A obrigação e o prazo de notificação à ANPD/titulares serão avaliados no caso
  concreto conforme norma vigente; o sistema não promete decisão automática.
- Contatos, runbook, backups e teste de restauração serão definidos antes de
  produção. A Fase 0 não possui backup configurado.

## Separação de ambientes

- Development e CI usam factories e dados sintéticos.
- Demo usa banco/segredos/contas próprios e reset autorizado.
- Staging não recebe cópia de produção sem processo formal de anonimização.
- Production bloqueia seeds de demonstração e Swagger público.
- Cada ambiente usa chave, credencial de billing, e-mail, storage e observabilidade
  diferentes.

## Requisitos para fornecedores

Antes de ativar um provedor: avaliar contrato e suboperadores, região, controles,
retenção, export/exclusão, notificação de incidente, disponibilidade e saída. Enviar
somente os campos necessários; ferramentas de erro e métricas não recebem payloads
de pacientes ou financeiro completo.

## Conteúdo público futuro

Política de Privacidade e Termos de Uso serão documentos jurídicos versionados e
publicados nas rotas previstas. A versão inicial deve descrever ao menos agentes,
finalidades, dados, compartilhamentos, segurança, retenção, direitos, contato,
cookies essenciais e mudanças. Templates técnicos não serão apresentados como
texto jurídico final.

## Gates antes do lançamento

- inventário e fluxo de dados revisados por produto, segurança e jurídico;
- papéis controlador/operador definidos no contrato;
- bases legais e prazos documentados por finalidade;
- fornecedores e suboperadores registrados;
- processo de direitos testado ponta a ponta;
- logs/telemetria verificados contra canários de PII;
- backup/restore e incidente ensaiados;
- política e termos revisados e versionados;
- teste de segurança independente proporcional ao risco.
