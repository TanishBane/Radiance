import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

export interface RateLimitResult {
  success: boolean;
  remaining: number;
  retryAfter?: number;
  isDistributed: boolean;
}

interface LocalBucket {
  tokens: number;
  lastRefill: number;
}

class LocalTokenBucketLimiter {
  private buckets = new Map<string, LocalBucket>();
  private readonly capacity: number;
  private readonly refillRatePerSecond: number;
  private checkCount = 0;
  private static readonly MAX_BUCKETS = 10_000;
  private static readonly CLEANUP_INTERVAL = 500;

  constructor(capacity = 30, refillRatePerSecond = 0.5) {
    this.capacity = capacity;
    this.refillRatePerSecond = refillRatePerSecond;
  }

  check(clientId: string): { success: boolean; remaining: number; retryAfter?: number } {
    const now = Date.now();
    this.checkCount++;

    // Opportunistic automatic cleanup & hard capacity bounds to prevent memory leaks (SEC-01)
    if (
      this.checkCount >= LocalTokenBucketLimiter.CLEANUP_INTERVAL ||
      this.buckets.size >= LocalTokenBucketLimiter.MAX_BUCKETS
    ) {
      this.checkCount = 0;
      this.cleanup();

      // If still exceeding max capacity after cleanup, evict oldest entries (FIFO)
      if (this.buckets.size >= LocalTokenBucketLimiter.MAX_BUCKETS) {
        const evictCount = Math.floor(LocalTokenBucketLimiter.MAX_BUCKETS * 0.2);
        let evicted = 0;
        for (const key of this.buckets.keys()) {
          this.buckets.delete(key);
          evicted++;
          if (evicted >= evictCount) break;
        }
      }
    }

    let bucket = this.buckets.get(clientId);

    if (!bucket) {
      bucket = { tokens: this.capacity - 1, lastRefill: now };
      this.buckets.set(clientId, bucket);
      return { success: true, remaining: Math.floor(bucket.tokens) };
    }

    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsedSeconds * this.refillRatePerSecond);
    bucket.lastRefill = now;

    // Refresh insertion order to guarantee true LRU eviction (SEC-01)
    this.buckets.delete(clientId);
    this.buckets.set(clientId, bucket);

    if (bucket.tokens >= 1) {
      bucket.tokens -= 1;
      return { success: true, remaining: Math.floor(bucket.tokens) };
    } else {
      const needed = 1 - bucket.tokens;
      const retryAfter = Math.ceil(needed / this.refillRatePerSecond);
      return { success: false, remaining: 0, retryAfter };
    }
  }

  cleanup(maxAgeMs = 3600 * 1000): void {
    const cutoff = Date.now() - maxAgeMs;
    for (const [key, bucket] of this.buckets.entries()) {
      if (bucket.lastRefill < cutoff) {
        this.buckets.delete(key);
      }
    }
  }
}

// In-memory fallbacks per resource
const localChatLimiter = new LocalTokenBucketLimiter(30, 0.5); // 30 burst, 0.5/s (~30 req/min sustained)
const localImageLimiter = new LocalTokenBucketLimiter(10, 0.1); // 10 burst, 6 req/min sustained

let upstashChatLimiter: Ratelimit | null = null;
let upstashImageLimiter: Ratelimit | null = null;
let redisInitialized = false;

function initUpstash(): void {
  if (redisInitialized) return;
  redisInitialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token && !url.includes("example.com")) {
    try {
      const redis = new Redis({ url, token });
      upstashChatLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "60 s"),
        prefix: "radiance:rl:chat",
      });
      upstashImageLimiter = new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(10, "60 s"),
        prefix: "radiance:rl:image",
      });
    } catch (err) {
      console.warn("[RateLimiter] Failed to initialize Upstash Redis. Falling back to local token bucket:", err);
    }
  }
}

/**
 * Checks rate limits with automatic fail-safe fallback to memory limiter
 * if Upstash Redis is unconfigured or experiences a transient outage.
 */
export async function checkRateLimit(
  identifier: string,
  resource: "chat" | "image" = "chat"
): Promise<RateLimitResult> {
  initUpstash();

  const upstashInstance = resource === "chat" ? upstashChatLimiter : upstashImageLimiter;

  if (upstashInstance) {
    try {
      const result = await upstashInstance.limit(identifier);
      if (!result.success) {
        const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
        return {
          success: false,
          remaining: 0,
          retryAfter,
          isDistributed: true,
        };
      }
      return {
        success: true,
        remaining: result.remaining,
        isDistributed: true,
      };
    } catch (err) {
      console.warn("[RateLimiter] Upstash Redis outage. Degraded mode to local limiter:", err);
    }
  }

  // Graceful local fallback
  const localLimiter = resource === "chat" ? localChatLimiter : localImageLimiter;
  const localRes = localLimiter.check(identifier);

  return {
    success: localRes.success,
    remaining: localRes.remaining,
    retryAfter: localRes.retryAfter,
    isDistributed: false,
  };
}

const IPV4_REGEX = /^(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(?:\.(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}$/;
const IPV6_REGEX = /^(?:[a-fA-F0-9]{1,4}:){1,7}[a-fA-F0-9]{1,4}$|^::1$|^::$/;

function sanitizeAndValidateIp(candidate: string | null | undefined): string | null {
  if (!candidate) return null;
  const trimmed = candidate.trim();
  if (trimmed.length === 0 || trimmed.length > 45) return null;
  if (IPV4_REGEX.test(trimmed) || IPV6_REGEX.test(trimmed)) {
    return trimmed;
  }
  return null;
}

/**
 * Derives trusted client IP avoiding spoofed x-forwarded-for headers.
 */
export function getTrustedClientIp(headers: Headers): string {
  // Edge-verified headers
  const realIp = sanitizeAndValidateIp(headers.get("x-real-ip"));
  if (realIp) return realIp;

  const vercelIp = headers.get("x-vercel-forwarded-for");
  if (vercelIp && vercelIp.trim().length > 0) {
    const validated = sanitizeAndValidateIp(vercelIp.split(",")[0]);
    if (validated) return validated;
  }

  const cfIp = sanitizeAndValidateIp(headers.get("cf-connecting-ip"));
  if (cfIp) return cfIp;

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded && forwarded.trim().length > 0) {
    const parts = forwarded.split(",").map((s) => s.trim());
    for (const part of parts) {
      const validated = sanitizeAndValidateIp(part);
      if (validated) return validated;
    }
  }

  return "127.0.0.1";
}
