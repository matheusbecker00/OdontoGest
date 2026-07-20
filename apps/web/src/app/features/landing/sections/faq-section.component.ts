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
        'Sim. A ideia e concentrar agenda, cadastros, equipe e indicadores em uma rotina unica, reduzindo retrabalho e informacoes duplicadas.',
    },
    {
      question: 'Consigo testar antes de contratar?',
      answer:
        'A landing direciona para cadastro gratuito. Ajuste as regras comerciais do teste conforme a oferta final do produto.',
    },
    {
      question: 'Serve para clinicas com mais de um profissional?',
      answer:
        'Sim. A estrutura foi pensada para equipes, com profissionais, permissoes e informacoes compartilhadas de forma organizada.',
    },
    {
      question: 'Posso personalizar textos, planos e imagens depois?',
      answer:
        'Sim. Os conteudos estao separados por secao para facilitar troca de copy, precos, depoimentos e mockups reais.',
    },
  ];
}
