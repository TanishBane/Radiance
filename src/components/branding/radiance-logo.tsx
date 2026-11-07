"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils/cn";

export interface RadianceLogoProps {
  variant?: "symbol" | "wordmark" | "lockup" | "micro";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "hero";
  className?: string;
  onClick?: () => void;
  animated?: boolean;
  showWordmark?: boolean; // backward compatibility with LogoProps
  glow?: boolean;
  "aria-label"?: string;
  "aria-hidden"?: boolean;
  role?: string;
}

// 17 discrete stripe segments composing the 11 speed bands
export const RADIANCE_SYMBOL_STRIPES = [
  { id: "1A", band: 1, d: "M 141.6 84.0 L 209.4 84.0 A 13.6 13.6 0 0 1 209.4 111.2 L 141.6 111.2 A 13.6 13.6 0 0 1 141.6 84.0 Z" },
  { id: "1B", band: 1, d: "M 258.6 84.0 L 547.0 84.0 C 580.0 84.0 610.0 95.0 629.0 111.2 L 258.6 111.2 A 13.6 13.6 0 0 1 258.6 84.0 Z" },
  { id: "2", band: 2, d: "M 196.6 134.5 L 661.0 134.5 C 669.0 143.0 676.0 152.0 682.0 161.7 L 196.6 161.7 A 13.6 13.6 0 0 1 196.6 134.5 Z" },
  { id: "3", band: 3, d: "M 296.6 185.0 L 696.0 185.0 C 699.0 193.5 701.0 202.5 702.0 212.2 L 555.0 212.2 C 546.0 206.0 534.0 202.0 518.0 202.0 L 434.0 202.0 C 424.0 202.0 417.0 206.0 416.0 212.2 L 296.6 212.2 A 13.6 13.6 0 0 1 296.6 185.0 Z" },
  { id: "4A", band: 4, d: "M 175.6 235.5 L 412.0 235.5 L 407.2 262.7 L 175.6 262.7 A 13.6 13.6 0 0 1 175.6 235.5 Z" },
  { id: "4B", band: 4, d: "M 566.0 235.5 L 706.0 235.5 C 707.2 244.0 707.2 254.0 706.0 262.7 L 568.0 262.7 L 566.0 235.5 Z" },
  { id: "5A", band: 5, d: "M 106.6 286.0 L 403.1 286.0 L 398.3 313.2 L 106.6 313.2 A 13.6 13.6 0 0 1 106.6 286.0 Z" },
  { id: "5B", band: 5, d: "M 561.0 286.0 L 703.0 286.0 C 702.0 295.0 701.0 304.0 699.0 313.2 L 548.0 313.2 L 561.0 286.0 Z" },
  { id: "6", band: 6, d: "M 225.6 336.5 L 687.0 336.5 C 683.0 346.0 679.0 355.0 675.0 363.7 L 225.6 363.7 A 13.6 13.6 0 0 1 225.6 336.5 Z" },
  { id: "7", band: 7, d: "M 159.6 387.0 L 648.0 387.0 C 640.0 396.0 631.0 405.0 622.0 414.2 L 159.6 414.2 A 13.6 13.6 0 0 1 159.6 387.0 Z" },
  { id: "8", band: 8, d: "M 253.6 437.5 L 586.0 437.5 C 590.0 446.5 594.0 455.5 598.0 464.7 L 452.0 464.7 C 442.0 458.0 430.0 454.0 410.0 454.0 C 392.0 454.0 382.0 458.0 373.0 464.7 L 253.6 464.7 A 13.6 13.6 0 0 1 253.6 437.5 Z" },
  { id: "9A", band: 9, d: "M 177.6 488.0 L 367.6 488.0 L 362.8 515.2 L 177.6 515.2 A 13.6 13.6 0 0 1 177.6 488.0 Z" },
  { id: "9B", band: 9, d: "M 465.0 488.0 L 613.0 488.0 L 627.7 515.2 L 479.7 515.2 Z" },
  { id: "10A", band: 10, d: "M 237.6 538.5 L 358.7 538.5 L 353.9 565.7 L 237.6 565.7 A 13.6 13.6 0 0 1 237.6 538.5 Z" },
  { id: "10B", band: 10, d: "M 492.3 538.5 L 640.3 538.5 L 655.0 565.7 L 507.0 565.7 Z" },
  { id: "11A", band: 11, d: "M 173.6 589.0 L 349.8 589.0 L 345.0 616.0 L 173.6 616.0 A 13.5 13.5 0 0 1 173.6 589.0 Z" },
  { id: "11B", band: 11, d: "M 519.5 589.0 L 667.5 589.0 L 682.1 616.0 L 534.1 616.0 Z" },
];

