import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../core/auth/auth-api.service';

@Component({
  selector: 'og-reset-password-page',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <main>
      <form [formGroup]="form" (ngSubmit)="submit()">
        <h1>Definir nova senha</h1>
        <p>Use pelo menos 6 caracteres e não inclua seu e-mail.</p>
        <mat-form-field appearance="outline">
          <mat-label>Nova senha</mat-label>
          <input matInput type="password" formControlName="password" autocomplete="new-password" />
        </mat-form-field>
        <mat-form-field appearance="outline">
          <mat-label>Confirmar senha</mat-label>
          <input
            matInput
            type="password"
            formControlName="confirmation"
            autocomplete="new-password"
          />
        </mat-form-field>
        @if (message()) {
          <p role="alert">{{ message() }}</p>
        }
        <button mat-flat-button type="submit" [disabled]="form.invalid">Alterar senha</button>
        <a routerLink="/login">Voltar ao login</a>
      </form>
    </main>
  `,
  styles: `
    main {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: 1rem;
      background: #f1f5f9;
    }
    form {
      display: grid;
      gap: 1rem;
      width: min(100%, 30rem);
      padding: 2rem;
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 1.375rem;
    }
    h1,
    p {
      margin: 0;
    }
    mat-form-field,
    button {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ResetPasswordPage {
  private readonly api = inject(AuthApiService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly formBuilder = inject(FormBuilder);
  protected readonly message = signal<string | null>(null);
  protected readonly form = this.formBuilder.nonNullable.group({
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
    confirmation: ['', [Validators.required, Validators.maxLength(128)]],
  });

  protected async submit(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');
    const { password, confirmation } = this.form.getRawValue();
    if (!token || password !== confirmation) {
      this.message.set('O link é inválido ou as senhas não coincidem.');
      return;
    }
    try {
      await firstValueFrom(this.api.resetPassword(token, password));
      await this.router.navigate(['/login'], { queryParams: { passwordReset: 'success' } });
    } catch {
      this.message.set('Não foi possível alterar a senha. Solicite um novo link.');
    }
  }
}
