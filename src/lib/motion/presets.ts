export const motionDurations = {
  feedback: 0.15,
  interaction: 0.2,
  entrance: 0.28,
  drawer: 0.24,
  section: 0.48,
  story: 0.6,
} as const;

export const mobileMotionDurations = {
  tap: 0.1,
  feedback: 0.12,
  drawer: 0.22,
  sheet: 0.25,
} as const;

export const motionEasing = {
  standard: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
  entrance: [0.16, 1, 0.3, 1] as [number, number, number, number],
} as const;

export const motionDistances = {
  subtle: 8,
  component: 16,
  section: 24,
} as const;

export const motionSprings = {
  feedback: { type: "spring", stiffness: 420, damping: 32, mass: 0.7 },
  panel: { type: "spring", stiffness: 320, damping: 30, mass: 0.85 },
  snappy: { type: "spring", stiffness: 450, damping: 25 },
  gentle: { type: "spring", stiffness: 280, damping: 30 },
  bouncy: { type: "spring", stiffness: 400, damping: 20 },
  touch: { type: "spring", stiffness: 500, damping: 30, mass: 0.6 },
  swipe: { type: "spring", stiffness: 400, damping: 35, mass: 0.8 },
} as const;

/**
 * Frame-rate independent exponential decay / damping helper.
 * Computes: current + (target - current) * (1 - Math.exp(-lambda * dt))
 * Invariant across 30Hz, 60Hz, 90Hz, 120Hz, 144Hz displays.
 *
 * @param current Current value
 * @param target Target value
 * @param lambda Decay rate in 1/seconds (e.g. 3.71 ≈ 0.06 at 60Hz, 6.32 ≈ 0.10 at 60Hz)
 * @param dt Delta time in seconds since previous frame
 */
export function damp(current: number, target: number, lambda: number, dt: number): number {
  const safeDt = Math.max(0, Math.min(dt, 0.1));
  return current + (target - current) * (1 - Math.exp(-lambda * safeDt));
}

/**
 * Calibrated decay constants mapping legacy 60Hz multipliers to frame-rate independent lambdas:
 * lambda = -60 * ln(1 - alpha_60)
 */
export const dampLambdas = {
  pointer: 2.45,    // matches alpha 0.04 at 60Hz
  smooth: 3.71,     // matches alpha 0.06 at 60Hz
  responsive: 6.32, // matches alpha 0.10 at 60Hz
  snappy: 7.67,     // matches alpha 0.12 at 60Hz
} as const;

export type MotionPreset = keyof typeof motionDurations;

export function getMotionTransition(
  preset: MotionPreset,
  prefersReducedMotion = false
) {
  if (prefersReducedMotion) return { duration: 0 } as const;

  return {
    duration: motionDurations[preset],
    ease: preset === "entrance" ? motionEasing.entrance : motionEasing.standard,
  };
}

/**
 * Shared reveal states for content that must remain readable before Motion hydrates.
 * Components opt into these states instead of hand-authoring divergent distances.
 */
export function getRevealMotion(
  prefersReducedMotion = false,
  distance: keyof typeof motionDistances = "section"
) {
  if (prefersReducedMotion) {
    return {
      initial: false,
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0 },
    } as const;
  }

  return {
    initial: { opacity: 0, y: motionDistances[distance] },
    animate: { opacity: 1, y: 0 },
    transition: getMotionTransition(distance === "section" ? "section" : "entrance"),
  } as const;
}
