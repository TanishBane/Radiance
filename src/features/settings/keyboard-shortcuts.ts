export interface KeyboardShortcut {
  id: "new-chat" | "history" | "settings-shortcuts";
  label: string;
  keys: string;
  key: string;
  shift: boolean;
  section: "general";
}

export const KEYBOARD_SHORTCUTS: readonly KeyboardShortcut[] = [
  { id: "new-chat", label: "New Chat", keys: "Ctrl / ⌘ + Shift + N", key: "n", shift: true, section: "general" },
  { id: "history", label: "Conversation History", keys: "Ctrl / ⌘ + L", key: "l", shift: false, section: "general" },
  { id: "settings-shortcuts", label: "Keyboard Shortcuts", keys: "Ctrl / ⌘ + K", key: "k", shift: false, section: "general" },
];

export function matchesShortcut(event: KeyboardEvent, id: KeyboardShortcut["id"]): boolean {
  const shortcut = KEYBOARD_SHORTCUTS.find((entry) => entry.id === id);
  if (!shortcut) return false;
  return (
    (event.ctrlKey || event.metaKey) &&
    !event.altKey &&
    event.shiftKey === shortcut.shift &&
    event.key.toLowerCase() === shortcut.key
  );
}
