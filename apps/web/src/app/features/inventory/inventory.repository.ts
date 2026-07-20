import { inject, Injectable } from '@angular/core';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  setDoc,
  type Firestore,
  type Unsubscribe,
} from 'firebase/firestore';
import { FirebaseAuthService } from '../../core/auth/firebase-auth.service';
import { getOdontoGestFirebaseApp } from '../../core/firebase-app';

export type InventoryStatus = 'ACTIVE' | 'ARCHIVED';

export interface InventoryItem {
  readonly id: string;
  readonly clinicId: string;
  readonly userId: string;
  readonly name: string;
  readonly category: string;
  readonly unit: string;
  readonly quantity: number;
  readonly minimumQuantity: number;
  readonly unitCostCents: number;
  readonly supplier: string | null;
  readonly status: InventoryStatus;
  readonly notes: string | null;
  readonly createdAt: string;
  readonly updatedAt: string;
}

@Injectable({ providedIn: 'root' })
export class InventoryRepository {
  private readonly firebaseAuth = inject(FirebaseAuthService);
  private readonly firestore: Firestore = getFirestore(getOdontoGestFirebaseApp());

  async subscribe(
    clinicId: string,
    onNext: (items: readonly InventoryItem[]) => void,
    onError: (error: unknown) => void,
  ): Promise<Unsubscribe> {
    const userId = await this.currentUserId();
    await this.migrateLegacyItems(userId, clinicId).catch((error: unknown) => {
      console.warn('Could not migrate legacy inventory items.', error);
    });

    const itemsRef = collection(this.firestore, 'clinics', clinicId, 'inventory');

    return onSnapshot(
      itemsRef,
      (snapshot) => {
        const items = snapshot.docs
          .map((document) => this.fromFirestore(document.id, document.data()))
          .sort((first, second) => first.name.localeCompare(second.name, 'pt-BR'));
        onNext(items);
      },
      onError,
    );
  }

  async upsert(item: InventoryItem): Promise<void> {
    const userId = await this.currentUserId();
    await setDoc(this.itemRef(item.clinicId, item.id), { ...item, userId });
  }

  async currentUserId(): Promise<string> {
    const profile = await this.firebaseAuth.getCurrentUserProfile();
    if (!profile?.id)
      throw new Error('Usuário autenticado não encontrado para sincronizar estoque.');
    return profile.id;
  }

  private itemRef(clinicId: string, itemId: string) {
    return doc(this.firestore, 'clinics', clinicId, 'inventory', itemId);
  }

  private async migrateLegacyItems(userId: string, clinicId: string): Promise<void> {
    const legacyRef = collection(this.firestore, 'users', userId, 'clinics', clinicId, 'inventory');
    const snapshot = await getDocs(legacyRef);
    await Promise.all(
      snapshot.docs.map(async (document) => {
        const sharedRef = this.itemRef(clinicId, document.id);
        const sharedSnapshot = await getDoc(sharedRef);
        if (sharedSnapshot.exists()) return;
        await setDoc(sharedRef, {
          ...document.data(),
          id: document.id,
          clinicId,
        });
      }),
    );
  }

  private fromFirestore(id: string, data: Record<string, unknown>): InventoryItem {
    return {
      id,
      clinicId: this.stringField(data, 'clinicId'),
      userId: this.stringField(data, 'userId'),
      name: this.stringField(data, 'name'),
      category: this.stringField(data, 'category'),
      unit: this.stringField(data, 'unit'),
      quantity: this.numberField(data, 'quantity'),
      minimumQuantity: this.numberField(data, 'minimumQuantity'),
      unitCostCents: this.numberField(data, 'unitCostCents'),
      supplier: typeof data['supplier'] === 'string' ? data['supplier'] : null,
      status: data['status'] === 'ARCHIVED' ? 'ARCHIVED' : 'ACTIVE',
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
