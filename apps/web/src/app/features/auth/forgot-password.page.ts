import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { RouterLink } from '@angular/router';
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service';

@Component({
  selector: 'og-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink, MatButtonModule, MatFormFieldModule, MatInputModule],
  template: `
    <main class="simple-auth">
      <section>
        <h1>Recuperar senha</h1>
        <p>Informe seu e-mail. A resposta é sempre genérica para proteger sua conta.</p>
        <mat-form-field appearance="outline">
          <mat-label>E-mail</mat-label>
          <input matInput type="email" [formControl]="email" autocomplete="email" />
        </mat-form-field>
        <button mat-flat-button type="button" (click)="submit()" [disabled]="email.invalid">
          Enviar instruções
        </button>
        @if (message()) {
          <p role="status">{{ message() }}</p>
        }
        <a routerLink="/login">Voltar para o login</a>
      </section>
    </main>
  `,
  styles: `
    .simple-auth {
      min-height: 100dvh;
      display: grid;
      place-items: center;
      padding: 1rem;
      background: #f1f5f9;
    }
    section {
      display: grid;
      gap: 1rem;
      width: min(100%, 28rem);
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
export class ForgotPasswordPage {
  private readonly firebase = inject(FirebaseAuthService);
  protected readonly email = new FormControl('', {
    nonNullable: true,
    validators: [Validators.required, Validators.email, Validators.maxLength(320)],
  });
  protected readonly message = signal<string | null>(null);

  protected async submit(): Promise<void> {
    if (this.email.invalid) return;
    await this.firebase.sendPasswordReset(this.email.value).catch(() => undefined);
    this.message.set('Se a conta existir, você receberá as instruções por e-mail.');
  }
}
