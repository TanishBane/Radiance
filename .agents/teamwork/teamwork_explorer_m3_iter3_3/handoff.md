# Explorer Investigation Report: Test Suite Coverage & Verification Strategy

**Author**: `teamwork_explorer_m3_iter3_3`  
**Role**: Explorer / Test Architecture Specialist  
**Recipient**: Orchestrator (`9a255721-46e0-4eb1-9e8d-5fd5e5a29b04`), Worker, Reviewers  
**Target Milestone**: Milestone 3 Iteration 3  
**Working Directory**: `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_iter3_3\`  
**Date**: 2026-11-01  

---

## 1. Observation

### 1.1 Empirical Challenge Test Failure (`tests/unit/challenger-m3-stop-token-retention.test.tsx`)
We executed the empirical test authored by Challenger in Iteration 2:
- **Command**: `cmd /c npx vitest run tests/unit/challenger-m3-stop-token-retention.test.tsx`
- **Exit Code**: 1
- **Verbatim Error**:
  ```text
  FAIL tests/unit/challenger-m3-stop-token-retention.test.tsx > Empirical Challenge: Composer Stop Button Retains Partial Tokens (Feature 18) > retains partial tokens when user clicks stop button in composer
  AssertionError: expected null not to be null
   ❯ tests/unit/challenger-m3-stop-token-retention.test.tsx:145:34
      143| // Partial tokens MUST be retained as a committed message in workspace (Feature 18)
      144| const assistantMessage = screen.queryByText(/Once upon a time in a faraway kingdom/i);
      145| expect(assistantMessage).not.toBeNull();
         | ^
      146| 
      147| // In storage, conversation must have 2 messages: user prompt and partial assistant response
  ```

### 1.2 Call-Stack & Implementation Trace
Inspecting the call hierarchy from UI click to stream cancellation:

1. **`src/components/chat/chat-composer.tsx` (Lines 237–247)**:
   ```tsx
   {isGenerating ? (
     <button
       type="button"
       onClick={onStop}
       aria-label="Stop response generation"
       data-testid="stop-button"
       className="p-2.5 rounded-xl bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90 transition-all shadow-[0_0_15px_rgba(232,85,85,0.3)] shrink-0"
       title="Stop response generation"
     >
       <Square className="w-4 h-4 fill-white" />
     </button>
   ) : ...}
   ```
   Directly attaching `onClick={onStop}` causes React's synthetic event dispatcher to invoke `onStop(event)` with a `React.MouseEvent` / `SyntheticEvent` object as the first parameter.

2. **`src/features/chat/components/chat-workspace.tsx` (Lines 231–235)**:
   ```tsx
   <ChatComposer
     onSend={onSend}
     onStop={onStop}
     isGenerating={isGenerating}
   />
   ```
   `ChatWorkspace` receives `onStop` from parent and forwards it transparently to `ChatComposer`.

3. **`src/app/page.tsx` (Lines 270–276)**:
   ```tsx
   <ChatWorkspace
     ...
     onSend={handleSend}
     onStop={stop}
     ...
   />
   ```
   `stop` from `useChatStream` is passed directly as the `onStop` callback prop.

4. **`src/features/chat/hooks/use-chat-stream.ts` (Lines 31–34)**:
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
   When invoked via click handler, `discardPartial` receives the `MouseEvent` object. In JavaScript, `Boolean(event) === true`. Consequently, `if (discardPartial)` evaluates to `true`, and `discardPartialRef.current` is set to `true`.

5. **`src/features/chat/hooks/use-chat-stream.ts` (Lines 172–184)**:
   ```typescript
   if (isAbort) {
     const shouldDiscard = discardPartialRef.current;
     discardPartialRef.current = false;

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
     ...
   ```
   Because `shouldDiscard` was set to `true`, the condition `!shouldDiscard` fails! `onStreamComplete(assistantMsg)` is completely bypassed, and all accumulated tokens are discarded instead of being saved as an assistant message.

### 1.3 Audit of Existing Tests & Identification of Test Gaps

We examined the four unit test suites:

#### 1. `tests/unit/chat-composer.test.tsx` (Lines 170–177)
```tsx
it("invokes onStop when Stop button is clicked", () => {
  render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={true} />);

  const stopButton = screen.getByTestId("stop-button");
  fireEvent.click(stopButton);

  expect(onStop).toHaveBeenCalledTimes(1);
});
```
- **Observed Gap**: The test only checks `expect(onStop).toHaveBeenCalledTimes(1)`. It does NOT assert what arguments `onStop` was called with!
- In JavaScript, `fireEvent.click` invokes `onStop` with a DOM event object. Because the test lacked `expect(onStop).toHaveBeenCalledWith()`, this test passed with flying colors even though the component leaked the DOM event into a callback expecting `() => void`.

#### 2. `tests/unit/use-chat-stream.test.ts` (Lines 283–286)
```typescript
// User clicks stop
act(() => {
  result.current.stop();
});
```
- **Observed Gap**: `use-chat-stream.test.ts` contains only programmatic calls to `result.current.stop()`, all passed with ZERO arguments.
- Under zero arguments, `discardPartial = false` applies its default parameter, so `if (discardPartial)` was `false`.
- Crucially, `use-chat-stream.test.ts` contains:
  - ZERO tests for `stop(true)` (verifying that partial tokens ARE discarded when requested, e.g., on conversation navigation).
  - ZERO tests for `stop(false)` explicitly.
  - ZERO tests for calling `stop()` with non-boolean values (e.g. simulated event `{ type: "click" }`), which exposed the hook to loose truthy coercion.

#### 3. `tests/unit/challenger-m3-workspace-lifecycle.test.tsx` (12 tests)
- **Status**: All 12 tests pass cleanly (`cmd /c npx vitest run tests/unit/challenger-m3-workspace-lifecycle.test.tsx` -> exit code 0).
- **Observed Gap**: Section 2 tests navigation aborts (`newChat()`, `selectConversation()`, TTFT shortcut aborts). Section 3 tests mid-stream user actions (Regenerate, Edit Prompt, Delete Message).
- It did NOT contain an in-suite lifecycle test for clicking the Composer Stop button, nor did it test deleting conversations via HistoryDrawer during active streaming (Reviewer Finding 2).

#### 4. Baseline Project Health
- `cmd /c npm run typecheck`: Exit code 0 (0 TypeScript errors).
- `cmd /c npm run lint`: Exit code 0 (0 ESLint errors/warnings).
- Full suite: 22 test suites pass; 1 deterministic failure (`challenger-m3-stop-token-retention.test.tsx`); 1 intermittent timing flake in `challenger-m3-ui-actions-blob.test.tsx` line 336 (`expect(duration).toBeLessThan(150)` failed when duration reached 157ms under 24 parallel worker threads; passed in 1.2s when run individually).

---

## 2. Logic Chain

1. **Premise 1 (Feature 18 Specification)**:
   `PROJECT.md` Feature 18 ("Partial Content Preservation") and `ORIGINAL_REQUEST.md` R3 require that stopping inference via the composer Stop button halts streaming immediately and preserves accumulated partial tokens as a committed assistant message.
2. **Premise 2 (Loose Truthiness Check in Hook)**:
   In `use-chat-stream.ts:32`, `if (discardPartial)` checks the truthiness of whatever argument is passed.
3. **Premise 3 (Event Leakage via Composer)**:
   In `chat-composer.tsx:240`, `<button onClick={onStop}>` passes React's `SyntheticEvent` directly to `onStop`.
4. **Premise 4 (Implicit Coercion Failure)**:
   Because `typeof event === "object"` and `Boolean(event) === true`, `discardPartialRef.current` is set to `true`. When the request aborts, the abort handler discards all tokens.
5. **Premise 5 (Test Suite Masking)**:
   `use-chat-stream.test.ts` tested `stop()` with no arguments, while `chat-composer.test.tsx` only asserted `toHaveBeenCalledTimes(1)`. Neither test asserted the contract boundaries (argument values and strict boolean typing).
6. **Conclusion**:
   Remediation requires a defense-in-depth fix across the hook, component, and page wiring, paired with strict assertion tests in both unit test suites and lifecycle integration suites.

---

## 3. Caveats

- **Scope Discipline**: As an Explorer, we have NOT edited any application source code files (`use-chat-stream.ts`, `chat-composer.tsx`, `page.tsx`). Implementation is strictly reserved for the Worker agent.
- **Timing Flake in Challenger Blob Test**: In `tests/unit/challenger-m3-ui-actions-blob.test.tsx`, line 336 asserts `expect(duration).toBeLessThan(150)`. During full 24-suite parallel execution, high CPU load caused JSDOM blob processing to take 157ms, causing an intermittent failure. Running this file in isolation passes in <15ms. The worker/reviewer should note this if observing a failure during `npm test` under heavy parallel load.
- **Drawer Conversation Deletion (Reviewer Finding 2)**: In `src/app/page.tsx:296-297`, `deleteConversation` and `deleteAllConversations` are passed to `HistoryDrawer` without checking `if (isGenerating) stop(true)`. While the empty-session guard prevents token resurrection, actively running HTTP fetch streams continue until completion if not explicitly aborted.

---

## 4. Conclusion & Test Plan Blueprint

### 4.1 Required Code Remediation (For Worker)

The worker must implement a 4-tier defense-in-depth fix:

#### Tier 1: Hook-Level Strict Type Enforcement (`src/features/chat/hooks/use-chat-stream.ts`)
Change line 32 from loose truthiness to strict boolean equality:
```typescript
// BEFORE:
const stop = useCallback((discardPartial = false) => {
  if (discardPartial) {
    discardPartialRef.current = true;
  }
...

// AFTER:
const stop = useCallback((discardPartial: boolean | unknown = false) => {
  if (discardPartial === true) {
    discardPartialRef.current = true;
  }
...
```

#### Tier 2: Component-Level Event Isolation (`src/components/chat/chat-composer.tsx`)
Change line 240 to invoke `onStop` as an argument-less arrow function:
```tsx
// BEFORE:
<button
  type="button"
  onClick={onStop}
  ...
>

// AFTER:
<button
  type="button"
  onClick={() => onStop()}
  ...
>
```

#### Tier 3: Page-Level Explicit Signature (`src/app/page.tsx`)
Change line 276 to pass an explicit callback:
```tsx
// BEFORE:
<ChatWorkspace
  ...
  onStop={stop}
  ...
/>

// AFTER:
<ChatWorkspace
  ...
  onStop={() => stop(false)}
  ...
/>
```

#### Tier 4: Drawer Deletion Stream Cancellation (`src/app/page.tsx`)
Wrap drawer deletion callbacks to halt active inference immediately:
```typescript
const handleDeleteConversation = useCallback(
  async (id: string) => {
    if (isGenerating && activeConvId === id) stop(true);
    await deleteConversation(id);
  },
  [isGenerating, activeConvId, stop, deleteConversation]
);

const handleDeleteAllConversations = useCallback(
  async () => {
    if (isGenerating) stop(true);
    await deleteAllConversations();
  },
  [isGenerating, stop, deleteAllConversations]
);
```
Pass `handleDeleteConversation` and `handleDeleteAllConversations` to `HistoryDrawer`.

---

### 4.2 Exact Test Plan for Worker & Reviewers

#### Plan Item 1: Update `tests/unit/chat-composer.test.tsx`
In `describe("4. Stop Button Toggle During Active Generation")`, update the click test:
```tsx
it("invokes onStop with zero arguments when Stop button is clicked", () => {
  render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={true} />);

  const stopButton = screen.getByTestId("stop-button");
  fireEvent.click(stopButton);

  expect(onStop).toHaveBeenCalledTimes(1);
  // Verify strict zero-argument contract (no DOM event leak)
  expect(onStop).toHaveBeenCalledWith();
});
```

#### Plan Item 2: Add New Parameterized Tests to `tests/unit/use-chat-stream.test.ts`
In `describe("2. Immediate Stop & Abort Lifecycle with Partial Preservation")`, add 3 new targeted specifications:
```typescript
it("discards accumulated partial tokens when stop(true) is explicitly invoked", async () => {
  const onStreamComplete = vi.fn();
  const chunks = ['0:"Token 1 "\n', '0:"Token 2 "\n'];
  const { stream, abort } = createDelayedStream(chunks, 30);

  global.fetch = vi.fn().mockImplementation((_url, options) => {
    options.signal?.addEventListener("abort", () => abort());
    return Promise.resolve({ ok: true, status: 200, body: stream });
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

  // Explicit discardPartial = true
  act(() => {
    result.current.stop(true);
  });

  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });

  expect(result.current.isGenerating).toBe(false);
  expect(result.current.streamingContent).toBe("");
  // onStreamComplete MUST NOT be called when discardPartial is true
  expect(onStreamComplete).not.toHaveBeenCalled();
});

it("preserves accumulated partial tokens when stop(false) is explicitly invoked", async () => {
  const onStreamComplete = vi.fn();
  const chunks = ['0:"Token 1 "\n', '0:"Token 2 "\n'];
  const { stream, abort } = createDelayedStream(chunks, 30);

  global.fetch = vi.fn().mockImplementation((_url, options) => {
    options.signal?.addEventListener("abort", () => abort());
    return Promise.resolve({ ok: true, status: 200, body: stream });
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

  // Explicit discardPartial = false
  act(() => {
    result.current.stop(false);
  });

  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });

  expect(onStreamComplete).toHaveBeenCalledTimes(1);
  expect(onStreamComplete.mock.calls[0][0].content).toContain("Token 1");
});

it("preserves accumulated partial tokens when stop is passed a truthy non-boolean object", async () => {
  const onStreamComplete = vi.fn();
  const chunks = ['0:"Token 1 "\n', '0:"Token 2 "\n'];
  const { stream, abort } = createDelayedStream(chunks, 30);

  global.fetch = vi.fn().mockImplementation((_url, options) => {
    options.signal?.addEventListener("abort", () => abort());
    return Promise.resolve({ ok: true, status: 200, body: stream });
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

  // Simulate accidental DOM event pass: { type: "click" }
  act(() => {
    (result.current.stop as any)({ type: "click", preventDefault: () => {} });
  });

  await act(async () => {
    await new Promise((r) => setTimeout(r, 20));
  });

  // Hook must strictly verify discardPartial === true, preserving tokens despite truthy object
  expect(onStreamComplete).toHaveBeenCalledTimes(1);
  expect(onStreamComplete.mock.calls[0][0].content).toContain("Token 1");
});
```

#### Plan Item 3: Validate `tests/unit/challenger-m3-stop-token-retention.test.tsx`
Verify that running:
```powershell
cmd /c npx vitest run tests/unit/challenger-m3-stop-token-retention.test.tsx
```
transitions from FAILING to PASSING (1 test passed).

#### Plan Item 4: Add Drawer Deletion Mid-Stream Test in `tests/unit/challenger-m3-workspace-lifecycle.test.tsx`
Add a test in `describe("2. Cross-Session Stream Contamination & Navigation Abort")`:
- Start an active stream with partial tokens.
- Open HistoryDrawer and click Delete on the active conversation.
- Verify fetch request is aborted immediately with `stop(true)`.
- Verify new active chat starts clean with zero ghost messages.

---

## 5. Verification Method

To independently verify the test plan and solution:

1. **Verify Stop-Token Retention (Previously Failing)**:
   ```powershell
   cmd /c npx vitest run tests/unit/challenger-m3-stop-token-retention.test.tsx
   ```
   **Expected**: Exit code 0, 1 passed (1).

2. **Verify Updated Composer Stop Argument Contract**:
   ```powershell
   cmd /c npx vitest run tests/unit/chat-composer.test.tsx
   ```
   **Expected**: Exit code 0, all tests passed.

3. **Verify Updated Stream Hook Stop Parameters (`stop(true)` vs `stop(false)` vs truthy event)**:
   ```powershell
   cmd /c npx vitest run tests/unit/use-chat-stream.test.ts
   ```
   **Expected**: Exit code 0, 18 tests passed (15 existing + 3 new).

4. **Verify Workspace Lifecycle Invariants**:
   ```powershell
   cmd /c npx vitest run tests/unit/challenger-m3-workspace-lifecycle.test.tsx
   ```
   **Expected**: Exit code 0, all tests passed.

5. **Typecheck & Linter Integrity**:
   ```powershell
   cmd /c npm run typecheck
   cmd /c npm run lint
   ```
   **Expected**: Exit code 0 for both commands.

6. **Full Test Matrix**:
   ```powershell
   cmd /c npm test
   ```
   **Expected**: All 24 test suites pass, 347+ tests pass.
