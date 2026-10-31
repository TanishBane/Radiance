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
  IconSparkles,
  IconUser,
  IconSchool,
  IconDownload,
} from "@tabler/icons-react";
import { PersonaMode } from "@/lib/types/chat";
import { motion } from "motion/react";

interface SidebarDockProps {
  onNewChat: () => void;
  onToggleHistory: () => void;
  onToggleSettings: () => void;
  onOpenShortcuts: () => void;
  onOpenLegacyImport?: () => void;
  currentMode: PersonaMode;
  onSelectMode: (mode: PersonaMode) => void;
}

export function SidebarDock({
  onNewChat,
  onToggleHistory,
  onToggleSettings,
  onOpenShortcuts,
  onOpenLegacyImport,
  currentMode,
  onSelectMode,
}: SidebarDockProps) {
  const [open, setOpen] = useState(false);

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
      label: "Personalization",
      icon: <IconAdjustmentsHorizontal className="w-5 h-5 shrink-0" />,
      onClick: onToggleSettings,
    },
    {
      label: "Shortcuts",
      icon: <IconCommand className="w-5 h-5 shrink-0" />,
      onClick: onOpenShortcuts,
      badge: "Ctrl+K",
    },
  ];

  if (onOpenLegacyImport) {
    mainLinks.push({
      label: "Import Legacy Data",
      icon: <IconDownload className="w-5 h-5 shrink-0" />,
      onClick: onOpenLegacyImport,
    });
  }

  const modeLinks: SidebarLinkItem[] = [
    {
      label: "Default Assistant",
      icon: <IconSparkles className="w-4 h-4 shrink-0" />,
      active: currentMode === "default",
      onClick: () => onSelectMode("default"),
    },
    {
      label: "Portfolio Profile",
      icon: <IconUser className="w-4 h-4 shrink-0" />,
      active: currentMode === "portfolio",
      onClick: () => onSelectMode("portfolio"),
    },
    {
      label: "Mumbai Student",
      icon: <IconSchool className="w-4 h-4 shrink-0" />,
      active: currentMode === "student",
      onClick: () => onSelectMode("student"),
    },
  ];

  return (
    <Sidebar open={open} setOpen={setOpen}>
      <SidebarBody className="justify-between gap-6">
        <div className="flex flex-1 flex-col overflow-x-hidden overflow-y-auto">
          {/* Logo Header */}
          <div className="py-2 mb-2 flex items-center gap-3">
            <button
              onClick={onNewChat}
              className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-b)] flex items-center justify-center text-[var(--void)] font-serif font-black text-sm shrink-0 shadow-[0_0_15px_var(--accent-g)]"
              title="Radiance"
            >
              ✦
            </button>
            <motion.div
              animate={{
                display: open ? "flex" : "none",
                opacity: open ? 1 : 0,
              }}
              className="flex flex-col"
            >
              <span className="font-serif font-bold text-sm text-[var(--txt)] tracking-wider">
                RADIANCE
              </span>
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

          <div className="h-[1px] bg-[var(--border)] my-3" />

          {/* Persona Modes Label (when expanded) */}
          <motion.div
            animate={{
              display: open ? "block" : "none",
              opacity: open ? 1 : 0,
            }}
            className="px-2 py-1 text-[9px] font-mono uppercase tracking-widest text-[var(--txt-muted)]"
          >
            Persona Modes
          </motion.div>

          {/* Persona Mode Links */}
          <div className="flex flex-col gap-1">
            {modeLinks.map((link, idx) => (
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
