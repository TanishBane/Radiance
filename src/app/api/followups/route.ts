import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateFollowupQuestions } from "@/lib/ai/followups";
import { checkRateLimit, getTrustedClientIp } from "@/lib/security/rate-limiter";
import { UI_LANGUAGES } from "@/lib/i18n/ui";

export const runtime = "nodejs";

const FollowupRequestSchema = z.object({
  userTurn: z.string().max(2000).optional().default(""),
  assistantReply: z.string().min(1).max(10000),
  language: z.enum(UI_LANGUAGES).optional().default("en"),
});

export async function POST(req: NextRequest) {
  // 1. Layered Rate Limiting
  const clientIp = getTrustedClientIp(req.headers);
  const rateLimit = await checkRateLimit(clientIp, "chat");
  if (!rateLimit.success) {
    return NextResponse.json({ questions: [] }, { status: 429 });
  }

  // 2. Validate Payload
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ questions: [] }, { status: 400 });
  }

  const parsed = FollowupRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ questions: [] }, { status: 400 });
  }

  try {
    const questions = await generateFollowupQuestions(
      parsed.data.userTurn,
      parsed.data.assistantReply,
      parsed.data.language
    );
    return NextResponse.json({ questions });
  } catch (err) {
    console.warn("[FollowupsAPI] Error generating follow-ups:", err);
    return NextResponse.json({ questions: [] });
  }
}
