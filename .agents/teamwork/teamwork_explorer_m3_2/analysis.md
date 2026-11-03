# Milestone 3 Explorer 2: Workspace Inference & Error States Analysis

**Agent**: `teamwork_explorer_m3_2`  
**Milestone**: Milestone 3 (Interactive Actions & Workspace Integration)  
**Target Component**: `src/features/chat/components/chat-workspace.tsx`  
**Target Test Suite**: `tests/unit/chat-workspace.test.tsx`  
**Related Files**: `src/lib/types/chat.ts`, `src/lib/utils/format.ts`, `src/features/chat/hooks/use-chat-stream.ts`, `src/app/page.tsx`

---

## 1. Problem Boundary & Existing State Inspection

### 1.1 Existing Code Inspection (`src/features/chat/components/chat-workspace.tsx`)
In the baseline implementation of `src/features/chat/components/chat-workspace.tsx` (lines 10–83):

```tsx
interface ChatWorkspaceProps {
  messages: ChatMessage[];
  streamingContent: string;
  isGenerating: boolean;
  activeFollowUps: string[];
  onSend: (text: string, attachments?: Attachment[]) => void;
  onStop: () => void;
  onSelectSuggestion: (text: string) => void;
  onOpenSettings: () => void;
}
```

Streaming placeholder logic (lines 52–63):
```tsx
{/* Active SSE Streaming Placeholder */}
{streamingContent && (
  <MessageItem
    message={{
      id: "streaming_active",
      role: "assistant",
      content: streamingContent,
      createdAt: Date.now(),
    }}
    isStreaming={true}
  />
)}
```

### 1.2 Architectural Deficiencies Identified
1. **TTFT Blindness (Time To First Token)**:
   - When the user sends a message, `isGenerating` becomes `true`, but `streamingContent` remains empty (`""`) until the first SSE chunk arrives (typically 500ms–3000ms depending on model inference latency).
   - Because `{streamingContent && (...)}` checks truthiness of `streamingContent`, **nothing is rendered** in the message list during TTFT.
   - The user sees zero visual feedback that the model has accepted the prompt and is computing a response.
2. **Missing Active Stream Cursor**:
   - While `streamingContent` accumulates, the cursor representation in `MessageItem` is positioned in a separate block element after the prose container, causing it to drop to the next visual line or disconnect from the streaming token flow.
   - The workspace lacks a dedicated pulsating stream cursor attached inline to the progressive markdown output.
3. **Disruptive `window.alert()` Error Handling**:
   - In `src/app/page.tsx` (lines 61–63), stream errors invoke `alert(\`Inference error: ${error.message}\`)`.
   - This opens a blocking browser dialog that freezes UI interactions, degrades mobile experience, and does not provide an inline recovery/retry mechanism.
   - `ChatWorkspace` accepts no `streamError` or `onRetry` props, and has no UI for rendering failed assistant generations or messages with `isError: true`.
4. **Unclosed Syntax Flash in Streaming Markdown**:
   - `MessageItem` calls `formatMarkdown(message.content)` without passing `{ isStreaming: true }`.
   - While `format.ts` provides code fence auto-recovery, explicit `{ isStreaming: true }` must be integrated at the streaming presentation boundary to guarantee unclosed markdown structures do not cause layout shifts.
5. **Missing Unit Test Suite**:
   - `tests/unit/chat-workspace.test.tsx` does not exist. No unit tests currently verify the workspace's streaming lifecycle, TTFT indicator, error card, or auto-scroll mechanics.

---

## 2. Design: Active Inference Indicator during TTFT

### 2.1 Trigger Condition
- Active when `isGenerating === true && !streamingContent` (or `streamingContent.trim().length === 0`).
- Seamlessly unmounts the moment `streamingContent` receives its first non-empty token slice.

