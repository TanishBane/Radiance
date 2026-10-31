# RADIANCE — FILE REVIEW INDEX & AUDIT LEDGER

**Document Version:** 1.0.0  
**Audit Date:** 2026-11-01  
**Total First-Party Files:** 9  
**Files Inspected:** 9 (100%)  
**Files Remaining:** 0 (0%)  
**Audit Progress:** 100% Complete  

---

## 1. COMPREHENSIVE FILE REVIEW LEDGER

| # | File Path | Total Lines | Byte Size | Status | Primary Responsibility | Critical Findings / Architectural Notes |
|---|---|---|---|---|---|---|
| 1 | `index.html` | 220 | 10,801 | Reviewed | HTML application shell | Missing icons (`/icon-192.png`, `/icon-512.png`). Inline handlers used extensively (`onclick`, `oninput`, `onkeydown`). Flashes version `v0.5` before JS hydrates to `v0.7`. |
| 2 | `app.js` | 2,185 | 101,507 | Reviewed | Master frontend engine: UI, state, prompts, LLM client | Monolithic architecture (2,185 lines). Multiple dead functions (`shareConversation`, `loadSharedConversation`, `exportChat`, `showReactionPicker`, `searchCurrentChat`, `restoreDraft`). Markdown lexer double-escapes code blocks. Docx parsing corrupts binary. Groq/OpenRouter requests ignore `text`. |
| 3 | `bg3d.js` | 217 | 7,532 | Reviewed | Procedural WebGL 3D ambient background (Three.js) | Standalone ES module. Clean implementation with custom shaders, reduced motion awareness, and context loss/restore resilience. Exposed via `window.updateBg3DTheme`. |
| 4 | `style.css` | 1,927 | 48,770 | Reviewed | Master stylesheet | Pure CSS with custom properties. Well-crafted dark cinematic styling. Contains styles for unrendered features (`.code-copy`, `.reactions`, `.reaction-picker`). Desktop-first with media queries at 768px and 600px. |
| 5 | `api/chat.js` | 140 | 5,233 | Reviewed | Vercel Serverless Function (proxy for LLMs) | Encapsulates API keys. File size check checks base64 character length instead of binary byte length. Asymmetric bug: ignores `req.body.text` for Groq and OpenRouter; breaks follow-up generation. Missing rate-limiting and authentication. |
| 6 | `chat.js` | 140 | 5,233 | Reviewed | Orphaned duplicate | Byte-for-byte identical duplicate of `api/chat.js` located at root. Never loaded by `index.html` or executed by Vercel. Dead file. |
| 7 | `sw.js` | 37 | 1,094 | Reviewed | Service worker for offline shell caching | Implements stale-while-revalidate for static shell (`tanix-v1`). Does not cache `bg3d.js` or Three.js CDN dependency. Fallback to `/index.html` on fetch failure. |
| 8 | `manifest.json` | 26 | 569 | Reviewed | PWA web app manifest | References `/icon-192.png` and `/icon-512.png` which are physically missing from the repository. |
| 9 | `vercel.json` | 35 | 1,458 | Reviewed | Vercel hosting & routing configuration | Configures CSP, security headers, and caching rules. References `/bg.mp4` for 1-year immutable caching, but `/bg.mp4` does not exist in repository. |

---

## 2. DETAILED FILE-BY-FILE AUDIT BREAKDOWN

### File 1: `index.html` (220 lines)
- **Role:** Entry point for browser rendering.
- **Dependencies:** Google Fonts (`Cormorant Garamond`, `DM Sans`, `Manrope`, `Roboto`, `Space Mono`), `style.css`, `bg3d.js` (module), `app.js` (classic script).
- **Structure:**
  - Lines 1–14: Metadata, fonts, and stylesheets.
  - Lines 17–28: Ambient mesh container, grain, vignette, and cinematic intro splash.
  - Lines 33–47: In-chat search HUD.
  - Lines 49–82: Top navigation bar. Note line 55: `<span class="tb-version" id="appVersion">v0.5</span>` (overwritten later by JS).
  - Lines 84–87: Main chat container `#chat-wrap`.
  - Lines 89–104: Welcome overlay with hardcoded prompt chips.
  - Lines 106–120: Fixed left docking sidebar.
  - Lines 122–140: Chat history drawer.
  - Lines 142–158: Menu drawer with Updates and Themes tabs.
  - Lines 160–167: Media upload preview bar.
  - Lines 169–205: Footer input bar with file input, textarea, mic, and send buttons.
  - Lines 212–218: Script execution and service worker registration.
