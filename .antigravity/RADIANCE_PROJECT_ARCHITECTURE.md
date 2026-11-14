# RADIANCE — COMPREHENSIVE PROJECT ARCHITECTURE & RECONNAISSANCE SPECIFICATION

> **Platform Version:** 1.0.0 (Production Core)  
> **Repository:** `Tanixai-main`  
> **Reconnaissance Date:** November 14, 2026  
> **Classification:** Living Architectural Blueprint  
> **Status:** VERIFIED IN CODE & VERIFIED BY EXECUTION  

---

## 1. EXECUTIVE PRODUCT OVERVIEW

**Radiance** is an editorial, high-performance AI workspace and intelligence canvas engineered for multi-model reasoning, ambient design, and deep personal productivity.

### Core Product Philosophy
1. **User-Controlled Personal Intelligence:** Notes and preferences are saved explicitly by the user, managed on the current browser profile, and attached to AI requests only when opt-in sharing is enabled. Radiance does not automatically infer memories or scrape private data without user confirmation.
2. **Multi-Model Orchestration:** Dynamic capability-based routing across Groq LPUs (`llama-3.3-70b-versatile`, `llama-3.1-8b-instant`), Google Gemini (`gemini-2.5-flash`, `gemini-2.5-pro`), and OpenRouter (`meta-llama/llama-3.3-70b-instruct`).
3. **Resilient Streaming:** Real-time Server-Sent Events (SSE) streaming via the Vercel AI SDK (`ai` v4.1.54). Stop-generation actions preserve all accumulated tokens without state desynchronization.
4. **Atmospheric & Multicolour Visual Identity:** Grounded in a dark violet ground (`#06050a`), editorial Cormorant Garamond display headings, Plus Jakarta Sans interface typography, JetBrains Mono technical labels, and vibrant multicolour accents (blue, cyan, violet, indigo, coral, rose, emerald, teal, amber) complemented by 12 procedural atmosphere background engines.
5. **Privacy & Offline First:** Zero mandatory account lock-in. Full offline resilience via safe `localStorage` with dual-write synchronization to Supabase PostgreSQL when authenticated.

---

## 2. VERIFIED TECHNOLOGY STACK

