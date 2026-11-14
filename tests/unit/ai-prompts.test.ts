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

  it("defaults to Ask and gives each composer mode a distinct response contract", () => {
    const ask = composeSystemPrompt();
    const plan = composeSystemPrompt("default", "en", "plan");
    const build = composeSystemPrompt("default", "en", "build");

    expect(ask).toContain("[Mode Instruction - ASK]");
    expect(ask).toContain("Answer the user's request directly");
    expect(plan).toContain("[Mode Instruction - PLAN]");
    expect(plan).toContain("prioritized sequence of practical phases");
    expect(plan).toContain("success criteria");
    expect(build).toContain("[Mode Instruction - BUILD]");
    expect(build).toContain("complete the requested deliverable");
    expect(build).toContain("verification");
    expect(plan).not.toBe(build);
  });
});
