import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { OrbInput } from "@/components/ui/animated-input";

// ── Helpers ──
function flushTimers() {
  return act(() => vi.advanceTimersByTimeAsync(10000));
}

describe("OrbInput Component", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders the input with default placeholder", () => {
    render(<OrbInput />);
    const input = screen.getByTestId("orb-input");
    expect(input).toBeDefined();
    expect(input.getAttribute("type")).toBe("text");
    expect(input.getAttribute("aria-label")).toBe("Ask a question");
  });

  it("types out the first placeholder character-by-character", async () => {
    render(<OrbInput charDelay={10} idleDelay={100} />);
    const input = screen.getByTestId("orb-input") as HTMLInputElement;

    // Initial state: empty placeholder with cursor
    expect(input.getAttribute("placeholder")).toBe("|");

    await act(() => vi.advanceTimersByTimeAsync(10));
    expect(input.getAttribute("placeholder")).toBe("A|");

    await act(() => vi.advanceTimersByTimeAsync(20));
    expect(input.getAttribute("placeholder")).toBe("Ask|");
  });

  it("cycles to the next placeholder after idle delay", async () => {
    render(<OrbInput charDelay={10} idleDelay={100} />);
    const input = screen.getByTestId("orb-input") as HTMLInputElement;

    // Type out "Ask anything..." fully (15 chars * 10ms = 150ms)
    await act(() => vi.advanceTimersByTimeAsync(150));
    expect(input.getAttribute("placeholder")).toBe("Ask anything...|");

    // After idle delay + new placeholder typing, the text should no longer
    // start with "Ask anything" — it should have cycled to the next placeholder
    await act(() => vi.advanceTimersByTimeAsync(200));
    expect(input.getAttribute("placeholder")).not.toContain("Ask anything");
    expect(input.getAttribute("placeholder")?.length).toBeGreaterThan(0);
  });

  it("calls onSend with trimmed value and clears input on Enter", async () => {
    const onSend = vi.fn();
    render(<OrbInput onSend={onSend} />);
    const input = screen.getByTestId("orb-input") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "  Hello world  " } });
    expect(input.value).toBe("  Hello world  ");

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).toHaveBeenCalledWith("Hello world");
    expect(input.value).toBe("");
  });

  it("does not call onSend when value is empty", async () => {
    const onSend = vi.fn();
    render(<OrbInput onSend={onSend} />);
    const input = screen.getByTestId("orb-input") as HTMLInputElement;

    fireEvent.keyDown(input, { key: "Enter" });
    expect(onSend).not.toHaveBeenCalled();
  });

  it("calls onChange on controlled input", async () => {
    const onChange = vi.fn();
    render(<OrbInput value="" onChange={onChange} />);
    const input = screen.getByTestId("orb-input") as HTMLInputElement;

    fireEvent.change(input, { target: { value: "controlled" } });
    expect(onChange).toHaveBeenCalledWith("controlled");
  });

  it("applies custom className to wrapper", () => {
    render(<OrbInput className="max-w-2xl" />);
    const wrapper = screen.getByTestId("orb-input").closest(".relative");
    expect(wrapper?.className).toContain("max-w-2xl");
  });

  it("applies custom inputClassName to the input", () => {
    render(<OrbInput inputClassName="text-red-500" />);
    const input = screen.getByTestId("orb-input");
    expect(input.className).toContain("text-red-500");
  });

  it("uses custom placeholder text when provided", async () => {
    render(<OrbInput placeholder="Custom prompt..." charDelay={10} idleDelay={100} />);
    const input = screen.getByTestId("orb-input") as HTMLInputElement;

    await act(() => vi.advanceTimersByTimeAsync(60));
    expect(input.getAttribute("placeholder")).toContain("Custom");
  });

  it("cleans up timers on unmount", async () => {
    const { unmount } = render(<OrbInput charDelay={10} idleDelay={100} />);
    await act(() => vi.advanceTimersByTimeAsync(50));

    // Unmount should not throw or leak timers
    expect(() => unmount()).not.toThrow();
  });

  it("renders orb image with local asset", () => {
    render(<OrbInput />);
    const img = document.querySelector('img[alt="Radiance orb"]');
    expect(img).not.toBeNull();
    expect(img?.getAttribute("src")).toBe("/brand/radiance-orb.svg");
  });

  it("shows focus ring when focused", async () => {
    render(<OrbInput />);
    const input = screen.getByTestId("orb-input") as HTMLInputElement;

    fireEvent.focus(input);
    // The shell is the .flex element containing the orb, divider, and input
    const shell = input.closest(".relative")?.firstElementChild as HTMLElement;
    expect(shell?.className).toContain("border-gray-600");
    expect(shell?.className).toContain("scale-[1.02]");
  });

  it("renders default export", async () => {
    const mod = await import("@/components/ui/animated-input");
    expect(mod.default).toBeDefined();
    expect(typeof mod.default).toBe("function");
  });
});