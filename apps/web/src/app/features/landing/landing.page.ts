import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';
import { LandingFaqSectionComponent } from './sections/faq-section.component';
import { LandingFeaturesSectionComponent } from './sections/features-section.component';
import { LandingHeroSectionComponent } from './sections/hero-section.component';
import { LandingPricingSectionComponent } from './sections/pricing-section.component';
import { LandingProblemSolutionComponent } from './sections/problem-solution.component';
import { LandingTestimonialsSectionComponent } from './sections/testimonials-section.component';

@Component({
  selector: 'og-landing-page',
  standalone: true,
  imports: [
    RouterLink,
    IconComponent,
    LandingFaqSectionComponent,
    LandingFeaturesSectionComponent,
    LandingHeroSectionComponent,
    LandingPricingSectionComponent,
    LandingProblemSolutionComponent,
    LandingTestimonialsSectionComponent,
  ],
  templateUrl: './landing.page.html',
  styleUrl: './landing.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LandingPage {
  protected readonly menuOpen = signal(false);

  protected toggleMenu(): void {
    this.menuOpen.update((isOpen) => !isOpen);
  }

  protected closeMenu(): void {
    this.menuOpen.set(false);
  }
}
