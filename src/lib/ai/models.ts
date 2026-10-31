import { ModelOption } from "@/lib/types/chat";

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "groq-fast",
    name: "Radiance Fast",
    provider: "groq",
    upstreamModel: "llama-3.3-70b-versatile",
    sub: "Ultra-low latency inference",
    icon: "⚡",
    supportsVision: false,
    supportsPdf: false,
    maxTokens: 4096,
  },
  {
    id: "gemini-quality",
    name: "Radiance Quality",
    provider: "gemini",
    upstreamModel: "gemini-2.5-flash",
    sub: "Multimodal: Vision, PDF & Deep Reasoning",
    icon: "✦",
    supportsVision: true,
    supportsPdf: true,
    maxTokens: 4096,
  },
  {
    id: "openrouter-reasoning",
    name: "Radiance Reasoning",
    provider: "openrouter",
    upstreamModel: "meta-llama/llama-3.3-70b-instruct:free",
    sub: "Balanced open-weights fallback",
    icon: "🧠",
    supportsVision: false,
    supportsPdf: false,
    maxTokens: 4096,
  },
];

export const DEFAULT_MODEL_ID = "groq-fast";

export function getModelById(id: string): ModelOption {
  return AVAILABLE_MODELS.find((m) => m.id === id) || AVAILABLE_MODELS[0];
}
