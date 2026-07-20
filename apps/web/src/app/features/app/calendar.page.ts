import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AuthStore } from '../../core/auth/auth.store';
import { IconComponent } from '../../shared/components/icon.component';
import {
  AppointmentsRepository,
  type Appointment,
  type AppointmentStatus,
} from './appointments.repository';

interface CalendarDay {
  readonly date: number;
  readonly value: Date;
  readonly currentMonth: boolean;
  readonly selected: boolean;
  readonly today: boolean;
  readonly appointmentCount: number;
}

interface WeekDay {
  readonly value: Date;
  readonly key: string;
  readonly weekday: string;
  readonly date: string;
  readonly selected: boolean;
  readonly today: boolean;
}

type CalendarViewMode = 'month' | 'week';

const STORAGE_PREFIX = 'odontogest.appointments';

@Component({
  selector: 'og-calendar-page',
  imports: [ReactiveFormsModule, MatButtonModule, IconComponent],
  template: `
    <main class="agenda-page">
      <section class="page-heading">
        <div>
          <span class="eyebrow">ATENDIMENTOS</span>
          <h2>Agenda da clínica</h2>
          <p>Crie, acompanhe e organize os atendimentos do dia.</p>
          <span class="sync-pill" [class.sync-pill--local]="syncState() === 'local'">
            <og-icon [name]="syncState() === 'online' ? 'verified_user' : 'inventory_2'" />
            {{ syncLabel() }}
          </span>
        </div>
        <button mat-flat-button type="button" (click)="startNewAppointment()">
          <og-icon name="add" />Novo agendamento
        </button>
      </section>

      <section class="agenda-layout">
        <article class="calendar-card">
          <header class="calendar-toolbar">
            <div>
              <button
                mat-icon-button
                type="button"
                [attr.aria-label]="viewMode() === 'month' ? 'Mês anterior' : 'Semana anterior'"
                (click)="changePeriod(-1)"
              >
                <og-icon name="chevron_left" />
              </button>
              <button
                mat-icon-button
                type="button"
                [attr.aria-label]="viewMode() === 'month' ? 'Próximo mês' : 'Próxima semana'"
                (click)="changePeriod(1)"
              >
                <og-icon name="chevron_right" />
              </button>
              <h3>{{ viewMode() === 'month' ? monthLabel() : weekLabel() }}</h3>
            </div>
            <div class="calendar-toolbar__actions">
              <div class="view-toggle" aria-label="Alternar visualização">
                <button
                  type="button"
                  [class.active]="viewMode() === 'month'"
                  (click)="setViewMode('month')"
                >
                  Mês
                </button>
                <button
                  type="button"
                  [class.active]="viewMode() === 'week'"
                  (click)="setViewMode('week')"
                >
                  Semana
                </button>
              </div>
              <button mat-stroked-button type="button" (click)="goToday()">Hoje</button>
            </div>
          </header>

          @if (viewMode() === 'month') {
            <div class="calendar-grid weekday-row" aria-hidden="true">
              @for (weekday of weekdays; track weekday) {
                <span>{{ weekday }}</span>
              }
            </div>
            <div class="calendar-grid days-grid">
              @for (day of days(); track day.value.toISOString()) {
                <button
                  type="button"
                  class="day"
                  [class.day--outside]="!day.currentMonth"
                  [class.day--selected]="day.selected"
                  [class.day--today]="day.today"
                  (click)="selectDay(day.value)"
                >
                  <span>{{ day.date }}</span>
                  @if (day.appointmentCount > 0) {
                    <strong>{{ day.appointmentCount }}</strong>
                  }
                </button>
              }
            </div>
          } @else {
            <div class="week-schedule" aria-label="Agenda semanal">
              <div class="week-header">
                <span class="time-gutter">Horário</span>
                @for (day of weekDays(); track day.key) {
                  <button
                    type="button"
                    class="week-day"
                    [class.week-day--selected]="day.selected"
                    [class.week-day--today]="day.today"
                    (click)="selectDay(day.value)"
                  >
                    <small>{{ day.weekday }}</small>
                    <strong>{{ day.date }}</strong>
                  </button>
                }
              </div>

              <div class="week-body">
                @for (slot of timeSlots; track slot) {
                  <div class="week-row">
                    <time>{{ slot }}</time>
                    @for (day of weekDays(); track day.key) {
                      <button
                        type="button"
                        class="week-cell"
                        [class.week-cell--selected]="day.selected"
                        (click)="startAppointmentAt(day.value, slot)"
                      >
                        @for (
                          appointment of appointmentsForSlot(day.key, slot);
                          track appointment.id
                        ) {
                          <span
                            class="week-appointment"
                            [class.week-appointment--muted]="appointment.status === 'CANCELED'"
                          >
                            <strong>{{ appointment.patientName }}</strong>
                            <small>{{ appointment.procedureName }}</small>
                          </span>
                        }
                      </button>
                    }
                  </div>
                }
              </div>
            </div>
          }
        </article>

        <aside class="agenda-side">
          <section class="day-panel">
            <header>
              <span class="day-panel__icon"><og-icon name="today" /></span>
              <div>
                <small>DATA SELECIONADA</small><strong>{{ selectedDateLabel() }}</strong>
              </div>
            </header>

            @if (selectedAppointments().length > 0) {
              <div class="appointments">
                @for (appointment of selectedAppointments(); track appointment.id) {
                  <article
                    class="appointment"
                    [class.appointment--muted]="appointment.status === 'CANCELED'"
                  >
                    <time>{{ appointment.startTime }}</time>
                    <div>
                      <strong>{{ appointment.patientName }}</strong>
                      <span
                        >{{ appointment.procedureName }} ·
                        {{ appointment.durationMinutes }} min</span
                      >
                      <small>{{ appointment.dentistName }}</small>
                    </div>
                    <em [class]="'status status--' + appointment.status.toLowerCase()">{{
                      statusLabel(appointment.status)
                    }}</em>
                    <nav aria-label="Ações do agendamento">
                      <button type="button" (click)="editAppointment(appointment)">Editar</button>
                      @if (appointment.status !== 'COMPLETED') {
                        <button type="button" (click)="completeAppointment(appointment.id)">
                          Concluir
                        </button>
                      }
                      @if (appointment.status !== 'CANCELED') {
                        <button type="button" (click)="cancelAppointment(appointment.id)">
                          Cancelar
                        </button>
                      }
                    </nav>
                  </article>
                }
              </div>
            } @else {
              <div class="empty-state">
                <span><og-icon name="event_available" /></span>
                <strong>Agenda livre</strong>
                <p>Nenhum atendimento registrado para esta data.</p>
              </div>
            }
          </section>

          <form class="appointment-form" [formGroup]="form" (ngSubmit)="saveAppointment()">
            <header>
              <h3>{{ editingId() ? 'Editar agendamento' : 'Novo agendamento' }}</h3>
              <button type="button" (click)="startNewAppointment()">Limpar</button>
            </header>

            <label>
              Paciente
              <input
                formControlName="patientName"
                autocomplete="off"
                placeholder="Nome do paciente"
              />
            </label>
            <label>
              Profissional
              <input
                formControlName="dentistName"
                autocomplete="off"
                placeholder="Dentista responsável"
              />
            </label>
            <label>
              Procedimento
              <input
                formControlName="procedureName"
                autocomplete="off"
                placeholder="Ex.: Avaliação"
              />
            </label>
            <div class="form-grid">
              <label>
                Data
                <input formControlName="date" type="date" />
              </label>
              <label>
                Horário
                <input formControlName="startTime" type="time" step="1800" />
              </label>
              <label>
                Duração
                <input formControlName="durationMinutes" type="number" min="10" step="5" />
              </label>
              <label>
                Status
                <select formControlName="status">
                  <option value="SCHEDULED">Agendado</option>
                  <option value="CONFIRMED">Confirmado</option>
                  <option value="COMPLETED">Concluído</option>
                  <option value="CANCELED">Cancelado</option>
                </select>
              </label>
            </div>
            <label>
              Observações
              <textarea formControlName="notes" rows="3" placeholder="Anotações rápidas"></textarea>
            </label>

            @if (formError()) {
              <p class="form-error">{{ formError() }}</p>
            }

            <button mat-flat-button type="submit">
              {{ editingId() ? 'Salvar alterações' : 'Criar agendamento' }}
            </button>
          </form>
        </aside>
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
      margin-bottom: 1.5rem;
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
    }
    .page-heading p,
    .appointment span,
    .appointment small {
      margin: 0;
      color: #718198;
      font-size: 0.82rem;
    }
    .sync-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      width: fit-content;
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
    .page-heading button {
      border-radius: 0.75rem;
    }
    .agenda-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(22rem, 28rem);
      gap: 1rem;
      align-items: start;
    }
    .calendar-card,
    .day-panel,
    .appointment-form {
      overflow: hidden;
      border: 1px solid #e4eaf1;
      border-radius: 0.9rem;
      background: #fff;
      box-shadow: 0 5px 18px rgb(15 23 42 / 4%);
    }
    .calendar-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      min-height: 4.8rem;
      padding: 0.8rem 1.1rem;
      border-bottom: 1px solid #edf1f5;
    }
    .calendar-toolbar > div {
      display: flex;
      align-items: center;
    }
    .calendar-toolbar h3 {
      min-width: 12rem;
      margin: 0 0 0 0.6rem;
      font-size: 1rem;
      text-transform: capitalize;
    }
    .calendar-toolbar__actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
    }
    .view-toggle {
      display: inline-flex;
      overflow: hidden;
      border: 1px solid #dbe3ed;
      border-radius: 0.75rem;
      background: #f8fafc;
    }
    .view-toggle button {
      border: 0;
      padding: 0.55rem 0.8rem;
      color: #64748b;
      background: transparent;
      font: inherit;
      font-size: 0.74rem;
      font-weight: 800;
      cursor: pointer;
    }
    .view-toggle button.active {
      color: #fff;
      background: #2563eb;
    }
    .calendar-grid {
      display: grid;
      grid-template-columns: repeat(7, minmax(0, 1fr));
    }
    .weekday-row {
      padding: 0.7rem 0.6rem;
      border-bottom: 1px solid #edf1f5;
      color: #8a99ad;
      background: #fafbfd;
      font-size: 0.65rem;
      font-weight: 800;
      text-align: center;
      text-transform: uppercase;
    }
    .days-grid {
      padding: 0.6rem;
    }
    .day {
      position: relative;
      min-height: 6.2rem;
      padding: 0.7rem;
      border: 0;
      border-right: 1px solid #edf1f5;
      border-bottom: 1px solid #edf1f5;
      color: #344861;
      background: #fff;
      font: inherit;
      text-align: left;
      cursor: pointer;
    }
    .day:nth-child(7n) {
      border-right: 0;
    }
    .day:nth-last-child(-n + 7) {
      border-bottom: 0;
    }
    .day:hover {
      background: #f5f8fd;
    }
    .day > span {
      display: grid;
      width: 1.75rem;
      height: 1.75rem;
      place-items: center;
      border-radius: 50%;
      font-size: 0.74rem;
      font-weight: 650;
    }
    .day > strong {
      position: absolute;
      right: 0.7rem;
      bottom: 0.7rem;
      display: grid;
      min-width: 1.35rem;
      height: 1.35rem;
      place-items: center;
      border-radius: 99px;
      color: #075fc5;
      background: #eaf2ff;
      font-size: 0.68rem;
    }
    .day--outside {
      color: #b2bdca;
      background: #fbfcfd;
    }
    .day--selected {
      background: #f3f7ff;
      box-shadow: inset 0 0 0 1px #8bb3f5;
    }
    .day--today > span {
      color: #fff;
      background: #2563eb;
      box-shadow: 0 5px 12px rgb(37 99 235 / 25%);
    }
    .week-schedule {
      overflow: auto;
      background: #fff;
    }
    .week-header,
    .week-row {
      display: grid;
      grid-template-columns: 5.25rem repeat(7, minmax(8.5rem, 1fr));
      min-width: 65rem;
    }
    .time-gutter,
    .week-day,
    .week-row time,
    .week-cell {
      border: 0;
      border-right: 1px solid #edf1f5;
      border-bottom: 1px solid #edf1f5;
      background: #fff;
    }
    .time-gutter {
      display: grid;
      place-items: center;
      color: #8a99ad;
      background: #fafbfd;
      font-size: 0.65rem;
      font-weight: 850;
      text-transform: uppercase;
    }
    .week-day {
      display: grid;
      gap: 0.15rem;
      min-height: 4rem;
      place-items: center;
      color: #344861;
      font: inherit;
      cursor: pointer;
    }
    .week-day small {
      color: #8a99ad;
      font-size: 0.65rem;
      font-weight: 850;
      text-transform: uppercase;
    }
    .week-day strong {
      font-size: 0.86rem;
    }
    .week-day--selected {
      background: #f3f7ff;
      box-shadow: inset 0 -2px 0 #2563eb;
    }
    .week-day--today strong {
      display: grid;
      min-width: 1.9rem;
      height: 1.9rem;
      place-items: center;
      border-radius: 99px;
      color: #fff;
      background: #2563eb;
    }
    .week-row time {
      display: grid;
      min-height: 4.25rem;
      place-items: start center;
      padding-top: 0.7rem;
      color: #718198;
      background: #fafbfd;
      font-size: 0.72rem;
      font-weight: 800;
    }
    .week-cell {
      display: grid;
      align-content: start;
      gap: 0.35rem;
      min-height: 4.25rem;
      padding: 0.35rem;
      cursor: pointer;
    }
    .week-cell:hover,
    .week-cell--selected {
      background: #f8fbff;
    }
    .week-appointment {
      display: grid;
      gap: 0.1rem;
      border-left: 3px solid #2563eb;
      border-radius: 0.45rem;
      padding: 0.35rem 0.45rem;
      color: #12335f;
      background: #eaf2ff;
      text-align: left;
    }
    .week-appointment--muted {
      border-left-color: #94a3b8;
      color: #64748b;
      background: #f1f5f9;
      opacity: 0.75;
    }
    .week-appointment strong {
      overflow: hidden;
      font-size: 0.68rem;
      font-weight: 850;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .week-appointment small {
      overflow: hidden;
      color: currentColor;
      font-size: 0.62rem;
      opacity: 0.78;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .agenda-side {
      display: grid;
      gap: 1rem;
    }
    .day-panel > header,
    .appointment-form header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.7rem;
      padding: 1rem 1.1rem;
      border-bottom: 1px solid #edf1f5;
    }
    .day-panel > header {
      justify-content: flex-start;
    }
    .day-panel__icon {
      display: grid;
      width: 2.35rem;
      height: 2.35rem;
      place-items: center;
      border-radius: 0.75rem;
      color: #2563eb;
      background: #edf4ff;
    }
    .day-panel__icon og-icon {
      width: 1.1rem;
      height: 1.1rem;
    }
    .day-panel small,
    .day-panel strong {
      display: block;
    }
    .day-panel small {
      margin-bottom: 0.2rem;
      color: #8998aa;
      font-size: 0.58rem;
      font-weight: 800;
      letter-spacing: 0.08em;
    }
    .day-panel strong {
      font-size: 0.8rem;
      text-transform: capitalize;
    }
    .appointments {
      display: grid;
      gap: 0.75rem;
      padding: 1rem;
    }
    .appointment {
      display: grid;
      grid-template-columns: 3.5rem 1fr auto;
      gap: 0.75rem;
      padding: 0.85rem;
      border: 1px solid #e8edf3;
      border-radius: 0.75rem;
      background: #fafbfd;
    }
    .appointment--muted {
      opacity: 0.65;
    }
    .appointment time {
      color: #2563eb;
      font-size: 0.82rem;
      font-weight: 800;
    }
    .appointment div strong {
      display: block;
      margin-bottom: 0.15rem;
      font-size: 0.86rem;
    }
    .appointment em {
      align-self: start;
      border-radius: 99px;
      padding: 0.22rem 0.55rem;
      font-size: 0.62rem;
      font-style: normal;
      font-weight: 800;
      white-space: nowrap;
    }
    .status--scheduled {
      color: #1d4ed8;
      background: #eaf2ff;
    }
    .status--confirmed {
      color: #047857;
      background: #e6f8f1;
    }
    .status--completed {
      color: #334155;
      background: #eef2f7;
    }
    .status--canceled {
      color: #b42318;
      background: #fff0ee;
    }
    .appointment nav {
      grid-column: 2/-1;
      display: flex;
      flex-wrap: wrap;
      gap: 0.4rem;
    }
    .appointment nav button,
    .appointment-form header button {
      border: 0;
      color: #2563eb;
      background: transparent;
      font: inherit;
      font-size: 0.72rem;
      font-weight: 750;
      cursor: pointer;
    }
    .empty-state {
      display: grid;
      justify-items: center;
      padding: 3rem 1rem;
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
      margin: 0.25rem 0 0;
      font-size: 0.7rem;
      line-height: 1.5;
    }
    .appointment-form {
      display: grid;
      gap: 0.85rem;
      padding: 0 1rem 1rem;
    }
    .appointment-form h3 {
      margin: 0;
      font-size: 0.95rem;
    }
    .appointment-form label {
      display: grid;
      gap: 0.32rem;
      color: #5d7089;
      font-size: 0.68rem;
      font-weight: 800;
    }
    .appointment-form input,
    .appointment-form select,
    .appointment-form textarea {
      width: 100%;
      min-height: 2.45rem;
      border: 1px solid #d9e2ed;
      border-radius: 0.65rem;
      padding: 0.6rem 0.7rem;
      color: #10213a;
      background: #fff;
      font: inherit;
      font-size: 0.78rem;
      outline: none;
    }
    .appointment-form textarea {
      resize: vertical;
    }
    .appointment-form input:focus,
    .appointment-form select:focus,
    .appointment-form textarea:focus {
      border-color: #8bb3f5;
      box-shadow: 0 0 0 3px rgb(37 99 235 / 10%);
    }
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }
    .form-error {
      margin: 0;
      padding: 0.75rem;
      border-radius: 0.65rem;
      color: #b42318;
      background: #fff0ee;
      font-size: 0.74rem;
      font-weight: 650;
    }
    @media (width < 72rem) {
      .agenda-layout {
        grid-template-columns: 1fr;
      }
    }
    @media (width < 48rem) {
      .page-heading {
        align-items: flex-start;
        flex-direction: column;
      }
      .calendar-card {
        overflow-x: auto;
      }
      .calendar-toolbar,
      .calendar-grid,
      .week-header,
      .week-row {
        min-width: 43rem;
      }
      .calendar-toolbar {
        align-items: flex-start;
        flex-direction: column;
      }
      .day {
        min-height: 4.5rem;
      }
    }
    @media (width < 34rem) {
      .form-grid,
      .appointment {
        grid-template-columns: 1fr;
      }
      .appointment nav {
        grid-column: auto;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthStore);
  private readonly appointmentsRepository = inject(AppointmentsRepository);
  private readonly viewDate = signal(this.firstOfMonth(new Date()));
  private readonly selectedDate = signal(new Date());
  private readonly appointments = signal<readonly Appointment[]>(this.readStoredAppointments());

  protected readonly weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  protected readonly timeSlots = this.buildTimeSlots('07:00', '20:00', 30);
  protected readonly viewMode = signal<CalendarViewMode>('month');
  protected readonly editingId = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly syncState = signal<'connecting' | 'online' | 'local'>('connecting');
  protected readonly syncLabel = computed(() => {
    if (this.syncState() === 'online') return 'Sincronizado no Firebase';
    if (this.syncState() === 'connecting') return 'Conectando ao Firebase';
    return 'Modo local temporário';
  });
  protected readonly form = this.formBuilder.nonNullable.group({
    patientName: ['', [Validators.required, Validators.maxLength(180)]],
    dentistName: ['', [Validators.required, Validators.maxLength(160)]],
    procedureName: ['Avaliação', [Validators.required, Validators.maxLength(120)]],
    date: [this.toDateInput(new Date()), Validators.required],
    startTime: ['09:00', Validators.required],
    durationMinutes: [30, [Validators.required, Validators.min(10), Validators.max(480)]],
    status: ['SCHEDULED' as AppointmentStatus, Validators.required],
    notes: ['', Validators.maxLength(500)],
  });
  protected readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(this.viewDate()),
  );
  protected readonly weekLabel = computed(() => {
    const week = this.weekDays();
    const first = week[0]?.value ?? this.selectedDate();
    const last = week[week.length - 1]?.value ?? this.selectedDate();
    const firstLabel = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
    }).format(first);
    const lastLabel = new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(last);
    return `${firstLabel} – ${lastLabel}`;
  });
  protected readonly selectedDateLabel = computed(() =>
    new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(
      this.selectedDate(),
    ),
  );
  protected readonly selectedAppointments = computed(() => {
    const selected = this.toDateInput(this.selectedDate());
    return this.appointments()
      .filter((appointment) => appointment.date === selected)
      .sort((first, second) => first.startTime.localeCompare(second.startTime));
  });
  protected readonly days = computed<CalendarDay[]>(() => {
    const current = this.viewDate();
    const year = current.getFullYear();
    const month = current.getMonth();
    const startOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const gridStart = new Date(year, month, 1 - startOffset);
    const today = new Date();
    const selected = this.selectedDate();

    return Array.from({ length: 42 }, (_, index) => {
      const date = new Date(gridStart);
      date.setDate(gridStart.getDate() + index);
      const dateKey = this.toDateInput(date);
      return {
        date: date.getDate(),
        value: date,
        currentMonth: date.getMonth() === month,
        selected: this.isSameDate(date, selected),
        today: this.isSameDate(date, today),
        appointmentCount: this.appointments().filter(
          (appointment) => appointment.date === dateKey && appointment.status !== 'CANCELED',
        ).length,
      };
    });
  });
  protected readonly weekDays = computed<WeekDay[]>(() => {
    const selected = this.selectedDate();
    const today = new Date();
    const start = this.startOfWeek(selected);
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date(start);
      date.setDate(start.getDate() + index);
      return {
        value: date,
        key: this.toDateInput(date),
        weekday: new Intl.DateTimeFormat('pt-BR', { weekday: 'short' }).format(date),
        date: new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' }).format(date),
        selected: this.isSameDate(date, selected),
        today: this.isSameDate(date, today),
      };
    });
  });

  constructor() {
    effect((onCleanup) => {
      const clinicId = this.activeClinicId();
      let disposed = false;
      let unsubscribe: (() => void) | null = null;
      this.syncState.set('connecting');

      void this.appointmentsRepository
        .subscribe(
          clinicId,
          (appointments) => {
            if (disposed) return;
            this.syncState.set('online');
            this.setAppointments(appointments);
          },
          (error) => {
            if (disposed) return;
            console.warn('Using local appointment storage.', error);
            this.syncState.set('local');
            this.appointments.set(this.readStoredAppointments());
          },
        )
        .then((nextUnsubscribe) => {
          if (disposed) {
            nextUnsubscribe();
            return;
          }
          unsubscribe = nextUnsubscribe;
        })
        .catch((error) => {
          if (disposed) return;
          console.warn('Using local appointment storage.', error);
          this.syncState.set('local');
          this.appointments.set(this.readStoredAppointments());
        });

      onCleanup(() => {
        disposed = true;
        unsubscribe?.();
      });
    });
  }

  protected changeMonth(delta: number): void {
    const current = this.viewDate();
    this.viewDate.set(new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  protected changePeriod(delta: number): void {
    if (this.viewMode() === 'month') {
      this.changeMonth(delta);
      return;
    }

    const next = new Date(this.selectedDate());
    next.setDate(next.getDate() + delta * 7);
    this.selectDay(next);
  }

  protected setViewMode(mode: CalendarViewMode): void {
    this.viewMode.set(mode);
    if (mode === 'month') this.viewDate.set(this.firstOfMonth(this.selectedDate()));
  }

  protected goToday(): void {
    const today = new Date();
    this.viewDate.set(this.firstOfMonth(today));
    this.selectDay(today);
  }

  protected selectDay(date: Date): void {
    this.selectedDate.set(date);
    this.form.controls.date.setValue(this.toDateInput(date));
    if (date.getMonth() !== this.viewDate().getMonth()) this.viewDate.set(this.firstOfMonth(date));
  }

  protected startAppointmentAt(date: Date, startTime: string): void {
    this.selectDay(date);
    this.editingId.set(null);
    this.formError.set(null);
    this.form.reset({
      patientName: '',
      dentistName: '',
      procedureName: 'Avaliação',
      date: this.toDateInput(date),
      startTime,
      durationMinutes: 30,
      status: 'SCHEDULED',
      notes: '',
    });
  }

  protected startNewAppointment(): void {
    this.editingId.set(null);
    this.formError.set(null);
    this.form.reset({
      patientName: '',
      dentistName: '',
      procedureName: 'Avaliação',
      date: this.toDateInput(this.selectedDate()),
      startTime: '09:00',
      durationMinutes: 30,
      status: 'SCHEDULED',
      notes: '',
    });
  }

  protected editAppointment(appointment: Appointment): void {
    this.editingId.set(appointment.id);
    this.formError.set(null);
    this.form.setValue({
      patientName: appointment.patientName,
      dentistName: appointment.dentistName,
      procedureName: appointment.procedureName,
      date: appointment.date,
      startTime: appointment.startTime,
      durationMinutes: appointment.durationMinutes,
      status: appointment.status,
      notes: appointment.notes ?? '',
    });
  }

  protected async saveAppointment(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set('Preencha paciente, profissional, procedimento, data e horário.');
      return;
    }

    const value = this.form.getRawValue();
    const now = new Date().toISOString();
    const existingId = this.editingId();
    const clinicId = this.activeClinicId();
    const userId = await this.currentUserIdForWrite();
    const next: Appointment = {
      id: existingId ?? crypto.randomUUID(),
      clinicId,
      userId,
      date: value.date,
      startTime: value.startTime,
      durationMinutes: value.durationMinutes,
      patientName: value.patientName.trim(),
      dentistName: value.dentistName.trim(),
      procedureName: value.procedureName.trim(),
      status: value.status,
      notes: value.notes.trim() || null,
      createdAt: this.appointments().find((item) => item.id === existingId)?.createdAt ?? now,
      updatedAt: now,
    };

    if (this.hasConflict(next)) {
      this.formError.set('Já existe um agendamento ativo para este profissional neste horário.');
      return;
    }

    const updated = existingId
      ? this.appointments().map((item) => (item.id === existingId ? next : item))
      : [...this.appointments(), next];
    this.setAppointments(updated);
    this.selectDay(this.fromDateInput(next.date));
    this.startNewAppointment();
    await this.persistAppointment(next);
  }

  protected completeAppointment(id: string): void {
    void this.updateStatus(id, 'COMPLETED');
  }

  protected cancelAppointment(id: string): void {
    void this.updateStatus(id, 'CANCELED');
  }

  protected statusLabel(status: AppointmentStatus): string {
    return {
      SCHEDULED: 'Agendado',
      CONFIRMED: 'Confirmado',
      COMPLETED: 'Concluído',
      CANCELED: 'Cancelado',
    }[status];
  }

  protected appointmentsForSlot(date: string, startTime: string): readonly Appointment[] {
    return this.appointments().filter(
      (appointment) =>
        appointment.date === date && this.slotForTime(appointment.startTime) === startTime,
    );
  }

  private async updateStatus(id: string, status: AppointmentStatus): Promise<void> {
    const now = new Date().toISOString();
    const appointment = this.appointments().find((item) => item.id === id);
    if (!appointment) return;
    this.setAppointments(
      this.appointments().map((item) =>
        item.id === id ? { ...item, status, updatedAt: now } : item,
      ),
    );
    try {
      await this.appointmentsRepository.updateStatus({
        id,
        clinicId: appointment.clinicId,
        status,
        updatedAt: now,
      });
      this.syncState.set('online');
    } catch (error) {
      console.warn('Could not sync appointment status.', error);
      this.syncState.set('local');
      this.formError.set(
        'Status salvo neste navegador. Ative/verifique o Firestore para sincronizar.',
      );
    }
  }

  private hasConflict(candidate: Appointment): boolean {
    if (candidate.status === 'CANCELED') return false;
    return this.appointments().some(
      (appointment) =>
        appointment.id !== candidate.id &&
        appointment.status !== 'CANCELED' &&
        appointment.date === candidate.date &&
        appointment.startTime === candidate.startTime &&
        appointment.dentistName.toLocaleLowerCase('pt-BR') ===
          candidate.dentistName.toLocaleLowerCase('pt-BR'),
    );
  }

  private setAppointments(appointments: readonly Appointment[]): void {
    const sorted = [...appointments].sort(
      (first, second) =>
        first.date.localeCompare(second.date) || first.startTime.localeCompare(second.startTime),
    );
    this.appointments.set(sorted);
    this.writeStoredAppointments(sorted);
  }

  private async persistAppointment(appointment: Appointment): Promise<void> {
    try {
      await this.appointmentsRepository.upsert(appointment);
      this.syncState.set('online');
    } catch (error) {
      console.warn('Could not sync appointment.', error);
      this.syncState.set('local');
      this.formError.set(
        'Agendamento salvo neste navegador. Ative/verifique o Firestore para sincronizar.',
      );
    }
  }

  private async currentUserIdForWrite(): Promise<string> {
    try {
      return await this.appointmentsRepository.currentUserId();
    } catch {
      return this.auth.user()?.id ?? 'local-user';
    }
  }

  private readStoredAppointments(): readonly Appointment[] {
    try {
      const value = globalThis.localStorage?.getItem(this.storageKey());
      if (!value) return [];
      const parsed = JSON.parse(value) as Appointment[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeStoredAppointments(appointments: readonly Appointment[]): void {
    try {
      globalThis.localStorage?.setItem(this.storageKey(), JSON.stringify(appointments));
    } catch {
      this.formError.set('Não foi possível salvar neste navegador.');
    }
  }

  private storageKey(): string {
    return `${STORAGE_PREFIX}.${this.activeClinicId()}`;
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

  private fromDateInput(value: string): Date {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
  }

  private isSameDate(first: Date, second: Date): boolean {
    return (
      first.getFullYear() === second.getFullYear() &&
      first.getMonth() === second.getMonth() &&
      first.getDate() === second.getDate()
    );
  }

  private startOfWeek(date: Date): Date {
    const start = new Date(date);
    const dayOffset = (start.getDay() + 6) % 7;
    start.setDate(start.getDate() - dayOffset);
    start.setHours(0, 0, 0, 0);
    return start;
  }

  private firstOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }

  private buildTimeSlots(start: string, end: string, stepMinutes: number): readonly string[] {
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    const startTotal = startHour * 60 + startMinute;
    const endTotal = endHour * 60 + endMinute;
    const slots: string[] = [];
    for (let total = startTotal; total <= endTotal; total += stepMinutes) {
      const hour = String(Math.floor(total / 60)).padStart(2, '0');
      const minute = String(total % 60).padStart(2, '0');
      slots.push(`${hour}:${minute}`);
    }
    return slots;
  }

  private slotForTime(value: string): string {
    const [hour = 0, minute = 0] = value.split(':').map(Number);
    const roundedMinute = minute < 30 ? '00' : '30';
    return `${String(hour).padStart(2, '0')}:${roundedMinute}`;
  }
}
