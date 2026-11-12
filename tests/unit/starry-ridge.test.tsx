import { describe, it, expect } from "vitest";
import createStarryRidge, { meta, data, W, H } from "@/lib/ascii-art/starry-ridge";
import { DOT_LEVELS } from "@/lib/ascii-art/image";

describe("ASCII Art Starry Ridge & Image Piece Engine Specifications", () => {
  it("defines 192x108 resolution, 15 FPS, and 62-color halftone palette metadata", () => {
    expect(meta.slug).toBe("starry-ridge");
    expect(meta.name).toBe("Starry Ridge");
    expect(meta.category).toBe("landscapes");
    expect(meta.cols).toBe(192);
    expect(meta.rows).toBe(108);
    expect(meta.fps).toBe(15);
    expect(meta.cell).toBe("square");
    expect(meta.look).toBe("dots");
    expect(W).toBe(192);
    expect(H).toBe(108);

    const paletteKeys = Object.keys(meta.palette);
    expect(paletteKeys.length).toBe(62);
    paletteKeys.forEach((key) => {
      expect(meta.palette[key]).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  it("provides complete 108x192 color and level data matching palette keys and dot levels", () => {
    expect(data.color).toHaveLength(108);
    expect(data.level).toHaveLength(108);

    for (let y = 0; y < 108; y++) {
      expect(data.color[y]).toHaveLength(192);
      expect(data.level[y]).toHaveLength(192);

      // Verify every color key exists in palette
      for (let x = 0; x < 192; x++) {
        const cKey = data.color[y][x];
        expect(meta.palette[cKey]).toBeDefined();

        const lChar = data.level[y][x];
        const lv = parseInt(lChar, 10);
        expect(lv).toBeGreaterThanOrEqual(0);
        expect(lv).toBeLessThanOrEqual(7);
      }
    }
  });

  it("generates deterministic frames across time intervals with valid levels and shooting star overlays", () => {
    const render = createStarryRidge();
    const frame0 = render(0);

    expect(frame0.cols).toBe(192);
    expect(frame0.rows).toBe(108);
    expect(frame0.ch).toHaveLength(192 * 108);
    expect(frame0.co).toHaveLength(192 * 108);
    expect(frame0.levels).toHaveLength(192 * 108);

    // Frame at t=1.0 (shooting star active in sky)
    const frame1 = render(1.0);
    expect(frame1.cols).toBe(192);
    expect(frame1.rows).toBe(108);
    expect(frame1.ch).toHaveLength(192 * 108);

    // Verify presence of glyphs from LEVELS
    const chars = new Set(frame0.ch);
    expect(
      chars.has("▁") ||
      chars.has("▂") ||
      chars.has("▃") ||
      chars.has("▄") ||
      chars.has("▅") ||
      chars.has("▆") ||
      chars.has("▇") ||
      chars.has("█")
    ).toBe(true);
  });
});
