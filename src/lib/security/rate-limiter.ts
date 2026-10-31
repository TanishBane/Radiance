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

  constructor(capacity = 30, refillRatePerSecond = 0.5) {
    this.capacity = capacity;
    this.refillRatePerSecond = refillRatePerSecond;
  }

  check(clientId: string): { success: boolean; remaining: number; retryAfter?: number } {
    const now = Date.now();
    let bucket = this.buckets.get(clientId);

    if (!bucket) {
      bucket = { tokens: this.capacity - 1, lastRefill: now };
      this.buckets.set(clientId, bucket);
      return { success: true, remaining: Math.floor(bucket.tokens) };
    }

    const elapsedSeconds = (now - bucket.lastRefill) / 1000;
    bucket.tokens = Math.min(this.capacity, bucket.tokens + elapsedSeconds * this.refillRatePerSecond);
    bucket.lastRefill = now;

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

/**
 * Derives trusted client IP avoiding spoofed x-forwarded-for headers.
 */
export function getTrustedClientIp(headers: Headers): string {
  // Edge-verified headers
  const realIp = headers.get("x-real-ip");
  if (realIp && realIp.trim().length > 0) return realIp.trim();

  const vercelIp = headers.get("x-vercel-forwarded-for");
  if (vercelIp && vercelIp.trim().length > 0) return vercelIp.split(",")[0].trim();

  const cfIp = headers.get("cf-connecting-ip");
  if (cfIp && cfIp.trim().length > 0) return cfIp.trim();

  const forwarded = headers.get("x-forwarded-for");
  if (forwarded && forwarded.trim().length > 0) {
    // In multi-proxy setups, the first non-private client IP
    const parts = forwarded.split(",").map((s) => s.trim());
    return parts[0] || "127.0.0.1";
  }

  return "127.0.0.1";
}
