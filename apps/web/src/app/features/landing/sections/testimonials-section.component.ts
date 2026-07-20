import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'og-landing-testimonials-section',
  standalone: true,
  templateUrl: './testimonials-section.component.html',
  styleUrl: './testimonials-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingTestimonialsSectionComponent {
  protected readonly placeholders = [
    'Insira aqui um depoimento sobre reducao de tempo na rotina administrativa.',
    'Insira aqui uma avaliacao sobre melhora na organizacao dos atendimentos.',
    'Insira aqui uma historia de crescimento ou previsibilidade financeira.',
  ];
}
