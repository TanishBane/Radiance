# Technical Analysis — Milestone 2 Part C: Composer Controls, Deduplication & Test Architecture

## 1. Executive Summary
Milestone 2 enhances the streaming lifecycle, message state persistence, and interactive user controls of the Radiance AI platform. Part C focuses specifically on:
1. **Interactive Stop Button**: Displaying an accessible, dedicated Stop button (`Square` icon, `aria-label`, test identifier) while `isGenerating === true` that halts stream inference immediately via `onStop()`.
2. **Synchronous Submission Deduplication (`isSubmittingRef`)**: Preventing duplicate messages and parallel network requests when users rapidly double-click the Send button or double-press Enter before React state changes re-render the component.
3. **CJK IME Composition Guard**: Checking `e.nativeEvent.isComposing` and `e.keyCode === 229` in `handleKeyDown` to prevent premature message submission when non-Latin IME users (Japanese, Chinese, Korean) press `Enter` to confirm candidate character conversions.
4. **Vitest Architecture & Unit Test Design**: Updating `vitest.config.ts` from `*.test.ts` to `*.test.{ts,tsx}` to enable React component testing, and designing comprehensive unit test suites for `tests/unit/chat-composer.test.tsx`, `tests/unit/use-chat-stream.test.ts`, and `tests/unit/use-chat-session.test.ts`.

---

## 2. Codebase Investigation Findings

### 2.1 Current `ChatComposer` Implementation (`src/components/chat/chat-composer.tsx`)
Direct inspection of `src/components/chat/chat-composer.tsx` revealed the following:
- **Stop Button (Lines 214–233)**:
  - While `isGenerating` is true, a Stop button is rendered with `<Square className="w-4 h-4 fill-white" />` and `title="Stop response generation"`.
  - **Defect/Gap**: It lacks an explicit `aria-label="Stop response generation"` and `data-testid="stop-button"`. Without `aria-label`, accessible name calculation in testing environments and screen readers relies on `title`, which may not be consistently resolved across query selectors like `getByRole("button", { name: /stop/i })`.
- **Submission Logic (Lines 55–70)**:
  ```typescript
  const handleSubmit = () => {
    if ((!input.trim() && attachments.length === 0) || isGenerating || disabled) return;
    onSend(input.trim(), attachments);
    setInput("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  ```
  - **Defect/Gap 1 (Deduplication Race Condition)**:
    - React state updates (`setInput("")`, `setIsGenerating(true)`) are batched asynchronously.
    - If a user rapidly double-clicks Send or taps Enter twice in succession (within ~1–50ms), both events execute `handleSubmit()` while `input.trim()` is still the non-empty string in the component's closure and `isGenerating` is still `false`.
    - Result: `onSend` is invoked twice, resulting in duplicate user messages and competing API requests.
  - **Defect/Gap 2 (IME Composition Accidental Submission)**:
    - In CJK (Chinese, Japanese, Korean) input methods, users type phonetic sequences and press `Enter` to confirm the selected ideograph from an IME candidate list.
    - Currently, `handleKeyDown` does not check `e.nativeEvent.isComposing`.
    - Result: Pressing `Enter` to commit an IME candidate intercepts the event, cancels composition, and immediately fires `handleSubmit()`, sending an incomplete prompt to the AI model.

### 2.2 Vitest Configuration Gap (`vitest.config.ts`)
Line 9 of `vitest.config.ts` currently reads:
```typescript
include: ["tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
```
- **Defect/Gap**: The glob only matches `.test.ts` files!
- Any test written in `.tsx` (such as `tests/unit/chat-composer.test.tsx` or component tests requiring JSX) will be completely ignored by `vitest run`.
- **Solution**: Update the glob pattern to `["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"]`.

### 2.3 Testing Environment Capabilities
- `@testing-library/react` (v16.2.0) is installed.
- `jsdom` (v26.0.0) is configured as the Vitest test environment.
- Exports available and verified: `render`, `screen`, `fireEvent`, `waitFor`, `act`, `renderHook`.
- Type checking passes with `tsc --noEmit` (exit code 0).
- ESLint passes with `next lint` (exit code 0).
- Existing 14 unit test suites (162 tests) pass in 8.05s.

