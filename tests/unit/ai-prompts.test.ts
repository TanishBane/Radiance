import { describe, expect, it } from "vitest";
import { composeSystemPrompt } from "@/lib/ai/prompts";

describe("system prompt response preferences", () => {
  it.each([
    ["hi", "Hindi"],
    ["es", "Spanish"],
    ["fr", "French"],
    ["de", "German"],
    ["pt", "Portuguese"],
    ["ja", "Japanese"],
  ] as const)("requests responses in %s", (language, expectedLanguage) => {
    expect(composeSystemPrompt("default", language)).toContain(`Always respond in ${expectedLanguage}`);
  });

  it("keeps custom instructions explicitly subordinate to system and safety instructions", () => {
    const prompt = composeSystemPrompt("default", "en", "build", "Use metric units.");

    expect(prompt).toContain("Use metric units.");
    expect(prompt).toContain("user preference");
    expect(prompt).toContain("consistent with system and safety instructions");
  });
});
