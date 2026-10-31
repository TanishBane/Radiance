interface RateLimitBucket {
  tokens: number;
  lastRefill: number;
}

class TokenBucketRateLimiter {
  private buckets = new Map<string, RateLimitBucket>();
  private readonly capacity: number;
  private readonly refillRatePerSecond: number;

  constructor(capacity = 20, refillRatePerSecond = 0.5) {
    this.capacity = capacity;
    this.refillRatePerSecond = refillRatePerSecond;
  }

  check(clientId: string): { success: boolean; remaining: number; retryAfter?: number } {
    const now = Date.now();
    let bucket = this.buckets.get(clientId);

    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
      this.buckets.set(clientId, bucket);
    } else {
      const elapsedSeconds = (now - bucket.lastRefill) / 1000;
      bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsedSeconds * this.refillRatePerSecond);
      bucket.lastRefill = now;
    }

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return { success: true, remaining: Math.floor(bucket.tokens) };
    } else {
      const needed = 1 - bucket.tokens;
      const retryAfter = Math.ceil(needed / this.refillRatePerSecond);
      return { success: false, remaining: 0, retryAfter };
    }
  }

  // Periodic cleanup of stale entries
  cleanup(maxAgeMs = 3600 * 1000): void {
    const cutoff = Date.now() - maxAgeMs;
    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.lastRefill < cutoff) {
        this.buckets.delete(key);
      }
    }
  }
}

export const rateLimiter = new TokenBucketRateLimiter(30, 1); // 30 bursts, 1 req/sec sustained
