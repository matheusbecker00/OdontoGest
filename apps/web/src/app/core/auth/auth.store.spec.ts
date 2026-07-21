import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';
import { BillingRepository } from '../../features/billing/billing.repository';
import { FirebaseDataService } from '../firebase-data.service';
import { AuthStore } from './auth.store';
import { FirebaseAuthService } from './firebase-auth.service';

describe('AuthStore', () => {
  const data = { createOwnerClinic: vi.fn(), getMyContext: vi.fn() };
  const billing = { ensureTrial: vi.fn() };
  const firebase = {
    signIn: vi.fn(),
    createAccount: vi.fn(),
    sendVerificationAndSignOut: vi.fn(),
    signOut: vi.fn(),
    waitUntilReady: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    firebase.signIn.mockResolvedValue(undefined);
    firebase.createAccount.mockResolvedValue(undefined);
    firebase.sendVerificationAndSignOut.mockResolvedValue(undefined);
    firebase.signOut.mockResolvedValue(undefined);
    firebase.waitUntilReady.mockResolvedValue(true);
    data.createOwnerClinic.mockResolvedValue('22222222-2222-4222-8222-222222222222');
    billing.ensureTrial.mockResolvedValue(undefined);
    data.getMyContext.mockResolvedValue({
      users: [{ id: 'firebase-user-1', name: 'Marina', email: 'marina@example.test' }],
      clinicMemberships: [
        {
          authorizationVersion: 1,
          clinic: {
            id: '22222222-2222-4222-8222-222222222222',
            tradeName: 'Clínica Sorriso',
          },
          role: { code: 'OWNER', name: 'Proprietário' },
        },
      ],
    });
    TestBed.configureTestingModule({
      providers: [
        AuthStore,
        { provide: FirebaseDataService, useValue: data },
        { provide: FirebaseAuthService, useValue: firebase },
        { provide: BillingRepository, useValue: billing },
      ],
    });
  });

  it('carrega a sessão e o tenant pelo Firebase', async () => {
    const store = TestBed.inject(AuthStore);
    await store.login('marina@example.test', 'uma-senha-de-teste');

    expect(firebase.signIn).toHaveBeenCalledWith('marina@example.test', 'uma-senha-de-teste');
    expect(data.getMyContext).toHaveBeenCalledOnce();
    expect(store.isAuthenticated()).toBe(true);
    expect(store.tenantContext()?.activeClinicId).toBe('22222222-2222-4222-8222-222222222222');
    expect(store.hasEveryPermission(['patient.read', 'patient.create'])).toBe(true);
  });

  it('cria o onboarding no SQL Connect sem enviar senha ao banco', async () => {
    const store = TestBed.inject(AuthStore);
    await store.register({
      responsibleName: 'Marina Souza',
      clinicName: 'Clínica Sorriso',
      email: 'Marina@Example.Test',
      password: 'senha-ficticia-segura',
    });

    expect(firebase.createAccount).toHaveBeenCalledWith(
      'marina@example.test',
      'senha-ficticia-segura',
      'Marina Souza',
    );
    expect(data.createOwnerClinic).toHaveBeenCalledWith({
      responsibleName: 'Marina Souza',
      clinicName: 'Clínica Sorriso',
      email: 'marina@example.test',
    });
    expect(data.getMyContext).toHaveBeenCalledOnce();
    expect(billing.ensureTrial).toHaveBeenCalledWith('22222222-2222-4222-8222-222222222222');
    expect(store.isAuthenticated()).toBe(true);
  });
});
