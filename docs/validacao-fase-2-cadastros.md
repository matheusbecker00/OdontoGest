# Validação dos cadastros da Fase 2

Data: 19 de julho de 2026.

## Escopo entregue

- app shell responsivo com navegação administrativa;
- pacientes com cadastro, edição, filtros, paginação e inativação;
- profissionais com CRO único por clínica e UF, especialidade, contato, cor de
  agenda, duração padrão e status;
- procedimentos com categoria, descrição, valor em centavos, duração e status;
- operações SQL Connect transacionais, vinculadas à clínica autenticada e com
  registros de auditoria;
- validações de intervalo no servidor para duração e valor;
- permissão de escrita de profissionais e procedimentos limitada a `OWNER` e
  `ADMIN` no conector cliente.

## Verificações executadas

- geração do SDK Firebase SQL Connect;
- compilação do schema e dos conectores;
- migração aditiva das tabelas `dentist` e `procedure` em produção;
- lint do frontend;
- typecheck do frontend;
- 16 testes unitários do frontend;
- build Angular de produção.

## Pendências para concluir a Fase 2

- configurações completas da clínica e trial;
- usuários, convites e papéis;
- visualização e revogação de sessões;
- exportação autorizada do paciente;
- E2E completo do onboarding aos três cadastros;
- associação opcional entre dentista e usuário e horários de disponibilidade,
  que serão utilizados pela agenda.

A Fase 2 permanece em andamento; esta validação não declara o MVP pronto para
produção nem conformidade integral com a LGPD.
