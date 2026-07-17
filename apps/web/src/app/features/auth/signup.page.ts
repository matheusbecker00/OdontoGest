import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'og-signup-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './signup.page.html',
  styleUrl: './signup.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SignupPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly pending = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly form = this.formBuilder.nonNullable.group({
    responsibleName: [
      '',
      [Validators.required, Validators.minLength(2), Validators.maxLength(160)],
    ],
    clinicName: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(180)]],
    email: ['', [Validators.required, Validators.email, Validators.maxLength(320)]],
    password: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]],
    confirmation: ['', [Validators.required, Validators.maxLength(128)]],
    acceptTerms: [false, Validators.requiredTrue],
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.pending()) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    if (value.password !== value.confirmation) {
      this.errorMessage.set('As senhas não coincidem.');
      return;
    }

    this.pending.set(true);
    this.errorMessage.set(null);
    try {
      await this.auth.register({
        responsibleName: value.responsibleName,
        clinicName: value.clinicName,
        email: value.email,
        password: value.password,
      });
      await this.router.navigate(['/verificar-email'], {
        queryParams: { sent: 'true' },
      });
    } catch {
      this.errorMessage.set(
        'Não foi possível concluir o cadastro. Confira os dados e tente novamente.',
      );
    } finally {
      this.pending.set(false);
    }
  }
}
