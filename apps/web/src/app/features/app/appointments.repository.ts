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

export type AppointmentStatus = 'SCHEDULED' | 'CONFIRMED' | 'COMPLETED' | 'CANCELED';

export interface Appointment {
  readonly id: string;
  readonly clinicId: string;
  readonly userId: string;
  readonly date: string;
  readonly startTime: string;
  readonly durationMinutes: number;
  readonly patientName: string;
  readonly dentistName: string;
  readonly procedureName: string;
  readonly status: AppointmentStatus;
  readonly notes: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class AppointmentsRepository {
  private readonly firebaseAuth = inject(FirebaseAuthService);
  private readonly firestore: Firestore = getFirestore(getOdontoGestFirebaseApp());

  async subscribe(
    clinicId: string,
    onNext: (appointments: readonly Appointment[]) => void,
    onError: (error: unknown) => void,
  ): Promise<Unsubscribe> {
    const userId = await this.currentUserId();
    const appointmentsRef = collection(
      this.firestore,
      'users',
      userId,
      'clinics',
      clinicId,
      'appointments',
    );

    return onSnapshot(
      appointmentsRef,
      (snapshot) => {
        const appointments = snapshot.docs
          .map((document) => this.fromFirestore(document.id, document.data()))
          .sort(
            (first, second) =>
              first.date.localeCompare(second.date) ||
              first.startTime.localeCompare(second.startTime),
          );
        onNext(appointments);
      },
      onError,
    );
  }

  async upsert(appointment: Appointment): Promise<void> {
    const userId = await this.currentUserId();
    await setDoc(this.appointmentRef(userId, appointment.clinicId, appointment.id), {
      ...appointment,
      userId,
    });
  }

  async updateStatus(input: {
    id: string;
    clinicId: string;
    status: AppointmentStatus;
    updatedAt: string;
  }): Promise<void> {
    const userId = await this.currentUserId();
    await updateDoc(this.appointmentRef(userId, input.clinicId, input.id), {
      status: input.status,
      updatedAt: input.updatedAt,
    });
  }

  async currentUserId(): Promise<string> {
    const profile = await this.firebaseAuth.getCurrentUserProfile();
    if (!profile?.id)
      throw new Error('Usuário autenticado não encontrado para sincronizar agenda.');
    return profile.id;
  }

  private appointmentRef(userId: string, clinicId: string, appointmentId: string) {
    return doc(this.firestore, 'users', userId, 'clinics', clinicId, 'appointments', appointmentId);
  }

  private fromFirestore(id: string, data: Record<string, unknown>): Appointment {
    return {
      id,
      clinicId: this.stringField(data, 'clinicId'),
      userId: this.stringField(data, 'userId'),
      date: this.stringField(data, 'date'),
      startTime: this.stringField(data, 'startTime'),
      durationMinutes: this.numberField(data, 'durationMinutes'),
      patientName: this.stringField(data, 'patientName'),
      dentistName: this.stringField(data, 'dentistName'),
      procedureName: this.stringField(data, 'procedureName'),
      status: this.statusField(data),
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

  private statusField(data: Record<string, unknown>): AppointmentStatus {
    const value = data['status'];
    return value === 'SCHEDULED' ||
      value === 'CONFIRMED' ||
      value === 'COMPLETED' ||
      value === 'CANCELED'
      ? value
      : 'SCHEDULED';
  }
}
