# Milestone 2 Part A: Stream Buffer, Abort Lifecycle & Error States — Technical Analysis & Design

**Author**: `teamwork_explorer_m2_1`  
**Working Directory**: `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m2_1`  
**Target Scope**:
- `src/features/chat/hooks/use-chat-stream.ts`
- `src/lib/types/chat.ts`
- `tests/unit/use-chat-stream.test.ts`
**Parent Target**: Milestone 2 (Streaming Lifecycle & Session State)

---

## 1. Executive Summary

Milestone 2 establishes production-grade streaming reliability, robust request cancellation, graceful error recovery, and seamless chat state persistence. This analysis investigates and formulates the exact architectural and implementation design for **Part A: Stream Buffer, Abort Lifecycle & Error States**.

Four critical architectural defects were discovered in the existing `use-chat-stream.ts`:
1. **Chunk Boundary Splitting / Token Dropping**: In `use-chat-stream.ts:77-89`, `chunk.split("\n")` operates on isolated `reader.read()` buffers without maintaining a persistent cross-chunk buffer. If a token or line is split across TCP/HTTP chunks, `JSON.parse` fails with `SyntaxError` and silently drops tokens.
2. **Discarded Work on Stop-Generation**: In `use-chat-stream.ts:110-114`, handling of `AbortError` sets `setIsGenerating(false)` and returns without committing accumulated tokens to `onStreamComplete`. Consequently, user-requested stream cancellation completely discards all streamed assistant text instead of preserving it as a completed message.
3. **Missing Structured Error State & Retry Capability**: In `use-chat-stream.ts:116-121`, errors trigger only an ephemeral `onError` callback (which in `page.tsx:61-63` displays a disruptive `window.alert()`). The hook exposes no structured `streamError: Error | null` state, and has no `retryLast()` method to re-submit prior prompt payloads.
4. **Missing Type Definitions in `chat.ts`**: `src/lib/types/chat.ts` lacks `errorDetails`, `feedback`, and the formal `UseChatStreamReturn` interface specified in `PROJECT.md:89-123`.

This document specifies the exact technical designs, drop-in replacement code, and a full Vitest test suite (`tests/unit/use-chat-stream.test.ts`) guaranteeing 100% boundary resilience, deterministic abort preservation, structured error recovery, and verified zero artificial delay.

---

## 2. Codebase Audit & Direct Observations

### 2.1 Audit of `src/features/chat/hooks/use-chat-stream.ts`
- **Lines 74–96**:
  ```typescript
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

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
  }
  ```
  *Defect*: When chunk 1 ends with `0:"Hello ` and chunk 2 begins with `world"\n`, chunk 1 has no trailing newline; `lines` contains `0:"Hello `, `JSON.parse('"Hello ')` fails, and the partial JSON error is caught and ignored. Then chunk 2 has `world"`, which does not start with `0:`, so it is completely ignored. The entire phrase `"Hello world"` is permanently lost.
- **Lines 110–114**:
  ```typescript
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      // Intentional stop
      setIsGenerating(false);
      return;
    }
  ```
  *Defect*: When `stop()` aborts the controller, the `AbortError` catch block discards `accumulated`. `onStreamComplete` is never called. The user sees their streamed response vanish, leaving no message in history.
- **Lines 126–132**:
  ```typescript
  return {
    isGenerating,
    streamingContent,
    send,
    stop,
  };
  ```
  *Defect*: Missing `streamError: Error | null` and `retryLast: () => Promise<void>`.
- **Lines 80–95 vs `src/app/api/chat/route.ts:129–143`**:
  `route.ts` streams responses via Vercel AI SDK `result.toDataStreamResponse(...)`. When an upstream error occurs, the SDK emits `3:"<error message>"\n`. `use-chat-stream.ts` only checks for `0:`, completely ignoring in-stream `3:` errors.

### 2.2 Audit of `src/lib/types/chat.ts`
- **Lines 14–22**:
  ```typescript
  export interface ChatMessage {
    id: string;
    role: Role;
    content: string;
    createdAt: number;
    attachments?: Attachment[];
    generatedImageUrl?: string;
    isError?: boolean;
  }
  ```
  *Defect*: Missing `errorDetails?: string;` and `feedback?: "positive" | "negative" | null;` as specified in `PROJECT.md:91-102`.
  *Defect*: Missing `export interface UseChatStreamReturn` and `export type MessageFeedback`.

