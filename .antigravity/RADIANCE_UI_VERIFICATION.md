# Radiance UI verification

Date: 2026-11-04

| Check | Result | Evidence / limit |
| --- | --- | --- |
| Motion preset test | Passed | `pnpm test -- tests/unit/motion-presets.test.ts`; 2 tests. |
| TypeScript | Passed | `pnpm typecheck`; `tsc --noEmit` exited successfully. |
| ESLint | Passed | `pnpm lint`; no warnings or errors. |
| Full Vitest suite | Passed with existing environment warnings | 25 files, 364 tests passed. jsdom emitted existing `HTMLCanvasElement.getContext` not-implemented warnings in canvas-related component tests; simulated stream-error tests also log expected errors. |
| Playwright E2E | Passed | `pnpm test:e2e -- --workers=2 --reporter=line`; 18/18 desktop/mobile cases passed, including accessible dialogs, model selection, shortcuts/drawers, reduced motion, 390 px horizontal overflow/control fit, and 1366 px prompt-category bounds. |
| Production build | Passed | `pnpm build`; optimized production build completed. `/` first-load JS reported as 661 kB; this is a bundle-size observation, not a performance profile. |
| Browser visual inspection | Passed for captured views | Final production screenshots captured and reviewed at 1366 × 900 and 390 × 844: `.antigravity/screenshots/radiance-desktop.png` and `.antigravity/screenshots/radiance-mobile.png`. |
| Reduced motion | Passed for dialog and CSS timing | Playwright emulated `prefers-reduced-motion: reduce` on desktop/mobile and confirmed the dialog transition duration is at most 1 ms. Motion components also use `useReducedMotion`. |
| Responsive checks | Partial | E2E covers 390 px and 1366 px; screenshots at those sizes. 430, 768, 1024, and 1920 px still need review. |
| Keyboard / screen reader / contrast | Partial | E2E covers desktop Ctrl+K, mobile shortcut navigation, Escape close, Radix dialog roles, and model/drawer controls. No screen-reader or contrast audit was run. |
| Provider-backed streaming / upload / voice | Not exercised | No provider API call was made; no upload or microphone permission was requested. |
| Performance / WebGL context restoration | Not measured | No frame-time or GPU profile. WebGL context restoration remains a code-review follow-up. |
