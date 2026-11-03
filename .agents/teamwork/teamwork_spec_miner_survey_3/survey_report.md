# RADIANCE AI PLATFORM — STEP 0 TESTING & SPECIFICATION SURVEY REPORT

**Author**: `teamwork_spec_miner_survey_3` (Specification Miner)  
**Date**: 2026-11-01  
**Integrity Mode**: Development  
**Workspace**: `c:\Tanixai-main`  
**Reference Document**: `c:\Tanixai-main\.agents\teamwork\ORIGINAL_REQUEST.md`

---

## 1. Executive Summary & Verification Environment

Radiance is a modular Next.js 15 (v15.2.1) AI chat application built with React 19, TypeScript 5.8.2, Tailwind CSS v4, Vercel AI SDK (`ai` v4.1.54), Vitest v3.0.8, and Playwright v1.64.1.

The platform requires production-grade enhancements across three primary feature domains:
- **R1: Message Presentation & Typography** (consistent container geometry, markdown hierarchy, syntax-highlighted code blocks, LaTeX/KaTeX math notation, XSS prevention).
- **R2: Message Actions & Interactions** (hover action toolbar on desktop, accessible action menu on mobile, copy, edit user message, regenerate, delete, feedback recording, retry failed generation, timestamp inspection, safe client-side export).
- **R3: Streaming Experience & Lifecycle Management** (smooth token streaming, generation indicator, immediate stop-generation with request abortion and partial message preservation, layout-shift-free progressive markdown rendering, in-message error states with retry, duplicate message prevention).

### Verification Command Execution Matrix

| Command | Script in package.json | Windows PowerShell Execution Note | Verified Status | Output / Timing |
|---|---|---|---|---|
| **Typecheck** | `npm run typecheck` (`tsc --noEmit`) | Must run via `cmd /c npm run typecheck` due to PowerShell ExecutionPolicy blocking `.ps1` | **PASS (0 errors)** | Clean exit code 0 |
| **Linter** | `npm run lint` (`next lint`) | Must run via `cmd /c npm run lint` | **PASS (0 errors)** | No warnings or errors |
| **Unit Tests** | `npm test` (`vitest run`) | Must run via `cmd /c npm test` | **PASS (43/43 tests)** | 11 test suites passed (~5.45s) |
| **E2E Tests** | `npm run test:e2e` (`playwright test`) | Must run via `cmd /c npm run test:e2e` or `cmd /c npx playwright test` | **READY (8 tests listed)** | Playwright v1.64.1; webServer uses `pnpm run dev` (pnpm v12.15.0 verified) |

> **⚠️ Critical Operational Note for Builders**: On this Windows environment, invoking raw `npm` directly inside PowerShell errors with `PSSecurityException: UnauthorizedAccess` because script execution of `npm.ps1` is disabled. All tooling scripts must be executed with `cmd /c npm <script>` or `cmd /c pnpm <script>` or `pnpm.cmd`.

---

## 2. Existing Vitest Unit & Integration Test Architecture

### 2.1 Configuration (`vitest.config.ts`)
- **Environment**: `jsdom` (simulates browser DOM).
- **Globals**: `true` (enables `describe`, `it`, `expect`, `vi` without manual import).
- **Setup Files**: `[]` (currently empty).
- **Included Paths**: `["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"]`.
  - *Observation*: The pattern specifically matches `*.test.ts`. Component tests written as `*.test.tsx` will NOT be detected unless `vitest.config.ts` includes `*.test.{ts,tsx}` or component test files are compiled/configured accordingly.
- **Excluded Paths**: `["node_modules", ".next", "legacy", "tests/e2e/**"]`.
- **Path Aliases**: `@/` maps to `./src/`.

### 2.2 Existing Unit Test Suites (11 Suites, 43 Tests)

| Test Suite | Tests | Scope Covered | Mock Patterns Used | Coverage Status |
|---|---|---|---|---|
| `tests/unit/api-contract.test.ts` | 4 | Zod `ChatRequestSchema` validation (valid payload, missing messages, empty messages, long prompt rejection) | Pure schema validation | Good schema coverage; no HTTP endpoint mocking |
| `tests/unit/circuit-breaker.test.ts` | 3 | Candidate model resolution, fallback routing, provider exhaustion | In-memory singleton state | Covers failover logic |
| `tests/unit/conversations.test.ts` | 3 | `conversationService` save, list, pin toggle, delete | `localStorage` mock in jsdom | High coverage for conversation persistence |
| `tests/unit/documents.test.ts` | 4 | File parsing, size limits, text extraction, magic byte verification | In-memory file blobs | Solid document extraction tests |
| `tests/unit/format.test.ts` | 4 | HTML escaping, code block double-escape prevention (BUG-02), basic lists, relative time formatting | Pure utility function testing | **Severe gap**: Missing tests for tables, math notation, links, code syntax highlighting, streaming partial markdown |
| `tests/unit/models.test.ts` | 5 | Model registry, capability resolution (multimodal vs text), fallback models | Static lookup | Complete |
| `tests/unit/rate-limiter.test.ts` | 3 | Memory-fallback rate limiter, client IP resolution, header parsing | In-memory cache | Complete |
| `tests/unit/sanitize.test.ts` | 5 | Null-byte stripping, whitespace trimming, content length bounds, role validation | Pure utility function testing | Complete |
| `tests/unit/storage.test.ts` | 2 | LocalStorage quota handling, conversation sorting, deletion | `window.localStorage` | Complete |
| `tests/unit/theme-gradients.test.ts` | 8 | Theme color tokens, contrast ratios, gradient styles | Static config inspection | Complete |
| `tests/unit/ui-welcome-card.test.ts` | 2 | Default assistant welcome card copy and constants | String assertion | **Gap**: Does not test React rendering or DOM interactions |

