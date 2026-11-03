import { NextRequest } from "next/server";
import { streamText, CoreMessage } from "ai";
import { ChatRequestSchema } from "@/lib/security/sanitize";
import { checkRateLimit, getTrustedClientIp } from "@/lib/security/rate-limiter";
import { circuitBreaker } from "@/lib/ai/circuit-breaker";
import { getModelInstance } from "@/lib/ai/providers";
import { composeSystemPrompt } from "@/lib/ai/prompts";
import { resolveCapabilityModel } from "@/lib/ai/models";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  // 1. Enforce Layered Rate Limiting (Upstash Redis with Local Fallback)
  const clientIp = getTrustedClientIp(req.headers);
  const rateLimit = await checkRateLimit(clientIp, "chat");

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
          "X-RateLimit-Distributed": String(rateLimit.isDistributed),
        },
      }
    );
  }

  // 2. Validate Request Body with Zod
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
        issues: parsed.error.issues,
      }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const { messages, modelId, mode, tone, language, temperature } = parsed.data;

  // 3. Multimodal Content Detection & Capability Resolution
  const hasMultimodal = messages.some((m) =>
    m.attachments?.some((a) => a.type === "image" || a.type === "pdf")
  );

  // Automatically route to a multimodal-capable model if attachments are present
  const resolvedModel = resolveCapabilityModel(modelId, hasMultimodal);

  // 4. Resolve Candidate Models With Circuit Breaker Awareness
  const candidateModels = circuitBreaker.resolveCandidateModels(resolvedModel.id, hasMultimodal);
  if (candidateModels.length === 0) {
    return new Response(
      JSON.stringify({
        error: "All AI inference providers are currently experiencing elevated latency or rate limits. Please retry in a few moments.",
      }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  // 5. Construct System Prompt (Default Assistant + Tone + Language)
  const systemPrompt = composeSystemPrompt(tone, language);

  // 6. Map Messages to CoreMessage Format With Attachment Injection
  const coreMessages: CoreMessage[] = messages.map((m) => {
    let textContent = m.content;

    // Append text and document attachments safely
    const textAttachments = m.attachments?.filter(
      (a) => a.type === "text" || a.type === "csv" || a.type === "doc"
    );
    if (textAttachments && textAttachments.length > 0) {
      textAttachments.forEach((att) => {
        if (att.extractedText) {
          textContent += `\n\n[Attached File: ${att.name}]\n${att.extractedText.slice(0, 16000)}`;
        }
      });
    }

    // Append images for multimodal-capable models
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

  // 7. Streaming Inference with Client AbortSignal & Failover
  let lastError: Error | null = null;

  for (const modelOption of candidateModels) {
    try {
      const model = getModelInstance(modelOption);
      const result = streamText({
        model,
        system: systemPrompt,
        messages: coreMessages,
        temperature: temperature ?? 0.7,
        maxTokens: modelOption.maxTokens,
        abortSignal: req.signal, // Propagate client cancellation directly to provider
      });

      return result.toDataStreamResponse({
        headers: {
          "X-Radiance-Provider": modelOption.provider,
          "X-Radiance-Model": modelOption.id,
          "X-RateLimit-Distributed": String(rateLimit.isDistributed),
        },
        getErrorMessage: (err) => {
          // Never leak internal credentials or upstream stack traces
          const message = err instanceof Error ? err.message : String(err);
          if (message.includes("429") || message.includes("quota")) {
            return "Provider quota exceeded. Failing over to backup engine.";
          }
          return "An inference error occurred while streaming the response.";
        },
      });
    } catch (err: unknown) {
      const error = err instanceof Error ? err : new Error(String(err));
      lastError = error;

      const errStr = error.message.toLowerCase();
      if (
        errStr.includes("429") ||
        errStr.includes("quota") ||
        errStr.includes("rate limit") ||
        errStr.includes("resource_exhausted")
      ) {
        circuitBreaker.markExhausted(modelOption.provider, error.message);
        continue; // Try next healthy candidate
      }

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
