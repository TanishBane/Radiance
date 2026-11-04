"use client";

import React from "react";
import { Plane, Play, Bed } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { getMotionTransition } from "@/lib/motion/presets";

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
  titleColor: string;
  items: SuggestionItem[];
}

export const SUGGESTION_COLUMNS: SuggestionColumn[] = [
  {
    id: "understand",
    title: "Understand",
    titleColor: "text-[#f29879]",
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
    titleColor: "text-[#b88bf5]",
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
    titleColor: "text-[#7fa5f8]",
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

  function renderBadge(type: "flight" | "video" | "getaway") {
    switch (type) {
      case "flight":
        return (
          <span
            className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#1e88e5] flex items-center justify-center shrink-0 shadow-sm"
            aria-hidden="true"
          >
            <Plane className="w-2.5 h-2.5 text-white" />
          </span>
        );
      case "video":
        return (
          <span
            className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#e53935] flex items-center justify-center shrink-0 shadow-sm"
            aria-hidden="true"
          >
            <Play className="w-2.5 h-2.5 text-white fill-white ml-0.5" />
          </span>
        );
      case "getaway":
        return (
          <span
            className="w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#2e7d32] flex items-center justify-center shrink-0 shadow-sm"
            aria-hidden="true"
          >
            <Bed className="w-2.5 h-2.5 text-white" />
          </span>
        );
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={getMotionTransition("entrance", prefersReducedMotion)}
      className="flex flex-col items-center justify-center w-full max-w-4xl mx-auto px-4 py-8 text-center gap-6"
    >
      {/* Brand Icon Gem with Restrained Border & Clean Elevation */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center border border-[var(--border)] shadow-card transition-transform duration-300 hover:scale-105 select-none"
        style={{
          background: "linear-gradient(135deg, var(--surface-raised), rgba(255, 255, 255, 0.02))",
        }}
      >
        <span className="font-mono text-2xl font-bold gradient-text-brand">RD</span>
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

      {/* Subtitle from Image 2 */}
      <div className="w-full max-w-3xl flex flex-col items-start mt-2">
        <p className="text-sm sm:text-base text-[var(--txt-dim)] font-medium text-left">
          Tell me what’s on your mind, or pick a suggestion.
        </p>
      </div>

      {/* 3-Column Suggestions Layout matching Image 2 */}
      <div
        data-testid="prompt-categories"
        className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-3 gap-3.5 sm:gap-4 text-left"
      >
        {SUGGESTION_COLUMNS.map((column) => (
          <div
            key={column.id}
            className="flex flex-col items-start p-4 sm:p-5 rounded-3xl bg-[var(--surface-raised)] border border-[var(--border)] hover:border-[var(--border-hover)] transition-all shadow-card"
          >
            <h2 className={`font-sans text-xl font-semibold tracking-tight mb-3.5 ${column.titleColor}`}>
              {column.title}
            </h2>
            <div className="flex flex-col items-start gap-2.5 w-full">
              {column.items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => onSelectPrompt(item.prompt)}
                  className="group w-fit max-w-full inline-flex items-center gap-2 px-3.5 py-1.5 sm:py-2 rounded-full bg-white/[0.06] hover:bg-white/[0.12] border border-white/[0.05] hover:border-white/[0.14] text-xs sm:text-[13px] text-[#ededed] font-normal transition-all duration-200 cursor-pointer shadow-sm hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                  aria-label={`Ask suggestion: ${item.label}`}
                >
                  {item.badge && renderBadge(item.badge.type)}
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
