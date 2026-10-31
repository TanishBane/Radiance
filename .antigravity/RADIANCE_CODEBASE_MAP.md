# RADIANCE — CODEBASE MAP & SYSTEM ARCHITECTURE

**Document Version:** 1.0.0  
**Audit Date:** 2026-11-01  
**Project:** RADIANCE (formerly Tanix AI)  

---

## 1. REPOSITORY DIRECTORY HIERARCHY

```
C:\Tanixai-main\
├── api\
│   └── chat.js               # Vercel Serverless Function (CommonJS Node.js handler for LLM APIs)
├── .antigravity\             # Engineering audit knowledge base (read-only audit artifacts)
│   ├── RADIANCE_PROJECT_CONTEXT.md
│   ├── RADIANCE_CODEBASE_MAP.md
│   ├── RADIANCE_FILE_REVIEW_INDEX.md
│   └── RADIANCE_TECHNICAL_DEBT.md
├── app.js                    # Core client-side application logic, state, prompts & UI controller (2,185 lines)
├── bg3d.js                   # Procedural WebGL ambient 3D nebula background using Three.js (217 lines)
├── chat.js                   # Orphaned root duplicate of api/chat.js (140 lines)
├── index.html                # Single-page HTML application shell (220 lines)
├── manifest.json             # Web App Manifest for PWA installation (26 lines)
├── style.css                 # Master stylesheet: typography, themes, components, animations (1,927 lines)
├── sw.js                     # Service Worker script for offline shell caching (37 lines)
└── vercel.json               # Vercel deployment routes, security headers & CSP (35 lines)
```

---

## 2. FILE RESPONSIBILITIES & DEPENDENCY GRAPH

```
[index.html]
    │
    ├── (link) ──> [style.css] (1,927 lines: styles, variables, keyframes)
    │
    ├── (script: module) ──> [bg3d.js] (WebGL 3D ambient background)
    │                           └── imports Three.js (cdn.jsdelivr.net/npm/three@0.170.0)
    │
    ├── (script) ──> [app.js] (Master frontend engine: UI, State, LLM client)
    │                   │
    │                   ├── calls ──> window.updateBg3DTheme() [exported by bg3d.js]
    │                   ├── reads/writes ──> window.localStorage (chats, tones, themes)
    │                   ├── calls Web Speech API ──> window.SpeechRecognition
    │                   └── HTTP POST /api/chat ──> [api/chat.js]
    │
    └── (serviceWorker) ──> [sw.js] (Cache Storage: '/', '/index.html', '/app.js', etc.)

[api/chat.js] (Node.js Serverless Function on Vercel)
    ├── reads ──> process.env (GROQ_API_KEY, GEMINI_API_KEY, OPENROUTER_API_KEY)
    ├── calls ──> Groq API (https://api.groq.com/openai/v1/chat/completions)
    ├── calls ──> Gemini API (https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash)
    └── calls ──> OpenRouter API (https://openrouter.ai/api/v1/chat/completions)

[chat.js] (Root)
    └── Unused byte-for-byte duplicate of api/chat.js (Never referenced or imported).
```

---

## 3. COMPONENT & UI HIERARCHY

The document structure in `index.html` is structured as a single-page layered interface:

```
<body>
 ├── #ambient-mesh             # Background layer 0: CSS gradient mesh + Three.js <canvas id="bg3d-canvas">
 ├── #film-grain               # Background layer 1: SVG fractalNoise grain animation
 ├── #vignette                 # Background layer 2: Optical radial vignette
 ├── #intro-overlay            # Temporary splash overlay: Letterbox bars + pulsing logo (removed at 3.8s)
 ├── #toast-rack               # Floating notification rack for status & warnings
 ├── #search-bar               # In-chat search HUD (Ctrl+F), match navigation & count
 ├── #topbar                   # Top navigation: Logo, Model Switcher, Status Dot, Lang Toggle, Clear
 ├── #chat-wrap                # Central scroll container: <div id="chat"> for message bubbles
 ├── #welcome-overlay          # First-load onboarding modal with quickstart chips
 ├── #left-dock (.bl-sidebar)  # Left fixed icon rail: New, Menu, History buttons
 ├── #drawer-overlay           # Backdrop for slide-out drawers
 ├── #histDrawer               # Slide-out drawer: Search chats, Pinned list, Delete all
 ├── #menuDrawer               # Slide-out drawer: Updates tab & Personalization (Tones + Themes) tab
 ├── #mediaBar                 # Collapsible preview bar for attached files (thumbnail, remove)
 ├── #input-footer             # Bottom docking input: Upload btn, Textarea, Mic btn, Send/Stop btn
 └── #scroll-btn               # Floating action button to scroll down to latest message
```

