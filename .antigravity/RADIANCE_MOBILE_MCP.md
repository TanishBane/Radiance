# RADIANCE MOBILE-FIRST ENGINEERING — MCP TOOLS & INSTRUMENTATION DIRECTORY

**Document ID:** RADIANCE-MCP-MOBILE-001  
**Project:** RADIANCE — AI Productivity Platform  
**Mission:** Mobile-First Experience, Performance & Responsive Engineering  
**Date:** November 2026  
**Status:** ACTIVE & APPLIED  

---

## 1. Discovered Tools & Capabilities

In conformance with the platform architecture, tool discovery was performed across available MCP servers and native host tools to support end-to-end mobile engineering, browser testing, performance auditing, and visual verification.

### Active Tool Registry

| Tool / Provider | Category | Purpose in Mobile Mission |
|:---|:---|:---|
| `Playwright Test Runner` | Local Automation / E2E | Native headless Chromium & Mobile Chrome engine (Pixel 5, iPhone 14, Galaxy S20 emulation). Runs automated interaction tests, measures horizontal overflow, verifies touch states, tests virtual keyboard layout resilience. |
| `Vitest Runner` | Unit / Component Testing | Fast execution of React 19 component specs, dynamic theme calculations, format & markdown rendering, drawer accessibility, and gesture hooks. |
| `Next.js Build & Analyzer` | Bundle / Compiler | Generates production assets, measures route payloads, confirms zero-downtime client-side chunk splitting and tree shaking. |
| `scripts/measure-bundle.mjs`| Performance Budgeting | Inspects `.next/app-build-manifest.json` and verifies that raw and gzipped bundle sizes adhere to performance thresholds. |
| `REA Server` (`call_mcp_tool`) | Web Inspection / Reverse Eng | Dynamic inspection of web bundles, runtime behavior, and web performance when deeper artifact analysis is requested. |
| `Native Workspace Tools` | Filesystem & Process Control | `read_file`, `write_file`, `edit_file`, `run_command`, `manage_task` used for atomic source edits and deterministic verification commands. |

---

## 2. Testing & Verification Tooling Configuration

- **Playwright Configuration:** Configured in `playwright.config.ts` supporting Desktop Chrome (`1280x720`) and Mobile Chrome (`Pixel 5`, `393x851` viewport, touch enabled, device scale factor 2.75).
- **Mobile Viewport Test Suite:** Headless browser automation testing widths:
  - 320px (iPhone SE 1st gen / narrow phone boundary)
  - 360px (compact Android phone)
  - 375px (iPhone mini / standard iPhone)
  - 390px (modern smartphone standard)
  - 412px (large modern Android)
  - 768px (iPad Mini portrait)
  - 1024px (iPad landscape / small laptop)
- **Reporter Protocol:** Executed via `npx playwright test --reporter=list` for immediate deterministic stdout capture without interactive server stalls.
- **Verification Gates:** No claims of completion or correctness are asserted without execution of `pnpm typecheck`, `pnpm test`, `pnpm measure:bundle`, and dedicated mobile Playwright tests.
