import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { AppEnvironment } from '../../config/environment';
import { MemoryRateLimitStore } from './memory-rate-limit.store';
import { RateLimitService } from './rate-limit.service';
import { RATE_LIMIT_STORE } from './rate-limit.tokens';
import { RedisRateLimitStore } from './redis-rate-limit.store';

@Global()
@Module({
  providers: [
    {
      provide: RATE_LIMIT_STORE,
      inject: [ConfigService],
      useFactory: (config: ConfigService<AppEnvironment, true>) => {
        const url = config.get('REDIS_URL', { infer: true });
        return url.startsWith('memory://')
          ? new MemoryRateLimitStore()
          : new RedisRateLimitStore(url);
      },
    },
    RateLimitService,
  ],
  exports: [RateLimitService],
})
export class RateLimitModule {}
