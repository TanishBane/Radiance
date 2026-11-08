import { describe, it, expect, beforeEach } from "vitest";
import { GET as getHealth } from "@/app/api/health/route";
import { GET as getReadiness } from "@/app/api/health/ready/route";
import { circuitBreaker } from "@/lib/ai/circuit-breaker";
import { aiTelemetry } from "@/lib/observability/ai-telemetry";
import { sanitizeSentryEvent, scrubString } from "@/lib/observability/privacy";

describe("Radiance Observability & Health Probes Specifications", () => {
  beforeEach(() => {
    circuitBreaker.resetAll();
  });

  describe("1. Liveness Health Check (GET /api/health)", () => {
    it("returns 200 OK with expected platform metadata, diagnostics, and no leaked credentials", async () => {
      const res = await getHealth();
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe("healthy");
      expect(data.platform).toBe("RADIANCE");
      expect(data.version).toBe("1.0.0");
      expect(typeof data.uptime).toBe("number");
      expect(Array.isArray(data.models)).toBe(true);
      expect(data.diagnostics).toBeDefined();
      expect(data.diagnostics.memory.rssMb).toBeGreaterThan(0);
      expect(data.diagnostics.aiObservability).toBeDefined();

      // Ensure no sensitive env strings leaked
      const stringified = JSON.stringify(data);
      expect(stringified).not.toContain("gsk_");
      expect(stringified).not.toContain("AIzaSy");
      expect(stringified).not.toContain("sk-or-v1-");
    });
  });

  describe("2. Readiness Health Check (GET /api/health/ready)", () => {
    it("returns 200 and ready state when providers are operational", async () => {
      const res = await getReadiness();
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe("ready");
      expect(data.dependencies.aiProviders.status).toBe("operational");
      expect(data.dependencies.database.status).toBeDefined();
      expect(data.dependencies.cache.status).toBeDefined();
    });

    it("returns 503 and degraded state when all providers are exhausted", async () => {
      circuitBreaker.recordFailure("groq", "429 Rate limit exceeded");
      circuitBreaker.recordFailure("groq", "429 Rate limit exceeded");
      circuitBreaker.recordFailure("groq", "429 Rate limit exceeded");
      circuitBreaker.recordFailure("google", "429 Rate limit exceeded");
      circuitBreaker.recordFailure("google", "429 Rate limit exceeded");
      circuitBreaker.recordFailure("google", "429 Rate limit exceeded");
      circuitBreaker.recordFailure("openrouter", "429 Rate limit exceeded");
      circuitBreaker.recordFailure("openrouter", "429 Rate limit exceeded");
      circuitBreaker.recordFailure("openrouter", "429 Rate limit exceeded");

      const res = await getReadiness();
      expect(res.status).toBe(503);

      const data = await res.json();
      expect(data.status).toBe("degraded");
      expect(data.dependencies.aiProviders.status).toBe("exhausted");
    });
  });

  describe("3. AI Observability & TTFT Telemetry Tracker", () => {
    it("correctly tracks request lifecycle, TTFT, token usage, and aggregates metrics", () => {
      const tel = aiTelemetry.startRequest("test-req-1", "groq", "llama-3.3-70b-versatile");
      expect(tel.status).toBe("success");

      // Record first token after 40ms
      aiTelemetry.recordFirstToken(tel);
      expect(tel.ttftMs).toBeGreaterThanOrEqual(0);

      // Complete request with token usage
      aiTelemetry.completeSuccess(tel, { promptTokens: 120, completionTokens: 45, totalTokens: 165 });
      expect(tel.tokensInput).toBe(120);
      expect(tel.tokensOutput).toBe(45);

      const snapshot = aiTelemetry.getSnapshot();
      expect(snapshot.totalRequests).toBeGreaterThan(0);
      expect(snapshot.successfulRequests).toBeGreaterThan(0);
      expect(snapshot.totalTokensInput).toBeGreaterThanOrEqual(120);
    });

    it("accurately classifies error categories without leaking prompt text", () => {
      expect(aiTelemetry.classifyError(new Error("429 Too Many Requests"))).toBe("rate_limit_429");
      expect(aiTelemetry.classifyError(new Error("Insufficient user credit or quota"))).toBe("quota_exceeded");
      expect(aiTelemetry.classifyError(new Error("Connection ETIMEDOUT"))).toBe("network_timeout");
      expect(aiTelemetry.classifyError(new Error("This model's maximum context length is 8192 tokens"))).toBe("context_length_exceeded");
      expect(aiTelemetry.classifyError(new Error("Invalid API key provided"))).toBe("auth_error");
    });
  });

  describe("4. Privacy & Sensitive Data Redaction Engine", () => {
    it("scrubs API keys and secrets from arbitrary strings", () => {
      const raw = "Error calling Groq with key gsk_abcdef1234567890abcdef1234567890 and Gemini AIzaSyABCDEF1234567890ABCDEF1234567890";
      const cleaned = scrubString(raw);
      expect(cleaned).not.toContain("gsk_abcdef");
      expect(cleaned).not.toContain("AIzaSyABCDEF");
      expect(cleaned).toContain("[REDACTED_CREDENTIAL]");
    });

    it("sanitizes Sentry events stripping cookies, auth headers, and user PII", () => {
      const mockEvent: any = {
        request: {
          headers: {
            authorization: "Bearer secret-token",
            cookie: "sb-auth=abc; token=123",
            "content-type": "application/json",
          },
          cookies: { session: "secret" },
          data: { prompt: "Tell me my secret password", password: "123" },
        },
        user: {
          id: "user-1",
          email: "confidential@example.com",
          ip_address: "192.168.1.1",
        },
        extra: {
          messages: [{ content: "Private chat input" }],
        },
      };

      const sanitized = sanitizeSentryEvent(mockEvent);
      expect(sanitized).not.toBeNull();
      expect(sanitized?.request?.headers?.authorization).toBeUndefined();
      expect(sanitized?.request?.headers?.cookie).toBeUndefined();
      expect(sanitized?.request?.cookies).toEqual({});
      expect(sanitized?.user?.email).toBeUndefined();
      expect(sanitized?.user?.ip_address).toBeUndefined();
      expect(sanitized?.extra?.messages).toBe("[REDACTED_PRIVACY_FIELD]");
    });
  });
});
