import { ChangeDetectionStrategy, Component } from '@angular/core';

interface Testimonial {
  readonly quote: string;
  readonly name: string;
  readonly role: string;
}

@Component({
  selector: 'og-landing-testimonials-section',
  standalone: true,
  templateUrl: './testimonials-section.component.html',
  styleUrl: './testimonials-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingTestimonialsSectionComponent {
  protected readonly testimonials: readonly Testimonial[] = [
    {
      quote:
        'Antes eu perdia tempo conferindo agenda, financeiro e retornos em lugares diferentes. Com o OdontoGest, a equipe entende o dia em poucos minutos.',
      name: 'Dra. Camila Rocha',
      role: 'Clínica Sorriso Prime',
    },
    {
      quote:
        'A rotina ficou mais organizada e conseguimos acompanhar melhor os pacientes que precisam voltar. A visão da agenda ajuda muito na tomada de decisão.',
      name: 'Rafael Monteiro',
      role: 'Gestor da Oral Center',
    },
    {
      quote:
        'O painel trouxe clareza para a operação. Hoje sabemos onde estão os gargalos e conseguimos planejar melhor a semana da clínica.',
      name: 'Dra. Helena Martins',
      role: 'Odonto Martins',
    },
  ];
}
