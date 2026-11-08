# RADIANCE PLATFORM — PERFORMANCE BUDGETS & BUNDLE AUDITING
**Document ID:** RADIANCE-DOC-OPS-011  
**Config:** `.lighthouserc.json`  
**Auditor Script:** `scripts/measure-bundle.mjs` (`pnpm run measure:bundle`)  

---

## 1. EMPIRICAL BASELINE (NEXT.JS 15 + SENTRY + THREE.JS)

Through direct measurement of the compiled production build:

| Route | Raw Uncompressed | Gzip Size | Gzip Budget | Status |
| :--- | :--- | :--- | :--- | :--- |
| `/_not-found/page` | 517.1 kB | 161.0 kB | < 200 kB | **PASS** |
| `/api/health/route` | 514.7 kB | 160.2 kB | N/A | **PASS** |
| `/layout` | 643.1 kB | 181.8 kB | < 220 kB | **PASS** |
| `/page` (Chat Workspace) | 2,470.0 kB | 711.1 kB | < 800 kB | **PASS** |

### Bottleneck Breakdown
1. **Three.js & Canvas Visual Engines:**
   Atmospheric particles and spatial visual computing modules contribute ~400 kB unminified.
2. **KaTeX & Math Rendering:**
   Mathematical syntax typesetting libraries contribute ~150 kB unminified.
3. **Mammoth & PDF Document Parsers:**
   Document analysis libraries dynamically imported on upload.

---

## 2. AUTOMATED BUNDLE VERIFICATION

Run the bundle auditor anytime locally or in CI:

```bash
# 1. Build optimized Next.js production bundle
pnpm run build

# 2. Audit all route chunks against budgets
pnpm run measure:bundle
```

If a newly added dependency pushes `/page` beyond 800 kB gzip, the command exits with code 1, preventing bundle regressions from reaching production.

---

## 3. LIGHTHOUSE CI LAB THRESHOLDS (`.lighthouserc.json`)

- **Accessibility:** `>= 0.90` (Strict WCAG 2.1 AA compliance).
- **Best Practices:** `>= 0.90` (CSP headers, secure cookies, HTTPS).
- **SEO:** `>= 0.85` (Metadata, OpenGraph, dynamic viewport tags).
- **Performance:** `>= 0.70` (Reflects GPU-intensive spatial rendering engine).
- **Cumulative Layout Shift (CLS):** `<= 0.1`.
- **First Contentful Paint (FCP):** `<= 2.5s`.
