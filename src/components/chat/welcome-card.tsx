"use client";

import React from "react";
import { Plane, Play, Bed } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { getMotionTransition } from "@/lib/motion/presets";
import { RadianceLogo } from "@/components/branding/radiance-logo";

export interface SuggestionItem {
  id: string;
  label: string;
  prompt: string;
  badge?: {
    type: "flight" | "video" | "getaway";
  };
}

export interface SuggestionColumn {
  id: string;
  title: string;
  headerThemeRole: "accentB" | "gradient" | "accentC";
  items: SuggestionItem[];
}

export const SUGGESTION_COLUMNS: SuggestionColumn[] = [
  {
    id: "understand",
    title: "Understand",
    headerThemeRole: "accentB",
    items: [
      {
        id: "char-book",
        label: "character from a book",
        prompt: "Describe a complex character from a book and analyze their psychological motivations.",
      },
      {
        id: "pack",
        label: "pack accordingly",
        prompt: "Help me pack accordingly for an upcoming trip with a comprehensive weather-aware checklist.",
        badge: {
          type: "flight",
        },
      },
      {
        id: "research",
        label: "research a topic",
        prompt: "Help me research an in-depth topic, synthesizing key perspectives, findings, and nuances.",
        badge: {
          type: "video",
        },
      },
    ],
  },
  {
    id: "create",
    title: "Create",
    headerThemeRole: "gradient",
    items: [
      {
        id: "job-negotiation",
        label: "job negotiation and accept...",
        prompt: "Draft a high-leverage job offer negotiation script and formal acceptance letter.",
      },
      {
        id: "game-night",
        label: "game night planning",
        prompt: "Plan an engaging, memorable game night with friends including games, food, and timeline.",
      },
      {
        id: "ooo-message",
        label: "out-of-office message",
        prompt: "Write a professional, clear, and friendly out-of-office email autoresponder.",
      },
    ],
  },
  {
    id: "explore",
    title: "Explore",
    headerThemeRole: "accentC",
    items: [
      {
        id: "getaway",
        label: "spring getaway",
        prompt: "Suggest curated spring getaway destinations with a 3-day itinerary and budget breakdown.",
        badge: {
          type: "getaway",
        },
      },
      {
        id: "plant-care",
        label: "plant care tips",
        prompt: "Share essential indoor houseplant care tips for watering, lighting, and repotting.",
      },
      {
        id: "cooking",
        label: "cooking trends",
        prompt: "What are the most innovative cooking trends, culinary techniques, and viral recipes right now?",
      },
    ],
  },
];

interface WelcomeCardProps {
  onSelectPrompt: (prompt: string) => void;
}

