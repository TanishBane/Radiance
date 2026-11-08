# Evaluation and Testing

The current evaluation is deterministic unit coverage for storage validation, duplicate/sensitive-value filtering, memory CRUD, local opt-in retrieval, ranking bounds, preference recency/scope, provider projection, prompt-boundary escaping, API payload validation, and Settings Center disclosure.

No recommendation or personalization-quality benchmark exists yet. Add a labeled, privacy-safe evaluation set before tuning retrieval weights. Measure relevance, missed matches, over-personalization, latency, and provider payload size; do not use private conversation content as a shared training set.

Verification completed for this slice: `pnpm typecheck`, `pnpm lint`, `pnpm test` (37 files, 482 tests), `pnpm build`, and `pnpm exec playwright test --workers=1` (26 tests across Chromium desktop and Mobile Chrome) all passed. The serial E2E run avoids contention on the shared Next.js dev server. Browser screenshots were inspected at the available 713px viewport; the responsive settings selector was corrected for the 640–767px breakpoint.

The full E2E suite was first attempted with six parallel workers while the development server was also being used for visual inspection; several tests timed out under that contention. The full serial rerun passed. Existing jsdom canvas warnings appear in the unit suite because the background animation calls `HTMLCanvasElement.getContext`, which jsdom does not implement; tests still pass.
