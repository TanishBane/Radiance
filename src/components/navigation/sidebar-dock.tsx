"use client";

import React, { useState } from "react";
import {
  Sidebar,
  SidebarBody,
  SidebarLink,
  SidebarLinkItem,
} from "@/components/ui/sidebar";
import {
  IconPlus,
  IconHistory,
  IconSettings,
} from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { RadianceLogo } from "@/components/branding/radiance-logo";
import { cn } from "@/lib/utils/cn";
import { uiText, type UiLanguage } from "@/lib/i18n/ui";
import type { Conversation } from "@/lib/types/chat";

interface SidebarDockProps {
  language?: UiLanguage;
  onNewChat: () => void;
  onToggleHistory: () => void;
  onToggleSettings: (section?: string) => void;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  isConversationHistoryLoaded: boolean;
  settingsActive?: boolean;
  historyActive?: boolean;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SidebarDock({
  language = "en",
  onNewChat,
  onToggleHistory,
  onToggleSettings,
  conversations,
  activeConversationId,
  onSelectConversation,
  isConversationHistoryLoaded,
  settingsActive = false,
  historyActive = false,
  open: controlledOpen,
  setOpen: controlledSetOpen,
}: SidebarDockProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledSetOpen !== undefined ? controlledSetOpen : setInternalOpen;
  const prefersReducedMotion = useReducedMotion() ?? false;
  const recentConversations = [...conversations]
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 10);

  const handleAction = (action: () => void) => {
    action();
    if (open) {
      setOpen(false);
    }
  };

  const mainLinks: SidebarLinkItem[] = [
    {
      label: uiText(language, "New Chat"),
      icon: (
        <div className="w-5 h-5 flex items-center justify-center text-[var(--accent-b)] group-hover/sidebar:rotate-90 transition-transform duration-300">
          <IconPlus className="w-4 h-4 stroke-[2.4]" />
        </div>
      ),
      onClick: () => handleAction(onNewChat),
      badge: "Ctrl+N",
    },
    {
      label: uiText(language, "History"),
      icon: (
        <div className="w-5 h-5 flex items-center justify-center text-[var(--txt-muted)] group-hover/sidebar:text-[var(--accent-b)] transition-colors">
          <IconHistory className="w-4 h-4 stroke-[1.8]" />
        </div>
      ),
      onClick: () => handleAction(onToggleHistory),
      badge: "Ctrl+L",
      active: historyActive,
    },
  ];
  const settingsLink: SidebarLinkItem = {
    label: uiText(language, "Settings"),
    icon: (
      <div className="w-5 h-5 flex items-center justify-center text-[var(--txt-muted)] group-hover/sidebar:text-[var(--accent-b)] transition-colors">
        <IconSettings className="w-4 h-4 stroke-[1.8]" />
      </div>
    ),
    onClick: () => handleAction(() => onToggleSettings("general")),
    active: settingsActive,
  };

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-6">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Logo Header - Unified Brand Anchor */}
          <div className={cn("py-1 mb-2 flex items-center", open ? "gap-3 px-1" : "justify-center")}>
            <motion.button
              type="button"
              onClick={onNewChat}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05, rotate: 2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-10 h-10 rounded-xl bg-[var(--surface-raised)] hover:bg-[var(--surface-hover)] border border-white/[0.10] hover:border-[var(--border-accent)] flex items-center justify-center text-[var(--txt)] shrink-0 shadow-xs hover:shadow-[0_0_16px_var(--accent-g)] transition-all cursor-pointer"
              title="Radiance (New Chat)"
              aria-label="Radiance home"
            >
              <RadianceLogo variant="symbol" size="sm" showWordmark={false} className="w-5 h-5 text-[var(--txt)]" />
            </motion.button>
            {open && (
              <motion.div
                initial={prefersReducedMotion ? undefined : { opacity: 0, x: -6 }}
                animate={{ opacity: 1, x: 0 }}
                exit={prefersReducedMotion ? undefined : { opacity: 0, x: -6 }}
                transition={{ duration: 0.15, ease: "easeOut" }}
                className="flex flex-col min-w-0"
              >
                <div className="flex items-center">
                  <span className="font-serif font-semibold text-sm text-[var(--txt)] tracking-[0.16em] leading-none">
                    RADIANCE
                  </span>
                </div>
                <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.06em] text-[var(--accent-b)] mt-1">
                  AI PLATFORM
                </span>
              </motion.div>
            )}
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.10] to-transparent my-2" />

          {/* Primary Action Links */}
          <div className="flex flex-col gap-1.5">
            {mainLinks.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>

          {open && (
            <section aria-labelledby="sidebar-recents-heading" className="mt-5 min-w-0">
              <h2
                id="sidebar-recents-heading"
                className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[var(--txt-muted)]"
              >
                {uiText(language, "Recents")}
              </h2>
              {recentConversations.length > 0 ? (
                <ul className="flex min-w-0 flex-col gap-1">
                  {recentConversations.map((conversation) => {
                    const isActive = conversation.id === activeConversationId;
                    const title = conversation.title.trim() || uiText(language, "New Chat");

                    return (
                      <li key={conversation.id} className="min-w-0">
                        <button
                          type="button"
                          title={title}
                          aria-label={title}
                          aria-current={isActive ? "page" : undefined}
                          onClick={() => handleAction(() => onSelectConversation(conversation.id))}
                          className={cn(
                            "flex min-h-9 w-full min-w-0 items-center rounded-lg border px-3 text-left text-[13px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-b)]",
                            isActive
                              ? "border-[var(--border-accent)] bg-[var(--accent-d)] text-[var(--txt)]"
                              : "border-transparent text-[var(--txt-muted)] hover:border-white/[0.08] hover:bg-[var(--surface-hover)] hover:text-[var(--txt)]"
                          )}
                        >
                          <span className="truncate">{title}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              ) : (
                <p className="px-3 py-2 text-xs text-[var(--txt-muted)]">
                  {uiText(language, isConversationHistoryLoaded ? "No recent chats yet." : "Loading chats…")}
                </p>
              )}
            </section>
          )}

          <div className="mt-4 flex flex-col gap-1.5">
            <SidebarLink link={settingsLink} />
          </div>
        </div>

        {/* Bottom Profile Anchor */}
        <div className="pt-2">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.10] to-transparent mb-2.5" />
          <SidebarLink
            link={{
              label: "Radiance Session",
              href: "#",
              icon: (
                <div className="relative w-7 h-7 rounded-full bg-gradient-to-br from-[var(--surface-raised)] to-[var(--deep)] border border-[var(--accent)]/40 text-[var(--accent-b)] flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-sm">
                  <span>R</span>
                  <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 border border-[var(--deep)] shadow-xs animate-pulse" />
                </div>
              ),
              badge: "Local",
            }}
          />
        </div>
      </SidebarBody>
    </Sidebar>
  );
}
