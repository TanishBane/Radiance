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

  function getHeaderStyle(_role: "accentB" | "gradient" | "accentC"): React.CSSProperties {
    return {
      color: "var(--txt)",
    };
  }

  const BADGE_MAP = {
    flight: { bg: "bg-[var(--surface-raised)] text-[var(--accent-c)] border-[var(--border)]", icon: <Plane className="w-2.5 h-2.5 text-current" /> },
    video: { bg: "bg-[var(--surface-raised)] text-[var(--accent)] border-[var(--border)]", icon: <Play className="w-2.5 h-2.5 text-current fill-current ml-0.5" /> },
    getaway: { bg: "bg-[var(--surface-raised)] text-[var(--accent-b)] border-[var(--border)]", icon: <Bed className="w-2.5 h-2.5 text-current" /> },
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
      <div className="w-14 h-14 rounded-xl flex items-center justify-center border border-[var(--border)] bg-[var(--surface-raised)] p-2.5 text-[var(--txt)]">
        <RadianceLogo variant="symbol" size="lg" showWordmark={false} animated={false} glow={false} className="w-9 h-8" />
      </div>

      {/* Hero Title (Editorial Serif + Signature Chromatic Flare) */}
      <div className="flex flex-col gap-2 max-w-xl mx-auto">
        <h1 className="font-serif text-4xl sm:text-5xl font-normal text-[var(--txt)] tracking-tight leading-tight select-none">
          {titleName}
        </h1>
        <p className="text-sm md:text-base text-[var(--txt-muted)] font-normal leading-relaxed font-sans">
          {description}
        </p>
      </div>

      {/* Dynamic Subtitle matched with Background Atmosphere */}
      <div className="w-full max-w-3xl flex items-center justify-between mt-2 px-1">
        <p className="text-xs text-[var(--txt-muted)] font-mono flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-[var(--border-accent)]" aria-hidden="true" />
          Suggested starting points
        </p>
      </div>

      {/* 3-Column Suggestions Architecture automatically harmonized with Theme & Palette */}
      <div
        data-testid="prompt-categories"
        className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-3 text-left"
      >
        {SUGGESTION_COLUMNS.map((column) => (
          <div
            key={column.id}
            className="group/card flex flex-col items-start p-4 rounded-xl border border-[var(--border)] bg-[var(--surface-raised)] transition-colors hover:border-[var(--border-hover)]"
          >
            <div className="flex items-center justify-between w-full mb-3 border-b border-[var(--border)] pb-2">
              <h2
                className="font-sans text-sm font-medium tracking-normal text-[var(--txt)]"
                style={getHeaderStyle(column.headerThemeRole)}
              >
                {column.title}
              </h2>
              <span className="text-[11px] font-mono text-[var(--txt-muted)]">
                {column.id}
              </span>
            </div>
            <div className="flex flex-col items-start gap-1.5 w-full">
              {column.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectPrompt(item.prompt)}
                  className="group/btn w-full inline-flex items-center gap-2.5 px-3 py-2.5 min-h-[44px] rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)] transition-colors cursor-pointer active:scale-[0.99] focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--border-accent)] touch-target text-left"
                  aria-label={`Ask suggestion: ${item.label}`}
                >
                  {item.badge && renderBadge(item.badge.type)}
                  <span className="truncate text-xs text-[var(--txt)] font-normal">
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
