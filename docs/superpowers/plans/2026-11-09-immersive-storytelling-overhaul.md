# Radiance Immersive Product Storytelling Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the Radiance homepage into an immersive, multicoloured, highly dynamic product storytelling experience inspired directly by the existing atmospheric chat UI source of truth, featuring 8 distinctive narrative sections, interactive sandboxes, fluid scroll-triggered motion, and rigorous visual QA.

**Architecture:** Build modular, client-side progressive enhancement components using `motion/react` layered over semantic Next.js App Router server boundaries. Establish a progressive section colour environment system in CSS, transitioning from deep oceanic teal and electric cyan into sapphire, lavender, rose, coral, emerald, and culminating in an expansive multi-chromatic sunset auroral landscape.

**Tech Stack:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Motion for React (`motion/react`), Lucide & Tabler Icons, Vitest, Playwright.

**Spec:** User request: "RADIANCE — IMMERSIVE PRODUCT STORYTELLING WEBSITE" and reference screenshot `media_1794212657038_5cf1075d.jpg`.

## Global Constraints
- Preserve existing application routes: `/chat`, `/api/chat`, conversation storage, model selection, Personal Intelligence profile store, settings.
- Do NOT touch `docs/github/*` or execute Git history rewrites.
- Do NOT change Git author identity (`TanishBane <tanishbane99@gmail.com>`).
- Maintain WCAG 2.2 Level AA accessibility (minimum 4.5:1 body copy contrast, keyboard navigation, `@media (prefers-reduced-motion: reduce)` fallbacks).
- Maintain natural document scrolling (zero global scroll lockouts, no scroll-hijacking).
- Zero build, lint, or TypeScript errors across the repository.

## Review Focus
1. Natural scrolling: Mouse-wheel, keyboard, and touch gestures must scroll smoothly from Section 1 to Section 8 without deadlocks.
2. Atmospheric brand continuity: Hero and subsequent sections must visibly inherit the deep teal, cyan, and violet aurora from the product UI screenshot.
3. Interactive sandboxes: Preference toggles (Concise/Detailed/Structured) and suggestion cards must react to user clicks with real-time UI state updates.
4. Mobile ergonomics: No horizontal overflow across 360px–430px viewports; touch targets must measure >=44x44px.
5. Reduced motion compliance: All transforms and keyframes must collapse to zero duration when `prefers-reduced-motion` is active.

---

### Task 1: Research Documentation & Skill Application Matrix

**Files:**
- Create: `docs/landing-page/visual-reference-study.md`
- Create: `docs/landing-page/skill-application-matrix.md`
- Create: `docs/landing-page/motion-system.md`

- [ ] Step 1: Write `docs/landing-page/visual-reference-study.md` analyzing Stripe (gradient landscapes), Framer (scroll-driven interaction), Linear (typography & precision), Raycast (product UI storytelling), Vercel (technical grid systems), Apple (cinematic pacing), and 21st.dev components.
- [ ] Step 2: Write `docs/landing-page/skill-application-matrix.md` mapping the 10 Core Frontend Skills (`frontend-design`, `ui-ux-pro-max`, `design-system`, `typography-font-pairing`, `motion-react-framer`, etc.) to specific implementation phases.
- [ ] Step 3: Write `docs/landing-page/motion-system.md` specifying spring physics parameters, scroll progression triggers, staggers, and reduced-motion fallback patterns.
- [ ] Step 4: Verify documentation accuracy against repository constraints.

---

### Task 2: Multicolour Section Atmosphere & Design Tokens

**Files:**
- Create: `src/components/landing/landing-atmosphere.css`
- Modify: `src/app/globals.css`
- Modify: `src/components/landing/landing.css`

- [ ] Step 1: Extract exact atmospheric color variables from the source-of-truth screenshot (`--radiance-atmosphere-teal`, `--radiance-aurora-cyan`, `--radiance-deep-ocean`, `--radiance-sapphire`, `--radiance-lavender`, `--radiance-rose`, `--radiance-coral`, `--radiance-mint`, `--radiance-gold`).
- [ ] Step 2: In `landing-atmosphere.css`, implement progressive background environments for each of the 8 sections with smooth transition boundaries.
- [ ] Step 3: Add glassmorphic surface tokens (`--glass-surface`, `--glass-border`, `--glass-highlight`, `--glow-cyan`, `--glow-violet`, `--glow-coral`, `--glow-emerald`).
- [ ] Step 4: Add `@media (prefers-reduced-motion: reduce)` overrides to neutralize continuous mesh or pulse animations.
- [ ] Step 5: Test that CSS imports build cleanly without syntax errors.

