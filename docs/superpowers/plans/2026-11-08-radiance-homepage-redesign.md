# Radiance Homepage Redesign Implementation Plan

> **Execution method:** Native implementation in the current main checkout, per the user's earlier choice. No commit or push.

**Goal:** Replace the homepage composition with the selected Annotated Edition while preserving Radiance brand cues, truthful product content, interactions, and accessibility.

**Architecture:** Keep the App Router entry and page-owned landing components. Rebuild the home composition with server-rendered folio sections; keep only navigation, FAQ, and the interactive product demonstration client-side. Rework the landing stylesheet without touching chat or privacy route implementations.

**Tech Stack:** Next.js App Router, React 19, TypeScript, Tailwind v4, scoped landing CSS, installed Motion package only if existing coordination requires it.

**Spec:** `.impeccable/surfaces/src-app-page-tsx.md` and `PRODUCT.md`.

## Global Constraints

- Keep Radiance's dark-violet identity, editorial serif headline voice, name, and existing logo.
- All direct chat actions lead to `/chat`; preserve `/privacy`.
- Present the current browser-storage and provider-sharing limits honestly.
- Keep current/future product states distinct; never invent social proof or behavior.
- Use semantic controls, visible focus, responsive layout, and reduced-motion alternatives.
- Keep implementation on `main` and leave all changes uncommitted/unpushed.

## Tasks

1. Update landing E2E expectations to the selected folio structure, real CTA, responsive context annotations, and reduced-motion line behavior. Run the landing suite and confirm those new expectations fail against the current page.
2. Rebuild the landing hero as an editorial conversation passage with marginal saved-note and answer-preference annotations. Preserve the clear `/chat` action and label illustrative content.
3. Recompose the remaining homepage sections as ruled editorial lists, a sequential how-it-works path, interactive annotated demonstration, explicit privacy details, future-work distinction, accessible FAQ, final CTA, and footer. Keep existing IDs and behaviors.
4. Replace landing CSS with the selected folio composition, responsive stack, states, one finite reference-line entrance, reduced-motion alternative, and browser chrome styling.
5. Run landing E2E, typecheck, lint, unit suite, production build, bundle measurement, and requested UI review. Inspect desktop/mobile screenshots; fix findings in one pass; run Web Interface Guidelines audit.
6. Record the final direction and verification in `.antigravity/`; complete the Impeccable finish review and documentation requirements.

## Review Focus

- 375–390px width: annotation rail wraps below the answer, buttons remain visible, no horizontal overflow.
- 768px and 1024px widths: reading column and margin collapse without compressing copy or clipping anchors.
- 1440px width: the first screen shows promise, primary action, conversation and the two related annotations.
- Keyboard: menu opens/closes and returns focus; FAQ and preview controls preserve native keyboard behavior.
- Reduced motion: reference line remains visible without movement; no content depends on animation.

## Verification

- RED: `pnpm exec playwright test tests/e2e/landing.spec.ts --workers=1` fails on the newly specified folio selectors/semantics before implementation.
- GREEN: the same landing suite passes on Chromium and Mobile Chrome.
- `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`, `pnpm measure:bundle`, and `git diff --check` pass.
