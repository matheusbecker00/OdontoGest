import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { environment } from '../../../environments/environment';
import { IconComponent } from '../../shared/components/icon.component';

interface QuickLink {
  readonly title: string;
  readonly description: string;
  readonly route: string;
  readonly icon: string;
}

interface ChecklistItem {
  readonly title: string;
  readonly description: string;
  readonly route: string;
}

interface FaqItem {
  readonly question: string;
  readonly answer: string;
}

@Component({
  selector: 'og-help-page',
  imports: [MatButtonModule, RouterLink, IconComponent],
  template: `
    <main class="help-page">
      <section class="page-heading">
        <div>
          <span class="eyebrow">AJUDA</span>
          <h2>Central de suporte</h2>
          <p>Guia rápido para operar o OdontoGest e preparar a clínica para uso real.</p>
        </div>
        <a mat-flat-button [href]="supportWhatsAppUrl" target="_blank" rel="noopener">
          <og-icon name="whatsapp" /> Falar no WhatsApp
        </a>
      </section>

      <section class="hero-card">
        <span class="hero-card__icon"><og-icon name="help_outline" /></span>
        <div>
          <small>STATUS DO SISTEMA</small>
          <h3>Seu ambiente já está em produção</h3>
          <p>
            Frontend publicado na Vercel, autenticação Firebase ativa, equipe, configurações,
            agenda, financeiro e estoque compartilhados sincronizando com Firestore.
          </p>
        </div>
      </section>

      <section class="quick-grid" aria-label="Atalhos de ajuda">
        @for (link of quickLinks; track link.route) {
          <a [routerLink]="link.route">
            <span><og-icon [name]="link.icon" /></span>
            <strong>{{ link.title }}</strong>
            <small>{{ link.description }}</small>
          </a>
        }
      </section>

      <section class="content-grid">
        <article class="panel">
          <header>
            <div>
              <h3>Checklist de implantação</h3>
              <p>Ordem recomendada para deixar a clínica pronta.</p>
            </div>
          </header>
          <div class="checklist">
            @for (item of checklist; track item.title; let index = $index) {
              <a [routerLink]="item.route">
                <span>{{ index + 1 }}</span>
                <div>
                  <strong>{{ item.title }}</strong>
                  <small>{{ item.description }}</small>
                </div>
                <og-icon name="arrow_forward" />
              </a>
            }
          </div>
        </article>

        <article class="panel">
          <header>
            <div>
              <h3>Perguntas rápidas</h3>
              <p>Respostas diretas para dúvidas comuns deste MVP.</p>
            </div>
          </header>
          <div class="faq-list">
            @for (item of faq; track item.question) {
              <details>
                <summary>{{ item.question }}</summary>
                <p>{{ item.answer }}</p>
              </details>
            }
          </div>
        </article>

        <article class="panel panel--wide">
          <header>
            <div>
              <h3>Próximas evoluções recomendadas</h3>
              <p>O que vem depois desta base funcional.</p>
            </div>
          </header>
          <div class="roadmap">
            <div>
              <span><og-icon name="groups" /></span>
              <div>
                <strong>Agenda compartilhada</strong>
                <small>Consultas visíveis para toda a equipe ativa da clínica.</small>
              </div>
            </div>
            <div>
              <span><og-icon name="verified_user" /></span>
              <div>
                <strong>Permissões por perfil</strong>
                <small>Controle fino do que cada usuário pode ver e alterar.</small>
              </div>
            </div>
            <div>
              <span><og-icon name="bar_chart" /></span>
              <div>
                <strong>Relatórios avançados</strong>
                <small>Indicadores por profissional, período, procedimento e financeiro.</small>
              </div>
            </div>
          </div>
        </article>

        <article class="panel panel--wide support-box">
          <header>
            <div>
              <h3>Precisa de ajuda agora?</h3>
              <p>Envie uma descrição objetiva do problema para acelerar o atendimento.</p>
            </div>
          </header>
          <div class="support-actions">
            <a mat-stroked-button [href]="supportWhatsAppUrl" target="_blank" rel="noopener">
              Chamar no WhatsApp
            </a>
            <a mat-stroked-button routerLink="/app/configuracoes">Revisar configurações</a>
            <a mat-stroked-button routerLink="/app/relatorios">Abrir relatórios</a>
          </div>
        </article>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
      color: #10213a;
    }
    .page-heading {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .eyebrow {
      color: #2563eb;
      font-size: 0.67rem;
      font-weight: 850;
      letter-spacing: 0.12em;
    }
    h2,
    h3,
    p {
      margin: 0;
    }
    h2 {
      margin-top: 0.25rem;
      font-size: clamp(1.65rem, 3vw, 2.15rem);
    }
    .page-heading p,
    .hero-card p,
    .panel header p,
    .quick-grid small,
    .checklist small,
    .roadmap small {
      margin-top: 0.25rem;
      color: #718198;
      font-size: 0.82rem;
      line-height: 1.55;
    }
    .hero-card,
    .quick-grid a,
    .panel {
      border: 1px solid #e4eaf1;
      border-radius: 0.9rem;
      background: #fff;
      box-shadow: 0 5px 18px rgb(15 23 42 / 4%);
    }
    .hero-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1rem;
      padding: 1.15rem;
    }
    .hero-card__icon,
    .quick-grid span,
    .roadmap span {
      display: grid;
      flex: 0 0 auto;
      place-items: center;
      color: #2563eb;
      background: #eaf2ff;
    }
    .hero-card__icon {
      width: 3.25rem;
      height: 3.25rem;
      border-radius: 0.95rem;
    }
    .hero-card__icon og-icon,
    .quick-grid og-icon,
    .roadmap og-icon {
      width: 1.55rem;
      height: 1.55rem;
    }
    .hero-card small {
      color: #2563eb;
      font-size: 0.62rem;
      font-weight: 850;
      letter-spacing: 0.1em;
    }
    .quick-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .quick-grid a {
      display: grid;
      gap: 0.45rem;
      min-height: 9rem;
      padding: 1rem;
      color: inherit;
      text-decoration: none;
      transition:
        border-color 150ms,
        transform 150ms;
    }
    .quick-grid a:hover {
      border-color: #a9c7f8;
      transform: translateY(-2px);
    }
    .quick-grid span,
    .roadmap span {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 0.8rem;
    }
    .quick-grid strong {
      margin-top: 0.25rem;
    }
    .content-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }
    .panel {
      overflow: hidden;
    }
    .panel--wide {
      grid-column: 1/-1;
    }
    .panel > header {
      padding: 1rem 1.1rem;
      border-bottom: 1px solid #edf1f5;
    }
    .checklist,
    .faq-list,
    .roadmap,
    .support-actions {
      display: grid;
      gap: 0.75rem;
      padding: 1rem;
    }
    .checklist a,
    .roadmap > div {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      border: 1px solid #e8edf3;
      border-radius: 0.8rem;
      padding: 0.85rem;
      color: inherit;
      background: #fafbfd;
      text-decoration: none;
    }
    .checklist a > span {
      display: grid;
      flex: 0 0 auto;
      width: 2rem;
      height: 2rem;
      place-items: center;
      border-radius: 50%;
      color: #2563eb;
      background: #eaf2ff;
      font-size: 0.75rem;
      font-weight: 850;
    }
    .checklist div,
    .roadmap div {
      flex: 1;
      min-width: 0;
    }
    .checklist og-icon {
      width: 1rem;
      height: 1rem;
      color: #2563eb;
    }
    details {
      border: 1px solid #e8edf3;
      border-radius: 0.8rem;
      padding: 0.85rem;
      background: #fafbfd;
    }
    summary {
      color: #10213a;
      font-size: 0.86rem;
      font-weight: 800;
      cursor: pointer;
    }
    details p {
      margin-top: 0.65rem;
      color: #667895;
      font-size: 0.8rem;
      line-height: 1.6;
    }
    .roadmap {
      grid-template-columns: repeat(3, minmax(0, 1fr));
    }
    .support-box {
      background: linear-gradient(135deg, #ffffff, #f5f8ff);
    }
    .support-actions {
      grid-template-columns: repeat(3, minmax(0, max-content));
      align-items: center;
    }
    @media (width < 76rem) {
      .quick-grid,
      .roadmap {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .content-grid {
        grid-template-columns: 1fr;
      }
      .panel--wide {
        grid-column: auto;
      }
    }
    @media (width < 46rem) {
      .page-heading,
      .hero-card {
        align-items: flex-start;
        flex-direction: column;
      }
      .quick-grid,
      .roadmap,
      .support-actions {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HelpPage {
  protected readonly supportWhatsAppUrl = environment.supportWhatsAppUrl;

  protected readonly quickLinks: readonly QuickLink[] = [
    {
      title: 'Criar agenda',
      description: 'Agende consultas e acompanhe status de atendimento.',
      route: '/app/agenda',
      icon: 'calendar_month',
    },
    {
      title: 'Lançar financeiro',
      description: 'Registre receitas, despesas e valores em aberto.',
      route: '/app/financeiro',
      icon: 'account_balance_wallet',
    },
    {
      title: 'Controlar estoque',
      description: 'Cadastre materiais e veja alertas de reposição.',
      route: '/app/estoque',
      icon: 'inventory_2',
    },
    {
      title: 'Ver relatórios',
      description: 'Acompanhe indicadores mensais da clínica.',
      route: '/app/relatorios',
      icon: 'monitoring',
    },
  ];

  protected readonly checklist: readonly ChecklistItem[] = [
    {
      title: 'Complete as configurações',
      description: 'Revise dados da clínica, horários e alertas operacionais.',
      route: '/app/configuracoes',
    },
    {
      title: 'Cadastre pacientes e procedimentos',
      description: 'Use os cadastros base para padronizar atendimentos.',
      route: '/app/pacientes',
    },
    {
      title: 'Crie os primeiros agendamentos',
      description: 'Teste a rotina diária com consultas reais ou de demonstração.',
      route: '/app/agenda',
    },
    {
      title: 'Registre entradas e despesas',
      description: 'Alimente o financeiro para liberar relatórios úteis.',
      route: '/app/financeiro',
    },
  ];

  protected readonly faq: readonly FaqItem[] = [
    {
      question: 'Os dados já ficam salvos na nuvem?',
      answer:
        'Sim. Equipe, configurações, agenda, financeiro e estoque da clínica já ficam compartilhados no Firestore. Alguns módulos ainda mantêm fallback local temporário caso a conexão falhe.',
    },
    {
      question: 'Posso usar com a Vercel Hobby e Firebase Spark?',
      answer:
        'Sim para este MVP. A estrutura atual evita backend pago adicional e usa limites gratuitos, mas o uso real deve ser acompanhado para não ultrapassar cotas.',
    },
    {
      question: 'Já posso chamar outras pessoas da clínica?',
      answer:
        'Sim. Em Equipe, o dono ou admin pode criar acesso por e-mail ou código numérico com senha, sem salvar senha no Firestore.',
    },
    {
      question: 'O financeiro já processa pagamentos?',
      answer:
        'Não. O módulo financeiro atual é controle operacional. Pagamentos reais, assinatura SaaS e gateway devem entrar em uma fase própria.',
    },
  ];
}
