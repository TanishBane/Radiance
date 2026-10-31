"use client";

import React, { useMemo } from "react";
import { Sparkles } from "lucide-react";
import { PersonaMode } from "@/lib/types/chat";

const CHIP_POOL = [
  "What is Radiance and how does it work?",
  "Who is Tanish Bane?",
  "Explain transformer architecture simply",
  "Generate a cyberpunk skyline over Mumbai",
  "Compare NM College vs UPG SVKM for AI & Data Science",
  "What is the attention mechanism in LLMs?",
  "Help me write an engineering SOP",
  "Explain gradient descent with intuition",
  "Generate a minimalist golden nebula",
  "What is RAG in AI systems?",
  "Best free resources to master Python and PyTorch",
  "How to build production-grade agentic workflows?",
  "Explain neural networks like I am 15",
  "What tech career opportunities exist in Mumbai?",
  "Write clean TypeScript code for a LRU Cache",
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
  mode?: PersonaMode;
}

export function WelcomeCard({ onSelectPrompt, mode = "default" }: WelcomeCardProps) {
  const chips = useMemo(() => {
    return [...CHIP_POOL].sort(() => Math.random() - 0.5).slice(0, 4);
  }, []);

  const fact = useMemo(() => {
    return FACTS[Math.floor(Math.random() * FACTS.length)];
  }, []);

  const titleName =
    mode === "portfolio"
      ? "Tanish Bane"
      : mode === "student"
      ? "Mumbai Student AI"
      : "Radiance";

  const description =
    mode === "portfolio"
      ? "Explore AI & Data Science engineering projects, full-stack architectures, published research, and technical credentials."
      : mode === "student"
      ? "Mumbai collegiate academic guide, syllabus navigator, engineering career strategies, and collegiate resources."
      : "Illuminate what is possible. Stream real-time reasoning, analyze documents, generate Flux visuals, or explore dedicated persona modes.";

  return (
    <div className="flex flex-col items-center justify-center max-w-2xl mx-auto px-4 py-8 text-center gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Brand Icon Gem with Chromatic Border & Glow */}
      <div
        className="w-16 h-16 rounded-2xl flex items-center justify-center border border-[var(--border)] shadow-[0_0_35px_var(--accent-g)] transition-transform duration-300 hover:scale-105"
        style={{
          background: "linear-gradient(135deg, var(--accent-d), rgba(255, 255, 255, 0.02))",
        }}
      >
        <span className="font-mono text-2xl font-bold gradient-text-brand">RD</span>
      </div>

      {/* Hero Title (Signature TanixAI Cormorant Garamond + 3-Stop Chromatic Gradient) */}
      <div className="flex flex-col gap-2.5">
        <h1 className="font-serif text-4xl sm:text-5xl md:text-6xl font-light text-[var(--txt)] tracking-tight leading-tight select-none">
          Hello, I Am <em className="not-italic font-bold gradient-text-brand drop-shadow-sm">{titleName}</em>
        </h1>
        <p className="text-sm md:text-base text-[var(--txt-dim)] font-light max-w-lg leading-relaxed mx-auto">
          {description}
        </p>
      </div>

      {/* Divider */}
      <div className="flex items-center gap-3 w-full max-w-xs my-1">
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
        <span className="font-mono text-[9px] tracking-[0.25em] uppercase text-[var(--txt-muted)]">
          Quick Inception
        </span>
        <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />
      </div>

      {/* Suggestion Chips */}
      <div className="flex flex-wrap gap-2.5 justify-center max-w-xl">
        {chips.map((prompt) => (
          <button
            key={prompt}
            onClick={() => onSelectPrompt(prompt)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs text-[var(--txt-dim)] bg-[var(--surface)] border border-[var(--border)] border-l-2 border-l-[var(--accent)] hover:bg-[var(--accent-d)] hover:border-[var(--accent)] hover:text-[var(--txt)] hover:translate-x-0.5 transition-all duration-200 text-left"
          >
            <span>{prompt}</span>
          </button>
        ))}
      </div>

      {/* Fact of the Day Card */}
      <div className="w-full max-w-md mt-4 p-3.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-left relative overflow-hidden">
        <div className="absolute left-0 top-2 bottom-2 w-[2px] bg-gradient-to-b from-[var(--accent)] to-[var(--accent-c)]" />
        <div className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-wider text-[var(--accent)] mb-1">
          <Sparkles className="w-3 h-3" />
          <span>Cognitive Insight</span>
        </div>
        <p className="text-xs text-[var(--txt-dim)] leading-relaxed font-light">{fact}</p>
      </div>
    </div>
  );
}
