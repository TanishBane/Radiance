"use client";

import React, { useCallback, useState } from "react";
import { ArrowLeft, ArrowRight, CornerDownRight } from "lucide-react";

interface FollowUpChipsProps {
  questions: string[];
  onSelect: (question: string) => void;
  label?: string;
  startAt?: number;
  compact?: boolean;
}

export function FollowUpChips({
  questions,
  onSelect,
  label,
  startAt = 0,
  compact = false,
}: FollowUpChipsProps) {
  const [activeIndex, setActiveIndex] = useState(startAt);
  const total = questions.length;
  const currentIndex = total > 0 ? activeIndex % total : 0;
  const carouselLabel = label
    ? `${label} follow-up suggestions`
    : "Suggested follow-up questions";
  const controlLabel = label || "suggestion";
  const move = useCallback((direction: number) => {
    setActiveIndex((current) => ((current % total) + direction + total) % total);
  }, [total]);

  if (total === 0) return null;

  const handleKeyDown = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      move(1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      move(-1);
    }
  };

  return (
    <section
      role="region"
      aria-roledescription="carousel"
      aria-label={carouselLabel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className={`relative mx-auto w-full outline-none ${
        compact
          ? "max-w-none rounded-[18px] border border-white/75 p-2.5 follow-up-glass shadow-[0_16px_36px_-22px_rgba(0,0,0,0.48),inset_0_1px_0_rgba(255,255,255,0.9)]"
          : "mt-2 max-w-5xl"
      }`}
      style={
        compact
          ? {
              background: "var(--follow-up-card-surface)",
            }
          : undefined
      }
      data-testid="follow-up-carousel"
    >
      <div className={`mb-2 flex items-center justify-between px-1 ${compact ? "gap-1" : ""}`}>
        <p
          className={`min-w-0 truncate text-xs font-medium tracking-wide ${
            compact ? "text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-700" : "text-[var(--txt-dim)]"
          }`}
        >
          {compact ? "Next" : label || "Continue the conversation"}
        </p>
        {total > 1 && (
          <div className={`flex shrink-0 items-center ${compact ? "gap-0" : "gap-1.5"}`}>
            <p
              aria-live="polite"
              aria-label={`Suggestion ${currentIndex + 1} of ${total}`}
              className={`tabular-nums ${compact ? "mr-1 text-xs font-semibold text-slate-700" : "mr-1 text-xs text-[var(--txt-muted)]"}`}
            >
              {compact ? `${currentIndex + 1}/${total}` : `Suggestion ${currentIndex + 1} of ${total}`}
            </p>
            <button
              type="button"
              aria-label={`Previous ${controlLabel}`}
              onClick={() => move(-1)}
              onTouchEnd={(event) => {
                event.preventDefault();
                move(-1);
              }}
              className={`touch-target h-8 w-8 rounded-full border transition-colors focus-visible:ring-2 motion-reduce:transition-none ${
                compact
                  ? "border-white/45 bg-slate-950/75 text-white hover:border-[var(--accent)] hover:bg-slate-950 focus-visible:ring-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface-raised)] text-[var(--txt-dim)] hover:border-[var(--accent)] hover:text-[var(--txt)] focus-visible:ring-[var(--accent)]"
              }`}
            >
              <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              aria-label={`Next ${controlLabel}`}
              onClick={() => move(1)}
              onTouchEnd={(event) => {
                event.preventDefault();
                move(1);
              }}
              className={`touch-target h-8 w-8 rounded-full border transition-colors focus-visible:ring-2 motion-reduce:transition-none ${
                compact
                  ? "border-white/45 bg-slate-950/75 text-white hover:border-[var(--accent)] hover:bg-slate-950 focus-visible:ring-[var(--accent)]"
                  : "border-[var(--border)] bg-[var(--surface-raised)] text-[var(--txt-dim)] hover:border-[var(--accent)] hover:text-[var(--txt)] focus-visible:ring-[var(--accent)]"
              }`}
            >
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div
        className={`relative ${
          compact
            ? "min-h-[76px]"
            : "h-[76px] overflow-hidden [perspective:900px] sm:h-[82px]"
        }`}
      >
        {questions.map((question, index) => {
          let offset = (index - currentIndex + total) % total;
          if (offset > total / 2) offset -= total;
          const isActive = offset === 0;
          const isVisible = Math.abs(offset) <= 1;

          if (compact && !isActive) return null;

          return (
            <button
              key={`${index}-${question}`}
              type="button"
              aria-label={`Use suggestion: ${question}`}
              aria-current={isActive ? "true" : undefined}
              onClick={() => onSelect(question)}
              tabIndex={isVisible ? 0 : -1}
              className={`touch-target flex min-h-[44px] items-center gap-2 text-left font-medium leading-relaxed transition-[transform,opacity,border-color,background-color,box-shadow] duration-250 ease-out motion-reduce:transition-none ${
                compact
                  ? "relative w-full px-2 py-2 text-sm text-slate-950 focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-white"
                  : "absolute left-1/2 top-1/2 rounded-xl border px-3 py-2.5 text-xs text-white shadow-[0_12px_28px_-20px_var(--accent-g)] hover:border-[var(--accent)] hover:bg-[var(--accent-d)] focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--deep)] sm:px-4"
              }`}
              style={{
                width: compact ? "100%" : "min(78%, 46rem)",
                transform: compact
                  ? undefined
                  : `translate(-50%, -50%) translateX(${offset * 86}%) translateZ(${isActive ? 0 : -100}px) rotateY(${offset * -32}deg) scale(${isActive ? 1 : 0.84})`,
                opacity: compact ? 1 : isVisible ? (isActive ? 1 : 0.52) : 0,
                pointerEvents: compact || isVisible ? "auto" : "none",
                zIndex: isActive ? 2 : 1,
                borderColor: compact
                  ? "rgba(255, 255, 255, 0.15)"
                  : isActive
                    ? "var(--border-accent)"
                    : "var(--border)",
                background: compact
                  ? undefined
                  : isActive
                    ? "linear-gradient(110deg, var(--surface-raised), color-mix(in srgb, var(--deep) 78%, var(--accent) 22%))"
                    : "var(--surface)",
                boxShadow: !compact && isActive ? "0 12px 30px -24px var(--accent-g)" : undefined,
              }}
            >
              <CornerDownRight
                aria-hidden="true"
                className={`h-3.5 w-3.5 shrink-0 ${
                  compact ? "text-[var(--accent)]" : isActive ? "text-[var(--accent-b)]" : "text-[var(--txt-muted)]"
                }`}
              />
              <span className="line-clamp-2 min-w-0 flex-1 break-words">{question}</span>
              {isActive && (
                <ArrowRight
                  aria-hidden="true"
                  className="h-4 w-4 shrink-0 text-[var(--accent)]"
                />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
