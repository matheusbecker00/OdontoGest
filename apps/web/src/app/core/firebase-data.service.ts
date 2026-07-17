import { Injectable } from '@angular/core';
import {
  connectorConfig,
  createOwnerClinic,
  getMyContext,
  type GetMyContextData,
} from '@odontogest/dataconnect-client';
import { getDataConnect, type DataConnect } from 'firebase/data-connect';
import { getOdontoGestFirebaseApp } from './firebase-app';

const OWNER_ROLE_ID = '00000000-0000-4000-8000-000000000001';

@Injectable({ providedIn: 'root' })
export class FirebaseDataService {
  readonly connection: DataConnect = getDataConnect(getOdontoGestFirebaseApp(), connectorConfig);

  async createOwnerClinic(input: {
    responsibleName: string;
    clinicName: string;
    email: string;
  }): Promise<void> {
    const email = input.email.trim();
    const [termsEvidenceDigest, privacyEvidenceDigest] = await Promise.all([
      this.digest(`TERMS_OF_USE:1.0.0:${email}`),
      this.digest(`PRIVACY_POLICY:1.0.0:${email}`),
    ]);

    await createOwnerClinic(this.connection, {
      clinicId: crypto.randomUUID(),
      settingsId: crypto.randomUUID(),
      membershipId: crypto.randomUUID(),
      ownerRoleId: OWNER_ROLE_ID,
      termsId: crypto.randomUUID(),
      privacyId: crypto.randomUUID(),
      auditId: crypto.randomUUID(),
      responsibleName: input.responsibleName.trim(),
      clinicName: input.clinicName.trim(),
      email,
      emailCanonical: email.toLocaleLowerCase('pt-BR'),
      termsEvidenceDigest,
      privacyEvidenceDigest,
      requestId: crypto.randomUUID(),
    });
  }

  async getMyContext(): Promise<GetMyContextData> {
    return (await getMyContext(this.connection)).data;
  }

  private async digest(value: string): Promise<string> {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join(
      '',
    );
  }
}
