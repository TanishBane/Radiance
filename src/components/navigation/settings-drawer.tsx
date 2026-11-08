"use client";

import React, { useState, useMemo, useEffect } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
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
  Film,
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

const ENGINE_ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  Film,
  SunMedium,
  Waves,
  Orbit,
  Wind,
  Zap,
  Grid3X3,
  Share2,
  Flame,
  Terminal,
  Sparkles,
  Radio,
  Disc,
  Eye,
};

type CategoryFilter = "all" | "signature" | "elemental" | "cyber" | "organic" | "cosmic";

const CATEGORIES: { id: CategoryFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "signature", label: "Signature" },
  { id: "elemental", label: "Elemental" },
  { id: "cyber", label: "Cyber" },
  { id: "organic", label: "Organic" },
  { id: "cosmic", label: "Cosmic" },
];

export function SettingsDrawer({
  isOpen,
  onClose,
  activeTheme,
  onSelectTheme,
  gradientStyle = "ambient-spotlight",
  onSelectGradientStyle,
}: SettingsDrawerProps) {
  const [paletteCategory, setPaletteCategory] = useState<CategoryFilter>("all");
  const [autoTheme, setAutoTheme] = useState<boolean>(true);
  const [diceRotation, setDiceRotation] = useState<number>(0);
  const prefersReducedMotion = useReducedMotion();

  useEffect(() => {
    setAutoTheme(isAutoThemeEnabled());
  }, []);

  const handleToggleAutoTheme = (checked: boolean) => {
    setAutoTheme(checked);
    setAutoThemeEnabled(checked);
  };

  const handleShuffleTheme = () => {
    setDiceRotation((prev) => prev + 360);
    const next = selectNextDynamicTheme(activeTheme);
    onSelectTheme(next);
  };

  const themesList = useMemo(() => {
    const list = Object.values(COLOR_THEMES);
    if (paletteCategory === "all") return list;
    return list.filter((t) => t.category === paletteCategory);
  }, [paletteCategory]);

  const activeThemeObj = COLOR_THEMES[activeTheme] || COLOR_THEMES.default;
  const activeEngineObj = ATMOSPHERE_ENGINES.find((e) => e.id === gradientStyle);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AnimatePresence>
        {isOpen && (
          <Dialog.Portal forceMount>
            <Dialog.Overlay asChild forceMount>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
                className="radiance-dialog-overlay fixed inset-0 z-40 bg-black/65 backdrop-blur-md"
              />
            </Dialog.Overlay>

            <Dialog.Content asChild forceMount>
              <motion.div
                initial={{ x: "100%", opacity: 0.8 }}
                animate={{ x: 0, opacity: 1 }}
                exit={{ x: "100%", opacity: 0.8 }}
                transition={
                  prefersReducedMotion
                    ? { duration: 0 }
                    : { type: "spring", damping: 32, stiffness: 340 }
                }
                className="radiance-dialog-panel radiance-dialog-right fixed right-0 top-0 bottom-0 h-[100dvh] w-[460px] max-w-[94vw] z-50 flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pr-[env(safe-area-inset-right,0px)] bg-[var(--deep)]/95 backdrop-blur-2xl border-l border-[var(--border)] shadow-[-20px_0_60px_rgba(0,0,0,0.7)] outline-none font-sans"
              >
                <Dialog.Description className="sr-only">
                  Choose your conversation tone, atmosphere, and color theme.
                </Dialog.Description>

                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-[var(--border)] bg-[var(--deep)]/90 backdrop-blur-xl shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-[var(--accent-d)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shadow-[0_0_16px_var(--accent-g)] shrink-0">
                      <Sliders className="w-4 h-4 text-[var(--accent)]" />
                    </div>
                    <div>
                      <Dialog.Title className="font-serif font-bold text-lg sm:text-xl text-[var(--txt)] tracking-tight block">
                        Personalization
                      </Dialog.Title>
                      <span className="text-[11px] font-mono text-[var(--txt-muted)] flex items-center gap-1.5 mt-0.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                        Atmospheric Themes & Engines
                      </span>
                    </div>
                  </div>

                  <Dialog.Close asChild>
                    <motion.button
                      whileHover={prefersReducedMotion ? {} : { scale: 1.08, rotate: 90 }}
                      whileTap={prefersReducedMotion ? {} : { scale: 0.92 }}
                      transition={{ duration: 0.15 }}
                      type="button"
                      className="p-2 rounded-xl text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] border border-transparent hover:border-[var(--border)] transition-colors touch-target min-w-[44px] min-h-[44px] flex items-center justify-center cursor-pointer"
                      aria-label="Close settings"
                    >
                      <X className="w-4 h-4" />
                    </motion.button>
                  </Dialog.Close>
                </div>

                {/* Content Body */}
                <div className="flex-1 overflow-y-auto px-5 py-5 flex flex-col gap-6 custom-scrollbar">
                  {/* Background Engine Selector (13 Distinct Engines) */}
                  {onSelectGradientStyle && (
                    <div className="flex flex-col gap-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-mono uppercase tracking-wider text-[var(--txt-dim)] font-semibold flex items-center gap-1.5">
                          Atmosphere Engine ({ATMOSPHERE_ENGINES.length})
                        </span>
                        <span className="text-[10px] font-mono font-medium text-[var(--accent)] px-2.5 py-0.5 rounded-full bg-[var(--accent-d)] border border-[var(--accent)]/30 shadow-[0_0_12px_-2px_var(--accent-g)] flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                          Active: {activeEngineObj?.label || "Ribbon Waves"}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--txt-muted)] leading-relaxed font-sans">
                        Select a dynamic background rendering engine. Each adapts dynamically to active theme colors.
                      </p>

                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-1">
                        {ATMOSPHERE_ENGINES.map((engine) => {
                          const isActive = gradientStyle === engine.id;
                          const IconComponent = ENGINE_ICON_MAP[engine.iconName] || Sparkles;

                          return (
                            <motion.button
                              key={engine.id}
                              type="button"
                              onClick={() => onSelectGradientStyle(engine.id)}
                              whileHover={prefersReducedMotion ? {} : { y: -2, scale: 1.02 }}
                              whileTap={prefersReducedMotion ? {} : { scale: 0.97 }}
                              transition={{ type: "spring", stiffness: 400, damping: 25 }}
                              className={`relative overflow-hidden flex flex-col items-center justify-between p-3 rounded-2xl border text-center transition-all cursor-pointer min-h-[108px] ${
                                isActive
                                  ? "bg-[var(--accent-d)]/60 border-[var(--accent)] text-[var(--txt)] shadow-[0_0_24px_-4px_var(--accent-g)] ring-1 ring-[var(--accent)]/40"
                                  : "bg-[var(--surface)] border-[var(--border)] text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)]"
                              }`}
                            >
                              {isActive && !prefersReducedMotion && (
                                <motion.div
                                  layoutId="activeEngineIndicator"
                                  className="absolute inset-0 bg-gradient-to-b from-[var(--accent)]/15 via-transparent to-[var(--accent)]/5 pointer-events-none -z-10"
                                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                />
                              )}

                              <div
                                className={`w-9 h-9 rounded-xl flex items-center justify-center mb-1.5 transition-all shadow-sm ${
                                  isActive
                                    ? "bg-[var(--accent)] text-white shadow-[0_0_14px_var(--accent)] scale-105"
                                    : "bg-white/[0.04] border border-white/[0.08] text-[var(--txt-muted)]"
                                }`}
                              >
                                <IconComponent className="w-4 h-4" />
                              </div>

                              <span className="text-xs font-sans font-semibold leading-tight text-center break-words max-w-full px-1 min-h-[2rem] flex items-center justify-center">
                                {engine.label}
                              </span>

                              <span
                                className={`text-[9px] font-mono tracking-wider uppercase px-2 py-0.5 rounded-md mt-1 transition-colors ${
                                  isActive
                                    ? "bg-[var(--accent)]/20 text-[var(--accent-b)] border border-[var(--accent)]/30 font-semibold"
                                    : "bg-white/[0.03] text-[var(--txt-muted)] border border-white/[0.05]"
                                }`}
                              >
                                {engine.tag}
                              </span>
                            </motion.button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="h-[1px] bg-gradient-to-r from-transparent via-[var(--border)] to-transparent my-1" />

                  {/* Color Themes Section (28 Distinct Palettes) */}
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase tracking-wider text-[var(--txt-dim)] font-semibold flex items-center gap-1.5">
                        Atmospheric Color Palettes ({Object.keys(COLOR_THEMES).length})
                      </span>
                      <span className="text-[10px] font-mono font-medium text-[var(--accent)] px-2.5 py-0.5 rounded-full bg-[var(--accent-d)] border border-[var(--accent)]/30 shadow-[0_0_12px_-2px_var(--accent-g)] flex items-center gap-1.5">
                        <span
                          className="w-2 h-2 rounded-full border border-white/40 shadow-sm shrink-0"
                          style={{ background: activeThemeObj.swatchGradient }}
                        />
                        {activeThemeObj.label}
                      </span>
                    </div>

                    <p className="text-xs text-[var(--txt-muted)] leading-relaxed font-sans">
                      Both 21st.dev gradient formulas and CSS tokens dynamically adapt across all 28 color palettes.
                    </p>

                    {/* Dynamic Theme Assignment Card */}
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-white/[0.05] to-white/[0.02] border border-white/[0.08] shadow-[0_4px_24px_-4px_rgba(0,0,0,0.5)] flex flex-col gap-3.5">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-[var(--accent-d)] border border-[var(--accent)]/30 flex items-center justify-center text-[var(--accent)] shadow-[0_0_16px_var(--accent-g)] shrink-0">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="text-xs font-sans font-semibold text-[var(--txt)] flex items-center gap-2">
                              Dynamic Theme Assignment
                              {autoTheme && (
                                <span className="text-[9px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.25)]">
                                  Active
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-sans text-[var(--txt-muted)] mt-0.5">
                              Assigns a fresh palette automatically on each visit
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          role="switch"
                          aria-checked={autoTheme}
                          onClick={() => handleToggleAutoTheme(!autoTheme)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border border-white/10 transition-colors duration-200 ease-in-out focus:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] ${
                            autoTheme
                              ? "bg-[var(--accent)] shadow-[0_0_14px_var(--accent)]"
                              : "bg-white/10"
                          }`}
                          aria-label="Toggle dynamic theme assignment on visit"
                        >
                          <motion.span
                            layout
                            transition={
                              prefersReducedMotion
                                ? { duration: 0 }
                                : { type: "spring", stiffness: 500, damping: 30 }
                            }
                            className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md my-auto ${
                              autoTheme ? "translate-x-5" : "translate-x-0.5"
                            }`}
                          />
                        </button>
                      </div>

                      <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
                        <span className="text-[11px] font-sans text-[var(--txt-dim)]">
                          Want a new look right now?
                        </span>
                        <motion.button
                          type="button"
                          onClick={handleShuffleTheme}
                          whileHover={prefersReducedMotion ? {} : { scale: 1.03 }}
                          whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                          transition={{ type: "spring", stiffness: 450, damping: 25 }}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-mono font-medium bg-[var(--accent-d)] border border-[var(--accent)]/30 text-[var(--accent)] hover:bg-[var(--accent-g)] shadow-[0_2px_12px_-2px_var(--accent-g)] transition-colors cursor-pointer"
                        >
                          <motion.span
                            animate={{ rotate: diceRotation }}
                            transition={{ duration: 0.5, ease: "easeOut" }}
                            className="inline-flex items-center justify-center"
                          >
                            <Dices className="w-3.5 h-3.5" />
                          </motion.span>
                          Shuffle Palette
                        </motion.button>
                      </div>
                    </div>

                    {/* Palette Category Filter Tabs with Gliding Pill Indicator */}
                    <div className="flex items-center gap-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/[0.06] overflow-x-auto text-[11px] font-mono scrollbar-none mt-1">
                      {CATEGORIES.map((cat) => {
                        const isSelected = paletteCategory === cat.id;
                        return (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => setPaletteCategory(cat.id)}
                            className={`relative px-3 py-1.5 rounded-lg uppercase tracking-wider transition-colors whitespace-nowrap cursor-pointer select-none font-medium ${
                              isSelected
                                ? "text-[var(--accent)] font-bold"
                                : "text-[var(--txt-muted)] hover:text-[var(--txt)]"
                            }`}
                          >
                            {isSelected && !prefersReducedMotion && (
                              <motion.div
                                layoutId="activeCategoryPill"
                                className="absolute inset-0 rounded-lg bg-[var(--accent-d)] border border-[var(--accent)]/30 shadow-[0_0_12px_var(--accent-g)] -z-10"
                                transition={{ type: "spring", stiffness: 450, damping: 30 }}
                              />
                            )}
                            {isSelected && prefersReducedMotion && (
                              <div className="absolute inset-0 rounded-lg bg-[var(--accent-d)] border border-[var(--accent)]/30 -z-10" />
                            )}
                            {cat.label}
                          </button>
                        );
                      })}
                    </div>

                    {/* Swatches Grid (28 Distinct Palettes) */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5 mt-1">
                      {themesList.map((theme) => {
                        const isActive = activeTheme === theme.id;
                        return (
                          <motion.button
                            key={theme.id}
                            type="button"
                            onClick={() => onSelectTheme(theme.id)}
                            whileHover={prefersReducedMotion ? {} : { y: -2, scale: 1.04 }}
                            whileTap={prefersReducedMotion ? {} : { scale: 0.95 }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={`relative overflow-hidden flex flex-col items-center justify-between p-2.5 rounded-2xl border text-center transition-all min-h-[96px] cursor-pointer ${
                              isActive
                                ? "bg-[var(--accent-d)]/60 border-[var(--accent)] ring-1 ring-[var(--accent)]/40 shadow-[0_0_20px_-4px_var(--accent-g)]"
                                : "bg-[var(--surface)] border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)]"
                            }`}
                            aria-label={`${theme.label} theme`}
                          >
                            <div
                              className="w-9 h-9 rounded-full border-2 border-white/20 shadow-md relative flex items-center justify-center shrink-0 overflow-hidden"
                              style={{
                                background: theme.swatchGradient,
                                boxShadow: isActive
                                  ? `0 0 16px 2px ${theme.accentG}`
                                  : undefined,
                              }}
                            >
                              {/* Specular gloss highlight */}
                              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/10 to-white/35 rounded-full pointer-events-none" />

                              {isActive && (
                                <motion.div
                                  initial={{ scale: 0, opacity: 0 }}
                                  animate={{ scale: 1, opacity: 1 }}
                                  transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                >
                                  <Check className="w-4 h-4 text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.8)] stroke-[2.5]" />
                                </motion.div>
                              )}
                            </div>

                            <span
                              className={`text-[10.5px] font-sans font-medium text-center leading-tight line-clamp-2 w-full break-words min-h-[1.75rem] flex items-center justify-center mt-1.5 ${
                                isActive
                                  ? "text-[var(--accent)] font-semibold"
                                  : "text-[var(--txt-muted)]"
                              }`}
                            >
                              {theme.label}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </motion.div>
            </Dialog.Content>
          </Dialog.Portal>
        )}
      </AnimatePresence>
    </Dialog.Root>
  );
}
