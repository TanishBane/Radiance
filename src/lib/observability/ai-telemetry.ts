/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RADIANCE PLATFORM — AI INFRASTRUCTURE OBSERVABILITY & TELEMETRY
 * 
 * Provider-agnostic telemetry engine that measures TTFT (Time to First Token),
 * total generation latency, token volume (input/output), streaming health,
 * failover events, and error classifications with ZERO prompt or message leakage.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { logger } from "./logger";

export type AIRequestCategory = "chat" | "multimodal" | "image" | "followup";

export type AIRequestStatus = "success" | "failed" | "aborted" | "fallback";

export type AIErrorCategory =
  | "rate_limit_429"
  | "quota_exceeded"
  | "network_timeout"
  | "context_length_exceeded"
  | "auth_error"
  | "circuit_breaker_open"
  | "client_abort"
  | "unknown";

export interface AIRequestTelemetry {
  requestId: string;
  provider: string;
  modelId: string;
  category: AIRequestCategory;
  startTime: number;
  firstTokenTime?: number;
  endTime?: number;
  durationMs?: number;
  ttftMs?: number;
  status: AIRequestStatus;
  errorCategory?: AIErrorCategory;
  errorMessage?: string;
  retryCount: number;
  fallbackOccurred: boolean;
  tokensInput?: number;
  tokensOutput?: number;
  totalTokens?: number;
}

export interface AIMetricsSnapshot {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  abortedRequests: number;
  fallbackCount: number;
  averageTtftMs: number;
  averageLatencyMs: number;
  totalTokensInput: number;
  totalTokensOutput: number;
  requestsByProvider: Record<string, number>;
  requestsByModel: Record<string, number>;
  errorsByCategory: Record<string, number>;
  recentTelemetry: AIRequestTelemetry[];
}

class AITelemetryTracker {
  private static MAX_RECENT_BUFFER = 100;
  private recentRecords: AIRequestTelemetry[] = [];
  
  // Aggregated Counters
  private totalRequests = 0;
  private successfulRequests = 0;
  private failedRequests = 0;
  private abortedRequests = 0;
  private fallbackCount = 0;
  private sumTtftMs = 0;
  private countTtft = 0;
  private sumLatencyMs = 0;
  private totalTokensInput = 0;
  private totalTokensOutput = 0;

  private providerCounts: Record<string, number> = {};
  private modelCounts: Record<string, number> = {};
  private errorCategoryCounts: Record<string, number> = {};

  /**
   * Categorizes upstream error messages into structured classification buckets.
   */
  classifyError(err: unknown): AIErrorCategory {
    if (!err) return "unknown";
    const msg = (err instanceof Error ? err.message : String(err)).toLowerCase();

    if (msg.includes("429") || msg.includes("rate limit") || msg.includes("resource_exhausted")) {
      return "rate_limit_429";
    }
    if (msg.includes("quota") || msg.includes("credit") || msg.includes("insufficient_quota")) {
      return "quota_exceeded";
    }
    if (msg.includes("timeout") || msg.includes("etimedout") || msg.includes("econnaborted")) {
      return "network_timeout";
    }
    if (msg.includes("maximum context length") || msg.includes("too long") || msg.includes("token limit")) {
      return "context_length_exceeded";
    }
    if (msg.includes("unauthorized") || msg.includes("401") || msg.includes("403") || msg.includes("api key")) {
      return "auth_error";
    }
    if (msg.includes("abort") || msg.includes("canceled")) {
      return "client_abort";
    }
    if (msg.includes("circuit breaker") || msg.includes("exhausted")) {
      return "circuit_breaker_open";
    }

    return "unknown";
  }

  /**
   * Initializes a new telemetry record for an in-flight AI generation request.
   */
  startRequest(
    requestId: string,
    provider: string,
    modelId: string,
    category: AIRequestCategory = "chat"
  ): AIRequestTelemetry {
    this.totalRequests++;
    this.providerCounts[provider] = (this.providerCounts[provider] || 0) + 1;
    this.modelCounts[modelId] = (this.modelCounts[modelId] || 0) + 1;

    return {
      requestId,
      provider,
      modelId,
      category,
      startTime: Date.now(),
      status: "success",
      retryCount: 0,
      fallbackOccurred: false,
    };
  }

  /**
   * Records the arrival of the first token chunk (Time to First Token).
   */
  recordFirstToken(telemetry: AIRequestTelemetry): void {
    if (!telemetry.firstTokenTime) {
      telemetry.firstTokenTime = Date.now();
      telemetry.ttftMs = telemetry.firstTokenTime - telemetry.startTime;
      this.sumTtftMs += telemetry.ttftMs;
      this.countTtft++;
    }
  }

