# Radiance homepage continuation

## Inherited from Cursor

The existing branch already contained the landing route and section components, the `/chat` route with the original chat UI extracted into `RadianceApp`, a `/privacy` page, and the first landing E2E coverage. Those files remain in place; the chat app continues to run at `/chat`.

Cursor's untracked landing files are the 17 files under `src/components/landing/`. The other inherited files are `src/app/chat/page.tsx`, `src/app/privacy/page.tsx`, `src/features/chat/components/radiance-app.tsx`, and the initial landing implementation in `src/app/page.tsx`.

## Continued work

- Fixed CTA text contrast that the global landing anchor rule had made unreadable.
- Changed the demonstration step selector from ARIA tabs without arrow-key behavior into a toggle-button group, with an announced content region and a brief content entrance.
- Adapted the card reveal/open-state treatment from Hirael's **FAQ Accordion Reveal** component on [21st.dev](https://21st.dev/%40mohammadshehadeh/components/faq-06). Kept Radiance's existing FAQ content and single-open behavior, used the existing controls and CSS tokens, and added no dependency. Motion is disabled under `prefers-reduced-motion`.
- Updated the inherited chat/settings E2E flows to open `/chat`, and the existing chat unit fixtures to import the relocated `RadianceApp` instead of the new homepage route.
- Added landing coverage for CTA contrast, desktop/mobile navigation, `/privacy` claims, keyboard FAQ and preview controls, reduced motion, and all chat entry points.
- Recorded desktop and mobile review captures with unique filenames under `.antigravity/screenshots/`.

## Verification

- `pnpm typecheck` — passed.
- `pnpm lint` — passed with no ESLint warnings or errors; Next 15 prints its existing `next lint` deprecation notice.
- `pnpm test` — 482 tests passed across 37 files.
- `pnpm test:e2e -- --workers=1` — 46 tests passed across Chromium and Mobile Chrome.
- `pnpm build` — passed. `/`, `/chat`, and `/privacy` were generated as static routes.
- `pnpm measure:bundle` — passed after the production build; all evaluated routes stayed within the configured gzip budgets (`/page`: 233.0 kB against 800 kB, `/layout`: 183.4 kB against 220 kB).
- Reviewed landing and FAQ screenshots at 1440×1000 and 390×844. A separate CUA pass reviewed the responsive page while scrolling.
- `git diff --check` — passed.

## Remaining limits

The Playwright project matrix covers Chromium and Mobile Chrome; WebKit was not installed in this environment. The page behavior and layout were verified in the available browser projects.

No commit or push was made. Existing settings screenshots and the generated Playwright HTML report were restored after E2E runs rewrote them.
