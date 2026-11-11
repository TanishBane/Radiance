export const motionDurations = {
  feedback: 0.15,
  interaction: 0.2,
  entrance: 0.28,
  drawer: 0.24,
  section: 0.48,
  story: 0.6,
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
