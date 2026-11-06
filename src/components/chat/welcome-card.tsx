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
    flight: { bg: "bg-[#1e88e5] shadow-[0_0_8px_rgba(30,136,229,0.35)]", icon: <Plane className="w-2.5 h-2.5 text-white" /> },
    video: { bg: "bg-[#e53935] shadow-[0_0_8px_rgba(229,57,53,0.35)]", icon: <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" /> },
    getaway: { bg: "bg-[#2e7d32] shadow-[0_0_8px_rgba(46,125,50,0.35)]", icon: <Bed className="w-2.5 h-2.5 text-white" /> },
  } as const;

  function renderBadge(type: "flight" | "video" | "getaway") {
    const badge = BADGE_MAP[type];
    return (
      <span
        className={`w-4.5 h-4.5 rounded-full ${badge.bg} flex items-center justify-center shrink-0 border border-white/20`}
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
      {/* Brand Icon Gem with Dynamic Ambient Glow */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center border border-[var(--border)] shadow-card transition-all duration-300 hover:scale-105 select-none hover:border-[var(--accent)]/40 hover:shadow-[0_8px_24px_var(--accent-d)] p-3 text-[var(--txt)]"
        style={{
          background: "linear-gradient(135deg, var(--surface-raised), rgba(255, 255, 255, 0.02))",
        }}
      >
        <RadianceLogo variant="symbol" size="lg" showWordmark={false} animated glow className="w-10 h-9" />
      </div>

      {/* Hero Title (Signature TanixAI Cormorant Garamond + 3-Stop Chromatic Gradient) */}
      <div className="flex flex-col gap-2.5">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-[var(--txt)] tracking-tight leading-tight select-none">
          Hello, I Am <em className="not-italic font-bold gradient-text-brand drop-shadow-sm">{titleName}</em>
        </h1>
        <p className="text-sm md:text-base text-[var(--txt-dim)] font-light max-w-lg leading-relaxed mx-auto font-sans">
          {description}
        </p>
      </div>

      {/* Dynamic Subtitle matched with Background Atmosphere */}
      <div className="w-full max-w-3xl flex flex-col items-start mt-2">
        <p className="text-sm sm:text-base text-[var(--txt)] font-medium text-left drop-shadow-[0_2px_12px_rgba(0,0,0,0.9)] flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block animate-pulse shrink-0 shadow-[0_0_8px_var(--accent)]"
            style={{ backgroundColor: "var(--accent)" }}
            aria-hidden="true"
          />
          Tell me what’s on your mind, or pick a suggestion.
        </p>
      </div>

      {/* 3-Column Suggestions Architecture automatically harmonized with Theme & Palette */}
      <div
        data-testid="prompt-categories"
        className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 text-left"
      >
        {SUGGESTION_COLUMNS.map((column) => (
          <div
            key={column.id}
            className="group/card flex flex-col items-start p-4 sm:p-5 rounded-3xl border transition-all duration-300 hover:border-[var(--accent)]/40 hover:shadow-[0_16px_48px_-8px_var(--accent-d)]"
            style={{
              background:
                "linear-gradient(180deg, var(--user-bg, rgba(255, 255, 255, 0.04)) 0%, rgba(10, 9, 16, 0.82) 100%)",
              backdropFilter: "blur(24px)",
              WebkitBackdropFilter: "blur(24px)",
              borderColor: "var(--border)",
              boxShadow:
                "0 20px 48px -12px rgba(0, 0, 0, 0.7), 0 0 0 1px var(--border), 0 1px 0 0 rgba(255, 255, 255, 0.08) inset",
            }}
          >
            <h2
              className="font-sans text-xl font-semibold tracking-tight mb-3.5 transition-all duration-300 drop-shadow-sm"
              style={getHeaderStyle(column.headerThemeRole)}
            >
              {column.title}
            </h2>
            <div className="flex flex-col items-start gap-2.5 w-full">
              {column.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectPrompt(item.prompt)}
                  className="group/btn w-fit max-w-full inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-full border transition-all duration-200 cursor-pointer shadow-sm active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  style={{
                    backgroundColor: "rgba(255, 255, 255, 0.05)",
                    borderColor: "rgba(255, 255, 255, 0.08)",
                    backdropFilter: "blur(8px)",
                    WebkitBackdropFilter: "blur(8px)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = "var(--accent-d)";
                    e.currentTarget.style.borderColor = "var(--border-accent)";
                    e.currentTarget.style.boxShadow = "0 4px 16px var(--accent-d)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                    e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.08)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                  aria-label={`Ask suggestion: ${item.label}`}
                >
                  {item.badge && renderBadge(item.badge.type)}
                  <span className="truncate text-xs sm:text-[13px] text-[#ededed] group-hover/btn:text-[var(--txt)] font-normal transition-colors">
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
