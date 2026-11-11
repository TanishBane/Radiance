# Radiance AI — Cross-Browser & Cross-Engine Compatibility Specification

## 1. Architectural Scope & Target Browser Matrix

Radiance is engineered for seamless visual fidelity, smooth 60 FPS compositor execution, and zero functional regressions across three primary browser engine families and six major browser targets:

| Engine Family | Target Browsers | Platforms Supported | Engine Minimum Standard |
| :--- | :--- | :--- | :--- |
| **Blink / Chromium** | Google Chrome, Microsoft Edge, Brave, Samsung Internet, Opera | Windows, macOS, Android, Linux | Chrome 110+, Edge 110+, Samsung Internet 21+ |
| **WebKit** | Apple Safari, iOS Safari, iPadOS Safari, iOS WKWebView | macOS Ventura+, iOS 16+, iPadOS 16+ | Safari 16.4+ (Full Container Query & DVH support) |
| **Gecko** | Mozilla Firefox, Firefox for Android | Windows, macOS, Linux, Android | Firefox 115+ (ESR & Modern Release) |

---

## 2. Engine-Specific Compatibility Solutions

### 2.1 WebKit / Mobile Safari Engineering
* **Vendor-Prefixed Backdrop Filters:**
  WebKit requires `-webkit-backdrop-filter` for glassmorphic blurring. Every glass surface across [`globals.css`](file:///c:/Tanixai-main/src/app/globals.css), [`hero-landscape.css`](file:///c:/Tanixai-main/src/components/landing/hero-landscape.css), and [`dynamic-theme-indicator.tsx`](file:///c:/Tanixai-main/src/components/landing/dynamic-theme-indicator.tsx) declares `-webkit-backdrop-filter` alongside standard `backdrop-filter`.
* **Dynamic Viewport Height & Safe Areas:**
  To prevent the Safari dynamic address bar and home indicator from clipping content or creating dead scroll space:
  ```css
  :root {
    --viewport-height: 100vh;
    --viewport-height: 100dvh;
    --sat: env(safe-area-inset-top, 0px);
    --sab: env(safe-area-inset-bottom, 0px);
  }
  ```
  All full-bleed containers utilize `.safe-min-h-screen`, `.safe-h-svh`, or `min-h-[100dvh]`.
* **Input Zoom Prevention:**
  iOS Safari automatically zooms into forms if the font size is below 16px. All chat composer inputs and search boxes enforce `font-size: 16px` (`text-base`) on mobile viewports (`max-width: 640px`).
* **Keyboard-Aware Content Resizing:**
  In [`src/app/layout.tsx`](file:///c:/Tanixai-main/src/app/layout.tsx), the Next.js `Viewport` is configured with `interactiveWidget: "resizes-content"`, guaranteeing that when the on-screen keyboard appears on iOS and Android, the visual viewport resizes and keeps the active message composer fully accessible.

### 2.2 Gecko / Mozilla Firefox Engineering
* **Scrollbar Styling & Overflow:**
  Firefox implements CSS Scrollbars standard rather than `-webkit-scrollbar`. Radiance configures standard properties:
  ```css
  scrollbar-width: thin;
  scrollbar-color: color-mix(in srgb, var(--accent) 38%, var(--deep)) transparent;
  ```
  and uses `[scrollbar-width:none]` for seamless swipeable rows.
* **SVG Filter & Subpixel Rounding:**
  Firefox renders subpixel layout bounds with high strictness. Fluid clamp boundaries utilize explicit pixel or rem minimums to eliminate fractional subpixel bleeding.

### 2.3 Chromium & Samsung Internet Engineering
* **Touch-Action Manipulation:**
  To eliminate the 300ms mobile tap delay and prevent accidental double-tap gesture zooming on buttons, all interactive pills, CTAs, and composer triggers specify `touch-action: manipulation;`.
* **Hover State Sticky Protection:**
  Mobile Chromium devices can get stuck in hover states after tapping. Interactive hover transitions are scoped with `@media (hover: hover) and (pointer: fine)` so mobile tap feedback is immediate via `:active` states without persistent hover artifacts.

---

## 3. WebGL Cross-Engine Resilience

1. **Strict GLSL 1.0 ES Syntax:**
   Mobile GPU shader compilers (e.g., Qualcomm Adreno, ARM Mali, Apple Silicon) strictly require floating-point numbers to include explicit decimal points. All vectors and constants in [`webgl-starfield.tsx`](file:///c:/Tanixai-main/src/components/landing/webgl-starfield.tsx) use explicit float literals (`vec3(1.0, 2.0, 4.0)`, `0.0`, `1.5`) preventing compilation rejections on Android and iOS GPUs.
2. **WebGL Context Loss & Restoration:**
   Mobile browsers terminate WebGL contexts during backgrounding or memory pressure. Active listeners intercept `webglcontextlost` (canceling RAF to prevent console spam) and `webglcontextrestored` (smoothly reinitializing textures and geometry).
3. **Adaptive Thermal Throttling:**
   On mobile devices, `renderer.setPixelRatio` is clamped to `Math.min(window.devicePixelRatio, 1.5)` (desktop clamped to 2.0). This prevents high-DPI smartphone screens (such as 3x Retina or 4k AMOLED) from saturating GPU fill-rate budgets.
4. **Visibility & Intersection Observer:**
   When the browser tab is hidden (`document.hidden`) or the `#scene` canvas is scrolled out of viewport, the animation loop stops completely, resuming with timestamp resynchronization on re-entry.

---

## 4. Automated Cross-Browser Test Matrix

Playwright test suites execute across the following engine profiles:
* **`chromium`**: Desktop Google Chrome / Edge baseline (1280x800).
* **`firefox`**: Desktop Mozilla Firefox (1280x800).
* **`webkit`**: Desktop Apple Safari engine (1280x800).
* **`Mobile Chrome`**: Emulating Google Pixel 5 on Android (393x851, DPR 2.75).
* **`Mobile Safari`**: Emulating Apple iPhone 13 (390x844, DPR 3.0).
* **`Tablet`**: Emulating Apple iPad gen 7 (810x1080, DPR 2.0).

All critical user flows (Landing navigation, Context pipeline, Preference sandbox, Chat composer focus, and Drawer dismissals) maintain 100% pass parity across all six profiles.
