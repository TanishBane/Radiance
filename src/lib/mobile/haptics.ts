/**
 * Radiance Mobile Haptic Feedback Controller
 * Safe navigator.vibrate wrapper with strict reduced-motion adherence.
 */

export type HapticFeedbackType = "selection" | "tap" | "success" | "warning" | "error";

export function safeVibrate(type: HapticFeedbackType | number | number[] = "tap"): boolean {
  if (typeof window === "undefined" || typeof navigator === "undefined") {
    return false;
  }

  // 1. Vestibular / Motion Safety Check (WCAG AA)
  const prefersReduced =
    typeof window.matchMedia === "function" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (prefersReduced) {
    return false;
  }

  if (typeof navigator.vibrate !== "function") {
    return false;
  }

  try {
    let pattern: number | number[];
    if (typeof type === "number" || Array.isArray(type)) {
      pattern = type;
    } else {
      switch (type) {
        case "selection":
          pattern = 4;
          break;
        case "tap":
          pattern = 8;
          break;
        case "success":
          pattern = [10, 40, 12];
          break;
        case "warning":
          pattern = [15, 60, 20];
          break;
        case "error":
          pattern = [25, 50, 25, 50, 30];
          break;
        default:
          pattern = 8;
      }
    }
    return navigator.vibrate(pattern);
  } catch {
    return false;
  }
}
