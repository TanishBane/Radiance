import { describe, it, expect } from "vitest";
import {
  checkRateLimit,
  getTrustedClientIp,
} from "@/lib/security/rate-limiter";

describe("Distributed & Layered Rate Limiting", () => {
  it("extracts trusted edge IP headers and avoids spoofed forwarded headers", () => {
    // Edge header: x-real-ip when no platform edge header is present
    const headers1 = new Headers({
      "x-real-ip": "203.0.113.195",
      "x-forwarded-for": "10.0.0.1, 10.0.0.2",
    });
    expect(getTrustedClientIp(headers1)).toBe("203.0.113.195");

    // Vercel edge forwarded for
    const headers2 = new Headers({
      "x-vercel-forwarded-for": "198.51.100.44, 10.0.0.1",
    });
    expect(getTrustedClientIp(headers2)).toBe("198.51.100.44");

    // SEC-07: Prioritizes verified platform edge headers (Vercel) over spoofed x-real-ip
    const headersSpoofVercel = new Headers({
      "x-real-ip": "1.2.3.4", // Attacker injected spoofed IP
      "x-vercel-forwarded-for": "198.51.100.44, 10.0.0.1",
    });
    expect(getTrustedClientIp(headersSpoofVercel)).toBe("198.51.100.44");

    // SEC-07: Prioritizes verified platform edge headers (Cloudflare) over spoofed x-real-ip
    const headersSpoofCf = new Headers({
      "x-real-ip": "5.6.7.8", // Attacker injected spoofed IP
      "cf-connecting-ip": "198.51.100.77",
    });
    expect(getTrustedClientIp(headersSpoofCf)).toBe("198.51.100.77");

    // Default fallback
    const headersEmpty = new Headers();
    expect(getTrustedClientIp(headersEmpty)).toBe("127.0.0.1");

    // Rejects invalid spoofed IP strings and falls back to safe default
    const headersMalicious = new Headers({
      "x-real-ip": "attacker-injected-string; DROP TABLE",
      "x-forwarded-for": "not-an-ip, 127.0.0.1",
    });
    expect(getTrustedClientIp(headersMalicious)).toBe("127.0.0.1");

    // Accepts valid IPv6 addresses
    const headersIpv6 = new Headers({
      "x-real-ip": "2001:db8:85a3:8d3:1319:8a2e:370:7348",
    });
    expect(getTrustedClientIp(headersIpv6)).toBe("2001:db8:85a3:8d3:1319:8a2e:370:7348");
  });

  it("permits initial requests within token burst capacity", async () => {
    const testId = `test_client_${Date.now()}`;
    const result = await checkRateLimit(testId, "chat");

    expect(result.success).toBe(true);
    expect(result.remaining).toBeGreaterThan(0);
  });

  it("enforces limit and returns retryAfter when tokens are exhausted", async () => {
    const testId = `burst_exhaust_${Date.now()}`;

    // Exhaust 35 requests rapidly
    let lastResult;
    for (let i = 0; i < 35; i++) {
      lastResult = await checkRateLimit(testId, "chat");
    }

    expect(lastResult?.success).toBe(false);
    expect(lastResult?.remaining).toBe(0);
    expect(lastResult?.retryAfter).toBeGreaterThan(0);
  });
});