### 2.2 Visual Specification
- **Alignment & Container**: Assistant message geometry (`self-start`, `max-w-3xl`, `w-full`).
- **Avatar**: Assistant "RD" branding matching completed assistant messages (`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-mono text-[10px] font-bold border bg-[var(--surface-raised)] border-[var(--border)] text-[var(--txt)] shadow-sm`).
- **Bubble Surface**: Glassmorphism surface with brand accent highlight (`bg-[var(--ai-bg)] border-[var(--ai-border)] border-l-2 border-l-[var(--accent)] rounded-2xl rounded-tl-sm px-4 py-3 shadow-[0_4px_24px_rgba(0,0,0,0.25)] glass-panel`).
- **Indicator Elements**:
  - Three pulsating dots styled with `--accent` and staggered animation delays:
    - Dot 1: `w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse`
    - Dot 2: `w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse [animation-delay:200ms]`
    - Dot 3: `w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse [animation-delay:400ms]`
  - Label: `<span className="font-mono text-xs text-[var(--txt-muted)] tracking-wide">Thinking...</span>`
- **Accessibility Attributes**:
  - `role="status"`
  - `aria-live="polite"`
  - `aria-label="Generating response"`
  - `data-testid="active-inference-indicator"`

```tsx
{/* Active Inference Indicator during TTFT */}
{isGenerating && !streamingContent && (
  <div
    data-testid="active-inference-indicator"
    className="flex gap-3 max-w-3xl w-full mx-auto my-3.5 self-start animate-fade-in"
  >
    <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-mono text-[10px] font-bold border select-none bg-[var(--surface-raised)] border-[var(--border)] text-[var(--txt)] shadow-sm">
      <span className="gradient-text-brand">RD</span>
    </div>
    <div className="flex flex-col gap-1 max-w-[calc(100%-44px)]">
      <div
        role="status"
        aria-live="polite"
        aria-label="Generating response"
        className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed border transition-all bg-[var(--ai-bg)] border-[var(--ai-border)] border-l-2 border-l-[var(--accent)] text-[var(--txt)] shadow-[0_4px_24px_rgba(0,0,0,0.25)] glass-panel inline-flex items-center gap-2.5"
      >
        <span className="flex items-center gap-1.5 py-0.5" aria-hidden="true">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse [animation-delay:200ms]" />
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse [animation-delay:400ms]" />
        </span>
        <span className="font-mono text-xs text-[var(--txt-muted)] tracking-wide">
          Thinking...
        </span>
      </div>
    </div>
  </div>
)}
```

---

## 3. Design: Active Stream Cursor & Progressive Markdown

### 3.1 Trigger Condition
- Active when `Boolean(streamingContent)` is truthy (`streamingContent.length > 0`).

### 3.2 Progressive Markdown Integration
- Must pass `{ isStreaming: true }` to `formatMarkdown(streamingContent, { isStreaming: true })`.
- This invokes the streaming code fence auto-recovery in `src/lib/utils/format.ts`:
  ```ts
  const fenceMatches = content.match(/(?:^|\n)\s*```/g);
  if (fenceMatches && fenceMatches.length % 2 === 1) {
    if (!content.endsWith("\n")) {
      content += "\n```";
    } else {
      content += "```";
    }
  }
  ```
- Result: As code blocks stream in token-by-token (e.g. ````python\ndef calculate():`), the unclosed fence is temporarily auto-closed for rendering, formatting it immediately inside `<div class="code-block-wrapper">` with syntax highlighting rather than raw unformatted text.

### 3.3 Active Stream Cursor Specification
- Pulsating cursor appended inline directly after the streaming markdown content:
  `<span data-testid="stream-cursor" className="inline-block w-2 h-4 bg-[var(--accent)] ml-1 animate-pulse align-middle" aria-hidden="true" />`
- Visual attributes:
  - Width: `w-2` (8px)
  - Height: `h-4` (16px, proportional to text-sm line-height)
  - Color: `bg-[var(--accent)]` (theme-reactive golden/violet accent)
  - Animation: `animate-pulse` (continuous opacity pulse)
  - Alignment: `align-middle`
  - Spacing: `ml-1`

