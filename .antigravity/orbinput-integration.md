# OrbInput Component Integration — Verification Evidence

## Scope
Integrated the `OrbInput` animated typing-placeholder input component into the
Radiance chat composer as an opt-in empty-state hero shell.

## shadcn Project Structure Setup
The repo was **not** yet configured for shadcn. Created `components.json`
declaring the shadcn defaults so future `shadcn add` commands resolve to the
existing codebase layout:

- `style`: default
- `rsc`: true (Next.js App Router, React 19)
- `tsx`: true
- `tailwind.config`: `postcss.config.mjs` (already Tailwind v4 via `@tailwindcss/postcss`)
- `tailwind.css`: `src/app/globals.css` (already the single CSS entrypoint)
- `baseColor`: zinc
- `cssVariables`: true
- `prefix`: "" (Tailwind v4 has no prefix concept)
- `aliases.components`: `@/components/ui`
- `aliases.utils`: `@/lib/utils/cn` (already exists with `clsx` + `tailwind-merge`)

No `tailwindcss` or `typescript` install was needed — both are already present
(`tailwindcss` ^4.0.12, `typescript` ^5.8.2 in package.json).

## Why `components/ui` Is the Default Path
shadcn's `components.json` `aliases.components` points to `@/components/ui`.
This directory is the canonical home for all reusable UI primitives because:
1. It keeps third-party-generated components isolated from app/feature code,
   so `shadcn add <component>` never touches business logic.
2. The `@/components/ui` alias is referenced by every existing UI primitive
   (`shiny-button`, `voxel-wall`, `ascii-art`, `sidebar`) — establishing the
   convention already.
3. It pairs with the `@/lib/utils/cn` alias so `cn(...)` is the single
   class-merge entrypoint across the codebase.

## Files Created
- `components.json` — shadcn project config.
- `src/components/ui/animated-input.tsx` — the `OrbInput` component (typed
  props, controlled/uncontrolled support, timer cleanup, local asset).
- `src/components/ui/animated-input-demo.tsx` — standalone demo.
- `public/brand/radiance-orb.svg` — local orb asset replacing the external
  21st.dev GIF (keeps the app self-contained).
- `tests/unit/animated-input.test.tsx` — 13 Vitest tests (typing, cycling,
  controlled input, send, focus, cleanup, local asset).

## Files Modified
- `src/components/chat/chat-composer.tsx` — added `useOrbInput` prop; renders
  the OrbInput hero shell above the standard composer when the workspace is
  idle (no input, no attachments, not generating).
- `src/features/chat/components/chat-workspace.tsx` — threaded `useOrbInput`
  through `ChatWorkspaceProps` → `ChatComposer`.
- `src/features/chat/components/radiance-app.tsx` — enabled `useOrbInput` by
  default on the chat page.
- `tests/unit/chat-workspace.test.tsx` — added 2 integration tests for the
  OrbInput hero shell lifecycle.

## Verification
- `pnpm typecheck` — clean (0 errors).
- `pnpm lint` — 0 warnings/errors.
- `pnpm test` — 591/591 passing (62 files), including 13 new OrbInput tests
  and 2 new workspace integration tests.
- `pnpm build` — successful; `/chat` route 387 kB (within budget).

## Design Decisions
- Replaced the external orb GIF with a local `radiance-orb.svg` to avoid a
  runtime dependency on a third-party CDN and to match the brand palette.
- Made the component **controlled-friendly** (`value`/`onChange` props) while
  remaining usable uncontrolled, so it can slot into the existing composer
  state without forcing a refactor.
- Preserved all existing composer behaviour: the OrbInput only renders on the
  empty state; once the user types or generation starts, the standard
  composer shell takes over unchanged.