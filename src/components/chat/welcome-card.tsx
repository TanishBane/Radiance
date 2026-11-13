"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Sparkles, Compass, Lightbulb, Eye, X } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { getMotionTransition } from "@/lib/motion/presets";
import { RadianceLogo } from "@/components/branding/radiance-logo";
import { uiText, type UiLanguage } from "@/lib/i18n/ui";
import type { Conversation } from "@/lib/types/chat";
import { safeLocalStorage } from "@/lib/utils/storage";
import {
  createWelcomeSuggestions,
  SUGGESTION_COLUMNS,
  WELCOME_SUGGESTIONS_STORAGE_KEY,
} from "@/lib/chat/welcome-suggestions";

export { SUGGESTION_COLUMNS } from "@/lib/chat/welcome-suggestions";
export type { SuggestionColumn, SuggestionItem } from "@/lib/chat/welcome-suggestions";

const EMPTY_CONVERSATIONS: Conversation[] = [];

interface WelcomeCardProps {
  language?: UiLanguage;
  conversations?: Conversation[];
  historyLoaded?: boolean;
  onSelectPrompt: (prompt: string) => void;
}

export function WelcomeCard({
  language = "en",
  conversations = EMPTY_CONVERSATIONS,
  historyLoaded = false,
  onSelectPrompt,
}: WelcomeCardProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [activeCategory, setActiveCategory] = useState<string>("understand");
  const [suggestionColumns, setSuggestionColumns] = useState(SUGGESTION_COLUMNS);
  const [previewSuggestion, setPreviewSuggestion] = useState<{ label: string; prompt: string } | null>(null);
  const generatedForSession = useRef(false);

  useEffect(() => {
    if (!historyLoaded || generatedForSession.current) return;
    generatedForSession.current = true;
    const storedIds = safeLocalStorage.get<unknown>(WELCOME_SUGGESTIONS_STORAGE_KEY, []);
    const previousIds = Array.isArray(storedIds)
      ? storedIds.filter((id): id is string => typeof id === "string")
      : [];
    const nextSuggestions = createWelcomeSuggestions(conversations, previousIds);
    setSuggestionColumns(nextSuggestions);
    safeLocalStorage.set(
      WELCOME_SUGGESTIONS_STORAGE_KEY,
      nextSuggestions.flatMap((column) => column.items.map((item) => item.id))
    );
  }, [conversations, historyLoaded]);

  const titleName = "Radiance";
  const description =
    "Illuminate what is possible. Stream real-time reasoning, analyze documents, generate Flux visuals, and explore complex ideas.";

  function getHeaderStyle(role: "accentB" | "gradient" | "accentC"): React.CSSProperties {
    if (role === "accentB") return { color: "var(--accent-b)" };
    if (role === "accentC") return { color: "var(--accent-c)" };
    return {
      backgroundImage: "var(--text-gradient)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "var(--accent)",
    };
  }

  const activeCol = suggestionColumns.find((column) => column.id === activeCategory) || suggestionColumns[0];

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={getMotionTransition("entrance", prefersReducedMotion)}
      className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-3 sm:px-4 py-4 sm:py-8 text-center gap-4 sm:gap-6"
    >
      {/* Brand Icon Gem with Dynamic Ambient Glow */}
      <div
        className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center border border-[var(--border)] shadow-card transition-all duration-300 hover:scale-105 select-none hover:border-[var(--accent)]/40 hover:shadow-[0_8px_24px_var(--accent-d)] p-2 sm:p-3 text-[var(--txt)]"
        style={{
          background: "linear-gradient(135deg, var(--surface-raised), rgba(255, 255, 255, 0.02))",
        }}
      >
        <RadianceLogo variant="symbol" size="md" showWordmark={false} animated glow className="w-7 h-7 sm:w-10 sm:h-9" />
      </div>

      {/* Hero Title (Signature TanixAI Cormorant Garamond + 3-Stop Chromatic Gradient) */}
      <div className="flex flex-col gap-1.5 sm:gap-2.5">
        <h1 className="font-serif text-2xl sm:text-5xl md:text-6xl font-light text-[var(--txt)] tracking-tight leading-tight select-none">
          {uiText(language, "Hello, I Am")} <em className="not-italic font-bold gradient-text-brand drop-shadow-sm">{titleName}</em>
        </h1>
        <p className="text-xs sm:text-base text-[var(--txt-dim)] font-light max-w-lg leading-relaxed mx-auto font-sans line-clamp-2 sm:line-clamp-none">
          {uiText(language, description)}
        </p>
      </div>

      {/* Dynamic Subtitle matched with Background Atmosphere */}
      <div className="w-full max-w-3xl flex flex-col items-start mt-1 sm:mt-2">
        <p className="text-xs sm:text-base text-[var(--txt)] font-medium text-left drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block animate-pulse shrink-0 shadow-[0_0_8px_var(--accent)]"
            style={{ backgroundColor: "var(--accent)" }}
            aria-hidden="true"
          />
          {uiText(language, "Tell me what’s on your mind, or pick a suggestion.")}
        </p>
      </div>

      {/* ══ MOBILE-FIRST INTERACTIVE CATEGORY TABS (< md) ══ */}
      <div className="md:hidden w-full max-w-3xl flex flex-col gap-3">
        {/* Category Pill Tabs Row */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-0.5 px-0.5 overscroll-contain [-webkit-overflow-scrolling:touch]">
          {suggestionColumns.map((col) => {
            const isSelected = col.id === activeCategory;
            return (
              <button
                key={col.id}
                type="button"
                onClick={() => setActiveCategory(col.id)}
                className={`min-h-[44px] px-4 py-1.5 rounded-full text-xs font-medium font-sans border transition-all cursor-pointer whitespace-nowrap touch-target flex items-center gap-1.5 shrink-0 ${
                  isSelected
                    ? "bg-[var(--accent-d)] border-[var(--accent)] text-[var(--accent-b)] font-semibold shadow-[0_0_12px_var(--accent-g)]"
                    : "bg-[var(--surface)] border-[var(--border)] text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)]"
                }`}
                aria-pressed={isSelected}
              >
                {col.id === "understand" && <Lightbulb className="w-3.5 h-3.5" />}
                {col.id === "create" && <Sparkles className="w-3.5 h-3.5" />}
                {col.id === "explore" && <Compass className="w-3.5 h-3.5" />}
                <span>{uiText(language, col.title)}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Category Prompt Cards Container */}
        <div
          className="flex flex-col gap-2 p-3.5 rounded-2xl border text-left"
          style={{
            background:
              "linear-gradient(180deg, var(--user-bg, rgba(255, 255, 255, 0.04)) 0%, rgba(10, 9, 16, 0.82) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(20px)",
            borderColor: "var(--border)",
            boxShadow: "0 10px 30px -8px rgba(0, 0, 0, 0.6)",
          }}
        >
          <div className="flex items-center justify-between mb-1">
            <span
              className="text-xs font-semibold uppercase tracking-wider font-sans"
              style={getHeaderStyle(activeCol.headerThemeRole)}
            >
              {uiText(language, `${activeCol.title} Prompts`)}
            </span>
            <span className="text-[10px] font-mono text-[var(--txt-muted)]">{uiText(language, "Tap to ask")}</span>
          </div>

          <div className="flex flex-col gap-2 w-full">
            {activeCol.items.map((item) => (
              <div key={item.id} className="flex items-center gap-1.5">
                <motion.button
                  type="button"
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                  onClick={() => onSelectPrompt(item.prompt)}
                  className="min-w-0 flex-1 text-left flex items-center justify-between gap-2.5 px-3 py-2.5 min-h-[44px] rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-[var(--accent-d)] hover:border-[var(--border-accent)] transition-all cursor-pointer touch-target shadow-xs"
                  aria-label={`${uiText(language, "Ask suggestion")}: ${uiText(language, item.label)}`}
                >
                  <span className="text-xs text-[var(--txt)] font-normal truncate">{uiText(language, item.label)}</span>
                  <span className="text-[11px] text-[var(--accent-b)] font-mono shrink-0" aria-hidden="true">→</span>
                </motion.button>
                <button
                  type="button"
                  onClick={() => setPreviewSuggestion(item)}
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] text-[var(--txt-muted)] transition-colors hover:bg-[var(--accent-d)] hover:text-[var(--txt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] touch-target"
                  aria-label={`${uiText(language, "Preview suggestion")}: ${uiText(language, item.label)}`}
                  title={uiText(language, "Preview full suggestion")}
                >
                  <Eye className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ══ DESKTOP 3-COLUMN SUGGESTIONS ARCHITECTURE (>= md) ══ */}
      <div
        data-testid="prompt-categories"
        className="hidden md:grid w-full max-w-3xl grid-cols-3 gap-4 text-left"
      >
        {suggestionColumns.map((column) => (
          <div
            key={column.id}
            className="group/card flex flex-col items-start p-4 sm:p-5 rounded-3xl border transition-all duration-300 hover:border-[var(--accent)]/40 hover:shadow-[0_16px_48px_-8px_var(--accent-d)]"
            style={{
              background:
                "linear-gradient(180deg, var(--user-bg, rgba(255, 255, 255, 0.04)) 0%, rgba(10, 9, 16, 0.82) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderColor: "var(--border)",
              boxShadow:
                "0 20px 48px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--border), 0 1px 0 0 rgba(255, 255, 255, 0.08) inset",
            }}
          >
            <h2
              className="font-sans text-xl font-semibold tracking-tight mb-3.5 transition-all duration-300 drop-shadow-sm"
              style={getHeaderStyle(column.headerThemeRole)}
            >
              {column.title}
            </h2>
            <div className="flex flex-col items-start gap-2.5 w-full">
              {column.items.map((item) => (
                <div key={item.id} className="group/row flex max-w-full items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onSelectPrompt(item.prompt)}
                    className="group/btn w-fit max-w-[calc(100%-2.75rem)] inline-flex items-center gap-2 px-3.5 py-2 sm:py-2 min-h-[44px] rounded-full border transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] touch-target"
                    style={{
                      backgroundColor: "rgba(255, 255, 255, 0.05)",
                      borderColor: "rgba(255, 255, 255, 0.08)",
                      backdropFilter: "blur(8px)",
                      WebkitBackdropFilter: "blur(8px)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = "var(--accent-d)";
                      e.currentTarget.style.borderColor = "var(--border-accent)";
                      e.currentTarget.style.boxShadow = "0 4px 16px var(--accent-d)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                      e.currentTarget.style.boxShadow = "none";
                    }}
                    aria-label={`Ask suggestion: ${item.label}`}
                  >
                    <span className="truncate text-xs sm:text-[13px] text-[#ededed] group-hover/btn:text-[var(--txt)] font-normal transition-colors">
                      {item.label}
                    </span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewSuggestion(item)}
                    className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/[0.08] bg-white/[0.04] text-[var(--txt-muted)] transition-colors hover:bg-[var(--accent-d)] hover:text-[var(--txt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] touch-target"
                    aria-label={`${uiText(language, "Preview suggestion")}: ${uiText(language, item.label)}`}
                    title={uiText(language, "Preview full suggestion")}
                  >
                    <Eye className="h-4 w-4" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog.Root open={Boolean(previewSuggestion)} onOpenChange={(open) => !open && setPreviewSuggestion(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="radiance-dialog-overlay fixed inset-0 z-50 bg-black/65 backdrop-blur-sm" />
          <Dialog.Content className="fixed inset-0 z-50 flex items-center justify-center p-4 outline-none pointer-events-none">
            <div className="pointer-events-auto w-full max-w-lg rounded-2xl border border-[var(--border)] bg-[var(--deep)] p-5 text-left text-[var(--txt)] shadow-modal sm:p-6">
              <div className="mb-4 flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <Dialog.Title className="font-serif text-lg font-semibold">{uiText(language, "Suggestion preview")}</Dialog.Title>
                  <p className="mt-1 text-sm text-[var(--txt-muted)]">{previewSuggestion?.label}</p>
                </div>
                <Dialog.Close asChild>
                  <button type="button" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--txt-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--txt)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] touch-target" aria-label={uiText(language, "Close suggestion preview")}>
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                </Dialog.Close>
              </div>
              <Dialog.Description data-testid="suggestion-preview-prompt" className="rounded-xl border border-[var(--border)] bg-white/[0.04] p-4 text-sm leading-relaxed text-[var(--txt)]">
                {previewSuggestion?.prompt}
              </Dialog.Description>
              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  className="min-h-11 rounded-xl bg-[var(--accent-d)] px-4 py-2 text-sm font-medium text-[var(--txt)] transition-colors hover:bg-[var(--accent)]/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] touch-target"
                  onClick={() => {
                    if (previewSuggestion) onSelectPrompt(previewSuggestion.prompt);
                    setPreviewSuggestion(null);
                  }}
                >
                  {uiText(language, "Send suggestion")}
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </motion.div>
  );
}
