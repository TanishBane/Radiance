## 2026-11-01T06:47:39Z
You are teamwork_worker assigned to Milestone 2 (Streaming Lifecycle & Session State) for the Radiance AI platform.
Your working directory is: c:\Tanixai-main\.agents\teamwork\teamwork_worker_m2\

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You have exclusive write ownership over:
- src/lib/types/chat.ts
- src/features/chat/hooks/use-chat-stream.ts
- src/features/chat/hooks/use-chat-session.ts
- src/components/chat/chat-composer.tsx
- vitest.config.ts
- tests/unit/use-chat-stream.test.ts
- tests/unit/use-chat-session.test.ts
- tests/unit/chat-composer.test.tsx

Do NOT edit any other project files.

READ THESE FIRST:
1. c:\Tanixai-main\.agents\teamwork\ORIGINAL_REQUEST.md
2. c:\Tanixai-main\PROJECT.md
3. c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m2_1\handoff.md and proposed_use-chat-stream.ts / proposed_use-chat-stream.test.ts
4. c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m2_2\handoff.md and analysis.md
5. c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m2_3\handoff.md and analysis.md

YOUR TASKS:
1. In `src/lib/types/chat.ts`:
   - Export `type FeedbackRating = "positive" | "negative" | null;`
   - In `ChatMessage` interface: add `feedback?: FeedbackRating;`, `errorDetails?: string;`, ensure `isError?: boolean;` exists.
   - Export `generateMessageId(): string` and `generateConversationId(): string` with collision-resistant format: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`
   - Export `UseChatStreamReturn` interface with `isGenerating: boolean; streamingContent: string; streamError: Error | null; send: (messages: ChatMessage[], modelId?: string) => Promise<void>; stop: () => void; retryLast: () => Promise<void>;`
   - Export `UseChatSessionReturn` matching the enhanced hook return.

2. In `src/features/chat/hooks/use-chat-stream.ts`:
   - Implement persistent line buffer `let buffer = ""` across chunks.
   - Strip Windows CRLF `\r` and parse SSE lines (`0:"..."`, `0:...`, and in-stream error `3:"..."`).
   - Flush buffer on stream EOF (`done: true`).
   - Implement `stop()` triggering `abortControllerRef.current?.abort()`.
   - In catch handler on `AbortError`: if `accumulated.trim().length > 0`, invoke `onStreamComplete({ id: generateMessageId(), role: "assistant", content: accumulated, createdAt: Date.now() })`. If empty (TTFT abort), do not emit an empty message.
   - Implement `streamError: Error | null` state.
   - Implement `retryLast(): Promise<void>` re-submitting `lastMessagesRef` with preserved model overrides.
   - Ensure zero artificial delay / timers (pure synchronous token ingestion).

3. In `src/features/chat/hooks/use-chat-session.ts`:
   - Import `FeedbackRating`, `generateMessageId`, `generateConversationId` from `@/lib/types/chat`.
   - Maintain `messagesRef` alongside `activeConvRef` to prevent stale closure bugs across rapid mutations.
   - Implement `deleteMessage(messageId: string): Promise<void>` (removes from memory & updates storage via `conversationService.save()`).
   - Implement `editUserMessage(messageId: string, newContent: string): Promise<ChatMessage[]>` (updates prompt text, slices subsequent assistant/user messages, recalculates title if first turn, returns sliced array for resubmission, and persists).
   - Implement `setMessageFeedback(messageId: string, feedback: FeedbackRating): Promise<void>` (toggles feedback or resets to null, persists).
   - In `appendUserMessage`, use `generateMessageId()`.
   - In `appendAssistantMessage`, preserve `existing.createdAt` and `existing.pinned`.

4. In `src/components/chat/chat-composer.tsx`:
   - Add `isSubmittingRef` synchronous ref guard in `handleSubmit()` to eliminate rapid double-submit race conditions. Reset via `useEffect` on `[input, isGenerating]` with a 300ms fallback timeout.
   - Add CJK IME composition guard `e.nativeEvent.isComposing || e.keyCode === 229` in `handleKeyDown`.
   - When `isGenerating: true`, toggle Send button to Stop button with `onClick={onStop}`, `aria-label="Stop response generation"`, `data-testid="stop-button"`.
   - On Send button, ensure `aria-label="Send message"` and `data-testid="send-button"`.

5. In `vitest.config.ts`:
   - Update `include` to `["tests/unit/**/*.test.{ts,tsx}", "tests/integration/**/*.test.{ts,tsx}"]`.

6. In `tests/unit/`:
   - Implement `tests/unit/use-chat-stream.test.ts` (13 tests verifying buffer, abort preservation, retryLast, zero delay, error handling).
   - Implement `tests/unit/use-chat-session.test.ts` (verifying deleteMessage, editUserMessage slicing, setMessageFeedback toggling, collision resistance, ref sync).
   - Implement `tests/unit/chat-composer.test.tsx` (verifying submission deduplication, CJK IME guard, stop button toggle, accessibility).

7. VERIFICATION:
   All shell commands on Windows must use `cmd /c ...`:
   - `cmd /c npm run typecheck`
   - `cmd /c npm run lint`
   - `cmd /c npm test`
   All three commands MUST pass with exit code 0.

8. Complete `c:\Tanixai-main\.agents\teamwork\teamwork_worker_m2\handoff.md` with:
   - Observation
   - Logic Chain
   - Caveats
   - Conclusion
   - Verification Method (with exact command outputs)
   Then call send_message to report completion to your orchestrator.


## 2026-11-01T06:58:17Z
[Message from Parent]
**Context**: Milestone 2 Implementation
**Content**: Checking in on your progress. Code modifications to types, hooks, composer, vitest config, and tests look completed. Are you currently executing the verification commands (`cmd /c npm run typecheck`, `cmd /c npm run lint`, `cmd /c npm test`) and compiling your handoff report?
**Action**: Please complete verification, write `handoff.md`, and reply with your completion report.
