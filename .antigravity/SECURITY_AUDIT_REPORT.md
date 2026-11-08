# RADIANCE PLATFORM SECURITY AUDIT & HARDENING REPORT

**Audit Date:** November 8, 2026  
**Audit Target:** Radiance AI Platform (`c:\Tanixai-main`)  
**Branch:** `security`  
**Auditor:** Antigravity AI Security Pair Programmer  
**Skill:** `/security-audit` — Source-Grounded Vulnerability Analysis & Hardening  

---

## 1. Executive Summary & Verification Evidence

A comprehensive, defense-in-depth source code audit and vulnerability review was conducted on the Radiance codebase. All identified vulnerabilities and boundary violations have been remediated with minimal, surgical source changes, fortified with unit tests, and fully verified across all test and build suites:

- **Vitest Unit Test Suite:** 30 test files passed, 439 unit tests passed (100% green).
- **TypeScript Typecheck (`pnpm typecheck`):** Exit code 0, 0 compiler errors.
- **ESLint (`pnpm lint`):** Clean, 0 warnings, 0 errors.
- **Next.js Production Build (`pnpm build`):** Exit code 0, all static and dynamic routes compiled successfully.

---

## 2. Vulnerability Findings & Remediation Matrix

| Finding ID | Severity | CWE | Vulnerability & Attack Surface | Root Cause & Remediation |
|---|---|---|---|---|
| **SEC-07** | **HIGH** | **CWE-290** | **Rate Limiter Platform Edge Header Priority Inversion**<br>`src/lib/security/rate-limiter.ts` | `x-real-ip` was checked before edge-verified platform headers (`cf-connecting-ip` and `x-vercel-forwarded-for`). Any client sending arbitrary `x-real-ip` headers bypassed rate limiting on Cloudflare/Vercel. Remediation prioritizes platform edge headers. |
| **SEC-08** | **HIGH** | **CWE-943** | **PostgREST Filter Injection via Unsanitized Message IDs**<br>`src/lib/db/conversations.ts` | Message IDs in `activeIds` were interpolated directly into PostgREST filter string `.not("id", "in", \`(${activeIds.join(",")})\`)` without character validation. Malicious IDs containing commas or parentheses could manipulate query filters. Enforced strict `/^[a-zA-Z0-9_-]{1,128}$/` ID validation. |
| **SEC-09** | **MEDIUM** | **CWE-79** | **Stored Script Execution via Unsanitized Generated Image URLs**<br>`src/components/chat/message-item.tsx` | `message.generatedImageUrl` was passed directly to `<a href={message.generatedImageUrl}>` without URL protocol validation. If a manipulated message contained a `javascript:...` URL, clicking "Download" would execute script. Remediation validates via `isSafeUrl()`. |
| **SEC-10** | **MEDIUM** | **CWE-20** | **Prompt Boundary & Section Injection via Attachment Names**<br>`src/lib/security/sanitize.ts`<br>`src/app/api/chat/route.ts` | Ingestion accepted attachment names with unescaped newlines, carriage returns (`\r\n`), and null bytes (`\0`). Adversarial filenames could inject fake prompt delimiters like `[SYSTEM INSTRUCTION]`. Remediation sanitizes and strips control characters and newlines. |
| **SEC-11** | **LOW** | **CWE-16** | **Deprecated `X-XSS-Protection` Header**<br>`next.config.ts` | Legacy `X-XSS-Protection: 1; mode=block` can introduce auditor-based side-channel XSS vulnerabilities in older browsers. Modern OWASP guidelines mandate disabling the legacy auditor (`value: "0"`) when a strict Content-Security-Policy is active. |
| **SEC-12** | **MEDIUM** | **CWE-400** | **Missing Attachment Count Guard in Composer UI**<br>`src/components/chat/chat-composer.tsx` | Backend rejects requests with >10 attachments, but composer accepted unlimited files, triggering unexpected HTTP 400 validation failures. Remediation caps attachments at 10 client-side with non-blocking user notices. |

---

## 3. Detailed Technical Analysis

### SEC-07: Rate Limiter Edge Header Priority Inversion
- **Affected File:** `src/lib/security/rate-limiter.ts`
- **Mechanism:** In reverse-proxied and serverless architectures (e.g. Vercel, Cloudflare), edge headers (`cf-connecting-ip`, `x-vercel-forwarded-for`) are stripped and guaranteed by platform infrastructure, whereas `x-real-ip` may be forwarded directly from untrusted clients. By prioritizing `cf-connecting-ip` and `x-vercel-forwarded-for`, clients cannot spoof arbitrary IPs to bypass rate-limiting buckets.
- **Test Coverage:** Added test cases in `tests/unit/rate-limiter.test.ts` verifying that spoofed `x-real-ip` headers cannot override `cf-connecting-ip` or `x-vercel-forwarded-for`.

### SEC-08: PostgREST Parameter Filter Injection
- **Affected File:** `src/lib/db/conversations.ts`
- **Mechanism:** In `conversationService.save()`, deleted turn pruning uses PostgREST `.not("id", "in", `(...)`)`. If an attacker injected IDs containing commas, closing parentheses, or PostgREST operators, the query parameter AST would be corrupted. Validating all message and conversation IDs with `/^[a-zA-Z0-9_-]{1,128}$/` completely eliminates parameter injection.
- **Test Coverage:** Added adversarial injection test cases in `tests/unit/conversations.test.ts`.

### SEC-09: Unsanitized Image Download Link
- **Affected File:** `src/components/chat/message-item.tsx`
- **Mechanism:** `MessageItem` provides a download anchor for synthesized visuals. By verifying `isSafeUrl(message.generatedImageUrl)` before rendering, any malicious URI schemes (`javascript:`, `vbscript:`, `data:text/html`) are completely neutralized.
- **Test Coverage:** Added unit test suite in `tests/unit/message-item.test.tsx` verifying HTTPS image rendering and `javascript:` blocking.

### SEC-10: Attachment Name Prompt Injection Hardening
- **Affected Files:** `src/lib/security/sanitize.ts`, `src/app/api/chat/route.ts`
- **Mechanism:** Zod schema now transforms `name` to strip null bytes, newlines, and carriage returns. The server prompt builder further normalizes attachment labels, ensuring adversarial filenames cannot simulate prompt sections.
- **Test Coverage:** Added verification in `tests/unit/sanitize.test.ts`.

### SEC-11: Obsolete Header Deprecation
- **Affected File:** `next.config.ts`
- **Mechanism:** Updated `X-XSS-Protection` to `0` to prevent legacy browser auditor side-channel issues while relying on the application's strict Content Security Policy.

### SEC-12: Client Attachment Quota Enforcement
- **Affected File:** `src/components/chat/chat-composer.tsx`
- **Mechanism:** `handleFileChange` now restricts uploads to a maximum of 10 attachments per turn, aligning client behavior with the Zod schema boundary in `/api/chat`.

---

## 4. Verification Commands & Results

```bash
# 1. Vitest Unit Suite
pnpm test
# Result: 30 passed, 439 passed tests

# 2. Typecheck
pnpm typecheck
# Result: Exit code 0, 0 errors

# 3. Linting
pnpm lint
# Result: Exit code 0, 0 warnings/errors

# 4. Production Build
pnpm build
# Result: Exit code 0, compiled and optimized successfully
```
