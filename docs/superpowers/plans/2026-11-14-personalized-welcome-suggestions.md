# Personalized Welcome Suggestions Implementation Plan

> **Goal:** Replace static, emoji-like welcome suggestions with fresh, locally personalized prompts derived from the user's own chat history.

**Architecture:** Load local conversation history before generating one suggestion set for the current app session. Classify only user-authored message text into broad non-sensitive interest groups, select varied prompt templates, and remember only the previous prompt IDs locally to avoid repeating the last set. No history text leaves the browser.

**Tech Stack:** Next.js App Router, React, TypeScript, existing safeLocalStorage, Vitest, Playwright.

**Spec:** User request and attached welcome-card reference, 2026-11-14.

## Global Constraints

- Keep history analysis client-side and do not add provider calls or database schema changes.
- Avoid emoji and emoji-like badges in the welcome suggestion cards.
- Preserve the existing Understand, Create, Explore categories, responsive layout, and click-to-send behavior.
- This app has no wired login callback; treat each app load as the new suggestion cycle.

## Tasks

- [x] Add tests for interest extraction, recent-interest ranking, fresh-set rotation, and no-history defaults.
- [x] Implement the local suggestion selector and previous-ID rotation with safe local storage.
- [x] Expose history-load completion and pass loaded conversations into the welcome card.
- [x] Render fresh personalized columns without icon badges; keep prompts selectable on desktop/mobile.
- [x] Run focused unit/browser checks, typecheck, lint, production build, inspect screenshots and diff.

## Review Focus

- No sensitive or raw conversation text is persisted as an interest profile.
- Generated prompts remain useful when history is empty, unavailable, or contains no recognized topics.
- The suggestion set changes across app loads and avoids reusing the prior set when enough options exist.
