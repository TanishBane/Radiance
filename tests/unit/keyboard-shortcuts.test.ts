import { describe, expect, it } from "vitest";
import {
  KEYBOARD_SHORTCUTS,
  matchesShortcut,
} from "@/features/settings/keyboard-shortcuts";

function keyboardEvent(
  key: string,
  options: Partial<Pick<KeyboardEvent, "ctrlKey" | "metaKey" | "shiftKey" | "altKey">> = {}
) {
  return { key, ctrlKey: false, metaKey: false, shiftKey: false, altKey: false, ...options } as KeyboardEvent;
}

describe("central keyboard shortcut registry", () => {
  it("matches the registered New Chat shortcut on Windows and macOS", () => {
    expect(matchesShortcut(keyboardEvent("N", { ctrlKey: true, shiftKey: true }), "new-chat")).toBe(true);
    expect(matchesShortcut(keyboardEvent("n", { metaKey: true, shiftKey: true }), "new-chat")).toBe(true);
  });

  it("keeps Ctrl/Cmd+K for opening the shortcut reference in Settings", () => {
    expect(matchesShortcut(keyboardEvent("k", { ctrlKey: true }), "settings-shortcuts")).toBe(true);
    expect(KEYBOARD_SHORTCUTS.find((shortcut) => shortcut.id === "settings-shortcuts"))
      .toMatchObject({ label: "Keyboard Shortcuts", section: "general" });
  });

  it("does not match a shortcut when its modifiers differ", () => {
    expect(matchesShortcut(keyboardEvent("n", { ctrlKey: true }), "new-chat")).toBe(false);
    expect(matchesShortcut(keyboardEvent("k", { ctrlKey: true, altKey: true }), "settings-shortcuts")).toBe(false);
  });

  it("contains one source entry for each global action", () => {
    expect(KEYBOARD_SHORTCUTS.map((shortcut) => shortcut.id)).toEqual([
      "new-chat",
      "history",
      "settings-shortcuts",
    ]);
  });
});
