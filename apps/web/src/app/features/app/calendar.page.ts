import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { IconComponent } from '../../shared/components/icon.component';

interface CalendarDay {
  readonly date: number;
  readonly value: Date;
  readonly currentMonth: boolean;
  readonly selected: boolean;
  readonly today: boolean;
}

@Component({
  selector: 'og-calendar-page',
  imports: [MatButtonModule, IconComponent],
  template: `
    <main class="agenda-page">
      <section class="page-heading">
        <div>
          <span class="eyebrow">ATENDIMENTOS</span>
          <h2>Agenda da clínica</h2>
          <p>Visualize e organize a rotina de atendimentos.</p>
        </div>
        <button mat-flat-button type="button" disabled>
          <og-icon name="add" />Novo agendamento
        </button>
      </section>

      <section class="calendar-layout">
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
            @for (day of days(); track $index) {
              <button
                type="button"
                class="day"
                [class.day--outside]="!day.currentMonth"
                [class.day--selected]="day.selected"
                [class.day--today]="day.today"
                (click)="selectDay(day.value)"
              >
                <span>{{ day.date }}</span>
              </button>
            }
          </div>
        </article>

        <aside class="day-panel">
          <header>
            <span class="day-panel__icon"><og-icon name="today" /></span>
            <div>
              <small>DATA SELECIONADA</small><strong>{{ selectedDateLabel() }}</strong>
            </div>
          </header>
          <div class="empty-state">
            <span><og-icon name="event_available" /></span>
            <strong>Agenda livre</strong>
            <p>Nenhum atendimento registrado para esta data.</p>
          </div>
          <div class="notice">
            <og-icon name="info" />
            <p>O cadastro de agendamentos será conectado ao banco na próxima entrega.</p>
          </div>
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
      letter-spacing: -0.04em;
    }
    .page-heading p {
      margin: 0;
      color: #718198;
      font-size: 0.86rem;
    }
    .page-heading button {
      border-radius: 0.75rem;
    }
    .calendar-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 18rem;
      gap: 1rem;
    }
    .calendar-card,
    .day-panel {
      overflow: hidden;
      border: 1px solid #e4eaf1;
      border-radius: 1rem;
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
    .calendar-toolbar > button {
      border-color: #dbe3ed;
      border-radius: 0.65rem;
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
    .day-panel {
      height: fit-content;
    }
    .day-panel > header {
      display: flex;
      align-items: center;
      gap: 0.7rem;
      padding: 1.15rem;
      border-bottom: 1px solid #edf1f5;
    }
    .day-panel__icon {
      display: grid;
      width: 2.5rem;
      height: 2.5rem;
      place-items: center;
      border-radius: 0.75rem;
      color: #2563eb;
      background: #edf4ff;
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
    .notice {
      display: flex;
      gap: 0.55rem;
      margin: 0 0.9rem 0.9rem;
      padding: 0.8rem;
      border-radius: 0.7rem;
      color: #586b82;
      background: #f4f7fb;
    }
    .notice og-icon {
      flex: 0 0 auto;
      width: 1rem;
      height: 1rem;
      color: #2563eb;
      font-size: 1rem;
    }
    .notice p {
      margin: 0;
      font-size: 0.66rem;
      line-height: 1.5;
    }
    @media (width < 72rem) {
      .calendar-layout {
        grid-template-columns: 1fr;
      }
      .day-panel {
        display: grid;
        grid-template-columns: 18rem 1fr;
      }
      .day-panel .notice {
        display: none;
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
      .day-panel {
        display: block;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarPage {
  private readonly viewDate = signal(this.firstOfMonth(new Date()));
  private readonly selectedDate = signal(new Date());
  protected readonly weekdays = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  protected readonly monthLabel = computed(() =>
    new Intl.DateTimeFormat('pt-BR', { month: 'long', year: 'numeric' }).format(this.viewDate()),
  );
  protected readonly selectedDateLabel = computed(() =>
    new Intl.DateTimeFormat('pt-BR', { weekday: 'long', day: '2-digit', month: 'long' }).format(
      this.selectedDate(),
    ),
  );
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
      return {
        date: date.getDate(),
        value: date,
        currentMonth: date.getMonth() === month,
        selected:
          date.getFullYear() === selected.getFullYear() &&
          date.getMonth() === selected.getMonth() &&
          date.getDate() === selected.getDate(),
        today:
          date.getFullYear() === today.getFullYear() &&
          date.getMonth() === today.getMonth() &&
          date.getDate() === today.getDate(),
      };
    });
  });

  protected changeMonth(delta: number): void {
    const current = this.viewDate();
    this.viewDate.set(new Date(current.getFullYear(), current.getMonth() + delta, 1));
  }

  protected goToday(): void {
    this.viewDate.set(this.firstOfMonth(new Date()));
    this.selectedDate.set(new Date());
  }

  protected selectDay(date: Date): void {
    this.selectedDate.set(date);
    if (date.getMonth() !== this.viewDate().getMonth()) this.viewDate.set(this.firstOfMonth(date));
  }

  private firstOfMonth(date: Date): Date {
    return new Date(date.getFullYear(), date.getMonth(), 1);
  }
}
