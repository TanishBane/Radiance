import { NextRequest } from "next/server";
import { streamText, CoreMessage } from "ai";
import { ChatRequestSchema } from "@/lib/security/sanitize";
import { rateLimiter } from "@/lib/security/rate-limiter";
import { circuitBreaker } from "@/lib/ai/circuit-breaker";
import { getModelInstance } from "@/lib/ai/providers";
import { composeSystemPrompt } from "@/lib/ai/prompts";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 1. Enforce Rate Limiting
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0] || "127.0.0.1";
  const rateLimit = rateLimiter.check(ip);
  if (!rateLimit.success) {
    return new Response(
      JSON.stringify({
        error: "Rate limit exceeded. Please wait before sending another message.",
        retryAfter: rateLimit.retryAfter,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(rateLimit.retryAfter || 10),
        },
      }
    );
  }

  // 2. Validate Request Body
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Invalid JSON payload" }), { status: 400 });
  }

  const parsed = ChatRequestSchema.safeParse(body);
  if (!parsed.success) {
    return new Response(
      JSON.stringify({
        error: "Validation error",
        issues: parsed.error.format(),
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages, modelId, mode, tone, language, temperature } = parsed.data;

  // 3. Inspect if multimodal content is attached to any message
  const hasMultimodal = messages.some((m) =>
    m.attachments?.some((a) => a.type === "image" || a.type === "pdf")
  );

  // 4. Resolve candidate models with circuit breaker awareness
  const candidateModels = circuitBreaker.resolveCandidateModels(modelId, hasMultimodal);
  if (candidateModels.length === 0) {
    return new Response(
      JSON.stringify({
        error: "All AI providers are currently exhausted or unavailable. Please wait and try again.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // 5. Construct system prompt
  const systemPrompt = composeSystemPrompt(mode, tone, language);

  // 6. Map messages to Vercel AI SDK CoreMessage format
  const coreMessages: CoreMessage[] = messages.map((m) => {
    // If text file or document has extracted text, append it
    let textContent = m.content;
    const textAttachments = m.attachments?.filter((a) => a.type === "text" || a.type === "csv");
    if (textAttachments && textAttachments.length > 0) {
      textAttachments.forEach((att) => {
        if (att.extractedText) {
          textContent += `\n\n[Attached File: ${att.name}]\n${att.extractedText.slice(0, 10000)}`;
        }
      });
    }

    // Check for images
    const imageAttachments = m.attachments?.filter((a) => a.type === "image" && a.dataUrl);
    if (imageAttachments && imageAttachments.length > 0 && m.role === "user") {
      return {
        role: "user",
        content: [
          { type: "text", text: textContent || "Analyze this image." },
          ...imageAttachments.map((img) => ({
            type: "image" as const,
            image: img.dataUrl!,
          })),
        ],
      };
    }

    return {
      role: m.role as "user" | "assistant" | "system",
      content: textContent,
    };
  });

  // 7. Attempt execution across candidates with automatic circuit breaking
  let lastError: Error | null = null;

  for (const modelOption of candidateModels) {
    try {
      const model = getModelInstance(modelOption);
      const result = streamText({
        model,
        system: systemPrompt,
        messages: coreMessages,
        temperature: temperature ?? 0.8,
        maxTokens: modelOption.maxTokens,
      });

      return result.toDataStreamResponse({
        headers: {
          "X-Radiance-Provider": modelOption.provider,
          "X-Radiance-Model": modelOption.id,
        },
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      lastError = error;

      // Detect rate-limit or 429
      const errStr = error.message.toLowerCase();
      if (errStr.includes("429") || errStr.includes("quota") || errStr.includes("rate limit") || errStr.includes("resource_exhausted")) {
        circuitBreaker.markExhausted(modelOption.provider, error.message);
        continue; // Try next healthy candidate
      }

      // If it's a non-retryable user/auth error, throw immediately
      break;
    }
  }

  return new Response(
    JSON.stringify({
      error: lastError?.message || "Inference failed across available providers.",
    }),
    { status: 500, headers: { "Content-Type": "application/json" } }
  );
}
