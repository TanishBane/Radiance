# Radiance Landing Optimization — Skills & Decisions

## Skills Activated

| Skill | Purpose |
|-------|---------|
| `verification-before-completion` | Evidence-based verification: build, typecheck, lint, test outputs inspected before success claims |
| `systematic-debugging` | Diagnosing verify-stage3.mjs crash (whileInView opacity, IntersectionObserver triggering, screenshot timeouts) |
| `wcag-accessibility` | WCAG 2.1 AA contrast thresholds (4.5:1 body, 3:1 large headings), focus ring spec |
| `web-performance-core-vitals` | CLS, LCP measurement; canvas memory budgeting; two-layer allocation strategy |
| `design-system` | Token preservation, CSS variable usage, Radiance dark-violet identity |
| `typography-font-pairing` | Cormorant Garamond serif editorial hierarchy, Plus Jakarta Sans body, JetBrains Mono monospace |
| `responsive-mobile-first` | 320px/390px/1440px verification, flex-wrap fixes, overflow prevention |
| `component-engineering` | React component boundary preservation, StrictMode-safe rendering loops |
| `reduced-motion-inclusive-ux` | prefers-reduced-motion support in canvas allocation and fade pipeline |
| `modern-python` | N/A (Node.js project, but tooling conventions applied to verification scripts) |
| `git-workflow-worktrees` | Branch management, stage-oriented commits, no force-push discipline |

## Key Implementation Decisions

### 1. Two-Layer Canvas Allocation (Stage 2)
**Decision:** Max 2 full-resolution canvases active at any scroll position; remaining 8 layers resized to 1×1 pixel.
**Rationale:** GPU memory proportional to `width × height × DPR² × 4 bytes`. At DPR2 on a 1440px viewport, each canvas consumes ~40MB. Limiting to 2 active layers caps canvas memory at ~80MB vs ~400MB for all 10.
**Trade-off:** Fade transitions required to mask allocation/deallocation. Single static frame for reduced-motion preference.

### 2. Hue-Matched Radial Scrims (Stage 3)
**Decision:** Per-section radial-gradient scrims that blend with the underlying canvas art layer colours rather than uniform dark overlays.
**Rationale:** Preserves the multicolour Radiance identity while meeting WCAG 2.1 AA contrast. Uniform overlays would flatten the visual atmosphere.
**Trade-off:** Slightly more complex CSS; each section needs its own gradient stops.

### 3. Self-Hosted Variable Fonts (Stage 1)
**Decision:** Replace Google Fonts CDN with self-hosted variable WOFF2 via `next/font/local`.
**Rationale:** Eliminates external font requests (render-blocking), enables `font-display: swap` control, reduces FOUT, improves LCP.
**Trade-off:** Larger initial bundle by ~60KB (two variable font files), offset by eliminated network round-trips.

### 4. Scroll-Nudge for IntersectionObserver (Verification)
**Decision:** Verification scripts use `scrollTo(top - 96)` + `dispatchEvent(scroll)` + `mouse.wheel(0, 2)` + scrollBy nudge to trigger `whileInView` animations.
**Rationale:** Headless Chromium `scrollIntoView` doesn't reliably trigger motion/react's IntersectionObserver. The nudge sequence ensures elements reach `opacity: 1` before contrast measurement.
**Constraint:** Measurements only valid with `reducedMotion: "reduce"` context setting.

### 5. Test Assertion Updates (Stage 6)
**Decision:** Updated test assertions to match new copy and layout values rather than reverting implementation changes.
**Rationale:** Tests should reflect the current product truth. Copy changes (Stage 5) and layout adjustments (Stage 6) are intentional.
