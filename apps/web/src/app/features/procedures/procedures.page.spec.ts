import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { vi } from 'vitest';
import { ProceduresApiService } from './procedures-api.service';
import { ProceduresPage } from './procedures.page';

describe('ProceduresPage', () => {
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
      imports: [ProceduresPage],
      providers: [{ provide: ProceduresApiService, useValue: api }],
    }).compileComponents();
  });

  it('carrega o estado vazio', async () => {
    const fixture = TestBed.createComponent(ProceduresPage);
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
    expect(api.list).toHaveBeenCalledOnce();
    expect(fixture.nativeElement.textContent).toContain('Nenhum procedimento encontrado');
  });

  it('converte reais em centavos ao cadastrar', async () => {
    const fixture = TestBed.createComponent(ProceduresPage);
    fixture.detectChanges();
    await fixture.whenStable();
    const component = fixture.componentInstance as unknown as {
      startCreate(): void;
      form: { patchValue(value: object): void };
      save(): Promise<void>;
    };
    component.startCreate();
    component.form.patchValue({ name: 'Limpeza', category: 'Prevenção', priceReais: 199.9 });
    await component.save();
    expect(api.create).toHaveBeenCalledWith(
      expect.objectContaining({ name: 'Limpeza', defaultPriceCents: 19990 }),
    );
  });
});
