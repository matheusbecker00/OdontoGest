import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { AuthApiService } from '../../core/auth/auth-api.service';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'og-verify-email-page',
  imports: [RouterLink, MatProgressSpinnerModule, IconComponent],
  template: `
    <main>
      @if (state() === 'sent') {
        <og-icon class="sent-icon" name="mark_email_read" aria-hidden="true" />
        <h1>Confirme seu e-mail</h1>
        <p>Enviamos as instruções de confirmação. Depois, volte para entrar.</p>
        <a routerLink="/login">Voltar ao login</a>
      } @else if (state() === 'loading') {
        <mat-spinner diameter="36" aria-label="Confirmando e-mail" />
        <h1>Confirmando seu e-mail</h1>
      } @else if (state() === 'success') {
        <h1>E-mail confirmado</h1>
        <p>Sua conta já pode acessar o OdontoGest.</p>
        <a routerLink="/login">Ir para o login</a>
      } @else {
        <h1>Link inválido ou expirado</h1>
        <p>Solicite uma nova confirmação antes de entrar.</p>
        <a routerLink="/login">Voltar ao login</a>
      }
    </main>
  `,
  styles: `
    main {
      min-height: 100dvh;
      display: grid;
      place-content: center;
      justify-items: center;
      gap: 1rem;
      padding: 1rem;
      text-align: center;
      background: #f1f5f9;
    }
    h1,
    p {
      margin: 0;
    }
    .sent-icon {
      color: #2563eb;
      transform: scale(1.4);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VerifyEmailPage implements OnInit {
  private readonly api = inject(AuthApiService);
  private readonly route = inject(ActivatedRoute);
  protected readonly state = signal<'sent' | 'loading' | 'success' | 'error'>('loading');

  async ngOnInit(): Promise<void> {
    if (this.route.snapshot.queryParamMap.get('sent') === 'true') {
      this.state.set('sent');
      return;
    }
    const token = this.route.snapshot.queryParamMap.get('token');
    if (!token) {
      this.state.set('error');
      return;
    }
    try {
      await firstValueFrom(this.api.verifyEmail(token));
      this.state.set('success');
    } catch {
      this.state.set('error');
    }
  }
}