---

### Task 3: Section 01 — Immersive Hero Landscape & Interactive Product Stage

**Files:**
- Create: `src/components/landing/hero-landscape.tsx`
- Create: `src/components/landing/hero-product-stage.tsx`
- Create: `src/components/landing/hero-landscape.css`
- Modify: `src/components/landing/landing-hero.tsx`
- Test: `tests/unit/landing-hero.test.tsx`

- [ ] Step 1: In `hero-landscape.tsx`, implement the expansive atmospheric hero layout with eyebrow ("PERSONAL INTELLIGENCE, REIMAGINED."), display headline ("AI that brings your context forward."), lede, and dual CTAs ("Chat with Radiance" and "Explore Personal Intelligence").
- [ ] Step 2: In `hero-product-stage.tsx`, faithfully recreate the visual source-of-truth from the user's screenshot:
  - Central squircle IconMark with cyan halo.
  - "Hello, I Am Radiance" iridescent headline.
  - Three suggestion cards: "Understand" (cyan), "Create" (sapphire), and "Explore" (magenta/violet).
  - Floating luminous composer dock with `>_ Build` and `Radiance OpenWeights` pills.
  - Make suggestion pills interactive: clicking any pill types it into the demo composer and triggers a contextual response preview!
- [ ] Step 3: Add entrance reveal animations with `motion/react` (staggered fade-up, spring easing).
- [ ] Step 4: Run unit tests in `landing-hero.test.tsx` to verify renders, accessible labels, and CTA links.

---

### Task 4: Section 02 — "Every Conversation Starts from Zero" (The Problem)

**Files:**
- Create: `src/components/landing/problem-comparison-section.tsx`
- Create: `src/components/landing/problem-comparison.css`
- Test: `tests/unit/problem-comparison.test.tsx`

- [ ] Step 1: Write unit tests verifying the side-by-side comparison structure and accessible labels.
- [ ] Step 2: In `problem-comparison-section.tsx`, build a side-by-side visual comparison:
  - Left panel ("Without Context"): Generic AI conversation demonstrating repeated instructions, lost constraints, and cold responses.
  - Right panel ("With Radiance"): The same conversation illuminated by saved notes and active preferences, producing an immediate, personalized answer.
- [ ] Step 3: Add an animated context flow conduit showing fragments assembling into the Radiance interface.
- [ ] Step 4: Verify test suite passes with `pnpm test tests/unit/problem-comparison.test.tsx`.

---

### Task 5: Section 03 & 04 — Personal Intelligence Story & Interactive Preference Sandbox

**Files:**
- Create: `src/components/landing/personal-intelligence-story.tsx`
- Create: `src/components/landing/preference-sandbox.tsx`
- Create: `src/components/landing/personal-intelligence-story.css`
- Test: `tests/unit/preference-sandbox.test.tsx`

- [ ] Step 1: Write unit tests verifying preference state toggling (`concise` -> `detailed` -> `structured`) and content updates.
- [ ] Step 2: In `personal-intelligence-story.tsx`, build a progressive 4-phase demonstration:
  - Phase 1: Saved Notes (explicit local notes).
  - Phase 2: Response Preferences (style and tone).
  - Phase 3: Bounded Lexical Retrieval (keyword context selection).
  - Phase 4: Provider Sharing Toggle (explicit opt-in).
- [ ] Step 3: In `preference-sandbox.tsx`, implement the interactive response preference demonstration where visitors click "Concise", "Detailed", or "Structured" and watch the sample output dynamically update with smooth layout morphing.
- [ ] Step 4: Verify test suite passes with `pnpm test tests/unit/preference-sandbox.test.tsx`.

---

### Task 6: Section 05 — Context Retrieval Visual Pipeline

**Files:**
- Create: `src/components/landing/context-pipeline-section.tsx`
- Create: `src/components/landing/context-pipeline.css`
- Test: `tests/unit/context-pipeline.test.tsx`

