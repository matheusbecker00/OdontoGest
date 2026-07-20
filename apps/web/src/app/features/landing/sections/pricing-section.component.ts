import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon.component';

interface Plan {
  readonly name: string;
  readonly price: string;
  readonly note?: string;
  readonly description: string;
  readonly featured?: boolean;
  readonly features: readonly string[];
}

@Component({
  selector: 'og-landing-pricing-section',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './pricing-section.component.html',
  styleUrl: './pricing-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPricingSectionComponent {
  protected readonly plans: readonly Plan[] = [
    {
      name: 'Starter',
      price: 'R$ 49,90',
      description: 'Para consultorios iniciando a organizacao digital.',
      features: ['Agenda e cadastros essenciais', 'Pacientes e procedimentos', 'Suporte por email'],
    },
    {
      name: 'Pro',
      price: 'R$ 49,90',
      note: '*nos primeiros 3 meses',
      description: 'Para clinicas que precisam de visao operacional e financeira.',
      featured: true,
      features: [
        'Tudo do Starter',
        'Financeiro e indicadores',
        'Equipe com permissoes',
        'Suporte prioritario',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Sob consulta',
      description: 'Para operacoes maiores com necessidades especificas.',
      features: [
        'Fluxos personalizados',
        'Acompanhamento dedicado',
        'Condicoes comerciais sob medida',
      ],
    },
  ];
}
