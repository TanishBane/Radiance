# Radiance UI implementation log

## 2026-11-14 — Solid frosted-glass suggestion cards

### Changed

- Replaced the theme-gradient card backgrounds with a solid translucent tint derived from the active theme accent.
- Kept the 22px backdrop blur and saturation, and changed the specular layer to a single solid highlight line.

### Verification

- Follow-up carousel and chat workspace unit tests: passed (20 tests).
- TypeScript and lint: passed.
- Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests), including flat-surface, glass-layer, and live theme tint assertions; reviewed both captures.

## 2026-11-13 — Prompt-matched glass treatment

### Changed

- Refined the suggestion cards to follow the supplied glass component's surface treatment: 22px saturated backdrop blur, translucent theme tint, screen-blended specular sheen, and a bright fine border with inset highlight.
- Kept the active theme accent gradients and accessible carousel controls intact.

### Verification

- Follow-up carousel and chat workspace unit tests: passed (20 tests).
- TypeScript and lint: passed.
- Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests), including backdrop blur, specular layer, and live theme recoloring assertions; reviewed both captures.

## 2026-11-13 — Glass follow-up suggestion cards

### Changed

- Added a frosted-glass treatment to the two composer-side suggestion cards: translucent theme-tinted surfaces, backdrop blur and saturation, fine borders, and a soft inset highlight.
- Preserved the navy contrast layer and dynamic theme accents so suggestion text remains readable across the available background palettes.

### Verification

- Follow-up carousel and chat workspace unit tests: passed (20 tests).
- TypeScript and lint: passed.
- Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests), including the glass surface and theme recoloring assertions; reviewed both captures.

## 2026-11-13 — Theme-specialized follow-up cards

### Changed

- Connected the bright follow-up card gradient to Radiance’s live theme accent, highlight, and tertiary color tokens. The navy base stays consistent while the vivid card colors adapt to the selected background theme.
- Added browser coverage for card recoloring across red, green, and gold palette changes.

### Verification

- Follow-up carousel and chat workspace unit tests: passed (20 tests).
- TypeScript and lint: passed.
- Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests), including live palette changes; reviewed both captures.

## 2026-11-13 — Reference-matched suggestion card colors

### Changed

- Added a shared follow-up card background token with a deep navy upper-left, royal-blue field, and pale cyan lower-right, matching the supplied reference palette.
- Applied the token to both composer-side cards without changing their layout or behavior.

### Verification

- Follow-up carousel and chat workspace unit tests: passed (20 tests), including a check that compact cards use the shared palette token.
- TypeScript and lint: passed.
- Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests); reviewed both captures.

## 2026-11-13 — Bright suggestion cards

### Changed

- Restyled compact composer-side follow-up carousels as vivid blue-to-cyan cards with a clear counter and 44px navigation controls inside each card.
- Show only the active suggestion in compact mode so adjacent carousel items no longer bleed through or compete with the card.
- Kept the wide carousel presentation and its theme-aware styling unchanged.

### Verification

- Follow-up carousel and chat workspace unit tests: passed (20 tests), including a regression check for a single contained compact card.
- TypeScript and lint: passed.
- Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests); reviewed both captures.

## 2026-11-13 — Composer-side follow-up carousels

### Changed

- Split the contextual follow-up carousel into independently navigable left and right lanes beside the primary composer on desktop.
- Reflowed the two lanes into a paired row above the full-width composer on narrow screens. Both lanes retain the active theme styling and suggestion selection behavior.
- Added layout and navigation coverage for desktop, mobile, keyboard, and suggestion selection.

### Verification

- Follow-up carousel and chat workspace unit tests: passed (19 tests).
- TypeScript: passed.
- Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests); checked lane positions and composer centering on desktop and paired responsive layout on mobile.
- Reviewed desktop and mobile Playwright screenshots.

## 2026-11-13 — Theme-aware follow-up carousel

### Changed

- Replaced the stacked follow-up links with a manually navigable perspective carousel above the primary chat composer. It keeps the existing contextual questions and selection behavior, draws colors from the active theme tokens, wraps through the question set, and supports arrow keys, visible focus, touch controls, and reduced motion.
- Expanded the carousel lane beyond the composer width so the side suggestions can peek in from either side without adding content to the composer itself.
- Added unit and browser coverage for navigation, selection, keyboard input, touch-sized mobile layout, and viewport containment.

