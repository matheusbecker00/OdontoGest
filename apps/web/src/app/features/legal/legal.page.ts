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
          <h1>Termos de Uso</h1>
          <p class="notice">
            Versão 2026-07-21. Ao criar uma conta, iniciar o teste gratuito, contratar um plano ou
            utilizar o OdontoGest, você declara que leu, entendeu e concorda com estes Termos.
          </p>
          <h2>1. Sobre o OdontoGest</h2>
          <p>
            O OdontoGest é uma plataforma online para apoio à gestão administrativa de clínicas e
            consultórios odontológicos, incluindo funcionalidades como agenda, cadastros, pacientes,
            dentistas, procedimentos, equipe, financeiro, estoque, relatórios e assinatura.
          </p>
          <h2>2. Conta, acesso e responsabilidade</h2>
          <p>
            O responsável pela conta deve fornecer informações verdadeiras, manter seus dados
            atualizados, proteger suas credenciais, controlar quem acessa a clínica e comunicar
            imediatamente qualquer suspeita de uso indevido, perda de senha ou acesso não
            autorizado.
          </p>
          <h2>3. Teste gratuito e assinatura</h2>
          <p>
            O OdontoGest pode oferecer 15 dias de teste gratuito por clínica. Após o fim do teste, o
            acesso aos dados pode permanecer disponível para leitura, mas a criação, edição,
            inativação ou gravação de registros poderá ser bloqueada até a contratação ou
            regularização da assinatura.
          </p>
          <p>
            Pagamentos e cobranças podem ser processados por provedores terceiros, como o Asaas. A
            liberação do plano depende da confirmação do pagamento e da sincronização do status da
            assinatura nos sistemas do OdontoGest.
          </p>
          <h2>4. Suspensão, atraso e cancelamento</h2>
          <p>
            Assinaturas vencidas, canceladas, contestadas ou com falha de pagamento podem colocar a
            clínica em modo somente leitura. Nessa condição, os dados existentes podem ser
            consultados, mas operações de gravação poderão ser impedidas até a regularização.
          </p>
          <h2>5. Dados inseridos na plataforma</h2>
          <p>
            A clínica é responsável pela licitude, qualidade, necessidade e atualização dos dados
            que inserir no OdontoGest, inclusive dados pessoais, dados de pacientes, dados de
            equipe, informações financeiras e dados relacionados à rotina odontológica.
          </p>
          <p>
            O usuário deve utilizar a plataforma de acordo com a legislação aplicável, incluindo a
            Lei Geral de Proteção de Dados Pessoais (LGPD), normas profissionais e obrigações
            regulatórias pertinentes à atividade odontológica.
          </p>
          <h2>6. Uso adequado</h2>
          <p>
            É proibido utilizar o OdontoGest para fins ilícitos, envio de conteúdo abusivo,
            tentativa de acesso não autorizado, violação de segurança, engenharia reversa indevida,
            sobrecarga da infraestrutura ou qualquer uso que possa prejudicar a plataforma, outros
            usuários ou terceiros.
          </p>
          <h2>7. Disponibilidade e evolução do serviço</h2>
          <p>
            O OdontoGest poderá receber melhorias, ajustes, correções, novas funcionalidades ou
            alterações de regras operacionais. Embora sejam adotados esforços razoáveis para manter
            a plataforma disponível, podem ocorrer indisponibilidades temporárias por manutenção,
            atualizações, falhas técnicas, integrações de terceiros ou eventos fora do controle da
            operação.
          </p>
          <h2>8. Suporte</h2>
          <p>
            O suporte inicial é prestado pelos canais informados no próprio sistema, incluindo
            WhatsApp quando disponível. O atendimento poderá priorizar incidentes que impeçam login,
            uso da assinatura, gravação de dados ou funcionamento essencial da plataforma.
          </p>
          <h2>9. Limitação de responsabilidade</h2>
          <p>
            O OdontoGest é uma ferramenta de apoio à gestão. A clínica continua responsável por suas
            decisões administrativas, comerciais, financeiras, clínicas, profissionais e
            regulatórias. A plataforma não substitui sistemas, rotinas, conferências, orientações
            profissionais ou obrigações legais que sejam exigidas da clínica.
          </p>
          <h2>10. Alterações destes Termos</h2>
          <p>
            Estes Termos podem ser atualizados para refletir mudanças no serviço, em planos,
            integrações, obrigações legais ou práticas operacionais. A versão publicada nesta página
            será a versão vigente para uso da plataforma.
          </p>
          <h2>11. Contato</h2>
          <p>
            Para dúvidas sobre estes Termos, assinatura, acesso ou uso do OdontoGest, entre em
            contato pelos canais de suporte disponibilizados dentro da plataforma.
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
