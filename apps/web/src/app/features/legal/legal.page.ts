import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';

@Component({
  selector: 'og-legal-page',
  imports: [RouterLink],
  template: `
    <main>
      <article>
        <a routerLink="/cadastro">← Voltar ao cadastro</a>
        @if (document === 'terms') {
          <h1>Termos de Uso — versão de validação</h1>
          <p class="notice">
            Versão 2026-07-16. Este texto é preliminar e deverá passar por revisão jurídica antes do
            uso comercial.
          </p>
          <h2>Uso permitido</h2>
          <p>
            O OdontoGest está em desenvolvimento. Nesta etapa, utilize apenas dados fictícios e não
            registre informações reais de pacientes ou dados clínicos.
          </p>
          <h2>Responsabilidade da conta</h2>
          <p>
            O responsável deve fornecer dados administrativos corretos, proteger suas credenciais e
            comunicar qualquer suspeita de acesso indevido.
          </p>
          <h2>Disponibilidade</h2>
          <p>
            O ambiente de validação pode sofrer alterações, indisponibilidade ou reinicialização de
            dados. Ele ainda não deve ser usado na operação de uma clínica real.
          </p>
        } @else {
          <h1>Política de Privacidade — versão de validação</h1>
          <p class="notice">
            Versão 2026-07-16. Este documento não representa declaração de conformidade integral com
            a LGPD.
          </p>
          <h2>Dados utilizados</h2>
          <p>
            Nesta etapa coletamos nome do responsável, e-mail, nome da clínica, evidência de aceite,
            informações reduzidas de sessão e eventos de segurança.
          </p>
          <h2>Finalidades</h2>
          <p>
            Os dados são usados para autenticação, criação da clínica, controle de acesso, prevenção
            de abuso e auditoria do ambiente.
          </p>
          <h2>Limites desta fase</h2>
          <p>
            Não envie dados reais de pacientes, informações de saúde, imagens, exames ou dados
            financeiros reais enquanto o ambiente não estiver aprovado para produção.
          </p>
        }
      </article>
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
      color: #0f172a;
      background: #f1f5f9;
    }
    main {
      padding: clamp(1rem, 4vw, 4rem);
    }
    article {
      width: min(100%, 52rem);
      margin: auto;
      padding: clamp(1.5rem, 4vw, 3rem);
      background: white;
      border: 1px solid #e2e8f0;
      border-radius: 1.5rem;
      box-shadow: 0 1rem 3rem rgb(15 23 42 / 8%);
    }
    h1 {
      margin-top: 2rem;
      letter-spacing: -0.03em;
    }
    h2 {
      margin-top: 2rem;
    }
    p {
      color: #475569;
      line-height: 1.75;
    }
    a {
      color: #2563eb;
      font-weight: 700;
    }
    .notice {
      padding: 1rem;
      background: #eff6ff;
      border-left: 0.25rem solid #2563eb;
      border-radius: 0.5rem;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LegalPage {
  private readonly route = inject(ActivatedRoute);
  protected readonly document =
    this.route.snapshot.data['document'] === 'terms' ? 'terms' : 'privacy';
}
