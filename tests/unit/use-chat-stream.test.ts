import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useChatStream } from "@/features/chat/hooks/use-chat-stream";
import { ChatMessage } from "@/lib/types/chat";

function createMockStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk));
      }
      controller.close();
    },
  });
}

function createDelayedStream(chunks: string[], stepDelayMs = 20, initialDelayMs = 0) {
  const encoder = new TextEncoder();
  let streamController: ReadableStreamDefaultController<Uint8Array> | null = null;
  let isAborted = false;

  const stream = new ReadableStream({
    async start(controller) {
      streamController = controller;
      if (initialDelayMs > 0) {
        await new Promise((r) => setTimeout(r, initialDelayMs));
      }
      for (const chunk of chunks) {
        if (isAborted) return;
        controller.enqueue(encoder.encode(chunk));
        await new Promise((r) => setTimeout(r, stepDelayMs));
      }
      if (!isAborted) {
        try {
          controller.close();
        } catch {}
      }
    },
    cancel() {
      isAborted = true;
    },
  });

  const abort = () => {
    isAborted = true;
    if (streamController) {
      try {
        streamController.error(new DOMException("The user aborted a request.", "AbortError"));
      } catch {}
    }
  };

  return { stream, abort };
}

describe("useChatStream — Streaming Lifecycle, Buffer & Error State Specifications", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const sampleUserMessage: ChatMessage = {
    id: "msg_user_1",
    role: "user",
    content: "Explain quantum computing in one sentence.",
    createdAt: Date.now(),
  };

  describe("1. Persistent Line Buffering across Chunk Boundaries", () => {
    it("reassembles standard complete single-chunk SSE tokens", async () => {
      const onStreamComplete = vi.fn();
      const chunks = [
        '0:"Quantum "\n',
        '0:"computing "\n',
        '0:"leverages "\n',
        '0:"superposition."\n',
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(chunks),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "groq-llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete,
        })
      );

      await act(async () => {
        await result.current.send([sampleUserMessage]);
      });

      expect(onStreamComplete).toHaveBeenCalledTimes(1);
      const completedMsg: ChatMessage = onStreamComplete.mock.calls[0][0];
      expect(completedMsg.role).toBe("assistant");
      expect(completedMsg.content).toBe("Quantum computing leverages superposition.");
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.streamingContent).toBe("");
      expect(result.current.streamError).toBeNull();
    });

    it("reassembles tokens split across arbitrary TCP/HTTP chunk boundaries without token loss", async () => {
      const onStreamComplete = vi.fn();
      // Notice chunk splits happen in the middle of prefix and in the middle of JSON strings
      const fragmentedChunks = [
        '0:"Hello, ', // Missing trailing quote and newline
        'world! Welcome ', // Continues string, missing quote and newline
        'to Radiance."\n0:" How can', // Closes string, opens new line
        ' I help you today?"\n', // Finishes line
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(fragmentedChunks),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "groq-llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete,
        })
      );

      await act(async () => {
        await result.current.send([sampleUserMessage]);
      });

      expect(onStreamComplete).toHaveBeenCalledTimes(1);
      const completedMsg: ChatMessage = onStreamComplete.mock.calls[0][0];
      expect(completedMsg.content).toBe(
        "Hello, world! Welcome to Radiance. How can I help you today?"
      );
    });

    it("normalizes Windows CRLF (\\r\\n) line endings cleanly without syntax errors", async () => {
      const onStreamComplete = vi.fn();
      const crlfChunks = ['0:"First line."\r\n', '0:" Second line."\r\n'];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(crlfChunks),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "groq-llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete,
        })
      );

      await act(async () => {
        await result.current.send([sampleUserMessage]);
      });

      expect(onStreamComplete).toHaveBeenCalledTimes(1);
      expect(onStreamComplete.mock.calls[0][0].content).toBe("First line. Second line.");
    });

    it("flushes residual un-terminated buffer upon stream EOF", async () => {
      const onStreamComplete = vi.fn();
      // Server closes connection without a trailing \n on final chunk
      const chunks = ['0:"Stream ', 'without trailing newline"'];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(chunks),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "groq-llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete,
        })
      );

      await act(async () => {
        await result.current.send([sampleUserMessage]);
      });

      expect(onStreamComplete).toHaveBeenCalledTimes(1);
      expect(onStreamComplete.mock.calls[0][0].content).toBe(
        "Stream without trailing newline"
      );
    });

    it("safely ignores Vercel AI SDK metadata lines (d:, e:) without corruption", async () => {
      const onStreamComplete = vi.fn();
      const chunks = [
        '0:"Valid token "\n',
        'd:{"finishReason":"stop","usage":{"promptTokens":10,"completionTokens":5}}\n',
        'e:{"finishReason":"stop"}\n',
        '0:"after meta."\n',
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(chunks),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "groq-llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete,
        })
      );

      await act(async () => {
        await result.current.send([sampleUserMessage]);
      });

      expect(onStreamComplete).toHaveBeenCalledTimes(1);
      expect(onStreamComplete.mock.calls[0][0].content).toBe("Valid token after meta.");
    });
  });

  describe("2. Immediate Stop & Abort Lifecycle with Partial Preservation", () => {
    it("preserves accumulated partial tokens when stop() is called mid-stream", async () => {
      const onStreamComplete = vi.fn();
      const chunks = [
        '0:"Token 1 "\n',
        '0:"Token 2 "\n',
        '0:"Token 3 "\n',
        '0:"Token 4 "\n',
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

      // Trigger send without awaiting completion immediately
      act(() => {
        result.current.send([sampleUserMessage]);
      });

      expect(result.current.isGenerating).toBe(true);

      // Allow first two tokens to be processed (~45ms)
      await act(async () => {
        await new Promise((r) => setTimeout(r, 45));
      });

      // User clicks stop
      act(() => {
        result.current.stop();
      });

      // Allow cleanup microtasks to flush
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.streamingContent).toBe("");
      expect(result.current.streamError).toBeNull();

      // Partial tokens must have been preserved as a completed message
      expect(onStreamComplete).toHaveBeenCalledTimes(1);
      const savedMsg: ChatMessage = onStreamComplete.mock.calls[0][0];
      expect(savedMsg.role).toBe("assistant");
      expect(savedMsg.content.length).toBeGreaterThan(0);
      expect(savedMsg.content).toContain("Token 1");
    });

    it("cancels cleanly without committing an empty message when stopped before first token (TTFT)", async () => {
      const onStreamComplete = vi.fn();
      const chunks = ['0:"Delayed first token"\n'];
      const { stream, abort } = createDelayedStream(chunks, 20, 100);

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

      // Immediate stop before first chunk resolves (TTFT window)
      act(() => {
        result.current.stop();
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.streamingContent).toBe("");
      expect(onStreamComplete).not.toHaveBeenCalled();
    });

    it("discards accumulated partial tokens when stop(true) is explicitly invoked", async () => {
      const onStreamComplete = vi.fn();
      const chunks = ['0:"Token 1 "\n', '0:"Token 2 "\n', '0:"Token 3 "\n'];
      const { stream, abort } = createDelayedStream(chunks, 60);

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
        await new Promise((r) => setTimeout(r, 70));
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
  });

  describe("3. Structured Error States & In-Stream Error Recovery", () => {
    it("captures HTTP 429 rate limit response into streamError and invokes onError", async () => {
      const onError = vi.fn();
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 429,
        json: async () => ({
          error: "Rate limit exceeded. Please wait 10 seconds.",
        }),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "groq-llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete: vi.fn(),
          onError,
        })
      );

      await act(async () => {
        await result.current.send([sampleUserMessage]);
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.streamError).not.toBeNull();
      expect(result.current.streamError?.message).toContain("Rate limit exceeded");
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("captures network disconnection errors cleanly", async () => {
      const onError = vi.fn();
      global.fetch = vi.fn().mockRejectedValue(new Error("Failed to fetch (network offline)"));

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "groq-llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete: vi.fn(),
          onError,
        })
      );

      await act(async () => {
        await result.current.send([sampleUserMessage]);
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.streamError?.message).toContain("network offline");
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("captures in-stream Vercel AI SDK 3: error chunks into streamError", async () => {
      const onError = vi.fn();
      const chunks = [
        '0:"Initial thinking token..."\n',
        '3:"Provider quota exceeded mid-stream"\n',
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: createMockStream(chunks),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "groq-llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete: vi.fn(),
          onError,
        })
      );

      await act(async () => {
        await result.current.send([sampleUserMessage]);
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.streamError?.message).toContain("Provider quota exceeded mid-stream");
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("clears streamError when a subsequent request is triggered", async () => {
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: async () => ({ error: "Internal Server Error" }),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "groq-llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.send([sampleUserMessage]);
      });

      expect(result.current.streamError).not.toBeNull();

      // Subsequent successful response
      global.fetch = vi.fn().mockResolvedValueOnce({
        ok: true,
        status: 200,
        body: createMockStream(['0:"Success"\n']),
      });

      await act(async () => {
        await result.current.send([sampleUserMessage]);
      });

      expect(result.current.streamError).toBeNull();
    });
  });

  describe("4. Retry Mechanism (retryLast)", () => {
    it("re-submits the exact prior prompt messages when retryLast() is invoked", async () => {
      const fetchMock = vi
        .fn()
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          json: async () => ({ error: "Temporary outage" }),
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: createMockStream(['0:"Recovered answer"\n']),
        });

      global.fetch = fetchMock;

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "groq-llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete: vi.fn(),
        })
      );

      // First call fails
      await act(async () => {
        await result.current.send([sampleUserMessage]);
      });

      expect(result.current.streamError).not.toBeNull();
      expect(fetchMock).toHaveBeenCalledTimes(1);

      // retryLast re-submits
      await act(async () => {
        await result.current.retryLast();
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      const secondCallBody = JSON.parse(fetchMock.mock.calls[1][1].body);
      expect(secondCallBody.messages).toHaveLength(1);
      expect(secondCallBody.messages[0].content).toBe(sampleUserMessage.content);
      expect(result.current.streamError).toBeNull();
    });

    it("safely no-ops if retryLast() is called before any send()", async () => {
      const fetchMock = vi.fn();
      global.fetch = fetchMock;

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "groq-llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete: vi.fn(),
        })
      );

      await act(async () => {
        await result.current.retryLast();
      });

      expect(fetchMock).not.toHaveBeenCalled();
    });
  });

  describe("5. Zero Artificial Typewriter Delay", () => {
    it("delivers tokens synchronously without timer queues", async () => {
      vi.useFakeTimers();

      try {
        const onStreamComplete = vi.fn();
        const chunks = ['0:"Instant token 1"\n', '0:" Instant token 2"\n'];

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          body: createMockStream(chunks),
        });

        const { result } = renderHook(() =>
          useChatStream({
            modelId: "groq-llama-3.3-70b",
            tone: "default",
            language: "en",
            onStreamComplete,
          })
        );

        await act(async () => {
          await result.current.send([sampleUserMessage]);
        });

        // 0 pending timers: confirms no typewriter delay was scheduled
        expect(vi.getTimerCount()).toBe(0);
        expect(onStreamComplete).toHaveBeenCalledTimes(1);
        expect(onStreamComplete.mock.calls[0][0].content).toBe(
          "Instant token 1 Instant token 2"
        );
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("6. Concurrent Submission Guard", () => {
    it("ignores second send() while inference is actively generating", async () => {
      const { stream, abort } = createDelayedStream(['0:"Long task"\n'], 80);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: stream,
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "groq-llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete: vi.fn(),
        })
      );

      act(() => {
        result.current.send([sampleUserMessage]);
      });

      expect(result.current.isGenerating).toBe(true);

      // Concurrent second send
      act(() => {
        result.current.send([
          {
            id: "msg_user_2",
            role: "user",
            content: "Second message",
            createdAt: Date.now(),
          },
        ]);
      });

      // Fetch should only have been called once
      expect(global.fetch).toHaveBeenCalledTimes(1);

      // Cleanup
      act(() => {
        result.current.stop();
        abort();
      });
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
    });
  });
});
