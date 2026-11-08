import { NextResponse } from "next/server";
import { AVAILABLE_MODELS } from "@/lib/ai/models";
import { circuitBreaker } from "@/lib/ai/circuit-breaker";
import { aiTelemetry } from "@/lib/observability/ai-telemetry";

export const dynamic = "force-dynamic";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RADIANCE PLATFORM — APPLICATION LIVENESS HEALTH CHECK
 * 
 * Verifies that the Next.js process is active, responding, and non-blocked.
 * Returns basic process diagnostics and AI provider circuit states without
 * exposing credentials or sensitive internal infrastructure.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export async function GET() {
  const providerStatus = AVAILABLE_MODELS.map((m) => ({
    id: m.id,
    name: m.name,
    provider: m.provider,
    isExhausted: circuitBreaker.isExhausted(m.provider),
  }));

  const mem = process.memoryUsage();
  const metrics = aiTelemetry.getSnapshot();

  return NextResponse.json(
    {
      status: "healthy",
      platform: "RADIANCE",
      version: "1.0.0",
      uptime: process.uptime(),
      timestamp: Date.now(),
      models: providerStatus,
      diagnostics: {
        memory: {
          rssMb: Math.round(mem.rss / 1024 / 1024),
          heapUsedMb: Math.round(mem.heapUsed / 1024 / 1024),
        },
        aiObservability: {
          totalRequests: metrics.totalRequests,
          successfulRequests: metrics.successfulRequests,
          failedRequests: metrics.failedRequests,
          averageTtftMs: metrics.averageTtftMs,
        },
      },
    },
    {
      status: 200,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Radiance-Service": "healthy",
      },
    }
  );
}
