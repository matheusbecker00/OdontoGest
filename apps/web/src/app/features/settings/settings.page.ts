import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  inject,
  signal,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { AuthStore } from '../../core/auth/auth.store';
import { IconComponent } from '../../shared/components/icon.component';
import { type ClinicSettings, SettingsRepository } from './settings.repository';

const STORAGE_PREFIX = 'odontogest.settings';

@Component({
  selector: 'og-settings-page',
  imports: [ReactiveFormsModule, MatButtonModule, IconComponent],
  template: `
    <main class="settings-page">
      <section class="page-heading">
        <div>
          <span class="eyebrow">CONFIGURAÇÕES</span>
          <h2>Preferências da clínica</h2>
          <p>Centralize dados da clínica e padrões operacionais do OdontoGest.</p>
          <span class="sync-pill" [class.sync-pill--local]="syncState() === 'local'">
            <og-icon [name]="syncState() === 'online' ? 'verified_user' : 'inventory_2'" />
            {{ syncLabel() }}
          </span>
        </div>
      </section>

      <section class="settings-grid">
        <article class="profile-card">
          <span class="profile-card__icon"><og-icon name="domain" /></span>
          <div>
            <small>Clínica ativa</small>
            <strong>{{ form.controls.clinicName.value || clinicName() }}</strong>
            <span>{{
              form.controls.email.value || auth.user()?.email || 'E-mail não informado'
            }}</span>
          </div>
        </article>
        <article class="profile-card">
          <span class="profile-card__icon"><og-icon name="settings" /></span>
          <div>
            <small>Agenda padrão</small>
            <strong
              >{{ form.controls.openingTime.value }}–{{ form.controls.closingTime.value }}</strong
            >
            <span
              >{{ form.controls.defaultAppointmentDurationMinutes.value }} min por atendimento</span
            >
          </div>
        </article>
        <article class="profile-card">
          <span class="profile-card__icon"><og-icon name="notifications_none" /></span>
          <div>
            <small>Alertas</small>
            <strong>{{ enabledAlerts() }}</strong>
            <span>Estoque e financeiro operacional</span>
          </div>
        </article>
      </section>

      <form class="settings-form" [formGroup]="form" (ngSubmit)="saveSettings()">
        <section class="panel">
          <header>
            <div>
              <h3>Dados da clínica</h3>
              <p>Essas informações aparecem nas áreas operacionais e relatórios.</p>
            </div>
          </header>
          <div class="form-grid">
            <label>
              Nome da clínica
              <input formControlName="clinicName" placeholder="Nome fantasia da clínica" />
            </label>
            <label>
              Responsável
              <input formControlName="responsibleName" placeholder="Nome do responsável" />
            </label>
            <label>
              CNPJ
              <input formControlName="cnpj" inputmode="numeric" placeholder="00.000.000/0000-00" />
            </label>
            <label>
              Telefone
              <input formControlName="phone" placeholder="(00) 00000-0000" />
            </label>
            <label>
              E-mail
              <input formControlName="email" type="email" placeholder="contato@clinica.com" />
            </label>
            <label class="form-grid__full">
              Endereço
              <input formControlName="address" placeholder="Rua, número, bairro, cidade" />
            </label>
          </div>
        </section>

        <section class="panel">
          <header>
            <div>
              <h3>Operação</h3>
              <p>Defina padrões para agenda, relatórios e alertas.</p>
            </div>
          </header>
          <div class="form-grid">
            <label>
              Fuso horário
              <select formControlName="timezone">
                <option value="America/Sao_Paulo">Brasília / São Paulo</option>
                <option value="America/Cuiaba">Cuiabá</option>
                <option value="America/Manaus">Manaus</option>
                <option value="America/Rio_Branco">Rio Branco</option>
              </select>
            </label>
            <label>
              Intervalo da grade
              <select formControlName="appointmentIntervalMinutes">
                <option [ngValue]="10">10 minutos</option>
                <option [ngValue]="15">15 minutos</option>
                <option [ngValue]="30">30 minutos</option>
                <option [ngValue]="60">60 minutos</option>
              </select>
            </label>
            <label>
              Abertura
              <input formControlName="openingTime" type="time" />
            </label>
            <label>
              Fechamento
              <input formControlName="closingTime" type="time" />
            </label>
            <label>
              Duração padrão
              <input
                formControlName="defaultAppointmentDurationMinutes"
                type="number"
                min="10"
                step="5"
              />
            </label>
          </div>
        </section>

        <section class="panel">
          <header>
            <div>
              <h3>Alertas e observações</h3>
              <p>Preferências usadas nos painéis operacionais.</p>
            </div>
          </header>
          <div class="toggles">
            <label>
              <input formControlName="notifyLowStock" type="checkbox" />
              <span>
                <strong>Alertar estoque baixo</strong>
                <small>Destaca materiais em reposição no dashboard e relatórios.</small>
              </span>
            </label>
            <label>
              <input formControlName="notifyOpenPayments" type="checkbox" />
              <span>
                <strong>Alertar recebimentos em aberto</strong>
                <small>Ajuda a acompanhar pendências financeiras da clínica.</small>
              </span>
            </label>
          </div>
          <label class="notes">
            Observações internas
            <textarea
              formControlName="notes"
              rows="3"
              placeholder="Anotações administrativas"
            ></textarea>
          </label>
        </section>

        @if (formError()) {
          <p class="form-error">{{ formError() }}</p>
        }
        @if (savedMessage()) {
          <p class="form-success">{{ savedMessage() }}</p>
        }

        <div class="actions">
          <button mat-flat-button type="submit">Salvar configurações</button>
        </div>
      </form>
    </main>
  `,
  styles: `
    :host {
      display: block;
      color: #10213a;
    }
    .page-heading {
      margin-bottom: 1rem;
    }
    .eyebrow {
      color: #2563eb;
      font-size: 0.67rem;
      font-weight: 850;
      letter-spacing: 0.12em;
    }
    h2,
    h3 {
      margin: 0;
    }
    h2 {
      margin-top: 0.25rem;
      font-size: clamp(1.65rem, 3vw, 2.15rem);
    }
    .page-heading p,
    .panel header p,
    .profile-card span,
    .toggles small {
      margin: 0.25rem 0 0;
      color: #718198;
      font-size: 0.82rem;
    }
    .sync-pill {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      margin-top: 0.65rem;
      border: 1px solid #b9f0d3;
      border-radius: 99px;
      padding: 0.35rem 0.6rem;
      color: #047857;
      background: #ecfdf5;
      font-size: 0.68rem;
      font-weight: 800;
    }
    .sync-pill--local {
      border-color: #fed7aa;
      color: #b45309;
      background: #fff7ed;
    }
    .sync-pill og-icon {
      width: 0.95rem;
      height: 0.95rem;
    }
    .settings-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .profile-card,
    .panel {
      border: 1px solid #e4eaf1;
      border-radius: 0.9rem;
      background: #fff;
      box-shadow: 0 5px 18px rgb(15 23 42 / 4%);
    }
    .profile-card {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 1rem;
    }
    .profile-card__icon {
      display: grid;
      flex: 0 0 auto;
      width: 2.75rem;
      height: 2.75rem;
      place-items: center;
      border-radius: 0.8rem;
      color: #2563eb;
      background: #eaf2ff;
    }
    .profile-card__icon og-icon {
      width: 1.45rem;
      height: 1.45rem;
    }
    .profile-card small,
    .profile-card strong,
    .profile-card span {
      display: block;
    }
    .profile-card small {
      color: #667895;
      font-size: 0.68rem;
      font-weight: 800;
    }
    .profile-card strong {
      margin-top: 0.1rem;
      font-size: 1rem;
    }
    .settings-form {
      display: grid;
      gap: 1rem;
    }
    .panel {
      overflow: hidden;
      padding-bottom: 1rem;
    }
    .panel > header {
      padding: 1rem 1.1rem;
      border-bottom: 1px solid #edf1f5;
      margin-bottom: 1rem;
    }
    .form-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.85rem;
      padding: 0 1rem;
    }
    .form-grid__full {
      grid-column: 1/-1;
    }
    label,
    .notes {
      display: grid;
      gap: 0.32rem;
      color: #5d7089;
      font-size: 0.68rem;
      font-weight: 800;
    }
    input,
    select,
    textarea {
      width: 100%;
      min-height: 2.45rem;
      border: 1px solid #d9e2ed;
      border-radius: 0.65rem;
      padding: 0.6rem 0.7rem;
      color: #10213a;
      background: #fff;
      font: inherit;
      font-size: 0.78rem;
      outline: none;
    }
    textarea {
      resize: vertical;
    }
    input:focus,
    select:focus,
    textarea:focus {
      border-color: #8bb3f5;
      box-shadow: 0 0 0 3px rgb(37 99 235 / 10%);
    }
    .toggles {
      display: grid;
      gap: 0.75rem;
      padding: 0 1rem 1rem;
    }
    .toggles label {
      display: flex;
      align-items: flex-start;
      gap: 0.7rem;
      border: 1px solid #e8edf3;
      border-radius: 0.75rem;
      padding: 0.85rem;
      background: #fafbfd;
    }
    .toggles input {
      width: 1rem;
      min-height: 1rem;
      margin-top: 0.15rem;
    }
    .toggles strong,
    .toggles small {
      display: block;
    }
    .notes {
      margin: 0 1rem;
    }
    .form-error,
    .form-success {
      margin: 0;
      border-radius: 0.65rem;
      padding: 0.75rem;
      font-size: 0.74rem;
      font-weight: 650;
    }
    .form-error {
      color: #b42318;
      background: #fff0ee;
    }
    .form-success {
      color: #047857;
      background: #ecfdf5;
    }
    .actions {
      display: flex;
      justify-content: flex-end;
    }
    @media (width < 76rem) {
      .settings-grid {
        grid-template-columns: 1fr;
      }
    }
    @media (width < 44rem) {
      .form-grid {
        grid-template-columns: 1fr;
      }
      .form-grid__full {
        grid-column: auto;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SettingsPage {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly auth = inject(AuthStore);
  private readonly settingsRepository = inject(SettingsRepository);
  private readonly savedSettings = signal<ClinicSettings | null>(this.readStoredSettings());

  protected readonly formError = signal<string | null>(null);
  protected readonly savedMessage = signal<string | null>(null);
  protected readonly syncState = signal<'connecting' | 'online' | 'local'>('connecting');
  protected readonly clinicName = computed(
    () => this.auth.clinics()[0]?.name || this.auth.user()?.name || 'Clínica ativa',
  );
  protected enabledAlerts(): string {
    const alerts = [
      this.form.controls.notifyLowStock.value ? 'Estoque' : null,
      this.form.controls.notifyOpenPayments.value ? 'Financeiro' : null,
    ].filter(Boolean);
    return alerts.length > 0 ? alerts.join(' + ') : 'Nenhum';
  }
  protected readonly syncLabel = computed(() => {
    if (this.syncState() === 'online') return 'Sincronizado no Firebase';
    if (this.syncState() === 'connecting') return 'Conectando ao Firebase';
    return 'Modo local temporário';
  });
  protected readonly form = this.formBuilder.nonNullable.group({
    clinicName: ['', [Validators.required, Validators.maxLength(180)]],
    responsibleName: ['', [Validators.required, Validators.maxLength(160)]],
    cnpj: ['', Validators.maxLength(18)],
    phone: ['', Validators.maxLength(40)],
    email: ['', [Validators.email, Validators.maxLength(180)]],
    address: ['', Validators.maxLength(240)],
    timezone: ['America/Sao_Paulo', Validators.required],
    openingTime: ['08:00', Validators.required],
    closingTime: ['18:00', Validators.required],
    appointmentIntervalMinutes: [
      30,
      [Validators.required, Validators.min(10), Validators.max(120)],
    ],
    defaultAppointmentDurationMinutes: [
      30,
      [Validators.required, Validators.min(10), Validators.max(480)],
    ],
    notifyLowStock: [true],
    notifyOpenPayments: [true],
    notes: ['', Validators.maxLength(500)],
  });

  constructor() {
    this.applySettings(this.savedSettings() ?? this.defaultSettings());

    effect((onCleanup) => {
      const clinicId = this.activeClinicId();
      let disposed = false;
      let unsubscribe: (() => void) | null = null;
      this.syncState.set('connecting');

      void this.settingsRepository
        .subscribe(
          clinicId,
          (settings) => {
            if (disposed) return;
            const next = settings ?? this.defaultSettings();
            this.syncState.set('online');
            this.savedSettings.set(next);
            this.writeStoredSettings(next);
            this.applySettings(next);
          },
          (error) => {
            if (disposed) return;
            console.warn('Using local settings storage.', error);
            this.syncState.set('local');
          },
        )
        .then((nextUnsubscribe) => {
          if (disposed) {
            nextUnsubscribe();
            return;
          }
          unsubscribe = nextUnsubscribe;
        })
        .catch((error) => {
          if (disposed) return;
          console.warn('Using local settings storage.', error);
          this.syncState.set('local');
        });

      onCleanup(() => {
        disposed = true;
        unsubscribe?.();
      });
    });
  }

  protected async saveSettings(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.formError.set('Revise os campos obrigatórios antes de salvar.');
      this.savedMessage.set(null);
      return;
    }

    const value = this.form.getRawValue();
    const cnpjError = this.cnpjError(value.cnpj);
    if (cnpjError) {
      this.formError.set(cnpjError);
      this.savedMessage.set(null);
      return;
    }

    const now = new Date().toISOString();
    const previous = this.savedSettings();
    const next: ClinicSettings = {
      clinicId: this.activeClinicId(),
      userId: await this.currentUserIdForWrite(),
      clinicName: value.clinicName.trim(),
      responsibleName: value.responsibleName.trim(),
      cnpj: value.cnpj.trim(),
      phone: value.phone.trim(),
      email: value.email.trim(),
      address: value.address.trim(),
      timezone: value.timezone,
      openingTime: value.openingTime,
      closingTime: value.closingTime,
      appointmentIntervalMinutes: value.appointmentIntervalMinutes,
      defaultAppointmentDurationMinutes: value.defaultAppointmentDurationMinutes,
      notifyLowStock: value.notifyLowStock,
      notifyOpenPayments: value.notifyOpenPayments,
      notes: value.notes.trim() || null,
      createdAt: previous?.createdAt ?? now,
      updatedAt: now,
    };

    this.savedSettings.set(next);
    this.writeStoredSettings(next);

    try {
      await this.settingsRepository.upsert(next);
      this.syncState.set('online');
      this.formError.set(null);
      this.savedMessage.set('Configurações salvas com sucesso.');
    } catch (error) {
      console.warn('Could not sync settings.', error);
      this.syncState.set('local');
      this.formError.set(
        'Configurações salvas neste navegador. Verifique o Firestore para sincronizar.',
      );
      this.savedMessage.set(null);
    }
  }

  private applySettings(settings: ClinicSettings): void {
    this.form.setValue({
      clinicName: settings.clinicName,
      responsibleName: settings.responsibleName,
      cnpj: settings.cnpj ?? '',
      phone: settings.phone,
      email: settings.email,
      address: settings.address,
      timezone: settings.timezone,
      openingTime: settings.openingTime,
      closingTime: settings.closingTime,
      appointmentIntervalMinutes: settings.appointmentIntervalMinutes,
      defaultAppointmentDurationMinutes: settings.defaultAppointmentDurationMinutes,
      notifyLowStock: settings.notifyLowStock,
      notifyOpenPayments: settings.notifyOpenPayments,
      notes: settings.notes ?? '',
    });
  }

  private defaultSettings(): ClinicSettings {
    const now = new Date().toISOString();
    return {
      clinicId: this.activeClinicId(),
      userId: this.auth.user()?.id ?? 'local-user',
      clinicName: this.clinicName(),
      responsibleName: this.auth.user()?.name ?? '',
      cnpj: '',
      phone: '',
      email: this.auth.user()?.email ?? '',
      address: '',
      timezone: 'America/Sao_Paulo',
      openingTime: '08:00',
      closingTime: '18:00',
      appointmentIntervalMinutes: 30,
      defaultAppointmentDurationMinutes: 30,
      notifyLowStock: true,
      notifyOpenPayments: true,
      notes: null,
      createdAt: now,
      updatedAt: now,
    };
  }

  private readStoredSettings(): ClinicSettings | null {
    try {
      const value = globalThis.localStorage?.getItem(this.storageKey());
      return value ? (JSON.parse(value) as ClinicSettings) : null;
    } catch {
      return null;
    }
  }

  private writeStoredSettings(settings: ClinicSettings): void {
    try {
      globalThis.localStorage?.setItem(this.storageKey(), JSON.stringify(settings));
    } catch {
      this.formError.set('Não foi possível salvar neste navegador.');
    }
  }

  private cnpjError(cnpj: string): string | null {
    const value = cnpj.trim();
    if (!value) return null;
    const digits = value.replace(/\D/g, '');
    if (digits.length !== 14) return 'Informe um CNPJ com 14 números ou deixe o campo vazio.';
    if (/^(\d)\1+$/.test(digits)) return 'Informe um CNPJ válido.';
    return null;
  }

  private async currentUserIdForWrite(): Promise<string> {
    try {
      return await this.settingsRepository.currentUserId();
    } catch {
      return this.auth.user()?.id ?? 'local-user';
    }
  }

  private activeClinicId(): string {
    return this.auth.tenantContext()?.activeClinicId ?? 'provisional-clinic';
  }

  private storageKey(): string {
    return `${STORAGE_PREFIX}.${this.activeClinicId()}`;
  }
}
