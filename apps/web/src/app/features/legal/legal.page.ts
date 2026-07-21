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
          <h1>Política de Privacidade</h1>
          <p class="notice">
            Versão 2026-07-21. Esta Política explica como o OdontoGest trata dados pessoais no uso
            da plataforma, incluindo cadastro, trial, assinatura, suporte e rotinas administrativas
            da clínica.
          </p>
          <h2>1. Quem somos</h2>
          <p>
            O OdontoGest é uma plataforma online para gestão administrativa de clínicas e
            consultórios odontológicos. Para fins desta Política, “OdontoGest”, “nós” ou
            “plataforma” se refere ao serviço disponibilizado em odontogest-web.vercel.app e seus
            ambientes relacionados.
          </p>
          <h2>2. Dados que podemos tratar</h2>
          <p>
            Podemos tratar dados de cadastro e acesso, como nome, e-mail, identificador de usuário,
            clínica vinculada, função, permissões, evidência de aceite dos Termos, data de criação
            da conta, dados de sessão, registros de autenticação e eventos de segurança.
          </p>
          <p>
            Também podemos tratar dados inseridos pela clínica durante o uso do sistema, incluindo
            dados de pacientes, dentistas, equipe, agenda, procedimentos, financeiro, estoque,
            relatórios, configurações da clínica e informações necessárias para suporte e auditoria.
          </p>
          <p>
            Para assinatura e cobrança, podemos tratar status do plano, histórico de checkout, dados
            de pagamento retornados por provedores terceiros, identificadores de cobrança, eventos
            de webhook, plano contratado e informações de regularidade da assinatura.
          </p>
          <h2>3. Dados de saúde e dados sensíveis</h2>
          <p>
            A clínica pode inserir dados relacionados a pacientes e à rotina odontológica. Esses
            dados podem incluir informações pessoais e, dependendo do uso feito pela clínica, dados
            sensíveis ou dados de saúde. A clínica é responsável por garantir base legal adequada,
            transparência com seus pacientes e cumprimento das obrigações aplicáveis à sua
            atividade.
          </p>
          <h2>4. Finalidades do tratamento</h2>
          <p>
            Utilizamos dados para criar e autenticar contas, operar a plataforma, identificar a
            clínica ativa, aplicar permissões, permitir cadastros e consultas, controlar trial e
            assinatura, processar checkout, bloquear ou liberar gravações conforme status de
            pagamento, prestar suporte, prevenir abuso, corrigir falhas, manter logs de auditoria e
            melhorar a segurança do serviço.
          </p>
          <h2>5. Compartilhamento com terceiros</h2>
          <p>
            Podemos compartilhar dados com fornecedores necessários para operar a plataforma, como
            serviços de hospedagem, autenticação, banco de dados, infraestrutura, monitoramento,
            processamento de pagamento e comunicação de suporte. Esses fornecedores atuam conforme
            suas próprias políticas e contratos aplicáveis.
          </p>
          <p>
            Atualmente, a plataforma pode utilizar serviços como Firebase, Firebase Data Connect,
            Vercel e Asaas para autenticação, armazenamento, backend, deploy, checkout, cobrança e
            confirmação de pagamentos.
          </p>
          <h2>6. Segurança</h2>
          <p>
            Adotamos medidas técnicas e organizacionais razoáveis para proteger os dados, incluindo
            autenticação, controle de acesso por clínica, regras de permissão, registros de
            auditoria, bloqueios por status de assinatura e uso de provedores de infraestrutura
            reconhecidos. Nenhum sistema, porém, é completamente imune a falhas, indisponibilidades
            ou acessos indevidos.
          </p>
          <h2>7. Retenção e exclusão</h2>
          <p>
            Os dados podem ser mantidos enquanto a conta estiver ativa, enquanto forem necessários
            para operação do serviço, cumprimento de obrigações legais, exercício regular de
            direitos, prevenção de fraude, auditoria ou resolução de disputas. Solicitações de
            exclusão serão avaliadas conforme obrigações legais, contratuais, técnicas e
            regulatórias aplicáveis.
          </p>
          <h2>8. Direitos dos titulares</h2>
          <p>
            Nos termos da LGPD, titulares podem solicitar confirmação de tratamento, acesso,
            correção, anonimização, bloqueio, eliminação, portabilidade, informação sobre
            compartilhamento e revisão de decisões automatizadas quando aplicável. Algumas
            solicitações relacionadas a pacientes podem precisar ser direcionadas à própria clínica,
            que controla os dados inseridos na plataforma.
          </p>
          <h2>9. Responsabilidades da clínica</h2>
          <p>
            A clínica é responsável por orientar sua equipe, definir permissões de acesso, manter
            dados corretos, obter autorizações quando necessárias, informar pacientes e cumprir
            normas legais, profissionais e regulatórias aplicáveis ao tratamento de dados pessoais e
            dados de saúde.
          </p>
          <h2>10. Cookies e tecnologias similares</h2>
          <p>
            Podemos utilizar recursos técnicos necessários para autenticação, manutenção da sessão,
            segurança, funcionamento da aplicação, preferências e análise operacional básica. O
            bloqueio desses recursos pode prejudicar ou impedir o uso da plataforma.
          </p>
          <h2>11. Alterações desta Política</h2>
          <p>
            Esta Política pode ser atualizada para refletir mudanças no produto, nas integrações, em
            práticas operacionais ou em exigências legais. A versão publicada nesta página será a
            versão vigente.
          </p>
          <h2>12. Contato</h2>
          <p>
            Para dúvidas ou solicitações sobre privacidade, dados pessoais, assinatura ou suporte,
            entre em contato pelos canais disponibilizados na plataforma.
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
