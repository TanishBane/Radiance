import { describe, it, expect } from "vitest";
import {
  computeLayerOpacities,
  planBackingStores,
  sectionProgress,
  smoothstep,
  MAX_FULL_RESOLUTION_LAYERS,
} from "@/lib/scroll/fade-pipeline";

describe("landing fade pipeline", () => {
  it("clamps and smooths progress", () => {
    expect(smoothstep(-1)).toBe(0);
    expect(smoothstep(0)).toBe(0);
    expect(smoothstep(0.5)).toBe(0.5);
    expect(smoothstep(1)).toBe(1);
    expect(smoothstep(2)).toBe(1);
  });

  it("starts a section fade at 92% of the viewport and finishes at 22%", () => {
    const viewport = 900;
    expect(sectionProgress(viewport * 0.92, 0, viewport)).toBe(0);
    expect(sectionProgress(viewport * 0.22, 0, viewport)).toBe(1);
    expect(sectionProgress(viewport, 0, viewport)).toBe(0);
    expect(sectionProgress(0, viewport, viewport)).toBe(1);
  });

  it("keeps the layer opacities normalised to the exit fade", () => {
    const opacities = computeLayerOpacities([0, 0, 0], 0);
    expect(opacities).toEqual([1, 0, 0, 0]);
    const total = opacities.reduce((sum, value) => sum + value, 0);
    expect(total).toBeCloseTo(1, 6);
  });

  it("shows at most two visible layers for the measured section spacing", () => {
    // Section offsets taken from the production layout at 1440x900.
    const sectionSpacing = 1030;
    const sectionTops = Array.from({ length: 9 }, (_, index) => 1734 + index * sectionSpacing);
    const exitTop = 1734 + 9 * sectionSpacing;
    const viewport = 900;
    const maxScroll = exitTop + 1120 - viewport;

    let maxFullResolution = 0;
    let maxVisible = 0;

    for (let scrollY = 0; scrollY <= maxScroll; scrollY += 16) {
      const fades = sectionTops.map((top) => sectionProgress(top, scrollY, viewport));
      const exitFade = sectionProgress(exitTop, scrollY, viewport);
      const opacities = computeLayerOpacities(fades, exitFade);
      const allocation = planBackingStores(opacities);
      const visible = opacities.filter((value) => value > 0.001).length;

      maxFullResolution = Math.max(maxFullResolution, allocation.size);
      maxVisible = Math.max(maxVisible, visible);
    }

    expect(maxVisible).toBeLessThanOrEqual(2);
    expect(maxFullResolution).toBeLessThanOrEqual(MAX_FULL_RESOLUTION_LAYERS);
  });

  it("always caps backing stores even if a third layer is visible", () => {
    const allocation = planBackingStores([0.4, 0.3, 0.2, 0.1], 2);
    expect(allocation.size).toBe(2);
    expect(allocation).toEqual(new Set([0, 1]));
  });

  it("releases layers that are fully transparent", () => {
    expect(planBackingStores([0, 0.0001, 0]).size).toBe(0);
    expect(planBackingStores([0, 0.5, 0.5])).toEqual(new Set([1, 2]));
  });
});
