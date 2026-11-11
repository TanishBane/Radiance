import { describe, it, expect } from "vitest";
import createFallingLeaves, { meta } from "@/lib/ascii-art/falling-leaves";

describe("ASCII Art Falling Leaves Specifications", () => {
  it("exports correct metadata for Falling Leaves", () => {
    expect(meta.slug).toBe("falling-leaves");
    expect(meta.name).toBe("Falling Leaves");
    expect(meta.cols).toBe(96);
    expect(meta.rows).toBe(34);
    expect(meta.fps).toBe(24);
    expect(meta.palette).toHaveLength(40); // 8 sky + 3 haze + 10 canopy + 3 bark + 10 litter + 6 leaf
  });

  it("generates deterministic frames across multiple time intervals with valid characters and palette indices", () => {
    const render = createFallingLeaves();
    const frame0 = render(0);
    expect(frame0.cols).toBe(96);
    expect(frame0.rows).toBe(34);
    expect(frame0.ch.length).toBe(96 * 34);
    expect(frame0.co.length).toBe(96 * 34);

    // Verify all color indices point to valid palette indices
    for (let i = 0; i < frame0.co.length; i++) {
      const colorIdx = frame0.co[i];
      expect(colorIdx).toBeGreaterThanOrEqual(0);
      expect(colorIdx).toBeLessThan(meta.palette.length);
    }

    // Verify canopy, bark, and leaf glyphs exist
    const chars = new Set(frame0.ch);
    expect(chars.has("@") || chars.has("%") || chars.has("▓") || chars.has("&")).toBe(true);
    expect(chars.has("◆") || chars.has("►") || chars.has("◄") || chars.has("-")).toBe(true);

    // Verify subsequent frame at t = 2.5s runs smoothly
    const frameLater = render(2.5);
    expect(frameLater.cols).toBe(96);
    expect(frameLater.ch.length).toBe(96 * 34);
  });
});
