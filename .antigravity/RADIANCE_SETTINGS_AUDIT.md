# Radiance Settings Center Audit

**Mission:** `RADIANCE-SETTINGS-001`
**Audited:** 2026-11-08
**Repository state:** clean `main` at `c546dfa`; no pre-existing edits were present.

## Existing behavior

| Area | Current implementation | Limitation found |
|---|---|---|
| Sidebar | New Chat, History, Personalization, Shortcuts; shortcuts are `Ctrl/Cmd+Shift+N`, `Ctrl/Cmd+L`, `Ctrl/Cmd+K` | Ctrl/Cmd+K opens a separate shortcuts dialog; Personalization opens a theme drawer |
| Mobile navigation | Chat, History, New Chat, Settings, a fifth “More” item for shortcuts | Settings and shortcuts are split across separate surfaces |
| Appearance | 28 registered color palettes, 12 atmosphere engines, auto palette rotation, DOM token updates | Theme, engine and auto-rotation state is held in page state and several separate localStorage keys |
| Personalization | Response tone (`ToneKey`) changes the server prompt | Tone is in-memory only; the existing drawer does not expose it despite its accessible description |
| Language | EN/HI control changes the AI response language through `/api/chat` | It does not translate interface copy; there is no application localization layer |
| Models | Five active models in the registry; composer changes the current model | Initial model selection is in-memory only; provider credentials are server-only and availability is not surfaced to the client |
| Composer | Enter sends; Shift+Enter inserts a line; mode is selected per composer | No preference for Enter behavior; mode is not currently a persistent default |
| Conversations | Local `radiance_chat_*` storage; export functionality exists in chat UI; delete-all exists in history | `conversationService` only syncs when passed a user ID; the application has no active auth/session provider and does not pass one |
| Supabase | Browser/server clients and conversation tables/policies exist | Authenticated settings sync is not integrated. No settings schema or preference table exists. No database changes are warranted for this local-mode task |
| Other controls | Vercel Analytics/Speed Insights are mounted; canvas backgrounds are real | No analytics consent, notification, memory, connected-app, account management, or cloud-settings controls exist |
| About | `package.json` is the application version source (`1.0.0`) | Sidebar/topbar separately hardcode `v1.0` |

## Scope decision

The Settings Center will expose only behavior backed by this repository:

- General: verified keyboard shortcut reference, local-session status.
- Appearance: registered palette, registered atmosphere engine, automatic palette rotation.
- Personalization: response tone, AI response language (EN/HI), validated custom response instructions.
- AI & Models: active registry model as the default model for new requests.
- Chat & Composer: Enter-to-send preference; when disabled, Ctrl/Cmd+Enter sends and Enter inserts a line.
- Data Controls: export locally stored conversations and clear local conversation history with confirmation; reset settings independently from conversation data.
- About: application name/version from the package manifest and an honest local-only session summary.

Application language, light/system theme, density, typography, memory, notification, connection, account, cloud sync/deletion, and telemetry consent are excluded because their runtime systems do not exist here. Existing AI response language is explicitly not presented as interface translation. Registry models remain selectable without claiming their server provider credentials are configured.

## Storage and state findings

- `safeLocalStorage` protects conversation storage but is not a validated settings schema.
- `dynamic-theme.ts` stores the last palette, recent history, and auto-rotation in three unversioned keys.
- Settings will use one versioned `radiance_settings` record, Zod validation and safe legacy migration from the three existing theme keys. Conversation records remain under their existing keys.
- Page-level settings state remains the single live source for the workspace, composer, and Settings Center. Preference writes are local only; the local session is identified honestly and no user ID or cloud sync is inferred.
- Custom instructions are constrained to 2,000 characters, validated again by the server request schema, and included as an explicitly untrusted user preference after the fixed assistant prompt. They are never used for authorization or privileged server policy.

## Design and implementation plan

1. Build a typed, versioned settings service with defaults, Zod parsing, legacy theme migration, save failure reporting and reset; prove behavior with unit tests first.
2. Add a responsive Radix Settings Center with internal section navigation, keyboard shortcut registry, search-to-setting navigation, accessible confirmation, and existing palette/engine controls; retain Radiance tokens and Cormorant heading hierarchy.
3. Replace the standalone sidebar/mobile shortcuts surfaces with Settings entry points; keep Personalization as a deep link to the same center. Ctrl/Cmd+K opens Settings → General → Keyboard Shortcuts.
4. Connect settings to page theme, engine, model, tone and language state; make Enter behavior affect the actual composer; validate and pass custom instructions through the existing server route.
5. Add data export and safe local history deletion, document unsupported areas and limitations, then run tests, lint, typecheck, build, Playwright desktop/mobile, keyboard and reduced-motion review where the environment supports them.

## Baseline verification

- `pnpm typecheck`: passed before implementation.
- `pnpm lint`: passed before implementation; Next.js 15 reports that `next lint` is deprecated.
- `pnpm test`: passed, 31 files / 446 tests. Existing jsdom canvas warnings and simulated stream-error logs appeared; they did not fail the suite.
- Current exact installed versions were inspected with `pnpm list --depth 0`; implementation uses existing React 19, Next.js 15, Radix Dialog, Motion 12 and Zod 3 without adding dependencies.
