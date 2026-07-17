export interface RateLimitResult {
  count: number;
  ttlSeconds: number;
}

export abstract class RateLimitStore {
  abstract increment(
    key: string,
    windowSeconds: number,
  ): Promise<RateLimitResult>;
  abstract clear(key: string): Promise<void>;
  abstract isReady(): Promise<boolean>;
  abstract close(): Promise<void>;
}
