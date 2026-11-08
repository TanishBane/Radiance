import { z } from "zod";

export const MEMORY_CATEGORIES = ["preference", "goal", "interest", "project", "knowledge", "context", "temporary"] as const;
export const PREFERENCE_SIGNALS = [
  "more-concise",
  "more-detailed",
  "more-technical",
  "simpler-language",
  "more-examples",
  "more-practical",
] as const;
export const PERSONALIZATION_SCOPES = ["global", "build", "plan", "ask"] as const;

export const MemorySourceSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("manual") }),
  z.object({
    type: z.literal("conversation"),
    conversationId: z.string().min(1).max(128),
    messageId: z.string().min(1).max(128),
  }),
]);

export const PersonalMemorySchema = z.object({
  id: z.string().min(1).max(128),
  content: z.string().trim().min(1).max(500),
  category: z.enum(MEMORY_CATEGORIES),
  importance: z.number().int().min(1).max(5),
  confidence: z.literal("user-confirmed"),
  createdAt: z.number().int().nonnegative(),
  updatedAt: z.number().int().nonnegative(),
  expiresAt: z.number().int().positive().nullable(),
  source: MemorySourceSchema,
});

export const PreferenceFeedbackSchema = z.object({
  id: z.string().min(1).max(128),
  signal: z.enum(PREFERENCE_SIGNALS),
  scope: z.enum(PERSONALIZATION_SCOPES),
  createdAt: z.number().int().nonnegative(),
  sourceMessageId: z.string().max(128).optional(),
});

export const PersonalIntelligenceProfileSchema = z.object({
  version: z.literal(1),
  profileId: z.string().min(1).max(128),
  updatedAt: z.number().int().nonnegative(),
  personalizationEnabled: z.boolean(),
  memories: z.array(PersonalMemorySchema).max(100),
  preferenceFeedback: z.array(PreferenceFeedbackSchema).max(200),
});

export type MemoryCategory = (typeof MEMORY_CATEGORIES)[number];
export type PreferenceSignal = (typeof PREFERENCE_SIGNALS)[number];
export type PersonalizationScope = (typeof PERSONALIZATION_SCOPES)[number];
export type MemorySource = z.infer<typeof MemorySourceSchema>;
export type PersonalMemory = z.infer<typeof PersonalMemorySchema>;
export type PreferenceFeedback = z.infer<typeof PreferenceFeedbackSchema>;
export type PersonalIntelligenceProfile = z.infer<typeof PersonalIntelligenceProfileSchema>;

