"use client";

import React, { useEffect, useRef } from "react";
import { ColorTheme, GradientStyle } from "@/lib/types/theme";

interface AuroraGradientBackgroundProps {
  theme: ColorTheme;
  styleMode: GradientStyle;
}

// Pre-encoded SVG noise texture matching 21st.dev references
const WAVES_GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.080'/%3E%3C/svg%3E\")";

export function AuroraGradientBackground({
  theme,
  styleMode,
}: AuroraGradientBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // Only handle waves mode
    if (styleMode !== "waves") {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      if (containerRef.current) {
        containerRef.current.style.display = "none";
      }
      return;
    }

    const container = containerRef.current;
    if (!container) return;
    container.style.display = "block";

    // Respect user's motion preferences
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderWavesFrame = (t: number) => {
      const ph = t * 0.98;
      const amt = 0.75;
      const spin = ph * 1;
      const baseAngle = theme.ribbonAngle ?? 155;

      // Continuous modulation: exactly 0 at ph = 0
      const angle = baseAngle + Math.sin(spin * 0.6) * 28 * amt;
      const [c0, c1, c2, c3] = theme.ribbonColors;

      const linearGrad = `linear-gradient(${angle}deg, ${c0} 0%, ${c0} 16.5%, ${c1} 20.79%, ${c1} 45.71%, ${c2} 54.29%, ${c2} 79.21%, ${c3} 83.5%, ${c3} 100%)`;

      container.style.backgroundColor = "#06050a";
      container.style.backgroundImage = `${WAVES_GRAIN_URL}, ${linearGrad}`;
      container.style.backgroundSize = "120px 120px, auto";
      container.style.backgroundBlendMode = "overlay, normal";
    };

    if (prefersReducedMotion) {
      renderWavesFrame(0);
      return;
    }

    let isRunning = true;

    const tick = (now: number) => {
      if (!isRunning) return;
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }
      const elapsedSeconds = (now - startTimeRef.current) / 1000;
      renderWavesFrame(elapsedSeconds);
      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    const handleVisibilityChange = () => {
      if (document.hidden) {
        isRunning = false;
        if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      } else {
        if (!isRunning) {
          isRunning = true;
          rafIdRef.current = requestAnimationFrame(tick);
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      isRunning = false;
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current);
      }
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [theme, styleMode]);

  if (styleMode !== "waves") return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 transition-[opacity] duration-700 will-change-[background-image]"
      aria-hidden="true"
    />
  );
}
