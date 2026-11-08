# RADIANCE MOBILE-FIRST ENGINEERING — SKILL UTILIZATION & MAPPING DIRECTORY

**Document ID:** RADIANCE-SKILL-MOBILE-001  
**Project:** RADIANCE — AI Productivity Platform  
**Mission:** Mobile-First Experience, Performance & Responsive Engineering  
**Date:** November 2026  
**Status:** ACTIVE & APPLIED  

---

## 1. Skill Discovery & System Architecture Overview

In strict accordance with the **Antigravity Master Directive** (Unified Engineering & Design Ecosystem) and the **Superpowers Workflow Suite**, the local skill catalog was thoroughly scanned to identify all authoritative capabilities relevant to mobile responsive design, high-craft mobile UI/UX, touch interactions, animation performance, accessibility compliance, and end-to-end mobile browser automation.

### Verified Active Skills Matrix

| Skill ID | Skill Name | Source & Location | Primary Architectural Role in Mission |
|:---|:---|:---|:---|
| **SKILL-01** | `frontend-design` | `~/.gemini/config/skills/frontend-design/SKILL.md` | Anti-slop creative direction, brand memorability, aesthetic point of view, craft floor for mobile surfaces. |
| **SKILL-02** | `ui-ux-pro-max` | `~/.gemini/config/skills/ui-ux-pro-max/SKILL.md` | Mobile design intelligence, design tokens, responsive typography scales, color contrast, and ergonomics. |
| **SKILL-03** | `responsive-mobile-first` | `~/.gemini/config/skills/responsive-mobile-first/SKILL.md` | Mobile-first media queries, safe-area insets (`env(safe-area-inset-*)`), fluid clamp scaling, container queries. |
| **SKILL-04** | `wcag-accessibility` | `~/.gemini/config/skills/wcag-accessibility/SKILL.md` | WCAG 2.1/2.2 AA touch target compliance (>= 44x44px), screen-reader live regions, accessible names, focus rings. |
| **SKILL-05** | `react-best-practices` | `~/.gemini/config/skills/react-best-practices/SKILL.md` | React 19 performance, render optimization, eliminating mobile waterfall queries, stable callback refs. |
| **SKILL-06** | `animation-fundamentals` | `~/.gemini/config/skills/animation-fundamentals/SKILL.md` | 60/120fps GPU compositing (transform & opacity), motion curves, responsive choreography, spring physics. |
| **SKILL-07** | `reduced-motion-inclusive-ux`| `~/.gemini/config/skills/reduced-motion-inclusive-ux/SKILL.md`| Zero-duration instant fallback for `prefers-reduced-motion`, vestibular protection, non-jarring feedback. |
| **SKILL-08** | `tailwind-css-best-practices`| `~/.gemini/config/skills/tailwind-css-best-practices/SKILL.md`| Modern Tailwind CSS v4 practices, semantic token usage, elimination of arbitrary brittle styles. |
| **SKILL-09** | `playwright-e2e-testing` | `~/.gemini/config/skills/playwright-e2e-testing/SKILL.md` | Mobile device emulation (Pixel 5, iPhone 14), headless automation, touch simulation, horizontal overflow audit. |
| **SKILL-10** | `verification-before-completion`| `~/.gemini/config/skills/verification-before-completion/SKILL.md`| Strict evidence-before-claims discipline: run verification command fresh in turn, inspect exit 0 and outputs. |

---

## 2. Skill Application Workflows by Mission Phase

### Phase 0: Mobile Experience Audit
- **Applied Skills:** `responsive-mobile-first`, `wcag-accessibility`, `frontend-design`.
- **Workflow:** Audited DOM nodes, horizontal scroll boundaries, touch target dimensions across viewports (320px–430px), keyboard focus indicators, and Three.js overhead.

### Phase 1 & 2: Mobile Architecture & Navigation Re-engineering
- **Applied Skills:** `frontend-design`, `ui-ux-pro-max`, `responsive-mobile-first`, `animation-fundamentals`.
- **Workflow:** Engineered compact mobile topbar, dedicated thumb-zone bottom navigation bar, polished slide-out navigation drawers, accessible bottom sheets for secondary actions.

### Phase 3: Mobile Welcome Hero & Adaptive Prompts
- **Applied Skills:** `frontend-design`, `ui-ux-pro-max`, `responsive-mobile-first`.
- **Workflow:** Streamlined hero greeting, compact visual branding, horizontally scrollable category tabs, tap-optimized suggested prompt cards with immediate feedback.

### Phase 4: Conversation Experience & Content Rendering
- **Applied Skills:** `frontend-design`, `wcag-accessibility`, `responsive-mobile-first`.
- **Workflow:** Responsive markdown typography, horizontally scrollable table wrappers, syntax-highlighted code blocks with dedicated touch controls, KaTeX formula overflow guards, accessible 3-dots mobile action menu with speech read-aloud support.

### Phase 5: Mobile Unified AI Composer
- **Applied Skills:** `ui-ux-pro-max`, `react-best-practices`, `responsive-mobile-first`, `animation-fundamentals`.
- **Workflow:** Dynamic 100dvh safe-area pinned composer, bottom-sheet model and mode selection, responsive control wrapping, touch-first attachment picker and recording indicator.

### Phase 7: Three.js & Performance Profiling
- **Applied Skills:** `react-best-practices`, `animation-fundamentals`, `reduced-motion-inclusive-ux`.
- **Workflow:** Adaptive particle count (scaling down from 2200 to 600 on mobile viewports), DPR capped at 1.5 on mobile, background animation paused when tab/page is hidden via `visibilitychange`, GPU-composited CSS transforms.

### Phase 8 & 9: Verification & Regression Testing
- **Applied Skills:** `playwright-e2e-testing`, `verification-before-completion`.
- **Workflow:** Comprehensive mobile Playwright test suite covering navigation, welcome screen, composer, bottom navigation, model bottom sheets, orientation changes, and horizontal overflow checks across 320px, 375px, 390px, 412px, 768px, and 1440px viewports.
