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
      title: 'Agenda com visao de ocupacao',
      description:
        'Acompanhe horarios, retornos e capacidade do time sem depender de controles paralelos.',
    },
    {
      icon: 'groups',
      title: 'Pacientes e equipe organizados',
      description:
        'Centralize cadastros, profissionais e informacoes importantes para um atendimento mais fluido.',
    },
    {
      icon: 'account_balance_wallet',
      title: 'Financeiro conectado',
      description:
        'Visualize previsao de receita, recebimentos e pontos de atencao junto da operacao.',
    },
    {
      icon: 'monitoring',
      title: 'Indicadores para decidir melhor',
      description:
        'Transforme dados da clinica em sinais simples para melhorar rotina, vendas e recorrencia.',
    },
  ];
}
