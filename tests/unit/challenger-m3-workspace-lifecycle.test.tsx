import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { ChatWorkspace } from "@/features/chat/components/chat-workspace";
import RadianceApp from "@/features/chat/components/radiance-app";
import { ChatMessage } from "@/lib/types/chat";
import { safeLocalStorage } from "@/lib/utils/storage";
import { conversationService } from "@/lib/db/conversations";

// Mock IntroSplash to render nothing and immediately call onComplete
vi.mock("@/components/branding/intro-splash", () => ({
  IntroSplash: ({ onComplete }: { onComplete?: () => void }) => {
    React.useEffect(() => {
      onComplete?.();
    }, [onComplete]);
    return null;
  },
}));

// Mock SpeechSynthesis
class MockSpeechSynthesisUtterance {
  text: string;
  lang = "en-US";
  rate = 1.0;
  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: (() => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

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

  const close = () => {
    if (controllerRef && !isCancelled) {
      try {
        controllerRef.close();
      } catch {}
    }
  };

  const error = (err: Error) => {
    if (controllerRef && !isCancelled) {
      try {
        controllerRef.error(err);
      } catch {}
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

  return { stream, pushToken, close, error, abort };
}

describe("Milestone 3 Challenger 2: Workspace Lifecycle, TTFT & Session Contamination", () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    safeLocalStorage.deleteAllConversations();
    vi.clearAllMocks();

    // Setup global browser API mocks
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
      configurable: true,
      value: 1000,
    });
    Object.defineProperty(HTMLElement.prototype, "scrollTop", {
      configurable: true,
      writable: true,
      value: 0,
    });

    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

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
      (window as any).SpeechSynthesisUtterance = MockSpeechSynthesisUtterance;
      window.speechSynthesis = {
        speak: vi.fn(),
        cancel: vi.fn(),
      } as any;
    }
  });

  afterEach(() => {
    global.fetch = originalFetch;
    vi.restoreAllMocks();
  });

  // =========================================================================
  // 1. TTFT Handoff & Progressive Stream Invariants in ChatWorkspace
  // =========================================================================
  describe("1. TTFT Handoff & State Invariants in ChatWorkspace", () => {
    const defaultProps = {
      messages: [] as ChatMessage[],
      streamingContent: "",
      isGenerating: false,
      activeFollowUps: [] as string[],
      onSend: vi.fn(),
      onStop: vi.fn(),
      onSelectSuggestion: vi.fn(),
      onOpenSettings: vi.fn(),
      streamError: null as Error | null,
      onRetry: vi.fn(),
      onRegenerate: vi.fn(),
      onEditMessage: vi.fn(),
      onDeleteMessage: vi.fn(),
      onFeedback: vi.fn(),
    };

    it("enforces atomic mutual exclusivity: indicator vs streaming message across TTFT transition", () => {
      const messages: ChatMessage[] = [
        { id: "u1", role: "user", content: "Tell me a story", createdAt: Date.now() },
      ];

      // Phase 1: TTFT window (inference active, 0 tokens arrived)
      const { rerender } = render(
        <ChatWorkspace
          {...defaultProps}
          messages={messages}
          isGenerating={true}
          streamingContent=""
        />
      );

      // Active inference indicator MUST exist
      const indicator = screen.getByTestId("active-inference-indicator");
      expect(indicator).toBeDefined();
      expect(indicator.textContent).toContain("RD");
      expect(indicator.textContent).toContain("Thinking...");
      expect(screen.getByRole("status").getAttribute("aria-label")).toBe("Generating response");

      // Streaming message and cursor MUST NOT exist
      expect(screen.queryByTestId("streaming-message")).toBeNull();
      expect(screen.queryByTestId("stream-cursor")).toBeNull();

      // Phase 2: First token arrives (TTFT ends, streaming content begins)
      rerender(
        <ChatWorkspace
          {...defaultProps}
          messages={messages}
          isGenerating={true}
          streamingContent="Once"
        />
      );

      // Indicator MUST be unmounted immediately
      expect(screen.queryByTestId("active-inference-indicator")).toBeNull();

      // Streaming message and cursor MUST be mounted
      const streamingMsg = screen.getByTestId("streaming-message");
      expect(streamingMsg).toBeDefined();
      expect(streamingMsg.textContent).toContain("RD");
      expect(screen.getByTestId("streaming-content").textContent).toContain("Once");
      const cursor = screen.getByTestId("stream-cursor");
      expect(cursor).toBeDefined();
      expect(cursor.className).toContain("animate-pulse");

      // Phase 3: Subsequent tokens stream progressively
      rerender(
        <ChatWorkspace
          {...defaultProps}
          messages={messages}
          isGenerating={true}
          streamingContent="Once upon a time in a digital galaxy"
        />
      );

      expect(screen.queryByTestId("active-inference-indicator")).toBeNull();
      expect(screen.getByTestId("streaming-content").textContent).toBe(
        "Once upon a time in a digital galaxy"
      );
      expect(screen.getByTestId("stream-cursor")).toBeDefined();

      // Phase 4: Stream completes and assistant message is committed to history
      const completedMessages: ChatMessage[] = [
        ...messages,
        {
          id: "a1",
          role: "assistant",
          content: "Once upon a time in a digital galaxy",
          createdAt: Date.now(),
        },
      ];

      rerender(
        <ChatWorkspace
          {...defaultProps}
          messages={completedMessages}
          isGenerating={false}
          streamingContent=""
        />
      );

      // Both TTFT indicator and streaming-message placeholder MUST be gone
      expect(screen.queryByTestId("active-inference-indicator")).toBeNull();
      expect(screen.queryByTestId("streaming-message")).toBeNull();
      expect(screen.queryByTestId("stream-cursor")).toBeNull();

      // Committed message item rendered in message list
      expect(screen.getByText("Once upon a time in a digital galaxy")).toBeDefined();
    });

    it("handles whitespace and newline first tokens safely without visual glitch or missing bubble", () => {
      const messages: ChatMessage[] = [
        { id: "u1", role: "user", content: "Code example", createdAt: Date.now() },
      ];

      // First token is a single space
      const { rerender } = render(
        <ChatWorkspace
          {...defaultProps}
          messages={messages}
          isGenerating={true}
          streamingContent=" "
        />
      );

      // Even on a single space, indicator is removed and streaming container mounts
      expect(screen.queryByTestId("active-inference-indicator")).toBeNull();
      expect(screen.getByTestId("streaming-message")).toBeDefined();
      expect(screen.getByTestId("stream-cursor")).toBeDefined();

      // First token is a newline
      rerender(
        <ChatWorkspace
          {...defaultProps}
          messages={messages}
          isGenerating={true}
          streamingContent="\n\n```python\n"
        />
      );

      expect(screen.queryByTestId("active-inference-indicator")).toBeNull();
      expect(screen.getByTestId("streaming-message")).toBeDefined();
      expect(screen.getByTestId("stream-cursor")).toBeDefined();
    });

    it("verifies container geometry and alignment parity between TTFT and streaming message", () => {
      const messages: ChatMessage[] = [
        { id: "u1", role: "user", content: "Test", createdAt: Date.now() },
      ];

      // Measure TTFT container classes
      const { rerender } = render(
        <ChatWorkspace
          {...defaultProps}
          messages={messages}
          isGenerating={true}
          streamingContent=""
        />
      );

      const ttftEl = screen.getByTestId("active-inference-indicator");
      const ttftClasses = ttftEl.className;
      expect(ttftClasses).toContain("max-w-3xl");
      expect(ttftClasses).toContain("self-start");

      // Measure streaming message container classes
      rerender(
        <ChatWorkspace
          {...defaultProps}
          messages={messages}
          isGenerating={true}
          streamingContent="Response"
        />
      );

      const streamEl = screen.getByTestId("streaming-message");
      const streamClasses = streamEl.className;
      expect(streamClasses).toContain("max-w-3xl");
      expect(streamClasses).toContain("self-start");
    });

    it("maintains streaming stability over 50 rapid sequential token updates", () => {
      const messages: ChatMessage[] = [
        { id: "u1", role: "user", content: "Fast stream", createdAt: Date.now() },
      ];

      const { rerender } = render(
        <ChatWorkspace
          {...defaultProps}
          messages={messages}
          isGenerating={true}
          streamingContent=""
        />
      );

      let accumulated = "";
      for (let i = 1; i <= 50; i++) {
        accumulated += `word${i} `;
        rerender(
          <ChatWorkspace
            {...defaultProps}
            messages={messages}
            isGenerating={true}
            streamingContent={accumulated}
          />
        );

        // Every step must maintain cursor and correct accumulated content
        expect(screen.queryByTestId("active-inference-indicator")).toBeNull();
        expect(screen.getByTestId("stream-cursor")).toBeDefined();
      }

      expect(screen.getByTestId("streaming-content").textContent).toContain("word50");
    });
  });

  // =========================================================================
  // 2. Cross-Session Stream Contamination & Navigation Abort
  // =========================================================================
  describe("2. Cross-Session Stream Contamination & Navigation Abort", () => {
    it("immediately aborts active stream and leaves newChat completely clean with 0 messages", async () => {
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

      // Wait for app to render welcome card
      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Ask RADIANCE anything/i)).toBeDefined();
      });

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      const sendBtn = screen.getByTestId("send-button");

      // Send a user message to initiate streaming
      fireEvent.change(textarea, { target: { value: "Tell me about quantum computing" } });
      await act(async () => {
        fireEvent.click(sendBtn);
      });

      // Emission of tokens in conversation 1
      await act(async () => {
        streamControl.pushToken("Quantum ");
        streamControl.pushToken("mechanics ");
      });

      // Stream is active
      expect(screen.getByTestId("streaming-message")).toBeDefined();
      expect(fetchSignal?.aborted).toBe(false);

      // User clicks New Chat in Topbar while stream is actively emitting
      const newChatBtn = screen.getByRole("button", { name: "New Chat" });
      await act(async () => {
        fireEvent.click(newChatBtn);
      });

      // 1. Fetch signal MUST be immediately aborted
      expect(fetchSignal?.aborted).toBe(true);

      // Allow microtasks to settle
      await act(async () => {
        await new Promise((r) => setTimeout(r, 200));
      });

      // 3. New Chat workspace MUST NOT contain the aborted assistant message or leaked tokens
      await waitFor(() => {
        // Welcome card should reappear because newChat() resets to clean state
        expect(screen.queryByTestId("streaming-message")).toBeNull();
        expect(screen.queryByTestId("active-inference-indicator")).toBeNull();
      });

      // Check whether any message leaked into the active view
      expect(screen.queryByText(/Quantum mechanics/i)).toBeNull();
    });

    it("prevents token leakage when switching conversation while stream is active", async () => {
      // Pre-seed an existing conversation B
      const existingConvB = {
        id: "conv_existing_b",
        title: "Recipe Chat",
        createdAt: 1730000000000,
        updatedAt: 1730000000000,
        pinned: false,
        messages: [
          {
            id: "msg_b_user",
            role: "user" as const,
            content: "Chocolate cake recipe",
            createdAt: 1730000000000,
          },
          {
            id: "msg_b_asst",
            role: "assistant" as const,
            content: "Here is a recipe for chocolate cake.",
            createdAt: 1730000005000,
          },
        ],
      };
      await conversationService.save(existingConvB);

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

      // Start a stream in current conversation A
      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      const sendBtn = screen.getByTestId("send-button");
      fireEvent.change(textarea, { target: { value: "Prompt for Conv A" } });
      await act(async () => {
        fireEvent.click(sendBtn);
      });

      // Emit tokens in Conv A
      await act(async () => {
        streamControl.pushToken("Leaked ");
        streamControl.pushToken("tokens ");
      });

      expect(screen.getByTestId("streaming-message")).toBeDefined();

      // Open History drawer and select Conversation B
      const historyTrigger = screen.getByTitle(/History/i);
      await act(async () => {
        fireEvent.click(historyTrigger);
      });

      const convBItem = await screen.findByText("Recipe Chat");
      await act(async () => {
        fireEvent.click(convBItem);
      });

      // 1. Fetch signal for Conv A MUST be aborted
      expect(fetchSignal?.aborted).toBe(true);

      await act(async () => {
        streamControl.close();
      });

      // 2. Conversation B must show its own messages, and ZERO tokens from Conv A
      await waitFor(() => {
        expect(screen.getByText("Chocolate cake recipe")).toBeDefined();
        expect(screen.getByText("Here is a recipe for chocolate cake.")).toBeDefined();
      });

      // Leaked tokens must NOT appear anywhere in Conversation B
      expect(screen.queryByText(/Leaked tokens/i)).toBeNull();

      // Persistence check: inspect Conversation B in storage
      const list = await conversationService.list();
      const loadedB = list.find((c) => c.id === "conv_existing_b");
      expect(loadedB).toBeDefined();
      expect(loadedB?.messages).toHaveLength(2);
      expect(loadedB?.messages.some((m) => m.content.includes("Leaked"))).toBe(false);
    });

    it("safely aborts during TTFT without creating empty ghost messages in newChat", async () => {
      // Simulate TTFT delay (stream started, but no tokens sent yet)
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
      fireEvent.change(textarea, { target: { value: "Prompt during TTFT" } });

      await act(async () => {
        fireEvent.click(sendBtn);
      });

      // TTFT indicator is active
      expect(screen.getByTestId("active-inference-indicator")).toBeDefined();

      // User immediately triggers New Chat via keyboard shortcut (Ctrl+Shift+N)
      await act(async () => {
        fireEvent.keyDown(window, { key: "N", ctrlKey: true, shiftKey: true });
      });

      expect(fetchSignal?.aborted).toBe(true);

      await act(async () => {
        streamControl.close();
      });

      // Should be back to clean Welcome Card with zero phantom messages
      await waitFor(() => {
        expect(screen.queryByTestId("active-inference-indicator")).toBeNull();
        expect(screen.queryByTestId("streaming-message")).toBeNull();
      });

      const allConvs = await conversationService.list();
      // Ensure no conversation with empty assistant message was persisted
      allConvs.forEach((c) => {
        expect(c.messages.some((m) => m.content === "*(No response generated)*")).toBe(false);
      });
    });

    it("immediately aborts active stream when deleting active conversation from history drawer", async () => {
      // 1. Seed existing active conversation
      const conv = {
        id: "conv_active_del",
        title: "Active Chat",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pinned: false,
        messages: [{ id: "m1", role: "user" as const, content: "Hello", createdAt: Date.now() }],
      };
      await conversationService.save(conv);

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

      // Wait for app mount
      await waitFor(() => expect(screen.getByPlaceholderText(/Ask RADIANCE anything/i)).toBeDefined());

      // Open history drawer & select conversation
      await act(async () => {
        fireEvent.click(screen.getByTitle(/History/i));
      });
      const convItem = await screen.findByText("Active Chat");
      await act(async () => {
        fireEvent.click(convItem);
      });

      // Start stream
      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      fireEvent.change(textarea, { target: { value: "Continue story" } });
      await act(async () => {
        fireEvent.click(screen.getByTestId("send-button"));
      });

      // Push partial token
      await act(async () => {
        streamControl.pushToken("Once ");
      });

      expect(fetchSignal?.aborted).toBe(false);

      // Open history drawer again and click delete on this active conversation
      await act(async () => {
        fireEvent.click(screen.getByTitle(/History/i));
      });
      const deleteButtons = screen.getAllByTitle("Delete chat");
      await act(async () => {
        fireEvent.click(deleteButtons[0]);
      });

      // Assert fetch signal is immediately aborted!
      expect(fetchSignal?.aborted).toBe(true);

      // Workspace must be reset cleanly
      await waitFor(() => {
        expect(screen.queryByTestId("streaming-message")).toBeNull();
      });
    });

    it("immediately aborts active stream when deleting all conversations from history drawer", async () => {
      // Seed a conversation so conversations.length > 0 and Delete All button renders
      const conv = {
        id: "conv_all_del",
        title: "Chat to delete",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pinned: false,
        messages: [{ id: "m1", role: "user" as const, content: "Hello", createdAt: Date.now() }],
      };
      await conversationService.save(conv);

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
      await waitFor(() => expect(screen.getByPlaceholderText(/Ask RADIANCE anything/i)).toBeDefined());

      // Send prompt to start stream
      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      fireEvent.change(textarea, { target: { value: "Delete all test" } });
      await act(async () => {
        fireEvent.click(screen.getByTestId("send-button"));
      });

      await act(async () => {
        streamControl.pushToken("Testing ");
      });

      expect(fetchSignal?.aborted).toBe(false);

      // Open history drawer and click Delete All
      await act(async () => {
        fireEvent.click(screen.getByTitle(/History/i));
      });
      const deleteAllBtn = screen.getByTitle("Delete all conversations");
      await act(async () => {
        fireEvent.click(deleteAllBtn);
      });

      // Assert fetch signal is immediately aborted!
      expect(fetchSignal?.aborted).toBe(true);

      // Workspace is clean
      await waitFor(() => {
        expect(screen.queryByTestId("streaming-message")).toBeNull();
      });
    });

    it("leaves active stream running unaffected when deleting an inactive conversation from history drawer", async () => {
      // 1. Pre-seed two conversations: active and inactive
      const activeConv = {
        id: "conv_stay_active",
        title: "Active Chat Should Keep Running",
        createdAt: Date.now() - 1000,
        updatedAt: Date.now() - 1000,
        pinned: false,
        messages: [{ id: "m_act", role: "user" as const, content: "Active prompt", createdAt: Date.now() - 1000 }],
      };
      const inactiveConv = {
        id: "conv_to_delete",
        title: "Inactive Chat To Delete",
        createdAt: Date.now() - 5000,
        updatedAt: Date.now() - 5000,
        pinned: false,
        messages: [{ id: "m_inact", role: "user" as const, content: "Inactive prompt", createdAt: Date.now() - 5000 }],
      };
      await conversationService.save(activeConv);
      await conversationService.save(inactiveConv);

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
      await waitFor(() => expect(screen.getByPlaceholderText(/Ask RADIANCE anything/i)).toBeDefined());

      // Open history drawer and select active conversation
      await act(async () => {
        fireEvent.click(screen.getByTitle(/History/i));
      });
      const activeItem = await screen.findByText("Active Chat Should Keep Running");
      await act(async () => {
        fireEvent.click(activeItem);
      });

      // Start stream in active conversation
      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      fireEvent.change(textarea, { target: { value: "Continue active work" } });
      await act(async () => {
        fireEvent.click(screen.getByTestId("send-button"));
      });

      // Push first token
      await act(async () => {
        streamControl.pushToken("Active token 1 ");
      });

      expect(fetchSignal?.aborted).toBe(false);
      expect(screen.getByTestId("streaming-message")).toBeDefined();

      // Open history drawer again
      await act(async () => {
        fireEvent.click(screen.getByTitle(/History/i));
      });
      const inactiveEl = await screen.findByText("Inactive Chat To Delete");
      const inactiveContainer = inactiveEl.closest(".group");
      const deleteInactiveBtn = inactiveContainer?.querySelector('button[title="Delete chat"]');
      expect(deleteInactiveBtn).toBeDefined();

      // Click delete on INACTIVE conversation
      await act(async () => {
        fireEvent.click(deleteInactiveBtn!);
      });

      // Critical Assertion 1: Fetch signal for active conversation MUST NOT be aborted!
      expect(fetchSignal?.aborted).toBe(false);

      // Critical Assertion 2: Streaming message must still be mounted and alive
      expect(screen.getByTestId("streaming-message")).toBeDefined();

      // Push second token and close stream normally
      await act(async () => {
        streamControl.pushToken("Active token 2 complete");
        streamControl.close();
      });

      // Allow async completion to commit message
      await waitFor(() => {
        expect(screen.getByText(/Active token 1 Active token 2 complete/i)).toBeDefined();
        expect(screen.queryByTestId("streaming-message")).toBeNull();
      });

      // Critical Assertion 3: Storage state
      const list = await conversationService.list();
      expect(list.find((c) => c.id === "conv_to_delete")).toBeUndefined();
      const updatedActive = list.find((c) => c.id === "conv_stay_active");
      expect(updatedActive).toBeDefined();
      expect(updatedActive?.messages.some((m) => m.content.includes("Active token 1"))).toBe(true);
    });

    it("prevents token resurrects during rapid race between newChat, history deletion, and stream events", async () => {
      const conv = {
        id: "conv_rapid_race",
        title: "Rapid Race Chat",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pinned: false,
        messages: [{ id: "m_r", role: "user" as const, content: "Initial prompt", createdAt: Date.now() }],
      };
      await conversationService.save(conv);

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
      await waitFor(() => expect(screen.getByPlaceholderText(/Ask RADIANCE anything/i)).toBeDefined());

      // Open history drawer & select conversation
      await act(async () => {
        fireEvent.click(screen.getByTitle(/History/i));
      });
      const convItem = await screen.findByText("Rapid Race Chat");
      await act(async () => {
        fireEvent.click(convItem);
      });

      // Send prompt to initiate active stream
      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      fireEvent.change(textarea, { target: { value: "Trigger race condition" } });
      await act(async () => {
        fireEvent.click(screen.getByTestId("send-button"));
      });

      // Push partial token
      await act(async () => {
        streamControl.pushToken("Resurrect candidate token");
      });

      expect(screen.getByTestId("streaming-message")).toBeDefined();

      // RAPID RACE: Trigger newChat while simultaneously deleting the conversation
      await act(async () => {
        // 1. Click New Chat
        fireEvent.click(screen.getByRole("button", { name: "New Chat" }));
        // 2. Open History drawer and delete the conversation
        fireEvent.click(screen.getByTitle(/History/i));
      });

      const delButtons = screen.queryAllByTitle("Delete chat");
      if (delButtons.length > 0) {
        await act(async () => {
          fireEvent.click(delButtons[0]);
        });
      }

      // Microtask delay simulating delayed reader cleanup and event dispatch
      await act(async () => {
        streamControl.close();
        await new Promise((r) => setTimeout(r, 100));
      });

      // Critical Assertions:
      // 1. Fetch signal must have aborted immediately
      expect(fetchSignal?.aborted).toBe(true);

      // 2. No tokens must resurrect into the clean newChat workspace
      await waitFor(() => {
        expect(screen.queryByTestId("streaming-message")).toBeNull();
        expect(screen.queryByTestId("active-inference-indicator")).toBeNull();
        expect(screen.queryByText(/Resurrect candidate token/i)).toBeNull();
      });

      // 3. Storage invariant: zero phantom conversations with resurrect candidate tokens
      const remaining = await conversationService.list();
      remaining.forEach((c) => {
        expect(c.messages.some((m) => m.content.includes("Resurrect candidate token"))).toBe(false);
      });
    });
  });

  // =========================================================================
  // 3. Mid-Stream User Actions (Regenerate, Edit Prompt, Delete Message)
  // =========================================================================
  describe("3. Mid-Stream User Actions Lifecycle", () => {
    it("handles mid-stream Regeneration: cancels active stream, prunes turns, and re-initiates", async () => {
      let callCount = 0;
      let stream1Aborted = false;

      global.fetch = vi.fn().mockImplementation((_url, options) => {
        callCount++;
        const currentCall = callCount;
        options?.signal?.addEventListener("abort", () => {
          if (currentCall === 1) stream1Aborted = true;
        });

        if (currentCall === 1) {
          const { stream, pushToken } = createControllableStream();
          setTimeout(() => pushToken("First stream token"), 10);
          return Promise.resolve({ ok: true, status: 200, body: stream });
        } else {
          const { stream, pushToken, close } = createControllableStream();
          setTimeout(() => {
            pushToken("Regenerated response");
            close();
          }, 10);
          return Promise.resolve({ ok: true, status: 200, body: stream });
        }
      });

      // Pre-seed a conversation with User prompt and an existing assistant message
      const initialConv = {
        id: "conv_regen_test",
        title: "Regen Test",
        createdAt: 1730000000000,
        updatedAt: 1730000000000,
        pinned: false,
        messages: [
          {
            id: "msg_user_1",
            role: "user" as const,
            content: "Explain gravity",
            createdAt: 1730000000000,
          },
          {
            id: "msg_asst_1",
            role: "assistant" as const,
            content: "Gravity is a fundamental interaction.",
            createdAt: 1730000005000,
          },
        ],
      };
      await conversationService.save(initialConv);

      render(<RadianceApp />);

      // Switch to pre-seeded conversation
      await waitFor(() => {
        expect(screen.getByTitle(/History/i)).toBeDefined();
      });
      await act(async () => {
        fireEvent.click(screen.getByTitle(/History/i));
      });
      const item = await screen.findByText("Regen Test");
      await act(async () => {
        fireEvent.click(item);
      });

      await waitFor(() => {
        expect(screen.getByText("Gravity is a fundamental interaction.")).toBeDefined();
      });

      // Trigger regeneration on the assistant message
      const regenBtn = screen.getByTestId("regenerate-message-button");
      await act(async () => {
        fireEvent.click(regenBtn);
      });

      // Should initiate second fetch call for regeneration
      await waitFor(() => {
        expect(callCount).toBeGreaterThanOrEqual(1);
      });
    });

    it("handles mid-stream Edit User Message: cancels active stream and submits edited prompt", async () => {
      let callCount = 0;
      let firstSignal: AbortSignal | undefined;

      global.fetch = vi.fn().mockImplementation((_url, options) => {
        callCount++;
        if (callCount === 1) {
          firstSignal = options?.signal;
          const { stream } = createControllableStream();
          return Promise.resolve({ ok: true, status: 200, body: stream });
        } else {
          const { stream, pushToken, close } = createControllableStream();
          setTimeout(() => {
            pushToken("Answer to edited prompt");
            close();
          }, 10);
          return Promise.resolve({ ok: true, status: 200, body: stream });
        }
      });

      // Pre-seed a conversation
      const testConv = {
        id: "conv_edit_test",
        title: "Edit Test",
        createdAt: 1730000000000,
        updatedAt: 1730000000000,
        pinned: false,
        messages: [
          {
            id: "user_msg_editable",
            role: "user" as const,
            content: "Original question",
            createdAt: 1730000000000,
          },
        ],
      };
      await conversationService.save(testConv);

      render(<RadianceApp />);

      await act(async () => {
        fireEvent.click(screen.getByTitle(/History/i));
      });
      const convItem = await screen.findByText("Edit Test");
      await act(async () => {
        fireEvent.click(convItem);
      });

      await waitFor(() => {
        expect(screen.getByText("Original question")).toBeDefined();
      });

      // Open inline edit form on the user message
      const editBtn = screen.getByTestId("edit-message-button");
      await act(async () => {
        fireEvent.click(editBtn);
      });

      const editTextarea = screen.getByTestId("edit-message-textarea");
      const saveBtn = screen.getByTestId("save-edit-button");

      fireEvent.change(editTextarea, { target: { value: "Updated improved question" } });
      await act(async () => {
        fireEvent.click(saveBtn);
      });

      // Expect second call to send with edited prompt
      await waitFor(() => {
        expect(screen.getByText("Updated improved question")).toBeDefined();
        expect(callCount).toBe(1); // Sent edited prompt
      });
    });

    it("handles mid-stream Delete Message: halts stream and removes turn without resurrecting tokens", async () => {
      const streamControl = createControllableStream();
      let fetchSignal: AbortSignal | undefined;

      global.fetch = vi.fn().mockImplementation((_url, options) => {
        fetchSignal = options?.signal;
        return Promise.resolve({
          ok: true,
          status: 200,
          body: streamControl.stream,
        });
      });

      // Pre-seed conversation with 1 user message
      const testConv = {
        id: "conv_delete_test",
        title: "Delete Test",
        createdAt: 1730000000000,
        updatedAt: 1730000000000,
        pinned: false,
        messages: [
          {
            id: "user_to_delete",
            role: "user" as const,
            content: "Delete this turn",
            createdAt: 1730000000000,
          },
        ],
      };
      await conversationService.save(testConv);

      render(<RadianceApp />);

      await act(async () => {
        fireEvent.click(screen.getByTitle(/History/i));
      });
      const convItem = await screen.findByText("Delete Test");
      await act(async () => {
        fireEvent.click(convItem);
      });

      await waitFor(() => {
        expect(screen.getByText("Delete this turn")).toBeDefined();
      });

      // Delete the message
      const deleteBtn = screen.getByTestId("delete-message-button");
      await act(async () => {
        fireEvent.click(deleteBtn);
      });

      // Message should be removed from view
      await waitFor(() => {
        expect(screen.queryByText("Delete this turn")).toBeNull();
      });

      // Storage should also be empty
      const list = await conversationService.list();
      const updated = list.find((c) => c.id === "conv_delete_test");
      expect(updated?.messages).toHaveLength(0);
    });
  });

  // =========================================================================
  // 4. In-Message Error Card Recovery Lifecycle
  // =========================================================================
  describe("4. In-Message Error Card Recovery Lifecycle", () => {
    it("transitions from stream failure -> error card render -> Retry button -> successful completion", async () => {
      let attempt = 0;

      global.fetch = vi.fn().mockImplementation(() => {
        attempt++;
        if (attempt === 1) {
          // Attempt 1: Server fails with 500
          return Promise.resolve({
            ok: false,
            status: 500,
            json: () => Promise.resolve({ error: "Internal Model Gateway Timeout (500)" }),
          });
        } else {
          // Attempt 2: Server succeeds with stream
          const { stream, pushToken, close } = createControllableStream();
          setTimeout(() => {
            pushToken("Recovered successfully from gateway error.");
            close();
          }, 10);
          return Promise.resolve({
            ok: true,
            status: 200,
            body: stream,
          });
        }
      });

      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      render(<RadianceApp />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Ask RADIANCE anything/i)).toBeDefined();
      });

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      const sendBtn = screen.getByTestId("send-button");

      fireEvent.change(textarea, { target: { value: "Trigger server error" } });
      await act(async () => {
        fireEvent.click(sendBtn);
      });

      // 1. Error card must render with error message
      await waitFor(() => {
        expect(screen.getByTestId("in-message-error-card")).toBeDefined();
      });

      expect(screen.getByText("Generation Error")).toBeDefined();
      expect(screen.getByText("Internal Model Gateway Timeout (500)")).toBeDefined();

      // Zero window.alert calls
      expect(alertSpy).not.toHaveBeenCalled();

      // 2. Click the Retry button on the error card
      const retryBtn = screen.getByTestId("error-retry-button");
      expect(retryBtn).toBeDefined();

      await act(async () => {
        fireEvent.click(retryBtn);
      });

      // 3. Error card should be replaced by recovered message
      await waitFor(() => {
        expect(screen.getByText("Recovered successfully from gateway error.")).toBeDefined();
        expect(screen.queryByTestId("in-message-error-card")).toBeNull();
      });

      expect(attempt).toBe(2);
      alertSpy.mockRestore();
    });

    it("recovers from mid-stream network drop via Retry without duplicate prompts", async () => {
      let attempt = 0;

      global.fetch = vi.fn().mockImplementation(() => {
        attempt++;
        if (attempt === 1) {
          // Stream starts, then errors out mid-stream
          const { stream, pushToken, error } = createControllableStream();
          setTimeout(() => {
            pushToken("Partial start... ");
            error(new Error("Network connection lost (ECONNRESET)"));
          }, 10);
          return Promise.resolve({
            ok: true,
            status: 200,
            body: stream,
          });
        } else {
          // Second attempt finishes cleanly
          const { stream, pushToken, close } = createControllableStream();
          setTimeout(() => {
            pushToken("Clean finish on retry.");
            close();
          }, 10);
          return Promise.resolve({
            ok: true,
            status: 200,
            body: stream,
          });
        }
      });

      render(<RadianceApp />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText(/Ask RADIANCE anything/i)).toBeDefined();
      });

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      const sendBtn = screen.getByTestId("send-button");

      fireEvent.change(textarea, { target: { value: "Test mid-stream drop" } });
      await act(async () => {
        fireEvent.click(sendBtn);
      });

      // Wait for error card
      await waitFor(() => {
        expect(screen.getByTestId("in-message-error-card")).toBeDefined();
      });
      expect(screen.getByText(/Network connection lost/i)).toBeDefined();

      // Click retry
      const retryBtn = screen.getByTestId("error-retry-button");
      await act(async () => {
        fireEvent.click(retryBtn);
      });

      // Clean finish
      await waitFor(() => {
        expect(screen.getByText("Clean finish on retry.")).toBeDefined();
      });

      // Verify user message is not duplicated
      const userMessages = screen.getAllByText("Test mid-stream drop");
      expect(userMessages).toHaveLength(1);
    });
  });
});