### 2.3 Existing Vitest Coverage Gaps
1. **React Components**: Zero unit or integration tests for `MessageItem`, `ChatWorkspace`, or `ChatComposer`. No use of `@testing-library/react` despite package installation.
2. **Custom Hooks**:
   - `useChatStream`: Zero unit tests for token streaming, chunk buffering, SSE parsing, abort signal handling, or error fallbacks.
   - `useChatSession`: Zero unit tests for `appendUserMessage`, `appendAssistantMessage`, message deletion, message editing, or feedback recording.
3. **Markdown & Math Utilities**:
   - `formatMarkdown` only has 4 basic tests. It lacks tests for LaTeX math delimiters (`$`, `$$`), Markdown tables (`| ... |`), syntax highlighting tokens, markdown links (`[text](url)`), polyglot XSS vectors, and unclosed streaming markdown.
4. **Mock Infrastructure**: No standardized mocks for `fetch`, `ReadableStream`, `TextDecoder`, or `SpeechSynthesis`.

---

## 3. Existing Playwright E2E Configuration & Test Audit

### 3.1 Configuration (`playwright.config.ts`)
- **Test Directory**: `./tests/e2e`
- **Execution Mode**: `fullyParallel: true`
- **Projects / Viewports**:
  1. `chromium`: Desktop Chrome (viewport: 1280x720)
  2. `Mobile Chrome`: Pixel 5 emulation (viewport: 393x851, user-agent for mobile, touch enabled)
- **Web Server Config**:
  - `command: "pnpm run dev"`
  - `url: "http://localhost:3000"`
  - `reuseExistingServer: !process.env.CI`
  - `timeout: 120000ms`
- **Tracing & Artifacts**: Trace captured on first retry (`trace: "on-first-retry"`), video retained on failure (`video: "retain-on-failure"`).

### 3.2 Existing E2E Test Suite (`tests/e2e/chat.spec.ts`)
Tests defined (run on both Desktop Chrome and Mobile Chrome = 8 runs total):
1. `loads application workspace with Radiance branding`: checks visibility of `text=RADIANCE` and `textarea`.
2. `composer accepts input and updates character count`: types text, validates `text=51 chars`.
3. `opens and closes keyboard shortcuts dialog via Ctrl+K`: presses `Control+k`, asserts modal visibility, presses `Escape` to close.
4. `sidebar navigation buttons trigger slideout drawers`: clicks history drawer button, asserts `Conversations` drawer opens.

### 3.3 Critical E2E Gaps & Flakiness Traps
1. **IntroSplash Screen**: `src/components/branding/intro-splash.tsx` renders a full-screen overlay for 2.8s + 0.8s transition. While it has `pointer-events-none`, any test asserting visual text or element boundaries immediately on load may encounter race conditions unless the splash is completed or bypassed.
2. **Zero Chat Flow Tests**: Existing E2E suite does NOT test:
   - Submitting a message.
   - Message bubble rendering.
   - User vs assistant styling.
   - Streaming tokens.
   - Stop generation button.
   - Desktop hover actions or mobile action menu.
   - Copy, edit, regenerate, delete, or feedback interactions.
   - Error states or retry.

---

## 4. Deep-Dive Specification Analysis (R1, R2, R3)

### 4.1 R1: Message Presentation & Typography

#### Visual Separation & Container Geometry
- **User Message**:
  - Right-aligned or distinct user-bubble orientation (`flex-row-reverse self-end`).
  - Distinct background (`var(--user-bg)` with `var(--user-border)`).
  - Avatar: Monospace badge (`YOU`) with accent border and glow.
  - Border radius: Asymmetric styling (rounded with `rounded-tr-sm` on user side).
- **Assistant Message**:
  - Left-aligned (`self-start`).
  - Glass panel styling (`var(--ai-bg)` with `var(--ai-border)` and `border-l-2 border-l-[var(--accent)]`).
  - Avatar: Brand badge (`RD` with `gradient-text-brand`).
  - Border radius: Asymmetric styling (rounded with `rounded-tl-sm` on assistant side).
- **Container Width Consistency**:
  - In `src/components/chat/message-item.tsx`, messages use `max-w-3xl w-full mx-auto`.
  - Inner content container: Currently `max-w-[calc(100%-44px)]`. For short user messages, containers should maintain structural visual stability without breaking layout alignment across 375px (mobile), 768px (tablet), and 1440px (desktop).

#### Typography & Spacing Hierarchy
- **Headings**:
  - `# H1`: `24px` (`text-xl` or `text-2xl`), font weight 700, margin-top `16px`, margin-bottom `8px`.
  - `## H2`: `20px` (`text-lg`), font weight 600, margin-top `14px`, margin-bottom `6px`.
  - `### H3`: `16px` (`text-base`), font weight 600, margin-top `12px`, margin-bottom `4px`.
- **Paragraphs**:
  - Text size `13.5px` to `14px`, line-height `1.65` to `1.7`. Spacing between paragraphs `8px` to `12px`.
- **Lists**:
  - Ordered lists (`<ol>` with `.ol-item`): Numbers rendered with mono/tabular spacing, `list-decimal`, padding-left `20px`.
  - Unordered lists (`<ul>` with `.ul-item`): Custom bullet style, `list-disc`, padding-left `20px`.
  - Proper margin between list items (`4px`).
- **Tables**:
  - Must parse standard markdown table syntax (`| Col 1 | Col 2 | \n |---|---| \n | Val 1 | Val 2 |`).
  - Wrapped in an `overflow-x-auto` container to prevent mobile clipping.
  - Alternating row background (`rgba(255,255,255,0.02)` / `0.04`), subtle borders (`var(--border)`), header row with bold text and distinct background.
