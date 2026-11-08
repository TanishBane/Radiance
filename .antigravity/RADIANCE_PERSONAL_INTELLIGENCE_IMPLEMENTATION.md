# Personal Intelligence implementation record

## Decisions

- Implemented a local-first, explicitly saved memory MVP because the existing chat flow has no authenticated user identity. No Supabase schema, account, RLS claim, or server persistence was added.
- Personalization starts disabled. When enabled, local lexical retrieval selects at most five notes and explicit response preferences. The API accepts a bounded provider-neutral projection and attaches it as escaped untrusted reference data to the latest user request.
- Profile IDs, source references, importance, and selected memory IDs remain local. Assistant messages keep only local IDs for the explanation affordance.
- The interface discloses browser-local plaintext storage and third-party provider processing when sharing is enabled. It supports explicit note CRUD, preference feedback, export, and profile deletion.
- Visual inspection at the available 713px browser viewport uncovered a navigation gap between the `sm` and `md` breakpoints. The mobile section selector now remains available below `md`.

## Verification evidence

- `pnpm typecheck` — passed.
- `pnpm lint` — passed; Next.js reports the existing `next lint` deprecation notice.
- `pnpm test` — 37 files, 482 tests passed. Existing jsdom canvas warnings are emitted by the atmospheric background test path.
- `pnpm build` — passed.
- `pnpm exec playwright test --workers=1` — 26 E2E tests passed across Chromium desktop and Mobile Chrome.
- A first six-worker E2E attempt during live dev-server visual inspection timed out under contention; the serial full run passed.
- No live Supabase or provider request was performed. No database migration, dependency upgrade, or new runtime dependency was added.

See `docs/personal-intelligence/` for detailed architecture, data, privacy, testing, skills, and limitations.
