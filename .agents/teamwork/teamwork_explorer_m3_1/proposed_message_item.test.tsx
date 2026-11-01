import React from "react";
import { render, screen, fireEvent, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MessageItem } from "@/components/chat/message-item";
import { ChatMessage } from "@/lib/types/chat";

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

describe("MessageItem Component & Action Menus Specifications", () => {
  const onRegenerate = vi.fn();
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const onFeedback = vi.fn();
  const onRetry = vi.fn();
  const onSelectFollowUp = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Clipboard Mock
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });

    // Blob URL Mock
    if (typeof window !== "undefined") {
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
    vi.restoreAllMocks();
  });

  const baseUserMessage: ChatMessage = {
    id: "msg_user_1",
    role: "user",
    content: "Explain quantum superposition in simple terms.",
    createdAt: 1730000000000,
  };

  const baseAssistantMessage: ChatMessage = {
    id: "msg_asst_1",
    role: "assistant",
    content: "Quantum superposition is the principle that a system can exist in multiple states at once.",
    createdAt: 1730000005000,
  };

  const errorAssistantMessage: ChatMessage = {
    id: "msg_asst_err",
    role: "assistant",
    content: "Failed to generate inference response.",
    createdAt: 1730000010000,
    isError: true,
    errorDetails: "Rate limit exceeded (HTTP 429). Please retry shortly.",
  };

  describe("1. Role Presentation & Container Geometry", () => {
    it("renders user message with YOU avatar, right alignment, and user styling", () => {
      const { container } = render(
        <MessageItem message={baseUserMessage} onEdit={onEdit} onDelete={onDelete} />
      );

      expect(screen.getByText("YOU")).toBeDefined();
      const outerRow = container.firstChild as HTMLElement;
      expect(outerRow.className).toContain("flex-row-reverse");
      expect(outerRow.className).toContain("self-end");
      expect(screen.getByText("Explain quantum superposition in simple terms.")).toBeDefined();
    });

    it("renders assistant message with RD avatar and left alignment", () => {
      const { container } = render(
        <MessageItem
          message={baseAssistantMessage}
          onRegenerate={onRegenerate}
          onDelete={onDelete}
          onFeedback={onFeedback}
        />
      );

      expect(screen.getByText("RD")).toBeDefined();
      const outerRow = container.firstChild as HTMLElement;
      expect(outerRow.className).toContain("self-start");
      expect(outerRow.className).not.toContain("flex-row-reverse");
      expect(screen.getByText(/Quantum superposition is the principle/)).toBeDefined();
    });

    it("renders streaming cursor when isStreaming is true", () => {
      const { container } = render(
        <MessageItem message={baseAssistantMessage} isStreaming={true} />
      );

      const cursor = container.querySelector(".stream-cursor");
      expect(cursor).toBeDefined();
    });
  });

  describe("2. Timestamp Formatting & Accessibility", () => {
    it("renders semantic <time> element with ISO dateTime, title, and accessible label", () => {
      render(<MessageItem message={baseUserMessage} />);

      const timeElement = screen.getByTestId("message-timestamp");
      expect(timeElement).toBeDefined();
      expect(timeElement.tagName.toLowerCase()).toBe("time");

      const isoDate = new Date(baseUserMessage.createdAt).toISOString();
      expect(timeElement.getAttribute("dateTime")).toBe(isoDate);
      expect(timeElement.getAttribute("title")).toBe(isoDate);
      expect(timeElement.getAttribute("aria-label")).toContain(isoDate);
      expect(timeElement.className).toContain("tabular-nums");
    });
  });

  describe("3. Desktop Hover Action Toolbar & Focus-Within", () => {
    it("includes focus-within opacity classes for WCAG keyboard accessibility", () => {
      const { container } = render(
        <MessageItem
          message={baseUserMessage}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      );

      const toolbar = container.querySelector(".group-hover\\:opacity-100");
      expect(toolbar).toBeDefined();
      expect(toolbar?.className).toContain("focus-within:opacity-100");
      expect(toolbar?.className).toContain("group-focus-within:opacity-100");
    });

    it("copies message content to clipboard and toggles visual confirmation for 2s", async () => {
      render(<MessageItem message={baseUserMessage} />);

      const copyBtn = screen.getByTestId("copy-message-button");
      expect(copyBtn).toBeDefined();

      await act(async () => {
        fireEvent.click(copyBtn);
      });

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(baseUserMessage.content);
      expect(copyBtn.getAttribute("aria-label")).toBe("Copied to clipboard");

      // Fast forward time to test reset
      await act(async () => {
        await new Promise((r) => setTimeout(r, 2100));
      });

      expect(copyBtn.getAttribute("aria-label")).toBe("Copy message");
    });
  });

  describe("4. User Message Inline Editing", () => {
    it("renders edit button for user message and hides it for assistant message", () => {
      const { rerender } = render(
        <MessageItem message={baseUserMessage} onEdit={onEdit} />
      );
      expect(screen.getByTestId("edit-message-button")).toBeDefined();

      rerender(<MessageItem message={baseAssistantMessage} onEdit={onEdit} />);
      expect(screen.queryByTestId("edit-message-button")).toBeNull();
    });

    it("enters inline edit mode displaying textarea with existing content", () => {
      render(<MessageItem message={baseUserMessage} onEdit={onEdit} />);

      const editBtn = screen.getByTestId("edit-message-button");
      fireEvent.click(editBtn);

      const textarea = screen.getByTestId("edit-message-textarea") as HTMLTextAreaElement;
      expect(textarea).toBeDefined();
      expect(textarea.value).toBe(baseUserMessage.content);
      expect(screen.getByTestId("cancel-edit-button")).toBeDefined();
      expect(screen.getByTestId("save-edit-button")).toBeDefined();
    });

    it("cancels edit mode on Cancel button click without invoking onEdit", () => {
      render(<MessageItem message={baseUserMessage} onEdit={onEdit} />);

      fireEvent.click(screen.getByTestId("edit-message-button"));
      const textarea = screen.getByTestId("edit-message-textarea");
      fireEvent.change(textarea, { target: { value: "Changed text" } });

      fireEvent.click(screen.getByTestId("cancel-edit-button"));
      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.queryByTestId("edit-message-textarea")).toBeNull();
    });

    it("submits modified text on Save & Resubmit button click and closes edit mode", () => {
      render(<MessageItem message={baseUserMessage} onEdit={onEdit} />);

      fireEvent.click(screen.getByTestId("edit-message-button"));
      const textarea = screen.getByTestId("edit-message-textarea");
      fireEvent.change(textarea, { target: { value: "Refined prompt query" } });

      fireEvent.click(screen.getByTestId("save-edit-button"));
      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith("Refined prompt query");
      expect(screen.queryByTestId("edit-message-textarea")).toBeNull();
    });

    it("submits on Enter keypress without Shift", () => {
      render(<MessageItem message={baseUserMessage} onEdit={onEdit} />);

      fireEvent.click(screen.getByTestId("edit-message-button"));
      const textarea = screen.getByTestId("edit-message-textarea");
      fireEvent.change(textarea, { target: { value: "Prompt via Enter" } });

      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      expect(onEdit).toHaveBeenCalledWith("Prompt via Enter");
      expect(screen.queryByTestId("edit-message-textarea")).toBeNull();
    });

    it("cancels editing on Escape keypress", () => {
      render(<MessageItem message={baseUserMessage} onEdit={onEdit} />);

      fireEvent.click(screen.getByTestId("edit-message-button"));
      const textarea = screen.getByTestId("edit-message-textarea");

      fireEvent.keyDown(textarea, { key: "Escape" });
      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.queryByTestId("edit-message-textarea")).toBeNull();
    });
  });

  describe("5. Assistant Regenerate & Error State Retry", () => {
    it("renders regenerate button for assistant message and calls onRegenerate", () => {
      render(
        <MessageItem
          message={baseAssistantMessage}
          onRegenerate={onRegenerate}
          isStreaming={false}
        />
      );

      const regenBtn = screen.getByTestId("regenerate-message-button");
      expect(regenBtn).toBeDefined();
      fireEvent.click(regenBtn);
      expect(onRegenerate).toHaveBeenCalledTimes(1);
    });

    it("hides regenerate button during active streaming", () => {
      render(
        <MessageItem
          message={baseAssistantMessage}
          onRegenerate={onRegenerate}
          isStreaming={true}
        />
      );

      expect(screen.queryByTestId("regenerate-message-button")).toBeNull();
    });

    it("renders structured error card with retry button when message.isError is true", () => {
      render(<MessageItem message={errorAssistantMessage} onRetry={onRetry} />);

      expect(screen.getByText("Generation failed")).toBeDefined();
      expect(
        screen.getByText("Rate limit exceeded (HTTP 429). Please retry shortly.")
      ).toBeDefined();

      const inlineRetryBtn = screen.getByTestId("error-retry-button");
      expect(inlineRetryBtn).toBeDefined();
      fireEvent.click(inlineRetryBtn);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("renders retry button in toolbar for error messages and calls onRetry", () => {
      render(<MessageItem message={errorAssistantMessage} onRetry={onRetry} />);

      const toolbarRetryBtn = screen.getByTestId("retry-message-button");
      expect(toolbarRetryBtn).toBeDefined();
      fireEvent.click(toolbarRetryBtn);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe("6. Sentiment Rating Feedback Action", () => {
    it("renders thumbs up and thumbs down buttons for assistant messages", () => {
      render(
        <MessageItem message={baseAssistantMessage} onFeedback={onFeedback} />
      );

      expect(screen.getByTestId("feedback-positive-button")).toBeDefined();
      expect(screen.getByTestId("feedback-negative-button")).toBeDefined();
    });

    it("calls onFeedback with 'positive' when thumbs up is clicked", () => {
      render(
        <MessageItem message={baseAssistantMessage} onFeedback={onFeedback} />
      );

      fireEvent.click(screen.getByTestId("feedback-positive-button"));
      expect(onFeedback).toHaveBeenCalledWith(baseAssistantMessage.id, "positive");
    });

    it("toggles sentiment back to null when clicking already positive rating", () => {
      const ratedMessage: ChatMessage = {
        ...baseAssistantMessage,
        feedback: "positive",
      };

      render(<MessageItem message={ratedMessage} onFeedback={onFeedback} />);

      const positiveBtn = screen.getByTestId("feedback-positive-button");
      expect(positiveBtn.getAttribute("aria-pressed")).toBe("true");

      fireEvent.click(positiveBtn);
      expect(onFeedback).toHaveBeenCalledWith(ratedMessage.id, null);
    });

    it("calls onFeedback with 'negative' when thumbs down is clicked", () => {
      render(
        <MessageItem message={baseAssistantMessage} onFeedback={onFeedback} />
      );

      fireEvent.click(screen.getByTestId("feedback-negative-button"));
      expect(onFeedback).toHaveBeenCalledWith(baseAssistantMessage.id, "negative");
    });
  });

  describe("7. Safe Client-Side Export & Deletion", () => {
    it("executes client-side Markdown blob download without external network requests", () => {
      render(<MessageItem message={baseUserMessage} />);

      const exportBtn = screen.getByTestId("export-message-button");
      expect(exportBtn).toBeDefined();

      fireEvent.click(exportBtn);

      expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(window.URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    });

    it("renders delete button and calls onDelete with message ID", () => {
      render(<MessageItem message={baseUserMessage} onDelete={onDelete} />);

      const deleteBtn = screen.getByTestId("delete-message-button");
      expect(deleteBtn).toBeDefined();

      fireEvent.click(deleteBtn);
      expect(onDelete).toHaveBeenCalledWith(baseUserMessage.id);
    });
  });

  describe("8. Mobile Action Menu (Radix Dropdown & 44x44px Touch Targets)", () => {
    it("renders mobile menu trigger with >=44x44px touch target ergonomics", () => {
      render(<MessageItem message={baseUserMessage} />);

      const mobileTrigger = screen.getByTestId("mobile-action-menu-trigger");
      expect(mobileTrigger).toBeDefined();
      expect(mobileTrigger.className).toContain("min-w-[44px]");
      expect(mobileTrigger.className).toContain("min-h-[44px]");
      expect(mobileTrigger.className).toContain("touch-target");
    });
  });
});