const sizeMap = {
  xs: { box: "w-4 h-3.5", text: "text-xs", gap: "gap-1.5" },
  sm: { box: "w-6 h-5.5", text: "text-sm", gap: "gap-2" },
  md: { box: "w-8 h-7", text: "text-lg", gap: "gap-2.5" },
  lg: { box: "w-12 h-10.5", text: "text-2xl", gap: "gap-3" },
  xl: { box: "w-16 h-14", text: "text-3xl", gap: "gap-3.5" },
  hero: { box: "w-24 h-21", text: "text-5xl", gap: "gap-4" },
};

/**
 * RadianceLogo: Official Brand Symbol and Identity Component
 * 
 * Replaces the temporary RD monogram with the official geometric speed-striped "R"
 * constructed with mathematical precision across 11 bands and 17 segments.
 */
export function RadianceLogo({
  variant = "symbol",
  size = "md",
  className,
  onClick,
  animated = false,
  showWordmark = true,
  glow = false,
  "aria-label": ariaLabel = "Radiance home",
  "aria-hidden": ariaHidden,
  role,
}: RadianceLogoProps) {
  const prefersReducedMotion = useReducedMotion();
  const shouldAnimate = animated && !prefersReducedMotion;
  const cfg = sizeMap[size];

  // Resolve whether wordmark is visible
  const hasWordmark = variant === "lockup" || (variant === "symbol" && showWordmark);

  const symbolContent = (
    <svg
      viewBox="0 0 800 700"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "shrink-0 transition-transform duration-300",
        cfg.box,
        glow && "drop-shadow-[0_0_12px_var(--accent)]"
      )}
      aria-hidden={ariaHidden ?? true}
      focusable="false"
    >
      <g fill="currentColor">
        {RADIANCE_SYMBOL_STRIPES.map((stripe, idx) => {
          if (shouldAnimate) {
            return (
              <motion.path
                key={stripe.id}
                id={`radiance-stripe-${stripe.id}`}
                d={stripe.d}
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.45,
                  delay: (stripe.band - 1) * 0.035,
                  ease: [0.16, 1, 0.3, 1],
                }}
              />
            );
          }
          return (
            <path
              key={stripe.id}
              id={`radiance-stripe-${stripe.id}`}
              d={stripe.d}
            />
          );
        })}
      </g>
    </svg>
  );

  const wordmarkContent = (
    <span
      className={cn(
        "font-serif tracking-[0.16em] font-bold text-[var(--txt)] transition-colors select-none",
        "group-hover:text-[var(--accent-b)]",
        cfg.text
      )}
    >
      RADIANCE
    </span>
  );

  // Standalone wordmark variant
  if (variant === "wordmark") {
    if (onClick) {
      return (
        <button
          type="button"
          onClick={onClick}
          aria-label={ariaLabel}
          className={cn("bg-transparent border-0 p-0 cursor-pointer select-none group text-left", className)}
        >
          {wordmarkContent}
        </button>
      );
    }
    return <div className={cn("inline-flex items-center", className)}>{wordmarkContent}</div>;
  }

  // Pure symbol without container button if onClick is not provided
  if (!onClick && !hasWordmark) {
    return (
      <div
        className={cn("inline-flex items-center justify-center text-[var(--txt)]", className)}
        aria-hidden={ariaHidden}
        aria-label={ariaLabel}
        role={role}
      >
        {symbolContent}
      </div>
    );
  }

  // Interactive or lockup presentation
  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={ariaLabel}
        className={cn(
          "inline-flex items-center cursor-pointer select-none group bg-transparent border-0 p-0 text-[var(--txt)]",
          cfg.gap,
          className
        )}
      >
        <div className="flex items-center justify-center">
          {symbolContent}
        </div>
        {hasWordmark && wordmarkContent}
      </button>
    );
  }

  return (
    <div
      className={cn("inline-flex items-center text-[var(--txt)]", cfg.gap, className)}
      aria-label={ariaLabel}
      aria-hidden={ariaHidden}
      role={role}
    >
      {symbolContent}
      {hasWordmark && wordmarkContent}
    </div>
  );
}
