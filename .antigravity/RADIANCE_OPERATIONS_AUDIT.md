# RADIANCE PLATFORM — OPERATIONS, OBSERVABILITY & DEVSECOPS AUDIT
**Document ID:** RADIANCE-AUDIT-001  
**Execution Timestamp:** 2026-11-08T16:10:00+05:30  
**Repository:** `https://github.com/TanishBane/Tanixai.git`  
**Active Branch:** `security`  
**Node.js Runtime:** v26.13.0 | **pnpm Version:** 12.18.0 | **Next.js Engine:** 15.5.28 (App Router)

---

## 1. EXECUTIVE SUMMARY & VERIFICATION POSTURE

This audit provides a factual, evidence-backed evaluation of the Radiance AI Productivity Platform codebase prior to executing the DevSecOps and Observability operational suite. Every finding recorded here has been verified through direct filesystem inspection, build telemetry, test suite execution (439 passing tests), and package dependency auditing.

```
┌────────────────────────────────────────────────────────────────────────┐
│                        EVIDENCE STATUS SUMMARY                         │
├────────────────────────────┬─────────────────────────────┬─────────────┤
│ Dimension                  │ Verified Status             │ Grade       │
├────────────────────────────┼─────────────────────────────┼─────────────┤
│ Functional Core & Tests    │ 30 test files / 439 tests   │ PASS (100%) │
│ TypeScript Type Integrity  │ tsc --noEmit: 0 errors      │ PASS (100%) │
│ Code Quality / Linting     │ ESLint Next.js: 0 errors    │ PASS (100%) │
│ Production Build           │ Next.js 15.5.28 App Router  │ PASS        │
│ Initial Client JS Bundle   │ 666 kB First Load JS (/)    │ ATTENTION   │
│ Dependency Security Audit  │ 15 CVE advisories (2 crit)  │ ACTION REQ  │
│ Dependabot Configuration   │ Missing (.github/dep...)    │ ACTION REQ  │
│ CodeQL & Secret Scanning   │ Missing workflows           │ ACTION REQ  │
│ Runtime Observability      │ Sentry not initialized      │ ACTION REQ  │
│ Real-User Performance (CWV)│ Vercel Insights absent      │ ACTION REQ  │
│ AI Telemetry & TTFT        │ Circuit breaker only        │ ACTION REQ  │
│ Health Endpoints           │ Single monolithic /health   │ ACTION REQ  │
└────────────────────────────┴─────────────────────────────┴─────────────┘
```

---

## 2. EXISTING REPOSITORY INFRASTRUCTURE

### 2.1 Technology Stack & Versions
- **Framework:** Next.js 15.5.28 (React 19.0.0, React DOM 19.0.0).
- **Language:** TypeScript 5.8.2 (Strict mode enabled, noEmit passed).
- **Styling:** Tailwind CSS v4.0.12 with `@tailwindcss/postcss`.
- **UI Components:** Headless Radix UI primitives (`dialog`, `dropdown-menu`, `popover`, `slot`, `tooltip`), Motion 12.4.10, Lucide React 0.479.0, Tabler Icons React 3.50.0.
- **AI Core:** Vercel AI SDK 4.1.54, `@ai-sdk/google` (1.1.18), `@ai-sdk/groq` (1.1.14), `@ai-sdk/openai` (1.1.14, powering OpenRouter).
- **Database & Storage:** Supabase PostgreSQL with `@supabase/ssr` (0.5.2) and `@supabase/supabase-js` (2.49.1).
- **Caching & Rate Limiting:** `@upstash/redis` (1.40.0) and `@upstash/ratelimit` (2.2.0) with local token-bucket fallback.
- **Testing:** Vitest 3.0.8, Playwright 1.64.1, Testing Library React 16.2.0, JSDOM 26.0.0.

### 2.2 Hosting and Deployment Target
- **Platform:** Vercel Hosting (App Router, Node.js runtime).
- **Environment Configurations:** Documented in `.env.example`, including Supabase credentials, AI provider keys (Groq, Gemini, OpenRouter), and Upstash Redis.

---

## 3. AUDIT OF EXISTING MONITORING & OBSERVABILITY

### 3.1 Error Monitoring
- **Current State:** Uninitialized. No Sentry SDK (`@sentry/nextjs`) or error tracking platform installed.
- **Gaps:** Unhandled runtime exceptions in Client Components, Server Components, Route Handlers, or AI streaming pipelines are currently logged only to `console.error` without alerting, context tagging, or stack trace symbolication.
- **Privacy Gaps:** If unhandled errors occur during AI inference, raw inputs or attachment names could accidentally leak into server logs without structured redaction.

### 3.2 Health Endpoints
- **Current State:** `/api/health` returns basic JSON containing `process.uptime()`, `platform: "RADIANCE"`, `version`, and model circuit-breaker states.
- **Gaps:**
  - Lacks separation between **Liveness** (process responsiveness) and **Readiness** (database, cache, and provider downstream reachability).
  - No synthetic probes for external uptime monitors (e.g., Better Stack, Pingdom).

### 3.3 AI Infrastructure Observability
- **Current State:** `src/lib/ai/circuit-breaker.ts` tracks provider failure counts and marks providers exhausted if failure thresholds are reached.
- **Gaps:**
  - No measurement of **Time to First Token (TTFT)**.
  - No tracking of total generation latency or streaming duration.
  - No token usage aggregation (input/output tokens) from the AI SDK `onFinish` metadata.
  - No provider health metric aggregation across models.
  - No structured correlation IDs (`x-request-id`) spanning client-to-provider streaming lifecycles.

