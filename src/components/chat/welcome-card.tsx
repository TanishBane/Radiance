"use client";

import React, { useEffect, useRef, useState } from "react";
import * as Tooltip from "@radix-ui/react-tooltip";
import { Sparkles, Compass, Lightbulb } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { getMotionTransition } from "@/lib/motion/presets";
import { RadianceLogo } from "@/components/branding/radiance-logo";
import { uiText, type UiLanguage } from "@/lib/i18n/ui";
import { localizeWelcomeSuggestion } from "@/lib/i18n/welcome-suggestions";
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

function SuggestionAction({
  item,
  language,
  layout,
  onSelectPrompt,
}: {
  item: { id: string; label: string; prompt: string };
  language: UiLanguage;
  layout: "mobile" | "desktop";
  onSelectPrompt: (prompt: string) => void;
}) {
  const translated = localizeWelcomeSuggestion(item, language);
  const mobile = layout === "mobile";

  return (
    <Tooltip.Root>
      <Tooltip.Trigger asChild>
        <button
          type="button"
          onClick={() => onSelectPrompt(translated.prompt)}
          className={mobile
            ? "min-w-0 w-full text-left flex items-center justify-between gap-2.5 px-3 py-2.5 min-h-[44px] rounded-xl border border-white/[0.08] bg-white/[0.04] hover:bg-[var(--accent-d)] hover:border-[var(--border-accent)] transition-all cursor-pointer touch-target shadow-xs"
            : "group/btn w-fit max-w-full inline-flex items-center gap-2 px-3.5 py-2 min-h-[44px] rounded-full border transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] touch-target"}
          style={mobile ? undefined : {
            backgroundColor: "rgba(255, 255, 255, 0.05)",
            borderColor: "rgba(255, 255, 255, 0.08)",
            backdropFilter: "blur(8px)",
            WebkitBackdropFilter: "blur(8px)",
          }}
          onMouseEnter={mobile ? undefined : (event) => {
            event.currentTarget.style.backgroundColor = "var(--accent-d)";
            event.currentTarget.style.borderColor = "var(--border-accent)";
            event.currentTarget.style.boxShadow = "0 4px 16px var(--accent-d)";
          }}
          onMouseLeave={mobile ? undefined : (event) => {
            event.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
            event.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
            event.currentTarget.style.boxShadow = "none";
          }}
          aria-label={`${uiText(language, "Ask suggestion")}: ${translated.label}`}
        >
          <span className={mobile
            ? "truncate text-xs text-[var(--txt)] font-normal"
            : "truncate text-xs sm:text-[13px] text-[#ededed] group-hover/btn:text-[var(--txt)] font-normal transition-colors"}
          >
            {translated.label}
          </span>
          {mobile && <span className="text-[11px] text-[var(--accent-b)] font-mono shrink-0" aria-hidden="true">→</span>}
        </button>
      </Tooltip.Trigger>
      <Tooltip.Portal>
        <Tooltip.Content side="top" sideOffset={8} className="z-[60] max-w-xs rounded-xl border border-white/15 bg-[var(--deep)]/95 px-3 py-2 text-left text-xs leading-relaxed text-[var(--txt)] shadow-modal backdrop-blur-xl">
          {translated.prompt}
        </Tooltip.Content>
      </Tooltip.Portal>
    </Tooltip.Root>
  );
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
      {/* Hero Title (Signature TanixAI Cormorant Garamond + 3-Stop Chromatic Gradient) */}
      <div className="flex flex-col gap-1.5 sm:gap-2.5">
        <h1 className="font-serif text-2xl sm:text-5xl md:text-6xl font-light text-[var(--txt)] tracking-tight leading-tight select-none">
          {uiText(language, "Hello, I Am")} <span role="img" aria-label="Radiance">
            <span className="relative inline-block h-[0.9em] w-[1.03em] align-[-0.05em]">
              <RadianceLogo variant="symbol" size="xl" showWordmark={false} animated glow className="absolute inset-0 h-full w-full [&>svg]:!h-full [&>svg]:!w-full" aria-hidden />
            </span>
            <em aria-hidden="true" className="not-italic font-bold gradient-text-brand drop-shadow-sm">adiance</em>
          </span>
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

      <Tooltip.Provider delayDuration={250}>
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
              <SuggestionAction
                key={item.id}
                item={item}
                language={language}
                layout="mobile"
                onSelectPrompt={onSelectPrompt}
              />
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
              {uiText(language, column.title)}
            </h2>
            <div className="flex flex-col items-start gap-2.5 w-full">
              {column.items.map((item) => (
                <SuggestionAction
                  key={item.id}
                  item={item}
                  language={language}
                  layout="desktop"
                  onSelectPrompt={onSelectPrompt}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      </Tooltip.Provider>

    </motion.div>
  );
}
