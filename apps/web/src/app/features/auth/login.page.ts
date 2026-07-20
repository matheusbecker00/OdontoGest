import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'og-login-page',
  imports: [
    ReactiveFormsModule,
    RouterLink,
    MatButtonModule,
    MatFormFieldModule,
    IconComponent,
    MatInputModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './login.page.html',
  styleUrl: './login.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginPage {
  private readonly formBuilder = inject(FormBuilder);
  private readonly auth = inject(AuthStore);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected readonly pending = signal(false);
  protected readonly errorMessage = signal<string | null>(
    this.route.snapshot.queryParamMap.get('erro') === 'carregamento'
      ? 'A aplicação foi atualizada. Entre novamente para continuar.'
      : null,
  );
  protected readonly form = this.formBuilder.nonNullable.group({
    identifier: ['', [Validators.required, Validators.maxLength(320)]],
    password: ['', [Validators.required, Validators.maxLength(128)]],
  });

  protected async submit(): Promise<void> {
    if (this.form.invalid || this.pending()) {
      this.form.markAllAsTouched();
      return;
    }

    this.pending.set(true);
    this.errorMessage.set(null);
    try {
      const { identifier, password } = this.form.getRawValue();
      await this.auth.login(identifier, password);
      const candidate = this.route.snapshot.queryParamMap.get('returnUrl');
      const returnUrl =
        candidate?.startsWith('/') && !candidate.startsWith('//') ? candidate : '/app/dashboard';
      await this.router.navigateByUrl(returnUrl);
    } catch {
      this.errorMessage.set('Não foi possível entrar. Verifique os dados e tente novamente.');
    } finally {
      this.pending.set(false);
    }
  }
}
