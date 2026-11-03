"use client";

import React, { useState, useMemo } from "react";
import { Sparkles, Terminal, BookOpen, Image as ImageIcon, BrainCircuit, ArrowUpRight } from "lucide-react";
import { motion, useReducedMotion } from "motion/react";
import { getMotionTransition } from "@/lib/motion/presets";

interface PromptCategory {
  id: string;
  label: string;
  icon: React.ReactNode;
  prompts: string[];
}

const PROMPT_CATEGORIES: PromptCategory[] = [
  {
    id: "reasoning",
    label: "Reasoning & Systems",
    icon: <BrainCircuit className="w-3.5 h-3.5" />,
    prompts: [
      "Explain transformer attention mechanism with geometric intuition",
      "What is RAG and how to eliminate retrieval hallucinations?",
      "How to design production-grade autonomous agent loops?",
      "Compare gradient descent optimizations: Adam vs Sophia",
    ],
  },
  {
    id: "engineering",
    label: "Code & Architecture",
    icon: <Terminal className="w-3.5 h-3.5" />,
    prompts: [
      "Write a strictly-typed concurrent LRU cache in TypeScript",
      "Explain React 19 concurrent rendering and useTransition",
      "Design an RFC 7807 problem details error handling middleware",
      "How to implement zero-downtime PostgreSQL schema migrations?",
    ],
  },
  {
    id: "mumbai",
    label: "Mumbai & Academics",
    icon: <BookOpen className="w-3.5 h-3.5" />,
    prompts: [
      "Compare NM College vs UPG SVKM for AI & Data Science",
      "What tech engineering internship opportunities exist in BKC and Powai?",
      "Create a structured semester study roadmap for Machine Learning",
      "Who is Tanish Bane and what are his open-source AI projects?",
    ],
  },
  {
    id: "visuals",
    label: "Flux Visuals",
    icon: <ImageIcon className="w-3.5 h-3.5" />,
    prompts: [
      "Generate a cyberpunk rainy neon skyline over Marine Drive Mumbai",
      "Generate a minimalist golden nebula with celestial particle rings",
      "Generate an editorial brutalist architectural studio in Tokyo",
      "Generate an ethereal glowing violet aurora over crystalline mountains",
    ],
  },
];

const FACTS = [
  "The term Artificial Intelligence was coined by John McCarthy in 1956.",
  "Transformer architecture — the backbone of modern LLMs — was introduced by Google in 2017.",
  "The human brain has ~86 billion neurons; modern frontier models exceed a trillion parameters.",
  "India produces more AI research papers than any country except the USA and China.",
  "AlphaZero mastered chess, shogi, and Go through pure self-play in less than 24 hours.",
  "Real production software on GitHub matters far more than theoretical certificates in tech hiring.",
  "Edge AI enables model inference locally on devices with zero cloud latency and total privacy.",
  "Consistency beats intensity: focused daily engineering compounds faster than deadline panic.",
];

interface WelcomeCardProps {
  onSelectPrompt: (prompt: string) => void;
}

export function WelcomeCard({ onSelectPrompt }: WelcomeCardProps) {
  const [activeTab, setActiveTab] = useState<string>("reasoning");
  const prefersReducedMotion = useReducedMotion() ?? false;

  const currentCategory = useMemo(() => {
    return PROMPT_CATEGORIES.find((c) => c.id === activeTab) || PROMPT_CATEGORIES[0];
  }, [activeTab]);

  const fact = useMemo(() => {
    return FACTS[Math.floor(Math.random() * FACTS.length)];
  }, []);

  const titleName = "Radiance";
  const description =
    "Illuminate what is possible. Stream real-time reasoning, analyze documents, generate Flux visuals, and explore complex ideas.";

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={getMotionTransition("entrance", prefersReducedMotion)}
      className="flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-8 text-center gap-6"
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

      {/* Categorized Prompt Explorer */}
      <div className="w-full max-w-xl flex flex-col gap-3 mt-2">
        {/* Category Filter Pills */}
        <div data-testid="prompt-categories" className="w-full max-w-[640px] mx-auto flex items-center justify-start sm:justify-center gap-0.5 p-1 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] shadow-sm overflow-x-auto overscroll-x-contain [scrollbar-width:none]">
          {PROMPT_CATEGORIES.map((cat) => {
            const isActive = activeTab === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveTab(cat.id)}
                className={`flex items-center gap-1 px-2 py-1.5 rounded-xl text-[11px] font-mono transition-all whitespace-nowrap shrink-0 touch-target ${
                  isActive
                    ? "bg-[var(--accent-d)] text-[var(--accent)] font-semibold border border-[var(--accent)]/40 shadow-chip"
                    : "text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] border border-transparent"
                }`}
              >
                {cat.icon}
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Suggestion Prompt Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-left">
          {currentCategory.prompts.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => onSelectPrompt(prompt)}
              className="group flex items-start justify-between gap-2 p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-hover)] shadow-card transition-all duration-200 text-left min-h-[58px]"
            >
              <span className="text-xs text-[var(--txt-dim)] group-hover:text-[var(--txt)] leading-relaxed font-sans">
                {prompt}
              </span>
              <ArrowUpRight className="w-3.5 h-3.5 text-[var(--txt-muted)] group-hover:text-[var(--accent)] shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform mt-0.5" />
            </button>
          ))}
        </div>
      </div>

      {/* Fact of the Day Card */}
      <div className="w-full max-w-xl mt-2 p-3.5 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] text-left relative overflow-hidden shadow-card">
        <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-gradient-to-b from-[var(--accent)] to-[var(--accent-c)]" />
        <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[var(--accent)] mb-1">
          <Sparkles className="w-3 h-3" />
          <span>Cognitive Insight</span>
        </div>
        <p className="text-xs text-[var(--txt-dim)] leading-relaxed font-light">{fact}</p>
      </div>
    </motion.div>
  );
}
