import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IconComponent } from '../../shared/components/icon.component';

@Component({
  selector: 'og-workspace-placeholder-page',
  imports: [IconComponent],
  template: `
    <main class="placeholder-page">
      <section class="heading">
        <span class="eyebrow">ODONTOGEST</span>
        <h2>{{ data.title }}</h2>
        <p>{{ data.description }}</p>
      </section>
      <section class="feature-card">
        <span class="feature-icon"><og-icon [name]="data.icon" /></span>
        <div>
          <span class="tag">EM IMPLANTAÇÃO</span>
          <h3>Este módulo está sendo preparado</h3>
          <p>
            A navegação já está disponível e esta área receberá os recursos operacionais nas
            próximas entregas.
          </p>
        </div>
      </section>
    </main>
  `,
  styles: `
    :host {
      display: block;
      color: #10213a;
    }
    .heading {
      margin-bottom: 1.5rem;
    }
    .eyebrow {
      color: #2563eb;
      font-size: 0.67rem;
      font-weight: 850;
      letter-spacing: 0.12em;
    }
    h2 {
      margin: 0.25rem 0;
      font-size: clamp(1.65rem, 3vw, 2.15rem);
      letter-spacing: -0.04em;
    }
    .heading p {
      margin: 0;
      color: #718198;
      font-size: 0.86rem;
    }
    .feature-card {
      display: flex;
      align-items: center;
      gap: 1.25rem;
      max-width: 48rem;
      min-height: 15rem;
      padding: 2rem;
      border: 1px solid #e4eaf1;
      border-radius: 1rem;
      background: #fff;
      box-shadow: 0 5px 18px rgb(15 23 42 / 4%);
    }
    .feature-icon {
      display: grid;
      flex: 0 0 auto;
      width: 4.5rem;
      height: 4.5rem;
      place-items: center;
      border-radius: 1.25rem;
      color: #2563eb;
      background: #edf4ff;
    }
    .feature-icon og-icon {
      width: 2rem;
      height: 2rem;
      font-size: 2rem;
    }
    .tag {
      display: inline-block;
      padding: 0.28rem 0.55rem;
      border-radius: 99px;
      color: #1d4ed8;
      background: #eaf2ff;
      font-size: 0.6rem;
      font-weight: 850;
      letter-spacing: 0.08em;
    }
    h3 {
      margin: 0.75rem 0 0.35rem;
      font-size: 1.15rem;
    }
    .feature-card p {
      max-width: 34rem;
      margin: 0;
      color: #718198;
      font-size: 0.82rem;
      line-height: 1.65;
    }
    @media (width < 38rem) {
      .feature-card {
        align-items: flex-start;
        flex-direction: column;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class WorkspacePlaceholderPage {
  protected readonly data = inject(ActivatedRoute).snapshot.data as {
    title: string;
    description: string;
    icon: string;
  };
}