### Verification

- Follow-up carousel and chat workspace unit tests: passed (18 tests); mobile touch-target case: passed (1 test).
- TypeScript: passed.
- Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests), including sending a mocked chat turn, rotating suggestions, and selecting a follow-up.
- Captured desktop and mobile screenshots through Playwright; the mobile screenshot was reviewed after waiting for the existing intro splash to exit.

## 2026-11-04 — Motion foundation and first application pass

### Changed

- Added `src/lib/motion/presets.ts` and unit coverage for shared timing and reduced-motion behavior.
- Added semantic motion duration/easing tokens and a global `prefers-reduced-motion` fallback in `src/app/globals.css`.
- Applied shared, reduced-motion aware transitions to welcome entry, new messages, desktop/mobile sidebar, and model selector open/close and selected label.
- Migrated history, personalization, and shortcuts overlays to Radix Dialog, adding dialog titles/descriptions, focus management, Escape/outside dismissal, and coordinated fade/slide/scale enter and exit keyframes.
- Corrected responsive category-tab clipping and mobile topbar compression discovered in 390 px and 1366 px screenshots. The mobile wordmark becomes an accessible RD button while the model label truncates rather than wraps; clear-chat remains visible.
- Repaired stale E2E assertions to use unique/accurate accessible queries, wait for hydration, and use mobile navigation instead of a desktop keyboard shortcut in the touch profile. Added model-switch, 390 px overflow, mobile control-fit, and desktop category-boundary coverage.
- Added root `AGENTS.md` with concise Radiance architecture, design, verification, and change-management guidance; no root file existed.

### Preserved

- Current Radiance palette, typography, prompt categories, provider/model registry, chat behavior, and backend boundaries.
- No new package, provider call, schema change, deployment, or commit.

### Verification status

- Motion preset unit tests: passed (2 tests).
- TypeScript: passed.
- Full unit (364), browser E2E (18, including reduced motion), lint, typecheck, and production build outcomes are recorded in `RADIANCE_UI_VERIFICATION.md`.
- Desktop (1366 × 900) and mobile (390 × 844) screenshots are in `.antigravity/screenshots/`; the requested full viewport matrix and provider-backed streaming are not yet verified.

# 2026-11-14 — Premium milk-glass follow-up cards

### Changed

- Shifted the compact side suggestion cards to a translucent, pale frost with stronger backdrop blur and a restrained tint from the active theme.
- Switched labels and suggestion text to dark ink for legibility on the lighter surface; kept navigation controls dark and theme-accented.
- Kept the glass surface flat, with no gradient fill, and retained a fine specular edge.
- Added browser assertions for the pale glass surface and readable dark text.

### Verification

- Focused follow-up and chat workspace unit tests: passed (20 tests).
- Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests); desktop and mobile captures were visually reviewed.
- TypeScript: passed.
- ESLint: passed with no warnings or errors.
- Production build: passed.

## 2026-11-14 — Transparent glass follow-up cards

### Changed

- Replaced the pale theme-tinted card fill with a neutral 10% white translucent layer so the active background shows through.
- Increased backdrop blur to 28px and softened the border, specular edge, and shadow for a glass surface that blends into the scene.
- Returned suggestion copy to the Radiance foreground token; theme color remains on small icons and focus details.
- Updated browser assertions to require low fill opacity, theme-readable copy, and a theme-independent glass body.

### Verification

- Focused Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests); both screenshots were visually reviewed.
- Focused follow-up and chat workspace unit tests: passed (20 tests).
- TypeScript: passed.
- ESLint: passed with no warnings or errors.
- Production build: passed.

## 2026-11-14 — Show only the top two follow-ups

### Changed

- Updated follow-up generation guidance to rank three distinct questions strongest-first by relevance, usefulness, and actionability.
- Limited the active suggestions used by both side carousels to the first two ranked results.

### Verification

