# RADIANCE PLATFORM — SKILL APPLICATION MATRIX
**Document ID:** RADIANCE-PERF-002  
**Auditor:** Performance Auditor (`@perf-auditor`)  
**Ecosystem:** Antigravity Unified Engineering & Design Ecosystem  
**Target Architecture:** Next.js 15.5.28 App Router, React 19.3.1, TypeScript 5.9.3, Tailwind CSS 4.3.3  
**Date:** November 11, 2026  
**Related Documents:**
- [Baseline Performance & Technical Audit](./baseline-audit.md)
- [Core Web Vitals Specification](./core-web-vitals.md)
- [Landing Page Skill Application Matrix](../landing-page/skill-application-matrix.md)

---

## 1. Executive Framework & Skill Orchestration Model

The **Radiance AI Platform** is governed by a unified engineering and design standard. Rather than treating frontend engineering, performance optimization, 3D spatial computing, and accessibility as siloed disciplines, Radiance applies a curated matrix of domain-specialist skills.

Each skill provides:
1. **Concrete Architectural Invariants:** Hard operational constraints (e.g., WCAG 2.2 AA contrast, 60fps frame budgets, zero layout shift).
2. **Implementation Patterns:** Direct code idioms and patterns (e.g., React 19 RSC boundaries, OKLCH token scales, clamp fluid typography).
3. **Verification Discipline:** Automated validation criteria before work is declared complete.

---

## 2. Comprehensive Skill Inventory

| Skill Name | Capability Domain | Source / Authority | Architectural Implementation in Radiance |
| :--- | :--- | :--- | :--- |
| **`ui-ux-pro-max`** | Design intelligence, OKLCH palettes, tokens | Curated Agentic Catalog | 9-family semantic color tokens in `globals.css`, surface elevation hierarchy, dark violet identity. |
| **`frontend-design`** | Anti-slop creative direction, craft floor | Anthropic / Antigravity | Elimination of generic AI SaaS clichés; authentic personal intelligence storytelling; glass translucency. |
| **`design-system-architecture`** | Token hierarchy, CSS variables, FOUT | Antigravity Design System | Semantic CSS custom properties (`--background`, `--card`, `--border`), theme-switching token contracts. |
| **`visual-hierarchy-composition`** | Optical weight, focal points, 4px/8px rhythm | Spatial Design Group | Clear visual scanning path, asymmetric product preview stage, intentional whitespace cadence. |
| **`typography-font-pairing`** | Fluid modular scale, tabular numbers, clamp | Typography Standards Lab | Cormorant Garamond serif headings paired with Plus Jakarta Sans body; `tabular-nums` on timers/counters. |
| **`responsive-mobile-first`** | Mobile-first breakpoints, touch targets | Responsive Web Standards | Fluid grid scaling from 320px to 1440px+, touch targets >= 44x44px, zero horizontal overflow. |
| **`wcag-accessibility`** | WCAG 2.1/2.2 AA compliance, ARIA, contrast | A11y Standards Repository | 4.5:1 text contrast on glass surfaces, `aria-label` on icon buttons, keyboard focus rings (`focus-visible`). |
| **`component-engineering`** | Modular component contracts, compound patterns | React Component Lab | Strict TypeScript prop types, polymorphic buttons, modular section decomposition. |
| **`web-design-guidelines`** | Vercel web interface guidelines audit | Vercel Design Engineering | Elimination of layout shifts, preserved focus outlines, content-aware loaders, proper button states. |
| **`browser-screenshot-review`** | Real-browser multi-viewport visual testing | QA Automation Catalog | Headless Playwright captures across 375px/390px mobile, 768px tablet, and 1440px desktop. |
| **`nextjs-best-practices`** | Next.js 15 App Router, Server Actions, RSC | Vercel Engineering Labs | Prerendered static pages (`○`), dynamic edge route handlers (`ƒ`), zero client-side waterfalls. |
| **`react-best-practices`** | React 19 concurrent rendering, hydration | React Core Standards | Elimination of hydration mismatches, Server/Client component boundary hygiene, optimistic state. |
| **`web-performance-core-vitals`** | LCP, INP, CLS, FCP, TTFB budgets | Core Web Vitals Group | 75th percentile budgets: LCP <= 2.5s, INP <= 200ms, CLS <= 0.100; bundle weight auditing. |
| **`awesome-performance-audit`** | Main-thread diagnostics, event loop, USE method | Performance Audit Lab | Profiling long tasks, isolating WebGL render loop overhead, verifying bundle sizes. |
| **`frontend-architecture-typescript`** | Strict TypeScript architecture, boundaries | TypeScript Standards Group | Strict typing across state, props, and API contracts; 0 `any` escapes in production code paths. |
| **`animation-fundamentals`** | 60fps budgets, GPU compositing, S-curves | Motion Architecture Lab | `transform` and `opacity` composited layers; sinusoidal S-curve cross-fading on theme switches. |
| **`motion-react-framer`** | Spring physics, layout animations | Motion for React | Spring configurations (`stiffness: 350, damping: 30`) on preference selectors and modal drawers. |
| **`webgl-threejs-3d`** | Three.js shader architecture, particle engines | 3D Graphics Standards Lab | Starfield particle engine, GLSL shaders, camera drift, bloom post-processing, mobile GPU throttling. |
| **`reduced-motion-inclusive-ux`** | Vestibular safety, calm fallback states | A11y Standards Repository | `@media (prefers-reduced-motion: reduce)` overrides; slow drift with 0 barrel roll on starfield. |
| **`playwright-e2e-testing`** | End-to-end browser test automation | Playwright Test Lab | Automated test suites verifying landing interactions, chat streaming, and settings drawers. |
| **`verification-before-completion`** | Evidence-before-assertions discipline | Superpowers Workflow | Running terminal verification commands (`tsc`, `lint`, `test`, `build`, `audit`) before reporting completion. |
| **`systematic-debugging`** | Root-cause hypothesis testing | Debugging Methodologies | Investigating performance bottlenecks via telemetry and bundle manifests rather than guessing. |

