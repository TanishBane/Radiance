# Radiance Visual Design Research & Architectural Synthesis

*Conducted on 2026-11-09 by the Principal Frontend Architect & Creative Developer.*

---

## 1. Executive Summary

To transform the Radiance homepage from a static mockup into a high-craft, motion-engineered, multicolour AI product platform, we conducted in-depth design and interaction research across benchmark technology leaders and design repositories.

Rather than copying individual landing pages or relying on generic SaaS templates, we extracted foundational visual principles, motion dynamics, typographic systems, and multicolour atmospheric techniques tailored to Radiance's identity.

---

## 2. In-Depth Reference Studies & Selected Techniques

### 2.1 Linear (https://linear.app/)
- **Core Strengths:** Relentless typographic restraint, surgical negative space, subtle hairline borders (`rgba(255,255,255,0.08)`), high optical hierarchy without loud decoration.
- **Techniques Selected for Radiance:**
  - Ultra-crisp subheadings with high contrast primary text and calibrated `--txt-dim` secondary copy.
  - Bento card micro-borders with subtle inset highlights.
  - Keyboard shortcut signifiers and technical pill tags.
  - Calm, focused reading rhythm that lets the product interface command the stage.

### 2.2 Stripe (https://stripe.com/)
- **Core Strengths:** World-class multicolour gradients, luminous atmospheric depth, narrative visual storytelling, and multi-tier interactive demonstrations.
- **Techniques Selected for Radiance:**
  - Dynamic multicolour identity across sections: shifting from cosmic cyan/blue in the hero, to deep violet in personal context, emerald in privacy, and warm coral/amber in future vision and conversion.
  - Multi-stop mesh gradients that blend into rich deep surfaces rather than washed-out white or flat black.
  - Clean floating surfaces with multi-layered specular drop shadows.

### 2.3 Framer (https://www.framer.com/)
- **Core Strengths:** Dynamic, kinetic visual rhythm, spring-based motion physics, interactive preview tabs, and fluid component transitions.
- **Techniques Selected for Radiance:**
  - Declarative entrance choreography using `motion/react` with spring easing curves (`cubic-bezier(0.16, 1, 0.3, 1)`).
  - Interactive preview step selector with animated layout transition pills.
  - Tactile micro-interactions (`whileHover={{ scale: 1.02 }}`, `whileTap={{ scale: 0.98 }}`).

### 2.4 Raycast (https://raycast.com/)
- **Core Strengths:** Direct integration of the actual product interface into the marketing experience, showing real utility and keyboard-driven ergonomics.
- **Techniques Selected for Radiance:**
  - Concrete illustrative representation of the Radiance conversation view and Personal Intelligence vault.
  - Direct, honest interactive demonstrations showing how saved notes and response preferences influence model outputs.

### 2.5 Vercel (https://vercel.com/)
- **Core Strengths:** Precise geometric grids, monospace technical telemetry, clean light cones, and exceptional typography.
- **Techniques Selected for Radiance:**
  - Strict 4px/8px rhythm across all card padding and section margins.
  - Tabular numeric alignment (`tabular-nums`) for technical metrics and step indicators.
  - Subtle top-edge light highlights on card containers (`border-t border-white/10`).

### 2.6 Apple (https://apple.com/)
- **Core Strengths:** Typographic scale discipline, fluid typography via `clamp()`, generous spatial breathing room, and scroll-guided narrative progression.
- **Techniques Selected for Radiance:**
  - Balanced display headlines with comfortable line heights (`1.08`) and tight letter-spacing (`-0.035em`).
  - Staggered scroll reveals that guide the visitor through value proposition, product mechanics, privacy guarantees, and conversion.

### 2.7 21st.dev & Design Galleries (Awwwards, Godly, Land-book)
- **Core Strengths:** Cutting-edge React UI experiments, modern ambient background animations, and creative bento compositions.
- **Techniques Selected for Radiance:**
  - Ambient breathing background glow implemented with GPU-composited CSS transforms and SVG filters, maintaining 60fps/120fps with zero layout thrashing.
  - Accessible interactive accordion with smooth height animation and proper ARIA states.

---

## 3. Radiance Visual Identity: Multicolour Synthesis

Radiance is not a monochrome black-and-violet website. We establish a cohesive multicolour design system:

| Section | Color Personality | Chromatic Tokens | Emotional & Product Signal |
|---|---|---|---|
| **Global Navigation** | Deep obsidian glass | `--void`, `--border` | Elevated platform foundation |
| **Hero Showcase** | Electric Blue & Cyan | `#3b82f6` · `#06b6d4` | High-precision intelligence & connectivity |
| **Personal Intelligence** | Luminous Violet & Indigo | `#8b5cf6` · `#6366f1` | Contextual memory & personalized synthesis |
| **Product Mechanics** | Precision Cyan & Azure | `#06b6d4` · `#2563eb` | Lexical retrieval & transparent architecture |
| **Privacy Vault** | Shield Emerald & Teal | `#10b981` · `#14b8a6` | Client-side security & zero-dark-patterns |
| **Vision & Horizon** | Aurora Coral & Amber | `#f59e0b` · `#f43f5e` | Expanding potential & adaptive future |
| **Final Conversion** | Full Cosmic Spectrum | Multi-gradient glow | Direct invitation into `/chat` |

All color combinations are mathematically verified to exceed WCAG 2.2 Level AA contrast requirements (>= 4.5:1 for body copy and >= 3.0:1 for large display headlines and interactive controls).
