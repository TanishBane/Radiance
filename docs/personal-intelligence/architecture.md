# Personal Intelligence Architecture

## Implemented MVP

The feature is a local-first, explicit-consent layer that sits beside the existing chat session and provider registry. The browser profile is loaded by `RadianceApp`, ranked locally for each request, and only a bounded projection is sent to `/api/chat` when sharing is enabled.

```mermaid
flowchart LR
  UI[Chat and Settings] --> Store[Versioned browser profile]
  Store --> Retrieval[Bounded lexical retrieval]
  Retrieval -->|opt-in projection| Hook[Chat stream request]
  Hook --> API[Validated chat API]
  API --> Boundary[Untrusted reference block in latest user message]
  Boundary --> Provider[Selected registered provider]
  API -. no profile persistence .-> Provider
```

Existing architecture is Next.js App Router, React, TypeScript, Tailwind, Vercel AI SDK streaming, registered Groq/Gemini/OpenRouter providers, and local conversation persistence. The repository has Supabase schema/client foundations but the running chat has no authenticated user identity path. For that reason this slice does not add a database table, claim account isolation, or send data to Supabase.

## Boundaries

- `src/features/intelligence/profile-schema.ts`: versioned profile and typed memory/preference schema.
- `profile-store.ts`: validated browser storage, explicit memory CRUD, duplicate/sensitive-value filtering, feedback operations.
- `retrieval.ts`: local lexical retrieval and provider-safe projection.
- `src/lib/ai/personalization-context.ts`: JSON boundary construction and injection into only the latest user request.
- `src/lib/security/sanitize.ts` and `src/app/api/chat/route.ts`: request limits and provider-neutral context handling.
- `personal-intelligence-center.tsx`: user controls within the existing Settings Center.

## Not implemented

There is no automatic LLM extraction, semantic embedding store, long-term cloud sync, authenticated user partition, cross-device identity, server-side memory persistence, or model training. These require a reliable authenticated identity and explicit data-governance decisions first.
