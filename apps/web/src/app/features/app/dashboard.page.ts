import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../core/auth/auth.store';
import { IconComponent } from '../../shared/components/icon.component';
import { PatientsApiService } from '../patients/patients-api.service';

@Component({
  selector: 'og-dashboard-page',
  imports: [MatButtonModule, IconComponent, RouterLink],
  template: `
    <main class="dashboard">
      <section class="welcome">
        <div>
          <span class="eyebrow">VISÃO GERAL</span>
          <h2>Olá, {{ firstName() }}! <span aria-hidden="true">👋</span></h2>
          <p>Acompanhe os principais indicadores da sua clínica.</p>
        </div>
        <a mat-flat-button routerLink="/app/agenda"> <og-icon name="add" />Novo agendamento </a>
      </section>

      <section class="metrics" aria-label="Indicadores da clínica">
        <article class="metric metric--blue">
          <span class="metric__icon"><og-icon name="calendar_today" /></span>
          <div><small>Agenda hoje</small><strong>0</strong><span>Nenhum atendimento</span></div>
        </article>
        <article class="metric metric--cyan">
          <span class="metric__icon"><og-icon name="groups" /></span>
          <div>
            <small>Pacientes</small><strong>{{ patientTotal() }}</strong
            ><span>Total cadastrado</span>
          </div>
        </article>
        <article class="metric metric--green">
          <span class="metric__icon"><og-icon name="payments" /></span>
          <div>
            <small>Recebimentos hoje</small><strong>R$ 0</strong><span>Sem lançamentos</span>
          </div>
        </article>
        <article class="metric metric--orange">
          <span class="metric__icon"><og-icon name="pending_actions" /></span>
          <div><small>Pendências</small><strong>0</strong><span>Tudo em dia</span></div>
        </article>
      </section>

      <section class="dashboard-grid">
        <article class="panel schedule">
          <header>
            <div>
              <h3>Agenda de hoje</h3>
              <p>Seus próximos atendimentos</p>
            </div>
            <a routerLink="/app/agenda">Ver agenda completa</a>
          </header>
          <div class="empty-state">
            <span><og-icon name="event_available" /></span>
            <strong>Nenhum atendimento agendado</strong>
            <p>Sua agenda está livre hoje.</p>
            <a mat-stroked-button routerLink="/app/agenda">Abrir calendário</a>
          </div>
        </article>

        <aside class="panel quick-actions">
          <header>
            <div>
              <h3>Acesso rápido</h3>
              <p>Atalhos mais utilizados</p>
            </div>
          </header>
          <div class="quick-actions__grid">
            <a routerLink="/app/pacientes"
              ><og-icon name="person_add" /><span>Novo paciente</span></a
            >
            <a routerLink="/app/agenda"
              ><og-icon name="edit_calendar" /><span>Agendar consulta</span></a
            >
            <a routerLink="/app/financeiro"
              ><og-icon name="add_card" /><span>Novo lançamento</span></a
            >
            <a routerLink="/app/relatorios"
              ><og-icon name="bar_chart" /><span>Ver relatórios</span></a
            >
          </div>
        </aside>

        <article class="panel overview">
          <header>
            <div>
              <h3>Resumo da clínica</h3>
              <p>Informações do ambiente atual</p>
            </div>
          </header>
          <div class="clinic-row">
            <span class="clinic-icon"><og-icon name="domain" /></span>
            <div>
              <small>Clínica ativa</small><strong>{{ clinicName() }}</strong>
            </div>
            <span class="badge">Ativa</span>
          </div>
          <div class="progress-row">
            <span>Configuração inicial</span><strong>65%</strong>
            <div><i></i></div>
          </div>
          <a routerLink="/app/configuracoes"
            >Completar configuração <og-icon name="arrow_forward"
          /></a>
        </article>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
    }
    .dashboard {
      color: #10213a;
    }
    .welcome {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      margin-bottom: 1.6rem;
    }
    .eyebrow {
      color: #2563eb;
      font-size: 0.67rem;
      font-weight: 850;
      letter-spacing: 0.12em;
    }
    h2 {
      margin: 0.25rem 0;
      font-size: clamp(1.65rem, 3vw, 2.15rem);
      letter-spacing: -0.04em;
    }
    .welcome p,
    header p {
      margin: 0;
      color: #718198;
      font-size: 0.86rem;
    }
    .welcome a {
      height: 2.8rem;
      border-radius: 0.75rem;
    }
    .metrics {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
    }
    .metric {
      display: flex;
      align-items: center;
      gap: 1rem;
      min-height: 8rem;
      padding: 1.15rem;
      border: 1px solid #e4eaf1;
      border-radius: 1rem;
      background: white;
      box-shadow: 0 5px 18px rgb(15 23 42 / 4%);
    }
    .metric__icon {
      display: grid;
      flex: 0 0 auto;
      width: 2.75rem;
      height: 2.75rem;
      place-items: center;
      border-radius: 0.8rem;
    }
    .metric__icon og-icon {
      width: 1.1rem;
      height: 1.1rem;
    }
    .metric small,
    .metric strong,
    .metric span {
      display: block;
    }
    .metric small {
      color: #718198;
      font-size: 0.72rem;
      font-weight: 650;
    }
    .metric strong {
      margin: 0.2rem 0;
      font-size: 1.55rem;
      letter-spacing: -0.04em;
    }
    .metric div > span {
      color: #8a99ad;
      font-size: 0.66rem;
    }
    .metric--blue .metric__icon {
      color: #2563eb;
      background: #eaf2ff;
    }
    .metric--cyan .metric__icon {
      color: #0891b2;
      background: #e6f8fc;
    }
    .metric--green .metric__icon {
      color: #059669;
      background: #e7f8f2;
    }
    .metric--orange .metric__icon {
      color: #ea580c;
      background: #fff1e8;
    }
    .dashboard-grid {
      display: grid;
      grid-template-columns: minmax(0, 1.7fr) minmax(18rem, 1fr);
      gap: 1rem;
      margin-top: 1rem;
    }
    .panel {
      overflow: hidden;
      border: 1px solid #e4eaf1;
      border-radius: 1rem;
      background: white;
      box-shadow: 0 5px 18px rgb(15 23 42 / 4%);
    }
    .panel header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 1.15rem 1.25rem;
      border-bottom: 1px solid #edf1f5;
    }
    h3 {
      margin: 0 0 0.2rem;
      font-size: 0.98rem;
    }
    header a,
    .overview > a {
      color: #2563eb;
      font-size: 0.73rem;
      font-weight: 700;
      text-decoration: none;
    }
    .empty-state {
      display: grid;
      justify-items: center;
      padding: 3.1rem 1rem;
      color: #718198;
      text-align: center;
    }
    .empty-state > span {
      display: grid;
      width: 3.25rem;
      height: 3.25rem;
      place-items: center;
      border-radius: 50%;
      color: #2563eb;
      background: #eef4ff;
    }
    .empty-state > span og-icon {
      width: 1.25rem;
      height: 1.25rem;
    }
    .empty-state strong {
      margin-top: 0.8rem;
      color: #263a55;
      font-size: 0.85rem;
    }
    .empty-state p {
      margin: 0.25rem 0 0.9rem;
      font-size: 0.74rem;
    }
    .empty-state a {
      border-color: #d9e2ed;
      border-radius: 0.7rem;
    }
    .quick-actions__grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
      padding: 1rem;
    }
    .quick-actions__grid a {
      display: grid;
      justify-items: center;
      gap: 0.45rem;
      min-height: 6.25rem;
      place-content: center;
      border: 1px solid #e8edf3;
      border-radius: 0.85rem;
      color: #52657e;
      background: #fafbfd;
      font-size: 0.72rem;
      font-weight: 650;
      text-align: center;
      text-decoration: none;
      transition: 150ms;
    }
    .quick-actions__grid a:hover {
      border-color: #a9c7f8;
      color: #2563eb;
      background: #f4f8ff;
      transform: translateY(-2px);
    }
    .quick-actions__grid og-icon {
      width: 1.2rem;
      height: 1.2rem;
      color: #2563eb;
    }
    .overview {
      grid-column: 1/-1;
      padding-bottom: 1rem;
    }
    .clinic-row {
      display: flex;
      align-items: center;
      gap: 0.8rem;
      padding: 1.1rem 1.25rem;
    }
    .clinic-icon {
      display: grid;
      width: 2.35rem;
      height: 2.35rem;
      place-items: center;
      border-radius: 0.75rem;
      color: #2563eb;
      background: #edf4ff;
    }
    .clinic-icon og-icon {
      width: 1.1rem;
      height: 1.1rem;
    }
    .clinic-row div {
      flex: 1;
    }
    .clinic-row small,
    .clinic-row strong {
      display: block;
    }
    .clinic-row small {
      color: #8190a4;
      font-size: 0.68rem;
    }
    .clinic-row strong {
      margin-top: 0.15rem;
      font-size: 0.82rem;
    }
    .badge {
      padding: 0.25rem 0.65rem;
      border-radius: 99px;
      color: #047857;
      background: #e6f8f1;
      font-size: 0.65rem;
      font-weight: 800;
    }
    .progress-row {
      display: grid;
      grid-template-columns: 1fr auto;
      gap: 0.5rem;
      padding: 0 1.25rem 1rem;
      color: #64748b;
      font-size: 0.7rem;
    }
    .progress-row div {
      grid-column: 1/-1;
      height: 0.4rem;
      overflow: hidden;
      border-radius: 99px;
      background: #e7edf4;
    }
    .progress-row i {
      display: block;
      width: 65%;
      height: 100%;
      border-radius: inherit;
      background: linear-gradient(90deg, #2563eb, #0ea5e9);
    }
    .overview > a {
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      margin-left: 1.25rem;
    }
    .overview > a og-icon {
      width: 1rem;
      height: 1rem;
      font-size: 1rem;
    }
    @media (width < 75rem) {
      .metrics {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (width < 48rem) {
      .welcome {
        align-items: flex-start;
        flex-direction: column;
      }
      .dashboard-grid {
        grid-template-columns: 1fr;
      }
      .overview {
        grid-column: auto;
      }
    }
    @media (width < 34rem) {
      .metrics {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage implements OnInit {
  private readonly auth = inject(AuthStore);
  private readonly patients = inject(PatientsApiService);
  protected readonly patientTotal = signal(0);
  protected readonly firstName = () => this.auth.user()?.name?.split(' ')[0] || 'bem-vindo';
  protected readonly clinicName = () => this.auth.clinics()[0]?.name || 'Clínica ativa';

  ngOnInit(): void {
    void this.loadPatientTotal();
  }

  private async loadPatientTotal(): Promise<void> {
    try {
      const response = await firstValueFrom(this.patients.list({ page: 1, pageSize: 1 }));
      this.patientTotal.set(response.pagination.total);
    } catch {
      this.patientTotal.set(0);
    }
  }
}
