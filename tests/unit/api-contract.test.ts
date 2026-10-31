import { describe, it, expect } from "vitest";
import { ChatRequestSchema } from "@/lib/security/sanitize";

describe("API Contract & Request Validation (RFC 7807 and Zod Schemas)", () => {
  it("validates valid chat payload successfully", () => {
    const payload = {
      messages: [
        {
          id: "msg_1",
          role: "user",
          content: "Hello Radiance",
          createdAt: Date.now(),
        },
      ],
      modelId: "groq-llama-3.3-70b",
      mode: "default",
      tone: "default",
      language: "en",
    };

    const result = ChatRequestSchema.safeParse(payload);
    expect(result.success).toBe(true);
  });

  it("rejects chat payload with missing messages", () => {
    const payload = {
      modelId: "groq-llama-3.3-70b",
    };

    const result = ChatRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("rejects empty messages array", () => {
    const payload = {
      messages: [],
      modelId: "groq-llama-3.3-70b",
    };

    const result = ChatRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });

  it("sanitizes excessively long user prompt", () => {
    const longPrompt = "a".repeat(40000); // Exceeds 32k max character limit
    const payload = {
      messages: [
        {
          id: "msg_long",
          role: "user",
          content: longPrompt,
          createdAt: Date.now(),
        },
      ],
      modelId: "groq-llama-3.3-70b",
    };

    const result = ChatRequestSchema.safeParse(payload);
    expect(result.success).toBe(false);
  });
});
