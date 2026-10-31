"use client";

import React, { useState } from "react";
import { RadianceLogo } from "@/components/branding/logo";
import { AVAILABLE_MODELS } from "@/lib/ai/models";
import { ModelOption, PersonaMode } from "@/lib/types/chat";
import { ChevronDown, Trash2, Cpu, Globe2 } from "lucide-react";

interface TopbarProps {
  selectedModel: ModelOption;
  onSelectModel: (model: ModelOption) => void;
  mode: PersonaMode;
  onClearMode: () => void;
  language: "en" | "hi";
  onToggleLanguage: (lang: "en" | "hi") => void;
  onClearChat: () => void;
  onNewChat: () => void;
}

export function Topbar({
  selectedModel,
  onSelectModel,
  mode,
  onClearMode,
  language,
  onToggleLanguage,
  onClearChat,
  onNewChat,
}: TopbarProps) {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);

  return (
    <header className="relative z-30 flex items-center justify-between px-4 py-2.5 bg-[var(--void)]/80 backdrop-blur-xl border-b border-[var(--border)] select-none">
      {/* Left: Brand Logo & Mode Badge */}
      <div className="flex items-center gap-3">
        <RadianceLogo size="sm" onClick={onNewChat} />
        <span className="hidden sm:inline-block font-mono text-[9px] uppercase tracking-widest px-2 py-0.5 rounded-full border border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent-d)]">
          v1.0
        </span>

        {/* Active Mode Pill */}
        {mode !== "default" && (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono tracking-wider text-[var(--accent-b)] bg-[var(--accent-d)] border border-[var(--accent)]/30 animate-in fade-in duration-200">
            <span>
              {mode === "portfolio"
                ? "Portfolio Mode"
                : mode === "student"
                ? "Mumbai Student Mode"
                : "Active Mode"}
            </span>
            <button
              type="button"
              onClick={onClearMode}
              className="text-[var(--txt-muted)] hover:text-[var(--danger)] ml-0.5 p-0.5"
              title="Exit persona mode"
              aria-label="Exit persona mode"
            >
              ✕
            </button>
          </div>
        )}
      </div>

      {/* Right: Model Switcher, Language Toggle, Status & Clear */}
      <div className="flex items-center gap-2">
        {/* Model Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            aria-expanded={modelDropdownOpen}
            aria-haspopup="listbox"
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-hover)] text-xs font-mono text-[var(--txt-dim)] hover:text-[var(--txt)] transition-all touch-target"
          >
            <Cpu className="w-3.5 h-3.5 text-[var(--accent)]" />
            <span className="font-medium">{selectedModel.name}</span>
            <ChevronDown
              className={`w-3 h-3 text-[var(--txt-muted)] transition-transform duration-200 ${
                modelDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {modelDropdownOpen && (
            <>
              <div
                className="fixed inset-0 z-40"
                onClick={() => setModelDropdownOpen(false)}
              />
              <div className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-[var(--deep)]/95 backdrop-blur-2xl border border-[var(--border)] shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-2 z-50 flex flex-col gap-1 animate-in fade-in zoom-in-95 duration-150 glass-panel-raised">
                <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest text-[var(--txt-muted)] border-b border-[var(--border)] flex items-center justify-between">
                  <span>Frontier Inference Models</span>
                  <span className="text-[8px] text-[var(--accent)]">Multi-Provider</span>
                </div>
                <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto pt-1">
                  {AVAILABLE_MODELS.map((m) => {
                    const isSelected = m.id === selectedModel.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onSelectModel(m);
                          setModelDropdownOpen(false);
                        }}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                          isSelected
                            ? "bg-[var(--accent-d)] border border-[var(--accent)]/40 text-[var(--txt)] shadow-[0_0_15px_var(--accent-d)]"
                            : "hover:bg-[var(--surface-hover)] text-[var(--txt-dim)] border border-transparent"
                        }`}
                      >
                        <span className="text-base mt-0.5 shrink-0">{m.icon}</span>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold font-mono">{m.name}</span>
                            {isSelected && (
                              <span className="text-[10px] text-[var(--accent)] font-bold">✓</span>
                            )}
                          </div>
                          <span className="text-[10px] text-[var(--txt-muted)] truncate">{m.sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          )}
        </div>

        {/* Language Switcher */}
        <div className="flex rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] text-[10px] font-mono p-0.5">
          <button
            type="button"
            onClick={() => onToggleLanguage("en")}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              language === "en"
                ? "bg-[var(--accent-d)] text-[var(--accent-b)] font-bold shadow-sm"
                : "text-[var(--txt-muted)] hover:text-[var(--txt)]"
            }`}
          >
            EN
          </button>
          <button
            type="button"
            onClick={() => onToggleLanguage("hi")}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
              language === "hi"
                ? "bg-[var(--accent-d)] text-[var(--accent-b)] font-bold shadow-sm"
                : "text-[var(--txt-muted)] hover:text-[var(--txt)]"
            }`}
          >
            HI
          </button>
        </div>

        {/* Clear Chat Button */}
        <button
          type="button"
          onClick={onClearChat}
          className="p-2 rounded-xl border border-[var(--border)] text-[var(--txt-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 hover:border-[var(--danger)]/30 transition-colors touch-target"
          title="Clear active conversation"
          aria-label="Clear active conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
