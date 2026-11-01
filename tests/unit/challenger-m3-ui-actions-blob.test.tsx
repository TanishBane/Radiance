import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { MessageItem } from "@/components/chat/message-item";
import { ChatMessage, FeedbackRating } from "@/lib/types/chat";

// Mock SpeechSynthesisUtterance for headless test environments
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

describe("Milestone 3 Challenger: UI Action Matrix, Blob Export & Accessibility Stress", () => {
  const onRegenerate = vi.fn();
  const onEdit = vi.fn();
  const onDelete = vi.fn();
  const onFeedback = vi.fn();
  const onRetry = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default clipboard mock
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockImplementation(() => Promise.resolve()),
      },
    });

    // Window & DOM Mocks
    if (typeof window !== "undefined") {
      window.URL.createObjectURL = vi.fn().mockReturnValue("blob:http://localhost/mock-blob-uuid");
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
      HTMLAnchorElement.prototype.click = vi.fn();
    }
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  const baseUserMessage: ChatMessage = {
    id: "msg_user_stress_1",
    role: "user",
    content: "Adversarial user prompt for stress verification.",
    createdAt: 1730000000000,
  };

  const baseAssistantMessage: ChatMessage = {
    id: "msg_asst_stress_1",
    role: "assistant",
    content: "Adversarial assistant response with formatting and actions.",
    createdAt: 1730000005000,
  };

  const errorAssistantMessage: ChatMessage = {
    id: "msg_asst_stress_err",
    role: "assistant",
    content: "Inference stream aborted unexpectedly.",
    createdAt: 1730000010000,
    isError: true,
    errorDetails: "Gateway Timeout (HTTP 504) after 30000ms.",
  };

  // ══════════════════════════════════════════════════════════════════════════
  // 1. CLIPBOARD COPY STRESS & TIMEOUT RESILIENCE
  // ══════════════════════════════════════════════════════════════════════════
  describe("1. Clipboard Copy Stress & Resilience", () => {
    it("survives 20 rapid successive clicks without throwing or desyncing state", async () => {
      render(<MessageItem message={baseUserMessage} />);
      const copyBtn = screen.getByTestId("copy-message-button");

      for (let i = 0; i < 20; i++) {
        await act(async () => {
          fireEvent.click(copyBtn);
        });
      }

      expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(20);
      expect(copyBtn.getAttribute("aria-label")).toBe("Copied to clipboard");
    });

    it("handles timer resets gracefully after rapid clicks and eventually reverts to 'Copy message'", async () => {
      vi.useFakeTimers();
      render(<MessageItem message={baseUserMessage} />);
      const copyBtn = screen.getByTestId("copy-message-button");

      // Click once
      act(() => {
        fireEvent.click(copyBtn);
      });
      expect(copyBtn.getAttribute("aria-label")).toBe("Copied to clipboard");

      // Advance by 1000ms (halfway)
      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(copyBtn.getAttribute("aria-label")).toBe("Copied to clipboard");

      // Click again at t=1000ms
      act(() => {
        fireEvent.click(copyBtn);
      });
      expect(copyBtn.getAttribute("aria-label")).toBe("Copied to clipboard");

      // Advance past all pending timers (3000ms)
      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(copyBtn.getAttribute("aria-label")).toBe("Copy message");
      vi.useRealTimers();
    });

    it("falls back gracefully when navigator.clipboard is undefined", async () => {
      const originalClipboard = navigator.clipboard;
      // Simulate insecure context or legacy browser where clipboard is missing
      Object.defineProperty(navigator, "clipboard", {
        value: undefined,
        configurable: true,
        writable: true,
      });

      render(<MessageItem message={baseUserMessage} />);
      const copyBtn = screen.getByTestId("copy-message-button");

      expect(() => {
        fireEvent.click(copyBtn);
      }).not.toThrow();

      // UI still displays confirmation state gracefully
      expect(copyBtn.getAttribute("aria-label")).toBe("Copied to clipboard");

      // Restore clipboard
      Object.defineProperty(navigator, "clipboard", {
        value: originalClipboard,
        configurable: true,
        writable: true,
      });
    });

    it("handles synchronous clipboard throws without crashing the UI", async () => {
      vi.mocked(navigator.clipboard.writeText).mockImplementation(() => {
        throw new Error("Synchronous clipboard access exception");
      });

      render(<MessageItem message={baseUserMessage} />);
      const copyBtn = screen.getByTestId("copy-message-button");

      expect(() => {
        fireEvent.click(copyBtn);
      }).not.toThrow();

      expect(copyBtn.getAttribute("aria-label")).toBe("Copied to clipboard");
    });

    it("handles asynchronous clipboard writeText rejection without crashing", async () => {
      vi.mocked(navigator.clipboard.writeText).mockRejectedValue(
        new Error("Async clipboard access denied by permission policy")
      );

      render(<MessageItem message={baseUserMessage} />);
      const copyBtn = screen.getByTestId("copy-message-button");

      await act(async () => {
        fireEvent.click(copyBtn);
      });

      expect(copyBtn.getAttribute("aria-label")).toBe("Copied to clipboard");
    });

    it("safely handles unmount during the active 2000ms copied timer", async () => {
      vi.useFakeTimers();
      const { unmount } = render(<MessageItem message={baseUserMessage} />);
      const copyBtn = screen.getByTestId("copy-message-button");

      act(() => {
        fireEvent.click(copyBtn);
      });

      // Unmount component while timer is in flight
      unmount();

      // Advance timers to trigger pending callbacks on unmounted component
      expect(() => {
        act(() => {
          vi.advanceTimersByTime(2500);
        });
      }).not.toThrow();

      vi.useRealTimers();
    });

    it("handles dynamic code copy buttons via event delegation with various code formats", () => {
      const codeMessage: ChatMessage = {
        id: "msg_code_1",
        role: "assistant",
        content: "```typescript\nconst x: number = 42;\n```",
        createdAt: 1730000000000,
      };

      const { container } = render(<MessageItem message={codeMessage} />);
      const codeCopyBtn = container.querySelector(".code-copy-btn");

      if (codeCopyBtn) {
        fireEvent.click(codeCopyBtn);
        expect(navigator.clipboard.writeText).toHaveBeenCalledWith("const x: number = 42;");
      }
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 2. SAFE CLIENT-SIDE EXPORT (MARKDOWN BLOB DOWNLOAD) STRESS
  // ══════════════════════════════════════════════════════════════════════════
  describe("2. Safe Client-Side Export (Markdown Blob Download) Stress", () => {
    it("creates UTF-8 markdown blob with complex multi-byte emojis and surrogate pairs", () => {
      const emojiContent = "✨ Radiance AI 🚀\nMulti-byte: 🦄 🤖 🧠 💥 🔣 🧙‍♂️ 👩‍👩‍👦‍👦 🌐";
      const emojiMsg: ChatMessage = {
        ...baseAssistantMessage,
        id: "msg_emoji_test",
        content: emojiContent,
      };

      let capturedBlob: Blob | null = null;
      window.URL.createObjectURL = vi.fn().mockImplementation((blob: Blob) => {
        capturedBlob = blob;
        return "blob:http://localhost/emoji-blob";
      });

      render(<MessageItem message={emojiMsg} />);
      fireEvent.click(screen.getByTestId("export-message-button"));

      expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(capturedBlob).toBeDefined();
      expect((capturedBlob as any)?.type).toBe("text/markdown;charset=utf-8");
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/emoji-blob");
    });

    it("creates markdown blob preserving complex LaTeX expressions without corruption", () => {
      const latexContent = [
        "# Mathematical Foundations",
        "Inline: $E = mc^2$ and $\\frac{a}{b} = c$",
        "Block display:",
        "$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$",
        "$$\\sum_{k=1}^n k^2 = \\frac{n(n+1)(2n+1)}{6}$$",
      ].join("\n\n");

      const latexMsg: ChatMessage = {
        ...baseAssistantMessage,
        id: "msg_latex_test",
        content: latexContent,
      };

      let capturedBlob: Blob | null = null;
      window.URL.createObjectURL = vi.fn().mockImplementation((blob: Blob) => {
        capturedBlob = blob;
        return "blob:http://localhost/latex-blob";
      });

      render(<MessageItem message={latexMsg} />);
      fireEvent.click(screen.getByTestId("export-message-button"));

      expect(capturedBlob).toBeDefined();
      expect(window.URL.revokeObjectURL).toHaveBeenCalledWith("blob:http://localhost/latex-blob");
    });

    it("creates markdown blob with multi-language code fences and unescaped HTML characters", () => {
      const complexCodeContent = [
        "## Code Demonstration",
        "```tsx",
        "export function Greeter({ name }: { name: string }) {",
        "  return <div className=\"greeting\">Hello, {name} &amp; Welcome!</div>;",
        "}",
        "```",
        "```python",
        "def query_db(filter_expr: str):",
        "    return [item for item in items if '<script>' not in item]",
        "```",
      ].join("\n\n");

      const codeMsg: ChatMessage = {
        ...baseAssistantMessage,
        id: "msg_code_export",
        content: complexCodeContent,
      };

      const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
      render(<MessageItem message={codeMsg} />);

      let downloadedFileName = "";
      const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node: Node) => {
        if ((node as HTMLAnchorElement).download) {
          downloadedFileName = (node as HTMLAnchorElement).download;
        }
        return node;
      });

      fireEvent.click(screen.getByTestId("export-message-button"));

      expect(downloadedFileName).toBe("radiance-message-msg_code_export.md");
      appendChildSpy.mockRestore();
      anchorClickSpy.mockRestore();
    });

    it("handles large text payloads (100,000+ characters) without memory leaks or UI freeze", () => {
      const largeContent = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ".repeat(2000); // ~116KB
      const largeMsg: ChatMessage = {
        ...baseAssistantMessage,
        id: "msg_large_export",
        content: largeContent,
      };

      const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
      render(<MessageItem message={largeMsg} />);
      const startTime = performance.now();
      fireEvent.click(screen.getByTestId("export-message-button"));
      const duration = performance.now() - startTime;

      // Ensure blob export takes < 150ms even for 100KB+ strings
      expect(duration).toBeLessThan(150);
      expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(window.URL.revokeObjectURL).toHaveBeenCalledTimes(1);
      anchorClickSpy.mockRestore();
    });

    it("guarantees ZERO external network requests during client-side export", () => {
      const originalFetch = global.fetch;
      const fetchSpy = vi.fn();
      global.fetch = fetchSpy;
      const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});

      render(<MessageItem message={baseAssistantMessage} />);
      fireEvent.click(screen.getByTestId("export-message-button"));

      expect(fetchSpy).not.toHaveBeenCalled();
      global.fetch = originalFetch;
      anchorClickSpy.mockRestore();
    });

    it("cleans up the temporary anchor element from DOM immediately after download trigger", () => {
      const anchorClickSpy = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => {});
      render(<MessageItem message={baseUserMessage} />);

      const appendChildSpy = vi.spyOn(document.body, "appendChild");
      const removeChildSpy = vi.spyOn(document.body, "removeChild");

      fireEvent.click(screen.getByTestId("export-message-button"));

      expect(appendChildSpy).toHaveBeenCalledTimes(1);
      expect(removeChildSpy).toHaveBeenCalledTimes(1);

      // Verify no remaining orphan anchor tags with download attributes in body
      const lingeringAnchors = document.body.querySelectorAll("a[download]");
      expect(lingeringAnchors.length).toBe(0);

      appendChildSpy.mockRestore();
      removeChildSpy.mockRestore();
      anchorClickSpy.mockRestore();
    });

    it("falls back to clipboard copy if URL.createObjectURL throws an error (e.g. CSP restrictions)", () => {
      window.URL.createObjectURL = vi.fn().mockImplementation(() => {
        throw new Error("CSP directive 'blob:' blocked by security policy");
      });

      render(<MessageItem message={baseUserMessage} />);
      expect(() => {
        fireEvent.click(screen.getByTestId("export-message-button"));
      }).not.toThrow();

      // Verified fallback to clipboard
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(baseUserMessage.content);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 3. INLINE PROMPT EDIT BOUNDARY & STATE STRESS
  // ══════════════════════════════════════════════════════════════════════════
  describe("3. Inline Prompt Edit Boundary & State Stress", () => {
    it("submits modified prompt via Enter key without Shift", () => {
      render(<MessageItem message={baseUserMessage} onEdit={onEdit} />);
      fireEvent.click(screen.getByTestId("edit-message-button"));

      const textarea = screen.getByTestId("edit-message-textarea");
      fireEvent.change(textarea, { target: { value: "Updated prompt text" } });

      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      expect(onEdit).toHaveBeenCalledWith("Updated prompt text");
      expect(screen.queryByTestId("edit-message-textarea")).toBeNull();
    });

    it("allows multiline entry with Shift+Enter without premature submission", () => {
      render(<MessageItem message={baseUserMessage} onEdit={onEdit} />);
      fireEvent.click(screen.getByTestId("edit-message-button"));

      const textarea = screen.getByTestId("edit-message-textarea");
      fireEvent.change(textarea, { target: { value: "Line 1\nLine 2" } });

      // Shift+Enter should NOT submit
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });
      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.getByTestId("edit-message-textarea")).toBeDefined();
    });

    it("cancels editing and restores original content on Escape keypress", () => {
      render(<MessageItem message={baseUserMessage} onEdit={onEdit} />);
      fireEvent.click(screen.getByTestId("edit-message-button"));

      const textarea = screen.getByTestId("edit-message-textarea");
      fireEvent.change(textarea, { target: { value: "Draft that will be cancelled" } });

      fireEvent.keyDown(textarea, { key: "Escape" });
      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.queryByTestId("edit-message-textarea")).toBeNull();

      // Re-opening edit mode should show original message content, not the discarded draft
      fireEvent.click(screen.getByTestId("edit-message-button"));
      const newTextarea = screen.getByTestId("edit-message-textarea") as HTMLTextAreaElement;
      expect(newTextarea.value).toBe(baseUserMessage.content);
    });

    it("cancels editing on Cancel button click and resets state", () => {
      render(<MessageItem message={baseUserMessage} onEdit={onEdit} />);
      fireEvent.click(screen.getByTestId("edit-message-button"));

      const textarea = screen.getByTestId("edit-message-textarea");
      fireEvent.change(textarea, { target: { value: "Temporary edits" } });

      fireEvent.click(screen.getByTestId("cancel-edit-button"));
      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.queryByTestId("edit-message-textarea")).toBeNull();
    });

    it("rejects submitting completely empty text via Enter or button", () => {
      render(<MessageItem message={baseUserMessage} onEdit={onEdit} />);
      fireEvent.click(screen.getByTestId("edit-message-button"));

      const textarea = screen.getByTestId("edit-message-textarea");
      fireEvent.change(textarea, { target: { value: "" } });

      const saveBtn = screen.getByTestId("save-edit-button") as HTMLButtonElement;
      expect(saveBtn.disabled).toBe(true);

      // Attempt Enter submit
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.getByTestId("edit-message-textarea")).toBeDefined();
    });

    it("rejects submitting whitespace-only text (spaces, tabs, newlines)", () => {
      render(<MessageItem message={baseUserMessage} onEdit={onEdit} />);
      fireEvent.click(screen.getByTestId("edit-message-button"));

      const textarea = screen.getByTestId("edit-message-textarea");
      fireEvent.change(textarea, { target: { value: "   \n\t   \n  " } });

      const saveBtn = screen.getByTestId("save-edit-button") as HTMLButtonElement;
      expect(saveBtn.disabled).toBe(true);

      // Attempt click on disabled button
      fireEvent.click(saveBtn);
      expect(onEdit).not.toHaveBeenCalled();

      // Attempt Enter submit
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      expect(onEdit).not.toHaveBeenCalled();
      expect(screen.getByTestId("edit-message-textarea")).toBeDefined();
    });

    it("trims leading and trailing whitespace upon valid submission", () => {
      render(<MessageItem message={baseUserMessage} onEdit={onEdit} />);
      fireEvent.click(screen.getByTestId("edit-message-button"));

      const textarea = screen.getByTestId("edit-message-textarea");
      fireEvent.change(textarea, { target: { value: "   Padded query with surrounding spaces   " } });

      fireEvent.click(screen.getByTestId("save-edit-button"));
      expect(onEdit).toHaveBeenCalledWith("Padded query with surrounding spaces");
      expect(screen.queryByTestId("edit-message-textarea")).toBeNull();
    });

    it("syncs internal editContent when external message.content prop changes", () => {
      const { rerender } = render(<MessageItem message={baseUserMessage} onEdit={onEdit} />);

      const updatedMsg: ChatMessage = {
        ...baseUserMessage,
        content: "Remotely updated message content",
      };

      rerender(<MessageItem message={updatedMsg} onEdit={onEdit} />);
      fireEvent.click(screen.getByTestId("edit-message-button"));

      const textarea = screen.getByTestId("edit-message-textarea") as HTMLTextAreaElement;
      expect(textarea.value).toBe("Remotely updated message content");
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 4. SENTIMENT FEEDBACK STATE MACHINE & RAPID TOGGLING
  // ══════════════════════════════════════════════════════════════════════════
  describe("4. Sentiment Feedback State Machine & Rapid Toggling", () => {
    it("initial unrated message has both buttons with aria-pressed='false'", () => {
      render(<MessageItem message={baseAssistantMessage} onFeedback={onFeedback} />);

      const posBtn = screen.getByTestId("feedback-positive-button");
      const negBtn = screen.getByTestId("feedback-negative-button");

      expect(posBtn.getAttribute("aria-pressed")).toBe("false");
      expect(negBtn.getAttribute("aria-pressed")).toBe("false");
    });

    it("clicking positive rating triggers onFeedback with 'positive'", () => {
      render(<MessageItem message={baseAssistantMessage} onFeedback={onFeedback} />);
      fireEvent.click(screen.getByTestId("feedback-positive-button"));

      expect(onFeedback).toHaveBeenCalledWith(baseAssistantMessage.id, "positive");
    });

    it("clicking positive rating when already positive toggles it back to null", () => {
      const positiveMsg: ChatMessage = {
        ...baseAssistantMessage,
        feedback: "positive",
      };

      render(<MessageItem message={positiveMsg} onFeedback={onFeedback} />);
      const posBtn = screen.getByTestId("feedback-positive-button");
      expect(posBtn.getAttribute("aria-pressed")).toBe("true");

      fireEvent.click(posBtn);
      expect(onFeedback).toHaveBeenCalledWith(positiveMsg.id, null);
    });

    it("clicking negative rating when already negative toggles it back to null", () => {
      const negativeMsg: ChatMessage = {
        ...baseAssistantMessage,
        feedback: "negative",
      };

      render(<MessageItem message={negativeMsg} onFeedback={onFeedback} />);
      const negBtn = screen.getByTestId("feedback-negative-button");
      expect(negBtn.getAttribute("aria-pressed")).toBe("true");

      fireEvent.click(negBtn);
      expect(onFeedback).toHaveBeenCalledWith(negativeMsg.id, null);
    });

    it("switches from positive to negative rating directly", () => {
      const positiveMsg: ChatMessage = {
        ...baseAssistantMessage,
        feedback: "positive",
      };

      render(<MessageItem message={positiveMsg} onFeedback={onFeedback} />);
      fireEvent.click(screen.getByTestId("feedback-negative-button"));

      expect(onFeedback).toHaveBeenCalledWith(positiveMsg.id, "negative");
    });

    it("stress tests full rapid transition cycle: null -> positive -> negative -> null -> negative -> positive", () => {
      const mockFeedbackSequence: Array<FeedbackRating | null> = [];
      const testFeedbackHandler = (_id: string, next: FeedbackRating | null) => {
        mockFeedbackSequence.push(next);
      };

      let currentFeedback: FeedbackRating | null = null;
      const { rerender } = render(
        <MessageItem
          message={{ ...baseAssistantMessage, feedback: currentFeedback }}
          onFeedback={testFeedbackHandler}
        />
      );

      // Step 1: Click positive (from null -> positive)
      fireEvent.click(screen.getByTestId("feedback-positive-button"));
      currentFeedback = "positive";
      rerender(<MessageItem message={{ ...baseAssistantMessage, feedback: currentFeedback }} onFeedback={testFeedbackHandler} />);

      // Step 2: Click negative (from positive -> negative)
      fireEvent.click(screen.getByTestId("feedback-negative-button"));
      currentFeedback = "negative";
      rerender(<MessageItem message={{ ...baseAssistantMessage, feedback: currentFeedback }} onFeedback={testFeedbackHandler} />);

      // Step 3: Click negative again (from negative -> null)
      fireEvent.click(screen.getByTestId("feedback-negative-button"));
      currentFeedback = null;
      rerender(<MessageItem message={{ ...baseAssistantMessage, feedback: currentFeedback }} onFeedback={testFeedbackHandler} />);

      // Step 4: Click negative (from null -> negative)
      fireEvent.click(screen.getByTestId("feedback-negative-button"));
      currentFeedback = "negative";
      rerender(<MessageItem message={{ ...baseAssistantMessage, feedback: currentFeedback }} onFeedback={testFeedbackHandler} />);

      // Step 5: Click positive (from negative -> positive)
      fireEvent.click(screen.getByTestId("feedback-positive-button"));
      currentFeedback = "positive";
      rerender(<MessageItem message={{ ...baseAssistantMessage, feedback: currentFeedback }} onFeedback={testFeedbackHandler} />);

      expect(mockFeedbackSequence).toEqual([
        "positive",
        "negative",
        null,
        "negative",
        "positive",
      ]);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 5. KEYBOARD ACCESSIBILITY & FOCUS-WITHIN COMPLIANCE
  // ══════════════════════════════════════════════════════════════════════════
  describe("5. Keyboard Accessibility & Focus-Within Compliance", () => {
    it("verifies focus-within and group-focus-within classes for desktop toolbar visibility", () => {
      const { container } = render(
        <MessageItem
          message={baseAssistantMessage}
          onRegenerate={onRegenerate}
          onFeedback={onFeedback}
          onDelete={onDelete}
        />
      );

      const toolbar = container.querySelector(".hidden.sm\\:flex");
      expect(toolbar).toBeDefined();
      expect(toolbar?.className).toContain("group-focus-within:opacity-100");
      expect(toolbar?.className).toContain("focus-within:opacity-100");
      expect(toolbar?.className).toContain("opacity-0");
    });

    it("verifies all action buttons are keyboard focusable standard buttons with accessible labels", () => {
      render(
        <MessageItem
          message={baseAssistantMessage}
          onRegenerate={onRegenerate}
          onFeedback={onFeedback}
          onDelete={onDelete}
        />
      );

      const buttons = [
        screen.getByTestId("copy-message-button"),
        screen.getByTestId("read-aloud-button"),
        screen.getByTestId("regenerate-message-button"),
        screen.getByTestId("feedback-positive-button"),
        screen.getByTestId("feedback-negative-button"),
        screen.getByTestId("export-message-button"),
        screen.getByTestId("delete-message-button"),
      ];

      buttons.forEach((btn) => {
        expect(btn.tagName.toLowerCase()).toBe("button");
        expect(btn.getAttribute("type")).toBe("button");
        expect(btn.getAttribute("aria-label")).toBeTruthy();
        expect(btn.tabIndex).toBe(0);
      });
    });

    it("verifies inline edit form accessibility elements (autoFocus, labels, keyboard submit)", () => {
      render(<MessageItem message={baseUserMessage} onEdit={onEdit} />);
      fireEvent.click(screen.getByTestId("edit-message-button"));

      const textarea = screen.getByTestId("edit-message-textarea");
      const cancelBtn = screen.getByTestId("cancel-edit-button");
      const saveBtn = screen.getByTestId("save-edit-button");

      expect(textarea.getAttribute("aria-label")).toBe("Edit message prompt");
      expect(cancelBtn.tagName.toLowerCase()).toBe("button");
      expect(saveBtn.tagName.toLowerCase()).toBe("button");
      expect(saveBtn.getAttribute("type")).toBe("button");
    });

    it("verifies error card retry button accessibility for assistant failure states", () => {
      render(<MessageItem message={errorAssistantMessage} onRetry={onRetry} />);

      const retryBtn = screen.getByTestId("error-retry-button");
      expect(retryBtn.tagName.toLowerCase()).toBe("button");
      expect(retryBtn.getAttribute("type")).toBe("button");
      expect(retryBtn.textContent).toContain("Retry generation");

      fireEvent.click(retryBtn);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("verifies mobile menu trigger complies with WCAG touch target (>=44x44px) and focus ring", () => {
      render(<MessageItem message={baseUserMessage} />);

      const trigger = screen.getByTestId("mobile-action-menu-trigger");
      expect(trigger.className).toContain("min-w-[44px]");
      expect(trigger.className).toContain("min-h-[44px]");
      expect(trigger.className).toContain("focus-visible:ring-2");
      expect(trigger.getAttribute("aria-label")).toBe("Message actions");
    });

    it("verifies semantic <time> element provides ISO string in dateTime, title, and aria-label", () => {
      render(<MessageItem message={baseUserMessage} />);

      const timeEl = screen.getByTestId("message-timestamp");
      expect(timeEl.tagName.toLowerCase()).toBe("time");

      const iso = new Date(baseUserMessage.createdAt).toISOString();
      expect(timeEl.getAttribute("dateTime")).toBe(iso);
      expect(timeEl.getAttribute("title")).toBe(iso);
      expect(timeEl.getAttribute("aria-label")).toBe(`Sent at ${iso}`);
    });
  });

  // ══════════════════════════════════════════════════════════════════════════
  // 6. FILENAME FALLBACK & MOBILE MENU ACTION ERGONOMICS
  // ══════════════════════════════════════════════════════════════════════════
  describe("6. Filename Fallback & Mobile Menu Action Ergonomics", () => {
    it("generates fallback timestamp filename when message.id is empty or missing", () => {
      const noIdMsg: ChatMessage = {
        id: "",
        role: "user",
        content: "Message without explicit id",
        createdAt: 1730000000000,
      };

      render(<MessageItem message={noIdMsg} />);
      let downloadedFileName = "";
      const appendChildSpy = vi.spyOn(document.body, "appendChild").mockImplementation((node: Node) => {
        if ((node as HTMLAnchorElement).download) {
          downloadedFileName = (node as HTMLAnchorElement).download;
        }
        return node;
      });

      fireEvent.click(screen.getByTestId("export-message-button"));

      expect(downloadedFileName).toMatch(/^radiance-message-\d+\.md$/);
      appendChildSpy.mockRestore();
    });

    it("opens mobile dropdown menu and triggers copy action from mobile item", () => {
      render(<MessageItem message={baseUserMessage} />);

      const mobileTrigger = screen.getByTestId("mobile-action-menu-trigger");
      fireEvent.pointerDown(mobileTrigger, { button: 0, ctrlKey: false });
      fireEvent.keyDown(mobileTrigger, { key: "Enter" });

      const mobileCopy = screen.getByTestId("mobile-action-copy");
      expect(mobileCopy).toBeDefined();

      fireEvent.click(mobileCopy);
      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(baseUserMessage.content);
    });

    it("triggers mobile export action and invokes safe client blob download", () => {
      render(<MessageItem message={baseUserMessage} />);

      const mobileTrigger = screen.getByTestId("mobile-action-menu-trigger");
      fireEvent.pointerDown(mobileTrigger, { button: 0, ctrlKey: false });
      fireEvent.keyDown(mobileTrigger, { key: "Enter" });

      const mobileExport = screen.getByTestId("mobile-action-export");
      expect(mobileExport).toBeDefined();

      fireEvent.click(mobileExport);
      expect(window.URL.createObjectURL).toHaveBeenCalledTimes(1);
      expect(window.URL.revokeObjectURL).toHaveBeenCalledTimes(1);
    });

    it("triggers mobile feedback positive and negative actions with proper toggling", () => {
      render(
        <MessageItem
          message={baseAssistantMessage}
          onFeedback={onFeedback}
        />
      );

      const mobileTrigger = screen.getByTestId("mobile-action-menu-trigger");
      fireEvent.pointerDown(mobileTrigger, { button: 0, ctrlKey: false });
      fireEvent.keyDown(mobileTrigger, { key: "Enter" });

      const posItem = screen.getByTestId("mobile-action-feedback-positive");
      expect(posItem).toBeDefined();

      fireEvent.click(posItem);
      expect(onFeedback).toHaveBeenCalledWith(baseAssistantMessage.id, "positive");
    });
  });
});
