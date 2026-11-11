# Animation & Adaptive Rendering Performance Specification

This document details the architecture, visual quality tiering, WebGL starfield lifecycle management, and CSS containment implemented across Radiance. These systems ensure guaranteed 60fps/120fps compositor execution, sub-200ms interaction latency, robust mobile thermal protection, and strict accessibility compliance.

---

## 1. Architectural Overview & Design Invariants

Interactive 3D scenes, particle simulations, and rich animations must never compromise core usability, device battery health, or Core Web Vitals (INP, LCP, CLS, TBT). Radiance implements a multi-tier rendering architecture governed by four fundamental invariants:

1. **Adaptive Hardware Tiering:** Visual fidelity adapts dynamically to client hardware concurrency, device pixel ratio, network data-saver constraints, and user motion preferences.
2. **Offscreen & Tab Lifecycle Pausing:** The WebGL render loop automatically pauses whenever `#scene` is scrolled offscreen or the browser tab is hidden, eliminating background CPU/GPU drain and high TBT.
3. **Thermal Throttling Protection:** On mobile devices, `devicePixelRatio` is strictly clamped to a maximum of 1.5, preventing mobile GPU thermal degradation and battery drain on high-density displays (e.g. 3x Retina).
4. **Compositor-Only Animations & CSS Containment:** Below-the-fold content uses `content-visibility: auto` with intrinsic size hints, while keyframes and transitions exclusively mutate GPU-composited properties (`transform` and `opacity`), preventing layout thrashing.

---

## 2. Adaptive Visual Quality Engine (`src/lib/performance/adaptive-quality.ts`)

The adaptive quality engine evaluates client hardware capabilities and environmental constraints to allocate one of three distinct visual quality tiers:

| Parameter | High Tier | Balanced Tier | Lightweight Tier |
| :--- | :--- | :--- | :--- |
| **Target Device** | Desktop / capable GPU | Mid-range mobile / moderate laptop | Low-power / mobile CPU / Save-Data / Reduced-Motion |
| **Detection Heuristic** | Desktop, concurrency >= 6, WebGL2/WebGL | Mobile with concurrency > 4, or desktop with 3–4 cores | Concurrency <= 2, mobile <= 4 cores, Save-Data, or Reduced-Motion |
| **Star Particle Count** | **4,200 stars** | **1,800 stars** | **600 stars** |
| **DPR Maximum Cap** | 2.0 | 1.5 | 1.0 (clamped to 1.5 max) |
| **Bloom Passes** | Enabled | Optimized / Disabled | Disabled |
| **Drift Speed (`uDrift`)**| 2.35 | 1.50 | 0.20 (calm drifting) |
| **Barrel Roll (`spin`)** | 0.03 | 0.015 | **0.00 (zero barrel roll)** |
| **Twinkle Amplitude** | 1.0 | 0.70 | 0.20 |
| **Void Repel Strength** | 0.35 | 0.20 | 0.00 (disabled) |

### Evaluated Capabilities

- **`prefers-reduced-motion`:** Evaluated via `window.matchMedia("(prefers-reduced-motion: reduce)")`. Immediately assigns **Lightweight Tier** and dampens motion to a calm, near-static drift with 0 barrel roll.
- **`navigator.hardwareConcurrency`:** Reflects logical processing cores. Devices with <= 2 cores drop to Lightweight; mobile devices with <= 4 cores drop to Lightweight; desktop devices with >= 6 cores receive High.
- **`window.devicePixelRatio`:** Clamped to max 1.5 on mobile displays to protect mobile GPUs from rasterizing massive 3x canvas backbuffers.
- **`navigator.connection.saveData`:** Network Information API flag indicating client data-saver mode. Drops to Lightweight to conserve bandwidth and CPU energy.
- **`isWebGLSupported()`:** Safely probes WebGL context availability without throwing in headless/jsdom or unsupported environments.

### Reactive Hook API

```tsx
import { useAdaptiveQuality } from "@/lib/performance/adaptive-quality";

function Component() {
  const { tier, config, isReducedMotion, isMobile } = useAdaptiveQuality();
  // Automatically updates if OS prefers-reduced-motion setting changes
}
```

---

## 3. Three.js Starfield Mobile & Lifecycle Optimization (`src/components/landing/webgl-starfield.tsx`)

The landing page background features a Three.js particle starfield with multi-pass post-processing and sinusoidal theme transitions. It implements deep lifecycle optimizations:

