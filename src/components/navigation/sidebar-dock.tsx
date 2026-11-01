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
import { motion } from "motion/react";

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

  const mainLinks: SidebarLinkItem[] = [
    {
      label: "New Chat",
      icon: (
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[var(--accent-b)] to-[var(--accent)] text-[var(--void)] flex items-center justify-center shadow-[0_0_15px_var(--accent-g)] shrink-0">
          <IconPlus className="w-4 h-4 stroke-[2.5]" />
        </div>
      ),
      onClick: onNewChat,
    },
    {
      label: "History",
      icon: <IconHistory className="w-5 h-5 shrink-0" />,
      onClick: onToggleHistory,
      badge: "Ctrl+L",
    },

    {
      label: "Shortcuts",
      icon: <IconCommand className="w-5 h-5 shrink-0" />,
      onClick: onOpenShortcuts,
      badge: "Ctrl+K",
    },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-6">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Logo Header - Unified Brand Anchor */}
          <div className="py-2 mb-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onNewChat}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-b)] flex items-center justify-center text-[var(--void)] font-serif font-black text-xs shrink-0 shadow-[0_0_15px_var(--accent-g)] hover:scale-105 transition-transform"
              title="Radiance (New Chat)"
              aria-label="Radiance home"
            >
              RD
            </button>
            <motion.div
              animate={{
                display: open ? "flex" : "none",
                opacity: open ? 1 : 0,
              }}
              className="flex flex-col"
            >
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-[var(--txt)] tracking-wider">
                  RADIANCE
                </span>
                <span className="font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.2 rounded-full border border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent-d)]">
                  v1.0
                </span>
              </div>
              <span className="font-mono text-[9px] uppercase tracking-widest text-[var(--accent)]">
                AI Platform
              </span>
            </motion.div>
          </div>

          <div className="h-[1px] bg-[var(--border)] my-2" />

          {/* Primary Action Links */}
          <div className="flex flex-col gap-1.5">
            {mainLinks.map((link, idx) => (
              <SidebarLink key={idx} link={link} />
            ))}
          </div>
        </div>

        {/* Bottom Profile Anchor */}
        <div className="pt-2 border-t border-[var(--border)]">
          <SidebarLink
            link={{
              label: "Radiance Session",
              href: "#",
              icon: (
                <div className="w-8 h-8 rounded-full bg-[var(--accent-d)] border border-[var(--accent)]/40 text-[var(--accent)] flex items-center justify-center font-mono font-bold text-xs shrink-0 shadow-[0_0_10px_var(--accent-d)]">
                  R
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