- **Architectural Weaknesses:**
  - Heavy use of inline DOM event listeners (`onclick="enterApp()"`, `onkeydown="onKey(event)"`, etc.) violating CSP best practices if `unsafe-inline` were removed.
  - Missing accessibility attributes (missing `aria-expanded` on dropdowns, `aria-live` on message stream, `role="region"` on drawers).

---

### File 2: `app.js` (2,185 lines)
- **Role:** Monolithic client-side orchestrator handling state, rendering, LLM communication, voice, media, and search.
- **Sections:**
  - Lines 5–73: Config, 40 AI facts, 22 welcome prompt chips.
  - Lines 77–138: 10 tone configurations with detailed prompt instructions.
  - Lines 140–320: System prompts: `SYSTEM_BASE` (strict anti-slop guidelines), `SYSTEM_TANISH` (portfolio persona), `SYSTEM_STUDENT` (Mumbai college guidance).
  - Lines 323–343: Global mutable state variables.
  - Lines 347–455: `injectStyles()` injecting dynamic CSS rules into `<head>`.
  - Lines 460–501: Boot listeners, `enterApp()`, and `quickStart()`.
  - Lines 504–532: Welcome card generation and fact randomization.
  - Lines 536–633: Chat history management in `localStorage`, pinning, loading, deletion.
  - Lines 636–675: Modes, prompt composition (`getSystem()`), language selection, tone selection.
  - Lines 678–726: File upload handling (`FileReader`), preview display, removal.
  - Lines 728–741: Web Speech API voice input controller.
  - Lines 745–770: Keyboard shortcuts and hotkey listeners.
  - Lines 772–859: In-chat search bar controller using `TreeWalker` DOM manipulation.
  - Lines 862–870: Input character counter.
  - Lines 873–895: Draft autosave functions (partially dead).
  - Lines 898–910: Relative timestamp formatter (unused).
  - Lines 914–946: Second duplicate conversation search implementation (dead code).
  - Lines 950–970: Error classifier and error messaging helpers (unused).
  - Lines 974–1000: Conversation sharing logic (dead code).
  - Lines 1005–1012: Temperature setter/getter (unwired).
  - Lines 1016–1037: Message reactions and reaction picker (unrendered).
  - Lines 1041–1062: Keyboard shortcuts dialog.
  - Lines 1065–1074: Pollinations Flux image URL builder.
  - Lines 1077–1094: 15-second cooldown timer.
  - Lines 1098–1122: Stop generation / AbortController handler.
  - Lines 1125–1191: Master `send()` controller and execution orchestrator.
  - Lines 1195–1286: Follow-up question generator and chip renderer.
  - Lines 1290–1295: Rate limit error detector.
  - Lines 1298–1310: Toast notification rack controller.
  - Lines 1314–1326: Scroll-to-bottom floater.
  - Lines 1330–1333: Export placeholder (alerting removed).
  - Lines 1335–1428: Model switcher badge and dropdown menu.
  - Lines 1431–1470: `callAPI()` multi-provider fallback loop.
  - Lines 1473–1512: Provider calls (`callGemini`, `callGroq`, `callOpenRouter`).
  - Lines 1516–1618: Bubble DOM generator, typewriter effect, copy, edit, and delete buttons.
  - Lines 1620–1671: Image generation shimmer, image loader, download, and retry logic.
  - Lines 1673–1710: Message regeneration controller.
  - Lines 1713–1717: Typing indicator generator.
  - Lines 1719–1745: HTML escaper and lightweight markdown parser (`fmt`).
  - Lines 1750–1755: Chat clear.
  - Lines 1759–1789: 12 color theme palettes and `applyTheme()` engine.
  - Lines 1893–2031: Update changelog cards (v0.1 through v0.7).
  - Lines 2035–2113: Personalization drawer (Tones and Themes).
  - Lines 2116–2134: Message edit inline handler.
  - Lines 2136–2147: Delete all chats modal confirmation.
  - Lines 2149–2175: History search filter.
  - Lines 2178–2185: Self-invoking theme initialization.

---

