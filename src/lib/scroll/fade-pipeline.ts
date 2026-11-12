/**
 * Pure geometry and allocation helpers for the fixed landing-page art layers.
 *
 * The visual cross-fade is driven by where each section sits relative to the
 * viewport. Keeping the maths outside the React component makes the behaviour
 * reproducible in unit tests and keeps the scroll handler free of layout reads
 * once the section offsets have been measured.
 */

export const MAX_FULL_RESOLUTION_LAYERS = 2;
export const LAYER_OPACITY_EPSILON = 0.001;

function clamp01(value: number): number {
  return Math.min(1, Math.max(0, value));
}

export function smoothstep(value: number): number {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

/**
 * Progress of a section fade, measured in the same way as the original
 * component: the fade starts when the section top is 92% of a viewport from
 * the top and completes at 22%.
 */
export function sectionProgress(
  sectionTop: number,
  scrollY: number,
  viewportHeight: number
): number {
  const startFade = viewportHeight * 0.92;
  const endFade = viewportHeight * 0.22;
  const rectTop = sectionTop - scrollY;
  return smoothstep((startFade - rectTop) / (startFade - endFade));
}

/**
 * Opacity for the base layer followed by every cross-fade layer.
 *
 * Layer i is visible only while it has faded in and no later layer has taken
 * over. Everything is additionally multiplied by the exit fade used by the
 * final CTA section.
 *
 * @param fades fade value per scene, in document order
 * @param exitFade fade that removes the whole background at the final CTA
 */
export function computeLayerOpacities(fades: number[], exitFade: number): number[] {
  const exit = 1 - clamp01(exitFade);
  const opacities: number[] = new Array(fades.length + 1);

  let remaining = exit;
  for (let i = fades.length - 1; i >= 0; i -= 1) {
    const fade = clamp01(fades[i]);
    opacities[i + 1] = fade * remaining;
    remaining *= 1 - fade;
  }
  opacities[0] = remaining;

  return opacities;
}

/**
 * Decide which layers may keep a full-resolution backing store.
 *
 * All ten canvases stay mounted for tests and semantics, but only the two
 * most opaque layers receive pixels. The measured layout never produces more
 * than two non-zero layers at once; the cap also protects against future
 * section spacing changes.
 */
export function planBackingStores(
  opacities: number[],
  maxFullResolution = MAX_FULL_RESOLUTION_LAYERS,
  epsilon = LAYER_OPACITY_EPSILON
): Set<number> {
  const candidates = opacities
    .map((opacity, index) => ({ index, opacity }))
    .filter((entry) => entry.opacity > epsilon)
    .sort((a, b) => b.opacity - a.opacity)
    .slice(0, Math.max(0, maxFullResolution));

  return new Set(candidates.map((entry) => entry.index));
}
