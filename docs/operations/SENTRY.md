# RADIANCE PLATFORM — SENTRY APPLICATION MONITORING
**Document ID:** RADIANCE-DOC-OPS-005  
**Package:** `@sentry/nextjs` (v11)  
**Configuration Files:**
- `sentry.client.config.ts`
- `sentry.server.config.ts`
- `sentry.edge.config.ts`
- `src/instrumentation.ts`
- `src/lib/observability/privacy.ts`
- `next.config.ts`

---

## 1. RUNTIME COVERAGE

Sentry is integrated across all Next.js 15 App Router execution contexts:
1. **Client / Browser:** Catches uncaught UI exceptions, React rendering crashes, and rejected promises (`sentry.client.config.ts`).
2. **Server / Node.js:** Catches Route Handler failures (`/api/chat`, `/api/image`), server-side rendering exceptions, and circuit breaker events (`sentry.server.config.ts`).
3. **Edge Runtime:** Catches middleware and edge route failures (`sentry.edge.config.ts`).
4. **Next.js 15 Request Error Hook:** Wrapped via `onRequestError = Sentry.captureRequestError` in `src/instrumentation.ts`.

---

## 2. PRIVACY & DATA SCRUBBING ENGINE (`src/lib/observability/privacy.ts`)

Radiance strictly adheres to user privacy invariants. The `sanitizeSentryEvent` beforeSend hook executes on every captured event:

- **Headers:** Strips `authorization`, `cookie`, `x-api-key`.
- **Cookies:** Empty object enforced; no session cookies (`sb-*`) transmitted.
- **Payload Data:** Request data payloads marked `[REDACTED_REQUEST_PAYLOAD]`.
- **User PII:** Strips `email`, `ip_address`, `username`.
- **Breadcrumbs:** Deep-scrubs all breadcrumbs, stripping prompts, messages, and base64 URLs.
- **Secret Values:** Automatic regex redaction of Groq keys (`gsk_*`), Gemini keys (`AIzaSy*`), OpenRouter keys (`sk-or-v1*`), and Supabase service tokens.

---

## 3. REVERSE-PROXY TUNNELING & CSP

To avoid ad-blocker interference and ensure zero client-side connection friction:
- `next.config.ts` defines `tunnelRoute: "/monitoring"`.
- Content-Security-Policy (CSP) allows `https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.us.sentry.io` under `connect-src`.

---

## 4. ENVIRONMENT SETUP CHECKLIST

Add to `.env.local` or Vercel Environment Variables:
```bash
# Public Client DSN
NEXT_PUBLIC_SENTRY_DSN="https://examplePublicKey@o0.ingest.sentry.io/0"

# Optional Server DSN override
SENTRY_DSN="https://examplePublicKey@o0.ingest.sentry.io/0"

# Build-time Source Map Uploads (CI only)
SENTRY_ORG="radiance-ai"
SENTRY_PROJECT="radiance-web"
SENTRY_AUTH_TOKEN="sntrys_your_auth_token_here"
```

> [!NOTE]
> If `SENTRY_DSN` is empty, Sentry remains dormant without throwing errors, enabling frictionless local offline development.
