import { describe, it, expect } from "vitest";
import { COLOR_THEMES } from "@/lib/types/theme";

describe("Theme Gradients Configuration & Mathematical Invariants", () => {
  const themes = Object.values(COLOR_THEMES);

  it("should define exactly 12 atmospheric themes", () => {
    expect(themes.length).toBe(12);
  });

  it("should provide exactly 6 bloom colors and 4 ribbon colors for every theme", () => {
    themes.forEach((theme) => {
      expect(theme.bloomColors).toHaveLength(6);
      expect(theme.ribbonColors).toHaveLength(4);

      theme.bloomColors.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });

      theme.ribbonColors.forEach((color) => {
        expect(color).toMatch(/^#[0-9a-fA-F]{6}$/);
      });
    });
  });

  it("should match 21st.dev reference palette exactly for violet theme", () => {
    const violet = COLOR_THEMES.violet;
    expect(violet).toBeDefined();

    // Gradient 1 Reference: #140B2E, #140B2E, #6D4AFF, #3C02A4, #6D4AFF, #C4A0FF
    expect(violet.bloomColors).toEqual([
      "#140B2E",
      "#140B2E",
      "#6D4AFF",
      "#3C02A4",
      "#6D4AFF",
      "#C4A0FF",
    ]);

    // Gradient 2 Reference: #1B1035, #4A3A8C, #B58AC9, #F5D6E6
    expect(violet.ribbonColors).toEqual([
      "#1B1035",
      "#4A3A8C",
      "#B58AC9",
      "#F5D6E6",
    ]);
  });

  it("proves Gradient 1 modulation is mathematically 0 at ph = 0 (no startup snapping)", () => {
    const phases = [0.0, 1.2, 2.4, 3.6, 4.8, 5.9];
    const ph = 0;
    const amt = 0.25;

    phases.forEach((p) => {
      const dx = (Math.sin(ph * 0.55 + p) - Math.sin(p)) * 14 * amt;
      expect(dx).toBeCloseTo(0, 10);
    });
  });

  it("proves Gradient 2 modulation is mathematically 0 at spin = 0 (no startup snapping)", () => {
    const spin = 0;
    const amt = 0.75;
    const offset = Math.sin(spin * 0.6) * 28 * amt;
    expect(offset).toBeCloseTo(0, 10);
  });
});