- **Blockquotes**:
  - Left accent border (`3px solid var(--accent)`), subtle background tint (`linear-gradient(90deg, var(--accent-d), transparent)`), italic text (`var(--txt-dim)`), padding `6px 14px`.
- **Links**:
  - Standard markdown links `[label](url)` rendered as `<a href="..." target="_blank" rel="noopener noreferrer">`.
  - Distinct accent color with underline on hover; sanitized to prevent `javascript:` execution.
- **Inline Code**:
  - `<code>` wrapped in subtle pill background (`rgba(255,255,255,0.07)`), border (`var(--border)`), text color `var(--accent-b)`, monospace font.

#### Code Blocks
- **Language Badge**: Display detected language in uppercase (e.g. `TYPESCRIPT`, `PYTHON`, `SQL`, fallback `CODE`).
- **Syntax Highlighting**: Keywords, strings, comments, numbers, and functions differentiated with clean, accessible contrast against dark surface.
- **Copy-Code Button**:
  - Click copies raw, unescaped code content to clipboard.
  - Immediate visual feedback: text changes to "Copied!" or checkmark icon for 1.8-2.0 seconds.
- **Horizontal Scrollbar**: `pre { overflow-x: auto }` with custom thin scrollbar. Wide code blocks must scroll horizontally without clipping borders or expanding parent layout.

#### Mathematical Notation (LaTeX / KaTeX)
- Standard inline LaTeX: `$E = mc^2$` rendered cleanly.
- Standard block LaTeX: `$$\frac{-b \pm \sqrt{b^2 - 4ac}}{2a}$$` rendered as centered block expression.
- Safe integration: Parse with KaTeX or lightweight mathematical renderer with graceful fallback to formatted monospace block if expression is invalid or incomplete.

#### Security & XSS Prevention
- Raw HTML tags generated by LLMs (`<script>`, `<iframe`, `<object>`, `<embed>`, `<img onerror=...>`, `<svg onload=...>`) must be neutralized or stripped.
- Untrusted scripts must NEVER execute in the DOM.

---

### 4.2 R2: Message Actions & Interactions

#### Responsive Presentation (Desktop Hover vs Mobile Menu)
- **Desktop (>= 768px)**:
  - Action toolbar hidden by default (`opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity`).
  - Positioned beside or beneath message bubble (`justify-end` for user, `justify-start` for assistant).
- **Mobile (< 768px)**:
  - Touchscreens lack hover affordance.
  - Actions must be accessible via an action menu (e.g. 3-dots `MoreHorizontal` trigger button invoking `@radix-ui/react-dropdown-menu` or bottom drawer) with minimum 44x44px touch targets.

#### Action Specifications

1. **Copy Action (`Copy` icon)**:
   - Target: User or assistant message text content.
   - Behavior: Writes plaintext / clean markdown to `navigator.clipboard`.
   - Feedback: Icon swaps to `Check` (`text-[var(--success)]`) for 2000ms.
2. **Regenerate Action (`RotateCcw` icon)**:
   - Target: Assistant messages.
   - Behavior: Truncates subsequent messages, retrieves prompt context up to the selected assistant message, and re-triggers `useChatStream.send()`.
3. **Edit User Message Action (`Edit2` icon)**:
   - Target: User messages.
   - Behavior: Either opens inline edit textarea or loads message text into `ChatComposer`, allowing user to modify prompt and resubmit. If resubmitted, previous response is replaced.
4. **Delete Message Action (`Trash2` icon)**:
   - Target: User or assistant messages.
   - Behavior: Removes message from `useChatSession` message state and deletes from persisted conversation storage (`conversationService.save()`).
5. **Provide Feedback Action (`ThumbsUp` / `ThumbsDown` icons)**:
   - Target: Assistant messages.
   - Behavior: Toggles positive/negative sentiment rating; stores rating in `ChatMessage.feedback` or conversation metadata; displays active state (highlighted accent color).
6. **Retry Failed Generation Action (`RefreshCw` icon)**:
   - Target: Messages with `isError: true`.
   - Behavior: Retries the last failed prompt without requiring the user to re-type it.
7. **Timestamp Inspection (`Clock` / text)**:
   - Target: All messages.
   - Behavior: Displays relative time (`tabular-nums`, e.g. "just now", "5m ago"). Provides accessible ISO timestamp in `title` attribute or tooltip (`Nov 1, 2026, 11:30:00 AM`).
8. **Safe Client-Side Export (`Download` / `Share2` icon)**:
   - Target: Message or conversation.
   - Behavior: Client-side export to Markdown file (`.md`) or formatted text copy. Strictly omits unsafe external sharing links or public API leakage.

---

### 4.3 R3: Streaming Experience & Lifecycle Management

#### Token Streaming & Buffering
- **Smooth Streaming**: Tokens streamed from `/api/chat` using Vercel AI SDK Data Stream protocol (`0:"token"`).
- **Chunk Boundary Resiliency (Bug Fix Requirement)**:
  - In existing `use-chat-stream.ts`, `chunk.split("\n")` parses tokens line-by-line without an inter-chunk buffer. If an SSE token line is split across TCP chunks (e.g. `0:"Hello ` in chunk 1 and `World"\n` in chunk 2), the line fails `JSON.parse` and tokens are permanently dropped.
  - Implementation requires a persistent buffer: `buffer += chunk; const lines = buffer.split("\n"); buffer = lines.pop() || "";`.
- **Zero Typewriter Lag**: Tokens render immediately upon receipt; no artificial `setTimeout` typewriter loop after the stream terminates.

#### Active Inference Indicator
- Visible while `isGenerating === true`.
- Displays streaming cursor (`.stream-cursor`) at the end of incoming text and/or an indicator pill ("Thinking...", "Generating...").

