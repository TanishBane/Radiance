# Radiance homepage Unslop pass

## Audit

- The hero headline “Intelligence that understands you” could fit many AI products.
- The hero field used an accent-colored radial wash that followed the pointer, and the final CTA used a second radial wash.
- The context notes had a translucent blur treatment and sat over the Radiance mark at desktop width.
- The page already had a clear editorial serif, restrained dark violet palette, asymmetric hero, true Radiance symbol, and accurate supporting explanation. Kept those.

## Direction

- **Product:** Radiance carries the notes and response preferences a person chooses into later AI conversations.
- **Character:** editorial, calm, discerning.
- **World:** a private notebook beside a quiet digital workspace.
- **Moments:** the Radiance stripe mark with selected context notes around it; the existing product preview remains the supporting proof.
- **Signature:** the stripe mark and its fine connecting lines, showing chosen context moving toward a conversation.

## Passes

1. **Spacing:** moved context notes to the field corners so they no longer obscure the mark; confirmed the notes remain inside the field at desktop and mobile sizes.
2. **Color:** replaced the hero wash with the existing deep surface and removed the final CTA wash. The Radiance violet stays as a small focal point.
3. **Copy:** changed the headline to “Your context, carried forward,” which names the product benefit. Kept the accurate explanatory lede and existing section order.
4. **Type:** retained the editorial serif headline and existing sans-serif body hierarchy; the revised headline reads in two lines in the reviewed desktop and mobile renders.
5. **Layout:** retained the asymmetric text-and-visual hero and all existing homepage sections.
6. **Icons:** kept the real Radiance mark and existing icon language; added no decorative icons.
7. **Components:** changed context notes to opaque, hairline surfaces and removed backdrop blur; kept the existing primary and secondary CTA treatment.
8. **Visuals:** retained the Radiance mark and the product-specific example notes; removed decorative color washes without adding a new visual motif.
9. **Motion:** retained the brief mark, line, and note entrance sequence and menu feedback from the prior motion refinement. Reduced-motion behavior remains in place.

## Visual review

Reviewed desktop at 1440×1000 and mobile at 390×844. Both screenshots are in `screenshots/radiance-home-unslop-desktop.png` and `screenshots/radiance-home-unslop-mobile.png`. Reviewed the final CTA after removing its wash in `screenshots/radiance-home-unslop-finale.png`.

## Verification

- `pnpm typecheck`: passed.
- `pnpm lint`: passed with no ESLint warnings/errors (Next 15 reports `next lint` as deprecated).
- `pnpm exec playwright test tests/e2e/landing.spec.ts --workers=1`: 26 passed across Chromium and Mobile Chrome on the final run.
- One earlier run had a single non-reproducible desktop hero CTA navigation failure. The focused case passed in isolation and the complete 26-case rerun passed; the CTA implementation was unchanged.
- `pnpm build`: passed; homepage first-load JS 236 kB.
- `pnpm measure:bundle`: all route budgets passed; `/page` gzip 233.2 kB under its 800 kB budget.
- `git diff --check`: passed.

Scope: homepage presentation only. No commit or push.
