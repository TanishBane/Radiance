import { COLOR_THEMES } from "@/lib/types/theme";
import { selectNextDynamicTheme } from "@/lib/theme/dynamic-theme";
import {
  STORAGE_KEY_AUTO_THEME,
  STORAGE_KEY_LAST_THEME,
  STORAGE_KEY_RECENT_THEMES,
} from "@/lib/theme/dynamic-theme";
import { RadianceSettingsSchema, settingsFieldSchemas, type RadianceSettings } from "./settings-schema";

export const SETTINGS_STORAGE_KEY = "radiance_settings";
const SETTINGS_VERSION = 1;

export const DEFAULT_SETTINGS: RadianceSettings = {
  theme: "violet",
  gradientStyle: "waves",
  autoTheme: true,
  tone: "default",
  language: "en",
  modelId: "groq-fast",
  customInstructions: "",
  enterToSend: true,
  themeHistory: [],
};

function browserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function mergeValidatedSettings(value: unknown): RadianceSettings {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return DEFAULT_SETTINGS;
  }

  const source = value as Record<string, unknown>;
  const merged: Record<string, unknown> = {};
  for (const [key, fieldSchema] of Object.entries(settingsFieldSchemas)) {
    const candidate = source[key];
    const parsed = candidate === undefined ? null : fieldSchema.safeParse(candidate);
    merged[key] = parsed && parsed.success ? parsed.data : DEFAULT_SETTINGS[key as keyof RadianceSettings];
  }
  return RadianceSettingsSchema.parse(merged);
}

function migrateLegacySettings(storage: Storage): RadianceSettings {
  let theme = DEFAULT_SETTINGS.theme;
  let autoTheme = DEFAULT_SETTINGS.autoTheme;
  let themeHistory = DEFAULT_SETTINGS.themeHistory;
  try {
    const legacyTheme = storage.getItem(STORAGE_KEY_LAST_THEME);
    if (legacyTheme && legacyTheme in COLOR_THEMES) theme = legacyTheme;
    const legacyAutoTheme = storage.getItem(STORAGE_KEY_AUTO_THEME);
    if (legacyAutoTheme === "true" || legacyAutoTheme === "false") {
      autoTheme = legacyAutoTheme === "true";
    }
    const legacyHistory = storage.getItem(STORAGE_KEY_RECENT_THEMES);
    if (legacyHistory) {
      const parsed: unknown = JSON.parse(legacyHistory);
      if (Array.isArray(parsed)) {
        themeHistory = parsed.filter((value): value is string => typeof value === "string" && value in COLOR_THEMES).slice(0, 5);
      }
    }
  } catch {
    // A blocked local store uses the validated defaults for this session.
  }
  return { ...DEFAULT_SETTINGS, theme, autoTheme, themeHistory };
}

export function loadSettings(storage: Storage | null = browserStorage(), rotateTheme = false): RadianceSettings {
  if (!storage) return DEFAULT_SETTINGS;
  try {
    const raw = storage.getItem(SETTINGS_STORAGE_KEY);
    if (raw) {
      const record: unknown = JSON.parse(raw);
      if (typeof record === "object" && record !== null && !Array.isArray(record)) {
        const persisted = record as { version?: unknown; settings?: unknown };
        if (persisted.version === SETTINGS_VERSION) {
          const settings = mergeValidatedSettings(persisted.settings);
          if (rotateTheme && settings.autoTheme) {
            const theme = selectNextDynamicTheme(settings.theme, settings.themeHistory);
            const rotated = { ...settings, theme, themeHistory: [theme, ...settings.themeHistory.filter((id) => id !== theme)].slice(0, 5) };
            saveSettings(rotated, storage);
            return rotated;
          }
          return settings;
        }
      }
      return DEFAULT_SETTINGS;
    }

    let migrated = migrateLegacySettings(storage);
    if (rotateTheme && migrated.autoTheme) {
      const theme = selectNextDynamicTheme(migrated.theme, migrated.themeHistory);
      migrated = { ...migrated, theme, themeHistory: [theme, ...migrated.themeHistory.filter((id) => id !== theme)].slice(0, 5) };
    }
    saveSettings(migrated, storage);
    return migrated;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(
  settings: unknown,
  storage: Storage | null = browserStorage()
): boolean {
  if (!storage) return false;
  const parsed = RadianceSettingsSchema.safeParse(settings);
  if (!parsed.success) return false;
  try {
    storage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify({ version: SETTINGS_VERSION, settings: parsed.data }));
    return true;
  } catch {
    return false;
  }
}

export function resetSettings(storage: Storage | null = browserStorage()): boolean {
  if (!saveSettings(DEFAULT_SETTINGS, storage) || !storage) return false;
  try {
    storage.removeItem(STORAGE_KEY_LAST_THEME);
    storage.removeItem(STORAGE_KEY_AUTO_THEME);
    storage.removeItem(STORAGE_KEY_RECENT_THEMES);
  } catch {
    return false;
  }
  return true;
}
