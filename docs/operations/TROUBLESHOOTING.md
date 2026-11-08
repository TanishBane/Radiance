# RADIANCE PLATFORM — OPERATIONS TROUBLESHOOTING GUIDE
**Document ID:** RADIANCE-DOC-OPS-015  

---

## 1. COMMON OPERATIONAL ISSUES & RESOLUTIONS

### Issue 1: `429 Rate Limit Exceeded` on `/api/chat`
- **Cause:** Upstash Redis token bucket or local token bucket limit reached (default 10 requests / 10 seconds), or upstream provider quota reached.
- **Resolution:**
  - Inspect response header `Retry-After`. Wait for cooldown period.
  - Check `X-Radiance-Provider` and `X-Radiance-Model` response headers.
  - If Upstash Redis is returning errors, Radiance gracefully fails over to the local in-memory token bucket.

### Issue 2: Next.js Build Fails with Sentry Source Map Upload Warning
- **Cause:** `SENTRY_AUTH_TOKEN` is not set in local development or CI build.
- **Resolution:**
  - In `next.config.ts`, `silent: !process.env.CI` suppresses build-time warnings when building locally without Sentry credentials.
  - For CI builds, configure `SENTRY_AUTH_TOKEN`, `SENTRY_ORG`, and `SENTRY_PROJECT` in repository GitHub Secrets.

### Issue 3: Content Security Policy (CSP) Violations in Browser Console
- **Cause:** Third-party scripts or connections blocked by strict CSP header in `next.config.ts`.
- **Resolution:**
  - Verify that external assets are registered in `next.config.ts`:
    - Sentry: `https://*.sentry.io https://*.ingest.sentry.io https://*.ingest.us.sentry.io`
    - Vercel Analytics: `https://va.vercel-scripts.com`
    - Vercel Speed Insights: `https://vitals.vercel-insights.com`
    - Image generation: `https://image.pollinations.ai`

### Issue 4: Vitest Canvas Context Not Implemented Warning
- **Cause:** JSDOM environment does not implement HTML5 `<canvas>` 2D/WebGL context without native binary bindings.
- **Resolution:**
  - Expected behavior during test execution for Three.js background atmospheric particles.
  - Unit tests gracefully bypass canvas rendering in headless DOM environments.

### Issue 5: Health Check `/api/health/ready` Returns 503
- **Cause:** All configured AI inference providers are currently marked exhausted in the circuit breaker.
- **Resolution:**
  - Inspect `/api/health` diagnostics to identify exhausted providers.
  - Verify network connectivity to `api.groq.com`, `generativelanguage.googleapis.com`, and `openrouter.ai`.
  - Circuit breaker automatically resets after the 30-second backoff threshold.
