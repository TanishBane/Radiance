"use client";

import React, { useState, useMemo } from "react";
import { COLOR_THEMES, ATMOSPHERE_ENGINES, GradientStyle } from "@/lib/types/theme";
import { ToneKey } from "@/lib/types/chat";
import {
  X,
  Check,
  Sparkles,
  Sliders,
  SunMedium,
  Waves,
  Orbit,
  Wind,
  Zap,
  Grid3X3,
  Share2,
  Flame,
  Terminal,
  Radio,
  Disc,
  Eye,
} from "lucide-react";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTone?: ToneKey;
  onSelectTone?: (tone: ToneKey) => void;
  activeTheme: string;
  onSelectTheme: (themeId: string) => void;
  gradientStyle?: GradientStyle;
  onSelectGradientStyle?: (style: GradientStyle) => void;
}

const ENGINE_ICONS: Record<string, React.ReactNode> = {
  SunMedium: <SunMedium className="w-4 h-4 text-[var(--accent)]" />,
  Waves: <Waves className="w-4 h-4 text-[var(--accent)]" />,
  Orbit: <Orbit className="w-4 h-4 text-[var(--accent)]" />,
  Wind: <Wind className="w-4 h-4 text-[var(--accent)]" />,
  Zap: <Zap className="w-4 h-4 text-[var(--accent)]" />,
  Grid3X3: <Grid3X3 className="w-4 h-4 text-[var(--accent)]" />,
  Share2: <Share2 className="w-4 h-4 text-[var(--accent)]" />,
  Flame: <Flame className="w-4 h-4 text-[var(--accent)]" />,
  Terminal: <Terminal className="w-4 h-4 text-[var(--accent)]" />,
  Sparkles: <Sparkles className="w-4 h-4 text-[var(--accent)]" />,
  Radio: <Radio className="w-4 h-4 text-[var(--accent)]" />,
  Disc: <Disc className="w-4 h-4 text-[var(--accent)]" />,
  Eye: <Eye className="w-4 h-4 text-[var(--accent)]" />,
};

type CategoryFilter = "all" | "signature" | "elemental" | "cyber" | "organic" | "cosmic";

export function SettingsDrawer({
  isOpen,
  onClose,
  activeTheme,
  onSelectTheme,
  gradientStyle = "bloom",
  onSelectGradientStyle,
}: SettingsDrawerProps) {
  const [paletteCategory, setPaletteCategory] = useState<CategoryFilter>("all");

  const themesList = useMemo(() => {
    const list = Object.values(COLOR_THEMES);
    if (paletteCategory === "all") return list;
    return list.filter((t) => t.category === paletteCategory);
  }, [paletteCategory]);

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed right-0 top-0 bottom-0 w-[420px] max-w-[92vw] z-50 flex flex-col bg-[var(--deep)]/95 backdrop-blur-2xl border-l border-[var(--border)] shadow-[-20px_0_50px_rgba(0,0,0,0.6)] animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            <div>
              <span className="font-serif font-bold text-base text-[var(--txt)] tracking-wide block">
                Personalization
              </span>
              <span className="text-[10px] font-mono text-[var(--txt-muted)]">
                Atmospheric Themes & Engines
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-colors touch-target"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-5">
          {/* Background Engine Selector (13 Distinct Engines) */}
              {onSelectGradientStyle && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--txt-muted)] font-semibold">
                      Atmosphere Engine ({ATMOSPHERE_ENGINES.length})
                    </span>
                    <span className="text-[9px] font-mono text-[var(--accent)] px-2 py-0.5 rounded-full bg-[var(--accent-d)] border border-[var(--accent)]/30">
                      Active: {ATMOSPHERE_ENGINES.find((e) => e.id === gradientStyle)?.label || "Mesh"}
                    </span>
                  </div>
                  <p className="text-xs text-[var(--txt-muted)] leading-relaxed">
                    Select a dynamic background rendering engine. Each adapts dynamically to active theme colors.
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
                    {ATMOSPHERE_ENGINES.map((engine) => {
                      const isActive = gradientStyle === engine.id;
                      return (
                        <button
                          key={engine.id}
                          type="button"
                          onClick={() => onSelectGradientStyle(engine.id)}
                          className={`flex flex-col items-center justify-between p-2.5 rounded-xl border text-center transition-all ${
                            isActive
                              ? "bg-[var(--accent-d)] border-[var(--accent)] text-[var(--txt)] ring-1 ring-[var(--accent)]/50 shadow-sm"
                              : "bg-[var(--surface)] border-[var(--border)] text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)]"
                          }`}
                        >
                          <div className="p-1.5 rounded-lg bg-[var(--surface)] mb-1">
                            {ENGINE_ICONS[engine.iconName] || <Sparkles className="w-4 h-4 text-[var(--accent)]" />}
                          </div>
                          <span className="text-[11px] font-semibold leading-tight line-clamp-1">
                            {engine.label}
                          </span>
                          <span className="text-[8.5px] font-mono text-[var(--txt-muted)] mt-0.5">
                            {engine.tag}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="h-[1px] bg-[var(--border)] my-1" />

              {/* Color Themes Grid (28 Distinct Palettes) */}
              <div className="flex flex-col gap-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-[var(--txt-muted)] font-semibold">
                    Atmospheric Color Palettes ({Object.keys(COLOR_THEMES).length})
                  </span>
                  <span className="text-[9px] font-mono text-[var(--accent)] px-2 py-0.5 rounded-full bg-[var(--accent-d)] border border-[var(--accent)]/30">
                    {COLOR_THEMES[activeTheme]?.label || "Void"}
                  </span>
                </div>
                <p className="text-xs text-[var(--txt-muted)] leading-relaxed">
                  Both 21st.dev gradient formulas and CSS tokens dynamically adapt across all 28 color palettes.
                </p>

                {/* Palette Category Filter Tabs */}
                <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[10px] font-mono">
                  {(["all", "signature", "elemental", "cyber", "organic", "cosmic"] as CategoryFilter[]).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPaletteCategory(cat)}
                      className={`px-2.5 py-1 rounded-lg uppercase tracking-wider transition-colors whitespace-nowrap ${
                        paletteCategory === cat
                          ? "bg-[var(--accent-d)] text-[var(--accent)] font-bold border border-[var(--accent)]/30"
                          : "text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] border border-transparent"
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Swatches Grid */}
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 mt-1">
                  {themesList.map((theme) => {
                    const isActive = activeTheme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        type="button"
                        onClick={() => onSelectTheme(theme.id)}
                        className={`flex flex-col items-center gap-2 p-2 rounded-xl border text-center transition-all ${
                          isActive
                            ? "bg-[var(--accent-d)] border-[var(--accent)] ring-1 ring-[var(--accent)]/50 shadow-sm"
                            : "bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-hover)]"
                        }`}
                      >
                        <div
                          className="w-8 h-8 rounded-full border-2 border-white/20 shadow-md relative flex items-center justify-center shrink-0"
                          style={{ background: theme.swatchGradient }}
                        >
                          {isActive && <Check className="w-3.5 h-3.5 text-white drop-shadow" />}
                        </div>
                        <span
                          className={`text-[9.5px] font-mono tracking-wider truncate max-w-full ${
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
        </div>
      </div>
    </>
  );
}
