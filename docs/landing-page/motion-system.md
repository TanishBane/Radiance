# Radiance Motion & Interaction Design System

**Target System:** Radiance Personal AI Public Experience (`/`)  
**Date:** November 9, 2026  
**Engine:** Motion for React (`motion/react` v12+) & GPU Compositor CSS  
**Philosophy:** Purposeful, Tactile, Fluid, and Accessible

---

## 1. Motion Principles

1. **Motion Has Semantic Purpose:** Every animation must guide the user's eye, communicate state change, or demonstrate a product capability. No arbitrary decorative twirling.
2. **Spring Physics Over Mechanical Timing:** Natural interactions behave like physical objects with mass, spring tension, and damping.
3. **Compositor Exclusivity (60/120 FPS):** All motion operates exclusively on `transform: translate3d()`, `scale()`, and `opacity`. Layout properties (`width`, `height`, `margin`, `top`, `left`) are never continuously animated on scroll.
4. **Reduced-Motion Respect:** When `prefers-reduced-motion: reduce` is enabled, all motion immediately snaps to completed state with zero duration and zero displacement.

---

## 2. Spring Physics Presets

```typescript
// Standard Spring for UI Entrances & Staggers
export const springSmooth = {
  type: "spring",
  stiffness: 350,
  damping: 30,
  mass: 1,
};

// Snappy Spring for Micro-Interactions (Buttons, Toggles, Tags)
export const springSnappy = {
  type: "spring",
  stiffness: 450,
  damping: 25,
  mass: 0.8,
};

// Gentle Easing for Large Atmospheric Gradient Transitions
export const transitionAtmosphere = {
  duration: 0.8,
  ease: [0.16, 1, 0.3, 1], // Custom cubic-bezier (anticipatory decelerate)
};
```

---

## 3. Scroll-Triggered Reveal Architecture

Sections utilize `whileInView` with configured viewport thresholds (`once: true, amount: 0.2`) to trigger reveal sequences without thrashing the render loop:

```tsx
<motion.div
  initial={{ opacity: 0, y: 32 }}
  whileInView={{ opacity: 1, y: 0 }}
  viewport={{ once: true, amount: 0.2 }}
  transition={springSmooth}
>
  {/* Section Content */}
</motion.div>
```

### Staggered Child Reveal Variant
For lists of cards, suggestion items, and pipeline nodes:
```typescript
export const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05,
    },
  },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: springSmooth,
  },
};
```

---

## 4. Interactive State Transitions

### A. Preference Sandbox Morphing
In the interactive Response Preference demonstration (`preference-sandbox.tsx`):
- Active tab pill uses `layoutId="activePreferenceIndicator"` to glide smoothly between `Concise`, `Detailed`, and `Structured`.
- Output preview card uses `AnimatePresence mode="wait"` to smoothly fade out old content and slide in new content with `opacity` and `y: 8`.

### B. Hero Suggestion Pills
In the hero interface stage (`hero-product-stage.tsx`):
- Suggestion pills react to hover with `scale: 1.02` and border glow intensification.
- Clicking a suggestion activates a quick ripple pulse (`scale: 0.98 -> 1.0`) and immediately types the prompt into the mock composer dock.

---

## 5. Reduced Motion Enforcement

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.001s !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.001s !important;
    scroll-behavior: auto !important;
  }
  
  .radiance-aurora-glow,
  .radiance-orbit-pulse,
  .radiance-pipeline-flow {
    animation: none !important;
    transform: none !important;
  }
}
```

In React components:
```typescript
import { useReducedMotion } from "motion/react";

const shouldReduceMotion = useReducedMotion();
const transition = shouldReduceMotion ? { duration: 0 } : springSmooth;
```
