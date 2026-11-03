# RADIANCE — REMEDIATION PLAN & CHECKLIST

**Mission ID:** RADIANCE-REMEDIATION-001  
**Target Branch:** `feature/radiance-platform-transformation`  
**Checkpoint Branch:** `checkpoint/pre-remediation-001`  
**Status:** IN PROGRESS (Evidence-Driven Corrective Engineering)  
**Date:** 2026-11-01  

---

## 1. VERIFIED REMEDIATION MATRIX

| ID | Issue | Actual Evidence | Severity | Planned Correction | Verification |
|---|---|---|---|---|---|
| **REM-P0-01** | Retired/Deprecated AI Model IDs | `models.ts` lists `llama-3.1-8b-instant`, `gemini-1.5-flash-latest`, `gemini-1.5-pro-latest`, `gemini-2.5-flash` without strict upstream capabilities separation | **P0** | Redesign typed model registry (`src/lib/ai/models.ts`) separating internal keys from active upstream IDs (`llama-3.3-70b-versatile`, `gemini-2.5-flash`, `gemini-2.5-pro`, `openrouter/meta-llama/llama-3.3-70b-instruct`) with capability metadata and last verified date | Model registry unit tests (`tests/unit/models.test.ts`) verifying capabilities and active statuses |
| **REM-P0-02** | Instance-Local In-Memory Rate Limiter in Serverless Context | `src/lib/security/rate-limiter.ts` uses local `Map<string, RateLimitBucket>` which resets across serverless lambda instances | **P0** | Implement distributed layered rate limiting supporting Upstash Redis via `@upstash/ratelimit` with fail-safe local fallback and client IP derivation from trusted headers (`x-real-ip`, `x-vercel-forwarded-for`) | Rate limiter test suite verifying distributed and fallback token bucket behaviors |
| **REM-P0-03** | Unprotected Image Generation Endpoint | `src/app/api/image/route.ts` lacks rate limiting, authentication awareness, and upstream timeout/abuse controls | **P0** | Add rate limiting, strict prompt sanitization, timeout aborts, and size bounds to `/api/image` | Test suite covering invalid payloads, rate limit rejection, and timeout handling |
| **REM-P0-04** | Obsolete AI SDK Stream Response Method | `src/app/api/chat/route.ts` uses legacy `toDataStreamResponse()` instead of modern structured UI message stream handling | **P0** | Modernize route handler with clean UI Message SSE format, cancellation hooks, and error masking | Integration test verifying SSE headers, chunk delivery, and client abort |
| **REM-P1-01** | Missing Supabase SSR Auth Integration | `src/lib/db/client.ts` uses raw `createClient` without cookie management or PKCE flow | **P1** | Implement `@supabase/ssr` browser (`createBrowserClient`) and server (`createServerClient`) utilities with cookie forwarding and session validation | Auth integration tests verifying cookie handling and server session resolution |
| **REM-P1-02** | Incomplete Cloud Conversation Persistence Layer | SQL migration exists, but no server/client repository services exist to persist conversations, messages, and attachments to Supabase | **P1** | Build `src/lib/db/conversations.ts`, `src/lib/db/messages.ts`, and `src/lib/db/attachments.ts` with optimistic sync and RLS verification | Database repository tests verifying CRUD, ownership checks, and error rollback |
| **REM-P1-03** | Incomplete Document Parsing (DOCX/PDF Binary Ingestion) | `chat-composer.tsx` reads text files but lacks binary DOCX parsing (Mammoth) and structured PDF text extraction | **P1** | Integrate server/client document parsing for DOCX (via `mammoth`) and PDF with page/size safety limits | Unit tests for text extraction from DOCX and PDF fixtures |
| **REM-P1-04** | Monolithic `src/app/page.tsx` Component Architecture | `src/app/page.tsx` has 513 lines managing UI, state, streaming, history, shortcuts, and modal triggers | **P1** | Refactor into feature-driven modules under `src/features/chat/`: `useChatSession`, `useChatStream`, and `ChatWorkspace` | Verification that `src/app/page.tsx` is thin (<100 lines), tests passing |
| **REM-P1-05** | Fragile CSP & Security Headers | `next.config.ts` requires review for connect-src domains (Upstash, Supabase, Pollinations) and script-src nonces | **P1** | Update CSP headers in `next.config.ts` to strictly allow authorized origins without `'unsafe-eval'` | Automated header audit test verifying CSP policy |
| **REM-P2-01** | Limited Test Coverage (Only 9 Unit Tests) | Only 3 test files exist in `tests/unit/` covering format, storage, and circuit breaker | **P2** | Expand test suite to >=25 tests covering models, rate limiter, auth, document ingestion, and API routes | `vitest run` with all tests passing and exit code 0 |
| **REM-P2-02** | Missing End-to-End Test Suite | No Playwright configuration or E2E tests exist for browser-level user workflows | **P2** | Configure `playwright.config.ts` and write E2E tests covering chat workspace, model switching, and hotkeys | Playwright test execution in headless mode |
| **REM-P2-03** | Missing CI/CD Pipeline | No GitHub Actions workflow exists for automated build, lint, and test validation on PRs | **P2** | Create `.github/workflows/ci.yml` running typecheck, lint, test, and build with pnpm caching | Local workflow linting and verification |
| **REM-P2-04** | Three.js Lifecycle & WebGL Context Loss Handling | `ambient-canvas.tsx` needs formal WebGL context restoration and graceful CSS fallback | **P2** | Harden WebGL context loss listeners and resource disposal in Three.js canvas | Component render test verifying fallback behavior |

---

## 2. EXECUTION PHASES ORDER

1. **Phase 1: P0 Critical Corrections**
   - Redesign model registry and capability routing (`src/lib/ai/models.ts`, `src/lib/ai/providers.ts`).
   - Implement distributed rate limiting with Upstash and local fallback (`src/lib/security/rate-limiter.ts`).
   - Harden Image Generation Route (`src/app/api/image/route.ts`).
   - Modernize AI streaming route (`src/app/api/chat/route.ts`).
2. **Phase 2: P1 Core Platform Services**
   - Supabase SSR Auth & Cookie handling (`src/lib/db/client.ts`, `src/lib/db/auth.ts`).
   - Database repository layer (`src/lib/db/conversations.ts`, `src/lib/db/messages.ts`).
   - Document processing engine (`src/lib/documents/parser.ts` with Mammoth).
   - Frontend architecture refactor (`src/features/chat/`).
3. **Phase 3: P2 Reliability, Observability & Testing**
   - Expand unit and integration test suite in `tests/`.
   - Setup Playwright E2E configuration and tests.
   - Setup GitHub Actions CI workflow.
   - WebGL Three.js cleanup hardening.
4. **Phase 4: Documentation & Final Verification**
   - Update all `.antigravity/` persistent documents.
   - Run full verification suite (`tsc`, `lint`, `test`, `build`).
   - Produce final master report.
