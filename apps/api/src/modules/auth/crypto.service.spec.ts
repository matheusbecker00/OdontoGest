import { CryptoService } from './crypto.service';

describe('CryptoService', () => {
  const service = new CryptoService();

  it('usa Argon2id e valida somente a senha correta', async () => {
    const password = 'senha-ficticia-com-mais-de-doze';
    const passwordHash = await service.hashPassword(password);

    expect(passwordHash).toMatch(/^\$argon2id\$/);
    await expect(service.verifyPassword(passwordHash, password)).resolves.toBe(
      true,
    );
    await expect(
      service.verifyPassword(passwordHash, 'senha-incorreta'),
    ).resolves.toBe(false);
  });

  it('gera token aleatório e persiste somente seu digest', () => {
    const token = service.randomToken();
    const digest = service.tokenHash(token);

    expect(token).toHaveLength(43);
    expect(digest).toMatch(/^[a-f0-9]{64}$/);
    expect(digest).not.toContain(token);
  });
});