#### Immediate Stop-Generation & Cancellation
- **Button Toggle**: During generation, the composer Send button transforms into a Stop button (`Square` icon with `bg-[var(--danger)]`).
- **Immediate Request Abort**: Clicking Stop calls `abortController.abort()`, terminating the active HTTP connection immediately.
- **Partial Content Preservation**: Any tokens accumulated up to the abort timestamp must NOT be discarded. They must be committed as a completed assistant message in `useChatSession` so the user does not lose generated content.

#### Progressive Markdown Rendering
- As markdown tokens arrive, partial syntax (such as unclosed code fences ` ```typescript\nconst a = 1;` or unclosed bold `**hello`) must be safely closed or rendered without flashing raw syntax or causing layout shift.

#### Error Handling & In-Message Error Card
- When an error occurs (e.g. HTTP 429 rate limit, 503 provider exhaustion, or network abort):
  - Do NOT trigger jarring browser `alert()` popups.
  - Render an error card inside the message stream with warning icon, human-readable error description, and a "Retry" button.

#### Submission & Duplicate Prevention
- Disable the Send button and composer Enter key while `isGenerating === true`.
- Message generation assigns unique deterministic/UUID IDs to prevent key collisions or duplicate rendering.

---

## 5. Discovered Features Table

| # | Category | Feature | Description | Inputs | Outputs | Error Behavior | Discovered Via |
|---|---|---|---|---|---|---|---|
| 1 | R1 Presentation | Role-Based Message Bubbles | Visually separates user and assistant messages with distinct backgrounds, borders, avatars, and alignment | `ChatMessage` object (`role`, `content`, `createdAt`) | Rendered JSX bubble with role-specific CSS classes | Fallback to assistant style if role unknown | `src/components/chat/message-item.tsx` |
| 2 | R1 Presentation | Markdown Heading Hierarchy | Parses `#`, `##`, `###` into semantic `<h1>`, `<h2>`, `<h3>` tags with proportionate margins | Markdown string with heading syntax | Semantic HTML headings | Escapes malformed tags | `src/lib/utils/format.ts` |
| 3 | R1 Presentation | Code Block Container | Fenced code blocks (` ```lang ... ``` `) rendered in dark container with header and language label | Multiline code string with optional language identifier | `<div class="code-block-wrapper">` with header and `<pre><code>` | Defaults language to "code" if unspecified | `src/lib/utils/format.ts`, `globals.css` |
| 4 | R1 Presentation | Code Block Copy Button | Interactive button on code header that copies raw unescaped code | Click event with `data-code` attribute | Text copied to `navigator.clipboard`; button text changes to "Copied!" for 1.8s | Reverts to "Copy" on error or timeout | `src/components/chat/message-item.tsx:73-85` |
| 5 | R1 Presentation | Markdown Lists (Ordered/Unordered) | Formats numeric `1.` and bullet `-`/`*` into `<ol>` and `<ul>` lists | Markdown list syntax | `<ol>`/`<ul>` containers wrapping `<li class="ol-item/ul-item">` | Renders plain text if format unmatched | `src/lib/utils/format.ts:58-64` |
| 6 | R1 Presentation | Blockquote Styling | Formats `> text` into styled blockquote with accent left border | Markdown blockquote string | `<blockquote>` with gradient tint and border | Escapes inner HTML | `src/lib/utils/format.ts:57`, `globals.css` |
| 7 | R1 Presentation | Mathematical Notation (LaTeX) | Parses `$math$` (inline) and `$$math$$` (block) expressions into mathematical symbols | LaTeX math string | Formatted KaTeX HTML or styled math elements | Fallback to raw formula in monospace pill | `ORIGINAL_REQUEST.md § R1` |
| 8 | R1 Presentation | Markdown Tables | Converts `\| header \|` markdown tables into structured HTML tables | Markdown table string | `<table><thead><tbody>` with responsive horizontal scroll wrapper | Preserves raw text if pipe format invalid | `ORIGINAL_REQUEST.md § R1` |
| 9 | R1 Presentation | Markdown Links | Converts `[text](url)` to safe hyperlinks | Markdown link syntax | `<a href="..." target="_blank" rel="noopener noreferrer">` | Disallows `javascript:` and dangerous URIs | `ORIGINAL_REQUEST.md § R1` |
| 10 | R1 Presentation | HTML Sanitization | Neutralizes untrusted HTML/script tags before rendering | Raw message content containing HTML | Escaped entities (`&lt;script&gt;`) | Strips/escapes executable scripts | `src/lib/utils/format.ts:4-11`, `ORIGINAL_REQUEST.md § R1` |
| 11 | R1 Presentation | Synthesized Flux Visuals | Renders AI-generated image cards with download button | `message.generatedImageUrl` string | Image card with Next.js Image component and download link | Gracefully hidden if URL absent | `src/components/chat/message-item.tsx:154-181` |
| 12 | R1 Presentation | File Attachment Chips | Displays pills for user-attached documents (PDF, CSV, Doc, Text) | `message.attachments` array | Pill with icon, truncated name, and preview | Omits if empty | `src/components/chat/message-item.tsx:114-126` |
| 13 | R2 Actions | Desktop Hover Action Toolbar | Reveals action buttons on mouse hover over message item | Mouse hover event (`group-hover:opacity-100`) | Action toolbar with copy, speech, edit, regenerate | Hidden on mobile unless menu provided | `src/components/chat/message-item.tsx:199-250` |
| 14 | R2 Actions | Mobile Action Menu | Accessible dropdown / action sheet for touch devices | Touch/click on mobile 3-dots trigger button | Action menu overlay with full list of message actions | Closes on backdrop tap or Escape | `ORIGINAL_REQUEST.md § R2` |
| 15 | R2 Actions | Copy Message Content | Copies entire message body to user clipboard | Click on Copy button | Plaintext copied to clipboard; icon changes to checkmark | Reverts after 2000ms | `src/components/chat/message-item.tsx:31-35` |
| 16 | R2 Actions | Edit User Message | Allows user to modify previous message and re-submit | Click on Edit button | Enters edit mode / populates composer with existing text | Abort edit on cancel | `src/components/chat/message-item.tsx:226-236` |
| 17 | R2 Actions | Regenerate Response | Re-triggers assistant generation using preceding message history | Click on Regenerate button | Calls `useChatStream.send()` with history context | Error card if stream fails | `src/components/chat/message-item.tsx:238-248` |
| 18 | R2 Actions | Delete Message | Permanently deletes message from session and local storage | Click on Delete action | Message removed from state and storage | No-op if message ID not found | `ORIGINAL_REQUEST.md § R2` |
| 19 | R2 Actions | Feedback Sentiment (Like/Dislike) | Records user rating on assistant response | Click on Thumbs Up / Thumbs Down | Sentiment stored in message state; button shows active state | Toggleable | `ORIGINAL_REQUEST.md § R2` |
| 20 | R2 Actions | Retry Failed Generation | Re-attempts generation after a streaming or network error | Click on Retry button on error card | Re-submits prior prompt payload | Disables retry during active request | `ORIGINAL_REQUEST.md § R2` |
| 21 | R2 Actions | Timestamp Tooltip & Inspection | Displays relative time with detailed ISO timestamp on hover | Hover/focus on timestamp string | Tooltip showing full formatted date/time | Defaults to relative time | `src/components/chat/message-item.tsx:197` |
| 22 | R2 Actions | Client-Side Safe Export | Exports message content as Markdown file or formatted clipboard copy | Click on Export action | Browser file download (`.md`) or clipboard copy | Disallows unsafe external link sharing | `ORIGINAL_REQUEST.md § R2` |
| 23 | R2 Actions | Text-to-Speech (Web Speech API) | Reads assistant message content aloud using browser speech synthesis | Click on Speaker button | Audio narration through device speaker | Alert if browser lacks SpeechSynthesis | `src/components/chat/message-item.tsx:38-62` |
| 24 | R3 Streaming | Vercel AI SDK SSE Parsing | Decodes and renders streaming tokens from `/api/chat` | SSE HTTP data stream (`0:"token"`) | Incrementally updates `streamingContent` state | Catches JSON decode errors | `src/features/chat/hooks/use-chat-stream.ts:70-96` |
| 25 | R3 Streaming | Active Generation Indicator | Pulsing stream cursor and status indicator during inference | `isGenerating: true`, `isStreaming: true` | Blinking cursor (`.stream-cursor`) and spinner/pill | Disappears when stream completes | `src/components/chat/message-item.tsx:151`, `globals.css` |
| 26 | R3 Streaming | Immediate Stop Generation | Aborts HTTP request and stops streaming token updates | Click on Square stop button in composer | `abortController.abort()` called; `isGenerating` set false | Preserves partial message | `src/features/chat/hooks/use-chat-stream.ts:25-31` |
| 27 | R3 Streaming | Progressive Markdown Parser | Formats markdown incrementally without unformatted syntax flash | Incoming stream chunks with partial syntax | Sanitized rendered HTML with auto-closed fences | Graceful handling of unclosed tags | `ORIGINAL_REQUEST.md § R3` |
| 28 | R3 Streaming | In-Message Error Card & Fallback | Displays structured error UI when stream fails | Stream network failure, 429 status, or 503 status | Error card with message and Retry button | Replaces failed stream | `ORIGINAL_REQUEST.md § R3` |
| 29 | R3 Streaming | Submission Deduplication | Disables submit button and ignores repeated Enter keystrokes | User input while `isGenerating === true` | Request locked; subsequent clicks/keys ignored | Send button disabled | `src/components/chat/chat-composer.tsx:56`, `use-chat-stream.ts:35` |

---

## 6. Edge Cases & Boundary Conditions

| # | Feature | Input / Trigger | Observed / Expected Behavior |
|---|---|---|---|
| E1 | R1 Typography | Extremely long unspaced string (e.g. 500 'A's or 300-char URL) | Word-break wrapping (`break-words`) prevents message bubble from overflowing container width or horizontally expanding page. |
| E2 | R1 Code Blocks | Massive code snippet with 300 columns and 500 lines | Outer message container stays constrained; `<pre>` scrolls horizontally; Copy button remains anchored on header without clipping. |
| E3 | R1 Code Blocks | Code block with unknown or missing language label (e.g. ` ``` ` without language) | Header displays default badge (`CODE`); syntax highlighting falls back to plain monospace without throwing error. |
| E4 | R1 Math | Incomplete or syntactically invalid LaTeX (e.g. `$$\frac{1}{$$` missing closing brace) | Parser does not throw runtime exception or blank the screen; falls back to displaying raw formula in formatted code pill. |
| E5 | R1 Tables | Markdown table with uneven column counts or missing delimiter row | Table parser degrades gracefully; renders rows with missing cells padded or falls back to clean monospace block. |
| E6 | R1 Security | Polyglot XSS payload: `<script>alert(1)</script><img src=x onerror=alert(2)><a href="javascript:alert(3)">click</a>` | All HTML tags stripped or escaped; link href sanitized; no script execution in DOM. |
| E7 | R1 Security | Raw HTML `<style>` or `<svg onload=...>` embedded in LLM output | Disallowed elements stripped; styles do not leak into global document stylesheet. |
| E8 | R2 Actions | User triggers Copy when browser clipboard permission is denied or clipboard API unavailable | Graceful error notification ("Clipboard unavailable") without unhandled promise rejection. |
| E9 | R2 Actions | User deletes the only message in the conversation | Conversation message list becomes empty; view transitions cleanly to `WelcomeCard` without null pointer crash. |
| E10 | R2 Actions | User clicks Edit on user message, modifies text, and resubmits | Updated user message replaces old one; previous assistant response removed; new assistant response streams. |
| E11 | R2 Actions | User clicks Regenerate on assistant message | Truncates any subsequent messages; invokes stream hook with history up to previous user prompt; streams fresh response. |
| E12 | R2 Actions | Rapid double-clicking on Regenerate or Feedback buttons | Action is debounced / guarded; duplicate network requests and duplicate state writes prevented. |
| E13 | R2 Actions | Mobile viewport action menu opened near bottom edge of screen | Menu flips upward or opens as accessible bottom sheet; does not clip off-screen. |
| E14 | R3 Streaming | TCP / SSE stream chunk split directly in the middle of a token line (e.g. `0:"Hel` and `lo"\n`) | Stream line buffer reassembles full line before `JSON.parse`; no characters lost or dropped. |
| E15 | R3 Streaming | User clicks Stop immediately after sending (< 50ms, before first token received) | Request aborted cleanly; empty placeholder removed; no orphan blank bubble left in chat. |
| E16 | R3 Streaming | User clicks Stop after 200 tokens have arrived | Stream reader cancelled; 200 accumulated tokens saved as finalized assistant message; actions enabled on partial text. |
| E17 | R3 Streaming | Upstream provider returns HTTP 429 Too Many Requests or 503 Provider Outage | In-message error card displayed with clear message; Retry button available; no browser `alert()` modal. |
| E18 | R3 Streaming | Mid-stream network disconnection (e.g. reader disconnects abruptly) | Stream reader catches error; in-progress message transitions to error state with option to Retry. |
| E19 | R3 Streaming | Rapid double-press on Enter key in composer | Second keypress ignored because `isGenerating` is immediately flagged true on first press. |
| E20 | R3 Streaming | Markdown streaming with unclosed code block (e.g. ` ```python\ndef run():\n  return 1 `) | Progressive markdown parser temporarily closes fence during render; prevents raw markdown syntax flash. |

---

## 7. Four-Tier E2E Testing Strategy Matrix

To satisfy the test engineering requirements, our Playwright test suite will be structured across four comprehensive tiers:

```
tests/e2e/
├── tier1-feature-coverage.spec.ts     # >=5 tests per feature group (R1, R2, R3)
├── tier2-boundary-cases.spec.ts       # >=5 boundary/edge case tests per group
├── tier3-cross-feature.spec.ts        # >=5 cross-feature integration tests
└── tier4-real-world.spec.ts           # >=5 realistic end-to-end user journeys
```

### 7.1 Tier 1: Feature Coverage (>=5 per Feature Group)

#### Feature Group R1: Message Presentation (>=5 Tests)
1. **`E2E-T1-R1-01` (User vs Assistant Styling)**: Send message; assert user message has `YOU` avatar and user background; assert assistant response has `RD` avatar and glass panel styling.
2. **`E2E-T1-R1-02` (Container Width Consistency)**: Verify message container widths on desktop (1280px) and mobile (393px Pixel 5) match layout boundaries without lateral shifts.
3. **`E2E-T1-R1-03` (Markdown Typography Hierarchy)**: Deliver prompt returning headings (H1-H3), paragraphs, blockquotes, and lists; verify rendered DOM tag structure and computed margins.
4. **`E2E-T1-R1-04` (Code Block Header & Copy)**: Return fenced Python code block; verify language badge `PYTHON` is visible, syntax tokens rendered, and clicking Copy shows "Copied!".
5. **`E2E-T1-R1-05` (Tables & Hyperlinks)**: Return markdown table and external link; verify `<table>`, `<th>`, `<td>` elements exist with horizontal scroll wrapper and link has `rel="noopener noreferrer"`.
6. **`E2E-T1-R1-06` (LaTeX Math Notation)**: Deliver prompt with inline `$E = mc^2$` and block `$$\sum_{i=1}^n x_i$$`; verify math renders correctly without raw delimiter syntax.
7. **`E2E-T1-R1-07` (HTML Script Sanitization)**: Deliver prompt containing `<script>window.__XSS__=true</script>`; verify script does not execute (`window.__XSS__` remains undefined).

#### Feature Group R2: Message Actions (>=5 Tests)
1. **`E2E-T1-R2-01` (Desktop Hover Toolbar)**: Hover over message bubble on desktop; verify Copy, Edit/Regenerate, Delete, and Feedback buttons become visible.
2. **`E2E-T1-R2-02` (Mobile Action Menu)**: On Mobile Chrome (Pixel 5), verify 3-dots action menu trigger is accessible and clicking opens accessible menu with full actions.
3. **`E2E-T1-R2-03` (Copy Message Action)**: Click Copy action on message; verify clipboard receives text and button shows confirmation checkmark.
4. **`E2E-T1-R2-04` (Edit User Message)**: Click Edit action on user message; modify prompt and submit; verify message content updates and fresh assistant response generates.
5. **`E2E-T1-R2-05` (Regenerate Assistant Response)**: Click Regenerate action on assistant message; verify streaming restarts and response refreshes.
6. **`E2E-T1-R2-06` (Delete Message)**: Click Delete action; verify message is removed from the DOM and does not reappear on page refresh.
7. **`E2E-T1-R2-07` (Feedback Rating Recording)**: Click Thumbs Up / Thumbs Down; verify active state styling toggles and persists.
8. **`E2E-T1-R2-08` (Safe Client-Side Export)**: Click Export action; verify client-side download or copy triggers without opening unsafe external links.

#### Feature Group R3: Streaming Experience (>=5 Tests)
1. **`E2E-T1-R3-01` (Progressive Token Streaming)**: Submit prompt; intercept SSE stream; verify DOM receives incremental text chunks progressively.
2. **`E2E-T1-R3-02` (Active Generation Indicator)**: During streaming, verify pulsing cursor (`.stream-cursor`) or generation indicator is visible.
3. **`E2E-T1-R3-03` (Stop Generation Button)**: During active streaming, click Stop button; verify request immediately aborts and streaming stops.
4. **`E2E-T1-R3-04` (Partial Content Preservation)**: Verify that tokens received prior to clicking Stop remain visible in conversation history as a completed message.
5. **`E2E-T1-R3-05` (Stream Error State & Retry)**: Mock `/api/chat` with 500 error; verify in-message error card appears with "Retry" button; click Retry and verify re-submission.
6. **`E2E-T1-R3-06` (Submission Deduplication)**: Submit prompt; verify composer Send button is disabled and pressing Enter does not trigger duplicate messages.

---

### 7.2 Tier 2: Boundary & Corner Cases (>=5 per Feature Group)

#### Feature Group R1 Boundaries (>=5 Tests)
1. **`E2E-T2-R1-01` (Unspaced 500-Character String)**: Verify container does not break or overflow when receiving a 500-character contiguous alphanumeric string.
2. **`E2E-T2-R1-02` (Ultra-Wide Code Block)**: Verify 300-column code snippet triggers horizontal scroll container inside message bubble without page horizontal scroll.
3. **`E2E-T2-R1-03` (Malformed Markdown / Unclosed Fences)**: Verify message containing unclosed ` ```typescript ` or dangling `**` does not throw rendering exception.
4. **`E2E-T2-R1-04` (Empty & Whitespace-Only Messages)**: Verify attempting to submit empty string or whitespace does nothing.
5. **`E2E-T2-R1-05` (Deeply Nested Markdown)**: Verify blockquote containing ordered list with inline code and bold math renders cleanly without tag overlap.

#### Feature Group R2 Boundaries (>=5 Tests)
1. **`E2E-T2-R2-01` (Rapid Action Button Spam)**: Click Copy or Regenerate rapidly 5 times in 500ms; verify no duplicated state or multiple simultaneous requests.
2. **`E2E-T2-R2-02` (Cancel Edit Mode)**: Start editing user message, clear text, press Escape or Cancel; verify original message content is restored intact.
3. **`E2E-T2-R2-03` (Delete Sole Message)**: Delete the only message in chat; verify screen resets cleanly to Welcome Card without console errors.
4. **`E2E-T2-R2-04` (Delete In-Flight Streaming Message)**: Trigger delete while streaming is active; verify stream aborts cleanly and state resets.
5. **`E2E-T2-R2-05` (Special Characters Export)**: Export message with emojis, unicode math symbols, and quotation marks; verify exported file content matches verbatim.

#### Feature Group R3 Boundaries (>=5 Tests)
1. **`E2E-T2-R3-01` (Stream Chunk Sliced Across Token Boundaries)**: Mock SSE with line breaks sliced across TCP chunks; verify all tokens assemble without missing letters.
2. **`E2E-T2-R3-02` (Instant Stop Click <50ms)**: Click Stop immediately after Send; verify zero orphan blank messages left in history.
3. **`E2E-T2-R3-03` (HTTP 429 Rate Limit Handling)**: Mock 429 response; verify clean rate limit banner and retry-after guidance instead of unhandled error.
4. **`E2E-T2-R3-04` (Mid-Stream Network Disconnect)**: Drop stream midway; verify in-flight message transitions to error card with Retry action.
5. **`E2E-T2-R3-05` (Rapid Enter Key Spam)**: Press Enter 5 times rapidly; verify exactly one request is dispatched to `/api/chat`.

---

### 7.3 Tier 3: Cross-Feature Interactions (>=5 Tests)

1. **`E2E-T3-01` (Edit Prompt -> Stream Response -> Check Actions)**: Edit an earlier user message -> new assistant response streams progressively -> verify completed response exposes copy, regenerate, delete, and feedback actions.
2. **`E2E-T3-02` (Stop Stream -> Verify Partial Typography & Actions)**: Stream containing code block stopped midway -> verify partial code block is properly closed and rendered -> verify copy code button and export work on partial content.
3. **`E2E-T3-03` (Stream Error -> Retry -> Success Flow)**: First attempt returns 503 error -> error card rendered -> click Retry -> second attempt streams successfully -> error card replaced by valid response.
4. **`E2E-T3-04` (Mobile Viewport Switching & Menu Dismissal)**: Open mobile action menu -> resize viewport or switch to desktop -> menu closes cleanly without backdrop artifact.
5. **`E2E-T3-05` (Multi-Turn Chat History Navigation)**: Send 3 turns of messages -> open History drawer -> create New Chat -> reopen earlier chat from History -> verify all messages, markdown formatting, timestamps, and action states are intact.

---

### 7.4 Tier 4: Real-World Scenarios (>=5 Tests)

1. **`E2E-T4-01` (Full Developer Coding Session)**: User asks for a React TypeScript component -> assistant streams syntax-highlighted code block with language label -> user clicks copy code button -> user edits prompt to request unit tests -> stream generates test file -> user exports chat to Markdown.
2. **`E2E-T4-02` (Academic Mathematical Research Workflow)**: User inputs prompt for standard deviation and integral derivation -> assistant streams LaTeX equations -> user inspects formatted inline `$..$` and block `$$..$$` formulas -> user provides positive feedback rating.
3. **`E2E-T4-03` (Mobile Touch Journey on Pixel 5)**: User accesses platform on mobile viewport -> types query in composer -> observes smooth streaming -> taps 3-dots action menu -> copies response -> deletes conversation via drawer.
4. **`E2E-T4-04` (Fault Recovery & Retry Resilience)**: User sends query while offline / upstream down -> error card displayed with reason -> user clicks Retry -> response streams -> verified without page reload.
5. **`E2E-T4-05` (Long Multimodal Session & State Persistence)**: User submits query with document attachment -> assistant responds with formatted table and blockquote -> user toggles theme from violet to emerald -> verifies message styling and contrast adapt seamlessly.

---

## 8. Vitest Unit & Integration Test Architecture Plan

To ensure test pyramid stability, the following unit and integration test suites must be created or expanded in `tests/unit/`:

### 8.1 `tests/unit/format-markdown.test.ts`
- **Fenced Code Blocks**: Language attribute parsing (`data-language`), unescaping prevention, copy button attribute injection (`data-code`).
- **Syntax Highlighting**: Verified token generation or CSS class tagging for code words.
- **LaTeX Math Notation**: Inline `$E=mc^2$` and block `$$\int f(x)dx$$` parsing; malformed formula error boundary.
- **Tables**: Multi-column and multi-row markdown table parsing; wrapping in overflow container.
- **Links**: Safe URL parsing, enforcement of `rel="noopener noreferrer"` and `target="_blank"`, rejection of `javascript:` protocol.
- **XSS Sanitization**: Rejection/escaping of `<script>`, `<iframe>`, `<object>`, `<img onerror=...>`, `<svg onload=...>`.
- **Progressive Streaming Markdown**: Parsing incomplete code fences and unclosed markdown without syntax flash.

### 8.2 `tests/unit/use-chat-stream.test.ts`
- **Stream Line Buffering**: Feed mocked `ReadableStream` chunks split across SSE line boundaries; verify no dropped characters.
- **Normal Completion Lifecycle**: Stream tokens `0:"Hello"`, `0:" World"`; verify `streamingContent` updates and `onStreamComplete` is called with final `ChatMessage`.
- **Stop Generation Lifecycle**: Call `stop()`; verify `abortController.abort()` is called; verify partial content is preserved and `isGenerating` resets.
- **Error Handling**: Mock 429 / 500 fetch rejection; verify `onError` is called; verify `isGenerating` resets.
- **Concurrency Guard**: Assert `send()` does not initiate second fetch if `isGenerating` is true.

### 8.3 `tests/unit/use-chat-session.test.ts`
- **`appendUserMessage`**: Appends user message with unique ID and current timestamp; clears active follow-up chips.
- **`appendAssistantMessage`**: Appends assistant message; derives conversation title; saves to `conversationService`.
- **`deleteMessage`**: Removes specified message from active conversation; updates persistence.
- **`editMessage`**: Updates user message content; saves conversation.
- **`setFeedback`**: Updates sentiment rating on assistant message; saves conversation.
- **`retryMessage`**: Identifies last user prompt for resubmission.

### 8.4 `tests/unit/message-item.test.tsx` (Integration)
- **Role Styling**: Renders user vs assistant message; verifies avatars (`YOU` vs `RD`) and CSS classes.
- **Code Block Interactions**: Renders code block; simulates click on copy button; verifies `navigator.clipboard.writeText` called with unescaped code; verifies "Copied!" feedback.
- **Desktop Actions vs Mobile Actions**: Verifies action toolbar visibility and mobile menu trigger.
- **Action Callbacks**: Simulates clicks on Edit, Regenerate, Delete, Feedback; verifies parent callbacks invoked with correct message payload.
- **Error State**: Renders message with `isError: true`; verifies error badge and Retry button.
- **Streaming State**: Renders with `isStreaming: true`; verifies presence of `.stream-cursor`.

---

## 9. Key Architectural Gaps & Implementation Guidance for Builders

1. **Markdown Parser Upgrade**:
   - `src/lib/utils/format.ts` currently uses rudimentary regex substitutions that fail on tables, links, math, and streaming partial fences.
   - *Recommendation*: Enhance `formatMarkdown` or incorporate a resilient markdown processing pipeline (with KaTeX integration, table support, link safety sanitizer, and syntax highlighting token classes).
2. **Stream Chunk Line Buffer**:
   - In `src/features/chat/hooks/use-chat-stream.ts`, implement a persistent line buffer (`let buffer = ""`) to assemble chunks before splitting on `\n`.
   - On `stop()`, commit accumulated tokens to `onStreamComplete` as a partial message rather than dropping them or leaving an unfinalized streaming state.
3. **Action Wire-Up in Workspace & Page**:
   - `src/components/chat/message-item.tsx` already has UI buttons for Copy, Speech, Edit, and Regenerate, but `chat-workspace.tsx` and `page.tsx` never pass down `onEdit`, `onRegenerate`, `onDelete`, or `onFeedback`.
   - Update `useChatSession` to export `deleteMessage`, `editMessage`, `setFeedback`. Wire these handlers through `page.tsx` -> `chat-workspace.tsx` -> `message-item.tsx`.
4. **Mobile Action Menu**:
   - Use `@radix-ui/react-dropdown-menu` (already installed in `package.json`) to provide an accessible 3-dots action menu on mobile viewports (< 768px).
5. **In-Message Error State**:
   - Replace the browser `alert()` in `page.tsx:handleStreamError` with an in-chat error message (`isError: true`, `errorDetails`) containing a functional Retry button.
6. **Vitest Configuration for `.tsx`**:
   - In `vitest.config.ts`, update `include` from `["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"]` to `["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"]` so component unit tests in JSX can run.
7. **Windows Command Execution**:
   - Remind builders and test runners to use `cmd /c npm ...` or `cmd /c pnpm ...` to prevent PowerShell script execution policy errors.

---

## 10. Conclusion

The testing infrastructure (TypeScript, Next linter, Vitest, Playwright) is fully operational and passes cleanly on the existing codebase. The requirements for R1, R2, and R3 are thoroughly mapped, all existing capabilities and architectural gaps are catalogued, and an exhaustive 4-tier E2E testing strategy alongside targeted Vitest unit tests is formulated. The codebase is ready for test-driven and feature-driven implementation by subsequent agent roles.
