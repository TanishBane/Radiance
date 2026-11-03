# RADIANCE — SKILL INVENTORY & APPLICABILITY MATRIX

**Document Version:** 1.0.0  
**Audit & Phase 0 Date:** 2026-11-01  
**Project:** RADIANCE Transformation  

---

## 1. INSTALLED SKILL DISCOVERY MATRIX

The Antigravity skill registry was discovered and cataloged across `C:\Users\gmatr\.gemini\config\skills\` and `C:\Users\gmatr\.gemini\antigravity\builtin\skills\`.

| Skill Identifier | Category | Installed | Instructions Read | Transformation Phase | Utilization Plan | Selection Rationale |
|---|---|---|---|---|---|---|
| `nextjs-best-practices` | Frontend / Core | Yes | Yes | Phase 1, 2, 3 | Active | Critical for Next.js App Router rules, dynamic import of Three.js, server component boundaries, and streaming route handlers. |
| `react-best-practices` | Frontend / Core | Yes | Yes | Phase 1, 2 | Active | Enforces Vercel performance standards, memoization rules, and RSC data waterfall prevention. |
| `react-patterns` | Frontend / Core | Yes | Yes | Phase 2, 4 | Active | Component composition, slot patterns, controlled state management, and hook encapsulation. |
| `frontend-architecture-typescript` | Frontend / Arch | Yes | Yes | Phase 1, 2 | Active | Strict typing, discriminated unions, clean domain separation, and zero-`any` policy. |
| `tailwind-css-best-practices` | Frontend / Styling | Yes | Yes | Phase 1, 2 | Active | Design token integration, CSS-first `@theme` syntax, eliminating arbitrary values. |
| `shadcn-radix-ui` | Frontend / UI Primitives | Yes | Yes | Phase 2 | Active | Headless accessible primitives (dialogs, dropdowns, popovers, tooltips) maintaining WCAG AA compliance. |
| `motion-react-framer` | Frontend / Motion | Yes | Yes | Phase 2 | Active | Smooth page transitions, exit animations (`AnimatePresence`), spring physics, and reduced-motion fallback. |
| `webgl-threejs-3d` | Frontend / 3D | Yes | Yes | Phase 2 | Active | Migration and optimization of legacy procedural Three.js nebula canvas into a lazy-loaded React component. |
| `ui-ux-pro-max` | Design & UI/UX | Yes | Yes | Phase 2 | Active | Dark luxury aesthetic direction, OKLCH perceptual contrast, and spacing scale (4px/8px rhythm). |
| `design-tokens-theming` | Design & Tokens | Yes | Yes | Phase 2 | Active | Multi-theme palette architecture (Void, Emerald, Ocean, Amber, Violet, Rose, etc.) mapped to CSS custom properties. |
| `api-and-interface-design` | Backend / API | Yes | Yes | Phase 3, 4 | Active | RFC 7807 error responses, idempotency, streaming contracts, and typed route handler schemas. |
| `supabase-postgres-best-practices` | Database | Yes | Yes | Phase 3, 5 | Active | PostgreSQL schema modeling, foreign key indexing, RLS policy definition, and connection hygiene. |
| `database-schema-migrations` | Database | Yes | Yes | Phase 5 | Active | Safe SQL migrations, idempotent table creation, and foreign key constraint validation. |
| `secure-coding-defensive-review` | Security | Yes | Yes | Phase 3, 7 | Active | Server-side authorization, input validation with Zod, rate-limiting, and XSS/injection mitigation. |
| `playwright-e2e-testing` | Testing | Yes | Yes | Phase 7 | Active | Browser-driven verification of user journeys, streaming message receipt, and responsive layouts. |
| `verification-before-completion` | Reliability | Yes | Yes | All Phases | Mandatory | Strict evidence-before-claims discipline; every claim backed by verified exit code 0 and tool output. |
| `documentation-and-adrs` | Documentation | Yes | Yes | All Phases | Active | Persistent architectural documentation and decision records stored in `.antigravity/`. |
| `ponytail` | Engineering Strategy | Yes | Yes | All Phases | Active | Minimizes unnecessary architectural bloat; ensures pragmatic, maintainable solutions over speculative over-engineering. |

---

## 2. EXCLUDED / DEFERRED SKILLS

| Skill | Category | Reason for Exclusion / Deferral |
|---|---|---|
| `scikit-learn` / `pytorch-engineering` | Classical / Deep ML | Radiance uses API-orchestrated foundation models (Groq, Gemini, OpenRouter), not local PyTorch training pipelines. |
| `docker-compose-patterns` / `docker-build-strategies` | Infrastructure | Vercel and serverless edge deployment are targeted; no local multi-container Docker cluster is currently required. |
| `fastapi-pydantic-engineering` | Python Backend | Full-stack Next.js App Router and Node.js Route Handlers are the chosen unified stack. |
| `timesfm-forecasting` / `aeon` | Time Series Forecasting | Irrelevant to the conversational and multimodal AI platform scope. |
