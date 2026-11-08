# RADIANCE PLATFORM — AI INFRASTRUCTURE OBSERVABILITY
**Document ID:** RADIANCE-DOC-OPS-010  
**Module:** `src/lib/observability/ai-telemetry.ts`  
**API Integration:** `src/app/api/chat/route.ts`  

---

## 1. MULTI-PROVIDER LIFECYCLE TELEMETRY

Radiance relies on an intelligent multi-provider routing matrix (Groq, Google Gemini, OpenRouter) with automatic circuit breaking. The AI Observability engine tracks every inference lifecycle without leaking user prompts:

```
User Prompt (Client)
        │
        ▼
[ POST /api/chat ] ──> Generate Request ID (x-request-id)
        │
        ▼
[ aiTelemetry.startRequest() ] (Records startTime, provider, modelId)
        │
        ▼
[ streamText Execution ]
  ├─ onChunk() ──────────> aiTelemetry.recordFirstToken() (Captures TTFT in ms)
  ├─ onFinish() ─────────> aiTelemetry.completeSuccess() (Captures prompt/completion tokens, total latency)
  └─ onError() ──────────> aiTelemetry.recordFailure() (Classifies error: 429, quota, timeout, context)
        │
        ▼
[ Circuit Breaker Failover ] (If 429 / quota, try next candidate & record fallbackOccurred)
        │
        ▼
[ Response Headers ] ──> X-Request-ID, X-Radiance-Provider, X-Radiance-Model
```

---

## 2. METRICS & AGGREGATIONS (`aiTelemetry.getSnapshot()`)

The telemetry engine maintains an in-memory ring-buffer (last 100 requests) and running metrics:

- `totalRequests`: Total requests across all models.
- `successfulRequests`: Finished inferences.
- `failedRequests`: Unrecoverable errors.
- `fallbackCount`: Times a circuit breaker routed to a secondary candidate.
- `averageTtftMs`: Running average Time to First Token.
- `averageLatencyMs`: Running average total stream duration.
- `totalTokensInput` / `totalTokensOutput`: Aggregated token volume reported by providers.
- `requestsByProvider` & `requestsByModel`: Traffic distribution across Groq, Gemini, and OpenRouter.
- `errorsByCategory`: Categorized count of `rate_limit_429`, `quota_exceeded`, `network_timeout`, `context_length_exceeded`, and `auth_error`.

---

## 3. ZERO DATA LEAKAGE GUARANTEE

- Raw prompts and generated texts are **never** stored in telemetry memory or emitted to log drains.
- Only request IDs, model names, numeric durations, token integers, and error classifications are tracked.
- Telemetry data is isolated on the server and exposed only via authenticated diagnostics or internal health endpoints.
