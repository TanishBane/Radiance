# RADIANCE Homepage & Experience Overhaul Plan

> **Goal:** Elevate Radiance into a world-class, premium, motion-rich, multicolour AI product website with flawless document scrolling, responsive precision, and WCAG AA accessibility.

---

## 1. Root Cause Analysis & Architecture Plan

### The Scrolling Defect
- **Root Cause:**
  1. `src/app/globals.css`: Base ruleset `html, body { ... overflow: hidden; }` locked viewport scrolling globally.
  2. `src/app/layout.tsx`: `<body className="... h-[100dvh] overflow-hidden ...">` forced body to fixed 100dvh with hidden overflow.
  3. `src/components/landing/landing-redesign.css`: Set `.landing-root { height: auto; overflow-y: visible; }`, preventing any inner scroll while the root document was locked.
  4. `src/components/landing/landing-nav.tsx`: Attached scroll event listener to `.landing-root` instead of `window`.
- **Architectural Solution:**
  1. Set `html { scroll-behavior: smooth; }` and `body { min-height: 100%; min-height: 100dvh; overflow-x: hidden; }` in `globals.css`.
  2. In `src/app/layout.tsx`, remove `h-[100dvh] overflow-hidden` from `body`.
  3. In `src/features/chat/components/radiance-app.tsx`, verify that `/chat` continues to encapsulate its own `h-[100dvh] overflow-hidden` view cleanly without requiring global document lock.
  4. In `src/components/landing/landing-nav.tsx`, bind scroll listener to `window.scrollY`.
  5. Add automated Playwright regression tests specifically asserting mouse-wheel scroll, PageDown keyboard navigation, and scroll position restoration.

---

## 2. Research & Documentation Plan
- Create `docs/landing-page/visual-research.md` documenting references: Linear, Stripe, Framer, Raycast, Vercel, Apple, Perplexity, Anthropic, 21st.dev.
- Create `docs/landing-page/frontend-skills-implementation.md` documenting all active skills: `frontend-design`, `ui-ux-pro-max`, `design-system`, `typography-font-pairing`, `motion-react-framer`, `animation-fundamentals`, `color-theory-palette-design`, `visual-hierarchy-composition`, `responsive-mobile-first`, `wcag-accessibility`, `playwright-e2e-testing`.

---

## 3. Multicolour Design System & Typography Engineering
- **Semantic Multicolour Design Tokens:**
  - Ambient deep foundation: `--void: #06050b; --deep: #0c0a16; --surface: rgba(255,255,255,0.035);`
  - Luminous intelligence signals:
    - Blue & Cyan: Hero, telemetry, connectivity, model flow.
    - Violet & Indigo: Personal Intelligence, contextual memory, retrieval tags.
    - Coral & Rose: Human expression, creative warmth, key callouts.
    - Emerald & Teal: Privacy vault, local browser security, client trust.
    - Amber & Gold: Discovery, synthesis, future horizon.
  - Multi-tier gradients and light sweeps instead of repetitive purple mesh.
- **Typography Scale:**
  - Calibrate Plus Jakarta Sans & JetBrains Mono with fluid `clamp()`.
  - Display title: `clamp(2.75rem, 5.5vw, 4.75rem)`, tracking `-0.035em`, line-height `1.08`.
  - Section titles: `clamp(2rem, 3.8vw, 3rem)`, tracking `-0.025em`, line-height `1.15`.
  - Subheadings: `clamp(1.2rem, 2vw, 1.5rem)`, tracking `-0.015em`, line-height `1.35`.
  - Tabular data and metadata tags formatted with `font-variant-numeric: tabular-nums`.

---

## 4. Professional Motion System (Motion for React / Framer Motion)
- **Entrance Choreography:**
  - Nav: Subtle reveal with backdrop blur.
  - Hero: Staggered entrance for eyebrow pill, display headline, lede description, dual CTAs, and interactive conversation canvas.
- **Scroll-Triggered Reveals:**
  - Feature cards, comparison panels, privacy cards, and FAQ items reveal smoothly using `motion.div` with `whileInView` and `viewport={{ once: true, margin: "-60px" }}`.
- **Interactive Demonstrations:**
  - Personal Intelligence Interactive Sandbox: Allow clicking between context tags (e.g., "Thesis outline", "Tone: Concise & Direct", "Inline Citations") to watch the live illustrative connector lines and response card morph dynamically.
  - Interactive Preview tabs with seamless `layoutId` pill indicators.
- **Micro-Interactions & Tactile Polish:**
  - Tactile spring hover/tap on buttons and cards.
  - GPU-accelerated transforms & opacity only.
  - Complete `prefers-reduced-motion` compliance.

---

## 5. Visual QA & Verification
- Test all viewport widths: 1920px, 1440px, 1280px, 1024px, 768px, 430px, 390px, 375px, 360px.
- Playwright screenshot capture and visual verification.
- Final suite verification: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm test:e2e`, `pnpm build`.
- Generate comprehensive `docs/landing-page/frontend-overhaul-report.md`.
