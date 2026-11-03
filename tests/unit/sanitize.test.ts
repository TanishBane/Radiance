import { describe, it, expect } from "vitest";
import { ChatRequestSchema, sanitizeText } from "@/lib/security/sanitize";

describe("Input Validation & Payload Sanitization", () => {
  it("sanitizes null bytes and excess whitespace", () => {
    const malicious = "  hello\u0000world\u0000  ";
    expect(sanitizeText(malicious)).toBe("helloworld");
  });

  it("validates a well-formed chat request payload", () => {
    const valid = {
      messages: [
        {
          role: "user",
          content: "Explain quantum computing simply.",
        },
      ],
      modelId: "groq-fast",
      mode: "default",
      tone: "concise",
      language: "en",
    };

    const parsed = ChatRequestSchema.safeParse(valid);
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.modelId).toBe("groq-fast");
      expect(parsed.data.tone).toBe("concise");
    }
  });

  it("rejects payloads with empty messages array", () => {
    const invalid = {
      messages: [],
    };
    const parsed = ChatRequestSchema.safeParse(invalid);
    expect(parsed.success).toBe(false);
  });

  it("rejects messages exceeding max content length", () => {
    const oversized = {
      messages: [
        {
          role: "user",
          content: "a".repeat(40000), // exceeds 32000
        },
      ],
    };
    const parsed = ChatRequestSchema.safeParse(oversized);
    expect(parsed.success).toBe(false);
  });

  it("rejects invalid role types", () => {
    const invalidRole = {
      messages: [
        {
          role: "admin", // not user | assistant | system
          content: "Hello",
        },
      ],
    };
    const parsed = ChatRequestSchema.safeParse(invalidRole);
    expect(parsed.success).toBe(false);
  });
});