---

## 4. DETAILED DATA FLOW TRACES

### 4.1. Application Bootstrap Sequence
1. Browser loads `index.html`.
2. Browser issues parallel requests for `style.css`, Google Fonts, `bg3d.js` (module), `app.js`, and `manifest.json`.
3. `sw.js` registration triggers in background (`navigator.serviceWorker.register('/sw.js')`).
4. `bg3d.js` initializes `THREE.WebGLRenderer`, builds vertex/fragment shader programs for 4 blobs, generates 2,200 particle buffer geometry, attaches mousemove/touchmove parallax listeners, and starts the `requestAnimationFrame` loop.
5. `app.js` runs `DOMContentLoaded`:
   - Calls `injectStyles()` to inject inline CSS for tones, follow-up chips, and dividers (`app.js:347-455`).
   - Dimms `#topbar` to opacity 0.35; conceals `#input-footer` (`app.js:462-463`).
   - Calls `applyTheme(currentTheme)` to set CSS variables and dispatches theme color to `window.updateBg3DTheme` (`app.js:1848-1888`).
   - Syncs version badge to `APP_VERSION` ('v0.7').
   - Sets timeout (3.8s) to remove `#intro-overlay` (`app.js:470-473`).
6. User clicks `#welcome-overlay` "Get Started" or quickstart chip:
   - Invokes `enterApp()` (`app.js:476-492`): animates `#welcome-overlay` out, reveals `#input-footer`, sets `#topbar` to opacity 1, marks `#left-dock` ready, renders welcome card inside `#chat`, populates model dropdown, and loads chat history.

---

### 4.2. Chat Interaction & LLM Inference Lifecycle

```
[ User Action: Types text & clicks Send / presses Enter ]
  │
  ├── [1. Input Ingestion & Sanitation] (app.js:1126-1152)
  │     - Check busy flag; check 15-second cooldown guard (COOLDOWN_MS).
  │     - If text attachment (text/plain, csv), decodes base64 and prepends file slice (up to 8,000 chars).
  │     - Pushes `{ role: 'user', text: finalText, b64, mime, pdf, name }` to client `history`.
  │     - Appends user message bubble to DOM via `addBubble('user', ...)`.
  │     - Clears textarea, resets counter (`onInput`), and dismisses `#mediaBar`.
  │
  ├── [2. Dispatch Preparation] (app.js:1153-1160)
  │     - Creates `#chat` typing shimmer indicator via `addTyping()`.
  │     - Flips UI state: `busy = true`, `setSendBusy(true)` (swaps Send icon to Stop icon).
  │     - Instantiates `currentController = new AbortController()`.
  │
  ├── [3. Multi-Provider Fallback Dispatch: callAPI()] (app.js:1431-1464)
  │     - Evaluates candidate chain: `[forcedProvider || currentProvider, ...remaining]`.
  │     - Iterates providers, skipping any marked in `exhaustedProviders`:
  │         * If 'gemini': invokes `callGemini(text, b64, mime, signal)`
  │         * If 'groq': invokes `callGroq(text, signal)`
  │         * If 'openrouter': invokes `callOpenRouter(text, signal)`
  │     - On HTTP 429, quota exhaustion, or 401: catches error, marks provider exhausted via
  │       `markExhausted(provider)`, shows toast alert, and loops to next provider in chain.
  │
  ├── [4. Network Request: /api/chat Proxy] (api/chat.js:24-140)
  │     - Validates HTTP method is POST.
  │     - Validates MIME type and file size (max 10MB).
  │     - Reads secrets from environment (`GROQ_API_KEY`, `GEMINI_API_KEY`, `OPENROUTER_API_KEY`).
  │     - Dispatches upstream to chosen AI endpoint.
  │     - Waits for full non-streaming completion; unpacks response text.
  │     - Returns JSON `{ result: string }` with HTTP 200.
  │
  ├── [5. Client Response Ingestion & Rendering] (app.js:1162-1175)
  │     - Removes typing indicator.
  │     - Appends `{ role: 'model', text: reply }` to client `history`.
  │     - If prompt matches `GEN_TRIGGERS` and no file is attached, extracts image prompt.
  │     - Invokes `addBubble('ai', reply, ...)`:
  │         * Converts markdown via `fmt(reply)`.
  │         * Triggers typewriter interval timer (12ms tick) printing plain text cursor.
  │         * On completion, swaps `innerHTML = rendered` and renders image container if triggered.
  │     - Invokes `saveChatToHistory()`.
  │
  ├── [6. Background Follow-up Generation] (app.js:1170-1174, 1202-1249)
  │     - Triggers asynchronous `generateFollowups(finalText, reply)` in background.
  │     - Posts to `/api/chat` (attempts Groq call).
  │     - If 3 questions return, appends `.followup-chips` below the AI bubble.
  │
  └── [7. Teardown & Cooldown] (app.js:1183-1190)
        - `finally` block: resets `busy = false`, clears controller, reverts Send icon,
          updates `lastSendTime = Date.now()`, and starts 15-second cooldown timer.
