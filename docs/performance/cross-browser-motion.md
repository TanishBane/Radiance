# Radiance Cross-Browser Motion & Rendering Specification

**Status:** Canonical Engineering Specification  
**Scope:** Chromium (Google Chrome, Microsoft Edge, Brave, Samsung Internet), WebKit (Safari Desktop, iOS Safari), Gecko (Mozilla Firefox)  
**Governing Standards:** Cross-Engine Rendering Fidelity, WebGL Context Resilience, Vendor Prefix Hygiene, 60fps Animation Stability  

---

## 1. Cross-Browser Engine Landscape & Invariants

Radiance is engineered to deliver identical visual quality and smooth 60fps/120fps motion across all major browser rendering engines:

| Engine | Primary Browsers | Key Rendering Characteristics |
| :--- | :--- | :--- |
| **Blink / V8** | Google Chrome, MS Edge, Brave, Opera, Samsung Internet | Hardware-accelerated compositing thread, aggressive V8 JIT, high touch/pointer coalescing. |
| **WebKit / JSC** | Apple Safari (macOS, iPadOS, iOS) | Strict power management, proprietary `-webkit-` prefixes for backdrop filters, dynamic toolbar viewport shifts. |
| **Gecko / SpiderMonkey** | Mozilla Firefox | Independent compositor architecture, distinct subpixel font rasterization, strict WebGL canvas memory reclamation. |

---

## 2. WebKit (Safari & iOS Safari) Specific Optimizations

### 1. Dual Prefix Backdrop Filters
WebKit requires the `-webkit-backdrop-filter` vendor prefix to activate frosted glass blurs. Omission causes elements to render with flat, semi-opaque backgrounds:

```css
/* Canonical Radiance frosted surface declaration */
.fluted-slat,
.fluted-stage-badge,
.hero-telemetry-dock {
  background: rgba(8, 12, 28, 0.45);
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
}
```

### 2. Preventing 3D Transform Flattening
Safari aggressively flattens 3D transform layers unless explicitly instructed to preserve depth. In the fluted glass reeded prism and 3D tilt effects, Radiance specifies:

```css
.fluted-stage-shell {
  perspective: 1000px;
  -webkit-perspective: 1000px;
  transform-style: preserve-3d;
  -webkit-transform-style: preserve-3d;
}
```

### 3. Safari Address Bar Dynamic Viewport Jump Protection
Safari on iOS dynamically collapses and expands its bottom address bar during scrolling. Using conventional `100vh` causes jarring content jumps. Radiance uses dynamic viewport units with backward-compatible fallbacks:

```css
.landing-root {
  min-height: 100vh;
  min-height: 100dvh;
}
```

---

## 3. Chromium (Chrome, Edge, Samsung Internet) Optimizations

### 1. Independent Compositor Layer Promotion
Chromium offloads `transform` and `opacity` mutations to an independent Compositor thread, bypassing the main thread. To guarantee that continuous background animations (such as the rotating `.aurora-torus-svg`) never contend with main-thread JavaScript execution:

```css
.aurora-torus-svg {
  will-change: transform;
  transform: translateZ(0);
  -webkit-transform: translateZ(0);
}
```

This promotes the element to its own GPU render layer, isolating repaints and maintaining 60fps even during heavy JSON parsing or token streaming.

### 2. High-Frequency Pointer Event Decoupling
Chromium dispatches `pointermove` events at the hardware polling rate of the input device (up to 1,000Hz on gaming mice). Synchronous DOM or canvas mutations inside pointer listeners cause input latency spikes (INP). Radiance stores coordinates in scalar refs and defers all canvas updates to the browser's `requestAnimationFrame` pulse.

---

## 4. Mozilla Firefox (Gecko) Optimizations

### 1. Subpixel Text Rendering & Antialiasing
Firefox on macOS and Windows uses distinct text rasterizers that can appear heavier on dark atmospheric backgrounds. Radiance enforces standard font smoothing across all platforms:

```css
body {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}
```

### 2. Canvas 2D Path & Line Performance
In `AtmosphereCanvasEngine` and `AtmosphericParticles`, Firefox performs best when path allocations are minimized. Particle rendering uses pre-allocated sprite textures or single batched `ctx.arc()` loops rather than instantiating hundreds of independent `Path2D` objects per frame.

---

## 5. WebGL Context Loss & Restoration Lifecycle

Across all browsers, WebGL contexts can be reclaimed by the operating system under high GPU memory pressure or when waking from system sleep.

Both `webgl-starfield.tsx` and `ambient-canvas.tsx` implement robust context loss event handlers:

```typescript
// Context loss defensive resilience
canvas.addEventListener("webglcontextlost", (event) => {
  event.preventDefault(); // Informs the browser that the application handles recovery
  if (animIdRef.current) {
    cancelAnimationFrame(animIdRef.current);
    animIdRef.current = null;
  }
});

canvas.addEventListener("webglcontextrestored", () => {
  reinitializeScene(); // Safely re-allocates shaders, buffers, and textures
});
```

This prevents unhandled runtime exceptions and ensures the atmospheric canvas recovers automatically when the browser restores GPU resources.
