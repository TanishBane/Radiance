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

  it("enforces attachment count limits (SEC-04)", () => {
    const excessiveAttachments = {
      messages: [
        {
          role: "user",
          content: "Check files",
          attachments: Array.from({ length: 11 }, (_, i) => ({
            id: `att_${i}`,
            name: `file_${i}.txt`,
            type: "text" as const,
            mime: "text/plain",
            size: 1024,
          })),
        },
      ],
    };
    const parsed = ChatRequestSchema.safeParse(excessiveAttachments);
    expect(parsed.success).toBe(false);
  });

  it("validates safe data URI format and rejects SSRF URLs in dataUrl (SEC-04)", () => {
    // Rejects HTTP URL disguised as dataUrl
    const ssrfPayload = {
      messages: [
        {
          role: "user",
          content: "Image prompt",
          attachments: [
            {
              id: "att_ssrf",
              name: "image.png",
              type: "image" as const,
              mime: "image/png",
              size: 1024,
              dataUrl: "http://169.254.169.254/latest/meta-data/",
            },
          ],
        },
      ],
    };
    const parsedSsrf = ChatRequestSchema.safeParse(ssrfPayload);
    expect(parsedSsrf.success).toBe(false);

    // Accepts valid base64 image data URI
    const validImagePayload = {
      messages: [
        {
          role: "user",
          content: "Valid image",
          attachments: [
            {
              id: "att_valid",
              name: "photo.jpg",
              type: "image" as const,
              mime: "image/jpeg",
              size: 1024,
              dataUrl: "data:image/jpeg;base64,/9j/4AAQSkZJRg==",
            },
          ],
        },
      ],
    };
    const parsedValid = ChatRequestSchema.safeParse(validImagePayload);
    expect(parsedValid.success).toBe(true);
  });
});
