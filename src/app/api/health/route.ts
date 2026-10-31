import { NextResponse } from "next/server";
import { AVAILABLE_MODELS } from "@/lib/ai/models";
import { circuitBreaker } from "@/lib/ai/circuit-breaker";

export async function GET() {
  const providerStatus = AVAILABLE_MODELS.map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
    isExhausted: circuitBreaker.isExhausted(m.provider),
  }));

  return NextResponse.json({
    status: "healthy",
    platform: "RADIANCE",
    version: "1.0.0",
    uptime: process.uptime(),
    timestamp: Date.now(),
    models: providerStatus,
  });
}
