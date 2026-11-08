import { z } from "zod";

export const ChatRequestSchema = z.object({
  messages: z
    .array(
      z.object({
        id: z.string().optional(),
        role: z.enum(["user", "assistant", "system"]),
        content: z.string().max(32000, "Message content exceeds maximum allowed length"),
        attachments: z
          .array(
            z.object({
              id: z.string().max(128),
              name: z
                .string()
                .max(256)
                .transform((val) => val.replace(/[\0\r\n]/g, " ").trim()),
              type: z.enum(["image", "pdf", "text", "csv", "doc"]),
              mime: z.string().max(128),
              size: z.number().max(10 * 1024 * 1024, "File size exceeds 10MB limit"),
              dataUrl: z
                .string()
                .max(15 * 1024 * 1024, "dataUrl exceeds maximum allowed length")
                .refine(
                  (val) => !val || /^data:image\/(?:png|jpeg|jpg|webp|gif);base64,[A-Za-z0-9+/=]+$/i.test(val),
                  { message: "Invalid image data URI format. Must be a base64 encoded image." }
                )
                .optional(),
              extractedText: z
                .string()
                .max(32000, "Attachment extractedText exceeds maximum allowed length")
                .optional(),
            })
          )
          .max(10, "A maximum of 10 attachments is permitted per message")
          .optional(),
      })
    )
    .min(1, "At least one message is required"),
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
