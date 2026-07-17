import { isValidCpf, normalizeCpf } from './cpf.validator';

describe('CPF validator', () => {
  it.each(['529.982.247-25', '11144477735'])(
    'aceita um CPF matematicamente válido: %s',
    (cpf) => expect(isValidCpf(cpf)).toBe(true),
  );

  it.each(['111.111.111-11', '529.982.247-24', '123'])(
    'rejeita um CPF inválido: %s',
    (cpf) => expect(isValidCpf(cpf)).toBe(false),
  );

  it('normaliza somente os dígitos', () => {
    expect(normalizeCpf('529.982.247-25')).toBe('52998224725');
  });
});
