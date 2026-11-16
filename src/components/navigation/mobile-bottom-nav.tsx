"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  MessageSquare,
  History,
  Plus,
  Settings,
} from "lucide-react";
import { getMotionTransition } from "@/lib/motion/presets";
import { uiText, type UiLanguage } from "@/lib/i18n/ui";
import { safeVibrate } from "@/lib/mobile/haptics";
import { cn } from "@/lib/utils/cn";

export interface MobileBottomNavProps {
  language?: UiLanguage;
  activeTab?: "chat" | "history" | "settings";
  onNewChat: () => void;
  onToggleHistory: () => void;
  onToggleSettings: () => void;
  onFocusChat?: () => void;
  isComposerFocused?: boolean;
}

export function MobileBottomNav({
  language = "en",
  activeTab = "chat",
  onNewChat,
  onToggleHistory,
  onToggleSettings,
  onFocusChat,
  isComposerFocused = false,
}: MobileBottomNavProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  // Hardware-accelerated CSS translation when virtual keyboard is active (prevents CLS and DOM re-creation)
  return (
    <nav
      aria-label={uiText(language, "Mobile Navigation")}
      role="navigation"
      aria-hidden={isComposerFocused}
      className={cn(
        "md:hidden shrink-0 z-30 w-full bg-[var(--void)]/90 backdrop-blur-2xl border-t border-[var(--border)] px-2 select-none",
        "transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform",
        isComposerFocused
          ? "translate-y-full opacity-0 pointer-events-none max-h-0 overflow-hidden border-t-transparent pb-0 pt-0"
          : "translate-y-0 opacity-100 pointer-events-auto max-h-[80px] pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-1"
      )}
    >
      <div className="flex items-center justify-around max-w-md mx-auto h-[50px] relative">
        {/* 1. Chat Workspace */}
        <button
          type="button"
          onClick={() => {
            safeVibrate("selection");
            onFocusChat?.();
          }}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 rounded-xl transition-all cursor-pointer touch-target ${
            activeTab === "chat"
              ? "text-[var(--accent-b)] font-semibold"
              : "text-[var(--txt-muted)] hover:text-[var(--txt)]"
          }`}
          aria-label={uiText(language, "Chat Workspace")}
          data-testid="bottom-nav-chat"
        >
          <div className="relative">
            <MessageSquare className="w-4 h-4" />
            {activeTab === "chat" && (
              <motion.span
                layoutId="bottom-nav-active-dot"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]"
                transition={getMotionTransition("feedback", prefersReducedMotion)}
              />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">{uiText(language, "Chat")}</span>
        </button>

        {/* 2. History */}
        <button
          type="button"
          onClick={() => {
            safeVibrate("selection");
            onToggleHistory();
          }}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 rounded-xl transition-all cursor-pointer touch-target ${
            activeTab === "history"
              ? "text-[var(--accent-b)] font-semibold"
              : "text-[var(--txt-muted)] hover:text-[var(--txt)]"
          }`}
          aria-label={uiText(language, "Conversation History")}
          data-testid="bottom-nav-history"
        >
          <div className="relative">
            <History className="w-4 h-4" />
            {activeTab === "history" && (
              <motion.span
                layoutId="bottom-nav-active-dot"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]"
                transition={getMotionTransition("feedback", prefersReducedMotion)}
              />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">{uiText(language, "History")}</span>
        </button>

        {/* 3. Center New Chat Primary Action Button (Thumb Hero) */}
        <div className="flex-1 flex items-center justify-center">
          <motion.button
            type="button"
            whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            transition={{ type: "spring", stiffness: 450, damping: 22 }}
            onClick={() => {
              safeVibrate("tap");
              onNewChat();
            }}
            className="w-11 h-11 min-w-[44px] min-h-[44px] -mt-2 rounded-2xl bg-gradient-to-tr from-[var(--accent)] via-[var(--accent-b)] to-[var(--accent-c)] text-[var(--void)] shadow-[0_4px_16px_var(--accent-g)] flex items-center justify-center font-bold touch-target cursor-pointer border border-white/20 active:brightness-90"
          aria-label={uiText(language, "Start New Chat")}
            data-testid="bottom-nav-new-chat"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        </div>

        {/* 4. Settings Center */}
        <button
          type="button"
          onClick={() => {
            safeVibrate("selection");
            onToggleSettings();
          }}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 rounded-xl transition-all cursor-pointer touch-target ${
            activeTab === "settings"
              ? "text-[var(--accent-b)] font-semibold"
              : "text-[var(--txt-muted)] hover:text-[var(--txt)]"
          }`}
            aria-label={uiText(language, "Settings")}
          data-testid="bottom-nav-settings"
        >
          <div className="relative">
            <Settings className="w-4 h-4" />
            {activeTab === "settings" && (
              <motion.span
                layoutId="bottom-nav-active-dot"
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent)] shadow-[0_0_6px_var(--accent)]"
                transition={getMotionTransition("feedback", prefersReducedMotion)}
              />
            )}
          </div>
          <span className="text-[10px] mt-0.5 tracking-tight">{uiText(language, "Settings")}</span>
        </button>

      </div>
    </nav>
  );
}
