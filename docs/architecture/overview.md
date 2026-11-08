# System Architecture Overview

**RADIANCE** is architected as a modular, high-craft AI workspace built on modern web standards, edge-ready API routes, and multi-provider model orchestration.

---

## 1. High-Level Architecture Topology

```mermaid
flowchart TD
  subgraph Client ["Client Presentation Layer (Next.js 15 App Router & React 19)"]
    Workspace["ChatWorkspace
    - MessageItem List
    - WelcomeCard & Prompt Pills"]
    Composer["Unified AI Composer
    - Model & Mode Bottom Sheets
    - Web Speech Dictation
    - File Attachments"]
    NavShell["Responsive Shell
    - Topbar (Session Badge & Brand)
    - Mobile Bottom Navigation Bar
    - Slide-out Drawers (History & Settings)"]
    Atmosphere["Atmospheric Engine
    - Three.js Ambient Canvas
    - 16 OKLCH Dynamic Themes"]
  end

  subgraph API ["Next.js Server API Layer (Edge & Node.js)"]
    RateLimiter["Rate Limiting Middleware
    (Upstash Redis / In-Memory Bucket)"]
    ChatRoute["/api/chat (SSE Stream)"]
    FollowUpsRoute["/api/followups"]
    HealthRoutes["/api/health & /api/health/ready"]
  end

  subgraph AI ["AI Provider Registry (Vercel AI SDK)"]
    GroqProvider["Groq (Llama 3.3 70B & 3.1 8B)"]
    GeminiProvider["Google Gemini (2.5 Flash & Pro)"]
    OpenRouterProvider["OpenRouter Reasoning"]
  end

  subgraph Persistence ["Persistence & Observability Layer"]
    SupabaseDB["Supabase PostgreSQL / Client Storage"]
    SentryHub["Sentry Monitoring & Tracing"]
    VercelObs["Vercel Speed Insights & Analytics"]
  end

  Workspace --> Composer
  Composer --> NavShell
  NavShell --> Atmosphere
  Composer -- "Fetch POST (SSE)" --> RateLimiter
  RateLimiter --> ChatRoute
  ChatRoute --> GroqProvider
  ChatRoute --> GeminiProvider
  ChatRoute --> OpenRouterProvider
  Workspace -- "Conversation Sync" --> SupabaseDB
  Client -- "Telemetry" --> SentryHub
  Client -- "Core Web Vitals" --> VercelObs
```

---

## 2. Layer Separation & Boundaries

1. **Presentation Layer (`src/components/`, `src/features/`):**
   - React 19 client components with strict prop contracts.
   - Pinned 100dvh viewport layout with touch-first ergonomics.
   - Zero hardcoded color palettes; all surfaces consume semantic CSS custom properties (`var(--accent)`, `var(--surface)`, `var(--void)`).
2. **Formatting & Parsing Engine (`src/lib/utils/`):**
   - Stream-safe Markdown parsing with code fence auto-closing in `format.ts`.
   - KaTeX LaTeX equation rendering (`math-renderer.ts`).
   - Tokenized code highlighting with line numbering (`syntax-highlighter.ts`).
   - Strict XSS escaping and URI scheme validation (`isSafeUrl`).
3. **State & Streaming Layer (`src/features/chat/hooks/`):**
   - `useChatStream`: Persistent cross-chunk line buffer to prevent token drops over SSE.
   - `useChatSession`: Multi-conversation lifecycle, message editing, branching, and persistence.
4. **AI Model Layer (`src/lib/ai/`):**
   - Unified multi-provider abstraction (`models.ts`, `providers.ts`).
   - Circuit breaker and error handling for remote provider timeouts.
5. **Data & Persistence (`src/lib/db/`):**
   - Supabase SSR integration with seamless fallback to browser localStorage when offline or unconfigured.
