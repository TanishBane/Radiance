import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { Topbar } from "@/components/navigation/topbar";
import { ChatComposer } from "@/components/chat/chat-composer";
import { AtmosphereCanvasEngine } from "@/components/background/atmosphere-canvas-engine";
import { COLOR_THEMES } from "@/lib/types/theme";

describe("Mobile & Cross-Browser Ergonomics, Touch & Viewport Invariants", () => {
  it("renders mobile navigation toggle button with >=44x44px touch target ergonomics", () => {
    const handleToggleMobile = vi.fn();
    render(
      <Topbar
        language="en"
        onToggleLanguage={vi.fn()}
        onClearChat={vi.fn()}
        onNewChat={vi.fn()}
        onToggleMobileMenu={handleToggleMobile}
      />
    );

    const mobileMenuBtn = screen.getByRole("button", { name: /open navigation menu/i });
    expect(mobileMenuBtn).toBeDefined();
    expect(mobileMenuBtn.className).toContain("touch-target");
    expect(mobileMenuBtn.className).toContain("min-w-[44px]");
    expect(mobileMenuBtn.className).toContain("min-h-[44px]");
  });

  it("renders chat composer bottom bar with safe-area bottom inset padding", () => {
    const { container } = render(
      <ChatComposer
        onSend={vi.fn()}
        onStop={vi.fn()}
        isGenerating={false}
      />
    );

    const composerRoot = container.firstChild as HTMLElement;
    expect(composerRoot).toBeDefined();
    // Verifies safe-area-inset-bottom is applied
    expect(composerRoot.className).toContain("pb-[max(1rem,env(safe-area-inset-bottom,0px))]");
  });

  it("binds both mousemove and touchmove event listeners in AtmosphereCanvasEngine for mobile touch support", () => {
    // Mock getContext for JSDOM so canvas effect runs
    const getContextSpy = vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockReturnValue({
      setTransform: vi.fn(),
      scale: vi.fn(),
      fillRect: vi.fn(),
      clearRect: vi.fn(),
      beginPath: vi.fn(),
      arc: vi.fn(),
      fill: vi.fn(),
      stroke: vi.fn(),
      createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
      createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
    } as unknown as CanvasRenderingContext2D);

    const addEventListenerSpy = vi.spyOn(window, "addEventListener");
    const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

    const theme = COLOR_THEMES.violet;
    const { unmount } = render(
      <AtmosphereCanvasEngine theme={theme} engine="ambient-spotlight" />
    );

    // Verify touch listeners were registered with passive: true
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "touchstart",
      expect.any(Function),
      { passive: true }
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "touchmove",
      expect.any(Function),
      { passive: true }
    );
    expect(addEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function),
      { passive: true }
    );

    unmount();

    // Verify proper unbind on unmount to prevent mobile memory leaks
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "touchstart",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "touchmove",
      expect.any(Function)
    );
    expect(removeEventListenerSpy).toHaveBeenCalledWith(
      "mousemove",
      expect.any(Function)
    );

    getContextSpy.mockRestore();
    addEventListenerSpy.mockRestore();
    removeEventListenerSpy.mockRestore();
  });

  it("ensures composer model button provides mobile-first truncation to prevent horizontal overflow", () => {
    render(
      <ChatComposer
        onSend={vi.fn()}
        onStop={vi.fn()}
        isGenerating={false}
      />
    );

    const trigger = screen.getByTestId("composer-model-trigger");
    expect(trigger).toBeDefined();
    const modelTextSpan = trigger.querySelector("span");
    expect(modelTextSpan).toBeDefined();
    expect(modelTextSpan?.className).toContain("truncate");
    // Verifies small mobile screen responsive max-widths
    expect(modelTextSpan?.className).toContain("max-w-[85px]");
  });
});
