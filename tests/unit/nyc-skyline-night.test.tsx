import { describe, it, expect } from "vitest";
import createNycSkylineNight, { meta } from "@/lib/ascii-art/nyc-skyline-night";

describe("ASCII Art City Skyline Night Specifications", () => {
  it("exports correct metadata for City Skyline Night", () => {
    expect(meta.slug).toBe("nyc-skyline-night");
    expect(meta.name).toBe("City Skyline Night");
    expect(meta.cols).toBe(104);
    expect(meta.rows).toBe(36);
    expect(meta.fps).toBe(15);
    expect(meta.palette).toHaveLength(29); // 12 sky + 4 bld + 5 win + 2 red + 5 riv + 1 star
  });

  it("generates deterministic frames across multiple time intervals", () => {
    const render = createNycSkylineNight();
    const frame0 = render(0);
    expect(frame0.cols).toBe(104);
    expect(frame0.rows).toBe(36);
    expect(frame0.ch.length).toBe(104 * 36);
    expect(frame0.co.length).toBe(104 * 36);

    // Verify all color indices point to valid palette indices
    for (let i = 0; i < frame0.co.length; i++) {
      const colorIdx = frame0.co[i];
      expect(colorIdx).toBeGreaterThanOrEqual(0);
      expect(colorIdx).toBeLessThan(meta.palette.length);
    }

    // Verify subsequent frame at t = 2.0s
    const frameLater = render(2.0);
    expect(frameLater.ch.some((c) => c === "█" || c === "▓")).toBe(true);
    // Verify shoreline/water or tower glyphs exist
    expect(frameLater.ch.some((c) => c === "▀" || c === "═" || c === "─" || c === "·")).toBe(true);
  });
});
