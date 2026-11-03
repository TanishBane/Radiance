import { describe, it, expect } from "vitest";
import {
  AVAILABLE_MODELS,
  getModelById,
  getActiveModels,
  resolveCapabilityModel,
  DEFAULT_MODEL_ID,
} from "@/lib/ai/models";

describe("AI Model Registry & Capability Routing", () => {
  it("contains verified active models with valid upstream identifiers", () => {
    expect(AVAILABLE_MODELS.length).toBeGreaterThanOrEqual(4);

    AVAILABLE_MODELS.forEach((model) => {
      expect(model.id).toBeTruthy();
      expect(model.upstreamModel).toBeTruthy();
      expect(["groq", "gemini", "openrouter"]).toContain(model.provider);
      expect(model.maxTokens).toBeGreaterThan(0);
      expect(model.status).toBe("active");
      expect(model.verifiedDate).toBe("2026-11-01");
    });
  });

  it("retrieves models by ID with fallback to default model", () => {
    const fast = getModelById("groq-fast");
    expect(fast.provider).toBe("groq");
    expect(fast.upstreamModel).toBe("llama-3.3-70b-versatile");

    const unknown = getModelById("non-existent-model");
    expect(unknown.id).toBe(DEFAULT_MODEL_ID);
  });

  it("returns active models list correctly", () => {
    const active = getActiveModels();
    expect(active.every((m) => m.status === "active")).toBe(true);
  });

  it("dynamically resolves multimodal models when attachments are present", () => {
    // If text-only, returns preferred fast model
    const textModel = resolveCapabilityModel("groq-fast", false);
    expect(textModel.id).toBe("groq-fast");

    // If multimodal attached, auto-routes to a model with vision/pdf capabilities
    const visionModel = resolveCapabilityModel("groq-fast", true);
    expect(visionModel.supportsVision).toBe(true);
    expect(visionModel.provider).toBe("gemini");
  });

  it("preserves preferred model if it already supports multimodal", () => {
    const preferred = resolveCapabilityModel("gemini-quality", true);
    expect(preferred.id).toBe("gemini-quality");
  });
});
