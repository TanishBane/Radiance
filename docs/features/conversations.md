# Conversation Engine & Chat Lifecycle

This document specifies the lifecycle, state persistence, streaming mechanisms, and interaction contracts of the Radiance conversation engine.

---

## 1. Architectural Overview

Radiance models conversations as immutable state streams with persistent multi-tier backup (in-memory state, local storage, and remote Supabase persistence when authenticated).

```mermaid
flowchart TD
    User([User Prompt]) --> Composer[Chat Composer]
    Composer --> Hook[useChatSession / useChatStream]
    Hook --> EdgeAPI[/api/chat Route]
    EdgeAPI --> AIProvider[AI Provider SDK]
    AIProvider -- SSE Stream --> EdgeAPI
    EdgeAPI -- Chunk Tokens --> Hook
    Hook --> Workspace[ChatWorkspace]
    Hook --> StorageSync[conversationService]
    
    subgraph Storage Sync
        StorageSync --> LocalStorage[Local Client Cache]
        StorageSync --> SupabaseDB[(Supabase DB)]
    end
```

---

## 2. Core Capabilities

### 2.1 Multi-Turn Stream Handling
- **SSE Streaming Protocol:** Uses the Vercel AI SDK (`4.1.54`) data stream protocol over Server-Sent Events (SSE).
- **Time to First Token (TTFT):** Dedicated low-overhead visual indicator (`ThinkingIndicator`) transitions seamlessly into live streaming markdown without layout jitter.
- **Microtask Batching:** Stream chunks are buffered and dispatched to avoid excessive React 19 fiber reconciliations while preserving 60fps frame rates.

### 2.2 Partial Token Retention (Feature 18)
When a user clicks the **Stop** button during active generation:
1. The client sends an abort signal through `AbortController`.
2. All generated tokens received prior to the abort event are retained in the message history.
3. The conversation state is safely persisted with a complete message object marked with truncated generation metadata, preventing content loss.

### 2.3 Non-Destructive Message Editing & Regeneration
- **Edit Prompt:** Editing any previous user prompt truncates the conversational tree at that turn, retains preceding turns, and dispatches a fresh inference stream with the revised prompt.
- **Regenerate:** Clicking regenerate on an assistant response identifies the immediate preceding user prompt, removes stale assistant turns, and re-invokes the selected model with existing context.

### 2.4 User Feedback Rating & Observability
- Every completed assistant response surfaces accessible thumbs-up and thumbs-down rating affordances.
- Ratings trigger non-blocking telemetry records in the observability layer for evaluation and fine-tuning datasets.

### 2.5 Markdown, Mathematics & Artifact Rendering
- Full GitHub Flavored Markdown (GFM) parsing.
- Inline and block LaTeX math rendering powered by KaTeX.
- Syntax-highlighted code blocks with one-click copy and line numbering.
- Interactive export options: Export conversation to Markdown (`.md`) or JSON format.

---

## 3. Data Schema & Models

```typescript
export interface ChatMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt: number;
  modelId?: string;
  tone?: ToneKey;
  attachments?: Attachment[];
  feedback?: "up" | "down" | null;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  messages: ChatMessage[];
}
```

---

## 4. Key Performance Invariants

1. **Zero Session Contamination:** Navigating to `newChat` or switching conversations immediately aborts any in-flight stream and prevents asynchronous tokens from leaking into unrelated conversations.
2. **Keyboard Operability:** Full support for `Enter` to submit, `Shift+Enter` for multiline input, and `Escape` to close drawers or dismiss dialogs.
3. **Safe Area & Mobile Ergonomics:** The composer adheres strictly to dynamic viewport units (`100dvh`), automatically adjusting padding above the virtual keyboard and safe area insets (`env(safe-area-inset-bottom)`).