---

## 3. Technical Design Specifications

### 3.1 Stop Button & Accessibility (`chat-composer.tsx`)
- When `isGenerating === true`:
  - Render a button with:
    - `aria-label="Stop response generation"`
    - `title="Stop response generation"`
    - `data-testid="stop-button"`
    - Icon: `<Square className="w-4 h-4 fill-white" />`
    - Class: `p-2.5 rounded-xl bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90 transition-all shadow-[0_0_15px_rgba(232,85,85,0.3)] shrink-0`
    - Handler: `onClick={onStop}`
- When `isGenerating === false`:
  - Render a button with:
    - `aria-label="Send message"`
    - `title="Send message (Enter)"`
    - `data-testid="send-button"`
    - Icon: `<Send className="w-4 h-4" />`
    - Disabled state: `disabled={(!input.trim() && attachments.length === 0) || disabled}`
    - Handler: `onClick={handleSubmit}`

### 3.2 Synchronous Deduplication Guard (`isSubmittingRef`)
- Add a ref to track in-flight synchronous submission:
  ```typescript
  const isSubmittingRef = useRef<boolean>(false);
  ```
- Reset synchronization:
  ```typescript
  useEffect(() => {
    isSubmittingRef.current = false;
  }, [input, isGenerating]);
  ```
- Guard in `handleSubmit`:
  ```typescript
  const handleSubmit = () => {
    if (isSubmittingRef.current) return;
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || isGenerating || disabled) return;

    isSubmittingRef.current = true;
    try {
      onSend(trimmed, attachments);
      setInput("");
      setAttachments([]);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err) {
      isSubmittingRef.current = false;
      throw err;
    }
    // Safety fallback timeout to ensure ref is never locked if React render is skipped
    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 300);
  };
  ```
- **Why this works**:
  1. `isSubmittingRef.current = true` takes effect instantaneously in the current JavaScript thread.
  2. Any rapid second click or Enter keydown in the same frame or before React commits the state update is immediately dropped.
  3. When React completes the re-render with `input = ""`, the `useEffect` resets `isSubmittingRef.current = false`.
  4. At that point, `input` is empty, so `!trimmed` disables the button and prevents submission until the user types again.

### 3.3 CJK IME Composition Check
- Update `handleKeyDown`:
  ```typescript
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    // Prevent premature Enter submission during CJK IME candidate selection
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  ```
- **Rationale**:
  - `e.nativeEvent.isComposing`: Standard W3C UI Events property indicating that text composition session is active.
  - `e.keyCode === 229`: Legacy / mobile / Safari IME keycode standard fallback.
  - While either is true, the Enter key is passed through to the browser's native IME candidate selection rather than triggering chat submission.

