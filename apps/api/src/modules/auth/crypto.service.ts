import { Injectable } from '@nestjs/common';
import { argon2id, hash, verify } from 'argon2';
import { createHash, randomBytes } from 'node:crypto';

@Injectable()
export class CryptoService {
  private readonly dummyHash = hash('odontogest-dummy-password-not-a-secret', {
    type: argon2id,
    memoryCost: 65_536,
    timeCost: 3,
    parallelism: 1,
  });

  normalizeEmail(email: string): string {
    return email.trim().normalize('NFKC').toLocaleLowerCase('pt-BR');
  }

  async hashPassword(password: string): Promise<string> {
    return hash(password, {
      type: argon2id,
      memoryCost: 65_536,
      timeCost: 3,
      parallelism: 1,
    });
  }

  async verifyPassword(
    passwordHash: string,
    candidate: string,
  ): Promise<boolean> {
    try {
      return await verify(passwordHash, candidate);
    } catch {
      return false;
    }
  }

  async verifyDummyPassword(candidate: string): Promise<void> {
    await verify(await this.dummyHash, candidate).catch(() => false);
  }

  randomToken(): string {
    return randomBytes(32).toString('base64url');
  }

  tokenHash(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }
}