- [ ] Step 1: Write unit tests verifying accessible heading, pipeline steps, and accurate technical disclosure.
- [ ] Step 2: In `context-pipeline-section.tsx`, build a flowing multi-step SVG pipeline:
  - Step 1: Saved Information (local notes).
  - Step 2: Bounded Lexical Matching (keyword relevance, no false vector hype).
  - Step 3: Context Assembly.
  - Step 4: Model Synthesis.
- [ ] Step 3: Apply coral, amber, and electric blue glowing conduit lines with scroll-linked progress.
- [ ] Step 4: Verify test suite passes with `pnpm test tests/unit/context-pipeline.test.tsx`.

---

### Task 7: Section 06 & 07 — Privacy Fortress & Future Vision

**Files:**
- Create: `src/components/landing/privacy-fortress.tsx`
- Create: `src/components/landing/future-vision-story.tsx`
- Create: `src/components/landing/privacy-and-vision.css`
- Test: `tests/unit/privacy-fortress.test.tsx`

- [ ] Step 1: Write unit tests verifying privacy disclosure criteria and future roadmap demarcation.
- [ ] Step 2: In `privacy-fortress.tsx`, implement an emerald, mint, and teal environment showcasing:
  - Browser-local plaintext storage.
  - Zero unsolicited cloud sync.
  - Explicit opt-in external provider sharing.
  - One-click context wipe and export.
- [ ] Step 3: In `future-vision-story.tsx`, present the forward-looking vision in cosmic cyan, violet, and magenta (adaptive memory, multi-document synthesis, cross-model portability).
- [ ] Step 4: Verify test suite passes with `pnpm test tests/unit/privacy-fortress.test.tsx`.

---

### Task 8: Section 08 — Immersive Final CTA & Navigation Wiring

**Files:**
- Create: `src/components/landing/immersive-final-cta.tsx`
- Modify: `src/components/landing/landing-nav.tsx`
- Modify: `src/components/landing/landing-footer.tsx`
- Modify: `src/components/landing/landing-page.tsx`
- Test: `tests/unit/landing-page.test.tsx`

- [ ] Step 1: In `immersive-final-cta.tsx`, create the dramatic multi-chromatic sunset auroral landscape with primary CTA linking directly to `/chat`.
- [ ] Step 2: Update `landing-page.tsx` to compose all 8 narrative sections in sequential harmony.
- [ ] Step 3: Verify desktop and mobile navigation links (`#problem`, `#intelligence`, `#preferences`, `#privacy`, `#vision`) map smoothly to matching section IDs.
- [ ] Step 4: Verify unit tests pass with `pnpm test tests/unit/landing-page.test.tsx`.

---

### Task 9: Browser Automation & Multi-Viewport Visual QA

**Files:**
- Create: `tests/e2e/immersive-storytelling.spec.ts`

- [ ] Step 1: Write Playwright E2E tests covering:
  - Smooth scrolling through all 8 sections without horizontal overflow.
  - Suggestion card interaction in hero.
  - Preference switch interactivity in Section 4.
  - Privacy disclosure rendering.
  - All CTAs reaching `/chat`.
  - Reduced-motion mode asserting zero infinite animations.
- [ ] Step 2: Execute automated multi-viewport screenshot captures at 1440px (desktop), 768px (tablet), and 390px (mobile) across all 4 visual review passes.
- [ ] Step 3: Inspect rendered screenshots for visual hierarchy, contrast, optical weight, and text flow. Remediate any visual flaws.
- [ ] Step 4: Run full verification suite: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm playwright test tests/e2e/immersive-storytelling.spec.ts tests/e2e/scrolling.spec.ts`, and `pnpm build`.

---

### Task 10: Final Engineering & Implementation Report

**Files:**
- Create: `docs/landing-page/implementation-report.md`

- [ ] Step 1: Write `docs/landing-page/implementation-report.md` detailing:
  - Complete architecture of the 8 storytelling sections.
  - Brand continuity with the chat UI source of truth.
  - Multicolour atmospheric progression and design tokens.
  - Motion engineering, spring physics, and accessibility.
  - Verification test results and terminal logs (exit code 0).
  - Embedded multi-viewport visual screenshots.
- [ ] Step 2: Present final outcome to user with clickable links and evidence.
