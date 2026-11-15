import { createGroq } from "@ai-sdk/groq";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { createOpenAI } from "@ai-sdk/openai";
import { LanguageModelV1 } from "ai";
import { ModelOption } from "@/lib/types/chat";

let cachedGroq: ReturnType<typeof createGroq> | null = null;
let cachedGroqKey: string | null = null;

let cachedGoogle: ReturnType<typeof createGoogleGenerativeAI> | null = null;
let cachedGoogleKey: string | null = null;

let cachedOpenRouter: ReturnType<typeof createOpenAI> | null = null;
let cachedOpenRouterKey: string | null = null;

/**
 * Creates or reuses provider instances using server-side environment variables.
 */
export function getModelInstance(option: ModelOption): LanguageModelV1 {
  switch (option.provider) {
    case "groq": {
      const apiKey = process.env.GROQ_API_KEY;
      if (!apiKey) throw new Error("Missing GROQ_API_KEY on server");
      if (!cachedGroq || cachedGroqKey !== apiKey) {
        cachedGroq = createGroq({ apiKey });
        cachedGroqKey = apiKey;
      }
      return cachedGroq(option.upstreamModel);
    }

    case "gemini": {
      const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY;
      if (!apiKey) throw new Error("Missing GEMINI_API_KEY on server");
      if (!cachedGoogle || cachedGoogleKey !== apiKey) {
        cachedGoogle = createGoogleGenerativeAI({ apiKey });
        cachedGoogleKey = apiKey;
      }
      return cachedGoogle(option.upstreamModel);
    }

    case "openrouter": {
      const apiKey = process.env.OPENROUTER_API_KEY;
      if (!apiKey) throw new Error("Missing OPENROUTER_API_KEY on server");
      if (!cachedOpenRouter || cachedOpenRouterKey !== apiKey) {
        cachedOpenRouter = createOpenAI({
          apiKey,
          baseURL: "https://openrouter.ai/api/v1",
          headers: {
            "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL || "https://radiance.ai",
            "X-Title": "Radiance AI Platform",
          },
        });
        cachedOpenRouterKey = apiKey;
      }
      return cachedOpenRouter(option.upstreamModel);
    }

    default:
      throw new Error(`Unsupported provider: ${(option as ModelOption).provider}`);
  }
}
