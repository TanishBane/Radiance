"use client";

import {
  History,
  MessageSquare,
  Plus,
  Settings,
} from "lucide-react";
import { LiquidNavbar, type LiquidNavItem } from "@/components/ui/liquid-glass-navbar";
import { uiText, type UiLanguage } from "@/lib/i18n/ui";

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
  if (isComposerFocused) return null;

  const items: LiquidNavItem[] = [
    { label: uiText(language, "Chat"), icon: <MessageSquare aria-hidden="true" />, fx: "glow" },
    { label: uiText(language, "History"), icon: <History aria-hidden="true" />, fx: "wave" },
    { label: uiText(language, "Start New Chat"), icon: <Plus aria-hidden="true" />, fx: "pop" },
    { label: uiText(language, "Settings"), icon: <Settings aria-hidden="true" />, fx: "spin" },
  ];
  const activeIndex = activeTab === "history" ? 1 : activeTab === "settings" ? 3 : 0;

  return (
    <div className="md:hidden flex shrink-0 justify-center border-t border-[var(--border)] bg-[var(--void)]/80 px-3 pb-[max(0.5rem,env(safe-area-inset-bottom,0px))] pt-1 backdrop-blur-2xl">
      <LiquidNavbar
        items={items}
        active={activeIndex}
        tone="dark"
        sound={false}
        ariaLabel={uiText(language, "Mobile Navigation")}
        className="w-full max-w-md"
        style={{ width: "min(100%, 28rem)" }}
        onChange={(index) => {
          if (index === 0) onFocusChat?.();
          else if (index === 1) onToggleHistory();
          else if (index === 2) onNewChat();
          else if (index === 3) onToggleSettings();
        }}
      />
    </div>
  );
}
