# RADIANCE — COMPREHENSIVE FEATURE INVENTORY & CAPABILITY AUDIT

> **Evaluation Date:** November 14, 2026  
> **Source Baseline:** Codebase Inspection & Empirical Test Runs  
> **Classification Standard:** Implemented | Partially Implemented | Experimental | Planned | Deprecated | Unverified  

---

## 1. CORE CHAT & STREAMING CAPABILITIES

| # | Feature | Classification | Code Location | Description & Implementation Notes |
|:---|:---|:---|:---|:---|
| 1 | **Multi-Model Inference Routing** | **Implemented** | [src/lib/ai/models.ts](file:///c:/Tanixai-main/src/lib/ai/models.ts), [providers.ts](file:///c:/Tanixai-main/src/lib/ai/providers.ts) | Routes requests across Groq (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`), Google Gemini (`gemini-2.5-flash`, `gemini-2.5-pro`), and OpenRouter (`meta-llama/llama-3.3-70b-instruct`). |
| 2 | **Automatic Capability-Based Multimodal Routing** | **Implemented** | [src/lib/ai/models.ts](file:///c:/Tanixai-main/src/lib/ai/models.ts#L96-L103) | When image or PDF attachments are detected, the request is automatically routed to Gemini if the user's active model does not support vision. |
| 3 | **Real-Time SSE Streaming** | **Implemented** | [src/app/api/chat/route.ts](file:///c:/Tanixai-main/src/app/api/chat/route.ts), [use-chat-stream.ts](file:///c:/Tanixai-main/src/features/chat/hooks/use-chat-stream.ts) | Streams tokens via Vercel AI SDK `toDataStreamResponse` with persistent cross-chunk line buffer. |
| 4 | **Stop-Generation with Partial Token Retention** | **Implemented** | [src/features/chat/hooks/use-chat-stream.ts](file:///c:/Tanixai-main/src/features/chat/hooks/use-chat-stream.ts#L189-L221) | Aborting generation (`stop(false)`) halts server stream immediately via `AbortController` and `req.signal`, while saving accumulated tokens to conversational state and storage. |
| 5 | **Response Modes (Ask, Plan, Build)** | **Implemented** | [src/lib/ai/prompts.ts](file:///c:/Tanixai-main/src/lib/ai/prompts.ts#L88-L92), [chat-composer.tsx](file:///c:/Tanixai-main/src/components/chat/chat-composer.tsx) | User can toggle response mode in composer. Default is `Ask`. Tailors system prompt behavior to concise explanation (`Ask`), phased roadmap (`Plan`), or complete implementation (`Build`). |
| 6 | **Assistant Response Single Regeneration** | **Implemented** | [src/lib/chat/regeneration-policy.ts](file:///c:/Tanixai-main/src/lib/chat/regeneration-policy.ts), [message-item.tsx](file:///c:/Tanixai-main/src/components/chat/message-item.tsx) | Enforces maximum 1 regeneration per assistant message (`canRegenerateResponse`). Displays "Regenerated once" badge in message header. |
| 7 | **User Message Editing & Branch Resubmission** | **Implemented** | [src/features/chat/hooks/use-chat-session.ts](file:///c:/Tanixai-main/src/features/chat/hooks/use-chat-session.ts#L256-L303) | User can edit previous user messages. Truncates subsequent assistant turns and resubmits to AI engine. |
| 8 | **Message Feedback Sentiment (Thumbs Up/Down)** | **Implemented** | [src/features/chat/hooks/use-chat-session.ts](file:///c:/Tanixai-main/src/features/chat/hooks/use-chat-session.ts#L305-L334) | Toggles positive/negative sentiment rating stored in message state and persistence. Also records preference signal in Personal Intelligence. |
| 9 | **Retry Failed Generation** | **Implemented** | [src/components/chat/message-item.tsx](file:///c:/Tanixai-main/src/components/chat/message-item.tsx), [use-chat-stream.ts](file:///c:/Tanixai-main/src/features/chat/hooks/use-chat-stream.ts#L235-L239) | In-message structured error card provides a Retry button that calls `retryLast()` without losing prior conversational context. |
| 10 | **Dynamic Follow-Up Questions** | **Implemented** | [src/app/api/followups/route.ts](file:///c:/Tanixai-main/src/app/api/followups/route.ts), [src/lib/ai/followups.ts](file:///c:/Tanixai-main/src/lib/ai/followups.ts) | After assistant finishes reply, generates 2 intelligent follow-up suggestions in active UI language displayed as clickable chips. |
| 11 | **Personalized Welcome Suggestions** | **Implemented** | [src/lib/chat/welcome-suggestions.ts](file:///c:/Tanixai-main/src/lib/chat/welcome-suggestions.ts), [welcome-card.tsx](file:///c:/Tanixai-main/src/components/chat/welcome-card.tsx) | Locally extracts non-sensitive user interests from conversation history, selects fresh 3-column suggestions (Understand, Create, Explore), and avoids repeating recent sets. |
| 12 | **Audio Dictation / Voice Input** | **Implemented** | [src/components/chat/chat-composer.tsx](file:///c:/Tanixai-main/src/components/chat/chat-composer.tsx#L42-L63) | Web Speech API speech recognition for transcribing spoken prompts into composer textarea. |

---

## 2. FORMATTING, TYPOGRAPHY & MULTIMODAL INGESTION

| # | Feature | Classification | Code Location | Description & Implementation Notes |
|:---|:---|:---|:---|:---|
| 13 | **GitHub Flavored Markdown (GFM)** | **Implemented** | [src/lib/utils/format.ts](file:///c:/Tanixai-main/src/lib/utils/format.ts) | Custom token-protected markdown parser supporting H1–H6, lists, blockquotes, horizontal rules, and responsive tables. |
| 14 | **KaTeX LaTeX Mathematical Notation** | **Implemented** | [src/lib/utils/math-renderer.ts](file:///c:/Tanixai-main/src/lib/utils/math-renderer.ts) | Renders inline `$math$` and block `$$math$$` expressions with HTML sanitization and KaTeX error boundaries. |
| 15 | **Fenced Code Blocks & Syntax Highlighting** | **Implemented** | [src/lib/utils/syntax-highlighter.ts](file:///c:/Tanixai-main/src/lib/utils/syntax-highlighter.ts) | Tokenized syntax highlighting for common languages with language badge, code fence header, and reactive copy-to-clipboard button. |
| 16 | **Streaming-Tolerant Progressive Markdown** | **Implemented** | [src/lib/utils/format.ts](file:///c:/Tanixai-main/src/lib/utils/format.ts#L460-L490) | Auto-closes unclosed code blocks during active streaming inference to eliminate layout shift and syntax flashes. |
| 17 | **Client-Side DOCX Ingestion** | **Implemented** | [src/lib/documents/parser.ts](file:///c:/Tanixai-main/src/lib/documents/parser.ts#L74-L96) | In-browser `.docx` parsing using Mammoth. Extracts raw text and injects up to 16,000 characters into chat context. |
| 18 | **PDF Document Upload** | **Implemented** | [src/lib/documents/parser.ts](file:///c:/Tanixai-main/src/lib/documents/parser.ts#L127-L134) | PDF magic bytes verified (`%PDF`). Automatically routes query to Gemini for native document understanding. |
| 19 | **Image Upload & Vision Analysis** | **Implemented** | [src/lib/documents/parser.ts](file:///c:/Tanixai-main/src/lib/documents/parser.ts#L162-L170), [src/app/api/chat/route.ts](file:///c:/Tanixai-main/src/app/api/chat/route.ts#L105-L120) | PNG/JPEG magic byte verification. Ephemeral base64 data URL preview. Injected into `CoreMessage` for Gemini vision models. |
| 20 | **AI Image Generation (Flux)** | **Implemented** | [src/app/api/image/route.ts](file:///c:/Tanixai-main/src/app/api/image/route.ts) | Generates images using Pollinations Flux CDN with rate limiting, dimension clamping (256–1024), and seed randomization. |

---

## 3. PERSONAL INTELLIGENCE & USER CONTEXT

| # | Feature | Classification | Code Location | Description & Implementation Notes |
|:---|:---|:---|:---|:---|
| 21 | **Explicit User Note Saving** | **Implemented** | [src/features/intelligence/profile-store.ts](file:///c:/Tanixai-main/src/features/intelligence/profile-store.ts#L140-L175) | User can save personal notes in Settings or click "Remember" on chat messages. Max 100 notes, max 500 characters each. |
| 22 | **Sensitive Secret Blocking** | **Implemented** | [src/features/intelligence/profile-store.ts](file:///c:/Tanixai-main/src/features/intelligence/profile-store.ts#L115-L124) | Rejects private keys (RSA/EC/SSH), API tokens, passwords, SSNs, and credit card numbers verified with Luhn algorithm. |
| 23 | **Duplicate Memory Detection** | **Implemented** | [src/features/intelligence/profile-store.ts](file:///c:/Tanixai-main/src/features/intelligence/profile-store.ts#L126-L138) | Jaccard token similarity check (threshold $\ge 0.8$) prevents redundant notes from cluttering storage. |
| 24 | **Bounded Lexical Context Retrieval** | **Implemented** | [src/features/intelligence/retrieval.ts](file:///c:/Tanixai-main/src/features/intelligence/retrieval.ts#L58-L85) | Token-based matching scoring query coverage (0.65), memory coverage (0.2), recency decay (0.1), and importance (0.05). Injects top 5 notes (max 1,800 chars). |
| 25 | **Opt-In Provider Sharing** | **Implemented** | [src/features/intelligence/profile-store.ts](file:///c:/Tanixai-main/src/features/intelligence/profile-store.ts), [retrieval.ts](file:///c:/Tanixai-main/src/features/intelligence/retrieval.ts#L64) | Sharing is disabled by default (`personalizationEnabled: false`). When disabled, zero notes are transmitted to AI providers. |
| 26 | **Prompt Injection Defense** | **Implemented** | [src/lib/ai/personalization-context.ts](file:///c:/Tanixai-main/src/lib/ai/personalization-context.ts), [prompts.ts](file:///c:/Tanixai-main/src/lib/ai/prompts.ts#L13) | Injected notes are wrapped in `<RADIANCE_PERSONAL_CONTEXT_UNTRUSTED>` with JSON escaping and system prompt constraints. |
| 27 | **Automatic Memory Extraction from Conversation** | **UNIMPLEMENTED** (By Design) | N/A | Radiance deliberately rejects automatic scraping/inference of user memories to preserve user agency and trust. |
| 28 | **Semantic / Vector Search (pgvector)** | **Planned** | [README.md](file:///c:/Tanixai-main/README.md#L244-L247) | Planned for future v1.1.0 release. Current retrieval is strictly lexical. |
| 29 | **Encrypted Cloud Vault / Cross-Device Sync** | **Planned** | [src/app/privacy/page.tsx](file:///c:/Tanixai-main/src/app/privacy/page.tsx) | Current notes live in unencrypted browser local storage. Cloud sync and encryption are planned for future versions. |

---

## 4. SETTINGS, THEMING & ATMOSPHERE

| # | Feature | Classification | Code Location | Description & Implementation Notes |
|:---|:---|:---|:---|:---|
| 30 | **Centralized Settings Modal** | **Implemented** | [src/features/settings/settings-center.tsx](file:///c:/Tanixai-main/src/features/settings/settings-center.tsx) | Accessible Radix dialog with sections: General, Appearance, Intelligence, Shortcuts, and Data Management. |
| 31 | **Dynamic Color Theme Rotation** | **Implemented** | [src/lib/theme/dynamic-theme.ts](file:///c:/Tanixai-main/src/lib/theme/dynamic-theme.ts) | 24 curated themes in `COLOR_THEMES`. Automatically rotates to a fresh theme on page load while avoiding immediate predecessors. |
| 32 | **Atmosphere Engines (12 Modes)** | **Implemented** | [src/components/background/atmosphere-canvas-engine.tsx](file:///c:/Tanixai-main/src/components/background/atmosphere-canvas-engine.tsx) | Includes Ribbon Waves, Cosmic 3D (Three.js), Aurora Curtains, Meteors, Radiant Grid, Quantum Nodes, Molten Metablobs, Digital Glyphs, Silk Ribbons, Radial Pulse, Solar Corona, and Star Chase. |
| 33 | **Live Atmosphere Preview** | **Implemented** | [src/features/chat/components/radiance-app.tsx](file:///c:/Tanixai-main/src/features/chat/components/radiance-app.tsx#L402-L447) | Allows previewing background atmospheres in the real chat canvas with an interactive confirmation banner before saving. |
| 34 | **Tone & Persona Configuration** | **Implemented** | [src/lib/ai/prompts.ts](file:///c:/Tanixai-main/src/lib/ai/prompts.ts#L15-L86) | 10 distinct tones: Default, Formal, Casual, Concise, Academic, Executive, Mentor, Technical, Socratic, Devil's Advocate. |
| 35 | **Multi-Language UI (7 Languages)** | **Implemented** | [src/lib/i18n/ui.ts](file:///c:/Tanixai-main/src/lib/i18n/ui.ts) | Full UI localization for English (`en`), Hindi (`hi`), Spanish (`es`), French (`fr`), German (`de`), Portuguese (`pt`), and Japanese (`ja`). |
| 36 | **Custom Instructions Injection** | **Implemented** | [src/features/settings/settings-schema.ts](file:///c:/Tanixai-main/src/features/settings/settings-schema.ts#L12) | Allows up to 2,000 characters of custom instructions injected directly into system prompt. |
| 37 | **Keyboard Shortcuts Manager** | **Implemented** | [src/features/settings/keyboard-shortcuts.ts](file:///c:/Tanixai-main/src/features/settings/keyboard-shortcuts.ts) | Global hotkeys: `Ctrl+N` (New Chat), `Ctrl+L` (History), `Ctrl+,` (Settings), `Escape` (Close Drawers). |
| 38 | **Data Export & Batch Wipe** | **Implemented** | [src/features/chat/components/radiance-app.tsx](file:///c:/Tanixai-main/src/features/chat/components/radiance-app.tsx#L256-L280) | One-click JSON export of all conversations and atomic batch deletion across local storage and Supabase. |

---

## 5. INFRASTRUCTURE, HEALTH & OBSERVABILITY

| # | Feature | Classification | Code Location | Description & Implementation Notes |
|:---|:---|:---|:---|:---|
| 39 | **Liveness Health Probe (`/api/health`)** | **Implemented** | [src/app/api/health/route.ts](file:///c:/Tanixai-main/src/app/api/health/route.ts) | Returns 200 OK with uptime, memory diagnostics (RSS, Heap), provider circuit states, and AI telemetry snapshot. |
| 40 | **Readiness Health Probe (`/api/health/ready`)** | **Implemented** | [src/app/api/health/ready/route.ts](file:///c:/Tanixai-main/src/app/api/health/ready/route.ts) | Evaluates Supabase DB configuration, Redis status, and provider circuit availability. Returns 200 or 503 Degraded. |
| 41 | **Layered Rate Limiting** | **Implemented** | [src/lib/security/rate-limiter.ts](file:///c:/Tanixai-main/src/lib/security/rate-limiter.ts) | Distributed sliding window via Upstash Redis with automatic failover to an in-memory token bucket limiter. |
| 42 | **Provider Circuit Breaker** | **Implemented** | [src/lib/ai/circuit-breaker.ts](file:///c:/Tanixai-main/src/lib/ai/circuit-breaker.ts) | 3-failure threshold in 30s rolling window; 60s cooldown. Skips exhausted providers automatically. |
| 43 | **AI Infrastructure Observability** | **Implemented** | [src/lib/observability/ai-telemetry.ts](file:///c:/Tanixai-main/src/lib/observability/ai-telemetry.ts) | Measures TTFT, generation latency, token volume (input/output), error classifications without leaking prompt content. |
| 44 | **Sentry Distributed Tracing** | **Implemented** | [src/instrumentation.ts](file:///c:/Tanixai-main/src/instrumentation.ts), [next.config.ts](file:///c:/Tanixai-main/next.config.ts) | Sentry Next.js instrumentation with secure tunnel route `/monitoring`. |
| 45 | **Automated Bundle Size Budget Gate** | **Implemented** | [scripts/measure-bundle.mjs](file:///c:/Tanixai-main/scripts/measure-bundle.mjs) | Validates production chunks against strict budgets (< 800kB /page, < 220kB /layout). |
