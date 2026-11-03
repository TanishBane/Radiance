# Dispatch: Milestone 3 Iteration 3 Implementation Worker

## Mission
Remediate the Stop button partial token retention regression (Feature 18) and history drawer conversation deletion stream cancellation in Radiance AI platform.

## Mandatory Integrity Warning
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

## Context & Inputs
- `c:\Tanixai-main\.agents\teamwork\ORIGINAL_REQUEST.md` (MANDATORY — read first)
- `c:\Tanixai-main\PROJECT.md`
- `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_iter3_1\handoff.md`
- `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_iter3_2\handoff.md`
- `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_iter3_3\handoff.md`
- `c:\Tanixai-main\.agents\teamwork\teamwork_challenger_m3_iter2\handoff.md`

## Files Owned Exclusively
- `src/features/chat/hooks/use-chat-stream.ts`
- `src/components/chat/chat-composer.tsx`
- `src/app/page.tsx`
- `tests/unit/chat-composer.test.tsx`
- `tests/unit/use-chat-stream.test.ts`
- `tests/unit/challenger-m3-workspace-lifecycle.test.tsx`

## Required Implementation Steps
1. **`src/features/chat/hooks/use-chat-stream.ts`**:
   - In `stop`: change `if (discardPartial)` to `if (discardPartial === true) { discardPartialRef.current = true; }`.
   - In normal completion reader EOF loop: add `discardPartialRef.current = false;` to reset the flag.
2. **`src/components/chat/chat-composer.tsx`**:
   - At line 240, change `onClick={onStop}` to `onClick={() => onStop()}` so React's `MouseEvent` is never passed into `onStop`.
3. **`src/app/page.tsx`**:
   - Define `handleStop = useCallback(() => { stop(false); }, [stop]);` and pass `onStop={handleStop}` to `ChatWorkspace`.
   - Define `handleDeleteConversation = useCallback(async (id: string) => { if (isGenerating && activeConvId === id) stop(true); await deleteConversation(id); }, [isGenerating, activeConvId, stop, deleteConversation]);`.
   - Define `handleDeleteAllConversations = useCallback(async () => { if (isGenerating) stop(true); await deleteAllConversations(); }, [isGenerating, stop, deleteAllConversations]);`.
   - Pass `handleDeleteConversation` and `handleDeleteAllConversations` to `HistoryDrawer`.
4. **Test Suite Updates**:
   - In `tests/unit/chat-composer.test.tsx`: assert `expect(onStop).toHaveBeenCalledWith();` verifying zero arguments contract.
   - In `tests/unit/use-chat-stream.test.ts`: add tests for `stop(true)` (discard tokens), `stop(false)` (preserve tokens), and `stop({ type: "click" } as any)` (truthy non-boolean object preserves tokens).
   - In `tests/unit/challenger-m3-workspace-lifecycle.test.tsx`: add tests verifying active stream abort when deleting active conversation or all conversations via `HistoryDrawer`.
5. **Verification**:
   - Run: `cmd /c npx vitest run tests/unit/challenger-m3-stop-token-retention.test.tsx` (must pass 1/1).
   - Run: `cmd /c npx vitest run tests/unit/challenger-m3-workspace-lifecycle.test.tsx` (all tests pass).
   - Run: `cmd /c npx vitest run tests/unit/chat-composer.test.tsx` (all tests pass).
   - Run: `cmd /c npx vitest run tests/unit/use-chat-stream.test.ts` (all tests pass).
   - Run: `cmd /c npm run typecheck` (exit code 0).
   - Run: `cmd /c npm run lint` (exit code 0).
   - Run: `cmd /c npm test` (all 24 test suites pass, 347+ tests pass).
6. **Handoff**:
   Write structured handoff report to `c:\Tanixai-main\.agents\teamwork\teamwork_worker_m3_iter3\handoff.md`.
   Notify caller via `send_message`.


## 2026-11-01T10:17:09Z
[Message] timestamp=2026-11-01T10:17:09Z sender=9a255721-46e0-4eb1-9e8d-5fd5e5a29b04 priority=MESSAGE_PRIORITY_HIGH content=You are teamwork_worker_m3_iter3, the Implementation Worker for Milestone 3 Iteration 3.
Your working directory is: c:\Tanixai-main\.agents\teamwork\teamwork_worker_m3_iter3\

Read your dispatch instructions in:
c:\Tanixai-main\.agents\teamwork\teamwork_worker_m3_iter3\DISPATCH.md
Read the mandatory original request in:
c:\Tanixai-main\.agents\teamwork\ORIGINAL_REQUEST.md
Also read:
- c:\Tanixai-main\PROJECT.md
- c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_iter3_1\handoff.md
- c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_iter3_2\handoff.md
- c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_iter3_3\handoff.md
- c:\Tanixai-main\.agents\teamwork\teamwork_challenger_m3_iter2\handoff.md

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

Execute the multi-tier remediation, run all verification commands (`cmd /c npx vitest run tests/unit/challenger-m3-stop-token-retention.test.tsx`, `cmd /c npm run typecheck`, `cmd /c npm run lint`, and `cmd /c npm test`).
Write your handoff report to:
c:\Tanixai-main\.agents\teamwork\teamwork_worker_m3_iter3\handoff.md
Notify caller via send_message when complete.
