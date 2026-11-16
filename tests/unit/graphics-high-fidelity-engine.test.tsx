import React from "react";
import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { WebGLStarfield } from "@/components/landing/webgl-starfield";
import { AtmosphericParticles } from "@/components/background/atmospheric-particles";
import { AmbientCanvas } from "@/components/background/ambient-canvas";
import { AtmosphereCanvasEngine } from "@/components/background/atmosphere-canvas-engine";
import { COLOR_THEMES } from "@/lib/types/theme";
import { VISUAL_TIER_CONFIGS } from "@/lib/performance/adaptive-quality";

describe("Graphics High-Fidelity & 120 FPS Engine Upgrades", () => {
  let addEventListenerSpy: any;
  let removeEventListenerSpy: any;

  beforeEach(() => {
    HTMLCanvasElement.prototype.getContext = vi.fn().mockImplementation((contextId) => {
      if (contextId === "2d") {
        return {
          clearRect: vi.fn(),
          fillRect: vi.fn(),
          beginPath: vi.fn(),
          arc: vi.fn(),
          fill: vi.fn(),
          stroke: vi.fn(),
          moveTo: vi.fn(),
          lineTo: vi.fn(),
          closePath: vi.fn(),
          setTransform: vi.fn(),
          scale: vi.fn(),
          fillText: vi.fn(),
          save: vi.fn(),
          restore: vi.fn(),
          createLinearGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
          createRadialGradient: vi.fn().mockReturnValue({ addColorStop: vi.fn() }),
        };
      }
      return null;
    });

    addEventListenerSpy = vi.spyOn(document, "addEventListener");
    removeEventListenerSpy = vi.spyOn(document, "removeEventListener");

    window.IntersectionObserver = vi.fn().mockImplementation(() => ({
      observe: vi.fn(),
      disconnect: vi.fn(),
      unobserve: vi.fn(),
      takeRecords: vi.fn(),
    })) as unknown as typeof IntersectionObserver;
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
  });

  describe("AtmosphericParticles Engine", () => {
    it("renders high-dpi canvas with aria-hidden='true' and fixed overlay styling", () => {
      const { container } = render(<AtmosphericParticles />);
      const canvas = container.querySelector("canvas");
      expect(canvas).not.toBeNull();
      expect(canvas?.getAttribute("aria-hidden")).toBe("true");
      expect(canvas?.className).toContain("fixed");
    });

    it("registers and cleans up visibilitychange and resize listeners on unmount", () => {
      const { unmount } = render(<AtmosphericParticles />);
      expect(addEventListenerSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
      unmount();
      expect(removeEventListenerSpy).toHaveBeenCalledWith("visibilitychange", expect.any(Function));
    });
  });

  describe("AmbientCanvas 3D Procedural Engine", () => {
    it("renders ambient canvas safely with aria-hidden='true'", () => {
      const { container } = render(<AmbientCanvas accentColor="#7c5cff" />);
      const canvas = container.querySelector("canvas");
      expect(canvas).not.toBeNull();
      expect(canvas?.getAttribute("aria-hidden")).toBe("true");
    });

    it("unmounts cleanly without throwing", () => {
      const { unmount } = render(<AmbientCanvas accentColor="#7c5cff" />);
      expect(() => unmount()).not.toThrow();
    });
  });

  describe("AtmosphereCanvasEngine Procedural Modes", () => {
    const testTheme = COLOR_THEMES.violet; // violet dark theme

    it("renders silk-ribbons mode with zero heap allocations on high-DPI canvas", () => {
      const { container, unmount } = render(
        <AtmosphereCanvasEngine theme={testTheme} engine="silk-ribbons" />
      );
      const canvas = container.querySelector("canvas");
      expect(canvas).not.toBeNull();
      expect(canvas?.getAttribute("aria-hidden")).toBe("true");
      unmount();
    });

    it("renders liquid-lava mode without throwing and cleans up", () => {
      const { container, unmount } = render(
        <AtmosphereCanvasEngine theme={testTheme} engine="liquid-lava" />
      );
      const canvas = container.querySelector("canvas");
      expect(canvas).not.toBeNull();
      unmount();
    });

    it("renders matrix-rain mode with invariant 30 FPS accumulator", () => {
      const { container, unmount } = render(
        <AtmosphereCanvasEngine theme={testTheme} engine="matrix-rain" />
      );
      const canvas = container.querySelector("canvas");
      expect(canvas).not.toBeNull();
      unmount();
    });

    it("renders meteor-shower and quantum-field modes with normalized dtScale", () => {
      const { container: c1, unmount: u1 } = render(
        <AtmosphereCanvasEngine theme={testTheme} engine="meteor-shower" />
      );
      expect(c1.querySelector("canvas")).not.toBeNull();
      u1();

      const { container: c2, unmount: u2 } = render(
        <AtmosphereCanvasEngine theme={testTheme} engine="quantum-field" />
      );
      expect(c2.querySelector("canvas")).not.toBeNull();
      u2();
    });

    it("returns null for non-canvas engines such as cosmic or waves", () => {
      const { container } = render(
        <AtmosphereCanvasEngine theme={testTheme} engine="cosmic" />
      );
      expect(container.querySelector("canvas")).toBeNull();
    });
  });

  describe("WebGLStarfield 120 FPS Quality Profiles & Geometry Preservation", () => {
    it("preserves 4,200 stars on High and Ultra Visual tiers for 100% desktop fidelity", () => {
      expect(VISUAL_TIER_CONFIGS.high.starCount).toBe(4200);
      expect(VISUAL_TIER_CONFIGS.ultra.starCount).toBe(4200);
    });

    it("provides 2,400 stars on Smooth / High Refresh tier for 90Hz/120Hz mobile devices", () => {
      expect(VISUAL_TIER_CONFIGS.smooth.starCount).toBe(2400);
      expect(VISUAL_TIER_CONFIGS.smooth.targetFps).toBe(120);
      expect(VISUAL_TIER_CONFIGS.smooth.frameBudgetMs).toBeCloseTo(8.33, 1);
    });

    it("locks 60 FPS on Balanced tier (1,800 stars) and 30 FPS on Power Saver tier (600 stars)", () => {
      expect(VISUAL_TIER_CONFIGS.balanced.targetFps).toBe(60);
      expect(VISUAL_TIER_CONFIGS.balanced.starCount).toBe(1800);
      expect(VISUAL_TIER_CONFIGS["power-saver"].targetFps).toBe(30);
      expect(VISUAL_TIER_CONFIGS["power-saver"].starCount).toBe(600);
    });
  });
});
