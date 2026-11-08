# RADIANCE PLATFORM — SKILL DISCOVERY & UTILIZATION REGISTRY
**Document ID:** RADIANCE-SKILLS-001  
**Execution Timestamp:** 2026-11-08T16:10:30+05:30  
**Target Architecture:** DevSecOps, Observability, Production Monitoring

---

## 1. INSTALLED SKILLS DISCOVERED & EVALUATED

| Skill Name | Path | Domain | Audit & Utilization Status |
| :--- | :--- | :--- | :--- |
| `ci-cd-and-automation` | `C:\Users\gmatr\.gemini\config\skills\ci-cd-and-automation\SKILL.md` | DevSecOps / CI/CD | **APPLIED:** Evaluated quality gate pipeline, caching strategy, frozen lockfile enforcement, and minimal permission models. |
| `security-audit` | `C:\Users\gmatr\.gemini\config\skills\security-audit\SKILL.md` | Application Security | **APPLIED:** Used for analyzing API contracts, input validation, secret hygiene, and OWASP mitigation. |
| `supply-chain-risk-auditor` | `C:\Users\gmatr\.gemini\config\skills\supply-chain-risk-auditor\SKILL.md` | Supply Chain Security | **APPLIED:** Audited `pnpm audit` registry behavior, transitive dependencies, and Dependabot automation. |
| `secure-coding-defensive-review` | `C:\Users\gmatr\.gemini\config\skills\secure-coding-defensive-review\SKILL.md` | Defensive Engineering | **APPLIED:** Enforced strict data redaction for Sentry, AI telemetry, and health check endpoints. |
| `web-performance-core-vitals` | `C:\Users\gmatr\.gemini\config\skills\web-performance-core-vitals\SKILL.md` | Web Performance | **APPLIED:** Configured Vercel Speed Insights, Lighthouse CI configurations, and bundle budgets. |
| `supabase-postgres-best-practices` | `C:\Users\gmatr\.gemini\config\skills\supabase-postgres-best-practices\SKILL.md` | Database Infrastructure | **APPLIED:** Reviewed schema indexing, RLS policies, connection pooling, and Postgres observability. |
| `verification-before-completion` | `C:\Users\gmatr\.gemini\config\skills\verification-before-completion\SKILL.md` | Reliability & Engineering | **APPLIED (MANDATORY):** Strict requirement to execute `typecheck`, `lint`, `test`, and `build` commands in the current turn before any completion claims. |
| `nextjs-best-practices` | `C:\Users\gmatr\.gemini\config\skills\nextjs-best-practices\SKILL.md` | Framework Architecture | **APPLIED:** Governs Next.js 15 App Router instrumentation hooks, layout component boundaries, and CSP configurations. |

---

## 2. EXTERNAL AGENT SKILLS EVALUATED

1. **Official Sentry Next.js Agent Skill (`getsentry/sentry-agent-skills`):**
   - Evaluated against Sentry Next.js SDK v8+ architecture.
   - Sentry configuration follows official Next.js 15 App Router standard: `sentry.client.config.ts`, `sentry.server.config.ts`, `sentry.edge.config.ts`, `instrumentation.ts`, and `withSentryConfig(nextConfig, sentryWebpackPluginOptions)`.
   - Privacy-first `beforeSend` filtering implemented to strip user prompts, responses, attachments, and auth cookies.

2. **Official Supabase Agent Skills:**
   - Evaluated native Supabase observability capabilities (PostgreSQL slow query logs, connection metrics, RLS violation monitoring, and security advisor reports).
   - Documented in `docs/operations/SUPABASE_OBSERVABILITY.md`.

---

## 3. SKILL USAGE INVENTORY

- `ci-cd-and-automation` -> Hardening `.github/workflows/ci.yml`, `.github/dependabot.yml`, and `.github/workflows/codeql.yml`.
- `secure-coding-defensive-review` -> Ensuring privacy sanitization in `src/lib/observability/ai-telemetry.ts` and Sentry hooks.
- `web-performance-core-vitals` -> Integration of `@vercel/speed-insights` and `.lighthouserc.json`.
- `verification-before-completion` -> Systematic execution of verification gates with recorded terminal outputs.
