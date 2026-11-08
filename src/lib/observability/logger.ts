/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RADIANCE PLATFORM — STRUCTURED JSON OBSERVABILITY LOGGER
 * 
 * High-performance, zero-dependency structured logger that emits RFC 5424-aligned
 * JSON log entries suitable for ingestion by Datadog, Better Stack, Axiom,
 * Vercel Log Drains, or local CLI inspection.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import { scrubObject, scrubString } from "./privacy";

export type LogLevel = "debug" | "info" | "warn" | "error";

export interface LogContext {
  service?: string;
  environment?: string;
  requestId?: string;
  traceId?: string;
  route?: string;
  operation?: string;
  durationMs?: number;
  status?: number | string;
  errorCategory?: string;
  [key: string]: unknown;
}

export interface StructuredLogRecord extends LogContext {
  timestamp: string;
  level: LogLevel;
  message: string;
}

class RadianceLogger {
  private serviceName = "radiance";
  private environment = process.env.NODE_ENV || "development";

  private formatRecord(level: LogLevel, message: string, context?: LogContext): string {
    const scrubbedMessage = scrubString(message);
    const scrubbedContext = context ? scrubObject(context) : {};

    const record: StructuredLogRecord = {
      timestamp: new Date().toISOString(),
      level,
      service: this.serviceName,
      environment: this.environment,
      message: scrubbedMessage,
      ...scrubbedContext,
    };

    return JSON.stringify(record);
  }

  debug(message: string, context?: LogContext): void {
    if (this.environment === "development" || process.env.DEBUG === "true") {
      console.debug(this.formatRecord("debug", message, context));
    }
  }

  info(message: string, context?: LogContext): void {
    console.info(this.formatRecord("info", message, context));
  }

  warn(message: string, context?: LogContext): void {
    console.warn(this.formatRecord("warn", message, context));
  }

  error(message: string, error?: Error | unknown, context?: LogContext): void {
    const errorDetails: Record<string, unknown> = {};
    if (error instanceof Error) {
      errorDetails.errorName = error.name;
      errorDetails.errorMessage = scrubString(error.message);
      // Omit stack trace in production client-facing logs; scrub in server logs
      if (this.environment !== "production") {
        errorDetails.stack = scrubString(error.stack || "");
      }
    } else if (error) {
      errorDetails.rawError = scrubObject(error);
    }

    console.error(
      this.formatRecord("error", message, {
        ...context,
        ...errorDetails,
      })
    );
  }
}

export const logger = new RadianceLogger();
