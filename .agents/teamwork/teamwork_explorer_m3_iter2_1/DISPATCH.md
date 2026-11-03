# Dispatch: Milestone 3 Iteration 2 Explorer (Cross-Session Contamination Remediation)

## 2026-11-01T09:52:00Z

**Assigned Agent**: `teamwork_explorer_m3_iter2_1`
**Role**: Milestone 3 Remediation Explorer
**Working Directory**: `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_iter2_1\`
**Parent Orchestrator**: `9a255721-46e0-4eb1-9e8d-5fd5e5a29b04`

### Defect to Remediate
In Milestone 3 Gate Iteration 1, Challenger 2 identified a critical race condition bug:
When `newChat()` is triggered in `src/app/page.tsx` while an assistant message is actively streaming:
1. `handleNewChat` executes `if (isGenerating) stop();` followed by `newChat()`.
2. `newChat()` resets `activeConvId` to `null` and `messages` / `messagesRef.current` to `[]`.
3. In `use-chat-stream.ts`, `stop()` aborts the fetch. In the `catch` handler, `isAbort` is detected and because `accumulated.trim().length > 0`, `onStreamComplete(assistantMsg)` is invoked asynchronously.
4. In `page.tsx`, `handleStreamComplete` executes `appendAssistantMessage(assistantMessage, messagesRef.current, ...)`.
5. Because `messagesRef.current` was cleared to `[]`, `appendAssistantMessage` treats this aborted assistant message from the *previous* conversation as the first message of the *new* conversation, creates a new conversation for it, and displays it in the new chat view!

### Tasks
1. Inspect `src/features/chat/hooks/use-chat-stream.ts`, `src/features/chat/hooks/use-chat-session.ts`, `src/app/page.tsx`, and `tests/unit/challenger-m3-workspace-lifecycle.test.tsx`.
2. Design a clean, robust fix. For example:
   - Allow `stop(discard?: boolean)` in `use-chat-stream.ts` so navigation actions (`handleNewChat`, switching conversations) can discard partial tokens without triggering `onStreamComplete`, OR
   - Associate the active stream with the specific conversation ID at dispatch time (`activeStreamConvIdRef` in `page.tsx` or in `use-chat-stream.ts`), and when `onStreamComplete` arrives, ensure it only appends to the conversation that initiated it (and if the conversation was closed, either updates that specific conversation in storage or discards it, but NEVER leaks it into the active empty view).
3. Ensure `tests/unit/challenger-m3-workspace-lifecycle.test.tsx` passes cleanly.
4. Author concrete code recommendations and test plan in `analysis.md` and `handoff.md`.
