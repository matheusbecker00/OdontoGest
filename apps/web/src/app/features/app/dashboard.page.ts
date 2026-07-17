import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { AuthStore } from '../../core/auth/auth.store';

@Component({
  selector: 'og-dashboard-page',
  imports: [MatButtonModule, MatCardModule, MatSelectModule, RouterLink],
  template: `
    <main class="foundation-page">
      <header>
        <div>
          <span>ODONTOGEST</span>
          <h1>Fundação segura ativa</h1>
          <p>Este painel provisório será substituído pelo shell completo na Fase 2.</p>
        </div>
        <button mat-stroked-button type="button" (click)="logout()">Sair</button>
      </header>

      <section class="cards" aria-label="Estado da fundação">
        <mat-card appearance="outlined">
          <mat-card-header><mat-card-title>Sessão</mat-card-title></mat-card-header>
          <mat-card-content>Autenticação protegida pelo Firebase.</mat-card-content>
        </mat-card>
        <mat-card appearance="outlined">
          <mat-card-header><mat-card-title>Tenant</mat-card-title></mat-card-header>
          <mat-card-content>
            {{ auth.tenantContext()?.activeClinicId ?? 'Selecione uma clínica' }}
          </mat-card-content>
        </mat-card>
        <mat-card appearance="outlined">
          <mat-card-header><mat-card-title>Permissões</mat-card-title></mat-card-header>
          <mat-card-content>{{ auth.permissions().size }} permissões ativas</mat-card-content>
        </mat-card>
      </section>

      @if (auth.hasEveryPermission(['patient.read'])) {
        <a mat-flat-button routerLink="/app/pacientes">Gerenciar pacientes</a>
      }

      @if (auth.clinics().length > 1) {
        <mat-form-field appearance="outline">
          <mat-label>Clínica ativa</mat-label>
          <mat-select (selectionChange)="selectClinic($event.value)">
            @for (clinic of auth.clinics(); track clinic.id) {
              <mat-option [value]="clinic.id">{{ clinic.name }} — {{ clinic.role }}</mat-option>
            }
          </mat-select>
        </mat-form-field>
      }
    </main>
  `,
  styles: `
    :host {
      display: block;
      min-height: 100dvh;
      background: #f1f5f9;
      color: #0f172a;
    }
    .foundation-page {
      max-width: 90rem;
      margin: auto;
      padding: clamp(1rem, 4vw, 3rem);
    }
    header {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 1rem;
    }
    header span {
      color: #2563eb;
      font-weight: 800;
    }
    h1 {
      margin: 0.25rem 0;
    }
    header p {
      margin: 0;
      color: #64748b;
    }
    .cards {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
      margin: 2rem 0;
    }
    mat-card {
      border-radius: 1.375rem;
    }
    mat-form-field {
      width: min(100%, 28rem);
    }
    @media (width < 48rem) {
      .cards {
        grid-template-columns: 1fr;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  protected readonly auth = inject(AuthStore);
  private readonly router = inject(Router);

  protected async logout(): Promise<void> {
    await this.auth.logout();
    await this.router.navigateByUrl('/login');
  }

  protected async selectClinic(clinicId: string): Promise<void> {
    await this.auth.selectClinic(clinicId);
  }
}
