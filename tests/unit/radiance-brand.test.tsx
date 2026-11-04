import React from "react";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import fs from "fs";
import path from "path";
import {
  RadianceLogo,
  RADIANCE_SYMBOL_STRIPES,
} from "@/components/branding/radiance-logo";

describe("Radiance Official Brand Identity — Vector System & Architecture", () => {
  describe("Mathematical Geometry Specifications", () => {
    it("defines exactly 17 stripe segments across 11 horizontal speed bands", () => {
      expect(RADIANCE_SYMBOL_STRIPES).toHaveLength(17);

      const bands = new Set(RADIANCE_SYMBOL_STRIPES.map((s) => s.band));
      expect(bands.size).toBe(11);
      for (let b = 1; b <= 11; b++) {
        expect(bands.has(b)).toBe(true);
      }
    });

    it("includes detached speed pill and top bar in Band 1", () => {
      const band1 = RADIANCE_SYMBOL_STRIPES.filter((s) => s.band === 1);
      expect(band1).toHaveLength(2);
      expect(band1.map((s) => s.id)).toEqual(["1A", "1B"]);
    });

    it("includes stem and outer loop segments in Bands 4 and 5 (eye aperture)", () => {
      const band4 = RADIANCE_SYMBOL_STRIPES.filter((s) => s.band === 4);
      expect(band4).toHaveLength(2);
      expect(band4.map((s) => s.id)).toEqual(["4A", "4B"]);

      const band5 = RADIANCE_SYMBOL_STRIPES.filter((s) => s.band === 5);
      expect(band5).toHaveLength(2);
      expect(band5.map((s) => s.id)).toEqual(["5A", "5B"]);
    });

    it("includes stem and slanted diagonal leg in Bands 9, 10, and 11", () => {
      for (const b of [9, 10, 11]) {
        const segs = RADIANCE_SYMBOL_STRIPES.filter((s) => s.band === b);
        expect(segs).toHaveLength(2);
        expect(segs.map((s) => s.id)).toEqual([`${b}A`, `${b}B`]);
      }
    });

    it("provides valid, closed SVG path definitions for all segments", () => {
      for (const s of RADIANCE_SYMBOL_STRIPES) {
        expect(s.d).toMatch(/^M\s/);
        expect(s.d).toContain("Z");
        expect(s.d.length).toBeGreaterThan(20);
      }
    });
  });

  describe("RadianceLogo React Component", () => {
    it("renders the primary symbol with canonical viewBox 0 0 800 700", () => {
      const { container } = render(<RadianceLogo variant="symbol" showWordmark={false} />);
      const svg = container.querySelector("svg");
      expect(svg).toBeDefined();
      expect(svg?.getAttribute("viewBox")).toBe("0 0 800 700");

      const paths = container.querySelectorAll("path");
      expect(paths).toHaveLength(17);
    });

    it("renders wordmark only when variant='wordmark'", () => {
      render(<RadianceLogo variant="wordmark" />);
      expect(screen.getByText("RADIANCE")).toBeDefined();
    });

    it("renders horizontal lockup with both symbol and wordmark", () => {
      const { container } = render(<RadianceLogo variant="lockup" />);
      const svg = container.querySelector("svg");
      expect(svg).toBeDefined();
      expect(screen.getByText("RADIANCE")).toBeDefined();
    });

    it("renders interactive button when onClick is provided", () => {
      let clicked = false;
      render(
        <RadianceLogo
          variant="lockup"
          onClick={() => {
            clicked = true;
          }}
          aria-label="Home Navigation"
        />
      );
      const btn = screen.getByRole("button", { name: "Home Navigation" });
      expect(btn).toBeDefined();
      btn.click();
      expect(clicked).toBe(true);
    });

    it("applies custom sizing classes correctly", () => {
      const { container: cSm } = render(<RadianceLogo size="sm" showWordmark={false} />);
      expect(cSm.querySelector("svg")?.getAttribute("class")).toContain("w-6");

      const { container: cLg } = render(<RadianceLogo size="lg" showWordmark={false} />);
      expect(cLg.querySelector("svg")?.getAttribute("class")).toContain("w-12");

      const { container: cHero } = render(<RadianceLogo size="hero" showWordmark={false} />);
      expect(cHero.querySelector("svg")?.getAttribute("class")).toContain("w-24");
    });
  });

  describe("Public Asset Family Validation", () => {
    const rootDir = process.cwd();

    it("has valid public/brand/radiance-symbol.svg with transparent background", () => {
      const filePath = path.join(rootDir, "public", "brand", "radiance-symbol.svg");
      expect(fs.existsSync(filePath)).toBe(true);

      const content = fs.readFileSync(filePath, "utf8");
      expect(content).toContain('viewBox="0 0 800 700"');
      expect(content).toContain('fill="currentColor"');
      // Must NOT bake in black background
      expect(content).not.toContain('<rect width="800" height="700" fill="#000000"');
      expect(content).not.toContain('<rect width="800" height="700" fill="#000"');
    });

    it("has valid public/brand/radiance-wordmark.svg", () => {
      const filePath = path.join(rootDir, "public", "brand", "radiance-wordmark.svg");
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, "utf8");
      expect(content).toContain("RADIANCE");
    });

    it("has valid public/brand/radiance-lockup.svg", () => {
      const filePath = path.join(rootDir, "public", "brand", "radiance-lockup.svg");
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, "utf8");
      expect(content).toContain("RADIANCE");
      expect(content).toContain("radiance-stripe-");
    });

    it("has valid public/brand/radiance-micro.svg", () => {
      const filePath = path.join(rootDir, "public", "brand", "radiance-micro.svg");
      expect(fs.existsSync(filePath)).toBe(true);
    });

    it("has valid public/icon.svg containing the official symbol paths", () => {
      const filePath = path.join(rootDir, "public", "icon.svg");
      expect(fs.existsSync(filePath)).toBe(true);
      const content = fs.readFileSync(filePath, "utf8");
      expect(content).toContain('viewBox="0 0 512 512"');
      expect(content).toContain("radiance-stripe-");
    });
  });
});