```tsx
{/* Active SSE Streaming Placeholder */}
{streamingContent ? (
  <div
    data-testid="streaming-message"
    className="flex gap-3 max-w-3xl w-full mx-auto my-3.5 self-start"
  >
    <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-mono text-[10px] font-bold border select-none bg-[var(--surface-raised)] border-[var(--border)] text-[var(--txt)] shadow-sm">
      <span className="gradient-text-brand">RD</span>
    </div>
    <div className="flex flex-col gap-1 max-w-[calc(100%-44px)] w-full">
      <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed border transition-all bg-[var(--ai-bg)] border-[var(--ai-border)] border-l-2 border-l-[var(--accent)] text-[var(--txt)] shadow-[0_4px_24px_rgba(0,0,0,0.25)] glass-panel">
        <div
          data-testid="streaming-content"
          className="prose prose-invert max-w-none break-words text-[13.5px] leading-relaxed select-text"
          dangerouslySetInnerHTML={{
            __html: formatMarkdown(streamingContent, { isStreaming: true }),
          }}
        />
        <span
          data-testid="stream-cursor"
          className="inline-block w-2 h-4 bg-[var(--accent)] ml-1 animate-pulse align-middle"
          aria-hidden="true"
        />
      </div>
    </div>
  </div>
) : null}
```

---

## 4. Design: In-Message Structured Error Card

### 4.1 Trigger Conditions
The structured error card renders in two scenarios:
1. **Active Stream Error (`streamError !== null && !isGenerating`)**:
   - The SSE stream terminated abnormally (e.g. 500 error, network disconnection, rate limiting).
   - Displayed at the tail of the message list where the assistant response would have appeared.
2. **Persisted / Message-Level Error (`msg.isError === true`)**:
   - A historical message in `messages` was marked with `isError: true` and optional `errorDetails`.

### 4.2 Visual & Functional Specification
- **Container**: `role="alert"`, `aria-live="assertive"`, `data-testid="in-message-error-card"`.
- **Avatar**: Danger tinted avatar with `AlertCircle` icon:
  `<div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-mono text-[10px] font-bold border border-[var(--danger)]/30 bg-[var(--danger-d)] text-[var(--danger)] shadow-sm select-none">`
  `<AlertCircle className="w-4 h-4 text-[var(--danger)]" aria-hidden="true" />`
  `</div>`
- **Error Bubble**:
  - Background: `bg-[var(--danger-d)]/40`
  - Border: `border border-[var(--danger)]/30 border-l-4 border-l-[var(--danger)]`
  - Shadow: `shadow-[0_4px_24px_rgba(232,85,85,0.08)]`
  - Label: `<span className="font-semibold text-xs uppercase tracking-wider text-[var(--danger)]">Generation Error</span>`
  - Error description: `<p className="text-[13px] leading-relaxed text-[var(--txt-dim)] break-words">{errorMessage}</p>`
  - Details (if provided): `<p className="mt-1.5 text-xs font-mono text-[var(--txt-muted)] bg-black/20 p-2 rounded border border-[var(--border)] break-all">{errorDetails}</p>`
- **Prominent Retry Button**:
  - `data-testid="error-retry-button"`
  - `aria-label="Retry failed generation"`
  - High contrast action button:
    `<button type="button" onClick={onRetry} data-testid="error-retry-button" className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--danger)] hover:bg-[var(--danger)]/85 text-white shadow-sm transition-all duration-200 active:scale-95 touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)] cursor-pointer">`
    `<RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />`
    `<span>Retry</span>`
    `</button>`
- **Resolution of `window.alert()`**:
  - In `page.tsx`, `onError` no longer calls `alert()`.
  - The error is captured in `useChatStream` state (`streamError: Error | null`) and passed directly into `<ChatWorkspace streamError={streamError} onRetry={retryLast} />`.
  - Clicking "Retry" triggers `stream.retryLast()`, which immediately resets `streamError = null` and begins generation, transitioning the workspace from Error Card → TTFT Indicator → Active Stream.

