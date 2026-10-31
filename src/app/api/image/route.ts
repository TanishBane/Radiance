import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { checkRateLimit, getTrustedClientIp } from "@/lib/security/rate-limiter";

export const runtime = "nodejs";

const ImageGenSchema = z.object({
  prompt: z
    .string()
    .min(1, "Prompt cannot be empty")
    .max(1000, "Prompt exceeds 1000 character maximum")
    .regex(/^[^\0<>]+$/, "Prompt contains invalid characters"),
  width: z.number().int().min(256).max(1024).default(768),
  height: z.number().int().min(256).max(1024).default(768),
  seed: z.number().int().min(0).max(2147483647).optional(),
});

export async function POST(req: NextRequest) {
  // 1. Layered Rate Limiting
  const clientIp = getTrustedClientIp(req.headers);
  const rateLimit = await checkRateLimit(clientIp, "image");

  if (!rateLimit.success) {
    return NextResponse.json(
      {
        error: "Image generation rate limit exceeded. Please wait before creating another image.",
        retryAfter: rateLimit.retryAfter,
      },
      {
        status: 429,
        headers: {
          "Retry-After": String(rateLimit.retryAfter || 15),
          "X-RateLimit-Distributed": String(rateLimit.isDistributed),
        },
      }
    );
  }

  // 2. Validate Payload
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON payload" }, { status: 400 });
  }

  const parsed = ImageGenSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Validation failed",
        issues: parsed.error.issues,
      },
      { status: 400 }
    );
  }

  const { prompt, width, height, seed } = parsed.data;
  const finalSeed = seed ?? Math.floor(Math.random() * 1000000);
  const sanitizedPrompt = encodeURIComponent(prompt.trim());

  // Safe Pollinations Flux CDN target
  const imageUrl = `https://image.pollinations.ai/prompt/${sanitizedPrompt}?model=flux&width=${width}&height=${height}&nologo=true&enhance=true&seed=${finalSeed}`;

  return NextResponse.json({
    imageUrl,
    seed: finalSeed,
    prompt: prompt.trim(),
    dimensions: { width, height },
    timestamp: Date.now(),
  });
}
