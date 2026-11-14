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
- Removed the mark’s rounded square and sized the SVG to the title-relative container so its visible artwork aligns with the gradient wordmark baseline at each breakpoint.

## 2026-11-14 — Simplify sidebar brand lockup

### Changed

- Removed the version badge and pulsing status dot from the expanded sidebar header.
- Refined the Radiance wordmark and raised the AI PLATFORM label to the documented label type size.

### Verification

- TypeScript and ESLint: passed.
- Impeccable detector initially flagged the 9px label; updated it to the documented 11px size.
- The optional UI/UX Pro Max palette lookup could not run because Python is unavailable; existing Radiance tokens were used.

## 2026-11-14 — Curate palettes and preview atmosphere engines

### Changed

- Curated the settings gallery and automatic palette rotation to omit Amber, Sunset, Copper, Solarpunk, and Celestial, keeping the distinct Void, Matcha Zen, and Violet Aurora palettes. Existing palette definitions remain available for previously saved preferences.
- Changed atmosphere engine selection into a staged flow: choosing an option only changes the candidate; Preview temporarily renders it, Apply saves it, and Cancel or closing settings restores the saved background.
- Localized the preview instructions and actions across all seven supported interface languages. During preview, the settings surface and overlay become lighter so the live background can be seen behind them.

### Verification

- `pnpm.cmd typecheck`: passed.
- `pnpm.cmd lint`: passed with no warnings or errors.
- `pnpm.cmd build`: passed after creating a missing generated `.next/static/chunks/app/api/image` directory; the initial build attempts were blocked by that missing generated directory.
- Browser visual inspection could not be completed: the local browser session timed out connecting to `http://localhost:3000/chat`.
- Automated tests were not run.

## 2026-11-14 — Show atmosphere previews in the chat workspace

### Changed

- The Preview action now closes the large settings dialog and displays the selected engine behind the real chat workspace.
- Added a compact responsive status strip with Apply background, Back to appearance settings, and Cancel preview actions. The preview remains temporary while the user returns to settings and is saved only by Apply.
- Kept the preview actions localized across all seven supported interface languages and added a visible recovery message if saving fails.

### Verification

- `pnpm.cmd typecheck`: passed.
- `pnpm.cmd lint`: passed with no warnings or errors.
- `pnpm.cmd build`: passed.
- The local browser could not reach the development server (`ERR_NETWORK_ACCESS_DENIED`), so a rendered screenshot and keyboard walkthrough were unavailable.
- Automated tests were not run.

## 2026-11-14 — Fix settings control overlap

### Changed

- Removed the negative margin that pulled the atmosphere preview actions over the engine row divider.
- Anchored the palette rotation switch thumb to explicit inset positions so the checked state stays within its track.

### Verification

- `pnpm.cmd typecheck`: passed.
- `pnpm.cmd lint`: passed with no warnings or errors.
- `pnpm.cmd build`: passed.
- Used the browser MCP to inspect the deployed settings flow and confirm the affected control layout; the local browser could not connect for a post-change screenshot.
- Automated tests were not run.

## 2026-11-14 — Replace sidebar personalization shortcut with recent chats

### Changed

- Removed the Personalization shortcut from the sidebar and placed a Recent chats list between History and Settings.
- Show the 10 most recently updated local conversations, highlight the active chat, and open a conversation when its title is selected.
- Localized the section heading and loading/empty states across all seven supported interface languages.

### Verification

- `pnpm.cmd typecheck`: passed.
- `pnpm.cmd lint`: passed with no warnings or errors (Next.js reports that `next lint` is deprecated).
- `pnpm.cmd build`: passed.
- Impeccable layout detector: no findings.
- Browser visual inspection was unavailable because local browser access is disabled for this chat.
- Automated tests were not run.

## 2026-11-14 — Integrate liquid-glass mobile navigation

### Changed

- Added the supplied Liquid Navbar component under `src/components/ui` and mounted it in the existing mobile navigation.
- Connected its Chat, History, New Chat, and Settings actions to Radiance’s existing handlers; labels and navigation landmark text follow the selected interface language.
- Kept the desktop sidebar and recent-chat layout unchanged. The component’s desktop-hidden mobile placement keeps its sample links out of Radiance.
- Kept the component’s WebGL water effect, reduced-motion handling, off-screen pause, and CSS fallback; no dependencies were added.

### Verification

- `pnpm.cmd typecheck`: passed.
- `pnpm.cmd lint`: passed with no warnings or errors (Next.js reports that `next lint` is deprecated).
- `pnpm.cmd build`: passed.
- Headless browser viewport check at 390×844: four nav items rendered, WebGL mode active, no horizontal overflow or page errors; nav stayed hidden at 1440px.
- Keyboard ArrowRight selected History; Settings opened; New Chat action ran and the active workspace state stayed on Chat.
- UI/UX Pro Max design-system search could not run because Python is not installed in this environment. Used the existing dark theme tokens; no dependencies were installed.

## 2026-11-14 — Make liquid navigation visible and smoother on desktop

### Changed

