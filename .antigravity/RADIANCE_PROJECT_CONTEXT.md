# RADIANCE — PROJECT CONTEXT & SYSTEM OVERVIEW

**Document Version:** 1.0.0  
**Audit Date:** 2026-11-01  
**Project Transition:** Tanix AI (v0.1 – v0.7) → **RADIANCE Platform**  
**Repository Working Copy:** `c:\Tanixai-main`  
**Author:** Antigravity Audit Engine  

---

## 1. PROJECT PURPOSE & VISION

The repository `Tanixai` contains an older personal AI web project originally created by Tanish Bane (a student based in Malad West, Mumbai) under the working title **TanixAI** (versions v0.1 through v0.7). The project is currently transitioning into a new product identity: **RADIANCE**.

While originally designed as an opinionated, personal AI assistant tailored for tech learning, portfolio presentation, and Mumbai student guidance, the platform is slated to evolve into a sophisticated, scalable, and potentially global AI platform. 

The purpose of this audit and context document is to anchor an exact, evidence-backed baseline of the current implementation before any architectural expansion, refactoring, or product pivots occur.

---

## 2. ACTUAL TECHNOLOGY STACK INVENTORY

Contrary to modern React, Next.js, or TypeScript setups, this codebase is an ultra-lightweight, zero-build, vanilla web application designed for direct static deployment with a single serverless proxy endpoint.

| Layer | Technology | Version / Spec | Purpose & Implementation Details |
|---|---|---|---|
| **Frontend Runtime** | Vanilla JavaScript | ECMAScript 2020+ | Client-side application logic, DOM manipulation, state handling, speech, and networking. (`app.js`) |
| **Frontend Markup** | Semantic HTML5 | HTML5 Standard | Single-page shell with ambient mesh canvas, drawers, and chat input dock. (`index.html`) |
| **Frontend Styling** | Native CSS3 | CSS Variables, Flexbox, Grid | Glassmorphism, 12 color themes, dark cinematic theme, responsive breakpoints. (`style.css`) |
| **3D Ambient Graphics** | Three.js | v0.170.0 (via jsDelivr CDN) | Procedural WebGL nebula blobs with custom vertex/fragment shaders and particle field. (`bg3d.js`) |
| **PWA / Offline** | Service Worker API | Cache Storage API (`tanix-v1`) | Basic offline caching of static shell assets (`/`, `/index.html`, `/app.js`, `/style.css`, `/manifest.json`). (`sw.js`) |
| **Backend Runtime** | Node.js Serverless | Node.js v24.x compatible | Vercel Serverless Function handling API proxying and secret encapsulation. (`api/chat.js`) |
| **Hosting & Routing** | Vercel Platform | `vercel.json` (v2 schema) | Reverse proxy routes (`/api/*`, `/*`), security headers, CSP, and asset cache headers. |
| **AI Inference: Primary** | Groq API | OpenAI-compatible endpoint | Default model: `llama-3.3-70b-versatile` (Fast tier). |
| **AI Inference: Multimodal** | Google Gemini API | `v1beta` REST API | Multimodal model: `gemini-2.5-flash` (Quality tier). |
| **AI Inference: Fallback** | OpenRouter API | OpenAI-compatible endpoint | Fallback model: `meta-llama/llama-3.3-70b-instruct:free` (Reasoning tier). |
| **Image Generation** | Pollinations AI | HTTP GET Image Endpoint | Flux model image generation via `image.pollinations.ai`. |
| **Speech Recognition** | Web Speech API | `webkitSpeechRecognition` | Client-side voice input (`en-IN` locale). |
| **Storage & Persistence** | Browser `localStorage` | Synchronous Key-Value | Chat histories (`chat_*`), tone, active theme, drafts, and temperature. |
| **Package Management** | None | N/A | No `package.json`, lockfile, or node build pipeline exists in repository. |
| **Build Tools / Bundlers** | None | N/A | Zero bundling; scripts loaded via native `<script>` tags. |

---

## 3. ARCHITECTURAL TOPOLOGY

The system follows a two-tier, serverless single-page architecture:

```
[ Browser Client ]
  │
  ├── DOM / UI Engine (app.js)
  │     ├── Mode & System Prompt Builder (Base, Portfolio, Student)
  │     ├── Tone Formatter (10 specialized prompt modifiers)
  │     ├── In-Memory & LocalStorage State Manager
  │     ├── Lightweight Markdown Lexer (fmt)
  │     └── Ambient UI & Theme Synchronizer
  │
  ├── 3D Ambient WebGL (bg3d.js)
  │     └── Three.js Canvas Renderer with Custom GLSL Shaders
  │
  ├── Media Ingestion (Browser FileReader)
  │     └── Base64 conversion of images, text, and documents
  │
  └── Service Worker (sw.js)
        └── Offline Asset Cache (tanix-v1)
  │
  ▼ HTTP POST (/api/chat)
[ Vercel Edge / Serverless Function ] (api/chat.js)
  │
  ├── File MIME & Size Validator (10MB boundary)
  ├── Server-side Secret Hydration (GROQ_KEY, GEMINI_KEY, OPENROUTER_KEY)
  │
  ├── Provider Dispatch:
  │     ├── [Groq]       ──> https://api.groq.com/openai/v1/chat/completions
  │     ├── [Gemini]     ──> https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash
  │     └── [OpenRouter] ──> https://openrouter.ai/api/v1/chat/completions
  │
  └── JSON Response { result } ──> Browser Client
```

