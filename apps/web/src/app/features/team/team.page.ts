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
import {
  TeamRepository,
  type TeamInvite,
  type TeamMember,
  type TeamMemberStatus,
  type TeamRole,
} from './team.repository';

const STORAGE_PREFIX = 'odontogest.team';

@Component({
  selector: 'og-team-page',
  imports: [ReactiveFormsModule, MatButtonModule, IconComponent],
  template: `
    <main class="team-page">
      <section class="page-heading">
        <div>
          <span class="eyebrow">EQUIPE</span>
          <h2>Usuários e permissões</h2>
          <p>Prepare a clínica para trabalhar com recepção, dentistas e administradores.</p>
          <span class="sync-pill" [class.sync-pill--local]="syncState() === 'local'">
            <og-icon [name]="syncState() === 'online' ? 'verified_user' : 'inventory_2'" />
            {{ syncLabel() }}
          </span>
        </div>
      </section>

      <section class="summary-grid">
        <article class="summary summary--blue">
          <span><og-icon name="groups" /></span>
          <div>
            <small>Membros ativos</small><strong>{{ activeMembers().length }}</strong>
          </div>
        </article>
        <article class="summary summary--orange">
          <span><og-icon name="password" /></span>
          <div>
            <small>Acessos por código</small><strong>{{ codeMembers().length }}</strong>
          </div>
        </article>
        <article class="summary summary--green">
          <span><og-icon name="verified_user" /></span>
          <div>
            <small>Administradores</small><strong>{{ adminCount() }}</strong>
          </div>
        </article>
      </section>

      <section class="team-layout">
        <article class="panel">
          <header>
            <div>
              <h3>Membros da clínica</h3>
              <p>Usuários com acesso por e-mail ou código numérico.</p>
            </div>
          </header>

          @if (members().length > 0) {
            <div class="rows">
              @for (member of members(); track member.userId) {
                <article class="row" [class.row--muted]="member.status === 'INACTIVE'">
                  <span class="row__icon"><og-icon name="groups" /></span>
                  <div>
                    <strong>{{ member.name || member.email }}</strong>
                    <small>{{ memberAccessLabel(member) }}</small>
                  </div>
                  <em>{{ roleLabel(member.role) }}</em>
                  <strong class="status">{{
                    member.status === 'ACTIVE' ? 'Ativo' : 'Inativo'
                  }}</strong>
                  @if (member.role !== 'OWNER') {
                    <nav aria-label="Ações do membro">
                      <button type="button" (click)="setMemberRole(member, 'ADMIN')">Admin</button>
                      <button type="button" (click)="setMemberRole(member, 'RECEPTIONIST')">
                        Recepção
                      </button>
                      <button type="button" (click)="setMemberRole(member, 'DENTIST')">
                        Dentista
                      </button>
                      <button type="button" (click)="toggleMemberStatus(member)">
                        {{ member.status === 'ACTIVE' ? 'Inativar' : 'Ativar' }}
                      </button>
                    </nav>
                  }
                </article>
              }
            </div>
          } @else {
            <div class="empty-state">
              <span><og-icon name="groups" /></span>
              <strong>Nenhum membro sincronizado</strong>
              <p>O dono da clínica será vinculado automaticamente ao carregar a página.</p>
            </div>
          }
        </article>

        <aside class="side">
          <form class="invite-form" [formGroup]="form" (ngSubmit)="createUser()">
            <header>
              <h3>Novo usuário</h3>
              <button type="button" (click)="resetForm()">Limpar</button>
            </header>
            <label>
              Nome
              <input formControlName="name" type="text" placeholder="Ex.: Ana da recepção" />
            </label>
            <label>
              E-mail ou código numérico
              <input
                formControlName="identifier"
                type="text"
                inputmode="email"
                autocomplete="off"
                placeholder="usuario@clinica.com ou 123456"
              />
            </label>
            <label>
              Senha
              <input
                formControlName="password"
                type="password"
                autocomplete="new-password"
                placeholder="Mínimo de 6 dígitos"
              />
            </label>
            <label>
              Papel
              <select formControlName="role">
                <option value="ADMIN">Admin</option>
                <option value="RECEPTIONIST">Recepção</option>
                <option value="DENTIST">Dentista</option>
              </select>
            </label>

            @if (formError()) {
              <p class="form-error">{{ formError() }}</p>
            }
            @if (formSuccess()) {
              <p class="form-success">{{ formSuccess() }}</p>
            }

            <button mat-flat-button type="submit">Criar usuário</button>
            <small class="hint"
              >A senha cria a credencial no Firebase Authentication e não é salva no
              Firestore.</small
            >
          </form>

          <section class="panel invites-panel">
            <header>
              <div>
                <h3>Convites</h3>
                <p>Pendentes ou cancelados.</p>
              </div>
            </header>
            @if (invites().length > 0) {
              <div class="invites">
                @for (invite of invites(); track invite.id) {
                  <article [class.invite--muted]="invite.status === 'CANCELED'">
                    <div>
                      <strong>{{ invite.email }}</strong>
                      <small
                        >{{ roleLabel(invite.role) }} ·
                        {{ invite.status === 'PENDING' ? 'Pendente' : 'Cancelado' }}</small
                      >
                    </div>
                    @if (invite.status === 'PENDING') {
                      <button type="button" (click)="cancelInvite(invite)">Cancelar</button>
                    }
                  </article>
                }
              </div>
            } @else {
              <div class="empty-state empty-state--small">
                <span><og-icon name="mail" /></span>
                <strong>Nenhum convite</strong>
              </div>
            }
          </section>
        </aside>
      </section>
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
    .row small,
    .invite-form .hint,
    .invites small {
      margin: 0.25rem 0 0;
      color: #718198;
      font-size: 0.82rem;
      line-height: 1.55;
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
    .summary-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 1rem;
      margin-bottom: 1rem;
    }
    .summary,
    .panel,
    .invite-form {
      border: 1px solid #e4eaf1;
      border-radius: 0.9rem;
      background: #fff;
      box-shadow: 0 5px 18px rgb(15 23 42 / 4%);
    }
    .summary {
      display: flex;
      align-items: center;
      gap: 0.85rem;
      padding: 1rem;
    }
    .summary > span,
    .row__icon,
    .empty-state > span {
      display: grid;
      flex: 0 0 auto;
      place-items: center;
      color: #2563eb;
      background: #eaf2ff;
    }
    .summary > span {
      width: 2.75rem;
      height: 2.75rem;
      border-radius: 0.8rem;
    }
    .summary og-icon,
    .row__icon og-icon {
      width: 1.45rem;
      height: 1.45rem;
    }
    .summary small,
    .summary strong {
      display: block;
    }
    .summary small {
      color: #667895;
      font-size: 0.68rem;
      font-weight: 800;
    }
    .summary strong {
      margin-top: 0.1rem;
      font-size: 1.35rem;
    }
    .summary--orange > span {
      color: #ea580c;
      background: #fff1e8;
    }
    .summary--green > span {
      color: #059669;
      background: #e7f8f2;
    }
    .team-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) minmax(21rem, 27rem);
      gap: 1rem;
      align-items: start;
    }
    .side {
      display: grid;
      gap: 1rem;
    }
    .panel,
    .invite-form {
      overflow: hidden;
    }
    .panel > header,
    .invite-form header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      padding: 1rem 1.1rem;
      border-bottom: 1px solid #edf1f5;
    }
    .rows,
    .invites {
      display: grid;
      gap: 0.75rem;
      padding: 1rem;
    }
    .row {
      display: grid;
      grid-template-columns: auto minmax(0, 1fr) auto auto;
      align-items: center;
      gap: 0.8rem;
      border: 1px solid #e8edf3;
      border-radius: 0.8rem;
      padding: 0.85rem;
      background: #fafbfd;
    }
    .row--muted,
    .invite--muted {
      opacity: 0.6;
    }
    .row__icon {
      width: 2.65rem;
      height: 2.65rem;
      border-radius: 0.75rem;
    }
    .row div strong,
    .invites strong {
      display: block;
      font-size: 0.9rem;
    }
    .row em,
    .status {
      border-radius: 99px;
      padding: 0.24rem 0.55rem;
      font-size: 0.62rem;
      font-style: normal;
      font-weight: 850;
      white-space: nowrap;
    }
    .row em {
      color: #2563eb;
      background: #eaf2ff;
    }
    .status {
      color: #047857;
      background: #ecfdf5;
    }
    .row nav {
      grid-column: 2/-1;
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
    }
    .row nav button,
    .invite-form header button,
    .invites button {
      border: 0;
      color: #2563eb;
      background: transparent;
      font: inherit;
      font-size: 0.72rem;
      font-weight: 750;
      cursor: pointer;
    }
    .invite-form {
      display: grid;
      gap: 0.85rem;
      padding: 0 1rem 1rem;
    }
    .invite-form label {
      display: grid;
      gap: 0.32rem;
      color: #5d7089;
      font-size: 0.68rem;
      font-weight: 800;
    }
    input,
    select {
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
    input:focus,
    select:focus {
      border-color: #8bb3f5;
      box-shadow: 0 0 0 3px rgb(37 99 235 / 10%);
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
    .invites article {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      border: 1px solid #e8edf3;
      border-radius: 0.75rem;
      padding: 0.85rem;
      background: #fafbfd;
    }
    .empty-state {
      display: grid;
      justify-items: center;
      padding: 3rem 1rem;
      color: #718198;
      text-align: center;
    }
    .empty-state--small {
      padding: 2rem 1rem;
    }
    .empty-state > span {
      width: 3.25rem;
      height: 3.25rem;
      border-radius: 50%;
    }
    .empty-state > span og-icon {
      width: 1.55rem;
      height: 1.55rem;
    }
    .empty-state strong {
      margin-top: 0.8rem;
      color: #263a55;
      font-size: 0.88rem;
    }
    .empty-state p {
      margin: 0.25rem 0 0;
      font-size: 0.74rem;
    }
    @media (width < 76rem) {
      .summary-grid,
      .team-layout {
        grid-template-columns: 1fr;
      }
    }
    @media (width < 42rem) {
      .row {
        grid-template-columns: 1fr;
      }
      .row nav {
        grid-column: auto;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TeamPage {
  private readonly formBuilder = inject(FormBuilder);
  protected readonly auth = inject(AuthStore);
  private readonly teamRepository = inject(TeamRepository);
  private readonly snapshot = signal(this.readStoredSnapshot());

  protected readonly formError = signal<string | null>(null);
  protected readonly formSuccess = signal<string | null>(null);
  protected readonly syncState = signal<'connecting' | 'online' | 'local'>('connecting');
  protected readonly members = computed(() => this.snapshot().members);
  protected readonly invites = computed(() => this.snapshot().invites);
  protected readonly activeMembers = computed(() =>
    this.members().filter((member) => member.status === 'ACTIVE'),
  );
  protected readonly pendingInvites = computed(() =>
    this.invites().filter((invite) => invite.status === 'PENDING'),
  );
  protected readonly codeMembers = computed(() =>
    this.members().filter((member) => member.status === 'ACTIVE' && member.accessCode != null),
  );
  protected readonly adminCount = computed(
    () =>
      this.members().filter(
        (member) =>
          member.status === 'ACTIVE' && (member.role === 'OWNER' || member.role === 'ADMIN'),
      ).length,
  );
  protected readonly syncLabel = computed(() => {
    if (this.syncState() === 'online') return 'Sincronizado no Firebase';
    if (this.syncState() === 'connecting') return 'Conectando ao Firebase';
    return 'Modo local temporário';
  });
  protected readonly form = this.formBuilder.nonNullable.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(120)]],
    identifier: ['', [Validators.required, Validators.maxLength(180)]],
    password: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(128)]],
    role: ['RECEPTIONIST' as Exclude<TeamRole, 'OWNER'>, Validators.required],
  });

  constructor() {
    effect((onCleanup) => {
      const clinicId = this.activeClinicId();
      let disposed = false;
      let unsubscribe: (() => void) | null = null;
      this.syncState.set('connecting');

      void this.teamRepository
        .ensureOwnerMember(clinicId, this.clinicName())
        .then(() =>
          this.teamRepository.subscribe(
            clinicId,
            (snapshot) => {
              if (disposed) return;
              this.syncState.set('online');
              this.snapshot.set(snapshot);
              this.writeStoredSnapshot(snapshot);
            },
            (error) => {
              if (disposed) return;
              console.warn('Using local team storage.', error);
              this.syncState.set('local');
            },
          ),
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
          console.warn('Using local team storage.', error);
          this.syncState.set('local');
        });

      onCleanup(() => {
        disposed = true;
        unsubscribe?.();
      });
    });
  }

  protected async createUser(): Promise<void> {
    const value = this.form.getRawValue();
    const identifierError = this.identifierError(value.identifier);
    if (this.form.invalid || identifierError) {
      this.form.markAllAsTouched();
      this.formError.set(
        identifierError ?? 'Informe nome, e-mail ou código, senha de 6 dígitos e papel.',
      );
      this.formSuccess.set(null);
      return;
    }

    try {
      await this.teamRepository.createMember({
        clinicId: this.activeClinicId(),
        identifier: value.identifier,
        password: value.password,
        name: value.name,
        role: value.role,
      });
      this.form.reset({ name: '', identifier: '', password: '', role: 'RECEPTIONIST' });
      this.formError.set(null);
      this.formSuccess.set('Usuário criado com sucesso. Ele já pode entrar no sistema.');
      this.syncState.set('online');
    } catch (error) {
      console.warn('Could not create user.', error);
      this.syncState.set('local');
      this.formError.set(
        error instanceof Error ? error.message : 'Não foi possível criar o usuário agora.',
      );
      this.formSuccess.set(null);
    }
  }

  protected resetForm(): void {
    this.form.reset({ name: '', identifier: '', password: '', role: 'RECEPTIONIST' });
    this.formError.set(null);
    this.formSuccess.set(null);
  }

  protected async cancelInvite(invite: TeamInvite): Promise<void> {
    try {
      await this.teamRepository.cancelInvite(this.activeClinicId(), invite.id);
    } catch (error) {
      console.warn('Could not cancel invite.', error);
      this.formError.set('Não foi possível cancelar o convite agora.');
    }
  }

  protected async setMemberRole(
    member: TeamMember,
    role: Exclude<TeamRole, 'OWNER'>,
  ): Promise<void> {
    await this.updateMember(member, role, member.status);
  }

  protected async toggleMemberStatus(member: TeamMember): Promise<void> {
    await this.updateMember(
      member,
      member.role,
      member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE',
    );
  }

  protected roleLabel(role: TeamRole): string {
    return {
      OWNER: 'Dono',
      ADMIN: 'Admin',
      RECEPTIONIST: 'Recepção',
      DENTIST: 'Dentista',
    }[role];
  }

  protected memberAccessLabel(member: TeamMember): string {
    if (member.accessCode) return `Código ${member.accessCode}`;
    return member.email || 'E-mail não informado';
  }

  private identifierError(identifier: string): string | null {
    const value = identifier.trim();
    if (/^\d+$/.test(value)) {
      return value.length >= 4 && value.length <= 12
        ? null
        : 'O código de acesso deve ter entre 4 e 12 números.';
    }
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ? null
      : 'Informe um e-mail válido ou um código apenas com números.';
  }

  private async updateMember(
    member: TeamMember,
    role: TeamRole,
    status: TeamMemberStatus,
  ): Promise<void> {
    if (member.role === 'OWNER') return;
    try {
      await this.teamRepository.updateMember({
        clinicId: this.activeClinicId(),
        userId: member.userId,
        role,
        status,
      });
    } catch (error) {
      console.warn('Could not update member.', error);
      this.formError.set('Não foi possível atualizar o membro agora.');
    }
  }

  private clinicName(): string {
    return this.auth.clinics()[0]?.name || 'Clínica ativa';
  }

  private activeClinicId(): string {
    return this.auth.tenantContext()?.activeClinicId ?? 'provisional-clinic';
  }

  private storageKey(): string {
    return `${STORAGE_PREFIX}.${this.activeClinicId()}`;
  }

  private readStoredSnapshot(): {
    readonly members: readonly TeamMember[];
    readonly invites: readonly TeamInvite[];
  } {
    try {
      const value = globalThis.localStorage?.getItem(this.storageKey());
      if (!value) return { members: [], invites: [] };
      const parsed = JSON.parse(value) as { members?: TeamMember[]; invites?: TeamInvite[] };
      return {
        members: Array.isArray(parsed.members) ? parsed.members : [],
        invites: Array.isArray(parsed.invites) ? parsed.invites : [],
      };
    } catch {
      return { members: [], invites: [] };
    }
  }

  private writeStoredSnapshot(snapshot: {
    readonly members: readonly TeamMember[];
    readonly invites: readonly TeamInvite[];
  }) {
    try {
      globalThis.localStorage?.setItem(this.storageKey(), JSON.stringify(snapshot));
    } catch {
      // Team cache is only a fallback for display.
    }
  }
}
