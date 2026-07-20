import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { AuthStore } from '../../core/auth/auth.store';
import {
  AppointmentsRepository,
  type Appointment,
  type AppointmentStatus,
} from '../app/appointments.repository';
import { FinanceRepository, type FinancialEntry } from '../finance/finance.repository';
import { InventoryRepository, type InventoryItem } from '../inventory/inventory.repository';
import { IconComponent } from '../../shared/components/icon.component';

const STORAGE_KEYS = {
  appointments: 'odontogest.appointments',
  finance: 'odontogest.finance',
  inventory: 'odontogest.inventory',
} as const;

@Component({
  selector: 'og-reports-page',
  imports: [MatButtonModule, IconComponent],
  template: `
    <main class="reports-page">
      <section class="page-heading">
        <div>
          <span class="eyebrow">RELATÓRIOS</span>
          <h2>Visão gerencial</h2>
          <p>Resumo operacional da agenda, financeiro e estoque da clínica.</p>
          <span class="sync-pill" [class.sync-pill--local]="syncState() === 'local'">
            <og-icon [name]="syncState() === 'online' ? 'verified_user' : 'inventory_2'" />
            {{ syncLabel() }}
          </span>
        </div>
        <button mat-stroked-button type="button" (click)="selectCurrentMonth()">Mês atual</button>
      </section>

      <section class="period-card">
        <span><og-icon name="calendar_month" /></span>
        <div>
          <small>Período analisado</small>
          <strong>{{ periodLabel() }}</strong>
        </div>
        <nav aria-label="Trocar período">
          <button type="button" (click)="changeMonth(-1)"><og-icon name="chevron_left" /></button>
          <button type="button" (click)="changeMonth(1)"><og-icon name="chevron_right" /></button>
        </nav>
      </section>

      <section class="kpi-grid" aria-label="Indicadores principais">
        <article class="kpi kpi--blue">
          <span><og-icon name="event_available" /></span>
          <div>
            <small>Atendimentos</small><strong>{{ monthlyAppointments().length }}</strong>
          </div>
        </article>
        <article class="kpi kpi--green">
          <span><og-icon name="payments" /></span>
          <div>
            <small>Recebido</small><strong>{{ formatMoney(monthlyPaidIncomeCents()) }}</strong>
          </div>
        </article>
        <article class="kpi kpi--orange">
          <span><og-icon name="pending_actions" /></span>
          <div>
            <small>Em aberto</small><strong>{{ formatMoney(monthlyOpenIncomeCents()) }}</strong>
          </div>
        </article>
        <article class="kpi kpi--red">
          <span><og-icon name="inventory_2" /></span>
          <div>
            <small>Reposição</small><strong>{{ lowStockItems().length }}</strong>
          </div>
        </article>
      </section>

      <section class="reports-grid">
        <article class="panel">
          <header>
            <div>
              <h3>Financeiro do mês</h3>
              <p>Receitas, despesas e saldo estimado.</p>
            </div>
          </header>
          <div class="finance-breakdown">
            <div>
              <span>Receitas pagas</span
              ><strong>{{ formatMoney(monthlyPaidIncomeCents()) }}</strong>
            </div>
            <div>
              <span>Receitas em aberto</span
              ><strong>{{ formatMoney(monthlyOpenIncomeCents()) }}</strong>
            </div>
            <div>
              <span>Despesas</span><strong>{{ formatMoney(monthlyExpenseCents()) }}</strong>
            </div>
            <div class="total">
              <span>Saldo realizado</span><strong>{{ formatMoney(monthlyBalanceCents()) }}</strong>
            </div>
          </div>
        </article>

        <article class="panel">
          <header>
            <div>
              <h3>Status da agenda</h3>
              <p>Distribuição dos atendimentos no período.</p>
            </div>
          </header>
          <div class="status-list">
            @for (status of appointmentStatuses; track status) {
              <div>
                <span>{{ appointmentStatusLabel(status) }}</span>
                <strong>{{ appointmentStatusCount(status) }}</strong>
              </div>
            }
          </div>
        </article>

        <article class="panel panel--wide">
          <header>
            <div>
              <h3>Próximos atendimentos</h3>
              <p>Agenda ativa a partir de hoje.</p>
            </div>
          </header>
          @if (upcomingAppointments().length > 0) {
            <div class="rows">
              @for (appointment of upcomingAppointments(); track appointment.id) {
                <article class="row">
                  <span class="row__icon"><og-icon name="calendar_today" /></span>
                  <div>
                    <strong>{{ appointment.patientName }}</strong>
                    <small>
                      {{ formatDate(appointment.date) }} às {{ appointment.startTime }} ·
                      {{ appointment.procedureName }}
                    </small>
                  </div>
                  <em>{{ appointmentStatusLabel(appointment.status) }}</em>
                </article>
              }
            </div>
          } @else {
            <div class="empty-state">
              <span><og-icon name="event_available" /></span>
              <strong>Nenhum atendimento futuro</strong>
              <p>Os próximos agendamentos aparecerão aqui.</p>
            </div>
          }
        </article>

        <article class="panel panel--wide">
          <header>
            <div>
              <h3>Alertas de estoque</h3>
              <p>Materiais ativos abaixo ou no mínimo configurado.</p>
            </div>
          </header>
          @if (lowStockItems().length > 0) {
            <div class="rows">
              @for (item of lowStockItems(); track item.id) {
                <article class="row row--alert">
                  <span class="row__icon"><og-icon name="inventory_2" /></span>
                  <div>
                    <strong>{{ item.name }}</strong>
                    <small>{{ item.category }} · atual {{ item.quantity }} {{ item.unit }}</small>
                  </div>
                  <em>Mín. {{ item.minimumQuantity }}</em>
                </article>
              }
            </div>
          } @else {
            <div class="empty-state">
              <span><og-icon name="inventory_2" /></span>
              <strong>Estoque saudável</strong>
              <p>Nenhum material ativo precisa de reposição agora.</p>
            </div>
          }
        </article>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
      color: #10213a;
    }
    .page-heading,
    .period-card,
    .panel > header,
    .row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
    }
    .page-heading {
      margin-bottom: 1rem;
    }
    .eyebrow {
      color: #2563eb;
      font-size: 0.67rem;
      font-weight: 850;
      letter-spacing: 0.12em;
    }
    h2,
    h3 {
      margin: 0;
    }
    h2 {
      margin-top: 0.25rem;
      font-size: clamp(1.65rem, 3vw, 2.15rem);
    }
    .page-heading p,
    .panel header p,
    .row small {
      margin: 0.25rem 0 0;
      color: #718198;
      font-size: 0.82rem;
    }
    .sync-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      margin-top: 0.65rem;
      border: 1px solid #b9f0d3;
      border-radius: 99px;
      padding: 0.35rem 0.6rem;
      color: #047857;
      background: #ecfdf5;
      font-size: 0.68rem;
      font-weight: 800;
    }
    .sync-pill--local {
      border-color: #fed7aa;
      color: #b45309;
      background: #fff7ed;
    }
    .sync-pill og-icon {
      width: 0.95rem;
      height: 0.95rem;
    }
    .period-card,
    .kpi,
    .panel {
      border: 1px solid #e4eaf1;
      border-radius: 0.9rem;
      background: #fff;
      box-shadow: 0 5px 18px rgb(15 23 42 / 4%);
    }
    .period-card {
      justify-content: flex-start;
      margin-bottom: 1rem;
      padding: 1rem;
    }
    .period-card > span,
    .kpi > span,
    .row__icon,
    .empty-state > span {
      display: grid;
      flex: 0 0 auto;
      place-items: center;
      color: #2563eb;
      background: #eaf2ff;
    }
    .period-card > span,
    .kpi > span {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 0.8rem;
    }
    .period-card og-icon,
    .kpi og-icon,
    .row__icon og-icon {
      width: 1.45rem;
      height: 1.45rem;
    }
    .period-card small,
    .period-card strong,
    .kpi small,
    .kpi strong {
      display: block;
    }
    .period-card small,
    .kpi small {
      color: #667895;
      font-size: 0.68rem;
      font-weight: 800;
    }
    .period-card strong {
      text-transform: capitalize;
    }
    .period-card nav {
      display: flex;
      gap: 0.4rem;
      margin-left: auto;
    }
    .period-card nav button {
      display: grid;
      width: 2.2rem;
      height: 2.2rem;
      place-items: center;
      border: 1px solid #dbe3ed;
      border-radius: 0.65rem;
      color: #2563eb;
      background: #fff;
      cursor: pointer;
    }
    .period-card nav og-icon {
      width: 1.1rem;
      height: 1.1rem;
    }
    .kpi-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .kpi {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 1rem;
    }
    .kpi strong {
      margin-top: 0.1rem;
      font-size: 1.35rem;
      letter-spacing: -0.04em;
    }
    .kpi--green > span {
      color: #059669;
      background: #e7f8f2;
    }
    .kpi--orange > span {
      color: #ea580c;
      background: #fff1e8;
    }
    .kpi--red > span {
      color: #dc2626;
      background: #fff0ee;
    }
    .reports-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 1rem;
    }
    .panel {
      overflow: hidden;
    }
    .panel--wide {
      min-height: 20rem;
    }
    .panel > header {
      padding: 1rem 1.1rem;
      border-bottom: 1px solid #edf1f5;
    }
    .finance-breakdown,
    .status-list,
    .rows {
      display: grid;
      gap: 0.75rem;
      padding: 1rem;
    }
    .finance-breakdown > div,
    .status-list > div {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      border: 1px solid #e8edf3;
      border-radius: 0.75rem;
      padding: 0.85rem;
      background: #fafbfd;
    }
    .finance-breakdown span,
    .status-list span {
      color: #667895;
      font-size: 0.78rem;
      font-weight: 750;
    }
    .finance-breakdown strong,
    .status-list strong {
      font-size: 0.95rem;
    }
    .finance-breakdown .total {
      border-color: #b9f0d3;
      background: #ecfdf5;
    }
    .row {
      border: 1px solid #e8edf3;
      border-radius: 0.8rem;
      padding: 0.85rem;
      background: #fafbfd;
    }
    .row--alert {
      border-color: #fed7aa;
      background: #fffbf6;
    }
    .row__icon {
      width: 2.65rem;
      height: 2.65rem;
      border-radius: 0.75rem;
    }
    .row div {
      flex: 1;
      min-width: 0;
    }
    .row div strong {
      display: block;
      font-size: 0.9rem;
    }
    .row em {
      border-radius: 99px;
      padding: 0.24rem 0.55rem;
      color: #2563eb;
      background: #eaf2ff;
      font-size: 0.62rem;
      font-style: normal;
      font-weight: 850;
      white-space: nowrap;
    }
    .empty-state {
      display: grid;
      justify-items: center;
      padding: 3rem 1rem;
      color: #718198;
      text-align: center;
    }
    .empty-state > span {
      width: 3.25rem;
      height: 3.25rem;
      border-radius: 50%;
    }
    .empty-state > span og-icon {
      width: 1.55rem;
      height: 1.55rem;
    }
    .empty-state strong {
      margin-top: 0.8rem;
      color: #263a55;
      font-size: 0.88rem;
    }
    .empty-state p {
      margin: 0.25rem 0 0;
      font-size: 0.74rem;
    }
    @media (width < 76rem) {
      .kpi-grid,
      .reports-grid {
        grid-template-columns: 1fr 1fr;
      }
    }
    @media (width < 46rem) {
      .page-heading,
      .period-card,
      .row {
        align-items: flex-start;
        flex-direction: column;
      }
      .kpi-grid,
      .reports-grid {
        grid-template-columns: 1fr;
      }
      .period-card nav {
        margin-left: 0;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReportsPage {
  private readonly auth = inject(AuthStore);
  private readonly appointmentsRepository = inject(AppointmentsRepository);
  private readonly financeRepository = inject(FinanceRepository);
  private readonly inventoryRepository = inject(InventoryRepository);
  private readonly appointments = signal<readonly Appointment[]>(
    this.readStored<Appointment>('appointments'),
  );
  private readonly entries = signal<readonly FinancialEntry[]>(
    this.readStored<FinancialEntry>('finance'),
  );
  private readonly items = signal<readonly InventoryItem[]>(
    this.readStored<InventoryItem>('inventory'),
  );
  private readonly loadedSources = signal(0);
  private readonly failedSubscriptions = signal(0);

  protected readonly appointmentStatuses: readonly AppointmentStatus[] = [
    'SCHEDULED',
    'CONFIRMED',
    'COMPLETED',
    'CANCELED',
  ];
  protected readonly viewDate = signal(this.firstOfMonth(new Date()));
  protected readonly syncState = computed<'connecting' | 'online' | 'local'>(() => {
    if (this.failedSubscriptions() > 0) return 'local';
    return this.loadedSources() >= 3 ? 'online' : 'connecting';
  });
  protected readonly syncLabel = computed(() => {
    if (this.syncState() === 'online') return 'Sincronizado no Firebase';
    if (this.syncState() === 'connecting') return 'Conectando ao Firebase';
    return 'Modo local temporário';
  });
  protected readonly periodLabel = computed(() =>
    new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(this.viewDate()),
  );
  protected readonly monthlyAppointments = computed(() =>
    this.appointments().filter((appointment) => this.isInsideMonth(appointment.date)),
  );
  protected readonly upcomingAppointments = computed(() => {
    const today = this.toDateInput(new Date());
    return this.appointments()
      .filter((appointment) => appointment.date >= today && appointment.status !== 'CANCELED')
      .slice(0, 6);
  });
  protected readonly lowStockItems = computed(() =>
    this.items()
      .filter((item) => item.status === 'ACTIVE' && item.quantity <= item.minimumQuantity)
      .slice(0, 6),
  );
  protected readonly monthlyPaidIncomeCents = computed(() =>
    this.sumEntries((entry) => entry.type === 'INCOME' && entry.status === 'PAID'),
  );
  protected readonly monthlyOpenIncomeCents = computed(() =>
    this.sumEntries((entry) => entry.type === 'INCOME' && entry.status === 'OPEN'),
  );
  protected readonly monthlyExpenseCents = computed(() =>
    this.sumEntries((entry) => entry.type === 'EXPENSE' && entry.status !== 'CANCELED'),
  );
  protected readonly monthlyBalanceCents = computed(
    () => this.monthlyPaidIncomeCents() - this.monthlyExpenseCents(),
  );

  constructor() {
    effect((onCleanup) => {
      const clinicId = this.activeClinicId();
      let disposed = false;
      const unsubscribes: (() => void)[] = [];
      this.loadedSources.set(0);
      this.failedSubscriptions.set(0);

      const markLoaded = () => this.loadedSources.update((value) => Math.min(3, value + 1));
      const markFailed = (error: unknown) => {
        if (disposed) return;
        console.warn('Using local report storage.', error);
        this.failedSubscriptions.update((value) => value + 1);
      };

      void this.appointmentsRepository
        .subscribe(
          clinicId,
          (appointments) => {
            if (disposed) return;
            this.appointments.set(appointments);
            this.writeStored('appointments', appointments);
            markLoaded();
          },
          markFailed,
        )
        .then((unsubscribe) => (disposed ? unsubscribe() : unsubscribes.push(unsubscribe)))
        .catch(markFailed);

      void this.financeRepository
        .subscribe(
          clinicId,
          (entries) => {
            if (disposed) return;
            this.entries.set(entries);
            this.writeStored('finance', entries);
            markLoaded();
          },
          markFailed,
        )
        .then((unsubscribe) => (disposed ? unsubscribe() : unsubscribes.push(unsubscribe)))
        .catch(markFailed);

      void this.inventoryRepository
        .subscribe(
          clinicId,
          (items) => {
            if (disposed) return;
            this.items.set(items);
            this.writeStored('inventory', items);
            markLoaded();
          },
          markFailed,
        )
        .then((unsubscribe) => (disposed ? unsubscribe() : unsubscribes.push(unsubscribe)))
        .catch(markFailed);

      onCleanup(() => {
        disposed = true;
        unsubscribes.forEach((unsubscribe) => unsubscribe());
      });
    });
  }

  protected changeMonth(delta: number): void {
    const current = this.viewDate();
    this.viewDate.set(new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  protected selectCurrentMonth(): void {
    this.viewDate.set(this.firstOfMonth(new Date()));
  }

  protected appointmentStatusCount(status: AppointmentStatus): number {
    return this.monthlyAppointments().filter((appointment) => appointment.status === status).length;
  }

  protected appointmentStatusLabel(status: AppointmentStatus): string {
    return {
      SCHEDULED: 'Agendado',
      CONFIRMED: 'Confirmado',
      COMPLETED: 'Concluído',
      CANCELED: 'Cancelado',
    }[status];
  }

  protected formatMoney(cents: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      cents / 100,
    );
  }

  protected formatDate(value: string): string {
    const [year, month, day] = value.split('-').map(Number);
    return new Intl.DateTimeFormat('pt-BR').format(new Date(year, month - 1, day));
  }

  private sumEntries(predicate: (entry: FinancialEntry) => boolean): number {
    return this.entries()
      .filter((entry) => this.isInsideMonth(entry.dueDate) && predicate(entry))
      .reduce((total, entry) => total + entry.amountCents, 0);
  }

  private isInsideMonth(date: string): boolean {
    const current = this.viewDate();
    const start = this.toDateInput(new Date(current.getFullYear(), current.getMonth(), 1));
    const end = this.toDateInput(new Date(current.getFullYear(), current.getMonth() + 1, 0));
    return date >= start && date <= end;
  }

  private readStored<T extends Appointment | FinancialEntry | InventoryItem>(
    key: keyof typeof STORAGE_KEYS,
  ): readonly T[] {
    try {
      const value = globalThis.localStorage?.getItem(this.storageKey(key));
      if (!value) return [];
      const parsed = JSON.parse(value) as T[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeStored(
    key: keyof typeof STORAGE_KEYS,
    value: readonly Appointment[] | readonly FinancialEntry[] | readonly InventoryItem[],
  ): void {
    try {
      globalThis.localStorage?.setItem(this.storageKey(key), JSON.stringify(value));
    } catch {
      // Reports are read-only; failing to cache locally should not affect the page.
    }
  }

  private storageKey(key: keyof typeof STORAGE_KEYS): string {
    return `${STORAGE_KEYS[key]}.${this.activeClinicId()}`;
  }

  private activeClinicId(): string {
    return this.auth.tenantContext()?.activeClinicId ?? 'provisional-clinic';
  }

  private toDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private firstOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
}
