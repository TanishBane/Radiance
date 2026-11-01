# Handoff Report: Milestone 2 Part A — Stream Buffer, Abort Lifecycle & Error States

**Agent**: `teamwork_explorer_m2_1`  
**Working Directory**: `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m2_1`  
**Target Milestone**: Milestone 2 (Streaming Lifecycle & Session State) — Part A  
**Type**: Hard Handoff (Investigation & Technical Design Complete)  

---

## 1. Observation

Direct code observations from inspecting the codebase:

1. **Vulnerability in SSE Chunk Splitting (`src/features/chat/hooks/use-chat-stream.ts:77–89`)**:
   ```typescript
   const chunk = decoder.decode(value, { stream: true });
   const lines = chunk.split("\n");

   for (const line of lines) {
     if (line.startsWith('0:"')) {
       try {
         const token = JSON.parse(line.slice(2));
         accumulated += token;
         setStreamingContent(accumulated);
       } catch {
         // Ignore partial JSON parse errors
       }
     } else if (line.startsWith("0:")) {
       accumulated += line.slice(2);
       setStreamingContent(accumulated);
     }
   }
   ```
   *Observation*: `chunk.split("\n")` assumes that chunks align with full newline-delimited lines. When a chunk cuts across a line prefix or token JSON string (e.g. chunk 1 `0:"Hello ` and chunk 2 `world"\n`), chunk 1 fails `JSON.parse` and is silently ignored in `catch {}`. Chunk 2 starts with `world"`, fails the `0:` check, and is dropped. The tokens are permanently lost.

2. **Discarded Work on Stream Abort (`src/features/chat/hooks/use-chat-stream.ts:110–114`)**:
   ```typescript
   if (err instanceof Error && err.name === "AbortError") {
     // Intentional stop
     setIsGenerating(false);
     return;
   }
   ```
   *Observation*: When the user stops generation, the catch handler catches `AbortError`, sets `isGenerating` to false, and returns without calling `onStreamComplete`. All accumulated text in `accumulated` is discarded. In contrast, `PROJECT.md:44` (Feature 18) mandates: *"Preserves accumulated tokens on stream abort as a completed assistant message"*.

3. **Absence of Structured Error State & `retryLast()` (`src/features/chat/hooks/use-chat-stream.ts:116–132`)**:
   *Observation*: The hook return interface returns only `{ isGenerating, streamingContent, send, stop }`. It does not expose `streamError: Error | null` or `retryLast: () => Promise<void>`. Errors are passed solely to an `onError` callback (which in `src/app/page.tsx:61–63` triggers `alert(...)`).

4. **Missing Types in `src/lib/types/chat.ts:14–22`**:
   *Observation*: `ChatMessage` in `src/lib/types/chat.ts` lacks `errorDetails?: string;` and `feedback?: "positive" | "negative" | null;`, and the file lacks `UseChatStreamReturn` and `MessageFeedback` as defined in `PROJECT.md:89–123`.

5. **Existing Verification Baseline**:
   - `npm test` (`vitest run`): 14 test files, 162 unit tests passing (exit code 0).
   - `npm run typecheck` (`tsc --noEmit`): 0 TypeScript errors (exit code 0).

---

## 2. Logic Chain

1. **From Observation 1 to Persistent Line Buffer Design**:
   - Because network MTU and stream buffering partition byte packets arbitrarily, a persistent line buffer `buffer = ""` across `reader.read()` cycles is necessary.
   - Appending incoming chunks (`buffer += chunk`), extracting complete lines (`const lines = buffer.split("\n")`), and preserving the trailing incomplete segment (`buffer = lines.pop() ?? ""`) guarantees that incomplete tokens remain in `buffer` until their closing newline arrives.
   - Stripping `\r` prevents JSON parse failure on Windows CRLF lines.
   - Flushing `buffer` when `done: true` prevents dropping un-delimited final tokens.

2. **From Observation 2 to Abort Lifecycle Design**:
   - When `stop()` triggers `abortControllerRef.current?.abort()`, the active reader throws `AbortError`.
   - In the catch handler, checking `if (isAbort)` and inspecting `accumulated.trim().length > 0`:
     - If true: commits `onStreamComplete({ id: msg_${Date.now()}, role: "assistant", content: accumulated, createdAt: Date.now() })`.
     - If false (TTFT abort): cleanly resets state without emitting an empty ghost message.
   - Both cases reset `isGenerating` to `false`, clear `streamingContent`, and clear `abortControllerRef`.

3. **From Observation 3 to Error State & Retry Design**:
   - Adding `const [streamError, setStreamError] = useState<Error | null>(null)` allows workspace components to render structured in-message error cards.
   - Retaining prior invocation context in `lastMessagesRef` and `lastModelIdRef` allows `retryLast()` to cleanly re-invoke `send(lastMessagesRef.current, lastModelIdRef.current)` without user manual copy-pasting.

4. **From Observation 4 to Type Integrity**:
   - Adding optional fields `errorDetails?: string` and `feedback?: MessageFeedback` to `ChatMessage` in `src/lib/types/chat.ts` ensures backwards compatibility while establishing the interface contract needed by M2 session actions and M3 interactive UI.

---

## 3. Caveats

- **No Typewriter Throttle Exists**: An exhaustive audit of `src/features/chat/` confirmed that zero artificial delay (`setTimeout`, `setInterval`, character queue) currently exists. Streaming is already synchronous upon chunk arrival. The design formalizes this invariant with zero-delay unit tests (`vi.getTimerCount() === 0`).
- **Scope Boundary**: This handoff covers the technical design and specifications for Part A (`use-chat-stream.ts`, `chat.ts`, and `use-chat-stream.test.ts`). Session actions (`deleteMessage`, `editUserMessage`, `setMessageFeedback`) belong to Part B (`use-chat-session.ts`). UI error cards and action toolbars belong to M3.
- **Node vs Browser AbortError**: The abort check checks both `err instanceof DOMException && err.name === "AbortError"` and `err instanceof Error && err.name === "AbortError"` to ensure identical behavior in Node.js (jsdom test runner) and native browser engines.

---

## 4. Conclusion

The technical design and specifications for Milestone 2 Part A are complete, documented, and ready for implementation.
Two complete implementation artifacts have been generated in this working directory:
1. `proposed_use-chat-stream.ts` — Ready drop-in replacement for `src/features/chat/hooks/use-chat-stream.ts`.
2. `proposed_use-chat-stream.test.ts` — Ready unit test suite for `tests/unit/use-chat-stream.test.ts` containing 13 tests across 6 suites covering fragmented chunks, abort token preservation, error states, `retryLast()`, zero delay, and concurrent guards.

---

## 5. Verification Method

To independently verify the implementation once applied:

1. **Verify TypeScript Compilation**:
   ```powershell
   cmd.exe /c npm run typecheck
   ```
   *Expected Result*: Exit code 0, 0 type errors.

2. **Verify Full Unit Test Suite (including new hook tests)**:
   ```powershell
   cmd.exe /c npm test
   ```
   *Expected Result*: All 15 test files pass (162 existing + 13 new hook tests = 175 tests passing).

3. **Verify Boundary Conditions**:
   - Chunk splitting across word boundaries (e.g. `'0:"Hello, '` + `'world!"\n'`) must reassemble into `"Hello, world!"` without error.
   - Stream abort during active token reception must invoke `onStreamComplete` with accumulated tokens.
   - Immediate abort before first token must NOT invoke `onStreamComplete`.
   - In-stream `3:"<error>"` must populate `streamError`.
