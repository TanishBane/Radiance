"use client";

import React from "react";
import { ArrowRight } from "lucide-react";

interface FollowUpChipsProps {
  questions: string[];
  onSelect: (question: string) => void;
}

export function FollowUpChips({ questions, onSelect }: FollowUpChipsProps) {
  if (!questions || questions.length === 0) return null;

  return (
    <div className="flex flex-col gap-2 mt-4 pt-3 border-t border-[var(--border)] animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--accent)] opacity-70">
        Inquire Next
      </div>
      <div className="flex flex-col gap-1.5">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(q)}
            className="flex items-center gap-2.5 text-left px-3.5 py-2.5 min-h-[44px] rounded-xl text-xs bg-[var(--surface)] border border-[var(--border)] border-l-2 border-l-[var(--accent)] text-[var(--txt-dim)] hover:text-[var(--txt)] hover:bg-[var(--accent-d)] hover:border-[var(--accent)] hover:translate-x-1 active:scale-[0.99] transition-all duration-150 cursor-pointer touch-target"
          >
            <ArrowRight className="w-3 h-3 text-[var(--accent)] shrink-0 opacity-80" />
            <span className="leading-snug">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