---

## 3. Concrete Architectural Implementations & Technical Decisions

### 3.1 Creative Direction & Design System
- **Applied Skills:** `frontend-design`, `ui-ux-pro-max`, `design-system-architecture`
- **Architectural Impact:**
  - Standardized on a deep atmospheric canvas: `#080c1c` base with translucent glass panels (`rgba(8, 12, 28, 0.45)` with `backdrop-filter: blur(12px)`).
  - Preserved continuous visibility of the WebGL starfield throughout the landing page without opaque blackout veils.
  - Replaced legacy B2B sales copy ("Pipeline Q3", "Scale Smarter Not Harder") with authentic personal intelligence capabilities: local plaintext note storage, bounded lexical retrieval, and opt-in context injection.

### 3.2 Typography & Fluid Layout Cadence
- **Applied Skills:** `typography-font-pairing`, `visual-hierarchy-composition`, `responsive-mobile-first`
- **Architectural Impact:**
  - Paired Cormorant Garamond (`--font-serif`) for editorial headings with Plus Jakarta Sans (`--font-sans`) for high-legibility UI text.
  - Implemented fluid typography with CSS clamp formulas: `font-size: clamp(2.25rem, 4.5vw, 4rem);` with `-0.03em` tracking.
  - Enforced `tabular-nums` on dynamic countdown timers, model token counters, and numeric progress bars to eliminate jitter.
  - Standardized spacing on an 8px grid (4px micro-spacing, 8px/16px/24px/32px/48px/64px section rhythm).

### 3.3 Next.js 15 & React 19 Performance Discipline
- **Applied Skills:** `nextjs-best-practices`, `react-best-practices`, `web-performance-core-vitals`
- **Architectural Impact:**
  - Rendered all static content as Server Components, keeping client-side hydration bundles minimal.
  - Achieved a 164 kB gzipped First Load shared JS bundle across all routes.
  - Implemented automated route budget checks (`scripts/measure-bundle.mjs`) in the build lifecycle, failing builds that exceed 800 kB gzip.
  - Prerendered 11 static and dynamic routes cleanly during `next build`.

### 3.4 60fps Motion & Adaptive WebGL Engineering
- **Applied Skills:** `animation-fundamentals`, `webgl-threejs-3d`, `reduced-motion-inclusive-ux`
- **Architectural Impact:**
  - Implemented sinusoidal S-curve cross-fading `0.5 - 0.5 * Math.cos(progress * Math.PI)` for continuous $C^1$ color transitions across 8 theme presets.
  - Added visibility detection (`document.addEventListener('visibilitychange')`) and `IntersectionObserver` to halt the RAF render loop when offscreen or hidden.
  - Enforced adaptive particle counts: 4,200 (High), 1,800 (Balanced), 600 (Lightweight).
  - Clamped `devicePixelRatio` to 1.5 on mobile to protect mobile GPUs from thermal degradation.

### 3.5 Accessibility & Defensive UX
- **Applied Skills:** `wcag-accessibility`, `web-design-guidelines`
- **Architectural Impact:**
  - Maintained contrast ratios exceeding 4.5:1 for body copy and 3.0:1 for large display text.
  - Ensured all interactive touch targets meet the WCAG 2.2 AA minimum requirement of 44x44px.
  - Provided explicit `aria-label`, `role="progressbar"`, and visible keyboard focus rings (`focus-visible:ring-2`).
  - Added full keyboard navigation and Escape dismissal for all modal drawers and dialogs.

---

## 4. Continuous Compliance & Skill Verification Lifecycle

Every engineering turn in the Radiance repository must execute the verification sequence mandated by `verification-before-completion`:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                 CONTINUOUS COMPLIANCE VERIFICATION PIPELINE                 │
├─────────────────────────────────────────────────────────────────────────────┤
│ 1. Static Typecheck:     pnpm run typecheck       (tsc --noEmit)            │
│ 2. Linter Verification:  pnpm run lint            (next lint / eslint)      │
│ 3. Automated Test Suite: pnpm run test            (vitest run)              │
│ 4. Production Build:     pnpm run build           (next build)              │
│ 5. Bundle Footprint:     pnpm run measure:bundle  (route budget check)      │
│ 6. Documentation Audit:  pnpm run docs:check      (link & env audit)        │
│ 7. E2E Browser Testing:  pnpm run test:e2e        (playwright test)         │
└─────────────────────────────────────────────────────────────────────────────┘
```
