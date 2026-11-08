# Radiance homepage motion refinement

## Design decisions

Applied the requested UI/UX Pro Max and Impeccable guidance as a focused refinement to the existing landing page. Kept Radiance's dark violet palette, serif headline, content hierarchy, and current page architecture. Extended the existing stripe mark motif into a one-time hero sequence: the mark assembles, context lines draw, and note cards settle. Added short mobile menu entrance/exit motion and tactile menu-button feedback. Kept card copy legible with a more opaque surface and restrained blur.

Mobile sizing gives the mark a clear inset composition with four context notes in the corners. Motion uses short CSS animations and existing semantic timing tokens, without scroll-jacking or looping effects. The reduced-motion media query removes the new entrance motion and leaves all content visible.

## Changed files

- `src/components/landing/landing.css`
- `src/components/landing/intelligence-field.tsx`
- `src/components/landing/landing-hero.tsx`
- `src/components/landing/landing-nav.tsx`
- `tests/e2e/landing.spec.ts`

## Visual review

Reviewed the running page at desktop 1440×1000 and mobile 390×844. Screenshots:

- `screenshots/radiance-home-motion-desktop.png`
- `screenshots/radiance-home-motion-mobile.png`

## Verification

- Focused landing motion browser tests: 3 passed.
- `pnpm typecheck`: passed.
- `pnpm lint`: passed with no ESLint warnings/errors (Next 15 reports that `next lint` is deprecated).
- `pnpm test`: 37 files, 482 tests passed. jsdom emits existing `HTMLCanvasElement.getContext` not-implemented warnings from the chat background tests.
- `pnpm test:e2e -- --workers=1`: 52 passed (2.9 minutes), Chromium and Mobile Chrome.
- `pnpm build`: passed; `/` first-load JS 236 kB.
- `pnpm measure:bundle`: all evaluated routes passed budgets; `/page` gzip 233.5 kB under 800 kB budget.
