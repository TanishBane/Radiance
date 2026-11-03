# Challenger Handoff Report: Cross-Session Contamination & Feature 18 Token Retention Evaluation

**Author**: `teamwork_challenger`  
**Role**: Critic / Specialist  
**Recipient**: `orchestrator` (`9a255721-46e0-4eb1-9e8d-5fd5e5a29b04`)  
**Target Milestone**: Milestone 3 Iteration 2 (Challenger Review)  
**Working Directory**: `c:\Tanixai-main\.agents\teamwork\teamwork_challenger_m3_iter2\`  
**Verdict**: **REQUEST_CHANGES**  
**Date**: 2026-11-01  

---

## 1. Observation

### 1.1 Criterion 1 & 2: Lifecycle Suite & `newChat()` Mid-Stream Cleanliness
We executed the targeted lifecycle challenger suite:
- **Command**: `cmd /c npx vitest run tests/unit/challenger-m3-workspace-lifecycle.test.tsx`
- **Exit Code**: 0
- **Verbatim Result**:
  ```
  ✓ tests/unit/challenger-m3-workspace-lifecycle.test.tsx (12 tests) 3297ms
    ✓ Milestone 3 Challenger 2: Workspace Lifecycle, TTFT & Session Contamination > 1. TTFT Handoff & State Invariants in ChatWorkspace > maintains streaming stability over 50 rapid sequential token updates 518ms
    ✓ Milestone 3 Challenger 2: Workspace Lifecycle, TTFT & Session Contamination > 2. Cross-Session Stream Contamination & Navigation Abort > immediately aborts active stream and leaves newChat completely clean with 0 messages 738ms
    ✓ Milestone 3 Challenger 2: Workspace Lifecycle, TTFT & Session Contamination > 2. Cross-Session Stream Contamination & Navigation Abort > prevents token leakage when switching conversation while stream is active 393ms

  Test Files  1 passed (1)
       Tests  12 passed (12)
  ```
- **Finding**: Cross-session stream contamination on `newChat()` and conversation switching is confirmed fixed in these isolation harnesses.

---

### 1.2 Criterion 3: Composer `stop()` Partial Token Retention (Feature 18) — REGRESSION FOUND
We authored an empirical challenge test (`tests/unit/challenger-m3-stop-token-retention.test.tsx`) replicating real user interaction: sending a prompt, receiving stream tokens ("Once upon a time in a faraway kingdom"), and clicking the composer Stop button (`data-testid="stop-button"`).

- **Command**: `cmd /c npx vitest run tests/unit/challenger-m3-stop-token-retention.test.tsx`
- **Exit Code**: 1
- **Verbatim Error**:
  ```
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

### 1.3 Code Inspection & Root Cause
Inspecting the implementation across the call stack:

1. **`src/components/chat/chat-composer.tsx` (Lines 237–241)**:
   ```tsx
   {isGenerating ? (
     <button
       type="button"
       onClick={onStop}
       className="p-2 rounded-xl bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90 transition-all shrink-0 animate-in zoom-in-75 duration-200"
       title="Stop response generation"
       data-testid="stop-button"
     >
       <Square className="w-4 h-4 fill-current" />
     </button>
   ) : ...}
   ```
   When the button is clicked, React calls `onClick(event)`, passing a `SyntheticEvent` (or `MouseEvent`) as the first argument to `onStop`.

2. **`src/app/page.tsx` (Line 276)**:
   ```tsx
   <ChatWorkspace
     messages={messages}
     streamingContent={streamingContent}
     isGenerating={isGenerating}
     streamError={streamError}
     activeFollowUps={activeFollowUps}
     onSend={handleSend}
     onStop={stop}
     ...
   ```
   `stop` is passed directly as `onStop`.

3. **`src/features/chat/hooks/use-chat-stream.ts` (Lines 31–34)**:
   ```typescript
   const stop = useCallback((discardPartial = false) => {
     if (discardPartial) {
       discardPartialRef.current = true;
     }
     ...
   ```
   In JavaScript, `if (discardPartial)` evaluates truthiness. When the click event object is passed, `Boolean(event)` evaluates to `true`. Consequently, `discardPartialRef.current` is set to `true`.