### File 3: `bg3d.js` (217 lines)
- **Role:** WebGL Three.js ambient background engine.
- **Dependencies:** Three.js v0.170.0 ES module via jsDelivr CDN.
- **Key Functions:**
  - `resize()`: Syncs renderer dimensions and camera projection matrix to window.
  - Custom GLSL Shaders:
    - Vertex: Computes procedural normal displacement via combination of `sin` and `cos` trigonometric waves over `uTime`.
    - Fragment: Computes Fresnel reflection factor `pow(1.0 - max(dot(viewDir, normal), 0.0), 2.4)` with additive blending.
  - `makeSprite()`: Generates radial particle gradient on an in-memory 2D canvas texture.
  - Pointer Parallax: Smooth damping towards cursor/touch coordinates (`smooth.x += (pointer.x - smooth.x) * 0.02`).
  - Render Loop (`animate()`): Pauses on `visibilitychange` (tab hidden) and recovers on `webglcontextrestored`.
  - `updateBg3DTheme(theme)`: Updates blob and particle colors in response to active UI theme.

---

### File 4: `style.css` (1,927 lines)
- **Role:** Complete visual style declaration.
- **Structure:**
  - Lines 4–44: CSS root variables (color tokens, font stacks, spring cubic-bezier easings).
  - Lines 60–115: Atmospheric backdrop (ambient mesh, SVG film grain, optical vignette).
  - Lines 117–173: Cinematic letterbox splash animation.
  - Lines 175–454: Top bar, logo gem, version pill, model dropdown, language pill, status indicator.
  - Lines 457–588: Welcome modal overlay and start button.
  - Lines 590–684: Chat viewport and fixed left sidebar rail.
  - Lines 686–874: Slide-out history and menu drawers.
  - Lines 876–1004: In-chat welcome screen and fact cards.
  - Lines 1007–1227: Chat message bubbles, user/AI avatars, action bars, timestamps.
  - Lines 1229–1306: PDF pill, generated image container, typing animation, markdown typography.
  - Lines 1308–1371: In-chat search HUD and highlight marks.
  - Lines 1373–1400: Attached media preview bar.
  - Lines 1402–1552: Input docking footer, textarea, mic recorder, and send/stop button.
  - Lines 1554–1610: Floating toast rack and scroll-to-bottom button.
  - Lines 1613–1684: Version update cards and accordion styling.
  - Lines 1686–1747: Theme swatches grid.
  - Lines 1749–1762: Responsive breakpoints (768px, 600px).
  - Lines 1764–1927: Secondary components (AI disclaimer, pin badge, keyboard shortcuts panel, reaction picker).

---

### File 5: `api/chat.js` (140 lines)
- **Role:** Vercel serverless function proxying requests to Groq, Gemini, and OpenRouter.
- **Security:** Hides API keys in server environment variables. Validates MIME type against whitelist and 10MB limit.
- **Logic:**
  - POST-only route handler.
  - Groq block (lines 47–71): Calls Groq completions API with `messages: [{ role: 'system', content: system }, ...msgs]`.
  - Gemini block (lines 73–104): Calls `gemini-2.5-flash` generateContent endpoint with `system_instruction` and `contents`.
  - OpenRouter block (lines 106–130): Calls OpenRouter completions API.
  - Error block (lines 137–139): Returns JSON `{ error: err.message }` with status 500.

---

### File 6: `chat.js` (140 lines)
- **Role:** Byte-for-byte duplicate of `api/chat.js`.
- **Finding:** Redundant orphan file at repository root. Should be safely tracked for deprecation/removal during cleanup.

---

### File 7: `sw.js` (37 lines)
- **Role:** Progressive Web App Service Worker.
- **Cache Scope:** `tanix-v1`.
- **Strategy:** Cache static assets (`/`, `/index.html`, `/app.js`, `/style.css`, `/manifest.json`). Fetch with background cache update.

---

### File 8: `manifest.json` (26 lines)
- **Role:** Web App Manifest.
- **Findings:** Correct metadata (`standalone`, `#06060a`), but icons `/icon-192.png` and `/icon-512.png` are missing from disk.

---

### File 9: `vercel.json` (35 lines)
- **Role:** Deployment specification.
- **Security Headers:**
  - `X-Content-Type-Options: nosniff`
  - `X-Frame-Options: DENY`
  - `X-XSS-Protection: 1; mode=block`
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy`: Permits script execution from `'self'`, `'unsafe-inline'`, `'unsafe-eval'`, `blob:`, and `cdn.jsdelivr.net`.
  - Connect-src permits direct connections to Groq, Gemini, and OpenRouter (vestigial, as browser actually connects to `/api/chat`).
