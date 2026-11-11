import { describe, it, expect } from "vitest";
import createMoonlitSea, { meta } from "@/lib/ascii-art/moonlit-sea";

describe("ASCII Art Moonlit Sea Specifications", () => {
  it("exports correct metadata for Moonlit Sea", () => {
    expect(meta.slug).toBe("moonlit-sea");
    expect(meta.name).toBe("Moonlit Sea");
    expect(meta.cols).toBe(96);
    expect(meta.rows).toBe(36);
    expect(meta.fps).toBe(20);
    expect(meta.palette).toHaveLength(25); // 10 sky + 10 sea + 4 moon + 1 star
  });

  it("generates valid frames across multiple time intervals", () => {
    const render = createMoonlitSea();
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

    // Verify subsequent frame at t = 2.5s
    const frameLater = render(2.5);
    expect(frameLater.ch.some((c) => c === "█" || c === "▓")).toBe(true);
    // Verify star characters are rendered
    expect(frameLater.ch.some((c) => c === "*" || c === "·")).toBe(true);
  });
});
