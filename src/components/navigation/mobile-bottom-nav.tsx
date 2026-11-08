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

export interface MobileBottomNavProps {
  activeTab?: "chat" | "history" | "settings";
  onNewChat: () => void;
  onToggleHistory: () => void;
  onToggleSettings: () => void;
  onFocusChat?: () => void;
  isComposerFocused?: boolean;
}

export function MobileBottomNav({
  activeTab = "chat",
  onNewChat,
  onToggleHistory,
  onToggleSettings,
  onFocusChat,
  isComposerFocused = false,
}: MobileBottomNavProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  // When composer is focused on mobile (virtual keyboard active), hide bottom nav so composer has 100% space
  if (isComposerFocused) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile Navigation"
      role="navigation"
      className="md:hidden shrink-0 z-30 w-full bg-[var(--void)]/90 backdrop-blur-2xl border-t border-[var(--border)] px-2 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-1 select-none transition-all duration-200"
    >
      <div className="flex items-center justify-around max-w-md mx-auto h-[50px] relative">
        {/* 1. Chat Workspace */}
        <button
          type="button"
          onClick={onFocusChat}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 rounded-xl transition-all cursor-pointer touch-target ${
            activeTab === "chat"
              ? "text-[var(--accent-b)] font-semibold"
              : "text-[var(--txt-muted)] hover:text-[var(--txt)]"
          }`}
          aria-label="Chat Workspace"
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
          <span className="text-[10px] mt-0.5 tracking-tight">Chat</span>
        </button>

        {/* 2. History */}
        <button
          type="button"
          onClick={onToggleHistory}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 rounded-xl transition-all cursor-pointer touch-target ${
            activeTab === "history"
              ? "text-[var(--accent-b)] font-semibold"
              : "text-[var(--txt-muted)] hover:text-[var(--txt)]"
          }`}
          aria-label="Conversation History"
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
          <span className="text-[10px] mt-0.5 tracking-tight">History</span>
        </button>

        {/* 3. Center New Chat Primary Action Button (Thumb Hero) */}
        <div className="flex-1 flex items-center justify-center">
          <motion.button
            type="button"
            whileTap={prefersReducedMotion ? undefined : { scale: 0.92 }}
            whileHover={prefersReducedMotion ? undefined : { scale: 1.05 }}
            transition={{ type: "spring", stiffness: 450, damping: 22 }}
            onClick={onNewChat}
            className="w-10 h-10 -mt-2 rounded-2xl bg-gradient-to-tr from-[var(--accent)] via-[var(--accent-b)] to-[var(--accent-c)] text-[var(--void)] shadow-[0_4px_16px_var(--accent-g)] flex items-center justify-center font-bold touch-target cursor-pointer border border-white/20 active:brightness-90"
            aria-label="Start New Chat"
            data-testid="bottom-nav-new-chat"
          >
            <Plus className="w-5 h-5 stroke-[2.5]" />
          </motion.button>
        </div>

        {/* 4. Settings Center */}
        <button
          type="button"
          onClick={onToggleSettings}
          className={`flex-1 flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 rounded-xl transition-all cursor-pointer touch-target ${
            activeTab === "settings"
              ? "text-[var(--accent-b)] font-semibold"
              : "text-[var(--txt-muted)] hover:text-[var(--txt)]"
          }`}
            aria-label="Settings"
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
          <span className="text-[10px] mt-0.5 tracking-tight">Settings</span>
        </button>

      </div>
    </nav>
  );
}
