# Matriz de permissões

## Modelo

Permissões são códigos explícitos verificados no backend por `AuthorizationGuard`.
O frontend usa os mesmos códigos apenas para navegação e UX. `OWNER` é um papel de
membership, não um booleano em `User`; portanto a mesma pessoa pode ter papéis
diferentes em clínicas distintas.

Legenda: **G** gerencia, **O** opera/edita, **L** lê, **P** próprio/limitado,
**—** negado.

| Capacidade                   | OWNER | ADMIN | DENTIST | RECEPTIONIST | FINANCE |
| ---------------------------- | :---: | :---: | :-----: | :----------: | :-----: |
| Dashboard operacional        |   L   |   L   |    P    |      L       |    L    |
| Agenda de todos              |   G   |   G   |    P    |      G       |    L    |
| Agenda própria               |   G   |   G   |    O    |      G       |    L    |
| Criar/reagendar consulta     |   O   |   O   |    P    |      O       |    —    |
| Iniciar/finalizar consulta   |   O   |   O   |    O    |      —       |    —    |
| Cancelar/marcar falta        |   O   |   O   |    P    |      O       |    —    |
| Pacientes — cadastro         |   G   |   G   |    P    |      O       |    L    |
| Pacientes — dados de contato |   G   |   G   |    P    |      O       |    L    |
| Observações administrativas  |   G   |   G   |    P    |      O       |    —    |
| Exportar dados do paciente   |   G   |   G   |    —    |      —       |    —    |
| Solicitação de anonimização  |   G   |   G   |    —    |      —       |    —    |
| Dentistas                    |   G   |   G   |    L    |      L       |    —    |
| Procedimentos                |   G   |   G   |    L    |      L       |    L    |
| Orçamentos/tratamentos       |   G   |   G   |    O    |      O       |    O    |
| Aprovar venda                |   G   |   G   |    P    |      —       |    O    |
| Cancelar venda aprovada      |   G   |   G   |    —    |      —       |    O    |
| Contas a receber             |   G   |   G   |    P    |      L       |    G    |
| Registrar pagamento básico   |   O   |   O   |    —    |      O       |    O    |
| Registrar pagamento parcial  |   O   |   O   |    —    |      —       |    O    |
| Estornar pagamento           |   G   |   G   |    —    |      —       |    O    |
| Relatórios financeiros       |   G   |   G   |    —    |      —       |    G    |
| Configuração da clínica      |   G   |   G   |    —    |      —       |    —    |
| Usuários e convites          |   G   |   G   |    —    |      —       |    —    |
| Papéis/permissões            |   G   |   L   |    —    |      —       |    —    |
| Transferir propriedade       |   G   |   —   |    —    |      —       |    —    |
| Assinatura SaaS              |   G   |   L   |    —    |      —       |    —    |
| Auditoria                    |   G   |   L   |    —    |      —       |    —    |
| Política de retenção         |   G   |   L   |    —    |      —       |    —    |

`P` não é acesso implícito a qualquer paciente: para DENTIST, a política exige
vínculo com consulta/tratamento atribuído e janela operacional definida. A regra
exata será validada com o responsável de produto antes da Fase 2.

## Catálogo inicial de códigos

### Agenda e cadastros

- `dashboard.read`
- `appointment.read.all`, `appointment.read.own`
- `appointment.create`, `appointment.update`, `appointment.status.manage`
- `appointment.cancel`, `appointment.no_show`, `schedule.block.manage`
- `patient.read`, `patient.create`, `patient.update`, `patient.inactivate`
- `patient.export`, `patient.privacy_request.manage`
- `dentist.read`, `dentist.manage`
- `procedure.read`, `procedure.manage`

### Tratamento e financeiro da clínica

- `treatment.read`, `treatment.create`, `treatment.update_draft`
- `treatment.approve`, `treatment.cancel`
- `receivable.read`, `receivable.manage`
- `payment.create.basic`, `payment.create.partial`, `payment.reverse`
- `financial_report.read`

### Administração e SaaS

- `clinic_settings.read`, `clinic_settings.manage`
- `membership.read`, `membership.invite`, `membership.manage`
- `role.read`, `role.manage`, `ownership.transfer`
- `subscription.read`, `subscription.manage`
- `audit.read`, `retention_policy.manage`

## Regras invariantes

1. Toda autorização ocorre depois de autenticação, validação da sessão e seleção de
   clínica ativa.
2. A permissão é avaliada na membership da clínica ativa; claims desatualizadas são
   invalidadas por `authorizationVersion`.
3. OWNER não ignora tenant scope, status da assinatura, integridade financeira ou
   regras de privacidade.
4. Mudança de papel, convite, transferência de propriedade, estorno, exportação e
   assinatura geram auditoria.
5. Clínicas em modo somente leitura mantêm login, leitura, cobrança, privacidade e
   exportação; mutações operacionais recebem código de erro estável.
6. Ações de maior risco exigem reautenticação recente na fase definida pelo modelo
   de ameaças; MFA para OWNER/ADMIN está preparado, mas não é alegado no MVP inicial.
7. Endpoint novo nasce negado. O PR precisa declarar permissões, tenant scope e
   testes por papel.

## Casos obrigatórios de teste

- Cada papel tenta ao menos uma ação permitida e uma negada por módulo.
- Usuário com mesma identidade e memberships diferentes troca a clínica ativa e
  recebe políticas correspondentes.
- Token emitido antes de mudança de papel deixa de autorizar após incremento de
  versão.
- DENTIST não acessa paciente sem vínculo permitido.
- RECEPTIONIST não estorna pagamento nem altera configurações.
- FINANCE não convida usuário nem acessa administração de papéis.
- ADMIN não transfere propriedade nem altera cobrança.
- OWNER de Clínica B não acessa nenhuma entidade da Clínica A.
- Modo somente leitura bloqueia escrita sem bloquear cobrança/exportação.