```

---

### 4.3. Image Generation Pipeline (Pollinations AI)
1. User input is checked via `shouldGenImg(text)` against keywords: `['generate', 'create an image', 'draw', 'make an image', 'imagine', 'show me an image', 'picture of', 'image of', 'sketch', 'illustration of', 'paint me']`.
2. When triggered, `appendGenImg()` creates a skeleton placeholder (`.gen-skeleton`) with shimmer animation.
3. Constructs image URL: `https://image.pollinations.ai/prompt/{encodedPrompt}?model=flux&width=768&height=768&nologo=true&enhance=true&seed={timestamp}`.
4. On image load: conceals skeleton, sets `opacity: 1`, and appends a direct download link (`tanixai-{seed}.jpg`).
5. On image error: conceals skeleton, displays error notice, and appends a retry button with a fresh seed.

---

### 4.4. Storage & Persistence Architecture

Client state is saved in `localStorage`:

| Key | Value Type | Description & Lifecycle |
|---|---|---|
| `chat_{timestamp}` | JSON Object | Chat thread: `{ id, title, ts, history: [...messages], pinned: boolean }`. Created on first user message; updated after each turn. |
| `tanix_theme` | String | Active theme key (e.g. `'default'`, `'blue'`, `'green'`, `'ice'`). Persisted across reloads. |
| `tanix_tone` | String | Active tone key (e.g. `'formal'`, `'concise'`, `'mentor'`). Persisted across reloads. |
| `tanix_temp` | Float string | Storage for temperature setting. Set via `setTemperature()`, read via `getTemperature()`, but never wired to inference. |
| `tanix_draft` | String | Saved via `Ctrl+S` shortcut. Never restored on boot due to missing initialization call. |

---

## 5. EXTERNAL API CONTRACTS

### 5.1. `/api/chat` Serverless Contract
- **Method:** `POST`
- **Request Body:**
  ```json
  {
    "provider": "groq" | "gemini" | "openrouter",
    "text": "string",
    "b64": "base64_string | null",
    "mime": "string | null",
    "history": [
      { "role": "user" | "model", "text": "string", "b64": "...", "mime": "..." }
    ],
    "system": "string",
    "model": "string (optional)",
    "temperature": 0.88
  }
  ```
- **Success Response (HTTP 200):**
  ```json
  {
    "result": "Response content string"
  }
  ```
- **Error Response (HTTP 400 / 405 / 500):**
  ```json
  {
    "error": "Error description message"
  }
  ```
