import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon.component';

interface Feature {
  readonly icon: string;
  readonly title: string;
  readonly description: string;
}

@Component({
  selector: 'og-landing-features-section',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './features-section.component.html',
  styleUrl: './features-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingFeaturesSectionComponent {
  protected readonly features: readonly Feature[] = [
    {
      icon: 'calendar_month',
      title: 'Agenda com visão de ocupação',
      description:
        'Acompanhe horários, retornos e capacidade do time sem depender de controles paralelos.',
    },
    {
      icon: 'groups',
      title: 'Pacientes e equipe organizados',
      description:
        'Centralize cadastros, profissionais e informações importantes para um atendimento mais fluido.',
    },
    {
      icon: 'account_balance_wallet',
      title: 'Financeiro conectado',
      description:
        'Visualize previsão de receita, recebimentos e pontos de atenção junto da operação.',
    },
    {
      icon: 'monitoring',
      title: 'Indicadores para decidir melhor',
      description:
        'Transforme dados da clínica em sinais simples para melhorar rotina, vendas e recorrência.',
    },
  ];
}