### Adaptive Particle Allocation
Particle counts are bound directly to the active tier:
- **High:** 4,200 particle vertices.
- **Balanced:** 1,800 particle vertices (57% reduction in vertex shader load).
- **Lightweight:** 600 particle vertices (86% reduction in vertex shader load).

### Offscreen & Tab Invisibility Lifecycle Pause Controller
To prevent unnecessary GPU work when the canvas is hidden or backgrounded, two synchronized lifecycle listeners control the animation loop:

1. **Tab Visibility (`document.addEventListener("visibilitychange")`):**
   When `document.hidden === true`, the active requestAnimationFrame loop is cancelled via `cancelAnimationFrame(animId)`.
2. **Offscreen Canvas Intersection (`IntersectionObserver`):**
   An `IntersectionObserver` with a `0.01` threshold targets `#scene`. When the user scrolls past the canvas, rendering halts immediately.
3. **Smooth Re-entry & Time Delta Normalization:**
   Upon re-entering the viewport or restoring tab visibility, `t0` is re-synchronized (`t0 = performance.now() / 1000`). This ensures `dt = 0` on the first resumed frame, completely preventing time leaps, camera jumps, or theme crossfade stutter.

### Strict Reduced-Motion Adherence
When `prefers-reduced-motion: reduce` is enabled:
- `spin: 0.0` (zero barrel roll).
- `scrollSpin: 0.0` (zero rotational deflection on scroll).
- `drift: 0.2` (slow drift to near-static calm drifting).
- `scrollPush: 0.0` and `scrollDrift: 0.0` (camera depth locking).
- `parallax: 0.0` (pointer parallax disabled).
- `repelStrength: 0.0` (cursor repulsion disabled).

---

## 4. CSS Containment & 60fps Compositor Invariants

### Below-the-Fold CSS Containment
CSS containment via `content-visibility: auto` skips rendering offscreen DOM subtrees until they approach the viewport:

```css
/* Below-the-fold landing sections */
.landing-section-contained,
.landing-section:not(.landing-hero),
.problem-section,
.story-introduction,
.intelligence-story-section,
.preference-sandbox-section,
.pipeline-section,
.privacy-section-container,
.vision-section-container,
.landing-faq,
.landing-finale,
.landing-footer {
  content-visibility: auto;
  contain-intrinsic-size: 1px 800px;
}
```

- **LCP Protection:** `.landing-hero` is explicitly excluded from `content-visibility: auto`. The above-the-fold hero renders immediately during initial page load, preventing layout shifts (CLS 0.000) and ensuring LCP <= 2.5s.
- **Containment Intrinsic Size:** `contain-intrinsic-size: 1px 800px` supplies estimated layout sizing to preserve accurate scrollbar metrics and prevent layout jitter during fast scrolling.

### Compositor-Only Mutation Invariant
All CSS `@keyframes` and transitions are restricted to GPU compositor-friendly properties:
- **Permitted Properties:** `transform` (`translate3d`, `translateX`, `translateY`, `scale`, `rotate`), `opacity`.
- **Prohibited Animation Properties:** `width`, `height`, `margin`, `padding`, `top`, `left`, `right`, `bottom`.
- **Elimination of `transition: all`:** Generic `transition: all` rules across interactive components (`.hero-btn-secondary`, `.telemetry-action-link`, `.landing-nav-links a`, `.hero-stage-pill`, `.code-block-wrapper`, `.citation-badge`) have been replaced with explicit paint and transform transitions (`transition: transform 0.2s ease, background-color 0.2s ease, border-color 0.2s ease, color 0.2s ease`), eliminating involuntary layout recalculation cascades on hover and focus.

---

## 5. Verification & Test Coverage

The performance engine is verified through automated test suites:

- `tests/unit/adaptive-quality.test.ts`:
  - Validates tier assignment across desktop, mobile, reduced-motion, save-data, low-core, and WebGL-disabled states.
  - Verifies exact star count constants (4,200 High, 1,800 Balanced, 600 Lightweight).
  - Validates non-browser and jsdom SSR fallback safety.
- `tests/unit/webgl-starfield.test.tsx`:
  - Verifies canvas element attributes (`#scene`, `.planet-canvas.starfield-canvas`, `aria-hidden="true"`).
  - Verifies `visibilitychange` registration and cleanup.
  - Verifies `IntersectionObserver` attachment and teardown on unmount.
- `pnpm run docs:check`:
  - Verifies zero broken links across all canonical documentation.
