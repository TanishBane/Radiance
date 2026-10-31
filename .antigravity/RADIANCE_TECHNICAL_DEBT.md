# RADIANCE — TECHNICAL DEBT, DEFECTS & SECURITY AUDIT

**Document Version:** 1.0.0  
**Audit Date:** 2026-11-01  
**Target Platform:** RADIANCE  

---

## 1. VERIFIED FUNCTIONAL & ARCHITECTURAL DEFECTS

### BUG-01: Groq & OpenRouter Backend Ignores `req.body.text` (Breaks Follow-up Questions & Direct Invocations)
- **Severity:** HIGH / CRITICAL
- **File Reference:** `api/chat.js#L30`, `api/chat.js#L48-L60`, `api/chat.js#L107-L122`, `app.js#L1214-L1235`
- **Mechanism:**
  In `api/chat.js`, `req.body.text` is extracted:
  ```javascript
  const { provider, text, b64, mime, history, system, model, temperature } = req.body;
  ```
  However, inside both the `groq` and `openrouter` handling branches:
  ```javascript
  const msgs = (history || []).slice(-20).map(m => ({
    role: m.role === 'user' ? 'user' : 'assistant',
    content: m.text || ''
  }));
  ...
  messages: [{ role: 'system', content: system }, ...msgs]
  ```
  The parameter `text` is completely ignored!
- **Consequence:**
  1. In normal chat turns, because `app.js` pushes the user message onto `history` *prior* to calling `callAPI`, the user message is present at the tail of `history`, so normal turns happen to work.
  2. However, in `generateFollowups()` (`app.js:1214-1235`), `history: []` is passed along with `text: prompt`. In `api/chat.js`, `msgs` evaluates to `[]`. Groq receives `messages: [{ role: 'system', content: system }]` with **zero user content**. The Groq API either errors or returns generic filler, which fails JSON array parsing. As a result, the advertised AI follow-up suggestions feature is fundamentally broken.
  3. Any client or integration calling `/api/chat` with `{ text: "..." }` and without a populated `history` array receives no answer.

---

