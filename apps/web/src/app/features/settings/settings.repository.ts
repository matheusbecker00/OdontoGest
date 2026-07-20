import { inject, Injectable } from '@angular/core';
import {
  doc,
  getFirestore,
  onSnapshot,
  setDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service';
import { getOdontoGestFirebaseApp } from '../../core/firebase-app';

export interface ClinicSettings {
  readonly clinicId: string;
  readonly userId: string;
  readonly clinicName: string;
  readonly responsibleName: string;
  readonly phone: string;
  readonly email: string;
  readonly address: string;
  readonly timezone: string;
  readonly openingTime: string;
  readonly closingTime: string;
  readonly appointmentIntervalMinutes: number;
  readonly defaultAppointmentDurationMinutes: number;
  readonly notifyLowStock: boolean;
  readonly notifyOpenPayments: boolean;
  readonly notes: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class SettingsRepository {
  private readonly firebaseAuth = inject(FirebaseAuthService);
  private readonly firestore: Firestore = getFirestore(getOdontoGestFirebaseApp());

  async subscribe(
    clinicId: string,
    onNext: (settings: ClinicSettings | null) => void,
    onError: (error: unknown) => void,
  ): Promise<Unsubscribe> {
    const userId = await this.currentUserId();
    return onSnapshot(
      this.settingsRef(userId, clinicId),
      (snapshot) => onNext(snapshot.exists() ? this.fromFirestore(snapshot.data()) : null),
      onError,
    );
  }

  async upsert(settings: ClinicSettings): Promise<void> {
    const userId = await this.currentUserId();
    await setDoc(this.settingsRef(userId, settings.clinicId), { ...settings, userId });
  }

  async getCurrent(): Promise<{
    readonly userId: string;
    readonly name: string | null;
    readonly email: string | null;
  }> {
    const profile = await this.firebaseAuth.getCurrentUserProfile();
    if (!profile?.id)
      throw new Error('Usuário autenticado não encontrado para sincronizar configurações.');
    return { userId: profile.id, name: profile.name, email: profile.email };
  }

  async currentUserId(): Promise<string> {
    return (await this.getCurrent()).userId;
  }

  private settingsRef(userId: string, clinicId: string) {
    return doc(this.firestore, 'users', userId, 'clinics', clinicId, 'settings', 'profile');
  }

  private fromFirestore(data: Record<string, unknown>): ClinicSettings {
    return {
      clinicId: this.stringField(data, 'clinicId'),
      userId: this.stringField(data, 'userId'),
      clinicName: this.stringField(data, 'clinicName'),
      responsibleName: this.stringField(data, 'responsibleName'),
      phone: this.stringField(data, 'phone'),
      email: this.stringField(data, 'email'),
      address: this.stringField(data, 'address'),
      timezone: this.stringField(data, 'timezone'),
      openingTime: this.stringField(data, 'openingTime'),
      closingTime: this.stringField(data, 'closingTime'),
      appointmentIntervalMinutes: this.numberField(data, 'appointmentIntervalMinutes'),
      defaultAppointmentDurationMinutes: this.numberField(
        data,
        'defaultAppointmentDurationMinutes',
      ),
      notifyLowStock: data['notifyLowStock'] === true,
      notifyOpenPayments: data['notifyOpenPayments'] === true,
      notes: typeof data['notes'] === 'string' ? data['notes'] : null,
      createdAt: this.stringField(data, 'createdAt'),
      updatedAt: this.stringField(data, 'updatedAt'),
    };
  }

  private stringField(data: Record<string, unknown>, key: string): string {
    const value = data[key];
    return typeof value === 'string' ? value : '';
  }

  private numberField(data: Record<string, unknown>, key: string): number {
    const value = data[key];
    return typeof value === 'number' && Number.isFinite(value) ? value : 0;
  }
}
