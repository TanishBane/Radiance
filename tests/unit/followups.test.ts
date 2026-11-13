import { describe, expect, it } from "vitest";
import { generateFollowUpQuestions } from "@/lib/ai/followups";

describe("contextual follow-up questions", () => {
  it("includes the latest user topic in fallback suggestions", async () => {
    const questions = await generateFollowUpQuestions(
      "Solar panels convert sunlight into electricity.",
      "default",
      "en",
      "How do solar panels store energy for use at night?"
    );

    expect(questions).toHaveLength(3);
    expect(questions.join(" ")).toContain("How do solar panels store energy for use at night");
  });
});
