# Multicolour homepage redesign

Date: 2026-11-09

## Design decision

The landing page direction is **Radiance Context Atlas**: a light, premium canvas with deliberate blue/cyan, violet/rose, emerald, and warm coral/orange chapters. The central visual anchor is the existing Radiance conversation model shown beside a small Personal Intelligence panel. The product UI remains readable and the colour changes communicate capability, privacy, and momentum rather than acting as decoration.

## Product and architecture boundaries

- Keep `/chat` as the only chat destination; do not create a second working chat.
- Sample notes and preferences in public-facing illustrations are synthetic and clearly labeled.
- Describe only explicitly saved notes, response preferences, bounded lexical retrieval, and user-controlled opt-in provider sharing as available today.
- Explain the current browser-local plaintext MVP and its limits. Do not promise encryption, cloud account isolation, semantic retrieval, automatic learning, or synchronization.
- Use the project's existing Next.js/React/Tailwind/Motion boundaries and avoid new dependencies.

## Reference and skill notes

Reference principles and inspected pages: `docs/landing-page/design-research.md`.
Skills and component-source audit: `docs/landing-page/skills-audit.md`.

## Verification log

### Visual refinement passes

1. **Structure and colour distribution:** captured the first 1440px desktop render. The blue/cyan/violet hero and product-led two-column layout read as a clear new identity, but the initial full-page capture showed that the root page is scrollable and the long screenshot did not represent the actual viewport flow. Switched to viewport-based captures at the hero, product, privacy, and mobile breakpoints.
2. **Typography and product surfaces:** desktop and 390px mobile screenshots showed the hero response copy was too editorial/serif and the headline larger than needed. Reduced the desktop headline scale and set the preview response to the existing sans system at a product-UI size. The before/after section and green privacy surfaces were also reviewed independently.
3. **Interaction and responsive polish:** final desktop and mobile screenshots revealed the figure caption was extending across the right-hand sharing panel. Moved it into its own figure grid row, so it remains readable without covering the panel. Extended the viewport overflow check to 360, 375, 390, 430, 768, 1024, 1280, 1440, and 1920px. Captures are in `.antigravity/screenshots/radiance-pass{1,2,3}-*.png`.

### Automated checks

- `pnpm typecheck`: passed after all source and test updates.
- `pnpm lint`: passed with no ESLint warnings or errors (Next.js reports that `next lint` is deprecated).
- `pnpm test`: passed after restoring legacy product-story and hero copy hooks.
- `pnpm exec playwright test tests/e2e/landing.spec.ts --project=chromium --workers=1`: 17 passed, including the expanded overflow check at 360, 375, 390, 430, 768, 1024, 1280, 1440, and 1920px, FAQ keyboard behavior, mobile navigation, reduced motion, and all `/chat` CTAs.
- `pnpm build`: passed after all final changes. The homepage is statically prerendered and the existing `/chat` route remains present.
- Full `pnpm test:e2e`: attempted, but the default parallel run saturated the local Next.js development server and several unrelated app/landing navigations timed out with `net::ERR_ABORTED`. The isolated landing project passed; the full suite remains an environment/resource-limited check.
- Final contrast review darkened the `AVAILABLE NOW` labels on light feature surfaces and confirmed legibility in `.antigravity/screenshots/radiance-final-features.png`.

The redesign work left repository history and remote state untouched; the user's later publish request is being handled separately.
