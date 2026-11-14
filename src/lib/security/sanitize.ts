import { z } from "zod";
import { MEMORY_CATEGORIES, PREFERENCE_SIGNALS } from "@/features/intelligence/profile-schema";

const ProviderPersonalizationSchema = z.object({
  memories: z.array(z.object({
    category: z.enum(MEMORY_CATEGORIES),
    content: z.string().trim().min(1).max(500).transform((value) => value.replace(/\u0000/g, "")),
  }).strict()).max(5),
  preferences: z.array(z.enum(PREFERENCE_SIGNALS)).max(4),
}).strict().optional().refine((value) => !value || JSON.stringify(value).length <= 2_500, {
  message: "Personalization context exceeds maximum allowed size",
});

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
  mode: z.enum(["ask", "plan", "build"]).default("ask"),
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
  language: z.enum(["en", "hi", "es", "fr", "de", "pt", "ja"]).default("en"),
  customInstructions: z.string().max(2000, "Custom instructions exceed 2,000 characters").transform((value) => value.replace(/\u0000/g, "").trim()).default(""),
  personalization: ProviderPersonalizationSchema,
  temperature: z.number().min(0).max(2).optional(),
});

export type ValidatedChatRequest = z.infer<typeof ChatRequestSchema>;

export function sanitizeText(input: string): string {
  return input.trim().replace(/\u0000/g, "");
}
