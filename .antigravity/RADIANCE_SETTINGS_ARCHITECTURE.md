# Radiance Settings Center Architecture

**Mission:** `RADIANCE-SETTINGS-001`
**Status:** Implemented as a browser-local, versioned preferences system.

## Sections and actual controls

| Section | Controls | Runtime effect |
|---|---|---|
| General | Registered shortcut reference; local-session disclosure | Reference is sourced from the same registry used by global shortcut handling. |
| Appearance | Registered color palette; registered atmosphere engine; palette rotation per visit | Updates the existing theme/renderer and dynamic-theme system. Choosing a palette disables rotation. |
| Personalization | Response tone; English/Hindi response language; custom instructions (max 2,000 characters) | Feeds validated response preferences into new chat requests. Language means AI response language; app chrome is English. |
| AI & Models | Default active registry model | Initializes the model for new requests; the composer may still select a different model. |
| Chat & Composer | Enter sends | When off, Enter inserts a line and Ctrl/Cmd+Enter sends; Shift+Enter always inserts a line. |
| Data Controls | Export locally available conversations; confirmed clear of local conversation history; settings reset | Exports the actual local records, confirms destructive clearing, and keeps settings reset separate from conversation deletion. |
| About | App version | Reads the package version from the shared app-info module. |

Controls for interface language, light/system theme, accent overrides, density, typography, cloud settings sync, notifications, connected apps, memory, account, or analytics consent are intentionally omitted because the corresponding runtime behavior is not implemented in this repository.

## State and persistence

- `RadianceSettingsSchema` in `src/features/settings/settings-schema.ts` is the shared Zod contract. Enumerated fields validate against the live palette, renderer, tone, and active-model registries. Custom instructions are limited to 2,000 characters. Theme history is capped at five valid palette IDs.
- `settings-service.ts` owns defaults, per-field recovery from malformed values, browser storage, reset, and legacy theme migration. The serialized record uses `radiance_settings` with schema version `1`.
- Defaults: violet palette, waves renderer, auto rotation on, default tone, English response language, `groq-fast` model, empty custom instructions, and Enter-to-send on.
- Existing legacy palette, rotation, and recent-palette keys are read and migrated. Rotation uses the existing dynamic-theme selector and stores recent history. No conversation data is touched by settings migration or reset.
- Settings load in the browser and persist to that browser's `localStorage`. Cross-tab storage events update app state. If storage is unavailable, defaults remain usable for that session and save actions report failure.
- There is no signed-in session or connected settings-sync path in the app. Supabase tables/clients do not make cloud preferences available by themselves; this work does not add a schema or claim cloud sync.

## Navigation and shortcuts

- The sidebar's former Shortcuts entry now opens Settings. Personalization remains a deep link to the one Personalization section. Mobile navigation opens the same center.
- `KEYBOARD_SHORTCUTS` is the source of shortcut labels and matching metadata. Ctrl/Cmd+Shift+N starts a chat; Ctrl/Cmd+L toggles conversation history; Ctrl/Cmd+K opens Settings → General. The composer shortcut behavior is represented with the current setting-dependent labels.
- Settings uses Radix Dialog for focus trapping, Escape handling, and restoration. The mobile layout uses full-screen navigation and safe-area padding; desktop has internal section navigation and independently scrolling content. Motion is short and checks the OS reduced-motion preference.

## Request security

Custom instructions are parsed on the server with a 2,000-character bound, NUL removal, and trimming. They enter the prompt as explicitly untrusted user preferences, subordinate to Radiance system and safety instructions. No credentials or provider behavior were changed.

## Key modules

- `src/features/settings/settings-center.tsx`: dialog, responsive navigation, controls, validation feedback, and destructive confirmations.
- `src/features/settings/settings-schema.ts`, `settings-service.ts`: schema and persistence.
- `src/features/settings/keyboard-shortcuts.ts`: shortcut registry.
- `src/app/page.tsx`: settings state and app integration.
- `src/components/chat/chat-composer.tsx`, `src/features/chat/hooks/use-chat-stream.ts`, `src/lib/ai/prompts.ts`, `src/app/api/chat/route.ts`: functional preference effects.
- `tests/unit/settings-service.test.ts`, `tests/unit/settings-center.test.tsx`, `tests/unit/keyboard-shortcuts.test.ts`, `tests/e2e/settings.spec.ts`: persistence, rendering, shortcut, and browser coverage.

## References

- [Radix Dialog](https://www.radix-ui.com/primitives/docs/components/dialog)
- [React `useEffect`](https://react.dev/reference/react/useEffect)
- [Next.js Client Components](https://nextjs.org/docs/app/api-reference/directives/use-client)
- [Motion `useReducedMotion`](https://motion.dev/docs/react-use-reduced-motion)
- [Supabase SSR for Next.js](https://supabase.com/docs/guides/auth/server-side/nextjs)
