"use client";

import React, { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { RadianceLogo } from "@/components/branding/logo";
import { AVAILABLE_MODELS } from "@/lib/ai/models";
import { ModelOption } from "@/lib/types/chat";
import { getMotionTransition } from "@/lib/motion/presets";
import { ChevronDown, Trash2, Cpu } from "lucide-react";
import { IconMenu2 } from "@tabler/icons-react";

interface TopbarProps {
  selectedModel: ModelOption;
  onSelectModel: (model: ModelOption) => void;
  language: "en" | "hi";
  onToggleLanguage: (lang: "en" | "hi") => void;
  onClearChat: () => void;
  onNewChat: () => void;
  onToggleMobileMenu?: () => void;
}

export function Topbar({
  selectedModel,
  onSelectModel,
  language,
  onToggleLanguage,
  onClearChat,
  onNewChat,
  onToggleMobileMenu,
}: TopbarProps) {
  const [modelDropdownOpen, setModelDropdownOpen] = useState(false);
  const prefersReducedMotion = useReducedMotion() ?? false;

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between gap-2 px-2.5 sm:px-4 py-2.5 bg-[var(--void)]/80 backdrop-blur-xl border-b border-[var(--border)] select-none shrink-0 w-full">
      {/* Left: Mobile Menu Toggle & Desktop Context Indicator */}
      <div className="flex items-center gap-2 sm:gap-3 min-w-0">
        {/* On Mobile: Hamburger button to open sidebar drawer */}
        {onToggleMobileMenu && (
          <button
            type="button"
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 rounded-xl border border-[var(--border)] text-[var(--txt-dim)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-colors"
            title="Open navigation menu"
            aria-label="Open navigation menu"
          >
            <IconMenu2 className="w-5 h-5" />
          </button>
        )}

        {/* On Mobile: Compact brand logo */}
        <div className="md:hidden">
            <RadianceLogo size="sm" onClick={onNewChat} showWordmark={false} />
        </div>

        {/* On Desktop: Clean Context Badge (Default Assistant) */}
        <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
          <span className="w-2 h-2 rounded-full bg-[var(--accent)] animate-pulse" />
          <span className="font-mono text-xs font-semibold text-[var(--txt)] tracking-wide">
            Default Assistant
          </span>
          <span className="font-mono text-[9px] uppercase tracking-widest px-1.5 py-0.2 rounded-full border border-[var(--accent)]/30 text-[var(--accent)] bg-[var(--accent-d)]">
            v1.0
          </span>
        </div>
      </div>

      {/* Right: Model Switcher, Language Toggle, & Clear Conversation */}
      <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
        {/* Model Switcher Dropdown */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setModelDropdownOpen(!modelDropdownOpen)}
            aria-expanded={modelDropdownOpen}
            aria-haspopup="listbox"
            className="flex items-center gap-1.5 sm:gap-2 max-w-[116px] sm:max-w-none px-2 sm:px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--border-hover)] text-xs font-mono text-[var(--txt-dim)] hover:text-[var(--txt)] transition-all touch-target whitespace-nowrap shrink"
          >
            <Cpu className="w-3.5 h-3.5 text-[var(--accent)]" />
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={selectedModel.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={getMotionTransition("feedback", prefersReducedMotion)}
                className="font-medium max-w-[60px] sm:max-w-none truncate whitespace-nowrap"
              >
                {selectedModel.name}
              </motion.span>
            </AnimatePresence>
            <ChevronDown
              className={`w-3 h-3 text-[var(--txt-muted)] transition-transform duration-200 ${
                modelDropdownOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          <AnimatePresence>
            {modelDropdownOpen && (
              <motion.button
                key="model-dropdown-dismiss"
                type="button"
                aria-label="Close model selector"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={getMotionTransition("feedback", prefersReducedMotion)}
                className="fixed inset-0 z-40 cursor-default"
                onClick={() => setModelDropdownOpen(false)}
              />
            )}
            {modelDropdownOpen && (
              <motion.div
                key="model-dropdown-panel"
                initial={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.98, y: prefersReducedMotion ? 0 : -4 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: prefersReducedMotion ? 1 : 0.98, y: prefersReducedMotion ? 0 : -4 }}
                transition={getMotionTransition("interaction", prefersReducedMotion)}
                className="absolute right-0 top-full mt-2 w-72 rounded-2xl bg-[var(--deep)]/95 backdrop-blur-2xl border border-[var(--border)] shadow-[0_20px_50px_rgba(0,0,0,0.7)] p-2 z-50 flex flex-col gap-1 glass-panel-raised"
              >
                <div className="px-3 py-1.5 text-[9px] font-mono uppercase tracking-widest text-[var(--txt-muted)] border-b border-[var(--border)] flex items-center justify-between">
                  <span>Frontier Inference Models</span>
                  <span className="text-[8px] text-[var(--accent)]">Multi-Provider</span>
                </div>
                <div className="flex flex-col gap-1 max-h-[320px] overflow-y-auto pt-1">
                  {AVAILABLE_MODELS.map((m) => {
                    const isSelected = m.id === selectedModel.id;
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          onSelectModel(m);
                          setModelDropdownOpen(false);
                        }}
                        className={`flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all ${
                          isSelected
                            ? "bg-[var(--accent-d)] border border-[var(--accent)] text-[var(--txt)] ring-1 ring-[var(--accent)]/40 shadow-sm"
                            : "hover:bg-[var(--surface-hover)] text-[var(--txt-dim)] border border-transparent"
                        }`}
                      >
                        <span className="text-base mt-0.5 shrink-0">{m.icon}</span>
                        <div className="flex flex-col flex-1 min-w-0">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold font-mono">{m.name}</span>
                            {isSelected && (
                              <span className="text-[10px] text-[var(--accent)] font-bold">✓</span>
                            )}
                          </div>
                          <span className="text-[10px] text-[var(--txt-muted)] truncate">{m.sub}</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Language Switcher */}
        <div className="flex rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--surface)] text-[10px] font-mono p-0.5">
          <button
            type="button"
            onClick={() => onToggleLanguage("en")}
            className={`px-2.5 py-1 rounded-lg transition-colors ${
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
            className={`px-2.5 py-1 rounded-lg transition-colors ${
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
          className="p-2 rounded-xl border border-[var(--border)] text-[var(--txt-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 hover:border-[var(--danger)]/30 transition-colors touch-target"
          title="Clear active conversation"
          aria-label="Clear active conversation"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
}
