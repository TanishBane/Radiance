"use client";

import React from "react";
import { X, Command } from "lucide-react";

interface ShortcutsDialogProps {
  isOpen: boolean;
  onClose: () => void;
}

const SHORTCUTS = [
  { key: "Enter", desc: "Send message" },
  { key: "Shift + Enter", desc: "Create new line" },
  { key: "Ctrl + K", desc: "Toggle shortcuts dialog" },
  { key: "Ctrl + Shift + N", desc: "Start new conversation" },
  { key: "Ctrl + L", desc: "Toggle conversation history" },
  { key: "Escape", desc: "Close open dialog or drawer" },
];

export function ShortcutsDialog({ isOpen, onClose }: ShortcutsDialogProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-96 max-w-[90vw] z-50 rounded-2xl bg-[var(--deep)]/95 backdrop-blur-2xl border border-[var(--border)] shadow-[0_20px_60px_rgba(0,0,0,0.8)] p-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Command className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-serif font-bold text-base text-[var(--txt)]">Keyboard Shortcuts</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--txt-muted)] hover:text-[var(--txt)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="flex flex-col gap-2.5">
          {SHORTCUTS.map((s) => (
            <div key={s.key} className="flex items-center justify-between text-xs py-1 border-b border-white/[0.03] last:border-0">
              <span className="text-[var(--txt-dim)]">{s.desc}</span>
              <kbd className="px-2 py-1 rounded bg-[var(--surface)] border border-[var(--border)] font-mono text-[10px] text-[var(--accent)] shadow-sm">
                {s.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
