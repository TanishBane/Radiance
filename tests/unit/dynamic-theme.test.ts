import { describe, it, expect, beforeEach, vi } from "vitest";
import { COLOR_THEMES } from "@/lib/types/theme";
import {
  selectNextDynamicTheme,
  getAvailableThemeIds,
  initializeDynamicTheme,
  isAutoThemeEnabled,
  setAutoThemeEnabled,
  persistManualTheme,
  applyThemeToDom,
  STORAGE_KEY_LAST_THEME,
  STORAGE_KEY_RECENT_THEMES,
  STORAGE_KEY_AUTO_THEME,
} from "@/lib/theme/dynamic-theme";

describe("Dynamic Color Theme Changing System", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.restoreAllMocks();
  });

  describe("Theme Pool & Invariants", () => {
    it("provides all 28 registered color themes in candidate pool", () => {
      const available = getAvailableThemeIds();
      expect(available.length).toBe(28);
      expect(available).toContain("violet");
      expect(available).toContain("emerald");
      expect(available).toContain("crimson");
      expect(available).toContain("ocean");
      expect(available).toContain("cyberpunk");
    });
  });

  describe("selectNextDynamicTheme Selection Logic", () => {
    it("never selects the immediate previous theme", () => {
      const themes = getAvailableThemeIds();

      // Test across multiple themes
      for (const lastTheme of themes.slice(0, 10)) {
        for (let i = 0; i < 20; i++) {
          const next = selectNextDynamicTheme(lastTheme);
          expect(next).not.toBe(lastTheme);
          expect(COLOR_THEMES[next]).toBeDefined();
        }
      }
    });

    it("avoids recent themes in the exclusion window when sufficient themes exist", () => {
      const recent = ["violet", "emerald", "crimson", "ocean", "amber"];
      for (let i = 0; i < 30; i++) {
        const next = selectNextDynamicTheme("amber", recent);
        expect(recent).not.toContain(next);
        expect(COLOR_THEMES[next]).toBeDefined();
      }
    });

    it("gracefully falls back when history covers almost all themes", () => {
      const all = getAvailableThemeIds();
      // Exclude all except 2
      const almostAll = all.slice(2);
      const next = selectNextDynamicTheme(all[0], almostAll);
      expect(COLOR_THEMES[next]).toBeDefined();
      expect(next).not.toBe(all[0]);
    });

    it("handles null or undefined lastThemeId safely", () => {
      const next1 = selectNextDynamicTheme(null);
      expect(COLOR_THEMES[next1]).toBeDefined();

      const next2 = selectNextDynamicTheme(undefined);
      expect(COLOR_THEMES[next2]).toBeDefined();
    });
  });

  describe("Storage & Session Initialization", () => {
    it("defaults isAutoThemeEnabled to true when unset", () => {
      expect(isAutoThemeEnabled()).toBe(true);
    });

    it("persists auto-theme preference changes", () => {
      setAutoThemeEnabled(false);
      expect(isAutoThemeEnabled()).toBe(false);
      expect(window.localStorage.getItem(STORAGE_KEY_AUTO_THEME)).toBe("false");

      setAutoThemeEnabled(true);
      expect(isAutoThemeEnabled()).toBe(true);
      expect(window.localStorage.getItem(STORAGE_KEY_AUTO_THEME)).toBe("true");
    });

    it("automatically assigns and records a new theme on site initialization", () => {
      window.localStorage.setItem(STORAGE_KEY_LAST_THEME, "violet");

      const assigned = initializeDynamicTheme();
      expect(assigned).not.toBe("violet");
      expect(COLOR_THEMES[assigned]).toBeDefined();

      // Verifies storage was updated with the new assignment
      expect(window.localStorage.getItem(STORAGE_KEY_LAST_THEME)).toBe(assigned);

      const recent = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY_RECENT_THEMES) || "[]"
      );
      expect(recent[0]).toBe(assigned);
    });

    it("honors pinned manual theme choice if auto-theme rotation is disabled", () => {
      window.localStorage.setItem(STORAGE_KEY_AUTO_THEME, "false");
      window.localStorage.setItem(STORAGE_KEY_LAST_THEME, "cyberpunk");

      const assigned = initializeDynamicTheme();
      expect(assigned).toBe("cyberpunk");
    });

    it("persistManualTheme updates last theme and recent history window", () => {
      persistManualTheme("emerald");
      expect(window.localStorage.getItem(STORAGE_KEY_LAST_THEME)).toBe("emerald");

      const recent = JSON.parse(
        window.localStorage.getItem(STORAGE_KEY_RECENT_THEMES) || "[]"
      );
      expect(recent).toContain("emerald");
    });
  });

  describe("applyThemeToDom CSS Token Injection", () => {
    it("applies complete set of theme CSS variables to document root", () => {
      const theme = COLOR_THEMES.crimson;
      applyThemeToDom(theme);

      const root = document.documentElement;
      expect(root.style.getPropertyValue("--accent")).toBe(theme.accent);
      expect(root.style.getPropertyValue("--accent-b")).toBe(theme.accentB);
      expect(root.style.getPropertyValue("--accent-c")).toBe(theme.accentC);
      expect(root.style.getPropertyValue("--accent-d")).toBe(theme.accentD);
      expect(root.style.getPropertyValue("--accent-g")).toBe(theme.accentG);
      expect(root.style.getPropertyValue("--border-accent")).toBe(theme.accentG);
      expect(root.style.getPropertyValue("--user-bg")).toBe(theme.userBg);
      expect(root.style.getPropertyValue("--user-border")).toBe(theme.userBorder);
      expect(root.style.getPropertyValue("--text-gradient")).toBe(theme.textGradient);
    });

    it("handles themes with and without bgGradient cleanly", () => {
      const violet = COLOR_THEMES.violet;
      applyThemeToDom(violet);
      expect(document.documentElement.style.getPropertyValue("--bg-gradient")).toBe(
        violet.bgGradient
      );

      const voidTheme = COLOR_THEMES.default; // bgGradient is null
      applyThemeToDom(voidTheme);
      expect(document.documentElement.style.getPropertyValue("--bg-gradient")).toBe("");
    });
  });
});
