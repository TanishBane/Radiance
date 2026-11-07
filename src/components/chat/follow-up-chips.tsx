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
      <div className="font-mono text-xs text-[var(--txt-muted)]">
        Suggested follow-ups
      </div>
      <div className="flex flex-col gap-1.5">
        {questions.map((q, idx) => (
          <button
            key={idx}
            onClick={() => onSelect(q)}
            className="flex items-center gap-2.5 text-left px-3.5 py-2.5 min-h-[44px] rounded-lg text-xs bg-[var(--surface)] border border-[var(--border)] text-[var(--txt)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-accent)] active:scale-[0.99] transition-colors cursor-pointer touch-target"
          >
            <ArrowRight className="w-3.5 h-3.5 text-[var(--txt-muted)] shrink-0" />
            <span className="leading-snug">{q}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
