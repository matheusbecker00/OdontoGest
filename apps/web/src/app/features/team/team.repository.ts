import { inject, Injectable } from '@angular/core';
import {
  collection,
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  updateDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service';
import { getOdontoGestFirebaseApp } from '../../core/firebase-app';

export type TeamRole = 'OWNER' | 'ADMIN' | 'RECEPTIONIST' | 'DENTIST';
export type TeamMemberStatus = 'ACTIVE' | 'INACTIVE';
export type TeamInviteStatus = 'PENDING' | 'CANCELED';

export interface TeamMember {
  readonly userId: string;
  readonly clinicId: string;
  readonly name: string;
  readonly email: string;
  readonly role: TeamRole;
  readonly status: TeamMemberStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface TeamInvite {
  readonly id: string;
  readonly clinicId: string;
  readonly email: string;
  readonly role: TeamRole;
  readonly status: TeamInviteStatus;
  readonly invitedByUserId: string;
  readonly invitedAt: string;
  readonly updatedAt: string;
}

export interface TeamSnapshot {
  readonly members: readonly TeamMember[];
  readonly invites: readonly TeamInvite[];
}

@Injectable({ providedIn: 'root' })
export class TeamRepository {
  private readonly firebaseAuth = inject(FirebaseAuthService);
  private readonly firestore: Firestore = getFirestore(getOdontoGestFirebaseApp());

  async ensureOwnerMember(clinicId: string, clinicName: string): Promise<void> {
    const profile = await this.currentProfile();
    const now = new Date().toISOString();
    const member: TeamMember = {
      userId: profile.userId,
      clinicId,
      name: profile.name || profile.email?.split('@')[0] || clinicName,
      email: profile.email || '',
      role: 'OWNER',
      status: 'ACTIVE',
      createdAt: now,
      updatedAt: now,
    };
    await setDoc(this.memberRef(clinicId, profile.userId), member, { merge: true });
  }

  async subscribe(
    clinicId: string,
    onNext: (snapshot: TeamSnapshot) => void,
    onError: (error: unknown) => void,
  ): Promise<Unsubscribe> {
    let members: readonly TeamMember[] = [];
    let invites: readonly TeamInvite[] = [];
    const publish = () => onNext({ members, invites });

    const unsubscribeMembers = onSnapshot(
      collection(this.firestore, 'clinics', clinicId, 'members'),
      (snapshot) => {
        members = snapshot.docs
          .map((document) => this.memberFromFirestore(document.data()))
          .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
        publish();
      },
      onError,
    );

    const unsubscribeInvites = onSnapshot(
      collection(this.firestore, 'clinics', clinicId, 'invites'),
      (snapshot) => {
        invites = snapshot.docs
          .map((document) => this.inviteFromFirestore(document.id, document.data()))
          .sort((first, second) => second.invitedAt.localeCompare(first.invitedAt));
        publish();
      },
      onError,
    );

    return () => {
      unsubscribeMembers();
      unsubscribeInvites();
    };
  }

  async createInvite(input: {
    readonly clinicId: string;
    readonly email: string;
    readonly role: TeamRole;
  }) {
    const profile = await this.currentProfile();
    const now = new Date().toISOString();
    const invite: TeamInvite = {
      id: crypto.randomUUID(),
      clinicId: input.clinicId,
      email: input.email.trim().toLocaleLowerCase('pt-BR'),
      role: input.role,
      status: 'PENDING',
      invitedByUserId: profile.userId,
      invitedAt: now,
      updatedAt: now,
    };
    await setDoc(this.inviteRef(input.clinicId, invite.id), invite);
  }

  async cancelInvite(clinicId: string, inviteId: string): Promise<void> {
    await updateDoc(this.inviteRef(clinicId, inviteId), {
      status: 'CANCELED',
      updatedAt: new Date().toISOString(),
    });
  }

  async updateMember(input: {
    readonly clinicId: string;
    readonly userId: string;
    readonly role: TeamRole;
    readonly status: TeamMemberStatus;
  }): Promise<void> {
    await updateDoc(this.memberRef(input.clinicId, input.userId), {
      role: input.role,
      status: input.status,
      updatedAt: new Date().toISOString(),
    });
  }

  async currentProfile(): Promise<{
    readonly userId: string;
    readonly name: string | null;
    readonly email: string | null;
  }> {
    const profile = await this.firebaseAuth.getCurrentUserProfile();
    if (!profile?.id) throw new Error('Usuário autenticado não encontrado para gerenciar equipe.');
    return { userId: profile.id, name: profile.name, email: profile.email };
  }

  private memberRef(clinicId: string, userId: string) {
    return doc(this.firestore, 'clinics', clinicId, 'members', userId);
  }

  private inviteRef(clinicId: string, inviteId: string) {
    return doc(this.firestore, 'clinics', clinicId, 'invites', inviteId);
  }

  private memberFromFirestore(data: Record<string, unknown>): TeamMember {
    return {
      userId: this.stringField(data, 'userId'),
      clinicId: this.stringField(data, 'clinicId'),
      name: this.stringField(data, 'name'),
      email: this.stringField(data, 'email'),
      role: this.roleField(data),
      status: data['status'] === 'INACTIVE' ? 'INACTIVE' : 'ACTIVE',
      createdAt: this.stringField(data, 'createdAt'),
      updatedAt: this.stringField(data, 'updatedAt'),
    };
  }

  private inviteFromFirestore(id: string, data: Record<string, unknown>): TeamInvite {
    return {
      id,
      clinicId: this.stringField(data, 'clinicId'),
      email: this.stringField(data, 'email'),
      role: this.roleField(data),
      status: data['status'] === 'CANCELED' ? 'CANCELED' : 'PENDING',
      invitedByUserId: this.stringField(data, 'invitedByUserId'),
      invitedAt: this.stringField(data, 'invitedAt'),
      updatedAt: this.stringField(data, 'updatedAt'),
    };
  }

  private roleField(data: Record<string, unknown>): TeamRole {
    const value = data['role'];
    return value === 'OWNER' || value === 'ADMIN' || value === 'RECEPTIONIST' || value === 'DENTIST'
      ? value
      : 'RECEPTIONIST';
  }

  private stringField(data: Record<string, unknown>, key: string): string {
    const value = data[key];
    return typeof value === 'string' ? value : '';
  }
}
