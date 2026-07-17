import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AuthStore } from '../../core/auth/auth.store';
import { LoginPage } from './login.page';

describe('LoginPage', () => {
  const auth = { login: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    auth.login.mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [provideRouter([]), { provide: AuthStore, useValue: auth }],
    }).compileComponents();
  });

  function setInput(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  it('não envia formulário inválido e preserva os campos', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(auth.login).not.toHaveBeenCalled();
    expect(fixture.nativeElement.querySelectorAll('mat-error').length).toBeGreaterThan(0);
  });

  it('envia e-mail e senha válidos', async () => {
    const fixture = TestBed.createComponent(LoginPage);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    setInput(inputs[0], 'marina@example.test');
    setInput(inputs[1], 'uma-senha-de-teste');
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(auth.login).toHaveBeenCalledWith('marina@example.test', 'uma-senha-de-teste');
  });
});
