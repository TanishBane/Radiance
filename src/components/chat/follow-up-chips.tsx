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
      className={`relative mx-auto w-full outline-none ${compact ? "max-w-none" : "mt-2 max-w-5xl"}`}
      data-testid="follow-up-carousel"
    >
      <div className={`mb-1 flex items-center justify-between px-1 ${compact ? "gap-1" : ""}`}>
        <p
          className={`min-w-0 truncate text-xs font-medium tracking-wide text-[var(--txt-dim)] ${
            compact ? "sr-only" : ""
          }`}
        >
          {label || "Continue the conversation"}
        </p>
        {total > 1 && (
          <div className={`flex shrink-0 items-center ${compact ? "gap-0" : "gap-1.5"}`}>
            <p
              aria-live="polite"
              aria-label={`Suggestion ${currentIndex + 1} of ${total}`}
              className={`tabular-nums text-[var(--txt-muted)] ${compact ? "mr-0.5 text-xs" : "mr-1 text-xs"}`}
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
              className="touch-target h-8 w-8 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--txt-dim)] transition-colors hover:border-[var(--accent)] hover:text-[var(--txt)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] motion-reduce:transition-none"
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
              className="touch-target h-8 w-8 rounded-full border border-[var(--border)] bg-[var(--surface-raised)] text-[var(--txt-dim)] transition-colors hover:border-[var(--accent)] hover:text-[var(--txt)] focus-visible:ring-2 focus-visible:ring-[var(--accent)] motion-reduce:transition-none"
            >
              <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>

      <div
        className={`relative overflow-hidden [perspective:900px] ${compact ? "h-[84px]" : "h-[76px] sm:h-[82px]"}`}
      >
        {questions.map((question, index) => {
          let offset = (index - currentIndex + total) % total;
          if (offset > total / 2) offset -= total;
          const isActive = offset === 0;
          const isVisible = Math.abs(offset) <= 1;

          return (
            <button
              key={`${index}-${question}`}
              type="button"
              aria-label={`Use suggestion: ${question}`}
              aria-current={isActive ? "true" : undefined}
              onClick={() => onSelect(question)}
              tabIndex={isVisible ? 0 : -1}
              className="touch-target absolute left-1/2 top-1/2 flex min-h-[44px] -translate-y-1/2 items-center gap-2 rounded-xl border px-3 py-2.5 text-left text-xs font-medium leading-relaxed text-[var(--txt)] shadow-[0_12px_28px_-20px_var(--accent-g)] transition-[transform,opacity,border-color,background-color,box-shadow] duration-250 ease-out hover:border-[var(--accent)] hover:bg-[var(--accent-d)] focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-[var(--accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--deep)] sm:px-4 motion-reduce:transition-none"
              style={{
                width: compact ? "min(88%, 14rem)" : "min(78%, 46rem)",
                transform: `translate(-50%, -50%) translateX(${offset * 86}%) translateZ(${isActive ? 0 : compact ? -36 : -100}px) rotateY(${offset * (compact ? -18 : -32)}deg) scale(${isActive ? 1 : compact ? 0.9 : 0.84})`,
                opacity: isVisible ? (isActive ? 1 : compact ? 0.4 : 0.52) : 0,
                pointerEvents: isVisible ? "auto" : "none",
                zIndex: isActive ? 2 : 1,
                borderColor: isActive ? "var(--border-accent)" : "var(--border)",
                background: isActive
                  ? "linear-gradient(110deg, var(--surface-raised), color-mix(in srgb, var(--deep) 78%, var(--accent) 22%))"
                  : "var(--surface)",
                boxShadow: isActive ? "0 12px 30px -24px var(--accent-g)" : undefined,
              }}
            >
              <CornerDownRight
                aria-hidden="true"
                className={`h-3.5 w-3.5 shrink-0 ${isActive ? "text-[var(--accent-b)]" : "text-[var(--txt-muted)]"}`}
              />
              <span className="line-clamp-2 min-w-0 flex-1 break-words">{question}</span>
              {isActive && (
                <ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0 text-[var(--accent)]" />
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
