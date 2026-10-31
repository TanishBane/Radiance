"use client";

import React from "react";
import { Plus, History, Sliders, Command, User, GraduationCap, Sparkles } from "lucide-react";
import { PersonaMode } from "@/lib/types/chat";

interface SidebarDockProps {
  onNewChat: () => void;
  onToggleHistory: () => void;
  onToggleSettings: () => void;
  onOpenShortcuts: () => void;
  currentMode: PersonaMode;
  onSelectMode: (mode: PersonaMode) => void;
}

export function SidebarDock({
  onNewChat,
  onToggleHistory,
  onToggleSettings,
  onOpenShortcuts,
  currentMode,
  onSelectMode,
}: SidebarDockProps) {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-14 md:w-16 z-40 flex flex-col items-center justify-between py-5 bg-[var(--void)]/70 backdrop-blur-2xl border-r border-[var(--border)]">
      {/* Top Group: Primary Chat Actions */}
      <div className="flex flex-col items-center gap-4 w-full">
        {/* Brand Dot / New Chat */}
        <button
          onClick={onNewChat}
          className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent-b)] to-[var(--accent)] text-[var(--void)] flex items-center justify-center hover:scale-105 transition-transform shadow-[0_0_20px_var(--accent-g)]"
          title="New Chat (Ctrl+Shift+N)"
        >
          <Plus className="w-5 h-5 stroke-[2.5]" />
        </button>

        <div className="w-8 h-[1px] bg-[var(--border)] my-1" />

        {/* History Drawer Toggle */}
        <button
          onClick={onToggleHistory}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-all group"
          title="Chat History (Ctrl+L)"
        >
          <History className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-mono text-[8px] uppercase tracking-wider">Hist</span>
        </button>

        {/* Settings & Themes Toggle */}
        <button
          onClick={onToggleSettings}
          className="flex flex-col items-center gap-1 p-2 rounded-xl text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-all group"
          title="Themes & Response Tones"
        >
          <Sliders className="w-5 h-5 group-hover:scale-110 transition-transform" />
          <span className="font-mono text-[8px] uppercase tracking-wider">Tones</span>
        </button>
      </div>

      {/* Middle Group: Persona Mode Quick-Toggles */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={() => onSelectMode("default")}
          className={`p-2 rounded-xl transition-all ${
            currentMode === "default"
              ? "bg-[var(--accent-d)] text-[var(--accent)] border border-[var(--accent)]/40 shadow-[0_0_12px_var(--accent-d)]"
              : "text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Default Mode"
        >
          <Sparkles className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectMode("portfolio")}
          className={`p-2 rounded-xl transition-all ${
            currentMode === "portfolio"
              ? "bg-[var(--accent-d)] text-[var(--accent)] border border-[var(--accent)]/40 shadow-[0_0_12px_var(--accent-d)]"
              : "text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Portfolio Mode (Tanish Bane profile)"
        >
          <User className="w-4 h-4" />
        </button>

        <button
          onClick={() => onSelectMode("student")}
          className={`p-2 rounded-xl transition-all ${
            currentMode === "student"
              ? "bg-[var(--accent-d)] text-[var(--accent)] border border-[var(--accent)]/40 shadow-[0_0_12px_var(--accent-d)]"
              : "text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)]"
          }`}
          title="Mumbai Student Mode"
        >
          <GraduationCap className="w-4 h-4" />
        </button>
      </div>

      {/* Bottom Group: Shortcuts Cheatsheet */}
      <div className="flex flex-col items-center gap-2">
        <button
          onClick={onOpenShortcuts}
          className="p-2.5 rounded-xl text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-colors"
          title="Keyboard Shortcuts (Ctrl+K)"
        >
          <Command className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );
}
