/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * RADIANCE PLATFORM — PRIVACY & DATA SCRUBBING ENGINE
 * 
 * Strict sanitization to prevent sensitive data, prompts, assistant responses,
 * file contents, API tokens, session cookies, and credentials from escaping to
 * Sentry, log aggregators, or external telemetry destinations.
 * ═══════════════════════════════════════════════════════════════════════════════
 */

import type { ErrorEvent, EventHint, Breadcrumb } from "@sentry/nextjs";

const SENSITIVE_KEY_PATTERNS = [
  /prompt/i,
  /message/i,
  /content/i,
  /extractedtext/i,
  /dataurl/i,
  /apikey/i,
  /secret/i,
  /password/i,
  /authorization/i,
  /cookie/i,
  /session/i,
  /anonkey/i,
  /servicekey/i,
  /(?:auth|api|secret|session|bearer|jwt|access|refresh)[_-]?token/i,
  /^token$/i,
];

const SECRET_VALUE_PATTERNS = [
  /gsk_[a-zA-Z0-9_-]{16,}/g,           // Groq API Key
  /AIzaSy[a-zA-Z0-9_-]{20,40}/g,       // Google API Key
  /sk-or-v1-[a-zA-Z0-9_-]{20,}/g,      // OpenRouter Key
  /eyJh[a-zA-Z0-9._-]{40,}/g,          // JWT Tokens
  /sbp_[a-zA-Z0-9_-]{20,}/g,           // Supabase service tokens
];

/**
 * Scrubs any credential or sensitive text token from strings.
 */
export function scrubString(str: string): string {
  if (!str || typeof str !== "string") return str;
  let scrubbed = str;
  for (const pattern of SECRET_VALUE_PATTERNS) {
    scrubbed = scrubbed.replace(pattern, "[REDACTED_CREDENTIAL]");
  }
  return scrubbed;
}

/**
 * Deeply scrubs objects and dictionaries, replacing sensitive keys and tokens.
 */
export function scrubObject<T>(obj: T, depth = 0): T {
  if (depth > 6 || !obj || typeof obj !== "object") {
    if (typeof obj === "string") {
      return scrubString(obj) as unknown as T;
    }
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => scrubObject(item, depth + 1)) as unknown as T;
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const isSensitiveKey = SENSITIVE_KEY_PATTERNS.some((pattern) => pattern.test(key));
    if (isSensitiveKey) {
      result[key] = "[REDACTED_PRIVACY_FIELD]";
    } else if (typeof value === "object" && value !== null) {
      result[key] = scrubObject(value, depth + 1);
    } else if (typeof value === "string") {
      result[key] = scrubString(value);
    } else {
      result[key] = value;
    }
  }

  return result as T;
}

/**
 * Sentry beforeSend hook implementing comprehensive event scrubbing.
 */
export function sanitizeSentryEvent(event: ErrorEvent, _hint?: EventHint): ErrorEvent | null {
  try {
    // 1. Scrub HTTP Request metadata
    if (event.request) {
      if (event.request.headers) {
        delete event.request.headers["authorization"];
        delete event.request.headers["cookie"];
        delete event.request.headers["x-api-key"];
      }
      if (event.request.cookies) {
        event.request.cookies = {};
      }
      if (event.request.data) {
        event.request.data = "[REDACTED_REQUEST_PAYLOAD]";
      }
    }

    // 2. Scrub User context (retain anonymous ID if available, strip email and IP)
    if (event.user) {
      delete event.user.email;
      delete event.user.ip_address;
      delete event.user.username;
    }

    // 3. Scrub Breadcrumbs
    if (event.breadcrumbs && Array.isArray(event.breadcrumbs)) {
      event.breadcrumbs = event.breadcrumbs.map((bc: Breadcrumb) => {
        if (bc.data) {
          bc.data = scrubObject(bc.data);
        }
        if (bc.message) {
          bc.message = scrubString(bc.message);
        }
        return bc;
      });
    }

    // 4. Scrub Extra and Contexts
    if (event.extra) {
      event.extra = scrubObject(event.extra);
    }
    if (event.contexts) {
      event.contexts = scrubObject(event.contexts);
    }

    // 5. Scrub Exception message values
    if (event.exception?.values) {
      event.exception.values.forEach((ex: { value?: string }) => {
        if (ex.value) {
          ex.value = scrubString(ex.value);
        }
      });
    }

    return event;
  } catch {
    // If sanitization fails for any reason, drop the event to fail-safe against leak
    return null;
  }
}
