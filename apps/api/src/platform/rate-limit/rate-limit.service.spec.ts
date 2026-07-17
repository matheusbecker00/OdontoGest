import { HttpException } from '@nestjs/common';
import { MemoryRateLimitStore } from './memory-rate-limit.store';
import { RateLimitService } from './rate-limit.service';

describe('RateLimitService', () => {
  it('bloqueia tentativas acima do limite sem guardar o identificador em claro', async () => {
    const service = new RateLimitService(new MemoryRateLimitStore());

    await service.consume('login', 'pessoa@example.test', 2, 60);
    await service.consume('login', 'pessoa@example.test', 2, 60);
    await expect(
      service.consume('login', 'pessoa@example.test', 2, 60),
    ).rejects.toBeInstanceOf(HttpException);
  });
});
