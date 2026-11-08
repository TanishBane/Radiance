# Radiance Settings Center Implementation Plan

> **For agentic workers:** Follow the repository's instruction that implementation stays in this task; perform each task in order and verify it before proceeding. Use checkbox tracking as work is completed.

**Goal:** Consolidate real Radiance preferences into one responsive, locally persisted Settings Center without presenting unsupported cloud, account, memory, or notification controls.

**Architecture:** A Zod-validated versioned local settings service owns defaults and legacy theme migration. `RadianceApp` holds the single live settings state and supplies it to a Radix settings center, navigation, composer, and chat request. Existing theme/model/prompt registries remain authoritative; no new global store or database schema is introduced.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind CSS 4, Radix Dialog, Motion 12, Zod 3, Vitest 3, Playwright 1.64.

**Spec:** `.antigravity/RADIANCE_SETTINGS_AUDIT.md` (audit of the supplied `RADIANCE-SETTINGS-001` mission).

## Global Constraints

- Preserve Radiance's dark violet identity, semantic CSS variables, serif headings and existing provider/model boundaries.
- Keep local and cloud behavior separate; no auth flow or cloud preferences backend currently exists.
- No decorative/nonfunctional controls, no new dependency, no schema migration, and no push/merge/deploy.
- Preserve current shortcut mappings and make `Ctrl/Cmd+K` open the shortcut reference inside Settings.
- Custom instructions are untrusted user preferences, capped at 2,000 characters and validated on the server.
- Do not clear conversations when resetting settings.

## Review Focus

1. Corrupted or partially upgraded local settings must recover to validated defaults and preserve the older selected theme where valid (settings store tests).
2. Manual theme choice must survive refresh and interact predictably with auto-rotation (persistence tests and e2e).
3. Settings opened by shortcut must land at the shortcut reference, while the dialog traps/restores focus and closes on Escape (component/e2e tests).
4. Custom instructions must be limited and kept within the user-preference boundary (schema and request-schema tests).
5. Mobile navigation, safe areas and scrolling must remain usable at 390px, including section selection and destructive confirmations (e2e).

---

### Task 1: Validated settings storage and shortcut registry

**Files:**
- Create: `src/features/settings/settings-schema.ts`
- Create: `src/features/settings/settings-service.ts`
- Create: `src/features/settings/keyboard-shortcuts.ts`
- Test: `tests/unit/settings-service.test.ts`
- Test: `tests/unit/keyboard-shortcuts.test.ts`

**Interfaces:** `RadianceSettings`, `DEFAULT_SETTINGS`, `loadSettings(storage?)`, `saveSettings(settings, storage?)`, `resetSettings(storage?)`, `KEYBOARD_SHORTCUTS`.

- [ ] Write failing tests for defaults, valid/invalid values, version parsing, legacy theme migration, failed storage, reset independence, and registered keyboard mappings.
- [ ] Run the new tests and confirm expected failures.
- [ ] Implement the schema, migration and service with Zod and native localStorage only.
- [ ] Run the focused tests and confirm they pass.

### Task 2: Settings Center UI and navigation consolidation

**Files:**
- Create: `src/features/settings/settings-center.tsx`
- Modify: `src/app/page.tsx`
- Modify: `src/components/navigation/sidebar-dock.tsx`
- Modify: `src/components/navigation/mobile-bottom-nav.tsx`
- Remove: `src/components/modals/shortcuts-dialog.tsx`
- Test: `tests/unit/settings-center.test.tsx`
- Update: `tests/unit/navigation-drawers.test.tsx`

**Interfaces:** Settings Center controlled props include `open`, `onOpenChange`, `section`, `settings`, `onSettingChange`, `onExportConversations`, and `onClearConversations`.

- [ ] Add failing tests for section navigation, search navigation, shortcut table source, local session disclosure, and confirmation before conversation deletion.
- [ ] Run focused tests to confirm expected failures.
- [ ] Implement responsive desktop dialog and full-screen mobile panel, retaining semantic controls, Motion reduced-motion behavior, palette and atmosphere registries.
- [ ] Replace standalone shortcuts entries; route Personalization into the same dialog; verify section deep links and keyboard shortcut behavior.
- [ ] Run component and navigation tests.

### Task 3: Connect preferences to application behavior

**Files:**
- Modify: `src/app/page.tsx`
- Modify: `src/components/chat/chat-composer.tsx`
- Modify: `src/features/chat/components/chat-workspace.tsx`
- Modify: `src/features/chat/hooks/use-chat-stream.ts`
- Modify: `src/lib/security/sanitize.ts`
- Modify: `src/lib/ai/prompts.ts`
- Modify: `src/app/api/chat/route.ts`
- Test: `tests/unit/chat-composer.test.tsx`
- Test: `tests/unit/sanitize.test.ts`
- Test: `tests/unit/ai-prompts.test.ts`

- [ ] Add failing tests for Enter-to-send opt-out, request validation/character limit, and custom instructions being appended only in the untrusted user-preference boundary.
- [ ] Run focused tests and confirm expected failures.
- [ ] Connect persisted model, tone, response language, theme, atmosphere and composer settings to live behavior; validate instructions again on the server.
- [ ] Run focused feature tests and the full unit suite.

### Task 4: Data controls, verification and documentation

**Files:**
- Modify: `.antigravity/RADIANCE_SETTINGS_AUDIT.md`
- Create: `.antigravity/RADIANCE_SETTINGS_ARCHITECTURE.md`
- Create: `.antigravity/RADIANCE_SETTINGS_IMPLEMENTATION_LOG.md`
- Create: `.antigravity/RADIANCE_SETTINGS_VERIFICATION.md`
- Create: `.antigravity/RADIANCE_SETTINGS_SKILL_MATRIX.md`
- Modify: `tests/e2e/chat.spec.ts`
- Create: `.antigravity/screenshots/settings-desktop.png`, `.antigravity/screenshots/settings-mobile.png` (when browser capture is available)

- [ ] Add Playwright coverage for opening/navigation/search, preference persistence after reload, composer behavior, deletion confirmation, desktop/mobile and reduced motion.
- [ ] Run relevant e2e, lint, typecheck, full tests, and production build; record exact evidence and any unavailable checks.
- [ ] Review desktop and mobile screenshots, final git diff, and ensure no cloud/settings/security claims exceed the implementation.
