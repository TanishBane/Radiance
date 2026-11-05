"use client";

import React, { useState, useMemo, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { COLOR_THEMES, ATMOSPHERE_ENGINES, GradientStyle } from "@/lib/types/theme";
import {
  selectNextDynamicTheme,
  isAutoThemeEnabled,
  setAutoThemeEnabled,
} from "@/lib/theme/dynamic-theme";
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
  Dices,
  Shuffle,
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
  const [autoTheme, setAutoTheme] = useState<boolean>(true);

  useEffect(() => {
    setAutoTheme(isAutoThemeEnabled());
  }, []);

  const handleToggleAutoTheme = (checked: boolean) => {
    setAutoTheme(checked);
    setAutoThemeEnabled(checked);
  };

  const handleShuffleTheme = () => {
    const next = selectNextDynamicTheme(activeTheme);
    onSelectTheme(next);
  };

  const themesList = useMemo(() => {
    const list = Object.values(COLOR_THEMES);
    if (paletteCategory === "all") return list;
    return list.filter((t) => t.category === paletteCategory);
  }, [paletteCategory]);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
      <Dialog.Overlay className="radiance-dialog-overlay fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />

      <Dialog.Content className="radiance-dialog-panel radiance-dialog-right fixed right-0 top-0 bottom-0 w-[420px] max-w-[92vw] z-50 flex flex-col bg-[var(--deep)]/95 backdrop-blur-2xl border-l border-[var(--border)] shadow-[-20px_0_50px_rgba(0,0,0,0.6)] outline-none">
        <Dialog.Description className="sr-only">Choose your conversation tone, atmosphere, and color theme.</Dialog.Description>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)]">
          <div className="flex items-center gap-2.5">
            <Sliders className="w-4 h-4 text-[var(--accent)]" />
            <div>
              <Dialog.Title className="font-serif font-bold text-base text-[var(--txt)] tracking-wide block">
                Personalization
              </Dialog.Title>
              <span className="text-[10px] font-mono text-[var(--txt-muted)]">
                Atmospheric Themes & Engines
              </span>
            </div>
          </div>
          <Dialog.Close asChild>
          <button
            type="button"
            className="p-2 rounded-xl text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-colors touch-target"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
          </Dialog.Close>
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

                {/* Dynamic Theme System Controls */}
                <div className="p-3 rounded-xl bg-[var(--surface)] border border-[var(--border)] flex flex-col gap-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[var(--accent-d)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)]">
                        <Sparkles className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-[var(--txt)] flex items-center gap-1.5">
                          Dynamic Theme Assignment
                          {autoTheme && (
                            <span className="text-[8.5px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                              Active
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-[var(--txt-muted)]">
                          Assigns a fresh palette automatically on each visit
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoTheme}
                      onClick={() => handleToggleAutoTheme(!autoTheme)}
                      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                        autoTheme ? "bg-[var(--accent)]" : "bg-white/10"
                      }`}
                      aria-label="Toggle dynamic theme assignment on visit"
                    >
                      <span
                        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                          autoTheme ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                    <span className="text-[10px] font-mono text-[var(--txt-dim)]">
                      Want a new look right now?
                    </span>
                    <button
                      type="button"
                      onClick={handleShuffleTheme}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-[var(--accent-d)] border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent-g)] transition-colors active:scale-95"
                    >
                      <Dices className="w-3.5 h-3.5" />
                      Shuffle Palette
                    </button>
                  </div>
                </div>

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
      </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
