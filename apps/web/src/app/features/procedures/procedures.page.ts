import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  computed,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { firstValueFrom } from 'rxjs';
import { IconComponent } from '../../shared/components/icon.component';
import { type Procedure, ProceduresApiService } from './procedures-api.service';

@Component({
  selector: 'og-procedures-page',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    IconComponent,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './procedures.page.html',
  styleUrl: '../registration-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProceduresPage implements OnInit {
  private readonly api = inject(ProceduresApiService);
  private readonly fb = inject(FormBuilder);
  protected readonly procedures = signal<Procedure[]>([]);
  protected readonly search = signal('');
  protected readonly status = signal('');
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<Procedure | null>(null);
  protected readonly filtered = computed(() => {
    const search = this.search().trim().toLocaleLowerCase('pt-BR');
    return this.procedures().filter(
      (item) =>
        (!this.status() || item.status === this.status()) &&
        (!search ||
          item.name.toLocaleLowerCase('pt-BR').includes(search) ||
          item.category.toLocaleLowerCase('pt-BR').includes(search)),
    );
  });
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(180)]],
    category: ['', [Validators.required, Validators.maxLength(100)]],
    description: ['', [Validators.maxLength(1000)]],
    priceReais: [0, [Validators.required, Validators.min(0)]],
    durationMinutes: [30, [Validators.required, Validators.min(5), Validators.max(480)]],
  });

  ngOnInit(): void {
    void this.load();
  }
  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.procedures.set(await firstValueFrom(this.api.list()));
    } catch {
      this.error.set('Não foi possível carregar os procedimentos.');
    } finally {
      this.loading.set(false);
    }
  }
  protected startCreate(): void {
    this.editing.set(null);
    this.form.reset({ priceReais: 0, durationMinutes: 30 });
    this.formOpen.set(true);
  }
  protected startEdit(item: Procedure): void {
    this.editing.set(item);
    this.form.reset({
      name: item.name,
      category: item.category,
      description: item.description ?? '',
      priceReais: item.defaultPriceCents / 100,
      durationMinutes: item.durationMinutes,
    });
    this.formOpen.set(true);
  }
  protected cancel(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }
  protected async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    const value = this.form.getRawValue();
    const input = {
      name: value.name,
      category: value.category,
      description: value.description,
      defaultPriceCents: Math.round(value.priceReais * 100),
      durationMinutes: value.durationMinutes,
    };
    this.saving.set(true);
    this.error.set(null);
    try {
      const item = this.editing();
      if (item) await firstValueFrom(this.api.update(item.id, input));
      else await firstValueFrom(this.api.create(input));
      this.cancel();
      await this.load();
    } catch {
      this.error.set('Não foi possível salvar. Verifique se o nome já está cadastrado.');
    } finally {
      this.saving.set(false);
    }
  }
  protected async inactivate(item: Procedure): Promise<void> {
    if (item.status === 'INACTIVE') return;
    this.saving.set(true);
    try {
      await firstValueFrom(this.api.inactivate(item.id));
      await this.load();
    } catch {
      this.error.set('Não foi possível inativar o procedimento.');
    } finally {
      this.saving.set(false);
    }
  }
  protected money(cents: number): string {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(
      cents / 100,
    );
  }
}
