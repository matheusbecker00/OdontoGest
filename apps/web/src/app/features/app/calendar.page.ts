import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AuthStore } from '../../core/auth/auth.store';
import { IconComponent } from '../../shared/components/icon.component';

interface CalendarDay {
  readonly date: number;
  readonly value: Date;
  readonly currentMonth: boolean;
  readonly selected: boolean;
  readonly today: boolean;
  readonly appointmentCount: number;
}

type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';

interface Appointment {
  readonly id: string;
  readonly clinicId: string;
  readonly date: string;
  readonly startTime: string;
  readonly durationMinutes: number;
  readonly patientName: string;
  readonly dentistName: string;
  readonly procedureName: string;
  readonly status: AppointmentStatus;
  readonly notes: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

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
                aria-label="Mês anterior"
                (click)="changeMonth(-1)"
              >
                <og-icon name="chevron_left" />
              </button>
              <button
                mat-icon-button
                type="button"
                aria-label="Próximo mês"
                (click)="changeMonth(1)"
              >
                <og-icon name="chevron_right" />
              </button>
              <h3>{{ monthLabel() }}</h3>
            </div>
            <button mat-stroked-button type="button" (click)="goToday()">Hoje</button>
          </header>

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
                <input formControlName="startTime" type="time" />
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
      .calendar-grid {
        min-width: 43rem;
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
  private readonly viewDate = signal(this.firstOfMonth(new Date()));
  private readonly selectedDate = signal(new Date());
  private readonly appointments = signal<readonly Appointment[]>(this.readStoredAppointments());

  protected readonly weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  protected readonly editingId = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
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

  protected changeMonth(delta: number): void {
    const current = this.viewDate();
    this.viewDate.set(new Date(current.getFullYear(), current.getMonth() + delta, 1));
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

  protected saveAppointment(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set('Preencha paciente, profissional, procedimento, data e horário.');
      return;
    }

    const value = this.form.getRawValue();
    const now = new Date().toISOString();
    const existingId = this.editingId();
    const next: Appointment = {
      id: existingId ?? crypto.randomUUID(),
      clinicId: this.activeClinicId(),
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
  }

  protected completeAppointment(id: string): void {
    this.updateStatus(id, 'COMPLETED');
  }

  protected cancelAppointment(id: string): void {
    this.updateStatus(id, 'CANCELED');
  }

  protected statusLabel(status: AppointmentStatus): string {
    return {
      SCHEDULED: 'Agendado',
      CONFIRMED: 'Confirmado',
      COMPLETED: 'Concluído',
      CANCELED: 'Cancelado',
    }[status];
  }

  private updateStatus(id: string, status: AppointmentStatus): void {
    const now = new Date().toISOString();
    this.setAppointments(
      this.appointments().map((item) =>
        item.id === id ? { ...item, status, updatedAt: now } : item,
      ),
    );
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

  private firstOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
}
