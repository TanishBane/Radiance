# Radiance Skill Application Matrix — Immersive Overhaul

**Target System:** Radiance Personal AI Public Experience (`/`)  
**Date:** November 9, 2026  
**Author:** Principal Frontend Architect & Creative Developer

---

## 1. Skill Inventory & Provenance

| Skill Name | Capability Domain | Source / Repository | License | Implementation Phase |
|---|---|---|---|---|
| **`frontend-design`** | Creative direction, anti-slop principles | Anthropic Skills Ecosystem | Apache-2.0 | Section compositions, visual rhythm, atmosphere |
| **`ui-ux-pro-max`** | Design intelligence, tokens, typography | Curated Agentic Catalog | MIT | OKLCH tokens, 9-family palette, optical contrast |
| **`design-system`** | Token hierarchy, surface elevation, FOUT | Antigravity Core Ecosystem | MIT | Semantic CSS variables, glassmorphic surfaces |
| **`typography-font-pairing`**| Fluid scale, modular scale, tabular type | Antigravity Core Ecosystem | MIT | Plus Jakarta Sans, clamp scales, letter-spacing |
| **`motion-react-framer`** | Framer Motion, spring physics, layoutId | `frontend-ai-skills` | MIT | Hero entrance, preference morphing, AnimatePresence |
| **`animation-fundamentals`** | 60fps budgets, GPU compositing | Antigravity Motion Group | MIT | `transform: translate3d`, opacity transitions |
| **`component-engineering`** | Compound patterns, polymorphic props | React Patterns Catalog | MIT | Modular section components, typed interfaces |
| **`react-best-practices`** | Waterfall elimination, RSC boundaries | Vercel Engineering Labs | MIT | Server/client split, hydration safety |
| **`wcag-accessibility`** | WCAG 2.2 AA standards, 4.5:1 contrast | A11y Standards Repository | MIT | Screen-reader tree, ARIA landmarks, focus rings |
| **`responsive-mobile-first`**| Mobile-first breakpoints, touch targets | Responsive Web Catalog | MIT | 360px–1920px fluid layouts, >=44px touch targets |
| **`reduced-motion-inclusive-ux`**| Vestibular safety, zero motion fallbacks | A11y Standards Repository | MIT | `@media (prefers-reduced-motion: reduce)` rules |
| **`browser-screenshot-review`**| Headless browser multi-viewport capture| Quality Assurance Catalog | MIT | Playwright multi-viewport captures (390, 768, 1440) |
| **`verification-before-completion`**| Evidence-first discipline, zero guessing| Superpowers Workflow Suite | MIT | Terminal verification before claiming success |

---

## 2. Phase-by-Phase Application & Concrete Architectural Decisions

### Phase 1: Creative Direction & Atmospheric Color Progression
- **Skills Applied:** `frontend-design`, `ui-ux-pro-max`, `design-system`
- **Concrete Decisions Influenced:**
  - Rejected black-and-violet-only monotony. Evolved the hero directly from the user's chat interface screenshot: deep teal (`#0d3846`), bright turquoise (`#06b6d4`), and ocean sapphire (`#1d4ed8`).
  - Defined explicit CSS custom properties for 9 color families in `src/components/landing/landing-atmosphere.css`.
  - Constructed layered glassmorphic surfaces with `backdrop-filter: blur(20px)` and subtle rim illumination (`border-top: 1px solid rgba(6, 182, 212, 0.3)`).

### Phase 2: Typography & Composition Refinement
- **Skills Applied:** `typography-font-pairing`, `frontend-design`
- **Concrete Decisions Influenced:**
  - Standardized all display and section headings on Plus Jakarta Sans (`var(--font-sans)`).
  - Applied fluid clamp sizing: `font-size: clamp(2.5rem, 5vw, 4.5rem);` with `-0.03em` tracking on display titles.
  - Formatted technical metadata in monospace uppercase badges (`letter-spacing: 0.05em`).

### Phase 3: Motion Engineering & Interactive Demonstrations
- **Skills Applied:** `motion-react-framer`, `animation-fundamentals`, `reduced-motion-inclusive-ux`
- **Concrete Decisions Influenced:**
  - Used `motion/react` spring configurations (`type: "spring", stiffness: 350, damping: 30`) for natural, responsive interactions.
  - Interactive Preference Sandbox (`preference-sandbox.tsx`): visitors can toggle between `Concise`, `Detailed`, and `Structured` with real-time text morphing and animated indicator pills.
  - Interactive Hero Suggestion Cards: clicking pills ("character from a book", "pack accordingly") injects the prompt into the mock composer with instant feedback.
  - Strict `@media (prefers-reduced-motion: reduce)` overrides to neutralize animations for vestibular safety.

### Phase 4: Truthful Technical Communication & Privacy Fortress
- **Skills Applied:** `wcag-accessibility`, `frontend-design`
- **Concrete Decisions Influenced:**
  - Transparently disclosed the current bounded lexical retrieval implementation (avoiding false marketing hype about complex vector databases).
  - Explicitly disclosed that Personal Intelligence profile storage is browser-local plaintext, context transmission is opt-in, and one-click data wipe is supported.

### Phase 5: Verification & Browser Automation
- **Skills Applied:** `browser-screenshot-review`, `verification-before-completion`
- **Concrete Decisions Influenced:**
  - Built automated Playwright E2E suites verifying natural scrolling, interactive toggles, touch targets, and contrast across 1440px, 768px, and 390px viewports.
  - Executed all 4 review passes with fresh screenshot evidence saved to disk.
