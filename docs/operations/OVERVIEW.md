# RADIANCE PLATFORM — OPERATIONS & OBSERVABILITY OVERVIEW
**Document ID:** RADIANCE-DOC-OPS-001  
**Mission:** RADIANCE-OPS-001  
**Version:** 1.0.0  

---

## 1. ARCHITECTURAL PHILOSOPHY

> **DETECT EARLY. MEASURE EVERYTHING THAT MATTERS. ALERT INTELLIGENTLY. FIX SYSTEMATICALLY.**

The Radiance engineering operations ecosystem is built to ensure high reliability, application security, real-user performance observability, continuous dependency hygiene, and multi-provider AI resilience.

Rather than installing redundant monitoring packages or generating false alert storms, Radiance enforces a **layered, privacy-first observability model**:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                      RADIANCE OBSERVABILITY STACK                       │
├───────────────────────┬────────────────────────────┬────────────────────┤
│ Tier                  │ Engine / Tool              │ Primary Mission    │
├───────────────────────┼────────────────────────────┼────────────────────┤
│ Supply Chain & Code   │ Dependabot + CodeQL        │ Automated CVE & AST│
│ CI/CD Quality Gate    │ GitHub Actions Pipeline    │ Test & Build Gate  │
│ Application Telemetry │ @sentry/nextjs (v11)       │ Errors & Traces    │
│ Real User Web Vitals  │ @vercel/speed-insights     │ INP, LCP, CLS, TTFB│
│ Real User Traffic     │ @vercel/analytics          │ Privacy Page Views │
│ Synthetic Availability│ Better Stack Probes        │ Liveness/Readiness │
│ Database Health       │ Supabase PostgreSQL Engine │ RLS, Queries, Pool │
│ AI Infrastructure     │ Radiance AI Telemetry      │ TTFT, Latency, Fall│
│ Performance Budgets   │ Lighthouse CI + Measure    │ Lab Budgets (711k) │
└───────────────────────┴────────────────────────────┴────────────────────┘
```

---

## 2. COMPONENT MAP & DIRECTORY STRUCTURE

- `.github/dependabot.yml`: Automated dependency updates for npm/pnpm and GitHub Actions.
- `.github/workflows/`:
  - `ci.yml`: Hardened quality gate (Typecheck, ESLint, Vitest, Build).
  - `codeql.yml`: Weekly and PR CodeQL static security analysis.
  - `dependency-review.yml`: Automated PR dependency risk screening.
  - `gitleaks.yml`: Automated secret detection.
- `src/lib/observability/`:
  - `privacy.ts`: Strict sanitization engine stripping user prompts, session tokens, and keys.
  - `logger.ts`: RFC 5424 structured JSON logging.
  - `ai-telemetry.ts`: Provider-agnostic AI lifecycle tracking (TTFT, tokens, error classification).
- `src/app/api/health/`:
  - `route.ts`: Liveness health probe (`/api/health`).
  - `ready/route.ts`: Dependency readiness probe (`/api/health/ready`).
- `scripts/measure-bundle.mjs`: Automated client JavaScript bundle size and gzip auditor.
- `.lighthouserc.json`: Lighthouse CI assertions and performance baselines.
- `docs/operations/`: Full suite of 15 operational runbooks and implementation manuals.