---

## 4. MAJOR SUBSYSTEMS

### 4.1. Cinematic UI & Theme Engine
- **Dark Aesthetic:** Pure black void background (`#06060a`), procedural film grain noise (`#film-grain`), optical vignette (`#vignette`), and cinematic letterbox intro animation.
- **Theme Palette System:** 12 dynamic color themes defined in `COLOR_THEMES` (`app.js` lines 1760–1845), updating CSS custom properties (`--accent`, `--accent-d`, `--accent-g`, `--accent-b`, `--user-bg`, `--user-border`) and synchronizing shader uniforms in `bg3d.js`.
- **Top Bar & Navigation Rail:** Left docked navigation (`#left-dock`) for New Chat, Menu Drawer, and History Drawer.

### 4.2. Conversational Orchestration & Prompt Architecture
- **Three Persona Modes:**
  1. `default`: General assistant persona with strict anti-slop rules, reasoning instructions, and factual grounding.
  2. `tanish`: Portfolio mode focusing on creator Tanish Bane's credentials, education, and projects.
  3. `student`: Practical guidance persona for Mumbai students (college cutoffs, train routes, tech pathways).
- **Ten Response Tones:**
  - Default, Formal, Casual, Concise, Academic, Executive, Mentor, Technical, Socratic, Devil's Advocate.
- **Language Toggle:** English (`en`) and Hindi (`hi` via devanagari instruction).

### 4.3. Multi-Provider AI Inference Pipeline
- **Cascading Fallback Chain:** Ordered sequence: `Groq` → `OpenRouter` → `Gemini`.
- **Exhaustion Circuit Breaker:** Any rate limit (`429`, quota) or `401` error automatically registers the provider into `exhaustedProviders` (Set), routing future turns to healthy providers.
- **Manual Model Override:** Top-bar dropdown allows users to lock to Fast, Reasoning, or Quality tiers.

### 4.4. Ambient 3D Nebula Engine (`bg3d.js`)
- Completely decoupled Three.js module.
- 4 organic icosahedron blobs with procedural displacement shaders and Fresnel edge glow.
- 2,200 particle dust cloud with smooth cursor/touch parallax navigation.
- Built-in reduced motion fallback (`prefers-reduced-motion: reduce`) scaling motion to 15%.
- Graceful context loss/restore handling.

### 4.5. Client-Side Persistence & Storage
- Synchronous `localStorage` persistence under prefixed keys:
  - `chat_<timestamp>`: Individual serialized conversation threads.
  - `tanix_theme`: Active color theme.
  - `tanix_tone`: Selected response tone.
  - `tanix_temp`: Temperature preference (unwired to inference).
  - `tanix_draft`: Message draft (partially unwired).

---

## 5. CURRENT IMPLEMENTATION STATUS MATRIX

| Capability | Stated / Claimed | Actual Reality | Verification Reference |
|---|---|---|---|
| Multi-Provider Chat Fallback | Yes (Groq, OpenRouter, Gemini) | Functional, but payload asymmetry exists between client and server proxy | `app.js:1431`, `api/chat.js:46-133` |
| Image Analysis | Multimodal file upload | **Broken on default provider** (Groq and OpenRouter do not receive image payloads; only Gemini handles multimodal inputs) | `api/chat.js:48-60`, `app.js:1487-1512` |
| PDF Document Analysis | Document chat | **Broken on default provider**; base64 payload sent only to Gemini | `app.js:1441-1444`, `api/chat.js:73-104` |
| DOCX Document Analysis | Document chat | **Broken**: Read as plain UTF-8 text via `readAsText()`, generating binary corruption | `app.js:686-717` |
| Image Generation | Pollinations Flux | Fully functional; renders skeleton, image, save link, retry trigger | `app.js:1064-1074`, `1620-1671` |
| Follow-Up Question Suggestions | AI generated suggestions | **Broken**: Calls `/api/chat` with `history: []` and `text: prompt`; server ignores `text` for Groq, yielding empty messages | `app.js:1202-1249`, `api/chat.js:48-60` |
| Abort Generation | Mid-flight cancellation | Fully functional via `AbortController` and stop button UI | `app.js:1099-1121` |
| Markdown Formatting | Rich formatting | Partially functional; **double-escapes code blocks** (`&lt;` rendered literally), renders ordered lists as unordered `<ul>` | `app.js:1729-1745` |
| PWA Support | Offline PWA | Partially implemented; manifest icons missing, caching shell assets only | `sw.js:1-37`, `manifest.json:10-23` |
| Voice Recognition | Web Speech input | Functional on Chromium browsers (`webkitSpeechRecognition`) | `app.js:730-741` |
| Conversation Sharing | Shareable links | **Non-functional / Dead Code**: `shareConversation` has no trigger, `loadSharedConversation` never invoked on boot | `app.js:975-1000` |
| In-Chat Search | Search messages | Fully functional via DOM tree walker and highlight marks | `app.js:774-859` |
| Rate Limit Reset | Manual circuit breaker reset | Functional in UI model dropdown | `app.js:1417-1423` |
