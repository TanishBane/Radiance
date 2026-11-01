import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useChatStream } from "@/features/chat/hooks/use-chat-stream";
import { ChatMessage } from "@/lib/types/chat";

// Helper: Convert array of Uint8Arrays into a ReadableStream
function createUint8Stream(chunks: Uint8Array[]): ReadableStream<Uint8Array> {
  return new ReadableStream({
    start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });
}

// Helper: Convert string chunks into a ReadableStream
function createStringStream(chunks: string[]): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  return createUint8Stream(chunks.map((c) => encoder.encode(c)));
}

// Helper: Controlled delayed stream with cancellation listener
function createControlledDelayedStream(
  chunks: string[],
  stepDelayMs = 25,
  initialDelayMs = 0
) {
  const encoder = new TextEncoder();
  let isAborted = false;
  let streamController: ReadableStreamDefaultController<Uint8Array> | null = null;

  const stream = new ReadableStream<Uint8Array>({
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
        streamController.error(
          new DOMException("The user aborted a request.", "AbortError")
        );
      } catch {}
    }
  };

  return { stream, abort };
}

describe("Adversarial Empirical Challenge — M2 Stream Buffer, Abort & Network Stress", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  const samplePrompt: ChatMessage = {
    id: "prompt_test_1",
    role: "user",
    content: "Adversarial stream test",
    createdAt: Date.now(),
  };

  describe("1. Byte-Level & Multibyte UTF-8 Slicing Stress", () => {
    it("reassembles complete message when chopped into strict 1-byte chunks", async () => {
      const onStreamComplete = vi.fn();
      const tokens = [
        "Hello World! ",
        "Mathematical: $\\int_0^1 x^2 dx = \\frac{1}{3}$ ",
        "Emojis: 🚀 ✨ 👨‍👩‍👧‍👦 🎉 ",
        'Code: `console.log("OK");`',
      ];
      const rawText = tokens.map((t) => `0:${JSON.stringify(t)}\n`).join("");

      const encoder = new TextEncoder();
      const fullBytes = encoder.encode(rawText);

      // Slice into individual 1-byte chunks
      const oneByteChunks: Uint8Array[] = [];
      for (let i = 0; i < fullBytes.length; i++) {
        oneByteChunks.push(fullBytes.subarray(i, i + 1));
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: createUint8Stream(oneByteChunks),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete,
        })
      );

      await act(async () => {
        await result.current.send([samplePrompt]);
      });

      expect(onStreamComplete).toHaveBeenCalledTimes(1);
      const output: ChatMessage = onStreamComplete.mock.calls[0][0];
      const expected = tokens.join("");
      expect(output.content).toBe(expected);
      expect(result.current.isGenerating).toBe(false);
      expect(result.current.streamError).toBeNull();
    });

    it("survives chunks bisecting 2-byte, 3-byte, and 4-byte UTF-8 code units", async () => {
      const onStreamComplete = vi.fn();
      const encoder = new TextEncoder();

      // Characters with varying UTF-8 byte lengths:
      // 'é' -> 2 bytes [0xC3, 0xA9]
      // '€' -> 3 bytes [0xE2, 0x82, 0xAC]
      // '🚀' -> 4 bytes [0xF0, 0x9F, 0x9A, 0x80]
      const text = '0:"Café: 10€, Flight: 🚀!"\n';
      const bytes = encoder.encode(text);

      // Locate 'é' in the byte array:
      const eIndex = text.indexOf("é");
      const cafeBytesOffset = encoder.encode(text.slice(0, eIndex)).length;

      // Locate '€':
      const euroIndex = text.indexOf("€");
      const euroBytesOffset = encoder.encode(text.slice(0, euroIndex)).length;

      // Locate '🚀':
      const rocketIndex = text.indexOf("🚀");
      const rocketBytesOffset = encoder.encode(text.slice(0, rocketIndex)).length;

      // Deliberately cut:
      // Chunk 1: up to first byte of 'é' (splits 'é' [0xC3 | 0xA9])
      const chunk1 = bytes.subarray(0, cafeBytesOffset + 1);
      // Chunk 2: second byte of 'é' up to second byte of '€' (splits '€' [0xE2, 0x82 | 0xAC])
      const chunk2 = bytes.subarray(cafeBytesOffset + 1, euroBytesOffset + 2);
      // Chunk 3: third byte of '€' up to third byte of '🚀' (splits '🚀' [0xF0, 0x9F, 0x9A | 0x80])
      const chunk3 = bytes.subarray(euroBytesOffset + 2, rocketBytesOffset + 3);
      // Chunk 4: fourth byte of '🚀' to end
      const chunk4 = bytes.subarray(rocketBytesOffset + 3);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: createUint8Stream([chunk1, chunk2, chunk3, chunk4]),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete,
        })
      );

      await act(async () => {
        await result.current.send([samplePrompt]);
      });

      expect(onStreamComplete).toHaveBeenCalledTimes(1);
      expect(onStreamComplete.mock.calls[0][0].content).toBe("Café: 10€, Flight: 🚀!");
    });

    it("handles chopped JSON escape sequences across packet boundaries", async () => {
      const onStreamComplete = vi.fn();
      const rawContent = 'Line 1\nLine 2 with "quoted text" and \\ path.';
      // Real wire representation of this token from Vercel AI SDK
      const wireLine = `0:${JSON.stringify(rawContent)}\n`;

      // Cut exactly across escape sequences:
      // wireLine contains: 0:"Line 1\nLine 2 with \"quoted text\" and \\ path."\n
      const idxOfNewlineEscape = wireLine.indexOf("\\n");
      const idxOfQuoteEscape = wireLine.indexOf('\\"');
      const idxOfBackslashEscape = wireLine.indexOf("\\\\");

      // Slice 1: cut right in the middle of \n (after \)
      const chunk1 = wireLine.slice(0, idxOfNewlineEscape + 1);
      // Slice 2: from 'n' up to and including the backslash in \"
      const chunk2 = wireLine.slice(idxOfNewlineEscape + 1, idxOfQuoteEscape + 1);
      // Slice 3: from '"' up to and including the first backslash in \\
      const chunk3 = wireLine.slice(idxOfQuoteEscape + 1, idxOfBackslashEscape + 1);
      // Slice 4: rest of the line
      const chunk4 = wireLine.slice(idxOfBackslashEscape + 1);

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: createStringStream([chunk1, chunk2, chunk3, chunk4]),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete,
        })
      );

      await act(async () => {
        await result.current.send([samplePrompt]);
      });

      expect(onStreamComplete).toHaveBeenCalledTimes(1);
      expect(onStreamComplete.mock.calls[0][0].content).toBe(rawContent);
    });

    it("flushes residual buffer on EOF when stream lacks trailing newline with multibyte tokens", async () => {
      const onStreamComplete = vi.fn();
      // Server closes stream abruptly without trailing \n
      const chunks = [
        '0:"Prefix "\n',
        '0:"Final token without newline with Unicode: 🌟 & π"',
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: createStringStream(chunks),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete,
        })
      );

      await act(async () => {
        await result.current.send([samplePrompt]);
      });

      expect(onStreamComplete).toHaveBeenCalledTimes(1);
      expect(onStreamComplete.mock.calls[0][0].content).toBe(
        "Prefix Final token without newline with Unicode: 🌟 & π"
      );
    });
  });

  describe("2. Rapid Abort vs Mid-Stream Abort Stress", () => {
    it("handles immediate synchronous stop() before network headers resolve", async () => {
      const onStreamComplete = vi.fn();
      const onError = vi.fn();

      const { stream, abort } = createControlledDelayedStream(
        ['0:"Never reached"\n'],
        20,
        200
      );

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
          modelId: "llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete,
          onError,
        })
      );

      // Trigger send and immediately call stop synchronously in the same act block
      act(() => {
        result.current.send([samplePrompt]);
        result.current.stop();
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.streamingContent).toBe("");
      expect(result.current.streamError).toBeNull();
      expect(onStreamComplete).not.toHaveBeenCalled();
      expect(onError).not.toHaveBeenCalled();
    });

    it("preserves exactly the accumulated tokens when mid-stream abort is executed", async () => {
      const onStreamComplete = vi.fn();
      const chunks = [
        '0:"Alpha "\n',
        '0:"Beta "\n',
        '0:"Gamma "\n',
        '0:"Delta "\n',
      ];

      const { stream, abort } = createControlledDelayedStream(chunks, 40);

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
          modelId: "llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete,
        })
      );

      act(() => {
        result.current.send([samplePrompt]);
      });

      // Wait for Alpha and Beta (~60ms)
      await act(async () => {
        await new Promise((r) => setTimeout(r, 60));
      });

      // Abort mid-stream
      act(() => {
        result.current.stop();
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 30));
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.streamingContent).toBe("");
      expect(result.current.streamError).toBeNull();
      expect(onStreamComplete).toHaveBeenCalledTimes(1);

      const savedMsg: ChatMessage = onStreamComplete.mock.calls[0][0];
      expect(savedMsg.role).toBe("assistant");
      expect(savedMsg.content).toContain("Alpha");
      expect(savedMsg.content).not.toContain("Delta");
    });

    it("permits immediate re-send after stop() without deadlock or state bleed", async () => {
      const onStreamComplete = vi.fn();

      const { stream: stream1, abort: abort1 } = createControlledDelayedStream(
        ['0:"Cancelled prompt"\n'],
        40,
        100
      );

      global.fetch = vi
        .fn()
        .mockImplementationOnce((_url, options) => {
          options.signal?.addEventListener("abort", () => {
            abort1();
          });
          return Promise.resolve({
            ok: true,
            status: 200,
            body: stream1,
          });
        })
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          body: createStringStream(['0:"Second prompt success"\n']),
        });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete,
        })
      );

      // Start first send and immediately abort
      act(() => {
        result.current.send([samplePrompt]);
        result.current.stop();
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(result.current.isGenerating).toBe(false);

      // Send second prompt
      await act(async () => {
        await result.current.send([
          {
            id: "prompt_test_2",
            role: "user",
            content: "Second message",
            createdAt: Date.now(),
          },
        ]);
      });

      expect(onStreamComplete).toHaveBeenCalledTimes(1);
      expect(onStreamComplete.mock.calls[0][0].content).toBe("Second prompt success");
      expect(result.current.streamError).toBeNull();
    });
  });

  describe("3. Server Errors (`3:...`) & HTTP Error Codes Stress", () => {
    it("handles HTTP 500 with JSON error payload", async () => {
      const onError = vi.fn();
      const onStreamComplete = vi.fn();

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: "Database connection failed" }),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete,
          onError,
        })
      );

      await act(async () => {
        await result.current.send([samplePrompt]);
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.streamError).not.toBeNull();
      expect(result.current.streamError?.message).toBe("Database connection failed");
      expect(onError).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Database connection failed" })
      );
      expect(onStreamComplete).not.toHaveBeenCalled();
    });

    it("handles HTTP 502 / 503 / 504 with non-JSON HTML error body gracefully", async () => {
      const onError = vi.fn();

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 504,
        json: async () => {
          throw new SyntaxError("Unexpected token < in JSON at position 0");
        },
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete: vi.fn(),
          onError,
        })
      );

      await act(async () => {
        await result.current.send([samplePrompt]);
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.streamError?.message).toBe("Server responded with status 504");
      expect(onError).toHaveBeenCalledTimes(1);
    });

    it("handles in-stream Vercel AI SDK 3: error part formatted as a JSON object", async () => {
      const onError = vi.fn();
      const onStreamComplete = vi.fn();

      const chunks = [
        '0:"Initial thinking tokens..."\n',
        '3:{"message":"Context window exceeded limit of 128k","code":"CONTEXT_LIMIT"}\n',
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: createStringStream(chunks),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete,
          onError,
        })
      );

      await act(async () => {
        await result.current.send([samplePrompt]);
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.streamError?.message).toBe(
        "Context window exceeded limit of 128k"
      );
      expect(onError).toHaveBeenCalledTimes(1);
      expect(onStreamComplete).not.toHaveBeenCalled();
    });

    it("flushes in-stream 3: error part arriving at EOF without a trailing newline", async () => {
      const onError = vi.fn();
      // Notice: No trailing \n
      const chunks = ['0:"Some text"\n', '3:"Unterminated fatal stream error"'];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        status: 200,
        body: createStringStream(chunks),
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "llama-3.3-70b",
          tone: "default",
          language: "en",
          onStreamComplete: vi.fn(),
          onError,
        })
      );

      await act(async () => {
        await result.current.send([samplePrompt]);
      });

      expect(result.current.isGenerating).toBe(false);
      expect(result.current.streamError?.message).toBe(
        "Unterminated fatal stream error"
      );
      expect(onError).toHaveBeenCalledTimes(1);
    });
  });

  describe("4. Pure Synchronous Token Ingestion Verification", () => {
    it("ingests 50 rapid stream chunks without triggering artificial timers", async () => {
      vi.useFakeTimers();

      try {
        const onStreamComplete = vi.fn();
        const chunks: string[] = [];
        for (let i = 0; i < 50; i++) {
          chunks.push(`0:"token_${i} "\n`);
        }

        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          body: createStringStream(chunks),
        });

        const { result } = renderHook(() =>
          useChatStream({
            modelId: "llama-3.3-70b",
            tone: "default",
            language: "en",
            onStreamComplete,
          })
        );

        await act(async () => {
          await result.current.send([samplePrompt]);
        });

        // Ensure zero timers are pending
        expect(vi.getTimerCount()).toBe(0);
        expect(onStreamComplete).toHaveBeenCalledTimes(1);
        expect(onStreamComplete.mock.calls[0][0].content).toContain("token_0");
        expect(onStreamComplete.mock.calls[0][0].content).toContain("token_49");
      } finally {
        vi.useRealTimers();
      }
    });
  });

  describe("5. High-Frequency Randomized Chunk Fuzzing", () => {
    it("fuzz-tests arbitrary randomized chunk boundaries across 20 iterations", async () => {
      const groundTruthTokens = [
        "Lorem ipsum dolor sit amet, ",
        "consectetur adipiscing elit. ",
        "Sed do eiusmod tempor incididunt ut labore. ",
        "Math: $\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$. ",
        "Emojis: 🚀 🤖 ⚡ 💎 🌈. ",
        "Code: ```ts\nconst x: number = 42;\n```\n",
      ];
      const fullStreamText = groundTruthTokens
        .map((t) => `0:${JSON.stringify(t)}\n`)
        .join("");
      const expectedContent = groundTruthTokens.join("");

      const encoder = new TextEncoder();
      const fullBytes = encoder.encode(fullStreamText);

      // Run 20 randomized slice executions
      for (let run = 0; run < 20; run++) {
        const slices: Uint8Array[] = [];
        let offset = 0;

        while (offset < fullBytes.length) {
          // Random chunk size between 1 and 17 bytes
          const chunkSize = Math.min(
            Math.floor(Math.random() * 17) + 1,
            fullBytes.length - offset
          );
          slices.push(fullBytes.subarray(offset, offset + chunkSize));
          offset += chunkSize;
        }

        const onStreamComplete = vi.fn();
        global.fetch = vi.fn().mockResolvedValue({
          ok: true,
          status: 200,
          body: createUint8Stream(slices),
        });

        const { result } = renderHook(() =>
          useChatStream({
            modelId: "llama-3.3-70b",
            tone: "default",
            language: "en",
            onStreamComplete,
          })
        );

        await act(async () => {
          await result.current.send([samplePrompt]);
        });

        expect(onStreamComplete).toHaveBeenCalledTimes(1);
        expect(onStreamComplete.mock.calls[0][0].content).toBe(expectedContent);
      }
    });
  });

  describe("6. Concurrent Guard & Retry Model Preservation", () => {
    it("strictly preserves model override when retryLast() is invoked", async () => {
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
          body: createStringStream(['0:"Success with override"\n']),
        });

      global.fetch = fetchMock;

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "default-model",
          tone: "concise",
          language: "fr",
          onStreamComplete: vi.fn(),
        })
      );

      // Send with override model
      await act(async () => {
        await result.current.send([samplePrompt], "override-custom-model");
      });

      expect(result.current.streamError).not.toBeNull();
      expect(fetchMock).toHaveBeenCalledTimes(1);
      const firstCallBody = JSON.parse(fetchMock.mock.calls[0][1].body);
      expect(firstCallBody.modelId).toBe("override-custom-model");

      // RetryLast should retain "override-custom-model"
      await act(async () => {
        await result.current.retryLast();
      });

      expect(fetchMock).toHaveBeenCalledTimes(2);
      const secondCallBody = JSON.parse(fetchMock.mock.calls[1][1].body);
      expect(secondCallBody.modelId).toBe("override-custom-model");
      expect(result.current.streamError).toBeNull();
    });
  });
});
