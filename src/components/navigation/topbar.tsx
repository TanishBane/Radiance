"use client";

import React from "react";
import { RadianceLogo } from "@/components/branding/radiance-logo";
import { Languages, Trash2 } from "lucide-react";
import { IconMenu2 } from "@tabler/icons-react";
import { uiText, type UiLanguage } from "@/lib/i18n/ui";

interface TopbarProps {
  language: UiLanguage;
  onToggleLanguage: (lang: UiLanguage) => void;
  onClearChat: () => void;
  onNewChat: () => void;
  onToggleMobileMenu?: () => void;
}

export function Topbar({
  language,
  onToggleLanguage,
  onClearChat,
  onNewChat,
  onToggleMobileMenu,
}: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 px-2.5 sm:px-4 py-2 sm:py-2.5 pt-[max(0.625rem,env(safe-area-inset-top,0px))] pl-[max(0.625rem,env(safe-area-inset-left,0px))] pr-[max(0.625rem,env(safe-area-inset-right,0px))] bg-[var(--void)]/85 backdrop-blur-xl border-b border-[var(--border)] select-none shrink-0 w-full min-h-[var(--mobile-topbar-h,52px)]">
      {/* Left: Mobile Menu Toggle & Desktop Context Indicator */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* On Mobile: Hamburger button to open sidebar drawer */}
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="min-w-[44px] min-h-[44px] p-2 rounded-xl border border-[var(--border)] text-[var(--txt-dim)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] active:scale-95 transition-all flex items-center justify-center touch-target cursor-pointer"
            title={uiText(language, "Open navigation menu")}
            aria-label={uiText(language, "Open navigation menu")}
          >
            <IconMenu2 className="w-5 h-5" />
          </button>
        )}

        {/* On Mobile: Compact brand logo */}
        <div className="md:hidden flex items-center gap-2">
          <RadianceLogo size="sm" onClick={onNewChat} showWordmark={false} />
        </div>
      </div>

      {/* Right: Interface and response language & clear conversation */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        <label className="flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-2.5 text-[var(--txt-muted)] focus-within:border-[var(--border-accent)]">
          <Languages className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span className="sr-only">{uiText(language, "Translate")}</span>
          <select
            aria-label={uiText(language, "Translate")}
            value={language}
            onChange={(event) => onToggleLanguage(event.target.value as UiLanguage)}
            className="min-h-10 max-w-28 cursor-pointer bg-transparent text-xs font-medium text-[var(--txt)] outline-none"
          >
            <option value="en">{uiText(language, "English")}</option>
            <option value="hi">{uiText(language, "Hindi")}</option>
          </select>
        </label>

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
