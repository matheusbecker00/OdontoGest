import { TestBed } from '@angular/core/testing';
import { provideRouter, Router, type RouterStateSnapshot } from '@angular/router';
import { vi } from 'vitest';
import { AuthStore } from './auth.store';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  const auth = { restoreSession: vi.fn() };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthStore, useValue: auth }],
    });
  });

  it('autoriza uma sessão restaurável', async () => {
    auth.restoreSession.mockResolvedValue(true);
    const state = { url: '/app/dashboard' } as RouterStateSnapshot;
    const result = await TestBed.runInInjectionContext(() => authGuard({} as never, state));
    expect(result).toBe(true);
  });

  it('redireciona para login sem sessão', async () => {
    auth.restoreSession.mockResolvedValue(false);
    const state = { url: '/app/dashboard' } as RouterStateSnapshot;
    const result = await TestBed.runInInjectionContext(() => authGuard({} as never, state));
    expect(result?.toString()).toContain('/login');
    expect(TestBed.inject(Router)).toBeTruthy();
  });
});
