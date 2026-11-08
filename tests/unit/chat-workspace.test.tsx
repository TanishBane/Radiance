import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatWorkspace } from "@/features/chat/components/chat-workspace";
import { ChatMessage } from "@/lib/types/chat";

// Mock scrollHeight and scrollTop for jsdom
beforeEach(() => {
  Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
    configurable: true,
    value: 1000,
  });
  Object.defineProperty(HTMLElement.prototype, "scrollTop", {
    configurable: true,
    writable: true,
    value: 0,
  });
});

describe("ChatWorkspace Component (Inference & Error States)", () => {
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

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Empty State & Welcome Card", () => {
    it("renders WelcomeCard when workspace is idle with no messages", () => {
      render(<ChatWorkspace {...defaultProps} />);

      // Welcome card should be present
      expect(screen.getByText(/illuminate what is possible/i)).toBeDefined();
    });

    it("hides WelcomeCard when messages exist", () => {
      const messages: ChatMessage[] = [
        {
          id: "msg_user_1",
          role: "user",
          content: "Hello assistant",
          createdAt: Date.now(),
        },
      ];

      render(<ChatWorkspace {...defaultProps} messages={messages} />);

      expect(screen.queryByText(/illuminate what is possible/i)).toBeNull();
      expect(screen.getByText("Hello assistant")).toBeDefined();
    });
  });

  describe("2. Active Inference Indicator during TTFT", () => {
    it("renders active inference indicator when isGenerating is true and streamingContent is empty", () => {
      const messages: ChatMessage[] = [
        {
          id: "msg_user_1",
          role: "user",
          content: "Generate a poem",
          createdAt: Date.now(),
        },
      ];

      render(
        <ChatWorkspace
          {...defaultProps}
          messages={messages}
          isGenerating={true}
          streamingContent=""
        />
      );

      const indicator = screen.getByTestId("active-inference-indicator");
      expect(indicator).toBeDefined();
      expect(indicator.getAttribute("class")).toContain("self-start");

      // Verify thinking text and accessibility role
      expect(screen.getByText("Thinking...")).toBeDefined();
      const statusRole = screen.getByRole("status");
      expect(statusRole).toBeDefined();
      expect(statusRole.getAttribute("aria-label")).toBe("Generating response");

      // Verify avatar contains RD
      expect(indicator.textContent).toContain("RD");
    });

    it("does not render active inference indicator when isGenerating is false", () => {
      render(
        <ChatWorkspace
          {...defaultProps}
          isGenerating={false}
          streamingContent=""
        />
      );

      expect(screen.queryByTestId("active-inference-indicator")).toBeNull();
    });

    it("unmounts active inference indicator when streamingContent starts accumulating", () => {
      const messages: ChatMessage[] = [
        {
          id: "msg_user_1",
          role: "user",
          content: "Tell me a joke",
          createdAt: Date.now(),
        },
      ];

      const { rerender } = render(
        <ChatWorkspace
          {...defaultProps}
          messages={messages}
          isGenerating={true}
          streamingContent=""
        />
      );

      expect(screen.getByTestId("active-inference-indicator")).toBeDefined();

      // First token arrives
      rerender(
        <ChatWorkspace
          {...defaultProps}
          messages={messages}
          isGenerating={true}
          streamingContent="Why did the"
        />
      );

      expect(screen.queryByTestId("active-inference-indicator")).toBeNull();
      expect(screen.getByTestId("streaming-message")).toBeDefined();
    });
  });

  describe("3. Active Stream Cursor & Content Accumulation", () => {
    it("renders pulsating stream cursor when streamingContent is non-empty", () => {
      render(
        <ChatWorkspace
          {...defaultProps}
          isGenerating={true}
          streamingContent="Streaming response chunk..."
        />
      );

      const cursor = screen.getByTestId("stream-cursor");
      expect(cursor).toBeDefined();
      expect(cursor.className).toContain("animate-pulse");
      expect(cursor.className).toContain("bg-[var(--accent)]");
    });

    it("does not render stream cursor when streamingContent is empty", () => {
      render(
        <ChatWorkspace
          {...defaultProps}
          isGenerating={false}
          streamingContent=""
        />
      );

      expect(screen.queryByTestId("stream-cursor")).toBeNull();
    });
  });

  describe("4. Progressive Markdown Streaming Integration", () => {
    it("renders progressive markdown text inside streaming content container", () => {
      render(
        <ChatWorkspace
          {...defaultProps}
          isGenerating={true}
          streamingContent="**Bold intro** and regular text."
        />
      );

      const content = screen.getByTestId("streaming-content");
      expect(content).toBeDefined();
      expect(content.innerHTML).toContain("<strong>Bold intro</strong>");
      expect(content.innerHTML).toContain("and regular text.");
    });

    it("auto-recovers unclosed code fences during progressive streaming", () => {
      const partialCodeFence = "Here is the code:\n```typescript\nconst greeting: string = 'hello';";

      render(
        <ChatWorkspace
          {...defaultProps}
          isGenerating={true}
          streamingContent={partialCodeFence}
        />
      );

      const content = screen.getByTestId("streaming-content");
      expect(content).toBeDefined();
      // Should format code inside code-block-wrapper without breaking layout
      expect(content.innerHTML).toContain("code-block-wrapper");
      expect(content.innerHTML).toContain("const greeting");
    });
  });

  describe("5. In-Message Structured Error Card (Active Stream Error)", () => {
    it("renders structured in-message error card when streamError occurs", () => {
      const streamErr = new Error("Connection lost: 503 Service Unavailable");
      const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

      render(
        <ChatWorkspace
          {...defaultProps}
          isGenerating={false}
          streamError={streamErr}
        />
      );

      // Verify in-message error card presence
      const errorCard = screen.getByTestId("in-message-error-card");
      expect(errorCard).toBeDefined();
      expect(errorCard.getAttribute("role")).toBe("alert");

      // Verify error text and label
      expect(screen.getByText("Generation Error")).toBeDefined();
      expect(screen.getByText("Connection lost: 503 Service Unavailable")).toBeDefined();

      // Verify window.alert was NOT called
      expect(alertSpy).not.toHaveBeenCalled();

      alertSpy.mockRestore();
    });

    it("triggers onRetry callback when clicking Retry button on error card", () => {
      const onRetryMock = vi.fn();
      const streamErr = new Error("Rate limit exceeded. Please wait.");

      render(
        <ChatWorkspace
          {...defaultProps}
          isGenerating={false}
          streamError={streamErr}
          onRetry={onRetryMock}
        />
      );

      const retryButton = screen.getByTestId("error-retry-button");
      expect(retryButton).toBeDefined();
      expect(retryButton.textContent).toContain("Retry");

      fireEvent.click(retryButton);
      expect(onRetryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("6. Message-Level Error Card (Historical/Persisted Errors)", () => {
    it("renders error card for messages with isError: true", () => {
      const onRetryMock = vi.fn();
      const messages: ChatMessage[] = [
        {
          id: "err_msg_1",
          role: "assistant",
          content: "Model failed to generate response.",
          errorDetails: "HTTP 504 Gateway Timeout from upstream inference engine.",
          isError: true,
          createdAt: Date.now(),
        },
      ];

      render(
        <ChatWorkspace
          {...defaultProps}
          messages={messages}
          onRetry={onRetryMock}
        />
      );

      const errorCard = screen.getByTestId("in-message-error-card");
      expect(errorCard).toBeDefined();
      expect(screen.getByText("Model failed to generate response.")).toBeDefined();
      expect(
        screen.getByText("HTTP 504 Gateway Timeout from upstream inference engine.")
      ).toBeDefined();

      const retryBtn = screen.getByTestId("error-retry-button");
      fireEvent.click(retryBtn);
      expect(onRetryMock).toHaveBeenCalledTimes(1);
    });
  });

  describe("7. Composer & Action Routing", () => {
    it("routes onSend to ChatComposer", () => {
      const onSendMock = vi.fn();
      render(<ChatWorkspace {...defaultProps} onSend={onSendMock} />);

      const textarea = screen.getByPlaceholderText(
        "Ask RADIANCE anything..."
      );
      const sendBtn = screen.getByTestId("send-button");

      fireEvent.change(textarea, { target: { value: "New prompt message" } });
      fireEvent.click(sendBtn);

      expect(onSendMock).toHaveBeenCalledWith("New prompt message", []);
    });

    it("routes onStop to ChatComposer when isGenerating is true", () => {
      const onStopMock = vi.fn();
      render(
        <ChatWorkspace
          {...defaultProps}
          isGenerating={true}
          onStop={onStopMock}
        />
      );

      const stopBtn = screen.getByTestId("stop-button");
      fireEvent.click(stopBtn);
      expect(onStopMock).toHaveBeenCalledTimes(1);
    });

    it("routes onRegenerate and onFeedback to assistant MessageItem", () => {
      const onRegenerateMock = vi.fn();
      const onFeedbackMock = vi.fn();
      const messages: ChatMessage[] = [
        {
          id: "asst_msg_1",
          role: "assistant",
          content: "Assistant response here",
          createdAt: Date.now(),
        },
      ];

      render(
        <ChatWorkspace
          {...defaultProps}
          messages={messages}
          onRegenerate={onRegenerateMock}
          onFeedback={onFeedbackMock}
        />
      );

      const regenBtn = screen.getByTestId("regenerate-message-button");
      fireEvent.click(regenBtn);
      expect(onRegenerateMock).toHaveBeenCalledWith("asst_msg_1");

      const thumbsUpBtn = screen.getByTestId("feedback-positive-button");
      fireEvent.click(thumbsUpBtn);
      expect(onFeedbackMock).toHaveBeenCalledWith("asst_msg_1", "positive");
    });

    it("routes onEditMessage and onDeleteMessage to user MessageItem", () => {
      const onEditMock = vi.fn();
      const onDeleteMock = vi.fn();
      const messages: ChatMessage[] = [
        {
          id: "user_msg_1",
          role: "user",
          content: "Original prompt",
          createdAt: Date.now(),
        },
      ];

      render(
        <ChatWorkspace
          {...defaultProps}
          messages={messages}
          onEditMessage={onEditMock}
          onDeleteMessage={onDeleteMock}
        />
      );

      // Edit
      const editBtn = screen.getByTestId("edit-message-button");
      fireEvent.click(editBtn);

      const textarea = screen.getByTestId("edit-message-textarea");
      fireEvent.change(textarea, { target: { value: "Updated prompt" } });
      fireEvent.click(screen.getByTestId("save-edit-button"));

      expect(onEditMock).toHaveBeenCalledWith("user_msg_1", "Updated prompt");

      // Delete
      const deleteBtn = screen.getByTestId("delete-message-button");
      fireEvent.click(deleteBtn);
      expect(onDeleteMock).toHaveBeenCalledWith("user_msg_1");
    });
  });
});
