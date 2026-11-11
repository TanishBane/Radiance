import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { WebGLStarfield } from "@/components/landing/webgl-starfield";
import { VISUAL_TIER_CONFIGS } from "@/lib/performance/adaptive-quality";

describe("WebGLStarfield Adaptive Rendering & Lifecycle Pause", () => {
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;
  let observeMock: any;
  let disconnectMock: any;

  beforeEach(() => {
    addEventListenerSpy = vi.spyOn(document, "addEventListener");
    removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    observeMock = vi.fn();
    disconnectMock = vi.fn();

    // Mock IntersectionObserver
    window.IntersectionObserver = vi.fn().mockImplementation((callback) => ({
      observe: observeMock,
      disconnect: disconnectMock,
      unobserve: vi.fn(),
      takeRecords: vi.fn(),
    })) as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  it("renders canvas element with id 'scene' and fixed background positioning", () => {
    const { container } = render(<WebGLStarfield />);
    const canvas = container.querySelector("#scene") as HTMLCanvasElement;
    expect(canvas).not.toBeNull();
    expect(canvas.className).toContain("planet-canvas");
    expect(canvas.className).toContain("starfield-canvas");
    expect(canvas.getAttribute("aria-hidden")).toBe("true");
  });

  it("registers document visibilitychange listener to pause RAF when tab is hidden", () => {
    render(<WebGLStarfield />);
    expect(addEventListenerSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
  });

  it("attaches IntersectionObserver to #scene canvas to pause when scrolled out of view", () => {
    render(<WebGLStarfield />);
    expect(observeMock).toHaveBeenCalled();
  });

  it("cleans up visibilitychange listener and disconnects IntersectionObserver on unmount", () => {
    const { unmount } = render(<WebGLStarfield />);
    unmount();
    expect(removeEventListenerSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    expect(disconnectMock).toHaveBeenCalled();
  });

  it("has tier particle count invariants conforming to High (4200), Balanced (1800), and Lightweight (600)", () => {
    expect(VISUAL_TIER_CONFIGS.high.starCount).toBe(4200);
    expect(VISUAL_TIER_CONFIGS.balanced.starCount).toBe(1800);
    expect(VISUAL_TIER_CONFIGS.lightweight.starCount).toBe(600);
  });
});
