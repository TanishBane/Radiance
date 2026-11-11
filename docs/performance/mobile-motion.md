# Radiance Mobile Motion & Touch Performance Specification

**Status:** Canonical Engineering Specification  
**Scope:** Mobile smartphones (iOS Safari, Android Chrome, Samsung Internet) and tablets (iPadOS, Android)  
**Governing Standards:** WCAG 2.5.5 Target Size, 60fps Mobile Frame Pacing, Zero Sticky Hover, Thermal Throttling Prevention  

---

## 1. Mobile Physical Constraints & Engineering Principles

Mobile devices introduce distinct hardware and interaction constraints compared to desktop workstations:
- **Thermal Dissipation Limits:** Passive cooling means sustained GPU work quickly triggers OS-level CPU/GPU frequency throttling.
- **Battery Preservation:** Continuous render loops can rapidly drain lithium-ion batteries.
- **Touch vs Pointer Ergonomics:** Touch has no cursor preview, possesses inherent spatial inaccuracy (~10mm finger pad contact), and triggers sticky hover states if not defended.
- **Dynamic Viewports & Software Keyboards:** The appearance of virtual keyboards and browser address bars dynamically shifts viewport height (`dvh` vs `svh` vs `vh`).

Radiance resolves these challenges through targeted mobile engineering without stripping away the visual soul of the product.

---

## 2. Hardware Clamping & Geometry Optimization

### Clamping Device Pixel Ratio (DPR)
Many contemporary smartphones feature ultra-high-density displays (e.g. iPhone Super Retina with 3x DPR). Rendering a full-viewport WebGL canvas at 3x DPR on a 1179×2556 screen requires rasterizing and calculating post-processing passes over **~9 million fragments every frame**.

Radiance enforces an explicit DPR clamp:

```typescript
// Enforced in webgl-starfield.tsx and ambient-canvas.tsx
const isMobile = window.innerWidth < 768;
const targetDpr = Math.min(window.devicePixelRatio || 1, isMobile ? 1.5 : 2.0);
renderer.setPixelRatio(targetDpr);
```

**Impact:** Capping mobile DPR to 1.5 reduces fragment shader invocations by over **55%** on 3x screens with zero perceived loss in visual clarity on mobile screen sizes.

### Mobile Geometry Scaling
Geometry complexity scales down dynamically on mobile devices:
- **Three.js Starfield:** Particle vertices scale from 4,200 (Desktop High) to 1,800 (Mobile Balanced) or 600 (Low Power).
- **Procedural Nebula (`ambient-canvas.tsx`):** Particle count drops from 2,200 to **650 points** when viewport width is below 768px.
- **Fluted Glass Torus:** The complex slit-scan SVG stage scales dynamically via responsive CSS clamp rules (`width: min(240px, 75vw)`) to maintain high-DPI rasterization performance without horizontal layout overflows.

---

## 3. Touch Interaction & Gesture Ergonomics

### Eliminating Sticky Hover States
On touch devices, CSS `:hover` states persist after tapping until another element is touched, creating confusing and unresponsive UI states. Radiance wraps all interactive hover transformations within `@media (hover: hover)` media queries:

```css
/* Touch-safe hover treatment */
@media (hover: hover) {
  .landing-cta:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 30px rgba(6, 182, 212, 0.4);
  }
}

/* Touch active feedback */
.landing-cta:active {
  transform: scale(0.98);
}
```

On mobile, buttons respond immediately to physical contact via `:active` and Framer `whileTap={{ scale: 0.98 }}`, providing crisp tactile feedback without sticky hover artifacts.

### Strict Tap Target Compliance (>=44×44px)
In compliance with WCAG 2.5.5 and Apple Human Interface Guidelines:
- All navigation links, drawer toggles, model selectors, and drawer action buttons enforce minimum dimensions of `44px × 44px` via `.touch-target` utilities.
- Segmented controls in `PreferenceSandbox` provide generous touch targets with padded hit zones, preventing accidental adjacent mode activations.

---

## 4. Virtual Keyboard & Viewport Resilience

When virtual keyboards open on mobile browsers (e.g. typing in the Radiance chat composer), conventional CSS `height: 100vh` causes bottom bars, action buttons, and inputs to be obscured beneath the keyboard.

### Next.js Viewport Configuration (`src/app/layout.tsx`)
```typescript
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#06060a",
  interactiveWidget: "resizes-content", // Virtual keyboard pushes content up
};
```

### Dynamic Viewport CSS Units
Radiance replaces rigid `100vh` declarations with `dvh` (Dynamic Viewport Height) and `svh` (Small Viewport Height), ensuring zero layout jumps as browser chrome expands or contracts during scrolling:

```css
.chat-workspace-shell {
  min-height: 100dvh;
  padding-bottom: env(safe-area-inset-bottom, 16px);
}
```

---

## 5. Reduced Motion & Battery-Saving Modes

On mobile devices operating under low-power modes or explicit user reduced-motion preferences:
1. **OS Preference Detection:** `useReducedMotion()` immediately disables entrance translates and scale transformations across all landing sections.
2. **WebGL Starfield Response:** Barrel rolling and void-repelling are set to `0.0`, while particle drift slows to a calm, imperceptible float (`uDrift: 0.2`).
3. **Data-Saver Integration:** When `navigator.connection.saveData === true`, the Adaptive Quality engine automatically shifts to the Lightweight tier, preserving both network bandwidth and battery charge.
