import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthApiService } from './auth-api.service';
import { AuthStore } from './auth.store';

describe('AuthStore', () => {
  const api = {
    login: vi.fn(),
    refresh: vi.fn(),
    logout: vi.fn(),
    selectClinic: vi.fn(),
    context: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [AuthStore, { provide: AuthApiService, useValue: api }],
    });
  });

  it('mantém o access token somente no estado em memória', async () => {
    const storageSpy = vi.spyOn(Storage.prototype, 'setItem');
    api.login.mockReturnValue(
      of({
        accessToken: 'access-token-memory-only',
        user: { id: 'user-1', name: 'Marina', email: 'marina@example.test' },
        clinics: [],
        activeClinicId: null,
      }),
    );
    const store = TestBed.inject(AuthStore);

    await store.login('marina@example.test', 'uma-senha-de-teste');

    expect(store.accessToken()).toBe('access-token-memory-only');
    expect(storageSpy).not.toHaveBeenCalled();
  });

  it('coordena renovações simultâneas em uma única chamada', async () => {
    api.refresh.mockReturnValue(of({ accessToken: 'rotated-access-token', activeClinicId: null }));
    const store = TestBed.inject(AuthStore);

    const [first, second] = await Promise.all([
      store.refreshAccessToken(),
      store.refreshAccessToken(),
    ]);

    expect(first).toBe('rotated-access-token');
    expect(second).toBe('rotated-access-token');
    expect(api.refresh).toHaveBeenCalledTimes(1);
  });
});