---

## 3. Technical Design Specifications

### 3.1 Persistent Cross-Chunk Line Buffering
To prevent token loss across chunk boundaries:
1. Maintain a persistent string `buffer = ""` throughout the lifetime of the stream reading loop.
2. In each iteration of `while (true)`:
   ```typescript
   buffer += decoder.decode(value, { stream: true });
   const lines = buffer.split("\n");
   buffer = lines.pop() ?? "";
   ```
   - `lines.pop() ?? ""` removes and preserves the final element:
     - If the chunk ended with `\n`, `lines.pop()` yields `""` (empty string), and all preceding items in `lines` are complete lines.
     - If the chunk cut off in the middle of a line (e.g. `0:"Hello `), `lines.pop()` yields that partial line string, which remains in `buffer` to be prepended to the next incoming chunk!
3. **CRLF Handling**:
   Strip carriage returns to prevent JSON syntax errors on Windows/CRLF streams:
   ```typescript
   const cleanLine = line.endsWith("\r") ? line.slice(0, -1) : line;
   ```
4. **EOF Residual Flush**:
   After the `while` loop terminates on `done: true`, if `buffer.length > 0`, process that final line:
   ```typescript
   if (buffer.trim().length > 0) {
     processLine(buffer);
     buffer = "";
   }
   ```
5. **Protocol Support**:
   - `0:"..."`: Parse with `JSON.parse(cleanLine.slice(2))`
   - `0:...`: Direct string append `accumulated += cleanLine.slice(2)`
   - `3:"..."`: In-stream error protocol. Parse and throw `new Error(parsedErrorMessage)` so the stream enters the standard error catch flow.

### 3.2 Stop Generation Lifecycle & Partial Content Preservation
When the user clicks the Stop button:
1. `stop()` invokes `abortControllerRef.current?.abort()`.
2. The active `fetch` signal aborts immediately:
   - On the client: `reader.read()` rejects with `AbortError` (`DOMException: The user aborted a request`).
   - On the server: `route.ts` aborts upstream inference via `abortSignal: req.signal`, immediately halting provider token consumption.
3. Catch handler identifies the abort:
   ```typescript
   const isAbort =
     (typeof DOMException !== "undefined" && err instanceof DOMException && err.name === "AbortError") ||
     (err instanceof Error && (err.name === "AbortError" || err.message.toLowerCase().includes("aborted")));
   ```
4. **Partial Content Commit**:
   - If `accumulated.trim().length > 0`:
     The model was actively generating text. Preserve it as a completed assistant message:
     ```typescript
     const assistantMsg: ChatMessage = {
       id: `msg_${Date.now()}`,
       role: "assistant",
       content: accumulated,
       createdAt: Date.now(),
     };
     onStreamComplete(assistantMsg);
     ```
   - If `accumulated.trim().length === 0`:
     The user cancelled during TTFT before any tokens arrived. Do not create a blank message.
5. **Hook State Cleanup**:
   - `setStreamingContent("")`
   - `setIsGenerating(false)`
   - `setStreamError(null)`
   - `abortControllerRef.current = null`

### 3.3 Structured Error States & `retryLast()`
1. **Structured Error State**:
   - Hook maintains `const [streamError, setStreamError] = useState<Error | null>(null);`.
   - On new `send()` call: `setStreamError(null)`.
   - On error:
     ```typescript
     const error = err instanceof Error ? err : new Error(String(err));
     setStreamError(error);
     setStreamingContent("");
     setIsGenerating(false);
     abortControllerRef.current = null;
     onError?.(error);
     ```
   - Returning `streamError` allows UI components (M3 `chat-workspace.tsx`) to render an accessible in-message error card instead of a blocking modal.
