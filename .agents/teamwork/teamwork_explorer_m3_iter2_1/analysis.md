# Architectural Analysis: Remediation of Cross-Session Stream Contamination

**Milestone**: Milestone 3 Iteration 2  
**Author**: `teamwork_explorer_m3_iter2_1`  
**Working Directory**: `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_iter2_1\`  
**Target Files**:
- `src/lib/types/chat.ts`
- `src/features/chat/hooks/use-chat-stream.ts`
- `src/app/page.tsx`
- `tests/unit/use-chat-stream.test.ts`
- `tests/unit/challenger-m3-workspace-lifecycle.test.tsx`

---

## 1. Executive Summary & Defect Statement

In Milestone 3 Gate Iteration 1, adversarial testing by Challenger 2 (`teamwork_challenger_m3_2`) identified a critical race condition bug during chat navigation:
When `newChat()` is triggered while an assistant message is actively streaming tokens, the partial tokens from the aborted stream leak into the newly initialized session, creating a ghost conversation containing only the aborted assistant message and rendering it on the clean workspace.

Empirical verification confirms this defect in:
`tests/unit/challenger-m3-workspace-lifecycle.test.tsx:425`
```
FAIL tests/unit/challenger-m3-workspace-lifecycle.test.tsx > 2. Cross-Session Stream Contamination & Navigation Abort > immediately aborts active stream and leaves newChat completely clean with 0 messages
AssertionError: expected <div …(1)></div> to be null
- Expected: null
+ Received: <div class="prose prose-invert ...">Quantum mechanics </div>
```

All other 342 unit tests across 22 test suites are passing cleanly. This analysis formulates a clean, two-tier defense-in-depth architectural remediation that completely eliminates cross-session contamination without regressing Feature 18 ("Partial Content Preservation").

---

## 2. Empirical Root Cause Analysis

### 2.1 Timeline of the Asynchronous Race Condition

The defect is caused by an interleaving race between synchronous navigation state resets and asynchronous stream abort completion:

```
[Time T0] Active Stream:
  - User submits "Tell me about quantum computing".
  - handleSend -> appendUserMessage -> messagesRef.current = [UserMsg].
  - send([UserMsg]) -> isGenerating = true; HTTP fetch starts.
  - Chunks arrive: accumulated = "Quantum mechanics ".
  - streamingContent = "Quantum mechanics ".

[Time T1] User Navigation Event (New Chat clicked in Topbar / Sidebar / Ctrl+Shift+N):
  - handleNewChat() executes synchronously:
      if (isGenerating) stop();
      newChat();
  - Step 1a: stop() invokes abortControllerRef.current.abort().
             isGeneratingRef.current = false;
             setIsGenerating(false);
             setStreamingContent("");
  - Step 1b: newChat() executes synchronously:
             setActiveConvId(null);
             activeConvRef.current = null;
             setMessages([]);
             messagesRef.current = [];
             setActiveFollowUps([]);

[Time T2] Asynchronous Abort Rejection in useChatStream:
  - reader.read() or fetch promise in useChatStream rejects with DOMException("AbortError").
  - The catch (err) block executes:
      if (isAbort) {
        if (accumulated.trim().length > 0) {
          const assistantMsg = { id: generateMessageId(), role: "assistant", content: accumulated, ... };
          onStreamComplete(assistantMsg); // <-- UNCONDITIONAL PRESERVATION DISPATCH
        }
        ...
      }

[Time T3] Orphaned Completion Handling in page.tsx:
  - handleStreamComplete receives assistantMsg ("Quantum mechanics ").
  - Calls: appendAssistantMessage(assistantMsg, messagesRef.current, tone, language);
  - CRITICAL FLAW: Because of Step 1b, messagesRef.current is now []!
  - appendAssistantMessage receives currentMessages = [].
  - It constructs: finalMessages = [...[], assistantMsg] = [assistantMsg].
  - Because activeConvRef.current is null, it calls generateConversationId() and creates a brand new conversation in storage containing ONLY the aborted assistant message!
  - Calls setMessages([assistantMsg]), replacing the clean empty workspace with the aborted tokens!