export function WelcomeCard({ onSelectPrompt }: WelcomeCardProps) {
  const prefersReducedMotion = useReducedMotion() ?? false;

  const titleName = "Radiance";
  const description =
    "Illuminate what is possible. Stream real-time reasoning, analyze documents, generate Flux visuals, and explore complex ideas.";

  function getHeaderStyle(role: "accentB" | "gradient" | "accentC"): React.CSSProperties {
    if (role === "accentB") return { color: "var(--accent-b)" };
    if (role === "accentC") return { color: "var(--accent-c)" };
    return {
      backgroundImage: "var(--text-gradient)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      color: "var(--accent)",
    };
  }

  const BADGE_MAP = {
    flight: { bg: "bg-white/[0.08] text-[var(--accent-c)] border-white/10", icon: <Plane className="w-2.5 h-2.5 text-current" /> },
    video: { bg: "bg-white/[0.08] text-[var(--accent)] border-white/10", icon: <Play className="w-2.5 h-2.5 text-current fill-current ml-0.5" /> },
    getaway: { bg: "bg-white/[0.08] text-[var(--accent-b)] border-white/10", icon: <Bed className="w-2.5 h-2.5 text-current" /> },
  } as const;

  function renderBadge(type: "flight" | "video" | "getaway") {
    const badge = BADGE_MAP[type];
    return (
      <span
        className={`w-4 h-4 rounded-md ${badge.bg} flex items-center justify-center shrink-0 border`}
        aria-hidden="true"
      >
        {badge.icon}
      </span>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={getMotionTransition("entrance", prefersReducedMotion)}
      className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-8 text-center gap-6"
    >
      {/* 35mm CinemaScope Studio Indicator */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-white/10 bg-white/[0.03] backdrop-blur-md text-[10px] font-mono tracking-widest text-[var(--txt-muted)] uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
        <span>Aurora Nights · Arctic Atmosphere</span>
      </div>

      {/* Brand Icon Gem with Cinematic Framing */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center border border-white/[0.09] shadow-card transition-all duration-300 hover:scale-105 select-none hover:border-[var(--accent)]/40 p-3 text-[var(--txt)]"
        style={{
          background: "linear-gradient(135deg, var(--surface-raised), rgba(255, 255, 255, 0.02))",
        }}
      >
        <RadianceLogo variant="symbol" size="lg" showWordmark={false} animated glow className="w-10 h-9" />
      </div>

      {/* Hero Title (Editorial Serif + Signature Chromatic Flare) */}
      <div className="flex flex-col gap-2.5">
        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl font-light text-[var(--txt)] tracking-tight leading-tight select-none">
          Hello, I Am <em className="not-italic font-medium gradient-text-brand drop-shadow-sm">{titleName}</em>
        </h1>
        <p className="text-sm md:text-base text-[var(--txt-dim)] font-light max-w-lg leading-relaxed mx-auto font-sans">
          {description}
        </p>
      </div>

      {/* Dynamic Subtitle matched with Background Atmosphere */}
      <div className="w-full max-w-3xl flex items-center justify-between mt-1 px-1">
        <p className="text-xs sm:text-sm text-[var(--txt-dim)] font-medium text-left flex items-center gap-2 font-mono">
          <span
            className="w-1.5 h-1.5 rounded-full inline-block animate-pulse shrink-0 shadow-[0_0_8px_var(--accent)]"
            style={{ backgroundColor: "var(--accent)" }}
            aria-hidden="true"
          />
          Select a prompt beat or enter your query:
        </p>
        <span className="hidden sm:inline-block text-[10px] font-mono text-[var(--txt-muted)] tracking-wider">
          [PROMPT ARCHITECTURE]
        </span>
      </div>

      {/* 3-Column Suggestions Architecture automatically harmonized with Theme & Palette */}
      <div
        data-testid="prompt-categories"
        className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 text-left"
      >
        {SUGGESTION_COLUMNS.map((column) => (
          <div
            key={column.id}
            className="group/card flex flex-col items-start p-4 sm:p-5 rounded-2xl border transition-all duration-300 hover:border-white/20"
            style={{
              background:
                "linear-gradient(180deg, rgba(16, 14, 24, 0.75) 0%, rgba(8, 7, 13, 0.88) 100%)",
              backdropFilter: "blur(20px)",
              WebkitBackdropFilter: "blur(20px)",
              borderColor: "var(--border)",
              boxShadow: "0 8px 32px -8px rgba(0, 0, 0, 0.7), 0 1px 0 0 rgba(255, 255, 255, 0.05) inset",
            }}
          >
            <div className="flex items-center justify-between w-full mb-3.5 border-b border-white/[0.06] pb-2">
              <h2
                className="font-serif text-lg font-normal tracking-wide transition-all duration-300"
                style={getHeaderStyle(column.headerThemeRole)}
              >
                {column.title}
              </h2>
              <span className="text-[9px] font-mono uppercase tracking-widest text-[var(--txt-muted)]">
                {column.id}
              </span>
            </div>
            <div className="flex flex-col items-start gap-2 w-full">
              {column.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectPrompt(item.prompt)}
                  className="group/btn w-full inline-flex items-center gap-2 px-3.5 py-2.5 min-h-[44px] rounded-xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.06] hover:border-white/15 transition-all duration-200 cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] touch-target text-left"
                  aria-label={`Ask suggestion: ${item.label}`}
                >
                  {item.badge && renderBadge(item.badge.type)}
                  <span className="truncate text-xs sm:text-[13px] text-[var(--txt-dim)] group-hover/btn:text-[var(--txt)] font-normal transition-colors">
                    {item.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
