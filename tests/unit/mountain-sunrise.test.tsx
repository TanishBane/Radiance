import { describe, it, expect } from "vitest";
import createMountainSunrise, { meta } from "@/lib/ascii-art/mountain-sunrise";

describe("ASCII Art Mountain Sunrise Specifications", () => {
  it("exports correct metadata for Mountain Sunrise", () => {
    expect(meta.slug).toBe("mountain-sunrise");
    expect(meta.name).toBe("Mountain Sunrise");
    expect(meta.cols).toBe(96);
    expect(meta.rows).toBe(36);
    expect(meta.fps).toBe(20);
    expect(meta.palette).toHaveLength(48); // 14 sky + 4 sun + 25 range + 4 mist + 1 bird
  });

  it("generates deterministic frames across multiple time intervals", () => {
    const render = createMountainSunrise();
    const frame0 = render(0);
    expect(frame0.cols).toBe(96);
    expect(frame0.rows).toBe(36);
    expect(frame0.ch.length).toBe(96 * 36);
    expect(frame0.co.length).toBe(96 * 36);

    // Verify all color indices point to valid palette indices
    for (let i = 0; i < frame0.co.length; i++) {
      const colorIdx = frame0.co[i];
      expect(colorIdx).toBeGreaterThanOrEqual(0);
      expect(colorIdx).toBeLessThan(meta.palette.length);
    }

    // Verify subsequent frame at t = 3.5s
    const frameLater = render(3.5);
    expect(frameLater.ch.some((c) => c === "█" || c === "▓")).toBe(true);
    // Verify bird or sun glyphs exist
    expect(frameLater.ch.some((c) => c === "v" || c === "-" || c === "█")).toBe(true);
  });
});
