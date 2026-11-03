## 2026-11-01T09:57:03Z

You are teamwork_worker assigned to Milestone 3 Iteration 2 (Remediation of Cross-Session Stream Contamination).
Working directory: c:\Tanixai-main\.agents\teamwork\teamwork_worker_m3_iter2\

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You have exclusive write ownership over:
- src/lib/types/chat.ts
- src/features/chat/hooks/use-chat-stream.ts
- src/app/page.tsx

Do NOT edit any other project files.

READ THESE FIRST:
1. c:\Tanixai-main\.agents\teamwork\ORIGINAL_REQUEST.md
2. c:\Tanixai-main\PROJECT.md
3. c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_iter2_1\handoff.md
4. c:\Tanixai-main\tests\unit\challenger-m3-workspace-lifecycle.test.tsx

YOUR TASK:
Implement the two-tier remediation strategy designed in `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_iter2_1\handoff.md`:

1. In `src/lib/types/chat.ts`:
   - In `UseChatStreamReturn`, update `stop`:
     `stop: (discardPartial?: boolean) => void;`

2. In `src/features/chat/hooks/use-chat-stream.ts`:
   - Add `const discardPartialRef = useRef(false);`
   - Update `stop`:
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
   - In `send`, reset `discardPartialRef.current = false;`
   - Before `onStreamComplete` at normal stream completion, verify `controller.signal.aborted || discardPartialRef.current` does not complete.
   - In the catch block on `isAbort`:
     ```typescript
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
     isGeneratingRef.current = false;
     setIsGenerating(false);
     setStreamError(null);
     abortControllerRef.current = null;
     return;
     ```

3. In `src/app/page.tsx`:
   - In `handleStreamComplete`:
     ```typescript
     if (messagesRef.current.length === 0) {
       return;
     }
     ```
   - In `handleNewChat`: `if (isGenerating) stop(true);`
   - In `handleSelectConversation`: `if (isGenerating) stop(true);`
   - In `handleRegenerate`: `if (isGenerating) stop(true);`
   - In `handleEditUserMessage`: `if (isGenerating) stop(true);`
   - In `handleDeleteMessage`: `if (isGenerating) stop(true);`

4. Verification:
   All shell commands on Windows must use `cmd /c ...`:
   - `cmd /c npx vitest run tests/unit/challenger-m3-workspace-lifecycle.test.tsx` (Must pass 12/12)
   - `cmd /c npm run typecheck` (Must pass with exit code 0)
   - `cmd /c npm run lint` (Must pass with exit code 0)
   - `cmd /c npm test` (Must pass 100% across all 23 test files, 343 tests)

5. Document all changes and verification outputs in `c:\Tanixai-main\.agents\teamwork\teamwork_worker_m3_iter2\handoff.md`, then call send_message to report completion.
