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
  InventoryRepository,
  type InventoryItem,
  type InventoryStatus,
} from './inventory.repository';

const STORAGE_PREFIX = 'odontogest.inventory';

@Component({
  selector: 'og-inventory-page',
  imports: [ReactiveFormsModule, MatButtonModule, IconComponent],
  template: `
    <main class="inventory-page">
      <section class="page-heading">
        <div>
          <span class="eyebrow">ESTOQUE</span>
          <h2>Materiais da clínica</h2>
          <p>Controle materiais, custos estimados e alertas de reposição.</p>
          <span class="sync-pill" [class.sync-pill--local]="syncState() === 'local'">
            <og-icon [name]="syncState() === 'online' ? 'verified_user' : 'inventory_2'" />
            {{ syncLabel() }}
          </span>
        </div>
      </section>

      <section class="summary-grid" aria-label="Resumo do estoque">
        <article class="summary summary--blue">
          <span><og-icon name="inventory_2" /></span>
          <div>
            <small>Itens ativos</small><strong>{{ activeCount() }}</strong>
          </div>
        </article>
        <article class="summary summary--orange">
          <span><og-icon name="pending_actions" /></span>
          <div>
            <small>Reposição</small><strong>{{ lowStockCount() }}</strong>
          </div>
        </article>
        <article class="summary summary--green">
          <span><og-icon name="payments" /></span>
          <div>
            <small>Valor estimado</small><strong>{{ formatMoney(stockValueCents()) }}</strong>
          </div>
        </article>
        <article class="summary summary--muted">
          <span><og-icon name="archive" /></span>
          <div>
            <small>Arquivados</small><strong>{{ archivedCount() }}</strong>
          </div>
        </article>
      </section>

      <section class="inventory-layout">
        <article class="panel">
          <header>
            <div>
              <h3>Itens cadastrados</h3>
              <p>{{ filteredItems().length }} item(ns) no filtro atual.</p>
            </div>
            <div class="filters">
              <input
                [value]="searchTerm()"
                placeholder="Buscar material"
                (input)="setSearchTerm($event)"
              />
              <select [value]="statusFilter()" (change)="setStatusFilter($event)">
                <option value="ACTIVE">Ativos</option>
                <option value="LOW">Reposição</option>
                <option value="ARCHIVED">Arquivados</option>
                <option value="ALL">Todos</option>
              </select>
            </div>
          </header>

          @if (filteredItems().length > 0) {
            <div class="items">
              @for (item of filteredItems(); track item.id) {
                <article
                  class="item"
                  [class.item--alert]="isLowStock(item)"
                  [class.item--muted]="item.status === 'ARCHIVED'"
                >
                  <span class="item__icon"><og-icon name="inventory_2" /></span>
                  <div>
                    <strong>{{ item.name }}</strong>
                    <small>{{ item.category }} · {{ item.supplier || 'Sem fornecedor' }}</small>
                  </div>
                  <em [class]="isLowStock(item) ? 'badge badge--alert' : 'badge'">
                    {{
                      item.status === 'ARCHIVED' ? 'Arquivado' : isLowStock(item) ? 'Repor' : 'Ok'
                    }}
                  </em>
                  <strong class="quantity">
                    {{ item.quantity }} {{ item.unit }}
                    <small>mín. {{ item.minimumQuantity }}</small>
                  </strong>
                  <strong class="value">{{
                    formatMoney(item.quantity * item.unitCostCents)
                  }}</strong>
                  <nav aria-label="Ações do item">
                    <button type="button" (click)="editItem(item)">Editar</button>
                    <button type="button" (click)="adjustQuantity(item, 1)">+1</button>
                    <button type="button" (click)="adjustQuantity(item, -1)">-1</button>
                    <button type="button" (click)="toggleArchived(item)">
                      {{ item.status === 'ARCHIVED' ? 'Reativar' : 'Arquivar' }}
                    </button>
                  </nav>
                </article>
              }
            </div>
          } @else {
            <div class="empty-state">
              <span><og-icon name="inventory_2" /></span>
              <strong>Nenhum material encontrado</strong>
              <p>Cadastre materiais de consumo para acompanhar reposição.</p>
            </div>
          }
        </article>

        <form class="item-form" [formGroup]="form" (ngSubmit)="saveItem()">
          <header>
            <h3>{{ editingId() ? 'Editar material' : 'Novo material' }}</h3>
            <button type="button" (click)="startNewItem()">Limpar</button>
          </header>

          <label>
            Nome
            <input formControlName="name" placeholder="Ex.: Luva nitrílica" />
          </label>
          <div class="form-grid">
            <label>
              Categoria
              <input formControlName="category" placeholder="Descartáveis" />
            </label>
            <label>
              Unidade
              <input formControlName="unit" placeholder="un, cx, pct" />
            </label>
          </div>
          <div class="form-grid">
            <label>
              Quantidade
              <input formControlName="quantity" type="number" min="0" step="1" />
            </label>
            <label>
              Mínimo
              <input formControlName="minimumQuantity" type="number" min="0" step="1" />
            </label>
          </div>
          <div class="form-grid">
            <label>
              Custo unitário
              <input formControlName="unitCost" inputmode="decimal" placeholder="0,00" />
            </label>
            <label>
              Status
              <select formControlName="status">
                <option value="ACTIVE">Ativo</option>
                <option value="ARCHIVED">Arquivado</option>
              </select>
            </label>
          </div>
          <label>
            Fornecedor
            <input formControlName="supplier" placeholder="Fornecedor opcional" />
          </label>
          <label>
            Observações
            <textarea formControlName="notes" rows="3" placeholder="Anotações rápidas"></textarea>
          </label>

          @if (formError()) {
            <p class="form-error">{{ formError() }}</p>
          }

          <button mat-flat-button type="submit">
            {{ editingId() ? 'Salvar alterações' : 'Cadastrar material' }}
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
    .item small {
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
    .item-form {
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
    .item__icon,
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
    .item__icon og-icon {
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
    .summary--orange > span {
      color: #ea580c;
      background: #fff1e8;
    }
    .summary--green > span {
      color: #059669;
      background: #e7f8f2;
    }
    .summary--muted > span {
      color: #64748b;
      background: #f1f5f9;
    }
    .inventory-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(21rem, 27rem);
      gap: 1rem;
      align-items: start;
    }
    .panel,
    .item-form {
      overflow: hidden;
    }
    .panel > header,
    .item-form header {
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
    .items {
      display: grid;
      gap: 0.75rem;
      padding: 1rem;
    }
    .item {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto auto auto;
      align-items: center;
      gap: 0.8rem;
      border: 1px solid #e8edf3;
      border-radius: 0.8rem;
      padding: 0.85rem;
      background: #fafbfd;
    }
    .item--alert {
      border-color: #fed7aa;
      background: #fffbf6;
    }
    .item--muted {
      opacity: 0.65;
    }
    .item__icon {
      width: 2.65rem;
      height: 2.65rem;
      border-radius: 0.75rem;
    }
    .item div strong {
      display: block;
      font-size: 0.9rem;
    }
    .badge {
      border-radius: 99px;
      padding: 0.24rem 0.55rem;
      color: #047857;
      background: #ecfdf5;
      font-size: 0.62rem;
      font-style: normal;
      font-weight: 850;
      white-space: nowrap;
    }
    .badge--alert {
      color: #b45309;
      background: #fff7ed;
    }
    .quantity,
    .value {
      font-size: 0.9rem;
      white-space: nowrap;
    }
    .quantity small {
      display: block;
      font-size: 0.66rem;
    }
    .item nav {
      grid-column: 2/-1;
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }
    .item nav button,
    .item-form header button {
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
    .item-form {
      display: grid;
      gap: 0.85rem;
      padding: 0 1rem 1rem;
    }
    .item-form label {
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
      .inventory-layout {
        grid-template-columns: 1fr;
      }
    }
    @media (width < 42rem) {
      .summary-grid,
      .filters,
      .form-grid,
      .item {
        grid-template-columns: 1fr;
      }
      .panel > header {
        align-items: flex-start;
        flex-direction: column;
      }
      .item nav {
        grid-column: auto;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InventoryPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthStore);
  private readonly inventory = inject(InventoryRepository);
  private readonly items = signal<readonly InventoryItem[]>(this.readStoredItems());

  protected readonly editingId = signal<string | null>(null);
  protected readonly formError = signal<string | null>(null);
  protected readonly syncState = signal<'connecting' | 'online' | 'local'>('connecting');
  protected readonly statusFilter = signal<InventoryStatus | 'LOW' | 'ALL'>('ACTIVE');
  protected readonly searchTerm = signal('');
  protected readonly syncLabel = computed(() => {
    if (this.syncState() === 'online') return 'Sincronizado no Firebase';
    if (this.syncState() === 'connecting') return 'Conectando ao Firebase';
    return 'Modo local temporário';
  });
  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(180)]],
    category: ['Materiais', [Validators.required, Validators.maxLength(100)]],
    unit: ['un', [Validators.required, Validators.maxLength(20)]],
    quantity: [0, [Validators.required, Validators.min(0)]],
    minimumQuantity: [0, [Validators.required, Validators.min(0)]],
    unitCost: ['0,00', Validators.required],
    supplier: ['', Validators.maxLength(140)],
    status: ['ACTIVE' as InventoryStatus, Validators.required],
    notes: ['', Validators.maxLength(500)],
  });
  protected readonly filteredItems = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase('pt-BR');
    return this.items().filter((item) => {
      const matchesTerm =
        term.length === 0 ||
        item.name.toLocaleLowerCase('pt-BR').includes(term) ||
        item.category.toLocaleLowerCase('pt-BR').includes(term) ||
        (item.supplier ?? '').toLocaleLowerCase('pt-BR').includes(term);
      const filter = this.statusFilter();
      const matchesStatus =
        filter === 'ALL' ||
        (filter === 'LOW' && this.isLowStock(item)) ||
        (filter !== 'LOW' && item.status === filter);
      return matchesTerm && matchesStatus;
    });
  });
  protected readonly activeCount = computed(
    () => this.items().filter((item) => item.status === 'ACTIVE').length,
  );
  protected readonly lowStockCount = computed(
    () => this.items().filter((item) => this.isLowStock(item)).length,
  );
  protected readonly archivedCount = computed(
    () => this.items().filter((item) => item.status === 'ARCHIVED').length,
  );
  protected readonly stockValueCents = computed(() =>
    this.items()
      .filter((item) => item.status === 'ACTIVE')
      .reduce((total, item) => total + item.quantity * item.unitCostCents, 0),
  );

  constructor() {
    effect((onCleanup) => {
      const clinicId = this.activeClinicId();
      let disposed = false;
      let unsubscribe: (() => void) | null = null;
      this.syncState.set('connecting');

      void this.inventory
        .subscribe(
          clinicId,
          (items) => {
            if (disposed) return;
            this.syncState.set('online');
            this.setItems(items);
          },
          (error) => {
            if (disposed) return;
            console.warn('Using local inventory storage.', error);
            this.syncState.set('local');
            this.items.set(this.readStoredItems());
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
          console.warn('Using local inventory storage.', error);
          this.syncState.set('local');
          this.items.set(this.readStoredItems());
        });

      onCleanup(() => {
        disposed = true;
        unsubscribe?.();
      });
    });
  }

  protected async saveItem(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set('Preencha nome, categoria, unidade, quantidade, mínimo e custo.');
      return;
    }

    const value = this.form.getRawValue();
    const unitCostCents = this.parseMoneyToCents(value.unitCost);
    if (unitCostCents < 0) {
      this.formError.set('Informe um custo unitário válido.');
      return;
    }

    const now = new Date().toISOString();
    const existing = this.currentItem();
    const item: InventoryItem = {
      id: existing?.id ?? crypto.randomUUID(),
      clinicId: this.activeClinicId(),
      userId: await this.currentUserIdForWrite(),
      name: value.name.trim(),
      category: value.category.trim(),
      unit: value.unit.trim(),
      quantity: Math.max(0, Math.trunc(value.quantity)),
      minimumQuantity: Math.max(0, Math.trunc(value.minimumQuantity)),
      unitCostCents,
      supplier: value.supplier.trim() || null,
      status: value.status,
      notes: value.notes.trim() || null,
      createdAt: existing?.createdAt ?? now,
      updatedAt: now,
    };

    this.setItems(
      existing
        ? this.items().map((candidate) => (candidate.id === existing.id ? item : candidate))
        : [...this.items(), item],
    );
    this.startNewItem();
    await this.persistItem(item);
  }

  protected editItem(item: InventoryItem): void {
    this.editingId.set(item.id);
    this.formError.set(null);
    this.form.setValue({
      name: item.name,
      category: item.category,
      unit: item.unit,
      quantity: item.quantity,
      minimumQuantity: item.minimumQuantity,
      unitCost: this.formatMoneyInput(item.unitCostCents),
      supplier: item.supplier ?? '',
      status: item.status,
      notes: item.notes ?? '',
    });
  }

  protected startNewItem(): void {
    this.editingId.set(null);
    this.formError.set(null);
    this.form.reset({
      name: '',
      category: 'Materiais',
      unit: 'un',
      quantity: 0,
      minimumQuantity: 0,
      unitCost: '0,00',
      supplier: '',
      status: 'ACTIVE',
      notes: '',
    });
  }

  protected adjustQuantity(item: InventoryItem, delta: number): void {
    const updated = {
      ...item,
      quantity: Math.max(0, item.quantity + delta),
      updatedAt: new Date().toISOString(),
    };
    this.setItems(
      this.items().map((candidate) => (candidate.id === item.id ? updated : candidate)),
    );
    void this.persistItem(updated);
  }

  protected toggleArchived(item: InventoryItem): void {
    const updated = {
      ...item,
      status: item.status === 'ARCHIVED' ? ('ACTIVE' as const) : ('ARCHIVED' as const),
      updatedAt: new Date().toISOString(),
    };
    this.setItems(
      this.items().map((candidate) => (candidate.id === item.id ? updated : candidate)),
    );
    void this.persistItem(updated);
  }

  protected setSearchTerm(event: Event): void {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }

  protected setStatusFilter(event: Event): void {
    this.statusFilter.set(
      (event.target as HTMLSelectElement).value as InventoryStatus | 'LOW' | 'ALL',
    );
  }

  protected isLowStock(item: InventoryItem): boolean {
    return item.status === 'ACTIVE' && item.quantity <= item.minimumQuantity;
  }

  protected formatMoney(cents: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      cents / 100,
    );
  }

  private currentItem(): InventoryItem | null {
    const id = this.editingId();
    return this.items().find((item) => item.id === id) ?? null;
  }

  private setItems(items: readonly InventoryItem[]): void {
    const sorted = [...items].sort((first, second) =>
      first.name.localeCompare(second.name, 'pt-BR'),
    );
    this.items.set(sorted);
    this.writeStoredItems(sorted);
  }

  private async persistItem(item: InventoryItem): Promise<void> {
    try {
      await this.inventory.upsert(item);
      this.syncState.set('online');
    } catch (error) {
      console.warn('Could not sync inventory item.', error);
      this.syncState.set('local');
      this.formError.set('Material salvo neste navegador. Verifique o Firestore para sincronizar.');
    }
  }

  private readStoredItems(): readonly InventoryItem[] {
    try {
      const value = globalThis.localStorage?.getItem(this.storageKey());
      if (!value) return [];
      const parsed = JSON.parse(value) as InventoryItem[];
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private writeStoredItems(items: readonly InventoryItem[]): void {
    try {
      globalThis.localStorage?.setItem(this.storageKey(), JSON.stringify(items));
    } catch {
      this.formError.set('Não foi possível salvar neste navegador.');
    }
  }

  private async currentUserIdForWrite(): Promise<string> {
    try {
      return await this.inventory.currentUserId();
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
