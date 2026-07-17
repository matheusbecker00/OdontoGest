# Análise visual do Scaleo ERP

Data da inspeção: 16 de julho de 2026
Referência: <https://scaleo-erp.vercel.app>

## Método e evidências

A URL foi aberta com Microsoft Edge controlado por Playwright. Foram capturados
os três viewports obrigatórios antes da autenticação e, usando somente a conta
demonstrativa publicada pelo próprio sistema, páginas internas de leitura e um
formulário vazio. Nenhum registro foi criado, alterado ou excluído.

| Contexto                  |   Viewport | Evidência                                            |
| ------------------------- | ---------: | ---------------------------------------------------- |
| Login desktop             | 1440 × 900 | `referencias/scaleo-desktop-1440x900.png`            |
| Login tablet              | 1024 × 768 | `referencias/scaleo-tablet-1024x768.png`             |
| Login mobile              |  390 × 844 | `referencias/scaleo-mobile-390x844.png`              |
| Dashboard autenticado     | 1440 × 900 | `referencias/scaleo-dashboard-desktop-1440x900.png`  |
| Tabela administrativa     | 1440 × 900 | `referencias/scaleo-tabela-desktop-1440x900.png`     |
| Formulário administrativo | 1440 × 900 | `referencias/scaleo-formulario-desktop-1440x900.png` |
| Dashboard interno mobile  |  390 × 844 | `referencias/scaleo-dashboard-mobile-390x844.png`    |

As imagens são evidência de análise e não ativos do produto OdontoGest.

## Medições observadas

As medições abaixo combinam inspeção visual e estilos computados pelo navegador.

| Elemento        | Observação                                                         |
| --------------- | ------------------------------------------------------------------ |
| Tipografia      | `Inter, Roboto, Helvetica Neue, Arial, sans-serif`; corpo de 14 px |
| Sidebar         | 270 px de largura, fundo próximo de `#0f172a`, itens de 46 px      |
| Item da sidebar | Padding horizontal de 14 px, gap de 14 px, raio de 12 px           |
| Item ativo      | Azul vivo próximo de `#2563eb`, texto e ícone brancos              |
| Navbar          | 106 px de altura, `rgba(255,255,255,.92)`, padding `16px 24px`     |
| Canvas          | `#f1f5f9`, padding de 24 px e leve radial azul no canto superior   |
| Card-resumo     | Branco, borda `#e2e8f0`, raio de 22 px, padding de 18 px           |
| Sombra de card  | `0 1px 2px rgba(15,23,42,.03)`; quase imperceptível                |
| Texto primário  | Próximo de `#0f172a`; subtítulos próximos de `#64748b`             |
| Inputs          | Altura aproximada de 44 px, borda azul-cinza clara, raio de 14 px  |
| Botão primário  | Azul saturado, raio entre 12 e 16 px, ícone à esquerda             |
| Tabela          | Cabeçalho cinza muito claro, linhas brancas e divisores finos      |
| Badge           | Forma de pílula, cor semântica clara no fundo e forte no texto     |
| Login           | Degradê azul-marinho–índigo–roxo; painel branco com raio amplo     |

## Composição

### Login

No desktop, a tela usa duas colunas: proposição visual à esquerda e formulário à
direita. O conteúdo fica centralizado verticalmente e usa bastante espaço
negativo. Três cards translúcidos resumem capacidades e um aviso amarelo destaca
que o ambiente é demonstrativo. O formulário branco é o principal ponto focal.

No tablet, as duas colunas permanecem, mas os cards de capacidades empilham. No
mobile, todo o conteúdo vira uma coluna; os cards ocupam a largura disponível e o
formulário aparece após a introdução. A captura mostra que o aviso flutuante cobre
parte do início do formulário, um comportamento que não deve ser reproduzido.

### Shell autenticado

A sidebar escura contém marca, colapso e navegação. A navbar clara mostra contexto
da página à esquerda e identidade/sessão à direita. O conteúdo usa hierarquia
consistente: título, descrição, ações, indicadores e painel principal.

O dashboard alterna cards de resumo, atalhos e blocos de lista. Ícones aparecem
dentro de quadrados de fundo semântico. A tabela administrativa posiciona
indicadores antes dos filtros; busca e selects ficam em uma barra única e as ações
por linha usam botões compactos, coloridos e reconhecíveis.

O formulário agrupa campos por assunto dentro de um painel amplo. Cada grupo tem
título e texto auxiliar à esquerda e uma grade de campos à direita. Divisores
finos separam as seções.

## Responsividade encontrada

O login público se adapta aos três viewports. Já o shell autenticado manteve a
sidebar de 270 px aberta e conteúdo com largura de desktop no viewport de 390 px,
gerando recorte/overflow horizontal. Essa é uma limitação da referência, não uma
diretriz para o OdontoGest.

Comportamento definido para o OdontoGest:

- **≥ 1200 px:** sidebar de 272 px fixa e conteúdo fluido.
- **768–1199 px:** sidebar recolhida em rail de 80 px, expansível; tabelas reduzem
  colunas secundárias.
- **< 768 px:** sidebar vira drawer modal, fechada por padrão; navbar de 64 px;
  ações principais podem ficar em barra inferior contextual.
- Nunca permitir que o shell cause scroll horizontal da página.
- Tabelas preservam paginação e ações; em telas estreitas, linhas podem virar cards
  ou usar área rolável explicitamente rotulada.
- Toasts devem respeitar áreas seguras e nunca cobrir a ação ou erro atual.

## Direção visual do OdontoGest

O produto manterá o caráter administrativo limpo da referência sem copiar sua
identidade. A sidebar será azul-marinho; o azul primário comunica confiança e um
verde-água secundário remete à saúde sem cair em clichês clínicos. A experiência
de agenda receberá cores controladas por dentista e status, sempre acompanhadas
por texto ou ícone para não depender apenas de cor.

Padrões planejados:

- Cards de indicadores com ícone, rótulo, valor e contexto temporal.
- Cabeçalho de página com breadcrumb opcional, título, descrição e ação primária.
- Loading por skeleton com dimensões estáveis; erro inline com ação de tentar de
  novo; empty state com próxima ação clara.
- Foco de teclado com anel de 3 px e contraste verificável.
- Botões destrutivos em vermelho somente após confirmação contextual.
- Valores financeiros sempre com alinhamento tabular e formatação `pt-BR`.
- Datas exibidas no fuso da clínica, inicialmente `America/Sao_Paulo`.
- Densidade confortável para recepção; alvos interativos mínimos de 44 × 44 px.

## Tokens

Os tokens propostos estão em `apps/web/src/styles/_tokens.scss`. Valores
observados foram separados de decisões próprias do OdontoGest; a integração com o
tema do Angular Material ocorrerá na Fase 1.

## Cuidados de propriedade intelectual

O OdontoGest não reutilizará nome, logotipo, textos, dados, código ou entidades do
Scaleo. A referência limita-se a composição, densidade, hierarquia, espaçamento e
sensação visual comuns a sistemas administrativos.
