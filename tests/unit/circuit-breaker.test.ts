import { describe, it, expect, beforeEach } from "vitest";
import { circuitBreaker } from "@/lib/ai/circuit-breaker";

describe("Circuit Breaker & Fallback Engine", () => {
  beforeEach(() => {
    circuitBreaker.resetAll();
  });

  it("marks a provider exhausted upon rate limit", () => {
    expect(circuitBreaker.isExhausted("groq")).toBe(false);
    circuitBreaker.markExhausted("groq", "HTTP 429: Quota exceeded");
    expect(circuitBreaker.isExhausted("groq")).toBe(true);
  });

  it("requires multiple consecutive failures before tripping to prevent DoS poisoning (SEC-03)", () => {
    expect(circuitBreaker.isExhausted("groq")).toBe(false);

    // Single failure does not trip
    const tripped1 = circuitBreaker.recordFailure("groq", "HTTP 429: Rate limited");
    expect(tripped1).toBe(false);
    expect(circuitBreaker.isExhausted("groq")).toBe(false);

    // Second failure does not trip
    const tripped2 = circuitBreaker.recordFailure("groq", "HTTP 429: Rate limited");
    expect(tripped2).toBe(false);
    expect(circuitBreaker.isExhausted("groq")).toBe(false);

    // Third failure within window trips the circuit breaker
    const tripped3 = circuitBreaker.recordFailure("groq", "HTTP 429: Rate limited");
    expect(tripped3).toBe(true);
    expect(circuitBreaker.isExhausted("groq")).toBe(true);
  });

  it("immediately trips on fatal errors when requested", () => {
    expect(circuitBreaker.isExhausted("openrouter")).toBe(false);
    const tripped = circuitBreaker.recordFailure("openrouter", "Account suspended", true);
    expect(tripped).toBe(true);
    expect(circuitBreaker.isExhausted("openrouter")).toBe(true);
  });

  it("cascades away from exhausted providers to healthy candidates", () => {
    // Before exhaustion, groq-fast is candidate
    const initialCandidates = circuitBreaker.resolveCandidateModels("groq-fast", false);
    expect(initialCandidates.some((m) => m.provider === "groq")).toBe(true);

    // Groq hits rate-limit
    circuitBreaker.markExhausted("groq", "Rate limited");

    // After exhaustion, groq is excluded, healthy models (gemini, openrouter) remain
    const healthyCandidates = circuitBreaker.resolveCandidateModels("groq-fast", false);
    expect(healthyCandidates.some((m) => m.provider === "groq")).toBe(false);
    expect(healthyCandidates.some((m) => m.provider === "gemini")).toBe(true);
  });

  it("prioritizes and filters to vision-capable models when request contains multimodal data", () => {
    const visionCandidates = circuitBreaker.resolveCandidateModels("groq-fast", true);
    // Gemini supports vision, so it must be prioritized first
    expect(visionCandidates[0].provider).toBe("gemini");
    expect(visionCandidates[0].supportsVision).toBe(true);
    // All candidates must support vision
    expect(visionCandidates.every((m) => m.supportsVision)).toBe(true);
  });
});
