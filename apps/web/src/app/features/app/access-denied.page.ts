import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'og-access-denied-page',
  imports: [RouterLink],
  template: `
    <main>
      <h1>Acesso não permitido</h1>
      <p>Seu papel atual não possui a permissão necessária.</p>
      <a routerLink="/app/dashboard">Voltar ao painel</a>
    </main>
  `,
  styles: `
    main {
      min-height: 100dvh;
      display: grid;
      place-content: center;
      gap: 1rem;
      text-align: center;
    }
    h1,
    p {
      margin: 0;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AccessDeniedPage {}
