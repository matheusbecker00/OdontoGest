import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Faq {
  readonly question: string;
  readonly answer: string;
}

@Component({
  selector: 'og-landing-faq-section',
  standalone: true,
  templateUrl: './faq-section.component.html',
  styleUrl: './faq-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFaqSectionComponent {
  protected readonly faqs: readonly Faq[] = [
    {
      question: 'O OdontoGest substitui planilhas e agendas manuais?',
      answer:
        'Sim. A ideia é concentrar agenda, cadastros, equipe e indicadores em uma rotina única, reduzindo retrabalho e informações duplicadas.',
    },
    {
      question: 'Consigo testar antes de contratar?',
      answer:
        'Sim. Você pode criar sua conta e usar o OdontoGest por 15 dias gratuitamente antes de escolher um plano.',
    },
    {
      question: 'Serve para clínicas com mais de um profissional?',
      answer:
        'Sim. A estrutura foi pensada para equipes, com profissionais, permissões e informações compartilhadas de forma organizada.',
    },
    {
      question: 'Posso mudar de plano depois?',
      answer:
        'Sim. Você pode começar pelo plano ideal para o momento atual e evoluir conforme a necessidade da clínica.',
    },
  ];
}