### 3.4 Web Performance & Real User Metrics
- **Current State:** No Real User Monitoring (RUM) installed.
- **Gaps:** Core Web Vitals (LCP, INP, CLS, FCP, TTFB) are unmeasured in production. Neither `@vercel/speed-insights` nor `@vercel/analytics` is integrated into `src/app/layout.tsx`.
- **Lab Performance:** No automated Lighthouse CI (`@lhci/cli`) or automated bundle threshold checks.

---

## 4. SECURITY & SUPPLY-CHAIN AUDIT

### 4.1 Dependency Security Sweep (`pnpm audit`)
Running `pnpm audit --registry=https://registry.npmjs.org/` against current manifests revealed:
- **Total Advisories:** 15 vulnerabilities (2 Critical, 4 High, 7 Moderate, 2 Low).
- **Key Vulnerability Clusters:**
  1. `tinypool` (<=2.1.0 via Vitest): Prototype pollution gadget leading to Remote Code Execution (GHSA-5gmw-xhrv-c9v3 / GHSA-27wf-h59v-m8pm).
  2. `ai` (<5.0.52): Server-Side Request Forgery / Denial of Service (GHSA-rwvc-j5jr-mgvh).
  3. `@ai-sdk/provider-utils` (<3.0.28): Uncontrolled Resource Consumption (GHSA-866g-f22w-33x8).
- **Assessment:** While Vitest is a devDependency restricted to local execution, the AI SDK vulnerabilities affect server-side API processing. Dependabot must be configured immediately to manage automated patch/minor dependency upgrades.

### 4.2 GitHub Automation & Secret Hardening
- **Dependabot:** Absent. `.github/dependabot.yml` does not exist.
- **CodeQL Scanning:** Absent. No static security scanning configured for TypeScript or GitHub Actions.
- **Dependency Review Action:** Absent. Pull requests do not automatically evaluate newly introduced packages or license violations.
- **GitHub Actions Hardening:** `.github/workflows/ci.yml` lacks explicit minimal `permissions` block, concurrency cancellation for redundant runs, and dependency audit steps.
- **Secret Scanning & Gitleaks:** Repository lacks automated secret scanning workflows.

---

## 5. PERFORMANCE & BUNDLE AUDIT

### 5.1 Baseline Build Measurements (Next.js 15.5.28)
```text
Route (app)                                 Size  First Load JS
┌ ○ /                                     563 kB         666 kB
├ ○ /_not-found                            997 B         104 kB
├ ƒ /api/chat                              133 B         103 kB
├ ƒ /api/followups                         133 B         103 kB
├ ƒ /api/health                            133 B         103 kB
└ ƒ /api/image                             133 B         103 kB
+ First Load JS shared by all             103 kB
  ├ chunks/176-3b9331bcabd2617e.js       46.3 kB
  ├ chunks/ac6068e3-e077f81ec5be1fa0.js  54.2 kB
  └ other shared chunks (total)             2 kB
```
- **Finding:** The home route (`/`) requires **666 kB** of initial JavaScript. Major contributors include `three` (0.174.0, ~400 kB unminified), `katex` (0.19.1), and `mammoth` (1.13.0).
- **Optimization Strategy:** Maintain lazy loading for Three.js canvas components, dynamic imports for document parsers (`mammoth`), and monitor bundle regressions using automated bundle size tracking.

---

## 6. IMPLEMENTATION ROADMAP & PRIORITIES

1. **Phase 1 — Dependabot & Repository Security Gates:**
   - Configure `.github/dependabot.yml` for `npm` (pnpm lockfile) and `github-actions`.
   - Implement `.github/workflows/codeql.yml` for AST static security scanning.
   - Implement `.github/workflows/dependency-review.yml` for PR supply-chain verification.
   - Harden `.github/workflows/ci.yml` with minimal permissions, timeout limits, and concurrency guards.

2. **Phase 2 — Application Error & Performance Tracing (Sentry Next.js):**
   - Integrate `@sentry/nextjs`.
   - Setup `sentry.client.config.ts`, `sentry.server.config.ts`, and `sentry.edge.config.ts`.
   - Wrap `next.config.ts` with `withSentryConfig` preserving all CSP directives.
   - Enforce rigorous privacy filtering in `beforeSend` (strictly redact prompts, responses, files, and session keys).

3. **Phase 3 — Real-User Web Performance (Vercel Speed Insights & Analytics):**
   - Integrate `@vercel/speed-insights` and `@vercel/analytics` into `src/app/layout.tsx`.
   - Update CSP header in `next.config.ts` to allow Vercel telemetry domains.

4. **Phase 4 — Uptime & Dual Health Endpoints:**
   - Implement `/api/health` (Liveness) and `/api/health/ready` (Readiness).
   - Document external uptime integration for Better Stack.

5. **Phase 5 — AI Infrastructure Observability:**
   - Implement `src/lib/observability/ai-telemetry.ts` capturing TTFT, generation latency, provider health, token counts, and circuit breaker status.
   - Instrument `src/app/api/chat/route.ts` with structured telemetry callbacks.

6. **Phase 6 — Structured Logging, Lighthouse CI & Runbooks:**
   - Implement `src/lib/observability/logger.ts` for standardized JSON logging.
   - Configure `.lighthouserc.json` for lab performance testing.
   - Document all operational architectures in `docs/operations/`.
