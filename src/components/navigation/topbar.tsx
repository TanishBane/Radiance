"use client";

import React, { useEffect, useRef, useState } from "react";
import { RadianceLogo } from "@/components/branding/radiance-logo";
import { Check, ChevronDown, Languages, PanelLeft, Search, Trash2 } from "lucide-react";
import { UI_LANGUAGES, UI_LANGUAGE_LABELS, uiText, type UiLanguage } from "@/lib/i18n/ui";

interface TopbarProps {
  language: UiLanguage;
  onToggleLanguage: (lang: UiLanguage) => void;
  onClearChat: () => void;
  onNewChat: () => void;
  onOpenSearch?: () => void;
  onToggleSidebar?: () => void;
  sidebarOpen?: boolean;
}

export function Topbar({
  language,
  onToggleLanguage,
  onClearChat,
  onNewChat,
  onOpenSearch,
  onToggleSidebar,
  sidebarOpen = false,
}: TopbarProps) {
  const [languageMenuOpen, setLanguageMenuOpen] = useState(false);
  const languageMenuRef = useRef<HTMLDivElement>(null);
  const languageTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!languageMenuOpen) return;
    const dismiss = (event: MouseEvent) => {
      if (!languageMenuRef.current?.contains(event.target as Node)) setLanguageMenuOpen(false);
    };
    const dismissOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setLanguageMenuOpen(false);
        languageTriggerRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", dismiss);
    document.addEventListener("keydown", dismissOnEscape);
    return () => {
      document.removeEventListener("mousedown", dismiss);
      document.removeEventListener("keydown", dismissOnEscape);
    };
  }, [languageMenuOpen]);

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 pt-[max(0.625rem,env(safe-area-inset-top,0px))] pl-[max(0.625rem,env(safe-area-inset-left,0px))] pr-[max(0.625rem,env(safe-area-inset-right,0px))] bg-[var(--void)]/85 backdrop-blur-xl border-b border-[var(--border)] select-none shrink-0 w-full min-h-[var(--mobile-topbar-h,52px)]">
      {/* Left: search and sidebar controls */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {onToggleSidebar && (
          <button
            type="button"
            onClick={onToggleSidebar}
            className="min-w-[44px] min-h-[44px] p-2 rounded-xl border border-[var(--border)] text-[var(--txt-dim)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] active:scale-95 transition-all flex items-center justify-center touch-target cursor-pointer"
            title={uiText(language, "Toggle sidebar")}
            aria-label={uiText(language, "Toggle sidebar")}
            aria-pressed={sidebarOpen}
          >
            <PanelLeft className="w-5 h-5" aria-hidden="true" />
          </button>
        )}

        {onOpenSearch && (
          <button
            type="button"
            onClick={onOpenSearch}
            className="min-w-[44px] min-h-[44px] p-2 rounded-xl border border-[var(--border)] text-[var(--txt-dim)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] active:scale-95 transition-all flex items-center justify-center touch-target cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            title={uiText(language, "Search chats")}
            aria-label={uiText(language, "Search chats")}
          >
            <Search className="w-5 h-5" aria-hidden="true" />
          </button>
        )}

        {/* On Mobile: Compact brand logo */}
        <div className="md:hidden flex items-center gap-2">
          <RadianceLogo size="sm" onClick={onNewChat} showWordmark={false} />
        </div>
      </div>

      {/* Right: Interface and response language & clear conversation */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <div className="relative" ref={languageMenuRef}>
          <button
            type="button"
            ref={languageTriggerRef}
            aria-label={uiText(language, "Translate")}
            aria-haspopup="listbox"
            aria-expanded={languageMenuOpen}
            onClick={() => setLanguageMenuOpen((open) => !open)}
            className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-xs font-medium text-[var(--txt)] hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
          >
            <Languages className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span>{uiText(language, "Translate")}</span>
            <ChevronDown className="h-3.5 w-3.5 text-[var(--txt-muted)]" aria-hidden="true" />
          </button>
          {languageMenuOpen && (
            <div
              role="listbox"
              aria-label={uiText(language, "Interface and response language")}
              className="absolute right-0 top-full z-[60] mt-2 max-h-[min(70vh,22rem)] w-52 overflow-y-auto rounded-xl border border-white/15 bg-[#100d18] p-1.5 text-[var(--txt)] shadow-2xl"
            >
              {UI_LANGUAGES.map((option) => (
                <button
                  key={option}
                  type="button"
                  role="option"
                  aria-selected={language === option}
                  onClick={() => {
                    onToggleLanguage(option);
                    setLanguageMenuOpen(false);
                    languageTriggerRef.current?.focus();
                  }}
                  className="flex min-h-10 w-full items-center justify-between rounded-lg px-3 text-left text-sm text-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >
                  <span>{UI_LANGUAGE_LABELS[option]}</span>
                  {language === option && <Check className="h-4 w-4 text-[var(--accent-b)]" aria-hidden="true" />}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Clear Chat Button */}
        <button
          type="button"
          onClick={onClearChat}
          className="min-w-[44px] min-h-[44px] p-2 rounded-xl border border-[var(--border)] text-[var(--txt-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 hover:border-[var(--danger)]/30 transition-colors touch-target flex items-center justify-center cursor-pointer"
          title={uiText(language, "Clear active conversation")}
          aria-label={uiText(language, "Clear active conversation")}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