---

## 5. Interface Contract Extensions: `ChatWorkspaceProps`

```typescript
export interface ChatWorkspaceProps {
  // Existing props (preserved for 100% backward compatibility)
  messages: ChatMessage[];
  streamingContent: string;
  isGenerating: boolean;
  activeFollowUps: string[];
  onSend: (text: string, attachments?: Attachment[]) => void;
  onStop: () => void;
  onSelectSuggestion: (text: string) => void;
  onOpenSettings?: () => void;

  // Milestone 3 New Capabilities:
  streamError?: Error | null;
  onRetry?: () => void;
  onRegenerate?: (messageId: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: FeedbackRating) => void;
}
```

### 5.1 Auto-Scroll Synchronization
The workspace auto-scroll `useEffect` must monitor:
`[messages, streamingContent, isGenerating, streamError]`
This ensures immediate scroll alignment when:
- A user message is appended
- The TTFT inference indicator mounts
- Tokens stream in progressively
- A stream or message error card renders

---

## 6. Unit Test Specifications (`tests/unit/chat-workspace.test.tsx`)

The test suite validates 7 discrete behavior suites across 15+ assertions:

1. **Suite 1: Idle & Welcome Card Rendering**
   - Renders `WelcomeCard` when `messages` is empty, `isGenerating` is false, `streamingContent` is empty, and `streamError` is null.
   - Hides `WelcomeCard` and renders message items when `messages.length > 0`.
2. **Suite 2: TTFT Active Inference Indicator**
   - When `isGenerating: true` and `streamingContent: ""`, renders `data-testid="active-inference-indicator"`.
   - Contains accessible role `role="status"` and "Thinking..." text.
   - Renders avatar "RD".
   - Does NOT render `active-inference-indicator` when `isGenerating: false`.
   - Unmounts `active-inference-indicator` as soon as `streamingContent` becomes non-empty.
3. **Suite 3: Active Stream Cursor & Content Accumulation**
   - When `streamingContent: "Here is your solution..."`, renders `data-testid="streaming-message"`.
   - Renders `data-testid="stream-cursor"` with `animate-pulse` class.
   - Does NOT render `stream-cursor` when `streamingContent` is empty.
4. **Suite 4: Progressive Markdown Streaming Integration**
   - Verifies that streaming markdown renders headings, bold text, and code blocks.
   - Verifies unclosed code fence during streaming (````python\ndef test():`) is auto-recovered without broken layout.
5. **Suite 5: In-Message Structured Error Card (Active Stream Error)**
   - When `streamError: new Error("Server overloaded")` is provided:
     - Renders `data-testid="in-message-error-card"`.
     - Displays error message "Server overloaded".
     - Displays "Generation Error" badge.
     - Has `role="alert"`.
     - Renders `data-testid="error-retry-button"`.
     - Clicking "Retry" button invokes `onRetry` callback.
   - Does NOT call `window.alert()`.
6. **Suite 6: Message-Level Error Card Rendering**
   - When a message in `messages` has `isError: true`:
     - Renders `data-testid="in-message-error-card"` for that message.
     - Displays `errorDetails` or message content.
     - Clicking Retry invokes `onRetry`.
7. **Suite 7: Action Routing & Composer Integration**
   - Routes `onSend` and `onStop` to `ChatComposer`.
   - Routes `onRegenerate`, `onEditMessage`, `onDeleteMessage`, and `onFeedback` down to message items.

---

## 7. Artifacts Prepared

1. `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_2\proposed_chat-workspace.tsx`:
   - Complete, drop-in replacement component code.
2. `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_2\proposed_chat-workspace.test.tsx`:
   - Complete Vitest test suite ready to be placed at `tests/unit/chat-workspace.test.tsx`.
3. `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_2\handoff.md`:
   - Full 5-component handoff report.
