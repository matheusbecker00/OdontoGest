import { RateLimitStore, type RateLimitResult } from './rate-limit.store';

interface Entry {
  count: number;
  expiresAt: number;
}

export class MemoryRateLimitStore extends RateLimitStore {
  private readonly entries = new Map<string, Entry>();

  increment(key: string, windowSeconds: number): Promise<RateLimitResult> {
    const now = Date.now();
    const existing = this.entries.get(key);
    const entry =
      !existing || existing.expiresAt <= now
        ? { count: 0, expiresAt: now + windowSeconds * 1_000 }
        : existing;
    entry.count += 1;
    this.entries.set(key, entry);
    return Promise.resolve({
      count: entry.count,
      ttlSeconds: Math.max(1, Math.ceil((entry.expiresAt - now) / 1_000)),
    });
  }

  clear(key: string): Promise<void> {
    this.entries.delete(key);
    return Promise.resolve();
  }

  isReady(): Promise<boolean> {
    return Promise.resolve(true);
  }

  close(): Promise<void> {
    return Promise.resolve();
  }
}
