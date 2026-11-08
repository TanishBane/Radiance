import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import RadianceApp from "@/features/chat/components/radiance-app";
import { safeLocalStorage } from "@/lib/utils/storage";
import { conversationService } from "@/lib/db/conversations";

// Mock IntroSplash
vi.mock("@/components/branding/intro-splash", () => ({
  IntroSplash: ({ onComplete }: { onComplete?: () => void }) => {
    React.useEffect(() => {
      onComplete?.();
    }, [onComplete]);
    return null;
  },
}));

function createControllableStream() {
  const encoder = new TextEncoder();
  let controllerRef: ReadableStreamDefaultController<Uint8Array> | null = null;
  let isCancelled = false;

  const stream = new ReadableStream<Uint8Array>({
    start(ctrl) {
      controllerRef = ctrl;
    },
    cancel() {
      isCancelled = true;
    },
  });

  const pushToken = (text: string) => {
    if (controllerRef && !isCancelled) {
      controllerRef.enqueue(encoder.encode(`0:${JSON.stringify(text)}\n`));
    }
  };

  const abort = () => {
    if (controllerRef && !isCancelled) {
      isCancelled = true;
      try {
        controllerRef.error(new DOMException("The user aborted a request.", "AbortError"));
      } catch {}
    }
  };

  return { stream, pushToken, abort };
}

