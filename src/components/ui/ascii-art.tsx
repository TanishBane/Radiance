"use client";

import React, { useEffect, useState } from "react";

export interface AsciiArtProps {
  /** Slug of the ASCII art piece from ASCII Magic library (e.g. "starry-ridge") */
  piece: string;
  /** Font size in px (defaults to 5 for compact display, or adjust via CSS) */
  size?: number | string;
  /** Playback speed multiplier (default 1) */
  speed?: number | string;
  /** Hold on the first frame with no animation */
  still?: boolean | string;
  /** Background color (default "transparent") */
  bg?: string;
  /** Look preset: "dots" | "ascii" | "dense" | "numbers" | "binary" | "letters" | "blocks" | "squares" | "lines" | "dither" */
  look?: string;
  chars?: string;
  mono?: boolean | string;
  contrast?: number | string;
  dotSize?: number | string;
  steps?: number | string;
  density?: number | string;
  all?: boolean | string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Client-rendered wrapper for ASCII Magic `<ascii-art>` custom web component.
 * Prevents SSR hydration mismatch and renders `<ascii-art piece="...">` once mounted in the browser.
 */
export function AsciiArt({
  piece,
  size = 5,
  speed,
  still,
  bg = "transparent",
  look,
  chars,
  mono,
  contrast,
  dotSize,
  steps,
  density,
  all,
  className,
  style,
}: AsciiArtProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div
        className={`ascii-art-placeholder animate-pulse bg-violet-950/20 rounded-xl ${className || ""}`}
        style={{ minHeight: "180px", ...style }}
        aria-hidden="true"
      />
    );
  }

  return (
    <ascii-art
      piece={piece}
      size={size}
      speed={speed}
      still={still}
      bg={bg}
      look={look}
      chars={chars}
      mono={mono}
      contrast={contrast}
      dot-size={dotSize}
      steps={steps}
      density={density}
      all={all}
      class={className}
      style={style}
    ></ascii-art>
  );
}
