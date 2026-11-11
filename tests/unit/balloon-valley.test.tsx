import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import createBalloonValley, { meta, W, H, LEVELS } from "@/lib/ascii-art/balloon-valley-sunrise";
import { ArcticIcebergsBackground } from "@/components/background/arctic-icebergs-background";

describe("Balloon Valley Sunrise Engine & Dual-Atmosphere Background", () => {
  it("defines 192x108 resolution and 15 FPS metadata", () => {
    expect(meta.slug).toBe("balloon-valley-sunrise");
    expect(meta.cols).toBe(192);
    expect(meta.rows).toBe(108);
    expect(meta.fps).toBe(15);
    expect(W).toBe(192);
    expect(H).toBe(108);
    expect(LEVELS).toBe("▁▂▃▄▅▆▇█");
  });

  it("initializes static valleys, sun, mist, and hot air balloons and generates valid frames", () => {
    const render = createBalloonValley();
    const frame = render(0);

    expect(frame.cols).toBe(192);
    expect(frame.rows).toBe(108);
    expect(frame.outRgb).toBeDefined();
    expect(frame.outRgb.length).toBe(192 * 108 * 3);
    expect(frame.levels.length).toBe(192 * 108);
    expect(frame.colorIndices.length).toBe(192 * 108);

    const lines = frame.text.split("\n");
    expect(lines).toHaveLength(108);
    expect(lines[0].length).toBe(192);

    // Verify non-empty characters from LEVELS exist
    let hasLevelGlyphs = false;
    for (let i = 0; i < LEVELS.length; i++) {
      if (frame.text.includes(LEVELS[i])) {
        hasLevelGlyphs = true;
        break;
      }
    }
    expect(hasLevelGlyphs).toBe(true);
  });

  it("renders ArcticIcebergsBackground with multi-canvas structure server-side", () => {
    const markup = renderToStaticMarkup(<ArcticIcebergsBackground />);
    // Expect container div with fixed positioning
    expect(markup).toContain("position:fixed");
    expect(markup).toContain("background-color:#02050c");
    // Expect 5 canvas elements (Icebergs, Balloon Valley, Moonlit Sea, Mountain Sunrise, City Skyline Night)
    const canvasMatches = markup.match(/<canvas/g);
    expect(canvasMatches).not.toBeNull();
    expect(canvasMatches?.length).toBe(5);
  });
});
