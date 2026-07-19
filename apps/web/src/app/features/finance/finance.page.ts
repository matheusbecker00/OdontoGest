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
  FinanceRepository,
  type FinancialEntry,
  type FinancialEntryStatus,
  type FinancialEntryType,
} from './finance.repository';

const STORAGE_PREFIX = 'odontogest.finance';

@Component({
  selector: 'og-finance-page',
  imports: [ReactiveFormsModule, MatButtonModule, IconComponent],
  template: `
    <main class="finance-page">
      <section class="page-heading">
        <div>
          <span class="eyebrow">FINANCEIRO</span>
          <h2>Controle financeiro</h2>
          <p>Registre receitas, despesas e acompanhe o caixa da clínica.</p>
          <span class="sync-pill" [class.sync-pill--local]="syncState() === 'local'">
            <og-icon [name]="syncState() === 'online' ? 'verified_user' : 'inventory_2'" />
            {{ syncLabel() }}
          </span>
        </div>
      </section>

      <section class="summary-grid" aria-label="Resumo financeiro">
        <article class="summary summary--green">
          <span><og-icon name="payments" /></span>
          <div>
            <small>Recebido</small><strong>{{ formatMoney(paidIncomeCents()) }}</strong>
          </div>
        </article>
        <article class="summary summary--orange">
          <span><og-icon name="pending_actions" /></span>
          <div>
            <small>Em aberto</small><strong>{{ formatMoney(openIncomeCents()) }}</strong>
          </div>
        </article>
        <article class="summary summary--red">
          <span><og-icon name="add_card" /></span>
          <div>
            <small>Despesas</small><strong>{{ formatMoney(expenseCents()) }}</strong>
          </div>
        </article>
        <article class="summary summary--blue">
          <span><og-icon name="account_balance_wallet" /></span>
          <div>
            <small>Saldo</small><strong>{{ formatMoney(balanceCents()) }}</strong>
          </div>
        </article>
      </section>

      <section class="finance-layout">
        <article class="panel">
          <header>
            <div>
              <h3>Lançamentos</h3>
              <p>{{ filteredEntries().length }} registro(s) no filtro atual.</p>
            </div>
            <div class="filters">
              <select [value]="typeFilter()" (change)="setTypeFilter($event)">
                <option value="ALL">Todos</option>
                <option value="INCOME">Receitas</option>
                <option value="EXPENSE">Despesas</option>
              </select>
              <select [value]="statusFilter()" (change)="setStatusFilter($event)">
                <option value="ALL">Todos status</option>
                <option value="OPEN">Aberto</option>
                <option value="PAID">Pago</option>
                <option value="CANCELED">Cancelado</option>
              </select>
            </div>
          </header>

          @if (filteredEntries().length > 0) {
            <div class="entries">
              @for (entry of filteredEntries(); track entry.id) {
                <article class="entry" [class.entry--muted]="entry.status === 'CANCELED'">
                  <span class="entry__icon" [class.entry__icon--expense]="entry.type === 'EXPENSE'">
                    <og-icon [name]="entry.type === 'INCOME' ? 'payments' : 'add_card'" />
                  </span>
                  <div>
                    <strong>{{ entry.description }}</strong>
                    <small>{{ entry.category }} · venc. {{ formatDate(entry.dueDate) }}</small>
                  </div>
                  <em [class]="'status status--' + entry.status.toLowerCase()">{{
                    statusLabel(entry.status)
                  }}</em>
                  <strong class="amount" [class.amount--expense]="entry.type === 'EXPENSE'">
                    {{ entry.type === 'EXPENSE' ? '-' : '+' }}{{ formatMoney(entry.amountCents) }}
                  </strong>
                  <nav aria-label="Ações do lançamento">
                    <button type="button" (click)="editEntry(entry)">Editar</button>
                    @if (entry.status !== 'PAID') {
                      <button type="button" (click)="markPaid(entry)">Marcar pago</button>
                    }
                    @if (entry.status !== 'CANCELED') {
                      <button type="button" (click)="cancelEntry(entry)">Cancelar</button>
                    }
                  </nav>
                </article>
              }
            </div>
          } @else {
            <div class="empty-state">
              <span><og-icon name="account_balance_wallet" /></span>
              <strong>Nenhum lançamento encontrado</strong>
              <p>Crie o primeiro lançamento financeiro da clínica.</p>
            </div>
          }
        </article>

        <form class="entry-form" [formGroup]="form" (ngSubmit)="saveEntry()">
          <header>
            <h3>{{ editingId() ? 'Editar lançamento' : 'Novo lançamento' }}</h3>
            <button type="button" (click)="startNewEntry()">Limpar</button>
          </header>

          <div class="form-grid">
            <label>
              Tipo
              <select formControlName="type">
                <option value="INCOME">Receita</option>
                <option value="EXPENSE">Despesa</option>
              </select>
            </label>
            <label>
              Status
              <select formControlName="status">
                <option value="OPEN">Aberto</option>
                <option value="PAID">Pago</option>
                <option value="CANCELED">Cancelado</option>
              </select>
            </label>
          </div>
          <label>
            Descrição
            <input formControlName="description" placeholder="Ex.: Consulta particular" />
          </label>
          <label>
            Categoria
            <input formControlName="category" placeholder="Ex.: Atendimento, Material, Aluguel" />
          </label>
          <div class="form-grid">
            <label>
              Valor
              <input formControlName="amount" inputmode="decimal" placeholder="150,00" />
            </label>
            <label>
              Vencimento
              <input formControlName="dueDate" type="date" />
            </label>
          </div>
          <label>
            Observações
            <textarea formControlName="notes" rows="3" placeholder="Detalhes opcionais"></textarea>
          </label>

          @if (formError()) {
            <p class="form-error">{{ formError() }}</p>
          }

          <button mat-flat-button type="submit">
            {{ editingId() ? 'Salvar alterações' : 'Criar lançamento' }}
          </button>
        </form>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
      color: #10213a;
    }
    .page-heading {
      margin-bottom: 1.25rem;
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
    .entry small {
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
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(4, minmax(0, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .summary,
    .panel,
    .entry-form {
      border: 1px solid #e4eaf1;
      border-radius: 0.9rem;
      background: #fff;
      box-shadow: 0 5px 18px rgb(15 23 42 / 4%);
    }
    .summary {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 1rem;
    }
    .summary > span,
    .entry__icon,
    .empty-state > span {
      display: grid;
      flex: 0 0 auto;
      place-items: center;
      color: #2563eb;
      background: #eaf2ff;
    }
    .summary > span {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 0.8rem;
    }
    .summary og-icon,
    .entry__icon og-icon {
      width: 1.45rem;
      height: 1.45rem;
    }
    .summary small,
    .summary strong {
      display: block;
    }
    .summary small {
      color: #667895;
      font-size: 0.68rem;
      font-weight: 800;
    }
    .summary strong {
      margin-top: 0.1rem;
      font-size: 1.35rem;
      letter-spacing: -0.04em;
    }
    .summary--green > span {
      color: #059669;
      background: #e7f8f2;
    }
    .summary--orange > span {
      color: #ea580c;
      background: #fff1e8;
    }
    .summary--red > span {
      color: #dc2626;
      background: #fff0ee;
    }
    .finance-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(21rem, 27rem);
      gap: 1rem;
      align-items: start;
    }
    .panel,
    .entry-form {
      overflow: hidden;
    }
    .panel > header,
    .entry-form header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.1rem;
      border-bottom: 1px solid #edf1f5;
    }
    .filters,
    .form-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.65rem;
    }
    select,
    input,
    textarea {
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
    textarea {
      resize: vertical;
    }
    select:focus,
    input:focus,
    textarea:focus {
      border-color: #8bb3f5;
      box-shadow: 0 0 0 3px rgb(37 99 235 / 10%);
    }
    .entries {
      display: grid;
      gap: 0.75rem;
      padding: 1rem;
    }
    .entry {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto auto;
      align-items: center;
      gap: 0.8rem;
      border: 1px solid #e8edf3;
      border-radius: 0.8rem;
      padding: 0.85rem;
      background: #fafbfd;
    }
    .entry--muted {
      opacity: 0.65;
    }
    .entry__icon {
      width: 2.65rem;
      height: 2.65rem;
      border-radius: 0.75rem;
      color: #059669;
      background: #e7f8f2;
    }
    .entry__icon--expense {
      color: #dc2626;
      background: #fff0ee;
    }
    .entry div strong {
      display: block;
      font-size: 0.9rem;
    }
    .status {
      border-radius: 99px;
      padding: 0.24rem 0.55rem;
      font-size: 0.62rem;
      font-style: normal;
      font-weight: 850;
      white-space: nowrap;
    }
    .status--open {
      color: #b45309;
      background: #fff7ed;
    }
    .status--paid {
      color: #047857;
      background: #ecfdf5;
    }
    .status--canceled {
      color: #b42318;
      background: #fff0ee;
    }
    .amount {
      color: #047857;
      font-size: 0.95rem;
      white-space: nowrap;
    }
    .amount--expense {
      color: #dc2626;
    }
    .entry nav {
      grid-column: 2/-1;
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }
    .entry nav button,
    .entry-form header button {
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
    .entry-form {
      display: grid;
      gap: 0.85rem;
      padding: 0 1rem 1rem;
    }
    .entry-form label {
      display: grid;
      gap: 0.32rem;
      color: #5d7089;
      font-size: 0.68rem;
      font-weight: 800;
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
    @media (width < 76rem) {
      .summary-grid {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
      .finance-layout {
        grid-template-columns: 1fr;
      }
    }
    @media (width < 42rem) {
      .summary-grid,
      .filters,
      .form-grid,
      .entry {
        grid-template-columns: 1fr;
      }
      .panel > header {
        align-items: flex-start;
        flex-direction: column;
      }
      .entry nav {
        grid-column: auto;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FinancePage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthStore);
  private readonly finance = inject(FinanceRepository);
  private readonly entries = signal<readonly FinancialEntry[]>(this.readStoredEntries());

  protected readonly editingId = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly syncState = signal<'connecting' | 'online' | 'local'>('connecting');
  protected readonly typeFilter = signal<FinancialEntryType | 'ALL'>('ALL');
  protected readonly statusFilter = signal<FinancialEntryStatus | 'ALL'>('ALL');
  protected readonly syncLabel = computed(() => {
    if (this.syncState() === 'online') return 'Sincronizado no Firebase';
    if (this.syncState() === 'connecting') return 'Conectando ao Firebase';
    return 'Modo local temporário';
  });
  protected readonly form = this.formBuilder.nonNullable.group({
    type: ['INCOME' as FinancialEntryType, Validators.required],
    status: ['OPEN' as FinancialEntryStatus, Validators.required],
    description: ['', [Validators.required, Validators.maxLength(180)]],
    category: ['Atendimento', [Validators.required, Validators.maxLength(100)]],
    amount: ['', Validators.required],
    dueDate: [this.toDateInput(new Date()), Validators.required],
    notes: ['', Validators.maxLength(500)],
  });
  protected readonly filteredEntries = computed(() =>
    this.entries().filter(
      (entry) =>
        (this.typeFilter() === 'ALL' || entry.type === this.typeFilter()) &&
        (this.statusFilter() === 'ALL' || entry.status === this.statusFilter()),
    ),
  );
  protected readonly paidIncomeCents = computed(() =>
    this.sum((entry) => entry.type === 'INCOME' && entry.status === 'PAID'),
  );
  protected readonly openIncomeCents = computed(() =>
    this.sum((entry) => entry.type === 'INCOME' && entry.status === 'OPEN'),
  );
  protected readonly expenseCents = computed(() =>
    this.sum((entry) => entry.type === 'EXPENSE' && entry.status !== 'CANCELED'),
  );
  protected readonly balanceCents = computed(() => this.paidIncomeCents() - this.expenseCents());

  constructor() {
    effect((onCleanup) => {
      const clinicId = this.activeClinicId();
      let disposed = false;
      let unsubscribe: (() => void) | null = null;
      this.syncState.set('connecting');

      void this.finance
        .subscribe(
          clinicId,
          (entries) => {
            if (disposed) return;
            this.syncState.set('online');
            this.setEntries(entries);
          },
          (error) => {
            if (disposed) return;
            console.warn('Using local finance storage.', error);
            this.syncState.set('local');
            this.entries.set(this.readStoredEntries());
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
          console.warn('Using local finance storage.', error);
          this.syncState.set('local');
          this.entries.set(this.readStoredEntries());
        });

      onCleanup(() => {
        disposed = true;
        unsubscribe?.();
      });
    });
  }

  protected async saveEntry(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set('Preencha tipo, status, descrição, categoria, valor e vencimento.');
      return;
    }

    const amountCents = this.parseMoneyToCents(this.form.controls.amount.value);
    if (amountCents <= 0) {
      this.formError.set('Informe um valor maior que zero.');
      return;
    }

    const value = this.form.getRawValue();
    const now = new Date().toISOString();
    const existingId = this.editingId();
    const entry: FinancialEntry = {
      id: existingId ?? crypto.randomUUID(),
      clinicId: this.activeClinicId(),
      userId: await this.currentUserIdForWrite(),
      type: value.type,
      status: value.status,
      description: value.description.trim(),
      category: value.category.trim(),
      amountCents,
      dueDate: value.dueDate,
      paidAt: value.status === 'PAID' ? (this.currentEntry()?.paidAt ?? now) : null,
      notes: value.notes.trim() || null,
      createdAt: this.currentEntry()?.createdAt ?? now,
      updatedAt: now,
    };

    this.setEntries(
      existingId
        ? this.entries().map((item) => (item.id === existingId ? entry : item))
        : [...this.entries(), entry],
    );
    this.startNewEntry();
    await this.persistEntry(entry);
  }

  protected editEntry(entry: FinancialEntry): void {
    this.editingId.set(entry.id);
    this.formError.set(null);
    this.form.setValue({
      type: entry.type,
      status: entry.status,
      description: entry.description,
      category: entry.category,
      amount: this.formatMoneyInput(entry.amountCents),
      dueDate: entry.dueDate,
      notes: entry.notes ?? '',
    });
  }

  protected startNewEntry(): void {
    this.editingId.set(null);
    this.formError.set(null);
    this.form.reset({
      type: 'INCOME',
      status: 'OPEN',
      description: '',
      category: 'Atendimento',
      amount: '',
      dueDate: this.toDateInput(new Date()),
      notes: '',
    });
  }

  protected markPaid(entry: FinancialEntry): void {
    const now = new Date().toISOString();
    const updated = { ...entry, status: 'PAID' as const, paidAt: now, updatedAt: now };
    this.setEntries(this.entries().map((item) => (item.id === entry.id ? updated : item)));
    void this.persistEntry(updated);
  }

  protected cancelEntry(entry: FinancialEntry): void {
    const updated = { ...entry, status: 'CANCELED' as const, updatedAt: new Date().toISOString() };
    this.setEntries(this.entries().map((item) => (item.id === entry.id ? updated : item)));
    void this.persistEntry(updated);
  }

  protected setTypeFilter(event: Event): void {
    this.typeFilter.set((event.target as HTMLSelectElement).value as FinancialEntryType | 'ALL');
  }

  protected setStatusFilter(event: Event): void {
    this.statusFilter.set(
      (event.target as HTMLSelectElement).value as FinancialEntryStatus | 'ALL',
    );
  }

  protected statusLabel(status: FinancialEntryStatus): string {
    return { OPEN: 'Aberto', PAID: 'Pago', CANCELED: 'Cancelado' }[status];
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

  private currentEntry(): FinancialEntry | null {
    const id = this.editingId();
    return this.entries().find((entry) => entry.id === id) ?? null;
  }

  private sum(predicate: (entry: FinancialEntry) => boolean): number {
    return this.entries()
      .filter(predicate)
      .reduce((total, entry) => total + entry.amountCents, 0);
  }

  private setEntries(entries: readonly FinancialEntry[]): void {
    const sorted = [...entries].sort((first, second) =>
      second.dueDate.localeCompare(first.dueDate),
    );
    this.entries.set(sorted);
    this.writeStoredEntries(sorted);
  }

  private async persistEntry(entry: FinancialEntry): Promise<void> {
    try {
      await this.finance.upsert(entry);
      this.syncState.set('online');
    } catch (error) {
      console.warn('Could not sync financial entry.', error);
      this.syncState.set('local');
      this.formError.set(
        'Lançamento salvo neste navegador. Verifique o Firestore para sincronizar.',
      );
    }
  }

  private readStoredEntries(): readonly FinancialEntry[] {
    try {
      const value = globalThis.localStorage?.getItem(this.storageKey());
      if (!value) return [];
      const parsed = JSON.parse(value) as FinancialEntry[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeStoredEntries(entries: readonly FinancialEntry[]): void {
    try {
      globalThis.localStorage?.setItem(this.storageKey(), JSON.stringify(entries));
    } catch {
      this.formError.set('Não foi possível salvar neste navegador.');
    }
  }

  private async currentUserIdForWrite(): Promise<string> {
    try {
      return await this.finance.currentUserId();
    } catch {
      return this.auth.user()?.id ?? 'local-user';
    }
  }

  private activeClinicId(): string {
    return this.auth.tenantContext()?.activeClinicId ?? 'provisional-clinic';
  }

  private storageKey(): string {
    return `${STORAGE_PREFIX}.${this.activeClinicId()}`;
  }

  private toDateInput(date: Date): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  private parseMoneyToCents(value: string): number {
    const normalized = value
      .replace(/\./g, '')
      .replace(',', '.')
      .replace(/[^\d.]/g, '');
    return Math.round((Number.parseFloat(normalized) || 0) * 100);
  }

  private formatMoneyInput(cents: number): string {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(cents / 100);
  }
}
