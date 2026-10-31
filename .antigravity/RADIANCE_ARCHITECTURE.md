# RADIANCE — ARCHITECTURE & PLATFORM SPECIFICATION

**Document Version:** 1.0.0  
**Phase:** Phase 0 & Phase 1 Inception  
**Product:** RADIANCE  
**Tagline:** "Illuminate what is possible."  

---

## 1. HIGH-LEVEL PLATFORM TOPOLOGY

RADIANCE is architected as a modular, unified full-stack application built on **Next.js 15+ App Router**, **React 19**, **TypeScript (Strict Mode)**, **Tailwind CSS v4**, **Vercel AI SDK**, and **Supabase (PostgreSQL + Auth + Storage)**.

```
                      ┌──────────────────────────────────────┐
                      │          BROWSER CLIENT              │
                      │                                      │
                      │  Next.js App Router (RSC + Client)   │
                      │  ├── Landing Page (Brand Showcase)   │
                      │  ├── Auth (Login / Register / SSR)   │
                      │  ├── Workspace Shell (Sidebar, Dock) │
                      │  ├── Chat Stream & Message Tree      │
                      │  ├── 3D Ambient WebGL (Lazy Three.js)│
                      │  └── Settings, Theme & Tone Controls │
                      └──────────────────┬───────────────────┘
                                         │
                         HTTPS (Cookies, Bearer JWT, SSE)
                                         │
                                         ▼
                      ┌──────────────────────────────────────┐
                      │    NEXT.JS APP ROUTER BACKEND        │
                      │                                      │
                      │  Route Handlers & Server Actions     │
                      │  ├── /api/chat (AI Stream Engine)    │
                      │  ├── /api/auth/* (Session Sync)      │
                      │  ├── /api/conversations (CRUD API)   │
                      │  └── /api/media (Secure Ingestion)   │
                      │                                      │
                      │  Core Server Subsystems:             │
                      │  ├── AI Orchestrator & Registry      │
                      │  ├── Capability Resolver (Multimodal)│
                      │  ├── Fallback & Circuit Breaker      │
                      │  ├── Zod Request Schema Validators   │
                      │  └── Rate Limiter (Token Bucket)     │
                      └──────────┬────────────────┬──────────┘
                                 │                │
                PostgreSQL Wire  │                │ Upstream AI APIs
                                 ▼                ▼
     ┌───────────────────────────────┐  ┌───────────────────────────────┐
     │    SUPABASE POSTGRESQL + RLS   │  │    AI PROVIDER ADAPTERS       │
     │                               │  │                               │
     │  - profiles                   │  │  - Groq Cloud                 │
     │  - conversations              │  │    (Llama 3.3 70B Versatile)  │
     │  - messages                   │  │  - Google Gemini              │
     │  - attachments                │  │    (Gemini 2.5 Flash)         │
     │  - user_preferences           │  │  - OpenRouter                 │
     │  - usage_events               │  │    (Llama 3.3 70B Instruct)   │
     │                               │  │  - Pollinations AI            │
     │  Storage Bucket:              │  │    (Flux Image Generation)    │
     │  - user-attachments (Private) │  └───────────────────────────────┘
     └───────────────────────────────┘
```

---

## 2. MODULAR LAYER RESPONSIBILITIES

### Layer 1: Presentation (`src/components/`, `src/app/`)
- Server Components by default for metadata, initial layout shell, and pre-rendered content.
- Client Components isolated strictly to interactive leaves:
  - `ChatComposer`: Auto-resizing textarea, file upload dropzone, mic audio recorder, send/stop controls.
  - `MessageStream`: Virtualized/scrolled message list with real-time SSE stream tokens, rendered markdown, syntax-highlighted code blocks, and action bars (copy, retry, edit).
  - `ModelSelector`: Dynamic model badge with capability tags (Text, Vision, PDF, Reasoning) and provider health indicators.
  - `AmbientBackground`: Lazy-loaded, isolated Three.js canvas preserving the organic nebula blobs, Fresnel glow, and theme synchronization.

### Layer 2: Domain Services (`src/lib/services/`)
- Pure business logic completely decoupled from UI components and upstream vendor SDKs.
- `conversation.service.ts`: Thread creation, pagination, title auto-generation, archiving.
- `message.service.ts`: Message append, validation, optimistic updates.
- `file.service.ts`: Document MIME checking, size enforcement (10MB max), text/CSV extraction, and secure Supabase Storage signing.

### Layer 3: AI Orchestration (`src/lib/ai/`)
- `registry.ts`: Typed model capability matrix mapping providers to supported features (vision, tools, context limits, speed rating).
- `resolver.ts`: Inspects user turn (text, attached images, PDFs) and selects the optimal model adapter.
- `stream.ts`: Unified Server-Sent Events (SSE) streaming engine powered by Vercel AI SDK.
- `fallback.ts`: Automatic circuit breaker catching upstream rate limits (HTTP 429 / quota exhaustion) and cascading to healthy alternatives without dropped state.

### Layer 4: Data & Persistence (`src/lib/db/`, `supabase/migrations/`)
- Clean PostgreSQL schema with strict foreign keys, UUID primary keys, and Row Level Security (RLS) guaranteeing tenant isolation.
- Type-safe query client with generated Supabase database types.
- Legacy import utility to migrate valid past chats from browser `localStorage` into cloud database.

### Layer 5: Security & Ingress (`src/lib/security/`)
- Rate limiting middleware using in-memory or Redis token buckets.
- Strict Content Security Policy without `'unsafe-eval'`.
- Request body sanitization and Zod schema validation.
- Secure HTTP-only session cookies.
