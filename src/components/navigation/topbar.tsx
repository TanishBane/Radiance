"use client";

import React from "react";
import { RadianceLogo } from "@/components/branding/radiance-logo";
import { Trash2 } from "lucide-react";
import { IconMenu2 } from "@tabler/icons-react";

interface TopbarProps {
  language: "en" | "hi";
  onToggleLanguage: (lang: "en" | "hi") => void;
  onClearChat: () => void;
  onNewChat: () => void;
  onToggleMobileMenu?: () => void;
  modelName?: string;
}

export function Topbar({
  language,
  onToggleLanguage,
  onClearChat,
  onNewChat,
  onToggleMobileMenu,
  modelName,
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
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <IconMenu2 className="w-5 h-5" />
          </button>
        )}

        {/* On Mobile: Compact brand logo */}
        <div className="md:hidden flex items-center gap-2">
          <RadianceLogo size="sm" onClick={onNewChat} showWordmark={false} />
          {modelName && (
            <span className="font-mono text-[10px] text-[var(--txt-muted)] px-2 py-0.5 rounded-full border border-[var(--border)] bg-[var(--surface)] max-w-[120px] truncate hidden xs:inline-block">
              {modelName}
            </span>
          )}
        </div>

        {/* On Desktop: Clean Context Badge (Default Assistant) */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="font-mono text-xs font-semibold text-[var(--txt)] tracking-wide">
            {modelName || "Default Assistant"}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.2 rounded-full border border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent-d)]">
            v1.0
          </span>
        </div>
      </div>

      {/* Right: Language Toggle & Clear Conversation */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Language Switcher */}
        <div className="flex rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] text-[10px] font-mono p-0.5">
          <button
            type="button"
            onClick={() => onToggleLanguage("en")}
            className={`min-w-[34px] sm:min-w-[28px] min-h-[34px] sm:min-h-[28px] px-2.5 py-1 rounded-lg flex items-center justify-center transition-colors touch-target ${
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
            className={`min-w-[34px] sm:min-w-[28px] min-h-[34px] sm:min-h-[28px] px-2.5 py-1 rounded-lg flex items-center justify-center transition-colors touch-target ${
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
          className="min-w-[44px] min-h-[44px] p-2 rounded-xl border border-[var(--border)] text-[var(--txt-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 hover:border-[var(--danger)]/30 transition-colors touch-target flex items-center justify-center cursor-pointer"
          title="Clear active conversation"
          aria-label="Clear active conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
