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
import { type Dentist, DentistsApiService } from './dentists-api.service';

@Component({
  selector: 'og-dentists-page',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    IconComponent,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    ReactiveFormsModule,
  ],
  templateUrl: './dentists.page.html',
  styleUrl: '../registration-page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DentistsPage implements OnInit {
  private readonly api = inject(DentistsApiService);
  private readonly fb = inject(FormBuilder);
  protected readonly dentists = signal<Dentist[]>([]);
  protected readonly search = signal('');
  protected readonly status = signal('');
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly editing = signal<Dentist | null>(null);
  protected readonly states = [
    'AC',
    'AL',
    'AP',
    'AM',
    'BA',
    'CE',
    'DF',
    'ES',
    'GO',
    'MA',
    'MT',
    'MS',
    'MG',
    'PA',
    'PB',
    'PR',
    'PE',
    'PI',
    'RJ',
    'RN',
    'RS',
    'RO',
    'RR',
    'SC',
    'SP',
    'SE',
    'TO',
  ];
  protected readonly filtered = computed(() => {
    const search = this.search().trim().toLocaleLowerCase('pt-BR');
    return this.dentists().filter(
      (item) =>
        (!this.status() || item.status === this.status()) &&
        (!search ||
          item.name.toLocaleLowerCase('pt-BR').includes(search) ||
          item.specialty.toLocaleLowerCase('pt-BR').includes(search) ||
          `${item.croState}-${item.cro}`.toLocaleLowerCase('pt-BR').includes(search)),
    );
  });
  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(180)]],
    cro: ['', [Validators.required, Validators.maxLength(20)]],
    croState: ['SP', [Validators.required, Validators.pattern(/^[A-Z]{2}$/)]],
    specialty: ['', [Validators.required, Validators.maxLength(120)]],
    phone: ['', [Validators.maxLength(20)]],
    email: ['', [Validators.email, Validators.maxLength(320)]],
    calendarColor: ['#2563EB', [Validators.required, Validators.pattern(/^#[0-9A-Fa-f]{6}$/)]],
    defaultAppointmentMinutes: [30, [Validators.required, Validators.min(10), Validators.max(480)]],
  });

  ngOnInit(): void {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.loading.set(true);
    this.error.set(null);
    try {
      this.dentists.set(await firstValueFrom(this.api.list()));
    } catch {
      this.error.set('Não foi possível carregar os profissionais.');
    } finally {
      this.loading.set(false);
    }
  }

  protected startCreate(): void {
    this.editing.set(null);
    this.form.reset({ croState: 'SP', calendarColor: '#2563EB', defaultAppointmentMinutes: 30 });
    this.formOpen.set(true);
  }

  protected startEdit(item: Dentist): void {
    this.editing.set(item);
    this.form.reset({ ...item, phone: item.phone ?? '', email: item.email ?? '' });
    this.formOpen.set(true);
  }

  protected cancel(): void {
    this.formOpen.set(false);
    this.editing.set(null);
  }

  protected async save(): Promise<void> {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;
    this.saving.set(true);
    this.error.set(null);
    try {
      const item = this.editing();
      if (item) await firstValueFrom(this.api.update(item.id, this.form.getRawValue()));
      else await firstValueFrom(this.api.create(this.form.getRawValue()));
      this.cancel();
      await this.load();
    } catch {
      this.error.set('Não foi possível salvar. Verifique se o CRO já está cadastrado.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async inactivate(item: Dentist): Promise<void> {
    if (item.status === 'INACTIVE') return;
    this.saving.set(true);
    try {
      await firstValueFrom(this.api.inactivate(item.id));
      await this.load();
    } catch {
      this.error.set('Não foi possível inativar o profissional.');
    } finally {
      this.saving.set(false);
    }
  }
}
