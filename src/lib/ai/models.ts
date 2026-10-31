import { ModelOption } from "@/lib/types/chat";

export const AVAILABLE_MODELS: ModelOption[] = [
  {
    id: "groq-fast",
    name: "Radiance Fast",
    provider: "groq",
    upstreamModel: "llama-3.3-70b-versatile",
    sub: "Ultra-low latency inference powered by Groq LPUs",
    icon: "⚡",
    supportsVision: false,
    supportsPdf: false,
    supportsTools: true,
    contextWindow: 131072,
    maxTokens: 4096,
    status: "active",
    verifiedDate: "2026-11-01",
    pricingTier: "standard",
  },
  {
    id: "groq-instant",
    name: "Radiance Instant",
    provider: "groq",
    upstreamModel: "llama-3.1-8b-instant",
    sub: "Highest throughput for quick replies and formatting",
    icon: "🚀",
    supportsVision: false,
    supportsPdf: false,
    supportsTools: true,
    contextWindow: 131072,
    maxTokens: 4096,
    status: "active",
    verifiedDate: "2026-11-01",
    pricingTier: "free",
  },
  {
    id: "gemini-quality",
    name: "Radiance Multimodal",
    provider: "gemini",
    upstreamModel: "gemini-2.5-flash",
    sub: "Native multimodal: Vision, PDF & Document analysis",
    icon: "✦",
    supportsVision: true,
    supportsPdf: true,
    supportsTools: true,
    contextWindow: 1048576,
    maxTokens: 4096,
    status: "active",
    verifiedDate: "2026-11-01",
    pricingTier: "standard",
  },
  {
    id: "gemini-pro",
    name: "Radiance Pro Reasoning",
    provider: "gemini",
    upstreamModel: "gemini-2.5-pro",
    sub: "Deep architectural synthesis & mathematical reasoning",
    icon: "💎",
    supportsVision: true,
    supportsPdf: true,
    supportsTools: true,
    contextWindow: 1048576,
    maxTokens: 4096,
    status: "active",
    verifiedDate: "2026-11-01",
    pricingTier: "paid",
  },
  {
    id: "openrouter-reasoning",
    name: "Radiance OpenWeights",
    provider: "openrouter",
    upstreamModel: "meta-llama/llama-3.3-70b-instruct",
    sub: "Distributed open-weights fallback inference",
    icon: "🧠",
    supportsVision: false,
    supportsPdf: false,
    supportsTools: true,
    contextWindow: 131072,
    maxTokens: 4096,
    status: "active",
    verifiedDate: "2026-11-01",
    pricingTier: "standard",
  },
];

export const DEFAULT_MODEL_ID = "groq-fast";

export function getModelById(id: string): ModelOption {
  return AVAILABLE_MODELS.find((m) => m.id === id) || AVAILABLE_MODELS[0];
}

export function getActiveModels(): ModelOption[] {
  return AVAILABLE_MODELS.filter((m) => m.status === "active");
}

export function resolveCapabilityModel(preferredId: string, hasMultimodal: boolean): ModelOption {
  const preferred = getModelById(preferredId);
  if (hasMultimodal && !preferred.supportsVision && !preferred.supportsPdf) {
    const multimodalCandidate = AVAILABLE_MODELS.find((m) => m.supportsVision && m.status === "active");
    if (multimodalCandidate) return multimodalCandidate;
  }
  return preferred;
}
