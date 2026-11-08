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
  IconAdjustmentsHorizontal,
  IconCommand,
} from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { RadianceLogo } from "@/components/branding/radiance-logo";
import { getMotionTransition } from "@/lib/motion/presets";

interface SidebarDockProps {
  onNewChat: () => void;
  onToggleHistory: () => void;
  onToggleSettings: () => void;
  onOpenShortcuts: () => void;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SidebarDock({
  onNewChat,
  onToggleHistory,
  onToggleSettings,
  onOpenShortcuts,
  open: controlledOpen,
  setOpen: controlledSetOpen,
}: SidebarDockProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = controlledSetOpen !== undefined ? controlledSetOpen : setInternalOpen;
  const prefersReducedMotion = useReducedMotion() ?? false;

  const handleAction = (action: () => void) => {
    action();
    if (open) {
      setOpen(false);
    }
  };

  const mainLinks: SidebarLinkItem[] = [
    {
      label: "New Chat",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[var(--accent)] via-[var(--accent-b)] to-[var(--accent-c)] text-[var(--void)] flex items-center justify-center shadow-[0_0_14px_var(--accent-g)] shrink-0 group-hover/sidebar:rotate-90 transition-transform duration-300">
          <IconPlus className="w-4 h-4 stroke-[2.5]" />
        </div>
      ),
      onClick: () => handleAction(onNewChat),
      badge: "Ctrl+N",
    },
    {
      label: "History",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-[var(--surface)]/80 border border-white/[0.08] text-[var(--txt-muted)] group-hover/sidebar:text-[var(--accent-b)] group-hover/sidebar:bg-[var(--surface-hover)] group-hover/sidebar:border-[var(--border-accent)] flex items-center justify-center shrink-0 transition-all duration-200 shadow-xs">
          <IconHistory className="w-4 h-4" />
        </div>
      ),
      onClick: () => handleAction(onToggleHistory),
      badge: "Ctrl+L",
    },
    {
      label: "Personalization",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-[var(--surface)]/80 border border-white/[0.08] text-[var(--txt-muted)] group-hover/sidebar:text-[var(--accent-b)] group-hover/sidebar:bg-[var(--surface-hover)] group-hover/sidebar:border-[var(--border-accent)] flex items-center justify-center shrink-0 transition-all duration-200 shadow-xs">
          <IconAdjustmentsHorizontal className="w-4 h-4" />
        </div>
      ),
      onClick: () => handleAction(onToggleSettings),
    },
    {
      label: "Shortcuts",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-[var(--surface)]/80 border border-white/[0.08] text-[var(--txt-muted)] group-hover/sidebar:text-[var(--accent-b)] group-hover/sidebar:bg-[var(--surface-hover)] group-hover/sidebar:border-[var(--border-accent)] flex items-center justify-center shrink-0 transition-all duration-200 shadow-xs">
          <IconCommand className="w-4 h-4" />
        </div>
      ),
      onClick: () => handleAction(onOpenShortcuts),
      badge: "Ctrl+K",
    },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-6">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Logo Header - Unified Brand Anchor */}
          <div className="py-1 mb-1.5 flex items-center gap-3">
            <motion.button
              type="button"
              onClick={onNewChat}
              whileHover={prefersReducedMotion ? undefined : { scale: 1.05, rotate: 2 }}
              whileTap={prefersReducedMotion ? undefined : { scale: 0.95 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              className="w-9 h-9 rounded-xl bg-gradient-to-br from-[var(--surface-raised)] to-[var(--deep)] border border-white/[0.12] flex items-center justify-center text-[var(--txt)] shrink-0 shadow-sm hover:border-[var(--border-accent)] hover:shadow-[0_0_16px_var(--accent-g)] transition-all p-1.5 cursor-pointer"
              title="Radiance (New Chat)"
              aria-label="Radiance home"
            >
              <RadianceLogo variant="symbol" size="sm" showWordmark={false} className="w-5 h-5 text-[var(--txt)]" />
            </motion.button>
            <motion.div
              animate={{
                display: open ? "flex" : "none",
                opacity: open ? 1 : 0,
                x: open ? 0 : -8,
              }}
              transition={getMotionTransition("feedback", prefersReducedMotion)}
              className="flex flex-col min-w-0"
            >
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-[var(--txt)] tracking-[0.12em]">
                  RADIANCE
                </span>
                <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--accent)]/30 text-[var(--accent-b)] bg-[var(--accent-d)]/60 shadow-xs">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                  v1.0
                </span>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--accent-b)]/80 mt-0.5">
                AI Platform
              </span>
            </motion.div>
          </div>

          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent my-2.5" />

          {/* Primary Action Links */}
          <div className="flex flex-col gap-1.5">
            {mainLinks.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>

        {/* Bottom Profile Anchor */}
        <div className="pt-2.5">
          <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/[0.12] to-transparent mb-2.5" />
          <SidebarLink
            link={{
              label: "Radiance Session",
              href: "#",
              icon: (
                <div className="relative w-8 h-8 rounded-full bg-gradient-to-br from-[var(--surface-raised)] to-[var(--deep)] border border-[var(--accent)]/40 text-[var(--accent-b)] flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-[0_0_12px_var(--accent-g)]">
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
