"use client";

import React, { useState } from "react";
import { TONES } from "@/lib/ai/prompts";
import { COLOR_THEMES, GradientStyle } from "@/lib/types/theme";
import { ToneKey } from "@/lib/types/chat";
import { X, Check, Palette, Sparkles, Sliders, Waves, Orbit, SunMedium } from "lucide-react";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTone: ToneKey;
  onSelectTone: (tone: ToneKey) => void;
  activeTheme: string;
  onSelectTheme: (themeId: string) => void;
  gradientStyle?: GradientStyle;
  onSelectGradientStyle?: (style: GradientStyle) => void;
}

export function SettingsDrawer({
  isOpen,
  onClose,
  activeTone,
  onSelectTone,
  activeTheme,
  onSelectTheme,
  gradientStyle = "bloom",
  onSelectGradientStyle,
}: SettingsDrawerProps) {
  const [tab, setTab] = useState<"tones" | "themes">("themes");

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-96 max-w-[90vw] z-50 flex flex-col bg-[var(--deep)]/95 backdrop-blur-2xl border-l border-[var(--border)] shadow-[-20px_0_50px_rgba(0,0,0,0.6)] animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-serif font-bold text-base text-[var(--txt)]">Personalization</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[var(--border)] px-3 pt-2 gap-2 text-xs font-mono">
          <button
            onClick={() => setTab("themes")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-colors border-b-2 ${
              tab === "themes"
                ? "text-[var(--accent)] border-[var(--accent)] bg-[var(--accent-d)]/40 font-bold"
                : "text-[var(--txt-muted)] border-transparent hover:text-[var(--txt-dim)]"
            }`}
          >
            <Palette className="w-3.5 h-3.5" />
            <span>Atmospheric Themes</span>
          </button>
          <button
            onClick={() => setTab("tones")}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-t-lg transition-colors border-b-2 ${
              tab === "tones"
                ? "text-[var(--accent)] border-[var(--accent)] bg-[var(--accent-d)]/40 font-bold"
                : "text-[var(--txt-muted)] border-transparent hover:text-[var(--txt-dim)]"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Response Tones</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
          {tab === "themes" ? (
            <>
              {/* Background Engine Selector */}
              {onSelectGradientStyle && (
                <div className="flex flex-col gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--txt-muted)]">
                    Background Atmosphere Engine
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => onSelectGradientStyle("bloom")}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all ${
                        gradientStyle === "bloom"
                          ? "bg-[var(--accent-d)] border-[var(--accent)] text-[var(--txt)] shadow-[0_0_15px_var(--accent-d)]"
                          : "bg-[var(--surface)] border-[var(--border)] text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <SunMedium className="w-4 h-4 text-[var(--accent)]" />
                      <span className="text-[11px] font-medium leading-tight">Bloom Mesh</span>
                      <span className="text-[9px] font-mono text-[var(--txt-muted)]">Gradient 1</span>
                    </button>

                    <button
                      onClick={() => onSelectGradientStyle("waves")}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all ${
                        gradientStyle === "waves"
                          ? "bg-[var(--accent-d)] border-[var(--accent)] text-[var(--txt)] shadow-[0_0_15px_var(--accent-d)]"
                          : "bg-[var(--surface)] border-[var(--border)] text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <Waves className="w-4 h-4 text-[var(--accent)]" />
                      <span className="text-[11px] font-medium leading-tight">Ribbon Waves</span>
                      <span className="text-[9px] font-mono text-[var(--txt-muted)]">Gradient 2</span>
                    </button>

                    <button
                      onClick={() => onSelectGradientStyle("cosmic")}
                      className={`flex flex-col items-center gap-1.5 p-2.5 rounded-xl border text-center transition-all ${
                        gradientStyle === "cosmic"
                          ? "bg-[var(--accent-d)] border-[var(--accent)] text-[var(--txt)] shadow-[0_0_15px_var(--accent-d)]"
                          : "bg-[var(--surface)] border-[var(--border)] text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <Orbit className="w-4 h-4 text-[var(--accent)]" />
                      <span className="text-[11px] font-medium leading-tight">Cosmic 3D</span>
                      <span className="text-[9px] font-mono text-[var(--txt-muted)]">WebGL</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="h-[1px] bg-[var(--border)] my-1" />

              {/* Color Themes Grid */}
              <div className="flex flex-col gap-2">
                <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--txt-muted)]">
                  Atmospheric Color Palettes
                </span>
                <p className="text-xs text-[var(--txt-muted)] leading-relaxed">
                  Both 21st.dev gradient formulas and CSS tokens dynamically adapt across all 12 color palettes.
                </p>
                <div className="grid grid-cols-3 gap-2 mt-1">
                  {Object.values(COLOR_THEMES).map((theme) => {
                    const isActive = activeTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => onSelectTheme(theme.id)}
                        className={`flex flex-col items-center gap-2 p-2.5 rounded-xl border text-center transition-all ${
                          isActive
                            ? "bg-[var(--accent-d)] border-[var(--accent)] shadow-[0_0_15px_var(--accent-d)]"
                            : "bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-hover)]"
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md relative flex items-center justify-center"
                          style={{ background: theme.swatchGradient }}
                        >
                          {isActive && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                        </div>
                        <span
                          className={`text-[10px] font-mono tracking-wider truncate max-w-full ${
                            isActive ? "text-[var(--accent)] font-bold" : "text-[var(--txt-muted)]"
                          }`}
                        >
                          {theme.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <>
              <p className="text-xs text-[var(--txt-muted)] leading-relaxed">
                Shape how Radiance reasons and formats replies. Tones persist across sessions.
              </p>
              <div className="flex flex-col gap-2 mt-1">
                {Object.values(TONES).map((t) => {
                  const isActive = activeTone === t.id;
                  return (
                    <button
                      key={t.id}
                      onClick={() => onSelectTone(t.id)}
                      className={`flex items-center justify-between p-3 rounded-xl border text-left transition-all ${
                        isActive
                          ? "bg-[var(--accent-d)] border-[var(--accent)] text-[var(--txt)] shadow-[0_0_15px_var(--accent-d)]"
                          : "bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)] text-[var(--txt-dim)]"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 pr-2">
                        <span className="text-base shrink-0">{t.icon}</span>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold font-sans">{t.label}</span>
                          <span className="text-[10px] text-[var(--txt-muted)] truncate">{t.desc}</span>
                        </div>
                      </div>
                      {isActive && <Check className="w-4 h-4 text-[var(--accent)] shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