2. **Prior Message Tracking & `retryLast()`**:
   - Hook maintains:
     ```typescript
     const lastMessagesRef = useRef<ChatMessage[] | null>(null);
     const lastModelIdRef = useRef<string | undefined>(undefined);
     ```
   - Inside `send(messagesToSend, overrideModelId)`:
     ```typescript
     lastMessagesRef.current = messagesToSend;
     lastModelIdRef.current = overrideModelId;
     ```
   - `retryLast()` implementation:
     ```typescript
     const retryLast = useCallback(async () => {
       if (isGeneratingRef.current) return;
       if (!lastMessagesRef.current || lastMessagesRef.current.length === 0) return;
       await send(lastMessagesRef.current, lastModelIdRef.current);
     }, [send]);
     ```

### 3.4 Zero Artificial Typewriter Delay Verification
1. **Verification**:
   - `setStreamingContent(accumulated)` is invoked synchronously inside the chunk line loop as chunks arrive.
   - Code contains 0 instances of `setTimeout`, `setInterval`, `requestAnimationFrame`, or character pacing queues.
   - When the stream closes (`done: true`), `onStreamComplete(assistantMsg)` is invoked synchronously in the same event turn.
2. **Acceptance Criteria Verification**:
   - No post-stream typing delays.
   - Immediate UI responsiveness.

---

## 4. Proposed Source Code Changes

### 4.1 `src/lib/types/chat.ts`
```typescript
export type Role = "user" | "assistant" | "system";

export type MessageFeedback = "positive" | "negative" | null;

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "pdf" | "text" | "csv" | "doc";
  mime: string;
  size: number;
  dataUrl?: string;
  storagePath?: string;
  extractedText?: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  attachments?: Attachment[];
  generatedImageUrl?: string;
  isError?: boolean;
  errorDetails?: string;
  feedback?: MessageFeedback;
}

export interface UseChatStreamReturn {
  isGenerating: boolean;
  streamingContent: string;
  streamError: Error | null;
  send: (messages: ChatMessage[], modelId?: string) => Promise<void>;
  stop: () => void;
  retryLast: () => Promise<void>;
}
```

### 4.2 `src/features/chat/hooks/use-chat-stream.ts`
```typescript
"use client";

import { useState, useRef, useCallback } from "react";
import { ChatMessage, UseChatStreamReturn } from "@/lib/types/chat";

export interface UseChatStreamOptions {
  modelId: string;
  tone: string;
  language: string;
  onStreamComplete: (assistantMessage: ChatMessage) => void;
  onError?: (error: Error) => void;
}

export function useChatStream({
  modelId,
  tone,
  language,
  onStreamComplete,
  onError,
}: UseChatStreamOptions): UseChatStreamReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamError, setStreamError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isGeneratingRef = useRef(false);
  const lastMessagesRef = useRef<ChatMessage[] | null>(null);
  const lastModelIdRef = useRef<string | undefined>(undefined);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isGeneratingRef.current = false;
    setIsGenerating(false);
  }, []);

  const send = useCallback(
    async (messagesToSend: ChatMessage[], overrideModelId?: string) => {
      if (isGeneratingRef.current) return;

      lastMessagesRef.current = messagesToSend;
      lastModelIdRef.current = overrideModelId;

      isGeneratingRef.current = true;
      setIsGenerating(true);
      setStreamingContent("");
      setStreamError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      let accumulated = "";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: messagesToSend.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              attachments: m.attachments,
            })),
            modelId: overrideModelId || modelId,
            mode: "default",
            tone,
            language,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No readable response body received.");

        const decoder = new TextDecoder();
        let buffer = "";

        const processLine = (rawLine: string) => {
          const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
          if (!line) return;

          // Vercel AI SDK text part: 0:"token"
          if (line.startsWith('0:"')) {
            try {
              const token = JSON.parse(line.slice(2));
              accumulated += token;
              setStreamingContent(accumulated);
            } catch {
              // Ignore partial unescaped slices
            }
          } else if (line.startsWith("0:")) {
            // Raw text part without quotes
            accumulated += line.slice(2);
            setStreamingContent(accumulated);
          } else if (line.startsWith("3:")) {
            // Vercel AI SDK stream error part
            try {
              const errPayload = JSON.parse(line.slice(2));
              const msg =
                typeof errPayload === "string"
                  ? errPayload
                  : errPayload.message || "Streaming inference error";
              throw new Error(msg);
            } catch (pErr) {
              if (pErr instanceof Error && pErr.message !== "Unexpected end of JSON input") {
                throw pErr;
              }
              throw new Error(line.slice(2));
            }
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            processLine(line);
          }
        }

        // Flush any remaining residual buffer after stream completion
        if (buffer.length > 0) {
          processLine(buffer);
          buffer = "";
        }

        const assistantMsg: ChatMessage = {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: accumulated || "*(No response generated)*",
          createdAt: Date.now(),
        };

        setStreamingContent("");
        isGeneratingRef.current = false;
        setIsGenerating(false);
        abortControllerRef.current = null;
        onStreamComplete(assistantMsg);
      } catch (err: unknown) {
        const isAbort =
          (typeof DOMException !== "undefined" && err instanceof DOMException && err.name === "AbortError") ||
          (err instanceof Error && (err.name === "AbortError" || err.message.toLowerCase().includes("aborted")));

        if (isAbort) {
          // Preserve accumulated tokens if any were generated before abort
          if (accumulated.trim().length > 0) {
            const assistantMsg: ChatMessage = {
              id: `msg_${Date.now()}`,
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

        const error = err instanceof Error ? err : new Error(String(err));
        setStreamError(error);
        isGeneratingRef.current = false;
        setIsGenerating(false);
        setStreamingContent("");
        abortControllerRef.current = null;
        onError?.(error);
      }
    },
    [modelId, tone, language, onStreamComplete, onError]
  );

  const retryLast = useCallback(async () => {
    if (isGeneratingRef.current) return;
    if (!lastMessagesRef.current || lastMessagesRef.current.length === 0) return;
    await send(lastMessagesRef.current, lastModelIdRef.current);
  }, [send]);

  return {
    isGenerating,
    streamingContent,
    streamError,
    send,
    stop,
    retryLast,
  };
}
```

