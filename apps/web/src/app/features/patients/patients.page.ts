import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthStore } from '../../core/auth/auth.store';
import {
  type Patient,
  type PatientInput,
  type PatientRegistrationStatus,
  PatientsApiService,
} from './patients-api.service';

@Component({
  selector: 'og-patients-page',
  imports: [
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSelectModule,
    MatTableModule,
    ReactiveFormsModule,
    RouterLink,
  ],
  templateUrl: './patients.page.html',
  styleUrl: './patients.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientsPage implements OnInit {
  private readonly api = inject(PatientsApiService);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly auth = inject(AuthStore);

  protected readonly displayedColumns = ['patient', 'contact', 'status', 'actions'];
  protected readonly patients = signal<Patient[]>([]);
  protected readonly loading = signal(true);
  protected readonly saving = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly editing = signal<Patient | null>(null);
  protected readonly formOpen = signal(false);
  protected readonly page = signal(1);
  protected readonly totalPages = signal(0);
  protected readonly total = signal(0);
  protected readonly pageSize = 20;

  protected readonly filters = this.formBuilder.nonNullable.group({
    search: ['', [Validators.maxLength(100)]],
    status: ['' as '' | PatientRegistrationStatus],
  });

  protected readonly form = this.formBuilder.nonNullable.group({
    fullName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(180)]],
    cpf: ['', [Validators.maxLength(14)]],
    birthDate: [''],
    phone: ['', [Validators.maxLength(20)]],
    whatsapp: ['', [Validators.maxLength(20)]],
    email: ['', [Validators.email, Validators.maxLength(320)]],
    addressLine: ['', [Validators.maxLength(500)]],
    administrativeNotes: ['', [Validators.maxLength(1000)]],
  });

  ngOnInit(): void {
    void this.load();
  }

  protected async load(page = this.page()): Promise<void> {
    if (this.filters.invalid) return;
    this.loading.set(true);
    this.error.set(null);
    try {
      const filters = this.filters.getRawValue();
      const response = await firstValueFrom(
        this.api.list({
          page,
          pageSize: this.pageSize,
          search: this.optional(filters.search),
          status: filters.status || undefined,
        }),
      );
      this.patients.set(response.items);
      this.page.set(response.pagination.page);
      this.totalPages.set(response.pagination.totalPages);
      this.total.set(response.pagination.total);
    } catch {
      this.error.set('Não foi possível carregar os pacientes. Tente novamente.');
    } finally {
      this.loading.set(false);
    }
  }

  protected search(): void {
    this.filters.markAllAsTouched();
    void this.load(1);
  }

  protected startCreate(): void {
    this.editing.set(null);
    this.form.reset();
    this.formOpen.set(true);
  }

  protected startEdit(patient: Patient): void {
    this.editing.set(patient);
    this.form.reset({
      fullName: patient.fullName,
      cpf: '',
      birthDate: patient.birthDate ?? '',
      phone: patient.phone ?? '',
      whatsapp: patient.whatsapp ?? '',
      email: patient.email ?? '',
      addressLine: patient.addressLine ?? '',
      administrativeNotes: patient.administrativeNotes ?? '',
    });
    this.formOpen.set(true);
  }

  protected cancelForm(): void {
    this.formOpen.set(false);
    this.editing.set(null);
    this.form.reset();
  }

  protected async save(): Promise<void> {
    this.form.markAllAsTouched();
    const values = this.form.getRawValue();
    if (this.form.invalid || (!this.editing() && !values.cpf.trim())) return;

    const input: PatientInput = {
      fullName: values.fullName.trim(),
      birthDate: this.optional(values.birthDate),
      phone: this.optional(values.phone),
      whatsapp: this.optional(values.whatsapp),
      email: this.optional(values.email),
      addressLine: this.optional(values.addressLine),
      administrativeNotes: this.optional(values.administrativeNotes),
    };
    const cpf = this.optional(values.cpf);
    if (cpf) input.cpf = cpf;

    this.saving.set(true);
    this.error.set(null);
    try {
      const editing = this.editing();
      if (editing) {
        await firstValueFrom(this.api.update(editing.id, input));
      } else {
        await firstValueFrom(this.api.create({ ...input, cpf: cpf! }));
      }
      this.cancelForm();
      await this.load(editing ? this.page() : 1);
    } catch {
      this.error.set('Não foi possível salvar. Verifique os dados e se o CPF já existe.');
    } finally {
      this.saving.set(false);
    }
  }

  protected async inactivate(patient: Patient): Promise<void> {
    if (patient.registrationStatus === 'INACTIVE') return;
    this.saving.set(true);
    this.error.set(null);
    try {
      await firstValueFrom(this.api.inactivate(patient.id));
      await this.load();
    } catch {
      this.error.set('Não foi possível inativar o paciente.');
    } finally {
      this.saving.set(false);
    }
  }

  private optional(value: string): string | undefined {
    return value.trim() || undefined;
  }
}