- Regression test reproduced the three-item display before the change; it now asserts only the first two remain active.
- Focused Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests), including cycling and selecting the second suggestion.
- Focused unit tests: passed (43 tests).
- TypeScript, ESLint, and production build: passed.

## 2026-11-14 — Make side suggestions fixed cards

### Changed

- Removed compact-card previous/next controls and suggestion counters so the two ranked suggestions remain fixed in place.
- Disabled carousel arrow-key navigation for compact cards while preserving click-to-use behavior and the full carousel controls elsewhere.

### Verification

- Regression coverage confirms compact cards have no navigation controls and arrow keys do not swap suggestions.
- Focused Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests).
- Focused unit tests: passed (43 tests).
- TypeScript, ESLint, and production build: passed.

## 2026-11-14 — Remove compact-card label and top strip

### Changed

- Removed the “Next” label from compact follow-up cards.
- Removed the top specular strip while retaining the translucent glass fill, border, and blur.

### Verification

- Unit tests: passed (20 focused tests).
- Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests); desktop appearance reviewed.
- TypeScript, ESLint, and production build: passed.

## 2026-11-14 — Align suggestions with composer

### Changed

- Center-aligned the side suggestion cards with the composer in the shared dock grid, including the stacked mobile layout.
- Updated browser geometry checks to measure the actual suggestion cards and require their desktop centers to match the composer within one pixel.

### Verification

- Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests); measured desktop card centers matched the composer within one pixel.
- Focused chat workspace and suggestion unit tests: passed (20 tests).
- TypeScript, ESLint, and production build: passed.

## 2026-11-14 — Personalize welcome suggestions

### Changed

- Replaced fixed welcome examples and category badges with rotating prompt templates based on broad interests found in recent user-authored local chat messages.
- Generate a new set after local conversation history loads; keep only prompt IDs locally to avoid repeating the previous set. Raw chat text and inferred interests are not persisted or sent to a provider.
- Added an effect guard so React development Strict Mode does not consume multiple suggestion sets in one app session.
- Added unit and Playwright coverage for interest selection, no-history fallback, emoji-free cards, click-to-send, and set rotation after reload.

### Verification

- Focused unit tests: passed (31 tests).
- Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests); reviewed both screenshots.
- TypeScript, ESLint, and production build: passed.
- This app has no wired login callback; rotation occurs on app reload/session entry using browser-local chat history.

## 2026-11-14 — Compact suggestions with full prompt preview

### Changed

- Shortened suggestion titles and prompt copy so cards remain scannable.
- Added accessible preview controls beside each suggestion. The dialog shows the full prompt and clearly labels the action that sends it.
- Kept the preview centered and usable on desktop and mobile.

### Verification

- Focused unit tests: passed (32 tests, including preview and send behavior).
- Playwright: passed on Desktop Chrome and Mobile Chrome (2 tests); reviewed suggestion and preview screenshots.
- TypeScript, ESLint, and production build: passed.

## 2026-11-14 — Compact preview controls and localized suggestions

### Changed

- Reduced the preview eye’s visible size while preserving a 44px accessible click target.
- Added a short-delay hover and keyboard-focus tooltip that reveals the complete localized prompt; the preview dialog remains available to touch users.
- Localized suggestion categories, labels, prompts, and preview actions for the supported UI languages.

### Verification

- Focused suggestion localization and preview unit tests: passed.
- Playwright: desktop and mobile passed before moving the hover trigger to the eye control; the exact-target rerun could not launch because this environment lacks the Playwright Chromium executable.
- TypeScript, ESLint, and production build: passed.

## 2026-11-14 — Remove suggestion eye preview

### Changed

- Removed suggestion eye buttons and the click-to-open preview dialog.
- Kept the full localized prompt available on hover or keyboard focus of each suggestion button; tapping a suggestion still sends it directly.

## 2026-11-14 — Move brand mark into welcome title

### Changed

- Removed the standalone Radiance mark above the greeting and placed it where the “Radiance” wordmark appeared in the title.
- Kept “adiance” beside the mark in the brand gradient so the title reads as the logo-backed “Radiance.”
- Removed the mark’s rounded square and adjusted its inline size and baseline to align with the gradient wordmark.
