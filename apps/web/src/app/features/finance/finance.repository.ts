import { inject, Injectable } from '@angular/core';
import {
  collection,
  doc,
  getFirestore,
  getDocs,
  onSnapshot,
  setDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service';
import { getOdontoGestFirebaseApp } from '../../core/firebase-app';

export type FinancialEntryType = 'INCOME' | 'EXPENSE';
export type FinancialEntryStatus = 'OPEN' | 'PAID' | 'CANCELED';

export interface FinancialEntry {
  readonly id: string;
  readonly clinicId: string;
  readonly userId: string;
  readonly type: FinancialEntryType;
  readonly status: FinancialEntryStatus;
  readonly description: string;
  readonly category: string;
  readonly amountCents: number;
  readonly dueDate: string;
  readonly paidAt: string | null;
  readonly notes: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class FinanceRepository {
  private readonly firebaseAuth = inject(FirebaseAuthService);
  private readonly firestore: Firestore = getFirestore(getOdontoGestFirebaseApp());

  async subscribe(
    clinicId: string,
    onNext: (entries: readonly FinancialEntry[]) => void,
    onError: (error: unknown) => void,
  ): Promise<Unsubscribe> {
    await this.migrateLegacyEntries(clinicId).catch((error: unknown) => {
      console.warn('Could not migrate legacy finance entries.', error);
    });
    const entriesRef = collection(this.firestore, 'clinics', clinicId, 'finance');

    return onSnapshot(
      entriesRef,
      (snapshot) => {
        const entries = snapshot.docs
          .map((document) => this.fromFirestore(document.id, document.data()))
          .sort((first, second) => second.dueDate.localeCompare(first.dueDate));
        onNext(entries);
      },
      onError,
    );
  }

  async upsert(entry: FinancialEntry): Promise<void> {
    const userId = await this.currentUserId();
    await setDoc(this.entryRef(entry.clinicId, entry.id), { ...entry, userId });
  }

  async currentUserId(): Promise<string> {
    const profile = await this.firebaseAuth.getCurrentUserProfile();
    if (!profile?.id)
      throw new Error('Usuário autenticado não encontrado para sincronizar financeiro.');
    return profile.id;
  }

  private entryRef(clinicId: string, entryId: string) {
    return doc(this.firestore, 'clinics', clinicId, 'finance', entryId);
  }

  private async migrateLegacyEntries(clinicId: string): Promise<void> {
    const userId = await this.currentUserId();
    const legacyRef = collection(this.firestore, 'users', userId, 'clinics', clinicId, 'finance');
    const snapshot = await getDocs(legacyRef);
    await Promise.all(
      snapshot.docs.map((document) =>
        setDoc(this.entryRef(clinicId, document.id), {
          ...document.data(),
          id: document.id,
          clinicId,
        }),
      ),
    );
  }

  private fromFirestore(id: string, data: Record<string, unknown>): FinancialEntry {
    return {
      id,
      clinicId: this.stringField(data, 'clinicId'),
      userId: this.stringField(data, 'userId'),
      type: data['type'] === 'EXPENSE' ? 'EXPENSE' : 'INCOME',
      status: this.statusField(data),
      description: this.stringField(data, 'description'),
      category: this.stringField(data, 'category'),
      amountCents: this.numberField(data, 'amountCents'),
      dueDate: this.stringField(data, 'dueDate'),
      paidAt: typeof data['paidAt'] === 'string' ? data['paidAt'] : null,
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

  private statusField(data: Record<string, unknown>): FinancialEntryStatus {
    const value = data['status'];
    return value === 'OPEN' || value === 'PAID' || value === 'CANCELED' ? value : 'OPEN';
  }
}
