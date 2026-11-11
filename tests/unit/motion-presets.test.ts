import { describe, expect, it } from "vitest";
import { 
  getMotionTransition, 
  motionDurations, 
  motionEasing, 
  motionDistances, 
  motionSprings, 
  getRevealMotion 
} from "@/lib/motion/presets";

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

  it("provides calibrated physical spring parameters for feedback and panel motion", () => {
    expect(motionSprings.feedback).toEqual({
      type: "spring",
      stiffness: 420,
      damping: 32,
      mass: 0.7,
    });
    expect(motionSprings.panel).toEqual({
      type: "spring",
      stiffness: 320,
      damping: 30,
      mass: 0.85,
    });
  });

  it("returns immediate zero-duration reveal when prefersReducedMotion is true", () => {
    const reducedReveal = getRevealMotion(true, "section");
    expect(reducedReveal.initial).toBe(false);
    expect(reducedReveal.animate).toEqual({ opacity: 1, y: 0 });
    expect(reducedReveal.transition).toEqual({ duration: 0 });
  });

  it("returns calibrated spatial offset and duration when prefersReducedMotion is false", () => {
    const normalReveal = getRevealMotion(false, "section");
    expect(normalReveal.initial).toEqual({ opacity: 0, y: motionDistances.section });
    expect(normalReveal.animate).toEqual({ opacity: 1, y: 0 });
    expect(normalReveal.transition).toEqual({
      duration: motionDurations.section,
      ease: motionEasing.standard,
    });

    const componentReveal = getRevealMotion(false, "component");
    expect(componentReveal.initial).toEqual({ opacity: 0, y: motionDistances.component });
    expect(componentReveal.animate).toEqual({ opacity: 1, y: 0 });
    expect(componentReveal.transition).toEqual({
      duration: motionDurations.entrance,
      ease: motionEasing.entrance,
    });
  });
});
