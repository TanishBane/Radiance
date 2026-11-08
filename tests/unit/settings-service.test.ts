import { beforeEach, describe, expect, it } from "vitest";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  resetSettings,
  saveSettings,
  SETTINGS_STORAGE_KEY,
} from "@/features/settings/settings-service";
import {
  STORAGE_KEY_AUTO_THEME,
  STORAGE_KEY_LAST_THEME,
} from "@/lib/theme/dynamic-theme";

describe("Radiance settings persistence", () => {
  beforeEach(() => window.localStorage.clear());

  it("provides validated defaults for a new local session", () => {
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(DEFAULT_SETTINGS).toMatchObject({
      theme: "violet",
      gradientStyle: "waves",
      autoTheme: true,
      tone: "default",
      language: "en",
      modelId: "groq-fast",
      customInstructions: "",
      enterToSend: true,
    });
  });

  it("fills missing versioned settings from defaults and ignores invalid values", () => {
    window.localStorage.setItem(
      SETTINGS_STORAGE_KEY,
      JSON.stringify({ version: 1, settings: { theme: "not-a-theme", language: "hi" } })
    );

    expect(loadSettings()).toEqual({ ...DEFAULT_SETTINGS, language: "hi" });
  });

  it("migrates the selected theme and rotation preference from legacy keys", () => {
    window.localStorage.setItem(STORAGE_KEY_LAST_THEME, "emerald");
    window.localStorage.setItem(STORAGE_KEY_AUTO_THEME, "false");

    expect(loadSettings()).toEqual({
      ...DEFAULT_SETTINGS,
      theme: "emerald",
      autoTheme: false,
    });
    expect(JSON.parse(window.localStorage.getItem(SETTINGS_STORAGE_KEY) || "{}"))
      .toHaveProperty("version", 1);
  });

  it("rejects invalid changes without writing them", () => {
    expect(saveSettings({ ...DEFAULT_SETTINGS, customInstructions: "x".repeat(2001) })).toBe(false);
    expect(window.localStorage.getItem(SETTINGS_STORAGE_KEY)).toBeNull();
  });

  it("resets only settings and keeps conversation data", () => {
    window.localStorage.setItem("radiance_chat_keep", JSON.stringify({ id: "keep" }));
    saveSettings({ ...DEFAULT_SETTINGS, language: "hi", autoTheme: false });

    expect(resetSettings()).toBe(true);
    expect(loadSettings()).toEqual(DEFAULT_SETTINGS);
    expect(window.localStorage.getItem("radiance_chat_keep")).not.toBeNull();
  });

  it("reports a storage write failure instead of claiming a save", () => {
    const failingStorage = {
      getItem: () => null,
      setItem: () => { throw new Error("quota"); },
      removeItem: () => undefined,
      clear: () => undefined,
      key: () => null,
      get length() { return 0; },
    } as unknown as Storage;

    expect(saveSettings(DEFAULT_SETTINGS, failingStorage)).toBe(false);
  });
});