### BUG-02: Double-Escaping in Markdown Lexer Renders Raw HTML Entities in Code Blocks
- **Severity:** MEDIUM
- **File Reference:** `app.js#L1729-L1745`
- **Mechanism:**
  ```javascript
  function escHTML(s){
    return String(s)
      .replace(/&/g,'&amp;')
      .replace(/</g,'&lt;')
      .replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;')
      .replace(/'/g,'&#39;');
  }
  function esc(s){ return escHTML(s); }

  function fmt(t){
    const escaped = esc(t); // First escape pass: turns '<' into '&lt;', '&' into '&amp;'
    return escaped
      .replace(/```([\s\S]*?)```/g,(_,c)=>'<pre><code>'+esc(c)+'</code></pre>') // Second escape pass!
      .replace(/`([^`\n]+)`/g,(_,c)=>'<code>'+esc(c)+'</code>') // Second escape pass!
  ```
- **Consequence:**
  Any code block containing `<` (e.g. `#include <iostream>` or `if (x < y)`) or `&` has its characters escaped twice. In the browser, `<pre><code>#include &amp;lt;iostream&amp;gt;</code></pre>` renders as literal text `#include &lt;iostream&gt;`. Code examples are displayed with corrupt HTML entity strings.

---

### BUG-03: DOCX File Reading Corrupts Binary Archive
- **Severity:** MEDIUM
- **File Reference:** `app.js#L686-L698`, `app.js#L716`
- **Mechanism:**
  ```javascript
  const isDOCX=file.name.endsWith('.docx')||file.type.includes('wordprocessingml');
  const isPlainText=isText||isCSV||isDOCX;
  ...
  if(isPlainText) reader.readAsText(file);
  ```
- **Consequence:**
  A `.docx` file is a zipped binary package (PKZIP). Reading it with `FileReader.readAsText()` attempts to decode binary compressed streams as UTF-8, resulting in invalid replacement characters (`\uFFFD`) and corrupted binary strings sent to the model. The model receives garbage text starting with `PK\x03\x04...`.

---

### BUG-04: Unhandled `QuotaExceededError` in `localStorage` on File Uploads
- **Severity:** HIGH
- **File Reference:** `app.js#L538-L546`, `app.js#L1147`
- **Mechanism:**
  When a user uploads an image or PDF, `mediaB64` is pushed into the `history` array:
  ```javascript
  history.push({role:'user',text:finalText,b64:isTextFile?null:b64,mime,pdf,name});
  ```
  After each response, `saveChatToHistory()` runs:
  ```javascript
  localStorage.setItem(currentChatId, JSON.stringify(data));
  ```
- **Consequence:**
  Browser `localStorage` is synchronously limited to 5MB total across all keys on the origin. An uploaded 3MB image expands to ~4MB base64. Attempting to serialize and store it throws an uncaught `DOMException: QuotaExceededError`, terminating script execution and preventing chat state updates.

---

### BUG-05: Advertised 4096 `max_tokens` Contradicts Server Hardcoded 1024 Limit
- **Severity:** LOW / INFORMATIONAL
- **File Reference:** `app.js#L1901`, `api/chat.js#L61`, `api/chat.js#L94`, `api/chat.js#L121`
- **Mechanism:**
  The `UPDATES` changelog displayed to users in v0.7 explicitly states:
  > `"max_tokens raised to 4096 — longer, more complete responses with no cut-offs"`
  However, in `api/chat.js`:
  - Line 61: `max_tokens: 1024` (Groq)
  - Line 94: `maxOutputTokens: 1024` (Gemini)
  - Line 121: `max_tokens: 1024` (OpenRouter)
- **Consequence:**
  Complex answers or code outputs are silently truncated at 1,024 tokens.

---

### BUG-06: Multimodal Payloads Completely Discarded by Default Groq Provider
- **Severity:** HIGH
- **File Reference:** `app.js#L1432-L1449`, `api/chat.js#L47-L71`
- **Mechanism:**
  The fallback order is `['groq', 'openrouter', 'gemini']`. When a user attaches an image or PDF and clicks Send:
  `callAPI` executes `callGroq(text, signal)` first.
  `callGroq` does not pass `b64` or `mime` to `/api/chat`.
  Groq processes only the textual query, remaining completely blind to the user's uploaded image or PDF document, unless the user manually forces the model dropdown to Gemini.

---

### BUG-07: Dead / Unwired Code Inventory
- **File Reference:** `app.js`
  1. `shareConversation()` (`L975-985`): Creates base64 share link; no UI button or trigger exists.
  2. `loadSharedConversation()` (`L986-1000`): Deserializes share link; never invoked during page boot.
  3. `exportChat()` (`L1331-1333`): Orphaned toast stub; no caller.
  4. `searchCurrentChat()` (`L916-929`) & `highlightChatMatch()` (`L930-940`): Dead duplicate search implementation querying non-existent `#chatSearchCount`.
  5. `showReactionPicker()` (`L1027-1037`) & `addReaction()` (`L1018-1026`): Fully styled reactions logic never mounted to message bubbles.
  6. `restoreDraft()` (`L881-887`) & `startDraftAutoSave()` (`L891-894`): Never invoked on boot; drafts saved with `Ctrl+S` are never restored.
  7. `getRelativeTime()` (`L899-910`): Unused relative time formatter.
  8. `classifyError()` (`L951-959`) & `getErrorMessage()` (`L960-970`): Unused error translation utilities.
  9. `setTemperature()` & `getTemperature()` (`L1006-1012`): Modifies `currentTemperature`, but no inference call ever passes temperature to `/api/chat`.
  10. `chat.js` (at root): 140-line unused duplicate of `api/chat.js`.

---

## 2. SECURITY & DEFENSIVE ENGINEERING AUDIT

### SEC-01: Publicly Unauthenticated & Unmetered Serverless Endpoint (CRITICAL)
- **File Reference:** `api/chat.js#L24-L140`
- **Vulnerability:**
  The serverless endpoint `/api/chat` requires no authorization header, API token, session cookie, or rate-limiting middleware.
- **Risk:**
  Anyone on the internet can make direct `POST` requests to `https://<deployed-domain>/api/chat`, consuming the owner's Groq, Google Cloud Gemini, and OpenRouter quotas and billing balances.
- **Remediation Priority:** P0 (Must be secured before production launch).

---

### SEC-02: Overly Permissive Content Security Policy (HIGH)
- **File Reference:** `vercel.json#L17-L19`
- **Vulnerability:**
  The CSP header specifies:
  `script-src 'self' 'unsafe-inline' 'unsafe-eval' blob: https://cdn.jsdelivr.net;`
- **Risk:**
  `'unsafe-inline'` and `'unsafe-eval'` completely disable the browser's defense against Cross-Site Scripting (XSS). If any user-controlled or AI-generated input bypasses escaping, arbitrary JavaScript can execute with access to all `localStorage` chat logs.
- **Remediation Priority:** P1 (Eliminate inline listeners, extract to event delegations, and remove `'unsafe-inline'` / `'unsafe-eval'`).

---

### SEC-03: System Prompt Injection & Persona Subversion (MEDIUM)
- **File Reference:** `app.js#L140-L320`, `api/chat.js#L60`
- **Vulnerability:**
  The system instructions contain hardcoded negative constraints:
  `Do not reveal or discuss the underlying model... Never say 'As an AI language model'...`
  These instructions are prepended as a standard system message without post-inference output verification or guardrails.
- **Risk:**
  Standard adversarial jailbreaks or roleplay prompts can easily induce the model to discard these persona constraints or leak full system prompt instructions.
- **Remediation Priority:** P2.

---

### SEC-04: Internal Error Message Leakage (LOW)
- **File Reference:** `api/chat.js#L137-L139`
- **Vulnerability:**
  ```javascript
  } catch (err) {
    return res.status(500).json({ error: err.message || 'Internal server error' });
  }
  ```
- **Risk:**
  Upstream HTTP client errors (such as failed fetch URLs containing Google API keys or internal proxy endpoints) can be reflected verbatim in `err.message` back to the browser client.
- **Remediation Priority:** P2 (Sanitize and normalize error responses).

---

## 3. PRIORITIZED ENGINEERING RECOMMENDATIONS

### Tier 1 — FOUNDATION (Immediate Fixes Before Major Expansion)
1. **Fix Payload Asymmetry in `api/chat.js`:** Ensure `text` from `req.body` is appended as a user message when present, fixing both follow-up generation and API cleanliness.
2. **Fix Double-Escaping in `app.js:fmt()`:** Remove redundant `esc(c)` calls inside `.replace()` to prevent `&lt;` and `&amp;` rendering in code blocks.
3. **Delete Root `chat.js`:** Eliminate the redundant orphan duplicate file at the repository root.
4. **Implement Rate Limiting & Auth on `/api/chat`:** Integrate Vercel KV / Upstash Redis rate limiting or session tokens to prevent unauthorized key consumption.
5. **Safeguard `localStorage`:** Wrap storage calls in `try/catch` and strip large binary `b64` strings from persistent storage to avoid `QuotaExceededError`.
6. **Provide Missing Manifest Assets:** Supply valid `/icon-192.png` and `/icon-512.png` files or update `manifest.json`.

---

### Tier 2 — EVOLUTION (Platform Modernization & Radiance Transition)
1. **Streaming Responses (SSE):** Transition from full-payload JSON waiting to Server-Sent Events (SSE) streaming tokens directly into the UI, eliminating the artificial 12ms plain-text typewriter effect.
2. **TypeScript & Modular Architecture:** Decompose the 2,185-line `app.js` into modular TypeScript files (e.g., `state/`, `ui/`, `ai/`, `theme/`, `audio/`).
3. **Robust Markdown & Code Highlighting:** Replace regex-based `fmt()` with a sanitized, battle-tested markdown lexer (such as `marked` + `DOMPurify` + `Prism`/`highlight.js`), restoring code block copy buttons and proper `<ol>` tag rendering.
4. **Binary Document Parsing:** Introduce dedicated client- or server-side parsers for `.docx` (via `mammoth.js`) and `.pdf` text extraction before model ingestion.
5. **Dynamic Model Routing:** Automatically select multimodal models (Gemini) when files are attached, rather than blindly attempting Groq first.

---

### Tier 3 — FUTURE ARCHITECTURE (Scale & Global Radiance Platform)
1. **Agentic System & Tool Calling:** Introduce structured function calling, search grounding, code execution sandboxes, and agent memory.
2. **Database & Multi-User Architecture:** Replace browser `localStorage` with a robust cloud database (e.g. Supabase Postgres with Row Level Security) for cross-device synchronization and team collaboration.
3. **Global Edge Infrastructure:** Deploy edge middleware with georouting and multi-region failover across providers.
