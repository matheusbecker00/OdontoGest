import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AuthStore } from '../../core/auth/auth.store';
import { SubscriptionAccessService } from '../billing/subscription-access.service';
import { AppShellComponent } from './app-shell.component';

describe('AppShellComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppShellComponent],
      providers: [
        provideRouter([]),
        {
          provide: AuthStore,
          useValue: {
            user: signal({ id: 'user-1', name: 'Matheus Becker', email: 'matheus@example.com' }),
            clinics: signal([{ id: 'clinic-1', name: 'Clínica Teste', role: 'OWNER' }]),
            tenantContext: signal({ activeClinicId: 'clinic-1' }),
            hasEveryPermission: vi.fn(
              (permissions: readonly string[]) => !permissions.includes('billing.manage'),
            ),
            logout: vi.fn(),
          },
        },
        {
          provide: SubscriptionAccessService,
          useValue: {
            showNotice: signal(false),
            noticeLevel: signal('hidden'),
            isReadOnly: signal(false),
            noticeTitle: signal(''),
            noticeDescription: signal(''),
            noticeActionLabel: signal('Ver assinatura'),
            openBillingAction: vi.fn(),
            canWrite: vi.fn(() => true),
          },
        },
      ],
    }).compileComponents();
  });

  it('renderiza o painel mesmo quando matchMedia não está disponível', () => {
    const original = globalThis.matchMedia;
    Object.defineProperty(globalThis, 'matchMedia', { configurable: true, value: undefined });

    try {
      const fixture = TestBed.createComponent(AppShellComponent);
      fixture.detectChanges();
      expect(fixture.nativeElement.textContent).toContain('Dashboard');
      expect(fixture.nativeElement.textContent).toContain('Pacientes');
    } finally {
      Object.defineProperty(globalThis, 'matchMedia', { configurable: true, value: original });
    }
  });
});