### 3.4 Vitest Configuration Update (`vitest.config.ts`)
```typescript
import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: [],
    include: ["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"],
    exclude: ["node_modules", ".next", "legacy", "tests/e2e/**"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

---

## 4. Test Architecture & Test Suite Specifications

### 4.1 `tests/unit/chat-composer.test.tsx`
This test suite validates the composer UI, user interactions, stop toggle, and deduplication guards.

**Test Matrix**:
1. **Rendering**:
   - Renders textarea with placeholder `"Ask RADIANCE anything... (Shift+Enter for newline)"`.
   - Renders Send button with `aria-label="Send message"`.
   - Send button has `disabled` attribute when textarea is empty and attachments are empty.
2. **Text Input & Button Enabling**:
   - Changing textarea value to `"Hello world"` enables the Send button.
   - Clearing the textarea disables the Send button.
3. **Submission via Click**:
   - With text entered, clicking the Send button calls `onSend("Hello world", [])`.
   - Textarea input is cleared after submission.
4. **Submission via Enter Key**:
   - Pressing `Enter` (without Shift) calls `onSend("Hello world", [])` and clears textarea.
   - Pressing `Shift+Enter` does NOT call `onSend` (inserts newline).
5. **IME Composition Guard**:
   - When `isComposing: true`, pressing `Enter` does NOT call `onSend`.
   - When `keyCode: 229`, pressing `Enter` does NOT call `onSend`.
   - When composition ends (`isComposing: false`), pressing `Enter` calls `onSend`.
6. **Stop Button Toggle during Generation**:
   - When `isGenerating: true`:
     - Send button is not rendered.
     - Stop button is rendered with `aria-label="Stop response generation"`.
     - Clicking the Stop button calls `onStop()`.
   - When `isGenerating: false`:
     - Stop button is not rendered.
     - Send button is rendered.
7. **Synchronous Deduplication Guard (`isSubmittingRef`)**:
   - Firing two consecutive click events or two Enter keydown events in rapid succession only invokes `onSend` ONCE.
8. **Disabled State**:
   - When `disabled={true}`, typing text does not enable the Send button, and pressing Enter does not invoke `onSend`.

### 4.2 `tests/unit/use-chat-stream.test.ts`
This test suite validates the streaming hook (`useChatStream`) in isolation.

**Test Matrix**:
1. **Initial State**:
   - `isGenerating` is `false`, `streamingContent` is `""`.
2. **Persistent Line Buffering Across SSE Chunks**:
   - Chunk 1: `0:"Hello `
   - Chunk 2: `world"\n`
   - Verifies that `streamingContent` seamlessly renders `"Hello world"` without missing characters or dropping lines split across chunk boundaries.
3. **Stream Completion Lifecycle**:
   - Emits valid tokens ending with `done: true`.
   - Verifies `onStreamComplete` is called with a complete assistant `ChatMessage` containing the full accumulated text.
   - Verifies `isGenerating` returns to `false`.
4. **Immediate Stop & Partial Content Preservation**:
   - While streaming is active and tokens have been received, invoking `stop()` calls `abortController.abort()`.
   - On `AbortError`, partial accumulated tokens are preserved and committed via `onStreamComplete` with `role: "assistant"`.
   - `isGenerating` is immediately set to `false`.
5. **Error Handling & State**:
   - HTTP 500 or network failure triggers `onError` callback.
   - `streamError` contains the structured `Error`.
   - `isGenerating` is `false`.
6. **`retryLast()` Re-invocation**:
   - Invoking `retryLast()` re-executes `send()` with the prior conversation history.

### 4.3 `tests/unit/use-chat-session.test.ts`
This test suite validates session state operations and persistence.

**Test Matrix**:
1. **Initial Mount & Listing**:
   - Loads stored conversations from `conversationService.list()`.
2. **Collision-Resistant Message IDs**:
   - Rapid sequential calls to `appendUserMessage` generate unique IDs (e.g. `msg_${Date.now()}_${randomSuffix}`).
3. **`deleteMessage(messageId)`**:
   - Appends multiple messages.
   - Invokes `deleteMessage` on a target message.
   - Verifies target message is removed from `messages` array.
   - Verifies `conversationService.save` is called with updated message array.
4. **`editUserMessage(messageId, newContent)`**:
   - Given a message history `[User1, Assistant1, User2, Assistant2]`.
   - Invoking `editUserMessage(User1.id, "New prompt")` updates User1 content and truncates subsequent assistant messages for resubmission.
5. **`setMessageFeedback(messageId, feedback)`**:
   - Appends assistant message.
   - Toggles feedback between `"positive"`, `"negative"`, and `null`.
   - Verifies both state and persistent storage reflect the updated feedback rating.
6. **Conversation Management**:
   - Tests `newChat`, `togglePin`, `deleteConversation`, and `deleteAllConversations`.

---

## 5. Verification Commands
- `npm.cmd test` — Run all Vitest suites (confirming inclusion of `.test.tsx`).
- `npm.cmd run typecheck` — TypeScript verification with zero errors.
- `npm.cmd run lint` — ESLint verification with zero warnings/errors.
