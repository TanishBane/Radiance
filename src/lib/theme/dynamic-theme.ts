/**
 * RADIANCE Dynamic Color Theme System
 *
 * Automatically assigns a fresh, harmonious atmospheric color theme from
 * the curated palettes on every site visit.
 *
 * Invariants:
 * - Never repeats the immediate previous theme consecutively.
 * - Rotates through historical avoidance window (last 5 themes) for maximum chromatic novelty.
 * - Completely SSR-safe with zero hydration mismatch.
 * - Instantly applies all CSS tokens (--accent, --accent-b, --accent-c, --accent-d, --accent-g,
 *   --border-accent, --user-bg, --user-border, --text-gradient, --bg-gradient) to document root.
 * - Allows users to manually override or shuffle themes anytime via Settings.
 */

import { COLOR_THEMES, CURATED_COLOR_THEME_IDS, ColorTheme, ThemeId } from "@/lib/types/theme";

export const STORAGE_KEY_LAST_THEME = "radiance_last_theme";
export const STORAGE_KEY_RECENT_THEMES = "radiance_recent_themes";
export const STORAGE_KEY_AUTO_THEME = "radiance_auto_theme_enabled";

const MAX_HISTORY_LENGTH = 5;
const DEFAULT_FALLBACK_THEME: ThemeId = "violet";

/**
 * Returns user-facing theme IDs, excluding redundant legacy palettes.
 */
export function getAvailableThemeIds(): ThemeId[] {
  return CURATED_COLOR_THEME_IDS;
}

/**
 * Selects the next dynamic theme guaranteeing non-repetition.
 *
 * @param lastThemeId The theme ID from the previous visit/session
 * @param recentHistory List of recently visited theme IDs to avoid
 * @param randomFn Optional custom random generator (defaults to Math.random for testability)
 */
export function selectNextDynamicTheme(
  lastThemeId?: string | null,
  recentHistory: string[] = [],
  randomFn: () => number = Math.random
): ThemeId {
  const allThemes = getAvailableThemeIds();
  if (allThemes.length === 0) return DEFAULT_FALLBACK_THEME;
  if (allThemes.length === 1) return allThemes[0];

  // First filter: Exclude all recent themes if enough options remain
  const historySet = new Set([
    ...(lastThemeId ? [lastThemeId] : []),
    ...recentHistory.filter((id) => Boolean(id && CURATED_COLOR_THEME_IDS.includes(id))),
  ]);

  let candidates = allThemes.filter((id) => !historySet.has(id));

  // If history exclusion leaves fewer than 3 candidates, relax to only excluding the lastThemeId
  if (candidates.length < 3) {
    candidates = allThemes.filter((id) => id !== lastThemeId);
  }

  // Safety fallback: if somehow still empty, use all themes
  if (candidates.length === 0) {
    candidates = allThemes;
  }

  const selectedIndex = Math.floor(randomFn() * candidates.length);
  return candidates[selectedIndex] || DEFAULT_FALLBACK_THEME;
}

/**
 * Reads the recent theme history array from localStorage safely.
 */
export function getStoredRecentThemes(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY_RECENT_THEMES);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/**
 * Checks whether automatic dynamic theme rotation on visit is enabled (defaults to true).
 */
export function isAutoThemeEnabled(): boolean {
  if (typeof window === "undefined") return true;
  try {
    const val = window.localStorage.getItem(STORAGE_KEY_AUTO_THEME);
    return val !== "false";
  } catch {
    return true;
  }
}

/**
 * Sets user preference for automatic theme assignment on visit.
 */
export function setAutoThemeEnabled(enabled: boolean): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY_AUTO_THEME, String(enabled));
  } catch {
    // Graceful storage failure fallback
  }
}

/**
 * Called when the client mounts to automatically assign and persist a fresh theme.
 * If auto-theme is disabled by the user, returns the saved manual theme.
 */
export function initializeDynamicTheme(): ThemeId {
  if (typeof window === "undefined") return DEFAULT_FALLBACK_THEME;

  try {
    const autoEnabled = isAutoThemeEnabled();
    const lastTheme = window.localStorage.getItem(STORAGE_KEY_LAST_THEME);

    // If user explicitly disabled auto-assignment, honor their pinned choice
    if (!autoEnabled && lastTheme && COLOR_THEMES[lastTheme]) {
      return lastTheme;
    }

    const recent = getStoredRecentThemes();
    const nextTheme = selectNextDynamicTheme(lastTheme, recent);

    // Update localStorage with new theme and updated recent window
    window.localStorage.setItem(STORAGE_KEY_LAST_THEME, nextTheme);

    const updatedHistory = [nextTheme, ...recent.filter((id) => id !== nextTheme)].slice(
      0,
      MAX_HISTORY_LENGTH
    );
    window.localStorage.setItem(
      STORAGE_KEY_RECENT_THEMES,
      JSON.stringify(updatedHistory)
    );

    return nextTheme;
  } catch (err) {
    console.warn("[Radiance] Failed to initialize dynamic theme:", err);
    return DEFAULT_FALLBACK_THEME;
  }
}

/**
 * Persists a user's manual theme selection from Settings.
 */
export function persistManualTheme(themeId: ThemeId): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY_LAST_THEME, themeId);
    const recent = getStoredRecentThemes();
    const updatedHistory = [themeId, ...recent.filter((id) => id !== themeId)].slice(
      0,
      MAX_HISTORY_LENGTH
    );
    window.localStorage.setItem(
      STORAGE_KEY_RECENT_THEMES,
      JSON.stringify(updatedHistory)
    );
  } catch {
    // Graceful storage failure fallback
  }
}

/**
 * Applies all CSS variables associated with a ColorTheme to the document root element.
 */
export function applyThemeToDom(theme: ColorTheme): void {
  if (typeof document === "undefined" || !theme) return;
  const root = document.documentElement;

  root.style.setProperty("--accent", theme.accent);
  root.style.setProperty("--accent-b", theme.accentB);
  root.style.setProperty("--accent-c", theme.accentC);
  root.style.setProperty("--accent-d", theme.accentD);
  root.style.setProperty("--accent-g", theme.accentG);
  root.style.setProperty("--border-accent", theme.accentG);
  root.style.setProperty("--user-bg", theme.userBg);
  root.style.setProperty("--user-border", theme.userBorder);
  root.style.setProperty("--text-gradient", theme.textGradient);

  if (theme.bgGradient) {
    root.style.setProperty("--bg-gradient", theme.bgGradient);
  } else {
    root.style.removeProperty("--bg-gradient");
  }
}
