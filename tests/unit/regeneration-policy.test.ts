import { describe, expect, it } from "vitest";
import { canRegenerateResponse, markRegeneratedResponse } from "@/lib/chat/regeneration-policy";
import type { ChatMessage } from "@/lib/types/chat";

const original: ChatMessage = {
  id: "assistant-answer-1",
  role: "assistant",
  content: "First answer",
  createdAt: 100,
  responseMode: "plan",
};

describe("assistant response regeneration policy", () => {
  it("allows one regeneration, preserves the message identity, and records the update", () => {
    const replacement = markRegeneratedResponse(
      original,
      { ...original, id: "new-stream-message", content: "Replacement answer", createdAt: 200 },
      250
    );

    expect(replacement).toMatchObject({
      id: original.id,
      content: "Replacement answer",
      responseMode: "plan",
      regenerationCount: 1,
      lastRegeneratedAt: 250,
    });
    expect(canRegenerateResponse(original)).toBe(true);
    expect(canRegenerateResponse(replacement)).toBe(false);
  });

  it("does not regenerate user messages or failed assistant messages", () => {
    expect(canRegenerateResponse({ ...original, role: "user" })).toBe(false);
    expect(canRegenerateResponse({ ...original, isError: true })).toBe(false);
  });
});