  /**
   * Completes a successful AI request and updates running metrics.
   */
  completeSuccess(
    telemetry: AIRequestTelemetry,
    usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number }
  ): void {
    telemetry.endTime = Date.now();
    telemetry.durationMs = telemetry.endTime - telemetry.startTime;
    telemetry.status = "success";

    if (usage) {
      telemetry.tokensInput = usage.promptTokens;
      telemetry.tokensOutput = usage.completionTokens;
      telemetry.totalTokens = usage.totalTokens || ((usage.promptTokens || 0) + (usage.completionTokens || 0));

      this.totalTokensInput += telemetry.tokensInput || 0;
      this.totalTokensOutput += telemetry.tokensOutput || 0;
    }

    this.successfulRequests++;
    this.sumLatencyMs += telemetry.durationMs;
    this.pushRecord(telemetry);

    logger.info(`[AI Observability] Inference completed`, {
      requestId: telemetry.requestId,
      provider: telemetry.provider,
      model: telemetry.modelId,
      ttftMs: telemetry.ttftMs,
      durationMs: telemetry.durationMs,
      tokensInput: telemetry.tokensInput,
      tokensOutput: telemetry.tokensOutput,
      status: "success",
    });
  }

  /**
   * Records a failed AI generation request or failover step.
   */
  recordFailure(
    telemetry: AIRequestTelemetry,
    error: unknown,
    isFallback = false
  ): void {
    telemetry.endTime = Date.now();
    telemetry.durationMs = telemetry.endTime - telemetry.startTime;
    telemetry.status = isFallback ? "fallback" : "failed";
    telemetry.errorCategory = this.classifyError(error);
    telemetry.errorMessage = error instanceof Error ? error.message.slice(0, 200) : String(error).slice(0, 200);

    if (isFallback) {
      this.fallbackCount++;
      telemetry.fallbackOccurred = true;
    } else {
      this.failedRequests++;
      this.errorCategoryCounts[telemetry.errorCategory] =
        (this.errorCategoryCounts[telemetry.errorCategory] || 0) + 1;
    }

    this.pushRecord(telemetry);

    logger.warn(`[AI Observability] Inference ${isFallback ? "failover triggered" : "failed"}`, {
      requestId: telemetry.requestId,
      provider: telemetry.provider,
      model: telemetry.modelId,
      errorCategory: telemetry.errorCategory,
      durationMs: telemetry.durationMs,
      isFallback,
    });
  }

  /**
   * Records a client-initiated cancellation (AbortController).
   */
  recordAbort(telemetry: AIRequestTelemetry): void {
    telemetry.endTime = Date.now();
    telemetry.durationMs = telemetry.endTime - telemetry.startTime;
    telemetry.status = "aborted";
    telemetry.errorCategory = "client_abort";
    this.abortedRequests++;

    this.pushRecord(telemetry);

    logger.info(`[AI Observability] Inference aborted by client`, {
      requestId: telemetry.requestId,
      provider: telemetry.provider,
      model: telemetry.modelId,
      durationMs: telemetry.durationMs,
    });
  }

  /**
   * Retains recent telemetry in a ring-buffer without persisting prompts or sensitive payloads.
   */
  private pushRecord(record: AIRequestTelemetry): void {
    if (this.recentRecords.length >= AITelemetryTracker.MAX_RECENT_BUFFER) {
      this.recentRecords.shift();
    }
    this.recentRecords.push({ ...record });
  }

  /**
   * Returns a point-in-time metrics snapshot for dashboards and health endpoints.
   */
  getSnapshot(): AIMetricsSnapshot {
    const avgTtft = this.countTtft > 0 ? Math.round(this.sumTtftMs / this.countTtft) : 0;
    const avgLatency =
      this.successfulRequests > 0 ? Math.round(this.sumLatencyMs / this.successfulRequests) : 0;

    return {
      totalRequests: this.totalRequests,
      successfulRequests: this.successfulRequests,
      failedRequests: this.failedRequests,
      abortedRequests: this.abortedRequests,
      fallbackCount: this.fallbackCount,
      averageTtftMs: avgTtft,
      averageLatencyMs: avgLatency,
      totalTokensInput: this.totalTokensInput,
      totalTokensOutput: this.totalTokensOutput,
      requestsByProvider: { ...this.providerCounts },
      requestsByModel: { ...this.modelCounts },
      errorsByCategory: { ...this.errorCategoryCounts },
      recentTelemetry: [...this.recentRecords].reverse(),
    };
  }
}

export const aiTelemetry = new AITelemetryTracker();
