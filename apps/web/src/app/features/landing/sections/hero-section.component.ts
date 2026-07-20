import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../../shared/components/icon.component';

@Component({
  selector: 'og-landing-hero-section',
  standalone: true,
  imports: [RouterLink, IconComponent],
  templateUrl: './hero-section.component.html',
  styleUrl: './hero-section.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingHeroSectionComponent {}