```

### 2.2 Core Architectural Invariant Violations

1. **Unilateral Abort Semantic**:
   `use-chat-stream.ts` currently has only one semantic for `stop()`: pause and preserve accumulated tokens.
   However, there are two distinct system use-cases:
   - **In-Session Stop (Composer Stop Button)**: The user wants to halt generation early and retain what was written so far (Feature 18: Partial Content Preservation).
   - **Cross-Session Navigation / Abandonment (New Chat, Switch Conversation, Message Deletion, Prompt Edit, Regeneration)**: The user is abandoning the in-flight inference. Emitting and preserving these aborted tokens into whatever session becomes active is a semantic defect.

2. **Decoupled Lifecycle & Stale Session Reference**:
   `handleStreamComplete` in `page.tsx` blindly accepts completion payloads and appends them to `messagesRef.current` even when `messagesRef.current` has length 0 (an empty new chat). In a standard conversational LLM application, an assistant message can never exist without an initiating user message in the session.

---

## 3. Solution Alternatives Evaluation

| Approach | Mechanics | Pros | Cons | Verdict |
|---|---|---|---|---|
| **Alternative 1: Unconditional Drop on Abort** | Never call `onStreamComplete` in `catch (isAbort)`. | Fixes cross-session leak. | Regresses Feature 18 ("Partial Content Preservation") and breaks `tests/unit/use-chat-stream.test.ts:240`. | ❌ Rejected |
| **Alternative 2: Discard Flag on `stop(discardPartial?: boolean)`** | Allow caller to indicate if partial tokens should be discarded (`stop(true)`). | Intent-aware; preserves Feature 18 on composer stop; cleanly drops on navigation. | Relies solely on caller discipline. | ⚠️ Incomplete alone |
| **Alternative 3: Session ID Scoping Only in `page.tsx`** | Track `streamConvIdRef` and reject completion if `activeConvId !== streamConvIdRef`. | Guards in `page.tsx`. | In a brand new chat before first save, `activeConvId` is `null` both before and after `newChat()`, so ID alone doesn't differentiate an unsaved initial turn from an empty reset. | ⚠️ Insufficient alone |
| **Alternative 4: Two-Tier Defense-in-Depth (Tier 1 + Tier 2)** | 1. `stop(discardPartial?: boolean)` in `useChatStream` drops tokens at the source when navigation occurs.<br>2. Structural invariant guard in `page.tsx` (`messagesRef.current.length === 0`) prevents orphaned completions.<br>3. `controller.signal.aborted` checked before clean EOF completion. | Zero leaks; preserves Feature 18; immune to timing races; self-healing. | None. Minimal, targeted changes across 3 files. | ✅ **Recommended** |

---

## 4. Concrete Implementation Specification

### 4.1 Interface Update: `src/lib/types/chat.ts`

Update `UseChatStreamReturn` to support the optional `discardPartial` argument:

```typescript
export interface UseChatStreamReturn {
  isGenerating: boolean;
  streamingContent: string;
  streamError: Error | null;
  send: (messages: ChatMessage[], modelId?: string) => Promise<void>;
  stop: (discardPartial?: boolean) => void;
  retryLast: () => Promise<void>;
}
```

### 4.2 Stream Hook Remediation: `src/features/chat/hooks/use-chat-stream.ts`

1. **Add `discardPartialRef`**:
   ```typescript
   const discardPartialRef = useRef(false);
   ```

2. **Update `stop`**:
   ```typescript
   const stop = useCallback((discardPartial = false) => {
     if (discardPartial) {
       discardPartialRef.current = true;
     }
     if (abortControllerRef.current) {
       abortControllerRef.current.abort();
       abortControllerRef.current = null;
     }
     isGeneratingRef.current = false;
     setIsGenerating(false);
     setStreamingContent("");
   }, []);
   ```

3. **Update `send`**:
   - Reset flag on initiation: `discardPartialRef.current = false;`
   - Prevent clean EOF emission if aborted/discarded during stream wrap-up:
     ```typescript
     if (controller.signal.aborted || discardPartialRef.current) {
       setStreamingContent("");
       isGeneratingRef.current = false;
       setIsGenerating(false);
       abortControllerRef.current = null;
       return;
     }
     ```
   - Respect discard flag in `catch (isAbort)`:
     ```typescript
     const isAbort =
       controller.signal.aborted ||
       (typeof DOMException !== "undefined" && err instanceof DOMException && err.name === "AbortError") ||
       (err instanceof Error && (err.name === "AbortError" || err.message.toLowerCase().includes("aborted")));

     if (isAbort) {
       const shouldDiscard = discardPartialRef.current;
       discardPartialRef.current = false;

       // Preserve accumulated tokens only if NOT explicitly discarded
       if (!shouldDiscard && accumulated.trim().length > 0) {
         const assistantMsg: ChatMessage = {
           id: generateMessageId(),
           role: "assistant",
           content: accumulated,
           createdAt: Date.now(),
         };
         onStreamComplete(assistantMsg);
       }
       setStreamingContent("");
       isGeneratingRef.current = false;
       setIsGenerating(false);
       setStreamError(null);
       abortControllerRef.current = null;
       return;
     }
     ```

### 4.3 Workspace & Navigation Wiring: `src/app/page.tsx`

1. **Defensive Invariant Guard in `handleStreamComplete`**:
   ```typescript
   const handleStreamComplete = useCallback(
     (assistantMsg: ChatMessage) => {
       // Guard against orphaned completions when session was reset or cleared
       if (messagesRef.current.length === 0) {
         return;
       }
       appendAssistantMessage(assistantMsg, messagesRef.current, tone, language);
     },
     [appendAssistantMessage, tone, language]
   );
   ```

2. **Discard on `handleNewChat`**:
   ```typescript
   const handleNewChat = useCallback(() => {
     if (isGenerating) stop(true);
     newChat();
   }, [isGenerating, stop, newChat]);
   ```

3. **Discard on `handleSelectConversation`**:
   ```typescript
   const handleSelectConversation = useCallback(
     (id: string) => {
       if (isGenerating) stop(true);
       selectConversation(id);
       setHistoryOpen(false);
     },
     [isGenerating, stop, selectConversation]
   );
   ```

4. **Discard on Mid-Stream Actions (`handleRegenerate`, `handleEditUserMessage`, `handleDeleteMessage`)**:
   ```typescript
   if (isGenerating) {
     stop(true);
   }
   ```

5. **Composer Stop Button (`onStop={stop}`)**:
   Remains unchanged in `ChatWorkspace` (`onStop={stop}`). Calling `stop()` with default parameter `discardPartial = false` ensures that clicking the Stop button in `ChatComposer` continues to preserve partial tokens in the active conversation as designed by Feature 18.

---

## 5. Machine-Applicable Diff Patches

### 5.1 Patch for `src/lib/types/chat.ts`
```diff
--- a/src/lib/types/chat.ts
+++ b/src/lib/types/chat.ts
@@ -98,7 +98,7 @@ export interface UseChatStreamReturn {
   streamingContent: string;
   streamError: Error | null;
   send: (messages: ChatMessage[], modelId?: string) => Promise<void>;
-  stop: () => void;
+  stop: (discardPartial?: boolean) => void;
   retryLast: () => Promise<void>;
 }
