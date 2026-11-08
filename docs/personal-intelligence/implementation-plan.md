# Personal Intelligence Engine — Implementation Plan

## Repository-grounded map

- Next.js 15 App Router, React 19, TypeScript, Tailwind 4, Zod, Vercel AI SDK 4.1, Groq/Gemini/OpenRouter adapters.
- Chat transcripts are persisted in browser `localStorage`. `conversationService` can sync only when a caller supplies a user ID; the application has no sign-in, session provider, or caller that supplies one.
- Supabase clients and a migration with RLS-protected tables exist, but there is no active authenticated identity in the UI/API. No Supabase MCP or live database credentials are available in this session.
- `/api/chat` validates a client request, builds one provider-independent system prompt, then streams through the selected model with failover. The browser constructs the request in `useChatStream`.
- Existing Settings Center is local-browser based and accessible from desktop/mobile. Existing message controls include edit, regenerate, deletion, and generic like/dislike feedback.
- Baseline on commit `5696003`: `pnpm typecheck`, `pnpm lint`, and `pnpm test` passed; 35 files / 460 tests. `pnpm lint` reports the repository's existing Next 15 `next lint` deprecation notice.

## Scope decision

Implement one complete local-first, opt-in vertical slice using only existing dependencies:

1. Explicitly user-saved memories with source references, edit/delete/export, duplicate detection, expiration, and a strict local schema.
2. Explicit response-direction feedback saved locally and applied as transparent user preferences; no automatic conversation mining.
3. Deterministic lexical retrieval of a small relevant subset, bounded before provider handoff.
4. Request validation and prompt-injection boundary treating retrieved records as untrusted user data, independent of provider.
5. Personal Intelligence settings UI for consent, saved memories, preference signals, and local data controls.
6. Tests, synthetic retrieval evaluation, and the requested documentation suite.

The app has no verified account identity, so this phase does not add cloud persistence, a database migration, or a claim of cross-account isolation. The local profile belongs to this browser profile; people sharing that browser share the vault. UI copy must say so. Saved memory context reaches the external provider only after explicit opt-in, and only the top relevant records are sent. Memory data stays out of server logs and is not persisted server-side.

## Deferred requirements

Automatic LLM extraction, semantic embeddings, contradiction resolution/consolidation, inferred knowledge scores, background jobs, cross-device sync, account-specific RLS tests, server-side deletion guarantees, true temporary conversations, and user-specific cloud retention require an authenticated identity and additional infrastructure. Do not simulate these with client-supplied user IDs, placeholder analytics, or heuristic expertise scores.

## Task sequence

1. **Vault domain and retrieval** — write red tests for schema bounds, consent defaults, secret filtering, explicit source/provenance, duplicate handling, expiry, relevance ordering, bounded context, and feedback decay; implement a versioned browser store and pure ranking functions.
2. **API trust boundary** — test malformed/oversized context and injection-like memory strings; validate bounded memory facts and preference labels; insert the context only as reference data in the current user turn, never as privileged instructions; keep it independent of provider choice.
3. **Chat integration** — test opt-in gating, selected-memory metadata, retry behavior, source-save callback, explicit preference feedback, and no server persistence/logging; connect current chat UI and local profile service.
4. **Personal Intelligence UI** — add one Settings section with accurate browser-local scope, provider disclosure, memory search/filter/edit/delete/export/clear, feedback review, explicit save flow, and empty/error/success states; keep Radiance tokens, keyboard access, and mobile behavior.
5. **Evaluation and docs** — test adversarial secrets, prompt injection, no-consent, expiry, duplicate, and relevance fixtures; complete the 10 requested implementation-truth docs; run unit, type, lint, E2E, build and visual checks.

## Review focus

- Opt-out or storage failure must never send memory context.
- A current user request can contain prompt injection; retrieved data cannot become system instructions.
- Secret-like strings must be blocked from durable storage.
- Exact/near duplicates must not silently overwrite a prior item.
- Expired or irrelevant records must not reach providers.
- Feedback must be explicit, visible, deletable, and scoped; do not call it an objective skill score.
- Shared-browser and missing-auth limits must be visible in product copy and docs.
