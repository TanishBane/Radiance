import { describe, it, expect } from "vitest";
import createOrbitWindowEarth, { meta, W, H, LEVELS } from "@/lib/ascii-art/orbit-window-earth";

describe("ASCII Art Orbit Window Earth Specifications", () => {
  it("exports correct metadata and dimensions for Orbit Window Earth", () => {
    expect(meta.slug).toBe("orbit-window-earth");
    expect(meta.name).toBe("Orbit Window Earth");
    expect(meta.cols).toBe(192);
    expect(meta.rows).toBe(108);
    expect(meta.fps).toBe(15);
    expect(W).toBe(192);
    expect(H).toBe(108);
    expect(LEVELS).toBe("▁▂▃▄▅▆▇█");
    expect(meta.palette).toHaveLength(40);
  });

  it("generates deterministic frames across time intervals with valid levels and palette indices", () => {
    const render = createOrbitWindowEarth();
    const frame0 = render(0);

    expect(frame0.cols).toBe(192);
    expect(frame0.rows).toBe(108);
    expect(frame0.outRgb).toBeDefined();
    expect(frame0.outRgb.length).toBe(192 * 108 * 3);
    expect(frame0.levels.length).toBe(192 * 108);
    expect(frame0.colorIndices.length).toBe(192 * 108);

    // Verify all color indices point to valid palette indices
    for (let i = 0; i < frame0.colorIndices.length; i++) {
      const colorIdx = frame0.colorIndices[i];
      expect(colorIdx).toBeGreaterThanOrEqual(0);
      expect(colorIdx).toBeLessThan(meta.palette.length);
    }

    // Verify level indices are within [0, LEVELS.length - 1]
    for (let i = 0; i < frame0.levels.length; i++) {
      const lv = frame0.levels[i];
      expect(lv).toBeGreaterThanOrEqual(0);
      expect(lv).toBeLessThan(LEVELS.length);
    }

    const lines = frame0.text.split("\n");
    expect(lines).toHaveLength(108);
    expect(lines[0].length).toBe(192);

    // Verify subsequent frame at t = 2.0s runs smoothly
    const frameLater = render(2.0);
    expect(frameLater.cols).toBe(192);
    expect(frameLater.levels.length).toBe(192 * 108);
  });
});