```

### 5.2 Patch for `src/features/chat/hooks/use-chat-stream.ts`
```diff
--- a/src/features/chat/hooks/use-chat-stream.ts
+++ b/src/features/chat/hooks/use-chat-stream.ts
@@ -26,10 +26,14 @@ export function useChatStream({
   const isGeneratingRef = useRef(false);
   const lastMessagesRef = useRef<ChatMessage[] | null>(null);
   const lastModelIdRef = useRef<string | undefined>(undefined);
+  const discardPartialRef = useRef(false);
 
-  const stop = useCallback(() => {
+  const stop = useCallback((discardPartial = false) => {
+    if (discardPartial) {
+      discardPartialRef.current = true;
+    }
     if (abortControllerRef.current) {
       abortControllerRef.current.abort();
       abortControllerRef.current = null;
     }
     isGeneratingRef.current = false;
@@ -47,6 +51,7 @@ export function useChatStream({
       isGeneratingRef.current = true;
       setIsGenerating(true);
       setStreamingContent("");
       setStreamError(null);
+      discardPartialRef.current = false;
 
       const controller = new AbortController();
       abortControllerRef.current = controller;
@@ -137,6 +142,14 @@ export function useChatStream({
           buffer = "";
         }
 
+        if (controller.signal.aborted || discardPartialRef.current) {
+          setStreamingContent("");
+          isGeneratingRef.current = false;
+          setIsGenerating(false);
+          abortControllerRef.current = null;
+          return;
+        }
+
         const assistantMsg: ChatMessage = {
           id: generateMessageId(),
           role: "assistant",
@@ -151,11 +164,15 @@ export function useChatStream({
         onStreamComplete(assistantMsg);
       } catch (err: unknown) {
         const isAbort =
+          controller.signal.aborted ||
           (typeof DOMException !== "undefined" && err instanceof DOMException && err.name === "AbortError") ||
           (err instanceof Error && (err.name === "AbortError" || err.message.toLowerCase().includes("aborted")));
 
         if (isAbort) {
-          // Preserve accumulated tokens if any were generated before abort
-          if (accumulated.trim().length > 0) {
+          const shouldDiscard = discardPartialRef.current;
+          discardPartialRef.current = false;
+
+          // Preserve accumulated tokens if any were generated before abort and not discarded
+          if (!shouldDiscard && accumulated.trim().length > 0) {
             const assistantMsg: ChatMessage = {
               id: generateMessageId(),
               role: "assistant",
```

### 5.3 Patch for `src/app/page.tsx`
```diff
--- a/src/app/page.tsx
+++ b/src/app/page.tsx
@@ -64,6 +64,10 @@ export default function RadianceApp() {
 
   const handleStreamComplete = useCallback(
     (assistantMsg: ChatMessage) => {
+      // Guard against orphaned completions when session was reset or cleared
+      if (messagesRef.current.length === 0) {
+        return;
+      }
       appendAssistantMessage(assistantMsg, messagesRef.current, tone, language);
     },
     [appendAssistantMessage, tone, language]
@@ -101,13 +105,13 @@ export default function RadianceApp() {
 
   // Safe Conversation Navigation (prevents cross-session stream contamination)
   const handleNewChat = useCallback(() => {
-    if (isGenerating) stop();
+    if (isGenerating) stop(true);
     newChat();
   }, [isGenerating, stop, newChat]);
 
   const handleSelectConversation = useCallback(
     (id: string) => {
-      if (isGenerating) stop();
+      if (isGenerating) stop(true);
       selectConversation(id);
       setHistoryOpen(false);
     },
@@ -150,7 +154,7 @@ export default function RadianceApp() {
   const handleRegenerate = useCallback(
     async (messageId: string) => {
       if (isGenerating) {
-        stop();
+        stop(true);
       }
 
       const current = messagesRef.current;
@@ -192,7 +196,7 @@ export default function RadianceApp() {
     async (messageId: string, newContent: string) => {
       if (!newContent.trim()) return;
       if (isGenerating) {
-        stop();
+        stop(true);
       }
 
       const truncatedMessages = await editUserMessage(messageId, newContent);
@@ -206,7 +210,7 @@ export default function RadianceApp() {
   const handleDeleteMessage = useCallback(
     async (messageId: string) => {
       if (isGenerating) {
-        stop();
+        stop(true);
       }
       await deleteMessage(messageId);
     },
```

---

## 6. Unit Test Specification & Regression Verification Plan

### 6.1 Target Test Assertion
The target test is in `tests/unit/challenger-m3-workspace-lifecycle.test.tsx` (describe block 2, lines 361–427):
- **Scenario**: Send a prompt, wait for stream to emit "Quantum mechanics ", click "New Chat" mid-stream.
- **Verification Assertions**:
  1. `expect(fetchSignal?.aborted).toBe(true)`
  2. `expect(screen.queryByTestId("streaming-message")).toBeNull()`
  3. `expect(screen.queryByTestId("active-inference-indicator")).toBeNull()`
  4. `expect(screen.queryByText(/Quantum mechanics/i)).toBeNull()`
- With this fix applied, all 4 assertions pass without leaking tokens into the active view.

### 6.2 Unit Test Extension for `tests/unit/use-chat-stream.test.ts`
We recommend appending a dedicated unit test in `describe("2. Immediate Stop & Abort Lifecycle with Partial Preservation")`:

```typescript
it("discards accumulated partial tokens without calling onStreamComplete when stop(true) is invoked", async () => {
  const onStreamComplete = vi.fn();
  const chunks = [
    '0:"Token 1 "\n',
    '0:"Token 2 "\n',
    '0:"Token 3 "\n',
  ];

  const { stream, abort } = createDelayedStream(chunks, 30);

  global.fetch = vi.fn().mockImplementation((_url, options) => {
    options.signal?.addEventListener("abort", () => {
      abort();
    });
    return Promise.resolve({
      ok: true,
      status: 200,
      body: stream,
    });
  });

  const { result } = renderHook(() =>
    useChatStream({
      modelId: "groq-llama-3.3-70b",
      tone: "default",
      language: "en",
      onStreamComplete,
    })
  );

  act(() => {
    result.current.send([sampleUserMessage]);
  });

  await act(async () => {
    await new Promise((r) => setTimeout(r, 45));
  });

  // Explicit discard stop (navigation)
  act(() => {
    result.current.stop(true);
  });

  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });

  expect(result.current.isGenerating).toBe(false);
  expect(result.current.streamingContent).toBe("");
  expect(onStreamComplete).not.toHaveBeenCalled();
});
```

### 6.3 Regression Verification Matrix

| Suite | Focus | Pre-Fix Status | Expected Post-Fix Status |
|---|---|---|---|
| `challenger-m3-workspace-lifecycle.test.tsx` | Workspace lifecycle, TTFT & session contamination | 11 passed, 1 failed | **12 passed, 0 failed** |
| `use-chat-stream.test.ts` | Line buffering, stop & abort partial preservation, errors | 15 passed, 0 failed | **16 passed, 0 failed** |
| `use-chat-session.test.ts` | CRUD, message deletion, prompt editing, feedback, storage | 21 passed, 0 failed | **21 passed, 0 failed** |
| `chat-composer.test.tsx` | Composer inputs, IME safety, stop button | 15 passed, 0 failed | **15 passed, 0 failed** |
| `chat-workspace.test.tsx` | Indicators, message list rendering, errors | 16 passed, 0 failed | **16 passed, 0 failed** |
| Full Vitest suite (`cmd /c npm test`) | 23 test suites, 343 tests | 22 passed, 1 failed | **23 passed, 0 failed (100%)** |
