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
  IconSettings,
} from "@tabler/icons-react";
import { motion, useReducedMotion } from "motion/react";
import { RadianceLogo } from "@/components/branding/radiance-logo";
import { cn } from "@/lib/utils/cn";
import { APP_VERSION } from "@/lib/app-info";

interface SidebarDockProps {
  onNewChat: () => void;
  onToggleHistory: () => void;
  onToggleSettings: (section?: string) => void;
  settingsActive?: boolean;
  activeSettingsSection?: string;
  open?: boolean;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SidebarDock({
  onNewChat,
  onToggleHistory,
  onToggleSettings,
  settingsActive = false,
  activeSettingsSection = "general",
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
        <div className="w-5 h-5 flex items-center justify-center text-[var(--accent-b)] group-hover/sidebar:rotate-90 transition-transform duration-300">
          <IconPlus className="w-4 h-4 stroke-[2.4]" />
        </div>
      ),
      onClick: () => handleAction(onNewChat),
      badge: "Ctrl+N",
    },
    {
      label: "History",
      icon: (
        <div className="w-5 h-5 flex items-center justify-center text-[var(--txt-muted)] group-hover/sidebar:text-[var(--accent-b)] transition-colors">
          <IconHistory className="w-4 h-4 stroke-[1.8]" />
        </div>
      ),
      onClick: () => handleAction(onToggleHistory),
      badge: "Ctrl+L",
    },
    {
      label: "Personalization",
      icon: (
        <div className="w-5 h-5 flex items-center justify-center text-[var(--txt-muted)] group-hover/sidebar:text-[var(--accent-b)] transition-colors">
          <IconAdjustmentsHorizontal className="w-4 h-4 stroke-[1.8]" />
        </div>
      ),
      onClick: () => handleAction(() => onToggleSettings("personalization")),
      active: settingsActive && activeSettingsSection === "personalization",
    },
    {
      label: "Settings",
      icon: (
        <div className="w-5 h-5 flex items-center justify-center text-[var(--txt-muted)] group-hover/sidebar:text-[var(--accent-b)] transition-colors">
          <IconSettings className="w-4 h-4 stroke-[1.8]" />
        </div>
      ),
      onClick: () => handleAction(() => onToggleSettings("general")),
      active: settingsActive && activeSettingsSection !== "personalization",
    },
  ];

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
                <div className="flex items-center gap-2">
                  <span className="font-serif font-bold text-sm text-[var(--txt)] tracking-[0.14em]">
                    RADIANCE
                  </span>
                  <span className="flex items-center gap-1 font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border border-[var(--accent)]/30 text-[var(--accent-b)] bg-[var(--accent-d)]/60 shadow-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                    v{APP_VERSION}
                  </span>
                </div>
                <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-[var(--accent-b)]/80 mt-0.5">
                  AI Platform
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
