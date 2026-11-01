# Project: Radiance AI Platform — Chat Presentation, Actions & Streaming Enhancements

## Architecture
- **Framework**: Next.js 15 (App Router), React 19, TypeScript 5.8, Tailwind CSS v4.
- **Presentation Layer**:
  - `src/components/chat/message-item.tsx`: Message bubble rendering, role separation, code block wrapper, action toolbar (desktop hover) and accessible mobile menu (`@radix-ui/react-dropdown-menu`).
  - `src/features/chat/components/chat-workspace.tsx`: Message stream orchestration, active generation indicator, in-message error card, action callback routing.
  - `src/components/chat/chat-composer.tsx`: Input textarea, stop-generation button, submission ref guard, IME composition safety.
- **Formatting & Formatting Engine**:
  - `src/lib/utils/format.ts`: Robust markdown parsing, streaming-tolerant code fence handling, syntax highlighting tokens, KaTeX LaTeX math rendering, table parsing with horizontal overflow wrappers, and strict HTML sanitization.
  - `src/app/globals.css`: Typography scale (H1-H6), code block themes, table styles, blockquotes, links, and responsive container constraints.
- **State & Streaming Layer**:
  - `src/lib/types/chat.ts`: Data models for `ChatMessage` (with `feedback`, `isError`, `errorDetails`), `Role`, `Attachment`.
  - `src/features/chat/hooks/use-chat-stream.ts`: SSE token reader with persistent cross-chunk line buffer, immediate AbortController cancellation, partial token preservation, and error dispatch.
  - `src/features/chat/hooks/use-chat-session.ts`: Conversation lifecycle, `deleteMessage`, `editUserMessage`, `setMessageFeedback`, and persistent storage synchronization.
- **Testing Architecture**:
  - Vitest unit test suites (`tests/unit/`): Coverage for format-markdown, streaming buffer, session state actions, and message components.
  - Playwright E2E test suites (`tests/e2e/`): 4-tier requirement-driven opaque-box testing across Desktop Chrome (1280x720) and Mobile Chrome (Pixel 5).

---

## Feature Inventory
Every feature identified during the survey is catalogued and assigned to a milestone below:

| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Role-Based Message Bubbles | Visually distinct user vs assistant message styling, avatars (YOU vs RD), borders, and alignment | M1 | Survey R1 |
| 2 | Responsive Container Geometry | Width constraints (`w-fit self-end max-w-[85%] sm:max-w-[75%]` for user, `w-full` for assistant), `min-w-0` on flex ancestors | M1 | Survey R1 |
| 3 | Markdown Heading Hierarchy | Semantic H1–H6 with calibrated modular type scale and responsive vertical margins | M1 | Survey R1 |
| 4 | Markdown Paragraphs & Spacing | Clean semantic paragraph structure with consistent spacing and typography | M1 | Survey R1 |
| 5 | Markdown Lists (Ordered/Unordered) | Ordered and unordered list parsing with styled counters/bullets and nested list support | M1 | Survey R1 |
| 6 | Markdown Tables | CommonMark/GFM table parsing with `overflow-x-auto` wrapper, alternating rows, styled headers | M1 | Survey R1 |
| 7 | Markdown Blockquotes | Semantic blockquotes with accent left border and subtle gradient background tint | M1 | Survey R1 |
| 8 | Markdown Hyperlinks | Hyperlink parsing with `target="_blank" rel="noopener noreferrer"`, styled hover underline, safe protocols | M1 | Survey R1 |
| 9 | Inline Code Formatting | Pill-styled `<code>` with subtle border, contrast text, and monospace font | M1 | Survey R1 |
| 10 | Code Block Headers & Language Badges | Fenced code blocks with headers displaying normalized uppercase language badges | M1 | Survey R1 |
| 11 | Code Block Syntax Highlighting | Tokenized syntax highlighting for common languages (TypeScript, Python, JSON, SQL, etc.) | M1 | Survey R1 |
| 12 | Code Block Copy Button | Reactive copy button with raw unescaped code copy, visual confirmation ("Copied!"), accessible ARIA label | M1 | Survey R1 |
| 13 | Code Block Horizontal Scrollbar | Overflow container allowing wide code lines to scroll horizontally without parent clipping | M1 | Survey R1 |
| 14 | LaTeX / KaTeX Mathematical Notation | Inline `$math$` and block `$$math$$` expressions rendered via KaTeX with graceful fallback | M1 | Survey R1 |
| 15 | Strict HTML & Script Sanitization | Neutralize untrusted HTML tags (`<script>`, `<iframe>`, `on*` attributes, `javascript:` URIs) | M1 | Survey R1 |
| 16 | Cross-Chunk Stream Line Buffering | Persistent line buffer in `use-chat-stream.ts` preventing token loss across SSE chunk boundaries | M2 | Survey R3 |
| 17 | Immediate Stop-Generation & Abort | AbortController cancellation halting HTTP request immediately on button click | M2 | Survey R3 |
| 18 | Partial Content Preservation | Preserves accumulated tokens on stream abort as a completed assistant message | M2 | Survey R3 |
| 19 | Submission Deduplication | Synchronous ref guard and IME composition check in composer, unique deterministic message IDs | M2 | Survey R3 |
| 20 | Session Message Deletion | `deleteMessage` in `useChatSession` updating in-memory messages and `conversationService` storage | M2 | Survey R2 |
| 21 | Session Message Feedback | `setMessageFeedback` in `useChatSession` recording sentiment rating in state and persistence | M2 | Survey R2 |
| 22 | Session Message Editing | `editUserMessage` in `useChatSession` updating user message text and preparing resubmission | M2 | Survey R2 |
| 23 | Desktop Hover Action Toolbar | Smooth hover/focus-within action toolbar positioned by message bubble | M3 | Survey R2 |
| 24 | Mobile Accessible Action Menu | 3-dots trigger button opening an accessible Radix dropdown menu on touch/mobile viewports | M3 | Survey R2 |
| 25 | Copy Message Action | Action bar button copying message plaintext to clipboard with checkmark confirmation feedback | M3 | Survey R2 |
| 26 | Edit User Message Action | Action triggering prompt editing with resubmission capability | M3 | Survey R2 |
| 27 | Regenerate Assistant Response Action | Action truncating subsequent messages and re-invoking stream with prior history context | M3 | Survey R2 |
| 28 | Delete Message Action | Action triggering message deletion with state and persistence cleanup | M3 | Survey R2 |
| 29 | Feedback Sentiment Rating Action | Thumbs up/down buttons toggling positive/negative rating in session state | M3 | Survey R2 |
| 30 | Retry Failed Generation Action | Action on failed messages re-invoking stream for the previous prompt | M3 | Survey R2 |
| 31 | Accessible Timestamp Display | Tabular relative time with accessible exact date/time tooltip and mobile menu item | M3 | Survey R2 |
| 32 | Safe Client-Side Export | Export message or conversation to Markdown file download or formatted text copy | M3 | Survey R2 |
| 33 | Active Inference Generation Indicator | Thinking/generating status indicator during TTFT and active stream cursor during inference | M3 | Survey R3 |
| 34 | Progressive Streaming Markdown | Streaming-tolerant parser auto-closing incomplete fences to eliminate syntax flash and layout jumps | M1, M3 | Survey R3 |
| 35 | In-Message Error State UI | Structured in-chat error card with retry button replacing disruptive `window.alert()` | M3 | Survey R3 |
| 36 | 4-Tier Playwright E2E Test Suite | Comprehensive opaque-box test suite implementing Tiers 1-4 across Desktop and Mobile viewports | M4 | Survey Testing |
| 37 | Vitest Unit & Integration Test Coverage | Unit test suites for markdown parser, stream buffer, session actions, and message item | M1, M2, M3 | Survey Testing |
| 38 | Final E2E Suite Pass & Tier 5 Hardening | 100% pass of Tiers 1-4 and adversarial white-box coverage hardening (Tier 5) | M5 | Survey Testing |

---

## Milestones

| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Presentation & Typography Engine | `src/lib/utils/format.ts`, `src/app/globals.css`, math/KaTeX, code highlighting, sanitization, tables, headings | none | DONE |
| M2 | Streaming Lifecycle & Session State | `src/lib/types/chat.ts`, `src/features/chat/hooks/use-chat-stream.ts`, `src/features/chat/hooks/use-chat-session.ts`, `src/components/chat/chat-composer.tsx` | none | DONE |
| M3 | Interactive Actions & Workspace Integration | `src/components/chat/message-item.tsx`, `src/features/chat/components/chat-workspace.tsx`, `src/app/page.tsx`, mobile menu, error states | M1, M2 | IN_PROGRESS |
| M4 | E2E Testing Track (Tiers 1–4) | `tests/e2e/tier1-feature-coverage.spec.ts`, `tier2-boundary-cases.spec.ts`, `tier3-cross-feature.spec.ts`, `tier4-real-world.spec.ts`, `TEST_INFRA.md`, `TEST_READY.md` | none (Parallel) | PLANNED |
| M5 | Final Milestone: 100% E2E Pass & Tier 5 Adversarial Hardening | Run all E2E tests, resolve regressions, execute Tier 5 adversarial stress testing | M3, M4 | PLANNED |

---

## Interface Contracts

### M1 (Format Engine) ↔ M3 (Message Item & Workspace)
- Function: `formatMarkdown(content: string, options?: { isStreaming?: boolean }): string`
  - Input: raw markdown content string, optional streaming flag to auto-close unclosed code fences.
  - Output: sanitized, highlighted HTML string containing semantic tags (`h1`-`h6`, `p`, `table`, `code-block-wrapper` with `data-code`, `data-language`, KaTeX rendered spans).
  - Guarantees: Zero `<script>`, `<iframe>`, `on*` attributes, or `javascript:` URIs.

### M2 (Session & Stream State) ↔ M3 (Workspace & Actions)
- `ChatMessage` type in `src/lib/types/chat.ts`:
  ```typescript
  export interface ChatMessage {
    id: string;
    role: Role;
    content: string;
    createdAt: number;
    attachments?: Attachment[];
    generatedImageUrl?: string;
    isError?: boolean;
    errorDetails?: string;
    feedback?: "positive" | "negative" | null;
  }
  ```
- `useChatSession` hook return interface:
  ```typescript
  export interface UseChatSessionReturn {
    ...
    deleteMessage: (messageId: string) => void;
    editUserMessage: (messageId: string, newContent: string) => void;
    setMessageFeedback: (messageId: string, feedback: "positive" | "negative" | null) => void;
  }
  ```
- `useChatStream` hook return interface:
  ```typescript
  export interface UseChatStreamReturn {
    isGenerating: boolean;
    streamingContent: string;
    streamError: Error | null;
    send: (messages: ChatMessage[], modelId?: string) => Promise<void>;
    stop: () => void;
    retryLast: () => Promise<void>;
  }
  ```

---

## Code Layout
- `src/lib/types/chat.ts` — Chat types, message interface, feedback enums. Owned by M2.
- `src/lib/utils/format.ts` — Markdown formatting, syntax highlighting, KaTeX integration, HTML sanitization. Owned by M1.
- `src/app/globals.css` — Typography styles, code themes, table layouts, mobile responsive utilities. Owned by M1.
- `src/features/chat/hooks/use-chat-stream.ts` — Stream hook, chunk buffer, abort lifecycle. Owned by M2.
- `src/features/chat/hooks/use-chat-session.ts` — Session hook, message CRUD, feedback state, persistence. Owned by M2.
- `src/components/chat/chat-composer.tsx` — Input textarea, stop-generation button, submission deduplication. Owned by M2.
- `src/components/chat/message-item.tsx` — Message item component, desktop hover toolbar, mobile action menu, copy/action handlers. Owned by M3.
- `src/features/chat/components/chat-workspace.tsx` — Message list container, active generation indicator, error card, action routing. Owned by M3.
- `src/app/page.tsx` — Top-level wiring between session, stream, and workspace. Owned by M3.
- `tests/unit/` — Vitest unit & integration tests. Owned by M1, M2, M3.
- `tests/e2e/` — Playwright E2E test suites (Tiers 1–4). Owned by M4 (E2E Testing Track).