4. **`src/features/chat/hooks/use-chat-stream.ts` (Lines 78–89)**:
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
   ```
   Because `shouldDiscard` is `true`, `onStreamComplete(assistantMsg)` is completely bypassed and `accumulated` tokens are lost forever!

---

### 1.4 Criterion 4: Full Test Suite Matrix (`npm test`)
- **Command**: `cmd /c npm test`
- **Exit Code**: 1
- **Verbatim Result**:
  ```
  Test Files  1 failed | 23 passed (24)
       Tests  1 failed | 343 passed (344)
  Duration    16.63s
  Failed Suite: tests/unit/challenger-m3-stop-token-retention.test.tsx
  ```

---

## 2. Logic Chain

1. **Premise 1 (Feature 18 Requirement)**:
   Project Requirement R3 and Feature 18 explicitly require: "Partial Content Preservation: Preserves accumulated tokens on stream abort as a completed assistant message" when the user halts generation via the Stop button in the composer.
2. **Premise 2 (Event Forwarding)**:
   In `src/components/chat/chat-composer.tsx`, line 240 attaches `onClick={onStop}` directly to the `<button>`. Standard DOM and React dispatch invokes `onStop(event)`.
3. **Premise 3 (Loose Truthy Coercion)**:
   In `src/features/chat/hooks/use-chat-stream.ts`, line 32 evaluates `if (discardPartial)`. Since a DOM `MouseEvent` / `SyntheticEvent` is a non-null object, `Boolean(event) === true`.
4. **Premise 4 (Unintended Discard Trigger)**:
   The loose check erroneously sets `discardPartialRef.current = true` whenever the Stop button is clicked by a user.
5. **Deduction & Impact**:
   Feature 18 is broken in the real application UI. Whenever a user clicks "Stop generation", all tokens streamed so far are discarded rather than saved as a completed assistant turn.

---

## 3. Caveats

- **Programmatic `stop()` Calls Without Arguments**: When `stop()` was tested in `use-chat-stream.test.ts` via direct function call `result.current.stop()`, no argument was passed, so `discardPartial` evaluated to its default value `false`. That is why unit tests passing zero arguments did not catch this UI-level regression.
- **Scope Discipline**: As Challenger, we do NOT modify application code (`use-chat-stream.ts`, `page.tsx`, `chat-composer.tsx`). We have created the regression harness `tests/unit/challenger-m3-stop-token-retention.test.tsx` so the worker can verify the fix and turn the suite green.

---

## 4. Conclusion & Required Actions

**Verdict**: **`REQUEST_CHANGES`**

The worker must apply a three-point remediation:
1. **In `src/features/chat/hooks/use-chat-stream.ts` (Line 32)**:
   Change `if (discardPartial)` to a strict boolean check:
   ```typescript
   if (discardPartial === true) {
     discardPartialRef.current = true;
   }
   ```
2. **In `src/components/chat/chat-composer.tsx` (Line 240)**:
   Wrap the callback to prevent passing the click event:
   ```tsx
   onClick={() => onStop()}
   ```
3. **In `src/app/page.tsx` (Line 276)**:
   Pass explicit `stop` handler:
   ```tsx
   onStop={() => stop(false)}
   ```

---

## 5. Verification Method

Once the worker implements the fix, independently verify:

1. **Target Token Retention Test**:
   ```powershell
   cmd /c npx vitest run tests/unit/challenger-m3-stop-token-retention.test.tsx
   ```
   **Expected**: 1 passed (1).

2. **Workspace Lifecycle Suite**:
   ```powershell
   cmd /c npx vitest run tests/unit/challenger-m3-workspace-lifecycle.test.tsx
   ```
   **Expected**: 1 passed (12 tests passed).

3. **Full Project Suite**:
   ```powershell
   cmd /c npm test
   ```
   **Expected**: 24 passed (24 suites, 344 tests).
