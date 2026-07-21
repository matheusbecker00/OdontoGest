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
      note: '15 dias gratuitos para começar.',
      description: 'Para consultórios iniciando a organização digital.',
      features: ['Agenda e cadastros essenciais', 'Pacientes e procedimentos', 'Suporte por email'],
    },
    {
      name: 'Pro',
      price: 'R$ 49,90',
      note: '15 dias gratuitos. Depois R$ 49,90 nos primeiros 3 meses e R$ 79,90/mês.',
      description: 'Para clínicas que precisam de visão operacional e financeira.',
      featured: true,
      features: [
        'Tudo do Starter',
        'Financeiro e indicadores',
        'Equipe com permissões',
        'Suporte prioritario',
      ],
    },
    {
      name: 'Enterprise',
      price: 'Sob consulta',
      description: 'Para operações maiores com necessidades específicas.',
      features: [
        'Fluxos personalizados',
        'Acompanhamento dedicado',
        'Condições comerciais sob medida',
      ],
    },
  ];
}