---

## 5. Comprehensive Unit Test Specifications

File: `tests/unit/use-chat-stream.test.ts`  
Test Runner: Vitest (`npm test`)

The test suite must cover 6 comprehensive suites:
1. **Persistent Line Buffer & Chunk Boundary Splitting**:
   - Reassembles standard single-chunk SSE stream.
   - Reassembles tokens split across arbitrary TCP chunk boundaries (e.g. prefix `0:` split from body, JSON string split in middle of word).
   - Reassembles tokens across 4+ fragmented micro-chunks without dropping a single token.
   - Cleans Windows CRLF (`\r\n`) endings without parse error.
   - Flushes un-terminated residual buffer upon EOF (`done: true`).
2. **Immediate Stop & Abort Lifecycle**:
   - `stop()` aborts the active request and cancels inference.
   - Preserves accumulated partial tokens as a completed assistant message on abort.
   - When aborted before first token arrives (TTFT), cancels cleanly without creating an empty assistant message.
   - Resets `isGenerating` to false and clears `streamingContent`.
3. **Structured Error States & In-Stream Error Recovery**:
   - Captures HTTP 429 and 500 responses into `streamError` and calls `onError`.
   - Captures network failure (fetch reject) into `streamError`.
   - Parses and captures in-stream Vercel error parts (`3:"Rate limit exceeded"`).
   - Clears `streamError` when a subsequent `send()` is initiated.
4. **Retry Mechanism (`retryLast`)**:
   - Re-submits the exact prior prompt message history.
   - Safely no-ops if called before any messages have been sent.
   - Preserves modelId override if provided during the initial send.
5. **Zero Artificial Typewriter Delay**:
   - Real-time synchronous token updates to `streamingContent` upon chunk decode with 0 pending timers.
   - Synchronous invocation of `onStreamComplete` upon stream EOF without post-stream lag.
6. **Concurrent Submission Guard**:
   - Ignores concurrent `send()` calls while inference is actively generating.

---

## 6. Verification Plan

1. **Type Checking**:
   `npm run typecheck` (`tsc --noEmit`) must exit with 0 errors across all source files and test suites.
2. **Linting**:
   `npm run lint` (`next lint`) must exit with 0 errors.
3. **Unit Tests**:
   `npm test` must run all Vitest suites including `tests/unit/use-chat-stream.test.ts`, with 100% pass rate.
4. **Boundary Verification**:
   Verify specifically that splitting a token across 5 byte chunks results in 100% character recovery without a single dropped character or uncaught error.
