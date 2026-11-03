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

  it("prioritizes vision-capable models when request contains multimodal data", () => {
    const visionCandidates = circuitBreaker.resolveCandidateModels("groq-fast", true);
    // Gemini supports vision, so it must be prioritized first
    expect(visionCandidates[0].provider).toBe("gemini");
    expect(visionCandidates[0].supportsVision).toBe(true);
  });
});
