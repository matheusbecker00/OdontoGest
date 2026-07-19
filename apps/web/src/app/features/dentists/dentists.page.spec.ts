import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { DentistsApiService } from './dentists-api.service';
import { DentistsPage } from './dentists.page';

describe('DentistsPage', () => {
  const api = {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    inactivate: vi.fn(),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    api.list.mockReturnValue(of([]));
    api.create.mockReturnValue(of({}));
    await TestBed.configureTestingModule({
      imports: [DentistsPage],
      providers: [{ provide: DentistsApiService, useValue: api }],
    }).compileComponents();
  });

  it('carrega o estado vazio', async () => {
    const fixture = TestBed.createComponent(DentistsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(api.list).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).toContain('Nenhum profissional encontrado');
  });

  it('cadastra um profissional válido', async () => {
    const fixture = TestBed.createComponent(DentistsPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as unknown as {
      startCreate(): void;
      form: { patchValue(value: object): void };
      save(): Promise<void>;
    };
    component.startCreate();
    component.form.patchValue({ name: 'Dra. Ana Silva', cro: '12345', specialty: 'Ortodontia' });
    await component.save();
    expect(api.create).toHaveBeenCalledWith(expect.objectContaining({ cro: '12345' }));
  });
});
