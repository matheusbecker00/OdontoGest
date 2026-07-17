import Redis from 'ioredis';
import { RateLimitStore, type RateLimitResult } from './rate-limit.store';

export class RedisRateLimitStore extends RateLimitStore {
  private readonly redis: Redis;

  constructor(url: string) {
    super();
    this.redis = new Redis(url, {
      lazyConnect: true,
      enableOfflineQueue: false,
      maxRetriesPerRequest: 1,
      connectTimeout: 3_000,
      commandTimeout: 2_000,
    });
    this.redis.on('error', () => undefined);
  }

  private async connectIfNeeded(): Promise<void> {
    if (this.redis.status === 'wait') await this.redis.connect();
  }

  async increment(
    key: string,
    windowSeconds: number,
  ): Promise<RateLimitResult> {
    await this.connectIfNeeded();
    const results = await this.redis
      .multi()
      .incr(key)
      .expire(key, windowSeconds, 'NX')
      .ttl(key)
      .exec();
    if (
      !results ||
      results.length !== 3 ||
      results.some(([error]) => error !== null)
    ) {
      throw new Error('Redis rate limit transaction failed.');
    }
    const count = Number(results[0]?.[1]);
    const ttlSeconds = Number(results[2]?.[1]);
    if (!Number.isFinite(count) || !Number.isFinite(ttlSeconds)) {
      throw new Error('Redis rate limit returned an invalid result.');
    }
    return { count, ttlSeconds: Math.max(1, ttlSeconds) };
  }

  async clear(key: string): Promise<void> {
    await this.connectIfNeeded();
    await this.redis.del(key);
  }

  async isReady(): Promise<boolean> {
    try {
      await this.connectIfNeeded();
      return (await this.redis.ping()) === 'PONG';
    } catch {
      return false;
    }
  }

  close(): Promise<void> {
    if (this.redis.status !== 'end') this.redis.disconnect();
    return Promise.resolve();
  }
}
