import { z } from "zod";
import { AVAILABLE_MODELS } from "@/lib/ai/models";
import { COLOR_THEMES, ATMOSPHERE_ENGINES } from "@/lib/types/theme";

export const settingsFieldSchemas = {
  theme: z.string().refine((value) => value in COLOR_THEMES),
  gradientStyle: z.string().refine((value) => ATMOSPHERE_ENGINES.some((engine) => engine.id === value)),
  autoTheme: z.boolean(),
  tone: z.enum(["default", "formal", "casual", "concise", "academic", "executive", "mentor", "technical", "socratic", "devil"]),
  language: z.enum(["en", "hi"]),
  modelId: z.string().refine((value) => AVAILABLE_MODELS.some((model) => model.id === value && model.status === "active")),
  customInstructions: z.string().max(2000),
  enterToSend: z.boolean(),
  themeHistory: z.array(z.string().refine((value) => value in COLOR_THEMES)).max(5),
} as const;

export const RadianceSettingsSchema = z.object(settingsFieldSchemas);
export type RadianceSettings = z.infer<typeof RadianceSettingsSchema>;
