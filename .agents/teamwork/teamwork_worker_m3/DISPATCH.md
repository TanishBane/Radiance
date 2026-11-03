## 2026-11-01T07:19:33Z
You are teamwork_worker assigned to Milestone 3 (Interactive Actions & Workspace Integration) for the Radiance AI platform.
Working directory: c:\Tanixai-main\.agents\teamwork\teamwork_worker_m3\

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You have exclusive write ownership over:
- src/components/chat/message-item.tsx
- src/features/chat/components/chat-workspace.tsx
- src/app/page.tsx
- tests/unit/message-item.test.tsx
- tests/unit/chat-workspace.test.tsx

Do NOT edit any other project files.

READ THESE FIRST:
1. c:\Tanixai-main\.agents\teamwork\ORIGINAL_REQUEST.md
2. c:\Tanixai-main\PROJECT.md
3. c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_1\handoff.md and proposed_message_item.tsx / proposed_message_item.test.tsx
4. c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_2\analysis.md and proposed_chat-workspace.tsx / proposed_chat-workspace.test.tsx
5. c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_3\handoff.md and analysis.md

YOUR TASKS:
1. In `src/components/chat/message-item.tsx`:
   - Implement Desktop hover action bar (`group-hover:opacity-100 opacity-0` or focus-within) with:
     - Copy button with temporary feedback state ("Copied!")
     - Regenerate button (for assistant messages)
     - Edit button (for user messages) triggering inline edit form or callback
     - Delete button with confirmation or instant delete
     - Sentiment feedback buttons (thumbs up / thumbs down) with visual toggle and aria attributes
     - Safe client-side export button (Markdown file blob download / formatted copy without external links)
     - Exact ISO timestamp tooltip/title (`new Date(message.createdAt).toISOString()`)
     - Retry button when message has `isError: true`
   - Implement Mobile action menu using `@radix-ui/react-dropdown-menu` (`DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`) with 44x44px touch targets.
   - Support `isStreaming?: boolean` and render streaming content with `{ isStreaming: true }` in `formatMarkdown`.

2. In `src/features/chat/components/chat-workspace.tsx`:
   - Implement Active Inference Indicator during TTFT (`isGenerating && !streamingContent`), rendering an assistant container with animated pulsating thinking dots and "Thinking..." label.
   - Implement Active Stream Cursor when `streamingContent` is active (`<span className="inline-block w-2 h-4 bg-[var(--accent)] ml-1 animate-pulse align-middle" />`).
   - Implement In-Message Structured Error Card when `streamError` is not null or message has `isError: true`, displaying error details and a prominent "Retry" button.
   - Wire all action callbacks (`onRegenerate`, `onEditUserMessage`, `onDeleteMessage`, `onFeedback`, `onRetry`) down to `MessageItem`.
   - Implement smooth auto-scroll to bottom during active streaming and new turns.

3. In `src/app/page.tsx`:
   - Destructure `deleteMessage`, `editUserMessage`, `setMessageFeedback` from `useChatSession()`.
   - Destructure `streamError`, `retryLast` from `useChatStream()`.
   - Connect action handlers:
     - `handleRegenerate(messageId)`: if generating call `stop()`, find preceding user turn, prune history, invoke `send()`.
     - `handleEditUserMessage(messageId, newContent)`: if generating call `stop()`, call `editUserMessage()`, invoke `send()`.
     - `handleDeleteMessage(messageId)`: if generating and deleting current turn call `stop()`, call `deleteMessage()`.
     - `handleFeedback(messageId, rating)`: call `setMessageFeedback()`.
     - `handleRetry()`: call `retryLast()`.
   - Remove disruptive `window.alert()` from `onError` callback; let error route into `streamError` / workspace card.
   - Add abort guard in `newChat` and `selectConversation` (`if (isGenerating) stop()`) to prevent stream leakage across sessions.

4. In `tests/unit/`:
   - Implement `tests/unit/message-item.test.tsx` (covering desktop hover toolbar, mobile dropdown menu, copy feedback, sentiment toggle, ISO timestamp, edit mode, client export, retry).
   - Implement `tests/unit/chat-workspace.test.tsx` (covering TTFT active inference indicator, active stream cursor, in-message error card with retry button, message list rendering, auto-scroll).

5. Verification:
   All shell commands on Windows must use `cmd /c ...`:
   - `cmd /c npm run typecheck`
   - `cmd /c npm run lint`
   - `cmd /c npm test`
   All three commands MUST pass with exit code 0.

6. Document all changes and test outputs in `c:\Tanixai-main\.agents\teamwork\teamwork_worker_m3\handoff.md`, then call send_message to report completion.
