import React from "react";
import { describe, it, expect, vi } from "vitest";

vi.mock("next/font/google", () => ({
  Cormorant_Garamond: () => ({ variable: "--font-serif" }),
}));

import { render, screen } from "@testing-library/react";
import { Topbar } from "@/components/navigation/topbar";
import { ChatComposer } from "@/components/chat/chat-composer";
import { AtmosphereCanvasEngine } from "@/components/background/atmosphere-canvas-engine";
import { COLOR_THEMES } from "@/lib/types/theme";
import { FollowUpChips } from "@/components/chat/follow-up-chips";
import { WelcomeCard } from "@/components/chat/welcome-card";
import { viewport } from "@/app/layout";

describe("Mobile & Cross-Browser Ergonomics, Touch & Viewport Invariants", () => {
  it("exports Next.js viewport configuration with viewportFit cover and device-width for notch and dynamic island displays", () => {
    expect(viewport.width).toBe("device-width");
    expect(viewport.initialScale).toBe(1);
    expect(viewport.viewportFit).toBe("cover");
    expect(viewport.themeColor).toBe("#06060a");
  });

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

  it("renders topbar language toggles and clear button with finger-friendly touch targets", () => {
    render(
      <Topbar
        language="en"
        onToggleLanguage={vi.fn()}
        onClearChat={vi.fn()}
        onNewChat={vi.fn()}
      />
    );

    const enBtn = screen.getByRole("button", { name: "EN" });
    const hiBtn = screen.getByRole("button", { name: "HI" });
    const clearBtn = screen.getByRole("button", { name: /clear active conversation/i });

    expect(enBtn.className).toContain("touch-target");
    expect(hiBtn.className).toContain("touch-target");
    expect(clearBtn.className).toContain("touch-target");
    expect(clearBtn.className).toContain("min-w-[44px]");
    expect(clearBtn.className).toContain("min-h-[44px]");
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

  it("uses text-base on mobile in composer textarea to prevent iOS Safari auto-zoom", () => {
    render(
      <ChatComposer
        onSend={vi.fn()}
        onStop={vi.fn()}
        isGenerating={false}
      />
    );

    const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
    expect(textarea).toBeDefined();
    // 16px (text-base) on mobile prevents iOS viewport auto-zoom on focus
    expect(textarea.className).toContain("text-base");
    expect(textarea.className).toContain("sm:text-sm");
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
    // Verifies small mobile screen responsive max-widths (70px on narrow devices)
    expect(modelTextSpan?.className).toContain("max-w-[70px]");
  });

  it("binds both mousemove and touchmove event listeners in AtmosphereCanvasEngine for mobile touch support", () => {
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
      <AtmosphereCanvasEngine theme={theme} engine="aurora-nights" />
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

  it("renders follow up chips with touch-target ergonomics for mobile thumb accessibility", () => {
    const onSelect = vi.fn();
    render(<FollowUpChips questions={["How does quantum computing work?"]} onSelect={onSelect} />);

    const chip = screen.getByRole("button", { name: /How does quantum computing work\?/i });
    expect(chip).toBeDefined();
    expect(chip.className).toContain("min-h-[44px]");
    expect(chip.className).toContain("touch-target");
  });

  it("renders welcome card prompt buttons with touch-target ergonomics", () => {
    const onSelectPrompt = vi.fn();
    render(<WelcomeCard onSelectPrompt={onSelectPrompt} />);

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
    for (const btn of buttons) {
      expect(btn.className).toContain("touch-target");
      expect(btn.className).toContain("min-h-[44px]");
    }
  });
});
