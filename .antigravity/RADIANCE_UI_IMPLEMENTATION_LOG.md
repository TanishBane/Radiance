# Radiance UI implementation log

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
