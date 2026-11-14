# Security Policy

The Radiance architecture team takes application security, operational reliability, and user privacy seriously. We appreciate the contributions of security researchers and community members in responsibly identifying and disclosing potential vulnerabilities.

---

## 1. Supported Versions

Security updates and critical stability patches are actively maintained for the current production release line on the `main` branch:

| Version | Status | Security Patches |
|:---|:---:|:---|
| `1.0.x` | Production Core (`main`) | :white_check_mark: Supported |
| `< 1.0` | Pre-release / Legacy | :x: Unsupported |

---

## 2. Reporting a Vulnerability

**DO NOT report suspected security vulnerabilities through public GitHub issues, pull requests, or public discussions.**

### Recommended Reporting Method
Please submit security vulnerability reports privately using **GitHub Security Advisories**:

1. Navigate to the repository's Security Advisories tab:  
   [https://github.com/TanishBane/Radiance/security/advisories/new](https://github.com/TanishBane/Radiance/security/advisories/new)
2. Click **"Report a vulnerability"**.
3. Complete the advisory form with the required details listed below.

If GitHub Security Advisories is unavailable, you may contact project maintainer **Tanish Bane** directly through private channels via their GitHub profile: [@TanishBane](https://github.com/TanishBane).

### What Your Report Should Contain
To help us triage and remediate the issue efficiently, please include:
- **Summary:** A concise explanation of the vulnerability and its potential impact.
- **Affected Subsystem:** Specific files, routes, or modules involved (e.g., `/api/chat`, `format.ts`, `rate-limiter.ts`, `profile-store.ts`).
- **Steps to Reproduce:** Step-by-step reproduction instructions or a minimal, sanitized proof-of-concept (PoC).
- **Attack Scenario:** A realistic scenario demonstrating how an attacker could exploit the issue.
- **Suggested Remediation:** Any initial thoughts or proposed patches, if available.

> [!WARNING]
> Never include real credentials, private keys, live API tokens, or actual user data in your report. Always use sanitized mock placeholders (e.g., `gsk_mock_key_xxxx`).

---

## 3. Triage & Remediation Process

When a vulnerability report is submitted:

1. **Acknowledgment:** Maintainers strive to review and acknowledge receipt within **48 to 72 hours**.
2. **Investigation & Scoring:** We will reproduce the issue, evaluate its severity using the Common Vulnerability Scoring System (CVSS v3.1), and determine affected versions.
3. **Confidential Patch Development:** Fixes are engineered and tested in a private security advisory branch.
4. **Coordinated Disclosure:** A patched release will be published alongside a GitHub Security Advisory detailing the issue and crediting the reporter (unless anonymity is requested).

---

## 4. Scope & Exclusions

### In Scope
- **Injection Flaws:** SQL/PostgREST parameter injection, prompt injection escaping system constraints, or arbitrary command execution.
- **Cross-Site Scripting (XSS):** Sanitization bypasses in the Markdown parsing engine ([src/lib/utils/format.ts](file:///c:/Tanixai-main/src/lib/utils/format.ts)), syntax highlighter, or KaTeX LaTeX renderer.
- **Server-Side Request Forgery (SSRF):** Unrestricted external network requests triggered via API handlers.
- **Authentication & Authorization:** Bypasses in Supabase Row-Level Security (RLS) policies allowing cross-tenant data leakage.
- **Rate Limit Bypasses:** Header spoofing defeating client IP identification or resource exhaustion vulnerabilities.
- **Data Leakage:** Unintentional exposure of internal environment credentials, API keys, or stack traces in API responses.
- **Malicious Document Processing:** File upload signature bypasses or decompression bombs in DOCX/PDF parsers.

### Out of Scope
- Volumetric Denial of Service (DDoS) attacks targeting network infrastructure or third-party host platforms (e.g., Vercel, Cloudflare).
- Social engineering, phishing, or physical attacks against maintainers or users.
- Automated scanner reports without a verifiable, exploitable proof-of-concept.
- Vulnerabilities requiring physical access to an unlocked client device or browser local storage.
- Issues in third-party AI provider inference engines outside the control of Radiance's orchestration layer.

---

## 5. Verified Defensive Architecture in Radiance

Radiance incorporates multiple architectural defense-in-depth protections:

- **Layered Rate Limiting ([src/lib/security/rate-limiter.ts](file:///c:/Tanixai-main/src/lib/security/rate-limiter.ts)):** Distributed Upstash Redis sliding window with automatic fallback to an in-memory token bucket limiter. Employs a strict 10,000 bucket cap and periodic FIFO cleanup to prevent memory exhaustion (SEC-01).
- **Edge Header Spoof Defense (SEC-07):** Derives client IP prioritizing platform-authenticated Cloudflare (`cf-connecting-ip`) and Vercel (`x-vercel-forwarded-for`) headers before evaluating untrusted headers.
- **Strict Content Security Policy ([next.config.ts](file:///c:/Tanixai-main/next.config.ts)):** Enforces `default-src 'self'`, `frame-ancestors 'none'`, and explicitly whitelists outbound connection endpoints.
- **PostgREST Parameter Validation (SEC-08):** Strictly validates conversation and message IDs against `/^[a-zA-Z0-9_-]{1,128}$/` before database queries.
- **Prompt Injection Boundary ([src/lib/ai/personalization-context.ts](file:///c:/Tanixai-main/src/lib/ai/personalization-context.ts)):** Isolates user notes inside a `<RADIANCE_PERSONAL_CONTEXT_UNTRUSTED>` block with HTML-safe JSON escaping; system prompts explicitly instruct models to treat this data as untrusted reference material.
- **Secret Filtering with Luhn Validation ([src/features/intelligence/profile-store.ts](file:///c:/Tanixai-main/src/features/intelligence/profile-store.ts)):** Automatically blocks private keys, API tokens, passwords, SSNs, and credit card numbers validated via the Luhn algorithm from being saved into personal intelligence notes.
- **File Signature Verification ([src/lib/documents/parser.ts](file:///c:/Tanixai-main/src/lib/documents/parser.ts)):** Validates magic bytes for PDF (`%PDF`), DOCX (ZIP `PK..`), PNG (`\x89PNG`), and JPEG (`\xFF\xD8\xFF`) to prevent file extension spoofing.
