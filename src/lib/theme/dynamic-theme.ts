/**
 * RADIANCE Dynamic Color Theme System
 *
 * Automatically assigns a fresh, harmonious atmospheric color theme from
 * the 28 curated palettes on every site visit.
 *
 * Invariants:
 * - Never repeats the immediate previous theme consecutively.
 * - Rotates through historical avoidance window (last 5 themes) for maximum chromatic novelty.
 * - Completely SSR-safe with zero hydration mismatch.
 * - Instantly applies all CSS tokens (--accent, --accent-b, --accent-c, --accent-d, --accent-g,
 *   --border-accent, --user-bg, --user-border, --text-gradient, --bg-gradient) to document root.
 * - Allows users to manually override or shuffle themes anytime via Settings.
 */

import { COLOR_THEMES, ColorTheme, ThemeId } from "@/lib/types/theme";

export const STORAGE_KEY_LAST_THEME = "radiance_last_theme";
export const STORAGE_KEY_RECENT_THEMES = "radiance_recent_themes";
export const STORAGE_KEY_AUTO_THEME = "radiance_auto_theme_enabled";

const MAX_HISTORY_LENGTH = 5;
const DEFAULT_FALLBACK_THEME: ThemeId = "violet";

/**
 * Returns all valid theme IDs registered in COLOR_THEMES.
 */
export function getAvailableThemeIds(): ThemeId[] {
  return Object.keys(COLOR_THEMES);
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
    ...recentHistory.filter((id) => Boolean(id && COLOR_THEMES[id])),
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
export function applyThemeToDom(theme: ColorTheme, gradientStyle?: string): void {
  if (typeof document === "undefined" || !theme) return;
  const root = document.documentElement;

  // 1. Solid Plain White Mode: Complete Black Text & Crisp Minimalist Tokens
  if (gradientStyle === "plain-white") {
    root.style.setProperty("--void", "#ffffff");
    root.style.setProperty("--deep", "#fafafa");
    root.style.setProperty("--surface", "#ffffff");
    root.style.setProperty("--surface-hover", "#f4f4f5");
    root.style.setProperty("--surface-raised", "#ffffff");
    root.style.setProperty("--surface-overlay", "rgba(255, 255, 255, 0.98)");
    root.style.setProperty("--border", "#e4e4e7");
    root.style.setProperty("--border-hover", "#d4d4d8");
    root.style.setProperty("--border-accent", "#000000");

    root.style.setProperty("--txt", "#000000");
    root.style.setProperty("--txt-dim", "#000000");
    root.style.setProperty("--txt-muted", "#3f3f46");

    root.style.setProperty("--accent", "#000000");
    root.style.setProperty("--accent-b", "#000000");
    root.style.setProperty("--accent-c", "#000000");
    root.style.setProperty("--accent-d", "rgba(0, 0, 0, 0.08)");
    root.style.setProperty("--accent-g", "rgba(0, 0, 0, 0.15)");
    root.style.setProperty("--text-gradient", "#000000");

    root.style.setProperty("--user-bg", "#f4f4f5");
    root.style.setProperty("--user-border", "#e4e4e7");
    root.style.setProperty("--ai-bg", "#ffffff");
    root.style.setProperty("--ai-border", "#e4e4e7");
    root.style.removeProperty("--bg-gradient");
    return;
  }

  // 2. Solid Plain Black Mode: Complete White Text & Crisp High-Contrast Tokens
  if (gradientStyle === "plain-black") {
    root.style.setProperty("--void", "#000000");
    root.style.setProperty("--deep", "#050505");
    root.style.setProperty("--surface", "#0a0a0a");
    root.style.setProperty("--surface-hover", "#171717");
    root.style.setProperty("--surface-raised", "#0d0d0f");
    root.style.setProperty("--surface-overlay", "rgba(0, 0, 0, 0.96)");
    root.style.setProperty("--border", "#262626");
    root.style.setProperty("--border-hover", "#404040");
    root.style.setProperty("--border-accent", "#ffffff");

    root.style.setProperty("--txt", "#ffffff");
    root.style.setProperty("--txt-dim", "#ffffff");
    root.style.setProperty("--txt-muted", "#d4d4d8");

    root.style.setProperty("--accent", "#ffffff");
    root.style.setProperty("--accent-b", "#ffffff");
    root.style.setProperty("--accent-c", "#ffffff");
    root.style.setProperty("--accent-d", "rgba(255, 255, 255, 0.12)");
    root.style.setProperty("--accent-g", "rgba(255, 255, 255, 0.20)");
    root.style.setProperty("--text-gradient", "#ffffff");

    root.style.setProperty("--user-bg", "#121214");
    root.style.setProperty("--user-border", "#262626");
    root.style.setProperty("--ai-bg", "#050505");
    root.style.setProperty("--ai-border", "#1f1f23");
    root.style.removeProperty("--bg-gradient");
    return;
  }

  // 3. Dynamic Atmospheric Engines: Rich Accent Tokens
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