describe("Empirical Challenge: Composer Stop Button Retains Partial Tokens (Feature 18)", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    safeLocalStorage.deleteAllConversations();
    vi.clearAllMocks();

    if (typeof window !== "undefined") {
      window.matchMedia = vi.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      window.URL.createObjectURL = vi.fn().mockReturnValue("blob:http://localhost/test-uuid");
      window.URL.revokeObjectURL = vi.fn();
      window.ResizeObserver = class {
        observe() {}
        unobserve() {}
        disconnect() {}
      } as any;
    }
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  it("retains partial tokens when user clicks stop button in composer", async () => {
    const streamControl = createControllableStream();
    let fetchSignal: AbortSignal | undefined;

    global.fetch = vi.fn().mockImplementation((_url, options) => {
      fetchSignal = options?.signal;
      options?.signal?.addEventListener("abort", () => {
        streamControl.abort();
      });
      return Promise.resolve({
        ok: true,
        status: 200,
        body: streamControl.stream,
      });
    });

    render(<RadianceApp />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask RADIANCE anything/i)).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
    const sendBtn = screen.getByTestId("send-button");

    fireEvent.change(textarea, { target: { value: "Tell me a story" } });
    await act(async () => {
      fireEvent.click(sendBtn);
    });

    // Push tokens
    await act(async () => {
      streamControl.pushToken("Once upon a time in a faraway kingdom");
    });

    // Verify streaming is active
    expect(screen.getByTestId("streaming-message")).toBeDefined();
    expect(fetchSignal?.aborted).toBe(false);

    // Stop button is visible in composer
    const stopButton = screen.getByTestId("stop-button");
    expect(stopButton).toBeDefined();

    // User clicks the stop button
    await act(async () => {
      fireEvent.click(stopButton);
    });

    // Fetch signal must be aborted
    expect(fetchSignal?.aborted).toBe(true);

    // Allow state to settle
    await act(async () => {
      await new Promise((r) => setTimeout(r, 200));
    });

    // Streaming placeholder must be removed
    expect(screen.queryByTestId("streaming-message")).toBeNull();

    // Partial tokens MUST be retained as a committed message in workspace (Feature 18)
    const assistantMessage = screen.queryByText(/Once upon a time in a faraway kingdom/i);
    expect(assistantMessage).not.toBeNull();

    // In storage, conversation must have 2 messages: user prompt and partial assistant response
    const conversations = await conversationService.list();
    expect(conversations.length).toBe(1);
    expect(conversations[0].messages.length).toBe(2);
    expect(conversations[0].messages[1].role).toBe("assistant");
    expect(conversations[0].messages[1].content).toBe("Once upon a time in a faraway kingdom");
  });

  it("handles rapid burst of multiple stop button clicks without duplicate assistant messages", async () => {
    const streamControl = createControllableStream();
    let fetchSignal: AbortSignal | undefined;

    global.fetch = vi.fn().mockImplementation((_url, options) => {
      fetchSignal = options?.signal;
      options?.signal?.addEventListener("abort", () => {
        streamControl.abort();
      });
      return Promise.resolve({
        ok: true,
        status: 200,
        body: streamControl.stream,
      });
    });

    render(<RadianceApp />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask RADIANCE anything/i)).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
    const sendBtn = screen.getByTestId("send-button");

    fireEvent.change(textarea, { target: { value: "Tell me a fast story" } });
    await act(async () => {
      fireEvent.click(sendBtn);
    });

    await act(async () => {
      streamControl.pushToken("Once upon a rapid burst test");
    });

    const stopButton = screen.getByTestId("stop-button");
    expect(stopButton).toBeDefined();

    // Rapid burst of 5 clicks
    await act(async () => {
      fireEvent.click(stopButton);
      fireEvent.click(stopButton);
      fireEvent.click(stopButton);
      fireEvent.click(stopButton);
      fireEvent.click(stopButton);
    });

    expect(fetchSignal?.aborted).toBe(true);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 200));
    });

    expect(screen.queryByTestId("streaming-message")).toBeNull();

    // Verify exactly ONE assistant message exists with the partial content
    const conversations = await conversationService.list();
    expect(conversations.length).toBe(1);
    expect(conversations[0].messages.length).toBe(2);
    expect(conversations[0].messages[0].role).toBe("user");
    expect(conversations[0].messages[1].role).toBe("assistant");
    expect(conversations[0].messages[1].content).toBe("Once upon a rapid burst test");

    const matches = screen.getAllByText(/Once upon a rapid burst test/i);
    expect(matches.length).toBe(1);
  });

  it("cleanly cancels inference when stop is clicked before any tokens arrive without creating phantom message", async () => {
    const streamControl = createControllableStream();
    let fetchSignal: AbortSignal | undefined;

    global.fetch = vi.fn().mockImplementation((_url, options) => {
      fetchSignal = options?.signal;
      options?.signal?.addEventListener("abort", () => {
        streamControl.abort();
      });
      return Promise.resolve({
        ok: true,
        status: 200,
        body: streamControl.stream,
      });
    });

    render(<RadianceApp />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask RADIANCE anything/i)).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
    const sendBtn = screen.getByTestId("send-button");

    fireEvent.change(textarea, { target: { value: "Waiting for TTFT" } });
    await act(async () => {
      fireEvent.click(sendBtn);
    });

    // Zero tokens pushed — click stop immediately during TTFT
    const stopButton = screen.getByTestId("stop-button");
    expect(stopButton).toBeDefined();

    await act(async () => {
      fireEvent.click(stopButton);
    });

    expect(fetchSignal?.aborted).toBe(true);

    await act(async () => {
      await new Promise((r) => setTimeout(r, 200));
    });

    // Zero-token abort MUST NOT commit an empty assistant message
    const conversations = await conversationService.list();
    // Storage only commits when an assistant message completes; zero-token abort preserves no phantom message
    expect(conversations.length).toBe(0);

    // User message remains visible in workspace
    expect(screen.getByText(/Waiting for TTFT/i)).toBeDefined();
    // No assistant message or placeholder
    expect(screen.queryByText(/\*\(No response generated\)\*/i)).toBeNull();

    // Send button should be restored in composer
    expect(screen.queryByTestId("stop-button")).toBeNull();
    expect(screen.getByTestId("send-button")).toBeDefined();
  });

  it("preserves unclosed fenced code block cleanly without throwing formatting exceptions", async () => {
    const streamControl = createControllableStream();

    global.fetch = vi.fn().mockImplementation((_url, options) => {
      options?.signal?.addEventListener("abort", () => {
        streamControl.abort();
      });
      return Promise.resolve({
        ok: true,
        status: 200,
        body: streamControl.stream,
      });
    });

    render(<RadianceApp />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask RADIANCE anything/i)).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
    const sendBtn = screen.getByTestId("send-button");

    fireEvent.change(textarea, { target: { value: "Show me code" } });
    await act(async () => {
      fireEvent.click(sendBtn);
    });

    const partialCode = "Here is the code:\n```typescript\nfunction calculateTax(subtotal: number) {\n  return subtotal * 0.15;";
    await act(async () => {
      streamControl.pushToken(partialCode);
    });

    const stopButton = screen.getByTestId("stop-button");
    await act(async () => {
      fireEvent.click(stopButton);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 200));
    });

    const conversations = await conversationService.list();
    expect(conversations.length).toBe(1);
    expect(conversations[0].messages[1].content).toBe(partialCode);

    // Check that code block is rendered safely in the DOM
    expect(screen.getByText(/calculateTax/i)).toBeDefined();
  });

  it("discards whitespace-only stream when stop is clicked without creating phantom message", async () => {
    const streamControl = createControllableStream();

    global.fetch = vi.fn().mockImplementation((_url, options) => {
      options?.signal?.addEventListener("abort", () => {
        streamControl.abort();
      });
      return Promise.resolve({
        ok: true,
        status: 200,
        body: streamControl.stream,
      });
    });

    render(<RadianceApp />);

    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Ask RADIANCE anything/i)).toBeDefined();
    });

    const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
    const sendBtn = screen.getByTestId("send-button");

    fireEvent.change(textarea, { target: { value: "Whitespace test" } });
    await act(async () => {
      fireEvent.click(sendBtn);
    });

    await act(async () => {
      streamControl.pushToken("   \n\n\t  ");
    });

    const stopButton = screen.getByTestId("stop-button");
    await act(async () => {
      fireEvent.click(stopButton);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 200));
    });

    const conversations = await conversationService.list();
    // Storage only commits when an assistant message completes; whitespace-only abort preserves no phantom message
    expect(conversations.length).toBe(0);
    expect(screen.getByText(/Whitespace test/i)).toBeDefined();
    expect(screen.queryByText(/\*\(No response generated\)\*/i)).toBeNull();
  });

  it("guarantees stop() with various truthy non-boolean arguments preserves tokens and only strictly true discards", async () => {
    const onStreamComplete = vi.fn();
    const { renderHook } = await import("@testing-library/react");
    const { useChatStream } = await import("@/features/chat/hooks/use-chat-stream");

    // Test a matrix of truthy non-boolean values that must NEVER discard
    const nonBooleanTruthyValues = [
      { type: "click" },
      new Event("click"),
      "true",
      "discard",
      1,
      -1,
      {},
      [],
      () => {},
      Symbol("stop"),
    ];

    for (const val of nonBooleanTruthyValues) {
      onStreamComplete.mockClear();
      const streamControl = createControllableStream();

      global.fetch = vi.fn().mockImplementation((_url, options) => {
        options?.signal?.addEventListener("abort", () => {
          streamControl.abort();
        });
        return Promise.resolve({
          ok: true,
          status: 200,
          body: streamControl.stream,
        });
      });

      const { result } = renderHook(() =>
        useChatStream({
          modelId: "test-model",
          tone: "default",
          language: "en",
          onStreamComplete,
        })
      );

      act(() => {
        result.current.send([{ id: "1", role: "user", content: "Test", createdAt: Date.now() }]);
      });

      await act(async () => {
        streamControl.pushToken("Token preserved");
      });

      act(() => {
        (result.current.stop as any)(val);
      });

      await act(async () => {
        await new Promise((r) => setTimeout(r, 50));
      });

      expect(onStreamComplete).toHaveBeenCalledTimes(1);
      expect(onStreamComplete.mock.calls[0][0].content).toBe("Token preserved");
    }

    // Now verify that discardPartial === true DOES discard
    onStreamComplete.mockClear();
    const streamControl = createControllableStream();

    global.fetch = vi.fn().mockImplementation((_url, options) => {
      options?.signal?.addEventListener("abort", () => {
        streamControl.abort();
      });
      return Promise.resolve({
        ok: true,
        status: 200,
        body: streamControl.stream,
      });
    });

    const { result } = renderHook(() =>
      useChatStream({
        modelId: "test-model",
        tone: "default",
        language: "en",
        onStreamComplete,
      })
    );

    act(() => {
      result.current.send([{ id: "2", role: "user", content: "Test Discard", createdAt: Date.now() }]);
    });

    await act(async () => {
      streamControl.pushToken("Token to discard");
    });

    act(() => {
      result.current.stop(true);
    });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });

    expect(onStreamComplete).not.toHaveBeenCalled();
  });
});
