# RADIANCE PLATFORM — CORE WEB VITALS SPECIFICATION & BUDGETS
**Document ID:** RADIANCE-PERF-003  
**Auditor:** Performance Auditor (`@perf-auditor`)  
**Standard:** Google Core Web Vitals (CWV) & Web Vitals 2026 Standards  
**Evaluation Scope:** All public routes (`/`, `/chat`, `/privacy`, `/_not-found`)  
**Date:** November 11, 2026  
**Related Documents:**
- [Baseline Performance & Technical Audit](./baseline-audit.md)
- [Skill Application Matrix](./skill-application-matrix.md)
- [Performance Budgets & Operations](../operations/PERFORMANCE_BUDGETS.md)

---

## 1. Specification Overview & Governance

Core Web Vitals represent Google's standardized metrics for measuring real-world user experience across page loading speed, visual stability, and interactive responsiveness.

For the **Radiance AI Platform**, adherence to Core Web Vitals is an automated operational invariant. Every deployment must pass the **75th percentile (p75)** threshold across all real-user mobile and desktop visits.

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    RADIANCE CORE WEB VITALS BUDGET SUMMARY                  │
├─────────────────────────────────────────────────────────────────────────────┤
│  Metric                        │ 75th Percentile Budget │ Radiance Target   │
├────────────────────────────────┼────────────────────────┼───────────────────┤
│  LCP (Largest Contentful Paint)│ <= 2.50 seconds        │ < 1.80 seconds    │
│  INP (Interaction to Next Paint│ <= 200 milliseconds    │ < 120 milliseconds│
│  CLS (Cumulative Layout Shift) │ <= 0.100               │ < 0.020 (Zero)    │
│  FCP (First Contentful Paint)  │ <= 1.80 seconds        │ < 1.00 seconds    │
│  TTFB (Time to First Byte)     │ <= 800 milliseconds    │ < 200 milliseconds│
│  TBT (Total Blocking Time)     │ <= 200 milliseconds    │ < 150 milliseconds│
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Web Vitals Definitions & Thresholds

### 2.1 Largest Contentful Paint (LCP)
- **What it Measures:** Perceived loading speed. The render time of the largest visual text block or image element visible within the initial viewport.
- **Google Thresholds:**
  - **Good (Pass):** `<= 2.50 s`
  - **Needs Improvement:** `2.50 s - 4.00 s`
  - **Poor (Fail):** `> 4.00 s`
- **Radiance Invariant:**
  - On `/` (Landing): The primary display headline (`H1.hero-narrative-title`) is server-rendered with high priority. Hero typography uses `font-display: swap` so text renders immediately.
  - On `/chat`: The welcome card and composer header are rendered synchronously on initial load, achieving an empirical LCP of **0.92s**.

### 2.2 Interaction to Next Paint (INP)
- **What it Measures:** Overall interactive responsiveness. The latency between user input (clicks, taps, keyboard presses) and the next browser paint that visually confirms the interaction.
- **Google Thresholds:**
  - **Good (Pass):** `<= 200 ms`
  - **Needs Improvement:** `200 ms - 500 ms`
  - **Poor (Fail):** `> 500 ms`
- **Radiance Invariant:**
  - Event listeners must not block the main thread. Long operations (e.g. document parsing, model streaming) yield control using modern microtask or `scheduler.yield()` techniques.
  - Three.js render loops must never monopolize the main thread during user interaction; starfield rendering runs with clamped frame budgets and adaptive particle counts.
  - On `/chat`: Active typing in the composer yields an empirical INP of **160 ms** (comfortably within the 200 ms budget).

### 2.3 Cumulative Layout Shift (CLS)
- **What it Measures:** Visual stability. The sum of all unexpected layout shift scores for every visible element during the page lifecycle.
- **Google Thresholds:**
  - **Good (Pass):** `<= 0.100`
  - **Needs Improvement:** `0.100 - 0.250`
  - **Poor (Fail):** `> 0.250`
- **Radiance Invariant:**
  - Radiance enforces a **zero unexpected layout shift standard (CLS = 0.000)**.
  - All dynamic containers (navigation bars, chat message lists, hero product stage) reserve explicit layout space (`min-height`, CSS grid areas).
  - Fonts define size adjustments to prevent layout reflow during web font swapping.

---

## 3. Supplementary Diagnostics

### 3.1 First Contentful Paint (FCP)
- **Target:** `<= 1.80 s` (Good), `<= 1.00 s` (Radiance Target).
- **Measurement:** Time from navigation start until the browser renders the first piece of DOM content (text, image, or canvas).
- **Empirical Baseline:** `/` = **364 ms**, `/chat` = **496 ms**.

### 3.2 Time to First Byte (TTFB)
- **Target:** `<= 800 ms` (Good), `<= 200 ms` (Edge target).
- **Measurement:** Time between the browser requesting a page and receiving the first byte of response data.
- **Empirical Baseline:** `/` = **71.9 ms**, `/chat` = **5.0 ms** (Next.js 15 prerendered static content).

### 3.3 Total Blocking Time (TBT — Lab Proxy for INP)
- **Target:** `<= 200 ms` in synthetic Lab testing.
- **Measurement:** Sum of all time periods between FCP and Time to Interactive (TTI) where execution of a task exceeds 50 ms.
- **Empirical Baseline:** `/chat` = **123 ms** (Passing). Landing page requires adaptive render pausing to prevent continuous RAF accumulation.

---

## 4. Route-by-Route Performance Budgets

| Metric | `/` (Landing Page) | `/chat` (Chat Workspace) | `/privacy` | `/_not-found` |
| :--- | :--- | :--- | :--- | :--- |
| **LCP (p75)** | `<= 2.50 s` *(Empirical: 2.41 s)* | `<= 2.00 s` *(Empirical: 0.92 s)* | `<= 1.50 s` | `<= 1.50 s` |
| **INP (p75)** | `<= 200 ms` | `<= 200 ms` *(Empirical: 160 ms)* | `<= 100 ms` | `<= 100 ms` |
| **CLS (p75)** | `<= 0.050` *(Empirical: 0.000)* | `<= 0.020` *(Empirical: 0.000)* | `<= 0.010` | `<= 0.010` |
| **FCP (p75)** | `<= 1.50 s` *(Empirical: 364 ms)* | `<= 1.50 s` *(Empirical: 496 ms)* | `<= 1.00 s` | `<= 1.00 s` |
| **TTFB** | `<= 500 ms` *(Empirical: 71.9 ms)* | `<= 200 ms` *(Empirical: 5.0 ms)* | `<= 200 ms` | `<= 200 ms` |
| **Max Gzip JS**| `<= 800 kB` *(Empirical: 398.3 kB)*| `<= 800 kB` *(Empirical: 723.1 kB)*| `<= 400 kB` | `<= 200 kB` |

---

## 5. Telemetry & Measurement Infrastructure

Radiance integrates dual-track performance monitoring:

### 5.1 Real-User Monitoring (Field Telemetry)
- **Provider:** `@vercel/speed-insights` and `@vercel/analytics` integrated into `src/app/layout.tsx`.
- **Sampling:** 100% of production user sessions capture real-world CWV distributions segmented by device type, country, and browser engine.
- **Alerting:** Any regression in 75th percentile LCP (> 2.5s) or INP (> 200ms) triggers automated alerts via the Sentry Next.js integration.

### 5.2 Automated Synthetic Lab Auditing
- **Playwright CWV Harness:** Executed via `node scripts/measure-cwv.mjs`, measuring true navigation timing, PerformanceObserver entries, and network byte distribution against production builds.
- **Bundle Size Auditor:** Executed via `pnpm run measure:bundle` (`scripts/measure-bundle.mjs`), validating `.next/app-build-manifest.json` against hard route gzip budgets.
- **Lighthouse CI:** Thresholds configured in `.lighthouserc.json`:
  ```json
  {
    "ci": {
      "assert": {
        "assertions": {
          "categories:performance": ["warn", { "minScore": 0.70 }],
          "categories:accessibility": ["error", { "minScore": 0.90 }],
          "first-contentful-paint": ["error", { "maxNumericValue": 2500 }],
          "cumulative-layout-shift": ["error", { "maxNumericValue": 0.1 }]
        }
      }
    }
  }
  ```

---

## 6. Actionable Optimization Strategies

### 6.1 LCP Optimization Discipline
1. **Zero Render-Blocking Resources:** All stylesheets are critical-inlined or hoisted by Next.js. Scripts carry `defer` or `async` attributes automatically.
2. **Font Preloading with Swap:** Cormorant Garamond is loaded via `next/font/google` with `display: 'swap'` and preloaded sub-resource links.
3. **Server Component Pre-rendering:** Above-the-fold titles and descriptions are rendered as static HTML strings, allowing the browser parser to construct the DOM before client hydration kicks off.

### 6.2 INP Optimization Discipline
1. **Adaptive Particle Engine:** Particle systems adjust to hardware concurrency (`navigator.hardwareConcurrency`) and device pixel ratio:
   - High (4,200 particles)
   - Balanced (1,800 particles)
   - Lightweight (600 particles / reduced motion)
2. **Offscreen & Tab Invisibility Pausing:** Three.js loops halt via `IntersectionObserver` when scrolled out of view and via `visibilitychange` when the tab is blurred.
3. **Chunking Heavy Handlers:** Document parsing (`mammoth`) and complex math rendering (`katex`) are dynamically imported, preventing script evaluation from competing with keyboard/touch events.

### 6.3 CLS Prevention Invariants
1. **Explicit Dimensions:** All images, icons, and interactive previews feature explicit `width`, `height`, or aspect-ratio CSS properties.
2. **Stable Typography:** Dynamic counters and clock displays enforce `tabular-nums` and minimum bounding widths (`min-w-[24px]`).
3. **Safe Area Inset Buffering:** Mobile viewports apply `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` to prevent content shifts when virtual keyboards toggle.
