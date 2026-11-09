# Landing-page skills and component audit

Reviewed during the Radiance homepage refresh on 2026-11-09.

## Guidance actually loaded and applied

- `frontend-design`: required a named visual direction, product-specific visual anchor, cohesive restraint, semantic/accessibility checks, and verification reporting. Direction: **Radiance Context Atlas**, with a substantial conversation/context showcase.
- `design-system`: informed semantic color tokens, responsive type hierarchy, purposeful color, consistent motion timing, and reduced-motion support. Existing Plus Jakarta Sans was retained rather than adding a remote font dependency.
- `ux-product-craft`: informed clear product language, direct `/chat` primary action, clear behavior boundaries, and avoiding misleading controls/states in illustrative previews.

## Component research and selection

- The 21st.dev catalog was inspected as a discovery reference for component categories, AI chat surfaces, hero/background treatments and source availability.
- No third-party component was selected or copied. Radiance already has project-specific UI conventions and a working chat implementation, so landing-page product examples should remain static/synthetic and must not create a competing chat flow.

## Not performed

- The requested `npx skills find ...` commands were not executed. They would invoke a remotely fetched CLI/package in the current environment; installing or executing unreviewed tooling was not justified for this presentation task. No new skill was installed.
- The full local skill catalog was not exhaustively read. Only the task-relevant skills above were loaded.
- A dedicated React Three Fiber/WebGL component was not selected. CSS gradients and authored UI illustrations are lower cost and better aligned with performance and accessible fallbacks.

## Implementation invariants

- Do not add dependencies for visual polish without a demonstrated need.
- Keep product behavior in the existing app and preserve existing route/auth/provider/storage boundaries.
- Make all sample profile information synthetic and visibly illustrative.
- Honor keyboard access, visible focus, reduced motion, mobile layout, and honest privacy/product claims.
