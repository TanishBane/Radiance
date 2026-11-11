import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { clamp, rng, noise2, fbm, gradient, palette, KEYS, Grid } from "@/lib/ascii-art/kit";
import createArcticIcebergs, { meta } from "@/lib/ascii-art/arctic-icebergs";
import { ArcticIcebergsBackground } from "@/components/background/arctic-icebergs-background";

describe("ASCII Art Kit & Arctic Icebergs Engine Specifications", () => {
  describe("Mathematical Primitives & Noise", () => {
    it("clamps values correctly with custom and default bounds", () => {
      expect(clamp(1.5)).toBe(1);
      expect(clamp(-0.5)).toBe(0);
      expect(clamp(0.4)).toBe(0.4);
      expect(clamp(15, 0, 10)).toBe(10);
      expect(clamp(-5, 0, 10)).toBe(0);
    });

    it("generates deterministic pseudo-random numbers", () => {
      const r1 = rng(42);
      const r2 = rng(42);
      const val1 = [r1(), r1(), r1()];
      const val2 = [r2(), r2(), r2()];
      expect(val1).toEqual(val2);
      val1.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      });
    });

    it("evaluates 2D coherent noise within [0, 1]", () => {
      for (let i = 0; i < 20; i++) {
        const val = noise2(i * 0.35, i * 0.72, 5);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    });

    it("evaluates fractal Brownian motion within [0, 1]", () => {
      for (let i = 0; i < 20; i++) {
        const val = fbm(i * 0.2, i * 0.5, 3, 7);
        expect(val).toBeGreaterThanOrEqual(0);
        expect(val).toBeLessThanOrEqual(1);
      }
    });

    it("interpolates multi-stop color gradients smoothly", () => {
      const grad = gradient(["#000000", "#ffffff"], 5);
      expect(grad).toHaveLength(5);
      expect(grad[0]).toBe("#000000");
      expect(grad[4]).toBe("#ffffff");
    });
  });

  describe("Grid Buffer", () => {
    it("initializes with spaces and zeroes and allows cell assignment", () => {
      const grid = new Grid(10, 5);
      expect(grid.cols).toBe(10);
      expect(grid.rows).toBe(5);

      grid.set(2, 3, "█", 4);
      const frame = grid.frame();
      expect(frame.ch[2 + 3 * 10]).toBe("█");
      expect(frame.co[2 + 3 * 10]).toBe(4);

      grid.clear();
      expect(grid.ch[2 + 3 * 10]).toBe(" ");
      expect(grid.co[2 + 3 * 10]).toBe(0);
    });

    it("safely ignores out-of-bounds writes", () => {
      const grid = new Grid(10, 5);
      expect(() => {
        grid.set(-1, 0, "A", 1);
        grid.set(10, 5, "B", 2);
      }).not.toThrow();
    });
  });

  describe("Arctic Icebergs Simulation & Frames", () => {
    it("defines valid metadata and palette", () => {
      expect(meta.slug).toBe("arctic-icebergs");
      expect(meta.cols).toBe(100);
      expect(meta.rows).toBe(36);
      expect(meta.fps).toBe(20);
      expect(meta.palette.length).toBeGreaterThan(0);
      meta.palette.forEach((hex) => {
        expect(hex).toMatch(/^#[0-9a-f]{6}$/i);
      });
    });

    it("generates deterministic 100x36 frames without NaNs", () => {
      const render = createArcticIcebergs();
      const frame0 = render(0);

      expect(frame0.cols).toBe(100);
      expect(frame0.rows).toBe(36);
      expect(frame0.ch).toHaveLength(3600);
      expect(frame0.co).toHaveLength(3600);

      const frame1 = render(1.5);
      expect(frame1.ch).toHaveLength(3600);

      // Verify characters contain expected arctic glyphs
      const chars = new Set(frame0.ch);
      expect(chars.has("░") || chars.has("▒") || chars.has("▓") || chars.has("█")).toBe(true);
    });
  });

  describe("ArcticIcebergsBackground Component", () => {
    it("renders server-side without crashing and outputs 8 canvas layers", () => {
      const markup = renderToStaticMarkup(<ArcticIcebergsBackground />);
      expect(markup).toContain("data-testid=\"canvas-icebergs\"");
      expect(markup).toContain("data-testid=\"canvas-valley\"");
      expect(markup).toContain("data-testid=\"canvas-moonlit\"");
      expect(markup).toContain("data-testid=\"canvas-mountain\"");
      expect(markup).toContain("data-testid=\"canvas-skyline\"");
      expect(markup).toContain("data-testid=\"canvas-earth\"");
      expect(markup).toContain("data-testid=\"canvas-cyclist\"");
      expect(markup).toContain("data-testid=\"canvas-pagoda\"");
      expect(markup).toContain("position:fixed");
      expect(markup).toContain("background-color:#02050c");
    });
  });
});
