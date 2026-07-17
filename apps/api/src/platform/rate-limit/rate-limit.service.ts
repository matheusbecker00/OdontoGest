import {
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  type OnModuleDestroy,
} from '@nestjs/common';
import { createHash } from 'node:crypto';
import { RATE_LIMIT_STORE } from './rate-limit.tokens';
import { RateLimitStore } from './rate-limit.store';

@Injectable()
export class RateLimitService implements OnModuleDestroy {
  constructor(
    @Inject(RATE_LIMIT_STORE) private readonly store: RateLimitStore,
  ) {}

  private key(scope: string, subject: string): string {
    const digest = createHash('sha256').update(subject).digest('hex');
    return `odontogest:rate:${scope}:${digest}`;
  }

  async consume(
    scope: string,
    subject: string,
    limit: number,
    windowSeconds: number,
  ): Promise<void> {
    const result = await this.store.increment(
      this.key(scope, subject),
      windowSeconds,
    );
    if (result.count > limit) {
      throw new HttpException(
        {
          error: 'RATE_LIMITED',
          message: 'Muitas tentativas. Aguarde antes de tentar novamente.',
          retryAfterSeconds: result.ttlSeconds,
        },
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }
  }

  async clear(scope: string, subject: string): Promise<void> {
    await this.store.clear(this.key(scope, subject));
  }

  async isReady(): Promise<boolean> {
    return this.store.isReady();
  }

  async onModuleDestroy(): Promise<void> {
    await this.store.close();
  }
}