All dependencies and versions are verified from [package.json](file:///c:/Tanixai-main/package.json), [pnpm-lock.yaml](file:///c:/Tanixai-main/pnpm-lock.yaml), and runtime configurations.

| Layer / Domain | Technology | Version | Configuration File | Role in Radiance | Verification Status |
|:---|:---|:---|:---|:---|:---|
| **Core Framework** | Next.js | `^15.2.1` | [next.config.ts](file:///c:/Tanixai-main/next.config.ts) | App Router, Server Actions, Edge/Node API Routes, Route Segments | VERIFIED IN CODE |
| **UI Library** | React & React DOM | `^19.0.0` | [package.json](file:///c:/Tanixai-main/package.json) | Concurrent rendering, Server/Client components, Hooks | VERIFIED IN CODE |
| **Language** | TypeScript | `^5.8.2` | [tsconfig.json](file:///c:/Tanixai-main/tsconfig.json) | Strict type checking, zero `noEmit` errors | VERIFIED BY EXECUTION |
| **Styling** | Tailwind CSS | `^4.0.12` | [src/app/globals.css](file:///c:/Tanixai-main/src/app/globals.css) | CSS-first `@theme` variables, zero-runtime CSS tokens | VERIFIED IN CODE |
| **PostCSS** | `@tailwindcss/postcss` | `^4.0.12` | [postcss.config.mjs](file:///c:/Tanixai-main/postcss.config.mjs) | PostCSS 8 compilation pipeline | VERIFIED IN CODE |
| **UI Primitives** | Radix UI | `^1.1.x` / `^2.1.x` | [src/components/ui/sidebar.tsx](file:///c:/Tanixai-main/src/components/ui/sidebar.tsx) | Accessible dialogs, popovers, dropdown menus, slots, tooltips | VERIFIED IN CODE |
| **Motion** | Motion for React (`motion`) | `^12.4.10` | [src/lib/motion/presets.ts](file:///c:/Tanixai-main/src/lib/motion/presets.ts) | Framer motion replacement, reduced-motion compliant springs | VERIFIED IN CODE |
| **3D & Graphics** | Three.js & `@react-three/fiber` | `^0.174.0` / `^9.8.2` | [src/components/background/ambient-canvas.tsx](file:///c:/Tanixai-main/src/components/background/ambient-canvas.tsx) | WebGL starfield, cosmic shaders, post-processing | VERIFIED IN CODE |
| **AI SDK** | Vercel AI SDK (`ai`) | `^4.1.54` | [src/app/api/chat/route.ts](file:///c:/Tanixai-main/src/app/api/chat/route.ts) | Core streamText, SSE data stream protocol, CoreMessage mapping | VERIFIED IN CODE |
| **AI Provider: Groq** | `@ai-sdk/groq` | `^1.1.18` | [src/lib/ai/providers.ts](file:///c:/Tanixai-main/src/lib/ai/providers.ts) | Llama 3.3 70B & Llama 3.1 8B low-latency LPU inference | VERIFIED IN CODE |
| **AI Provider: Google** | `@ai-sdk/google` | `^1.1.18` | [src/lib/ai/providers.ts](file:///c:/Tanixai-main/src/lib/ai/providers.ts) | Gemini 2.5 Flash & Gemini 2.5 Pro native multimodal inference | VERIFIED IN CODE |
| **AI Provider: OpenRouter** | `@ai-sdk/openai` | `^1.1.14` | [src/lib/ai/providers.ts](file:///c:/Tanixai-main/src/lib/ai/providers.ts) | OpenRouter compatibility layer for open-weights models | VERIFIED IN CODE |
| **Database & Auth** | Supabase JS & SSR | `^2.49.1` / `^0.5.2` | [src/lib/db/client.ts](file:///c:/Tanixai-main/src/lib/db/client.ts), [server.ts](file:///c:/Tanixai-main/src/lib/db/server.ts) | Cloud PostgreSQL 15+, RLS policies, cookie session hydration | VERIFIED IN CODE |
| **Rate Limiting** | Upstash Redis & Ratelimit | `^1.40.0` / `^2.2.0` | [src/lib/security/rate-limiter.ts](file:///c:/Tanixai-main/src/lib/security/rate-limiter.ts) | Distributed sliding window rate limiting with local token-bucket fallback | VERIFIED IN CODE |
| **Schema Validation** | Zod | `^3.24.2` | [src/lib/security/sanitize.ts](file:///c:/Tanixai-main/src/lib/security/sanitize.ts) | API body validation, memory schema validation, settings validation | VERIFIED IN CODE |
| **Observability** | Sentry Next.js | `^11.11.0` | [sentry.client.config.ts](file:///c:/Tanixai-main/sentry.client.config.ts), [next.config.ts](file:///c:/Tanixai-main/next.config.ts) | Error monitoring, distributed tracing, tunnel route `/monitoring` | VERIFIED IN CODE |
| **Analytics** | Vercel Analytics & Speed Insights | `^2.0.1` / `^2.1.0` | [src/app/layout.tsx](file:///c:/Tanixai-main/src/app/layout.tsx) | Real User Monitoring (RUM), Core Web Vitals | VERIFIED IN CODE |
| **Typography & Math** | KaTeX | `^0.19.1` | [src/lib/utils/math-renderer.ts](file:///c:/Tanixai-main/src/lib/utils/math-renderer.ts) | Inline and block LaTeX rendering with XSS-safe escaping | VERIFIED IN CODE |
| **Document Processing** | Mammoth | `^1.13.0` | [src/lib/documents/parser.ts](file:///c:/Tanixai-main/src/lib/documents/parser.ts) | In-browser client-side `.docx` raw text extraction | VERIFIED IN CODE |
| **Icons** | Lucide React & Tabler Icons | `^0.479.0` / `^3.50.0` | Multiple UI components | Feather & Tabler SVG iconography | VERIFIED IN CODE |
| **Unit Testing** | Vitest & Testing Library | `^3.0.8` / `^16.2.0` | [vitest.config.ts](file:///c:/Tanixai-main/vitest.config.ts) | 66 test files, 596 test cases | VERIFIED BY EXECUTION |
| **E2E Testing** | Playwright | `^1.64.1` | [playwright.config.ts](file:///c:/Tanixai-main/playwright.config.ts) | Multi-browser (Chromium, Firefox, WebKit, Mobile Chrome, Safari) | VERIFIED IN CODE |

---

## 3. SYSTEM ARCHITECTURE & TOPOLOGY

```mermaid
flowchart TD
    subgraph ClientBrowser ["Client Browser (Next.js 15 Client Layer)"]
        Landing["Landing Page (/)"]
        ChatApp["RadianceApp (/chat)"]
        Privacy["Privacy Page (/privacy)"]
        NotFound["NotFound Page (/not-found)"]

        subgraph ChatAppSubsystems ["Chat App Components & Hooks"]
            Composer["ChatComposer (Input, Mode, Model, Attachments)"]
            Workspace["ChatWorkspace (Message List & Streaming Virtualizer)"]
            Message["MessageItem (Markdown, Code Highlighting, KaTeX, Feedback)"]
            Dock["SidebarDock & HistoryDrawer (Recent Chats, Pins)"]
            SettingsModal["SettingsCenter (General, Themes, Personal Intelligence)"]
            AtmoCanvas["BackgroundLayers (12 Canvas / WebGL Atmosphere Engines)"]
            
            HookSession["useChatSession Hook (Local State, Persistence, Follow-ups)"]
            HookStream["useChatStream Hook (Line Buffer, SSE Reader, AbortController)"]
        end

        subgraph LocalStorageEngines ["Browser Local Storage (Plaintext)"]
            ConvStore["safeLocalStorage (Conversations, Messages, Pinned)"]
            SettingsStore["radiance_settings (Theme, Tone, Model, enterToSend)"]
            IntelStore["radiance_personal_intelligence_v1 (Memories, Feedback)"]
            WelcomeStore["radiance_welcome_suggestion_ids (Rotation State)"]
        end
    end

    subgraph ServerAppRouter ["Next.js App Router (Node.js Runtime)"]
        APIChat["POST /api/chat (SSE Stream)"]
        APIFollowup["POST /api/followups (Suggested Queries)"]
        APIImage["POST /api/image (Pollinations Flux CDN)"]
        APIHealth["GET /api/health (Liveness)"]
        APIReady["GET /api/health/ready (Readiness)"]

        subgraph SecurityGate ["Security & Validation Middleware"]
            RateLimit["Rate Limiter (Upstash Redis + Token Bucket Fallback)"]
            ZodSanitize["Zod Validation (ChatRequestSchema, ImageGenSchema)"]
            TrustedIP["getTrustedClientIp (Cloudflare / Vercel Edge Headers)"]
            ContextWrap["formatPersonalizationContext (<RADIANCE_PERSONAL_CONTEXT_UNTRUSTED>)"]
        end

        subgraph AICore ["AI Orchestration Subsystem"]
            Circuit["CircuitBreaker (Failure Window, Cooldown)"]
            CapabilityRouter["resolveCapabilityModel (Multimodal Auto-Switch)"]
            ModelRegistry["AVAILABLE_MODELS Registry"]
            PromptComposer["composeSystemPrompt (Tone, Mode, Language)"]
            Providers["getModelInstance (@ai-sdk/groq, google, openai)"]
        end

        subgraph Observability ["Telemetry & Logging"]
            AITelemetry["aiTelemetry (TTFT, Latency, Token Counts, Failover)"]
            SentryTracing["Sentry Tracing & Error Capture"]
        end
    end

    subgraph ExternalServices ["External Cloud Services"]
        GroqAPI["Groq LPU Cloud (llama-3.3-70b-versatile)"]
        GoogleAPI["Google Gemini API (gemini-2.5-flash / pro)"]
        OpenRouterAPI["OpenRouter Distributed Cloud"]
        PollinationsAPI["Pollinations.ai Image CDN (Flux)"]
        SupabaseCloud[("Supabase Cloud (PostgreSQL 15+ & Auth)")]
        UpstashRedis[("Upstash Redis (Distributed Sliding Window)")]
        SentryCloud["Sentry.io Ingest"]
    end

    %% Client Interactions
    ChatApp --> HookSession
    ChatApp --> HookStream
    HookSession <--> LocalStorageEngines
    HookStream --> APIChat
    Composer --> HookStream
    Workspace --> Message

    %% Server Flow
    APIChat --> TrustedIP --> RateLimit
    APIChat --> ZodSanitize
    ZodSanitize --> ContextWrap
    ContextWrap --> CapabilityRouter
    CapabilityRouter --> Circuit
    Circuit --> Providers
    Providers --> GroqAPI
    Providers --> GoogleAPI
    Providers --> OpenRouterAPI
    APIChat --> AITelemetry --> SentryCloud

    %% Persistence
    HookSession -.->|If Authenticated| SupabaseCloud
    RateLimit -.->|If Configured| UpstashRedis
    APIImage --> PollinationsAPI
```

---

## 4. FRONTEND COMPONENT ARCHITECTURE & ENTRY POINTS

### Routing Structure (`src/app`)
- **[layout.tsx](file:///c:/Tanixai-main/src/app/layout.tsx):** Root HTML shell, Cormorant Garamond Google Font (`--font-serif`), JSON-LD Structured Data, Vercel Analytics, Speed Insights, ASCII Magic web component.
- **[page.tsx](file:///c:/Tanixai-main/src/app/page.tsx):** Root Landing Page rendering `<LandingPage />`.
- **[chat/page.tsx](file:///c:/Tanixai-main/src/app/chat/page.tsx):** Core chat workspace rendering `<RadianceApp />` (`robots: index: false`).
- **[privacy/page.tsx](file:///c:/Tanixai-main/src/app/privacy/page.tsx):** Static honest privacy disclosures for Personal Intelligence.
- **[not-found.tsx](file:///c:/Tanixai-main/src/app/not-found.tsx):** Custom 404 page featuring interactive procedural Starry Ridge ASCII art canvas.
- **[sitemap.ts](file:///c:/Tanixai-main/src/app/sitemap.ts) & [robots.ts](file:///c:/Tanixai-main/src/app/robots.ts):** Dynamic XML sitemaps and crawler access rules.

### Component Hierarchy
```
src/app/chat/page.tsx
 └── RadianceApp (src/features/chat/components/radiance-app.tsx)
      ├── AmbientCanvas (Three.js WebGL Cosmic Engine)
      ├── BackgroundLayers (Aurora waves, 11 canvas engines, film grain, vignette)
      ├── IntroSplash (Initial branded entrance splash)
      ├── SidebarDock (Vertical collapsed/expanded dock, New Chat, History, Settings)
      │    └── Sidebar / SidebarBody / SidebarLink (@tabler/icons-react)
      ├── Topbar (Brand wordmark, Language selector, New Chat trigger, Mobile menu)
      ├── ChatWorkspace (src/features/chat/components/chat-workspace.tsx)
      │    ├── WelcomeCard (Personalized 3-column suggestions: Understand, Create, Explore)
      │    ├── MessageItem (src/components/chat/message-item.tsx)
      │    │    ├── RadianceLogo (Avatar: You vs Radiance RD symbol)
      │    │    ├── Formatted Markdown (Headers, Code fences with copy, KaTeX math, Tables)
      │    │    ├── Regeneration Status Indicator ("Regenerated once")
      │    │    ├── Action Toolbar (Desktop hover: Copy, Edit, Regenerate, Thumbs Up/Down)
      │    │    ├── Mobile Action Menu (Radix Dropdown: Copy, Edit, Regenerate, Feedback)
      │    │    └── FollowUpChips (Dynamically generated follow-up suggestion pills)
      │    ├── Active Generation Indicator (Pulsing glowing orb + TTFT spinner)
      │    ├── Error Card (In-message retry container)
      │    └── ChatComposer (src/components/chat/chat-composer.tsx)
      │         ├── Mode Selector (Ask [default], Plan, Build)
      │         ├── Model Selector Dropdown (Active model indicator & badge)
      │         ├── Attachment Dropzone & Chips (Image, PDF, DOCX, CSV preview)
      │         ├── Textarea with IME composition safety & Enter-to-send toggle
      │         ├── Audio Dictation (Web Speech API recognition)
      │         └── Send / Stop Generation Button
      ├── MobileBottomNav (Thumb-zone navigation: Chat, History, New Chat, Settings)
      ├── HistoryDrawer (Slide-out conversation manager, Pin, Delete, Delete All)
      └── SettingsCenter (Radix Dialog with tabs: General, Appearance, Intelligence, Shortcuts, Data)
```

---

## 5. AI INFERENCE & STREAMING LIFECYCLE

```mermaid
sequenceDiagram
    autonumber
    actor User
    participant Composer as ChatComposer
    participant StreamHook as useChatStream
    participant APIChat as POST /api/chat
    participant RateLimiter as Rate Limiter (Upstash / Local)
    participant Circuit as CircuitBreaker
    participant Provider as AI Provider (Groq / Gemini / OpenRouter)
    participant SessionHook as useChatSession
    participant LocalDB as safeLocalStorage

    User->>Composer: Enters prompt, selects mode ("Ask"), attaches files
    Composer->>StreamHook: send(messages, modelId, mode, personalization)
    StreamHook->>StreamHook: Creates AbortController & sets isGenerating=true
    StreamHook->>APIChat: HTTP POST { messages, modelId, mode, tone, language, personalization }
    
    APIChat->>RateLimiter: checkRateLimit(clientIp, "chat")
    alt Rate limit exceeded (429)
        RateLimiter-->>APIChat: { success: false, retryAfter: 15 }
        APIChat-->>StreamHook: HTTP 429 { error: "Rate limit exceeded" }
        StreamHook-->>Composer: Displays in-message error card
    else Within limit
        RateLimiter-->>APIChat: { success: true }
    end

    APIChat->>APIChat: Zod validates request body
    APIChat->>APIChat: Detects multimodal attachments (routes to Gemini if image/pdf present)
    APIChat->>Circuit: resolveCandidateModels(modelId, hasMultimodal)
    Circuit-->>APIChat: List of non-exhausted candidate models

    loop Candidate Provider Execution
        APIChat->>Provider: streamText({ model, systemPrompt, coreMessages, abortSignal: req.signal })
        alt Provider Throws 429 / Quota
            Provider-->>APIChat: Error (Quota / 429)
            APIChat->>Circuit: recordFailure(provider)
            Note over APIChat,Circuit: Failover to next candidate model
        else Streaming Active
            Provider-->>APIChat: SSE Chunks (0:"token\n")
            APIChat-->>StreamHook: SSE Data Stream Transfer
            StreamHook->>StreamHook: Process line buffer (0:"token")
            StreamHook->>Composer: Updates streamingContent in UI in real-time
        end
    end

    alt User Clicks Stop
        User->>Composer: Clicks Stop Button
        Composer->>StreamHook: stop(discardPartial=false)
        StreamHook->>StreamHook: abortController.abort()
        Note over StreamHook: req.signal aborts upstream server fetch immediately
        StreamHook->>SessionHook: Preserves accumulated tokens as completed assistant message
        SessionHook->>LocalDB: Saves conversation with partial tokens
    else Stream Finishes Normally
        StreamHook->>SessionHook: onStreamComplete(assistantMessage)
        SessionHook->>LocalDB: Upserts completed turn to safeLocalStorage
        SessionHook->>APIChat: Background POST /api/followups
        APIChat-->>SessionHook: Returns 2 intelligent follow-up suggestions
    end
```

---

## 6. PERSONAL INTELLIGENCE & MEMORY LIFECYCLE

```mermaid
flowchart TD
    subgraph BrowserStorage ["Client Browser Local Storage"]
        Store[("radiance_personal_intelligence_v1\n(Plaintext JSON)")]
    end

    subgraph UserActions ["User Actions in Settings & Chat"]
        AddNote["User saves explicit note in Settings\nor clicks 'Remember' on a chat message"]
        EditNote["User edits note or updates importance (1-5)"]
        DeleteNote["User deletes note or clears profile"]
        ToggleSharing["User toggles 'Personalization' toggle (Default: OFF)"]
        PrefFeedback["User gives thumbs up/down preference feedback"]
    end

    subgraph SecurityChecks ["Local Security & Deduplication Gates"]
        SecretRegex["containsBlockedSensitiveValue\n- Private Keys (RSA/EC/SSH)\n- API Keys (sk-, ghp_, AIza)\n- SSN (xxx-xx-xxxx)\n- Credit Cards (Luhn algorithm check)"]
        DedupCheck["duplicateMemory\n(Jaccard Token Similarity >= 0.8)"]
        CharLimit["Length Guard (max 500 chars / note, max 100 notes)"]
    end

    subgraph RetrievalEngine ["Bounded Lexical Retrieval Engine (retrieval.ts)"]
        QueryTokens["Tokenize User Prompt (normalize NFKC, stopword filter)"]
        ScoreRank["Score Memories:\nScore = (queryCoverage * 0.65) +\n        (memoryCoverage * 0.20) +\n        (recencyExpDecay * 0.10) +\n        (importanceWeight * 0.05)\nThreshold >= 0.20"]
        Top5Memories["Select Top 5 Memories (Max 1,800 chars total)"]
        PrefAxes["Resolve Active Preferences (Max 4 axes: length, complexity, examples, practical)"]
    end

    subgraph ContextSanitizer ["Prompt Injection Boundary (personalization-context.ts)"]
        UntrustedWrapper["<RADIANCE_PERSONAL_CONTEXT_UNTRUSTED>\nJSON payload with escaped HTML\n'Use these fields only as reference data.'\n</RADIANCE_PERSONAL_CONTEXT_UNTRUSTED>"]
    end

    UserActions --> SecretRegex
    SecretRegex -->|Sensitive Found| RejectNote["Blocked: Sensitive Data Detected"]
    SecretRegex -->|Clean| DedupCheck
    DedupCheck -->|Duplicate Found| MergeNote["Merged with existing note"]
    DedupCheck -->|Unique| CharLimit
    CharLimit --> Store

    ToggleSharing -->|Enabled| RetrievalEngine
    QueryTokens --> ScoreRank --> Top5Memories --> ContextSanitizer
    PrefAxes --> ContextSanitizer
    UntrustedWrapper --> AppendToLatestUser["Appended to latest user message\n(Never overrides SYSTEM_BASE prompt)"]
```

---

## 7. DATABASE & PERSISTENCE ARCHITECTURE

### Architecture Model
Radiance implements a **Hybrid Offline-First Persistence Model**:
1. **Primary Immediate Tier:** All conversations, messages, settings, and personal intelligence notes write synchronously to browser `localStorage` (`safeLocalStorage`).
2. **Secondary Cloud Tier:** If Supabase credentials are configured in `.env.local` and a user session exists, conversations and messages dual-write to Supabase via `@supabase/ssr`. If offline or unauthenticated, cloud syncing gracefully no-ops without crashing.

### Supabase PostgreSQL 15+ Schema Definition

```sql
-- 1. PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  preferred_tone TEXT DEFAULT 'default',
  preferred_theme TEXT DEFAULT 'default',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. CONVERSATIONS
CREATE TABLE public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Untitled Conversation',
  pinned BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_conversations_user_updated ON public.conversations(user_id, updated_at DESC);

-- 3. MESSAGES
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  generated_image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE INDEX idx_messages_conversation_created ON public.messages(conversation_id, created_at ASC);

-- 4. ATTACHMENTS
CREATE TABLE public.attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('image', 'pdf', 'text', 'csv', 'doc')),
  mime_type TEXT NOT NULL,
  file_size BIGINT NOT NULL,
  storage_path TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USAGE EVENTS (Insert-only for service, Read-only for users)
CREATE TABLE public.usage_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  tokens_input INT,
  tokens_output INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Row Level Security (RLS) Policies
- All tables have `ROW LEVEL SECURITY` explicitly enabled (`ALTER TABLE ... ENABLE ROW LEVEL SECURITY`).
- Isolation guarantee: `USING (auth.uid() = user_id)` and `WITH CHECK (auth.uid() = user_id)` on `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
- Cross-tenant data leaks are structurally impossible at the database engine level.

---

## 8. SECURITY & DEFENSIVE ENGINEERING INVENTORY

| Security Domain | Implemented Mechanism | Code Location | Status |
|:---|:---|:---|:---|
| **Content Security Policy** | Strict CSP: `default-src 'self'`, `frame-ancestors 'none'`, restricted connect targets (`supabase`, `upstash`, `groq`, `google`, `openrouter`, `sentry`, `pollinations`) | [next.config.ts](file:///c:/Tanixai-main/next.config.ts) | VERIFIED IN CODE |
| **HTTP Security Headers** | `X-Content-Type-Options: nosniff`, `X-Frame-Options: DENY`, `X-XSS-Protection: 0`, `Referrer-Policy: strict-origin-when-cross-origin`, `Permissions-Policy` | [next.config.ts](file:///c:/Tanixai-main/next.config.ts) | VERIFIED IN CODE |
| **Edge Header Spoofing (SEC-07)** | `getTrustedClientIp` prioritizes Cloudflare `cf-connecting-ip` and Vercel `x-vercel-forwarded-for` before falling back to `x-forwarded-for` | [src/lib/security/rate-limiter.ts](file:///c:/Tanixai-main/src/lib/security/rate-limiter.ts) | VERIFIED IN CODE |
| **Rate Limiter Memory Exhaustion (SEC-01)** | Local token bucket enforces strict 10,000 bucket cap with periodic cleanup and FIFO eviction | [src/lib/security/rate-limiter.ts](file:///c:/Tanixai-main/src/lib/security/rate-limiter.ts) | VERIFIED IN CODE |
| **Circuit Breaker Poisoning (SEC-03)** | Trips only after 3 consecutive failures within a 30s rolling window, preventing single-tenant DoS | [src/lib/ai/circuit-breaker.ts](file:///c:/Tanixai-main/src/lib/ai/circuit-breaker.ts) | VERIFIED IN CODE |
| **PostgREST Injection (SEC-08)** | Parameter validation (`/^[a-zA-Z0-9_-]{1,128}$/`) on conversation & message IDs before SQL queries | [src/lib/db/conversations.ts](file:///c:/Tanixai-main/src/lib/db/conversations.ts) | VERIFIED IN CODE |
| **Data URI Scheme Validation (SEC-04)** | Regex validation `^data:image/(?:png|jpeg|jpg|webp|gif);base64,...` on multimodal image uploads | [src/lib/security/sanitize.ts](file:///c:/Tanixai-main/src/lib/security/sanitize.ts) | VERIFIED IN CODE |
| **Credential & Stack Leakage (SEC-05)** | Server errors scrubbed before client response; `toDataStreamResponse` sanitizes provider errors | [src/app/api/chat/route.ts](file:///c:/Tanixai-main/src/app/api/chat/route.ts) | VERIFIED IN CODE |
| **Markdown XSS Neutralization** | Neutralizes raw `<script>`, `<iframe>`, `on*` attributes, `javascript:`, `vbscript:`, `data:` in links | [src/lib/utils/format.ts](file:///c:/Tanixai-main/src/lib/utils/format.ts) | VERIFIED BY EXECUTION |
| **Prompt Injection Defense** | Injected context wrapped in `<RADIANCE_PERSONAL_CONTEXT_UNTRUSTED>` with JSON escaping; system prompt explicitly instructed to treat as untrusted data | [src/lib/ai/prompts.ts](file:///c:/Tanixai-main/src/lib/ai/prompts.ts), [personalization-context.ts](file:///c:/Tanixai-main/src/lib/ai/personalization-context.ts) | VERIFIED IN CODE |
| **Secret Exfiltration Defense** | Personal notes scanned for private keys, tokens, SSNs, and credit cards (Luhn) before storage | [src/features/intelligence/profile-store.ts](file:///c:/Tanixai-main/src/features/intelligence/profile-store.ts) | VERIFIED IN CODE |
| **File Signature Verification** | Validates magic bytes for PDF (`%PDF`), DOCX (ZIP `PK..`), PNG (`\x89PNG`), JPEG (`\xFF\xD8\xFF`) | [src/lib/documents/parser.ts](file:///c:/Tanixai-main/src/lib/documents/parser.ts) | VERIFIED IN CODE |

---

## 9. DESIGN SYSTEM & FRONTEND ENGINEERING

- **Color Ground:** Void (`#06050a`), Deep Violet (`#0c0b14`), Raised Surface (`rgba(16, 14, 24, 0.88)`).
- **Multicolour Identity Tokens:** Blue (`#3b82f6`), Cyan (`#06b6d4`), Violet (`#8b5cf6`), Indigo (`#6366f1`), Coral (`#fb923c`), Rose (`#f43f5e`), Emerald (`#10b981`), Teal (`#14b8a6`), Amber (`#f59e0b`).
- **Typography:**
  - Display: Cormorant Garamond (weight 500, loaded via `next/font/google`).
  - Interface Body: Plus Jakarta Sans (weights 400, 500, 600, 700).
  - Code & Badges: JetBrains Mono (monospace).
- **Motion Standards:**
  - Feedback transitions: `150ms`.
  - Interaction transitions: `200ms`.
  - Entrance transitions: `280ms`.
  - Standard curve: `cubic-bezier(0.2, 0.8, 0.2, 1)`.
  - Reduced Motion: Fully respected via `useReducedMotion()` from `motion/react` across all animations.
- **Ergonomics & Mobile:**
  - Mobile bottom navigation with virtual keyboard dismissal (`isComposerFocused`).
  - Touch targets guaranteed $\ge 44 \times 44\text{px}$.
  - Dynamic viewport units (`100dvh`, `100svh`) and iOS safe-area insets (`env(safe-area-inset-bottom)`).
