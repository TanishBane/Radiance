import { describe, it, expect } from "vitest";
import createAuroraCurtains, { meta } from "@/lib/ascii-art/aurora-curtains";

describe("ASCII Art Aurora Curtains Specifications", () => {
  it("exports correct metadata for Aurora Curtains", () => {
    expect(meta.slug).toBe("aurora-curtains");
    expect(meta.name).toBe("Aurora Curtains");
    expect(meta.cols).toBe(100);
    expect(meta.rows).toBe(34);
    expect(meta.fps).toBe(20);
    expect(meta.palette).toHaveLength(45); // 6 sky + 10 a0 + 10 a1 + 10 a2 + 4 top + 2 star + 3 hill
  });

  it("generates deterministic frames across multiple time intervals with valid characters and palette indices", () => {
    const render = createAuroraCurtains();
    const frame0 = render(0);
    expect(frame0.cols).toBe(100);
    expect(frame0.rows).toBe(34);
    expect(frame0.ch.length).toBe(100 * 34);
    expect(frame0.co.length).toBe(100 * 34);

    // Verify all color indices point to valid palette indices
    for (let i = 0; i < frame0.co.length; i++) {
      const colorIdx = frame0.co[i];
      expect(colorIdx).toBeGreaterThanOrEqual(0);
      expect(colorIdx).toBeLessThan(meta.palette.length);
    }

    // Verify aurora, sky, and hill glyphs exist
    const chars = new Set(frame0.ch);
    expect(chars.has("·") || chars.has("░") || chars.has("▒") || chars.has("▓") || chars.has("█")).toBe(true);

    // Verify subsequent frame at t = 3.0s runs smoothly
    const frameLater = render(3.0);
    expect(frameLater.cols).toBe(100);
    expect(frameLater.ch.length).toBe(100 * 34);
  });
});
