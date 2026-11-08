import { describe, expect, it } from "vitest";
import { composeSystemPrompt } from "@/lib/ai/prompts";

describe("system prompt response preferences", () => {
  it("keeps custom instructions explicitly subordinate to system and safety instructions", () => {
    const prompt = composeSystemPrompt("default", "en", "build", "Use metric units.");

    expect(prompt).toContain("Use metric units.");
    expect(prompt).toContain("user preference");
    expect(prompt).toContain("consistent with system and safety instructions");
  });
});
