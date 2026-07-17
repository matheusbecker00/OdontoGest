import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { AuthStore } from '../../core/auth/auth.store';
import { PatientsApiService } from './patients-api.service';
import { PatientsPage } from './patients.page';

describe('PatientsPage', () => {
  const emptyResponse = {
    items: [],
    pagination: { page: 1, pageSize: 20, total: 0, totalPages: 0 },
  };
  const api = {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    inactivate: vi.fn(),
  };
  const auth = { hasEveryPermission: vi.fn(() => true) };

  beforeEach(async () => {
    vi.clearAllMocks();
    api.list.mockReturnValue(of(emptyResponse));
    api.create.mockReturnValue(
      of({
        id: '00000000-0000-4000-8000-000000000001',
        fullName: 'Ana Paula Martins',
        cpfMasked: '***.***.***-25',
      }),
    );
    await TestBed.configureTestingModule({
      imports: [PatientsPage],
      providers: [
        provideRouter([]),
        { provide: AuthStore, useValue: auth },
        { provide: PatientsApiService, useValue: api },
      ],
    }).compileComponents();
  });

  function setInput(input: HTMLInputElement, value: string): void {
    input.value = value;
    input.dispatchEvent(new Event('input'));
  }

  it('carrega o estado vazio de pacientes', async () => {
    const fixture = TestBed.createComponent(PatientsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(api.list).toHaveBeenCalledWith({
      page: 1,
      pageSize: 20,
      search: undefined,
      status: undefined,
    });
    expect(fixture.nativeElement.textContent).toContain('Nenhum paciente encontrado');
  });

  it('cadastra um paciente com os campos obrigatórios', async () => {
    const fixture = TestBed.createComponent(PatientsPage);
    fixture.detectChanges();
    await fixture.whenStable();

    const newButton = Array.from(
      fixture.nativeElement.querySelectorAll('button') as NodeListOf<HTMLButtonElement>,
    ).find((button) => button.textContent?.includes('Novo paciente'))!;
    newButton.click();
    fixture.detectChanges();

    const form = fixture.nativeElement.querySelector('#patient-form') as HTMLFormElement;
    const inputs = form.querySelectorAll('input') as NodeListOf<HTMLInputElement>;
    setInput(inputs[0], 'Ana Paula Martins');
    setInput(inputs[1], '529.982.247-25');
    form.dispatchEvent(new Event('submit'));
    await fixture.whenStable();

    expect(api.create).toHaveBeenCalledWith(
      expect.objectContaining({ fullName: 'Ana Paula Martins', cpf: '529.982.247-25' }),
    );
  });
});
