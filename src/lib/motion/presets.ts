export const motionDurations = {
  feedback: 0.15,
  interaction: 0.2,
  entrance: 0.28,
  drawer: 0.24,
} as const;

export const motionEasing = {
  standard: [0.2, 0.8, 0.2, 1] as [number, number, number, number],
  entrance: [0.16, 1, 0.3, 1] as [number, number, number, number],
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