- Added the same liquid navigation to the desktop top bar while preserving the recent-chat sidebar; it yields while the sidebar is expanded.
- Smoothed the indicator with 120 Hz physics substeps, reduced spring overshoot, and a shorter, softer trailing delay.
- Deferred WebGL setup until a navigation instance is visible, pause it when hidden, and release its context on cleanup.
- Kept the tablet header compact so its navigation does not overlap the language or clear-chat controls.

### Verification

- `pnpm.cmd typecheck`, `pnpm.cmd lint`, and `pnpm.cmd build`: passed.
- Browser inspection confirmed the liquid bar at desktop and mobile sizes, its WebGL path active, and no horizontal overflow at 390px.
- At 768px the bar compacts to icons and stays clear of top-bar controls; it hides while the desktop sidebar is expanded.
- History and Settings navigation opened their existing views; keyboard selection worked; no browser errors were reported.


## 2026-11-14 ? Move liquid navigation into the vertical sidebar

### Changed

- Removed the horizontal liquid nav from the top bar and mobile footer.
- Moved New Chat, History, and Settings into a vertical liquid nav inside the expanded sidebar; kept Recents between History and Settings and retained the shortcut badges.
- Added vertical indicator positioning and keyboard up/down navigation, while preserving the horizontal component mode for any other existing use.
- Restored the existing non-liquid mobile footer controls; the mobile navigation drawer uses the vertical sidebar layout.

### Verification

- `pnpm.cmd typecheck`, `pnpm.cmd lint`, and `pnpm.cmd build`: passed. Type checking was rerun after the build regenerated `.next/types`.
- Headless browser inspection at 1440?900 and 390?844 confirmed the vertical sidebar layout, Recent section order, visible mobile drawer, and no horizontal page overflow.
- Clicking History opened the existing conversation-history dialog. No page errors were reported in the desktop browser session.
- Automated test suites were not run.


## 2026-11-14 ? Blend gradient hover styling into the liquid sidebar menu

### Changed

- Added a reusable GradientMenu wrapper around the existing vertical liquid navigation.
- Applied the supplied violet, blue, and coral gradient palette to New Chat, History, and Settings on hover, keyboard focus, and selection; kept the liquid glass indicator and recent-chat placement intact.
- Used the project's existing Tabler icons and CSS, so no dependency installation or shadcn setup was needed.
- Disabled the new gradient transitions for reduced-motion preferences.

### Verification

- `pnpm.cmd typecheck`, `pnpm.cmd lint`, and `pnpm.cmd build`: passed.
- Headless browser check at 1440?900 confirmed vertical item order, rendered gradient hover states, and no page errors or horizontal overflow.
- At 390?844, the mobile drawer showed the same vertical gradient menu with no horizontal overflow.
- Automated test suites were not run.


## 2026-11-14 ? Revert liquid navigation

### Changed

- Restored the standard sidebar action rows and regular mobile footer navigation.
- Kept the recent-chat list and its placement between History and Settings.
- Removed the liquid-glass and gradient-menu components and all active references to them.

### Verification

- `pnpm.cmd typecheck`, `pnpm.cmd lint`, and `pnpm.cmd build`: passed.
- Browser inspection at desktop and mobile widths confirmed no liquid-navigation markup, the expected sidebar and mobile drawer controls, and no horizontal overflow.
- Automated test suites were not run.

## 2026-11-14 — Keep follow-up suggestions in the selected language

### Changed

- Added language-specific contextual fallbacks for all seven supported interface languages so failed, rate-limited, or incomplete follow-up generation does not fall back to English.
- Carried the active conversation turn and selected language as the follow-up context. Switching languages now refreshes the suggestions for that turn; a request ID and conversation/context checks prevent late responses from showing suggestions in a previous language or chat.
- Shared the supported UI locale list with the follow-up API schema to keep client and server locale support aligned.

### Verification

- A focused Playwright browser check submitted a Japanese message, confirmed a Japanese follow-up, switched the same chat to English, and confirmed the refreshed English follow-up. The intercepted API requests carried `ja` then `en`.
- `pnpm.cmd typecheck`, `pnpm.cmd lint`, and `pnpm.cmd build` were run for the implementation.

## 2026-11-14 — Make Ask the default and enforce response modes

### Changed

- Set the composer and chat API defaults to Ask. The API now accepts only `ask`, `plan`, and `build`, normalizing the composer labels before sending them.
- Replaced the short mode hints with distinct response contracts: Ask gives a direct explanation; Plan returns prioritized phases, dependencies, trade-offs, risks, and success criteria; Build completes the requested deliverable and reports relevant verification honestly.
- Aligned personalization scope and message metadata with the selected mode, including the capitalized labels sent by the composer.

### Verification

- Targeted unit tests: 139 passed across 8 files, including composer defaults, request mode normalization, API validation, and distinct system prompts.
- `pnpm.cmd typecheck`, `pnpm.cmd lint`, and `pnpm.cmd build`: passed.
- Full unit suite: 3 unrelated existing failures remain in dynamic-theme candidate count, stale mobile language-toggle expectations, and settings-center response-language lookup; other test files passed.
