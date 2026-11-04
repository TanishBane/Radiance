import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatComposer } from "@/components/chat/chat-composer";
import { AVAILABLE_MODELS, getModelById } from "@/lib/ai/models";

describe("ChatComposer Component & Deduplication Controls", () => {
  const onSend = vi.fn();
  const onStop = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Rendering & Accessibility Attributes", () => {
    it("renders textarea with expected placeholder and default state", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(
        "Ask RADIANCE anything... (Shift+Enter for newline)"
      );
      expect(textarea).toBeDefined();
    });

    it("renders Send button with accessible name and data-testid when not generating", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const sendButton = screen.getByTestId("send-button");
      expect(sendButton).toBeDefined();
      expect(sendButton.getAttribute("aria-label")).toBe("Send message");
      expect((sendButton as HTMLButtonElement).disabled).toBe(true);
    });

    it("enables Send button when user types non-empty input", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(
        "Ask RADIANCE anything... (Shift+Enter for newline)"
      );
      const sendButton = screen.getByTestId("send-button");

      expect((sendButton as HTMLButtonElement).disabled).toBe(true);

      fireEvent.change(textarea, { target: { value: "Hello AI" } });
      expect((sendButton as HTMLButtonElement).disabled).toBe(false);

      fireEvent.change(textarea, { target: { value: "   " } });
      expect((sendButton as HTMLButtonElement).disabled).toBe(true);
    });
  });

  describe("2. Submission Controls & Clearing", () => {
    it("submits message on Send button click and clears input", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(
        "Ask RADIANCE anything... (Shift+Enter for newline)"
      );
      const sendButton = screen.getByTestId("send-button");

      fireEvent.change(textarea, { target: { value: "Prompt to send" } });
      fireEvent.click(sendButton);

      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledWith("Prompt to send", []);
      expect((textarea as HTMLTextAreaElement).value).toBe("");
    });

    it("submits message on Enter keypress without Shift and clears input", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(
        "Ask RADIANCE anything... (Shift+Enter for newline)"
      );

      fireEvent.change(textarea, { target: { value: "Enter message" } });
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledWith("Enter message", []);
      expect((textarea as HTMLTextAreaElement).value).toBe("");
    });

    it("does NOT submit message on Shift+Enter (allows multiline formatting)", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(
        "Ask RADIANCE anything... (Shift+Enter for newline)"
      );

      fireEvent.change(textarea, { target: { value: "Line 1" } });
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: true });

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe("3. CJK IME Composition Guard", () => {
    it("prevents submission when Enter is pressed while isComposing is true", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(
        "Ask RADIANCE anything... (Shift+Enter for newline)"
      );

      fireEvent.change(textarea, { target: { value: "nihon" } });

      // Emulate IME candidate selection event with isComposing: true
      const imeEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(imeEvent, "isComposing", { value: true, configurable: true });

      textarea.dispatchEvent(imeEvent);

      expect(onSend).not.toHaveBeenCalled();
    });

    it("prevents submission when Enter has keyCode 229 (standard IME keyCode)", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(
        "Ask RADIANCE anything... (Shift+Enter for newline)"
      );

      fireEvent.change(textarea, { target: { value: "hangul" } });

      fireEvent.keyDown(textarea, { key: "Enter", keyCode: 229 });

      expect(onSend).not.toHaveBeenCalled();
    });

    it("submits normally once IME composition has finished", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(
        "Ask RADIANCE anything... (Shift+Enter for newline)"
      );

      fireEvent.change(textarea, { target: { value: "Confirmed text" } });

      const normalEnter = new KeyboardEvent("keydown", {
        key: "Enter",
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(normalEnter, "isComposing", { value: false, configurable: true });

      act(() => {
        textarea.dispatchEvent(normalEnter);
      });

      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledWith("Confirmed text", []);
    });
  });

  describe("4. Stop Button Toggle During Active Generation", () => {
    it("renders Stop button with aria-label and data-testid when isGenerating is true", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={true} />);

      expect(screen.queryByTestId("send-button")).toBeNull();

      const stopButton = screen.getByTestId("stop-button");
      expect(stopButton).toBeDefined();
      expect(stopButton.getAttribute("aria-label")).toBe("Stop response generation");
    });

    it("invokes onStop with zero arguments when Stop button is clicked", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={true} />);

      const stopButton = screen.getByTestId("stop-button");
      fireEvent.click(stopButton);

      expect(onStop).toHaveBeenCalledTimes(1);
      expect(onStop).toHaveBeenCalledWith();
    });

    it("switches back to Send button when isGenerating becomes false", () => {
      const { rerender } = render(
        <ChatComposer onSend={onSend} onStop={onStop} isGenerating={true} />
      );

      expect(screen.getByTestId("stop-button")).toBeDefined();

      rerender(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      expect(screen.queryByTestId("stop-button")).toBeNull();
      expect(screen.getByTestId("send-button")).toBeDefined();
    });
  });

  describe("5. Submission Deduplication Guard (isSubmittingRef)", () => {
    it("drops synchronous double-click events, calling onSend exactly once", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(
        "Ask RADIANCE anything... (Shift+Enter for newline)"
      );
      const sendButton = screen.getByTestId("send-button");

      fireEvent.change(textarea, { target: { value: "Double click test" } });

      // Simulate rapid double click in same execution frame
      act(() => {
        fireEvent.click(sendButton);
        fireEvent.click(sendButton);
      });

      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledWith("Double click test", []);
    });

    it("drops rapid double Enter keypresses, calling onSend exactly once", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(
        "Ask RADIANCE anything... (Shift+Enter for newline)"
      );

      fireEvent.change(textarea, { target: { value: "Double enter test" } });

      act(() => {
        fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
        fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      });

      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledWith("Double enter test", []);
    });
  });

  describe("6. Disabled Property Guard", () => {
    it("does not submit when disabled is true", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} disabled={true} />);

      const textarea = screen.getByPlaceholderText(
        "Ask RADIANCE anything... (Shift+Enter for newline)"
      );
      const sendButton = screen.getByTestId("send-button");

      fireEvent.change(textarea, { target: { value: "Disabled prompt" } });

      expect((sendButton as HTMLButtonElement).disabled).toBe(true);

      fireEvent.click(sendButton);
      fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  describe("7. AI Model Selection & Image 2 Design Specifications", () => {
    it("renders the model selector pill with purple microchip icon and default model name", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const modelTrigger = screen.getByTestId("composer-model-trigger");
      expect(modelTrigger).toBeDefined();
      expect(modelTrigger.getAttribute("aria-haspopup")).toBe("listbox");
      expect(modelTrigger.getAttribute("aria-expanded")).toBe("false");
      expect(modelTrigger.textContent).toContain("Radiance Fast");

      // Verify pill class and microchip icon
      expect(modelTrigger.className).toContain("rounded-full");
      const cpuIcon = modelTrigger.querySelector("svg");
      expect(cpuIcon).toBeDefined();
      expect(cpuIcon?.getAttribute("class")).toContain("text-[#c084fc]");
    });

    it("renders the active model passed via selectedModel prop matching Image 2", () => {
      const openWeightsModel = getModelById("openrouter-reasoning");
      render(
        <ChatComposer
          onSend={onSend}
          onStop={onStop}
          isGenerating={false}
          selectedModel={openWeightsModel}
        />
      );

      const modelTrigger = screen.getByTestId("composer-model-trigger");
      expect(modelTrigger.textContent).toContain("Radiance OpenWeights");
    });

    it("opens popover with all AVAILABLE_MODELS on click and updates aria-expanded", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const modelTrigger = screen.getByTestId("composer-model-trigger");
      expect(screen.queryByRole("listbox")).toBeNull();

      fireEvent.click(modelTrigger);

      expect(modelTrigger.getAttribute("aria-expanded")).toBe("true");
      const listbox = screen.getByRole("listbox");
      expect(listbox).toBeDefined();

      AVAILABLE_MODELS.forEach((model) => {
        const option = screen.getByTestId(`model-option-${model.id}`);
        expect(option).toBeDefined();
        expect(option.textContent).toContain(model.name);
        expect(option.textContent).toContain(model.sub);
        expect(option.textContent).toContain(model.provider);
      });
    });

    it("selects a model and invokes onSelectModel callback", () => {
      const onSelectModel = vi.fn();
      render(
        <ChatComposer
          onSend={onSend}
          onStop={onStop}
          isGenerating={false}
          onSelectModel={onSelectModel}
        />
      );

      const modelTrigger = screen.getByTestId("composer-model-trigger");
      fireEvent.click(modelTrigger);

      const openWeightsOption = screen.getByTestId("model-option-openrouter-reasoning");
      fireEvent.click(openWeightsOption);

      expect(onSelectModel).toHaveBeenCalledTimes(1);
      expect(onSelectModel).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "openrouter-reasoning",
          name: "Radiance OpenWeights",
        })
      );

      // Popover should close
      expect(screen.queryByRole("listbox")).toBeNull();
      expect(modelTrigger.getAttribute("aria-expanded")).toBe("false");
      expect(modelTrigger.textContent).toContain("Radiance OpenWeights");
    });

    it("closes popover when user presses Escape key", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const modelTrigger = screen.getByTestId("composer-model-trigger");
      fireEvent.click(modelTrigger);
      expect(screen.getByRole("listbox")).toBeDefined();

      fireEvent.keyDown(window, { key: "Escape" });
      expect(screen.queryByRole("listbox")).toBeNull();
      expect(modelTrigger.getAttribute("aria-expanded")).toBe("false");
    });

    it("supports keyboard navigation with ArrowDown/ArrowUp and selection via Enter", () => {
      const onSelectModel = vi.fn();
      render(
        <ChatComposer
          onSend={onSend}
          onStop={onStop}
          isGenerating={false}
          onSelectModel={onSelectModel}
        />
      );

      const modelTrigger = screen.getByTestId("composer-model-trigger");
      // Open via ArrowDown key on trigger
      fireEvent.keyDown(modelTrigger, { key: "ArrowDown" });
      expect(modelTrigger.getAttribute("aria-expanded")).toBe("true");

      const listbox = screen.getByRole("listbox");
      expect(listbox).toBeDefined();
      expect(modelTrigger.getAttribute("aria-controls")).toBe("composer-model-listbox");

      // Navigate down through options
      fireEvent.keyDown(listbox, { key: "ArrowDown" });

      // Select via Enter key
      const geminiOption = screen.getByTestId("model-option-gemini-quality");
      fireEvent.keyDown(geminiOption, { key: "Enter" });

      expect(onSelectModel).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "gemini-quality",
          name: "Radiance Multimodal",
        })
      );
      expect(screen.queryByRole("listbox")).toBeNull();
    });

    it("applies responsive mobile bounds to popover avoiding screen edge clipping", () => {
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const modelTrigger = screen.getByTestId("composer-model-trigger");
      fireEvent.click(modelTrigger);

      const listbox = screen.getByRole("listbox");
      expect(listbox.className).toContain("-left-16");
      expect(listbox.className).toContain("sm:left-0");
      expect(listbox.className).toContain("max-w-[calc(100vw-2rem)]");
    });
  });
});
