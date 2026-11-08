import { NextResponse } from "next/server";
import { AVAILABLE_MODELS } from "@/lib/ai/models";
import { circuitBreaker } from "@/lib/ai/circuit-breaker";

export const dynamic = "force-dynamic";

/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RADIANCE PLATFORM — DEPENDENCY READINESS HEALTH CHECK
 * 
 * Verifies that essential operational dependencies (database connection layer,
 * distributed/local cache fallback, and AI model routing) are configured
 * and ready to serve requests.
 * 
 * Never leaks API keys, connection strings, or internal network topology.
 * ═══════════════════════════════════════════════════════════════════════════════
 */
export async function GET() {
  const timestamp = Date.now();

  // 1. Evaluate Supabase Database Configuration Status
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const isDbConfigured = Boolean(
    supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes("your-project") &&
    !supabaseKey.includes("your-supabase")
  );

  // 2. Evaluate Cache / Redis Layer Status
  const isRedisConfigured = Boolean(
    process.env.UPSTASH_REDIS_REST_URL &&
    process.env.UPSTASH_REDIS_REST_TOKEN
  );

  // 3. Evaluate AI Provider Circuit Availability
  const providers = ["groq", "google", "openrouter"] as const;
  const exhaustedProviders = providers.filter((p) => circuitBreaker.isExhausted(p));
  const allProvidersExhausted = exhaustedProviders.length >= providers.length;

  // Determine overall readiness
  const isReady = !allProvidersExhausted;
  const statusCode = isReady ? 200 : 503;

  return NextResponse.json(
    {
      status: isReady ? "ready" : "degraded",
      platform: "RADIANCE",
      timestamp,
      dependencies: {
        database: {
          status: isDbConfigured ? "configured" : "offline_local_fallback",
        },
        cache: {
          status: isRedisConfigured ? "distributed_redis" : "local_memory_fallback",
        },
        aiProviders: {
          status: allProvidersExhausted ? "exhausted" : "operational",
          totalConfigured: AVAILABLE_MODELS.length,
          exhaustedCount: exhaustedProviders.length,
        },
      },
    },
    {
      status: statusCode,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate",
        "X-Radiance-Readiness": isReady ? "ready" : "degraded",
      },
    }
  );
}
