# Inventário inicial de dados

Este inventário é de arquitetura, não um registro definitivo de operações de
tratamento. A base legal, os prazos e a classificação controlador/operador precisam
de validação jurídica e contratual antes da produção.

## Categorias e fluxo

| Categoria                 | Exemplos                                          | Finalidade                      | Origem            | Destino/operador                 | Retenção preliminar                   |
| ------------------------- | ------------------------------------------------- | ------------------------------- | ----------------- | -------------------------------- | ------------------------------------- |
| Conta                     | nome, e-mail, hash de senha                       | autenticar e comunicar          | usuário           | PostgreSQL, e-mail               | enquanto conta/obrigação existir      |
| Clínica                   | razão/nome, CPF/CNPJ, telefone                    | contrato, tenant e cobrança     | responsável       | PostgreSQL, billing mínimo       | contrato + prazo legal a validar      |
| Membership                | clínica, usuário, papel                           | autorização                     | owner/admin       | PostgreSQL                       | vínculo + auditoria                   |
| Sessão                    | hash de token, datas, IP reduzido, UA             | segurança e revogação           | sistema/navegador | PostgreSQL, Redis efêmero        | curto e configurável                  |
| Paciente cadastral        | nome, CPF, nascimento, contato, endereço          | agenda e administração          | paciente/clínica  | PostgreSQL                       | política da clínica e lei aplicável   |
| Agenda                    | paciente, dentista, procedimento, horário, status | prestar serviço e operar agenda | clínica           | PostgreSQL, notificações mínimas | a validar                             |
| Observação administrativa | texto operacional limitado                        | apoiar recepção                 | clínica           | PostgreSQL                       | mínimo necessário                     |
| Tratamento comercial      | itens, preços, descontos e status                 | orçamento e venda               | clínica           | PostgreSQL                       | fiscal/contratual a validar           |
| Financeiro do paciente    | parcela, vencimento, pagamento, estorno           | cobrança e conciliação          | clínica           | PostgreSQL                       | fiscal/contratual a validar           |
| Assinatura SaaS           | plano, uso, status, IDs externos                  | cobrar a clínica                | sistema/provedor  | PostgreSQL, Mercado Pago         | contrato + obrigação aplicável        |
| Aceites                   | versão, data, usuário, evidência                  | provar ciência/aceite           | usuário           | PostgreSQL                       | versão vigente + defesa de direito    |
| Auditoria                 | ator, ação, entidade, resultado                   | segurança e responsabilização   | sistema           | PostgreSQL/log seguro            | risco e obrigação a validar           |
| Telemetria                | rota normalizada, status, duração                 | confiabilidade e segurança      | sistema           | provedor observabilidade         | curta; sem payload/PII                |
| Export                    | conjunto autorizado do titular                    | atender direito/portabilidade   | workflow          | storage privado temporário       | expiração curta e exclusão automática |

## Dados deliberadamente fora do MVP

- prontuário e evolução clínica;
- diagnóstico, anamnese e prescrição;
- radiografias, fotografias, exames e anexos;
- dados de cartão, CVV ou trilha magnética;
- biometria;
- gravações de atendimento;
- campanhas de marketing/perfil comportamental.

Adicionar qualquer item exige revisão do modelo de ameaças, inventário, contrato,
retention policy e controles de acesso.

## Minimização por campo

- CPF do paciente é opcional quando o fluxo comercial/legal permitir.
- WhatsApp é separado de telefone e só marcado após manifestação apropriada.
- Observações administrativas exibem instrução explícita para não inserir dados
  clínicos; limite de tamanho e acesso restrito.
- IP é truncado/reduzido quando a finalidade de segurança permitir; nunca usado
  para perfil comercial.
- User agent é resumido e limitado em tamanho.
- Payload de webhook é minimizado após validação; log guarda IDs e digest.
- `before/after` de auditoria usa allowlist por ação, não serialização automática.

## Classificação

| Nível        | Descrição                         | Exemplos                                     | Controle mínimo                               |
| ------------ | --------------------------------- | -------------------------------------------- | --------------------------------------------- |
| Restrito     | Comprometimento gera alto dano    | senha/hash, token, CPF/CNPJ, contato, export | cifragem, acesso mínimo, redaction, auditoria |
| Confidencial | Informação operacional por tenant | agenda, tratamento, financeiro, membership   | tenant/RBAC/RLS, TLS, backup cifrado          |
| Interno      | Metadado sem PII direta           | feature flags, códigos e configurações       | autenticação e integridade                    |
| Público      | Conteúdo aprovado para divulgação | preços públicos, termos publicados           | integridade e versionamento                   |

## Processadores/provedores a decidir

Nenhum fornecedor está contratado/configurado na Fase 0. Categorias previstas:

- hospedagem do frontend e API;
- PostgreSQL e Redis gerenciados;
- e-mail transacional;
- Mercado Pago para checkout/assinatura;
- storage compatível com S3 para exports temporários;
- observabilidade e rastreamento de erros.

Antes de produção, registrar região, suboperadores, finalidade, dados enviados,
retenção, contrato, mecanismo de exclusão/export e contato de incidente.
