import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { vi } from 'vitest';
import { AuthStore } from '../../core/auth/auth.store';
import { SignupPage } from './signup.page';

describe('SignupPage', () => {
  const auth = { register: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    auth.register.mockResolvedValue(undefined);
    await TestBed.configureTestingModule({
      imports: [SignupPage],
      providers: [provideRouter([]), { provide: AuthStore, useValue: auth }],
    }).compileComponents();
  });

  function setInput(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  it('bloqueia o envio quando os termos não foram aceitos', async () => {
    const fixture = TestBed.createComponent(SignupPage);
    fixture.detectChanges();
    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();
    expect(auth.register).not.toHaveBeenCalled();
  });

  it('envia o cadastro válido sem repassar a confirmação de senha', async () => {
    const fixture = TestBed.createComponent(SignupPage);
    fixture.detectChanges();
    const inputs = fixture.nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    setInput(inputs[0], 'Marina Souza');
    setInput(inputs[1], 'Clínica Sorriso');
    setInput(inputs[2], 'marina@example.test');
    setInput(inputs[3], 'senha-ficticia-segura');
    setInput(inputs[4], 'senha-ficticia-segura');
    inputs[5].click();
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('form') as HTMLFormElement;
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(auth.register).toHaveBeenCalledWith({
      responsibleName: 'Marina Souza',
      clinicName: 'Clínica Sorriso',
      email: 'marina@example.test',
      password: 'senha-ficticia-segura',
    });
  });
});
