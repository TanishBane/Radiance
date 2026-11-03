import { describe, expect, it } from "vitest";
import { getMotionTransition, motionDurations } from "@/lib/motion/presets";

describe("motion presets", () => {
  it("uses the shared interaction duration and easing for standard motion", () => {
    expect(getMotionTransition("interaction")).toEqual({
      duration: motionDurations.interaction,
      ease: [0.2, 0.8, 0.2, 1],
    });
  });

  it("removes delay and movement time when reduced motion is requested", () => {
    expect(getMotionTransition("entrance", true)).toEqual({ duration: 0 });
  });
});
