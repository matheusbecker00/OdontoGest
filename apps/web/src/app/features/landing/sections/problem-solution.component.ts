import { ChangeDetectionStrategy, Component } from '@angular/core';
import { IconComponent } from '../../../shared/components/icon.component';

@Component({
  selector: 'og-landing-problem-solution',
  standalone: true,
  imports: [IconComponent],
  templateUrl: './problem-solution.component.html',
  styleUrl: './problem-solution.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingProblemSolutionComponent {}
