import { z } from "zod";

export const ChatRequestSchema = z.object({
  messages: z.array(
    z.object({
      id: z.string().optional(),
      role: z.enum(["user", "assistant", "system"]),
      content: z.string().max(32000, "Message content exceeds maximum allowed length"),
      attachments: z
        .array(
          z.object({
            id: z.string(),
            name: z.string().max(256),
            type: z.enum(["image", "pdf", "text", "csv", "doc"]),
            mime: z.string().max(128),
            size: z.number().max(10 * 1024 * 1024, "File size exceeds 10MB limit"),
            dataUrl: z.string().optional(),
            extractedText: z.string().optional(),
          })
        )
        .optional(),
    })
  ).min(1, "At least one message is required"),
  modelId: z.string().default("groq-fast"),
  mode: z.string().optional().default("default"),
  tone: z
    .enum([
      "default",
      "formal",
      "casual",
      "concise",
      "academic",
      "executive",
      "mentor",
      "technical",
      "socratic",
      "devil",
    ])
    .default("default"),
  language: z.enum(["en", "hi"]).default("en"),
  temperature: z.number().min(0).max(2).optional(),
});

export type ValidatedChatRequest = z.infer<typeof ChatRequestSchema>;

export function sanitizeText(input: string): string {
  return input.trim().replace(/\u0000/g, "");
}
