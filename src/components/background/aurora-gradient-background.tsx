"use client";

import React, { useEffect, useRef } from "react";
import { ColorTheme, GradientStyle } from "@/lib/types/theme";

interface AuroraGradientBackgroundProps {
  theme: ColorTheme;
  styleMode: GradientStyle;
}

// Convert 3- or 6-character hex to rgba string
function hexToRgba(hex: string, alpha: number): string {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return `rgba(20, 11, 46, ${alpha})`;
  const r = (num >> 16) & 255;
  const g = (num >> 8) & 255;
  const b = num & 255;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

// Pre-encoded SVG noise textures matching 21st.dev references
const BLOOM_GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.030'/%3E%3C/svg%3E\")";

const WAVES_GRAIN_URL =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.080'/%3E%3C/svg%3E\")";

// Static blob anchors and phases for Gradient 1 (Bloom Field / Mesh)
const BLOOM_BLOBS = [
  { cx: 56.18, cy: 53.14, p: 0.0, p2: 0.5, stops: [0, 19.02, 38.05, 57.07, 76.1] },
  { cx: 40.93, cy: 70.24, p: 1.2, p2: 1.7, stops: [0, 17.71, 35.42, 53.14, 70.85] },
  { cx: 58.0, cy: 14.42, p: 2.4, p2: 2.9, stops: [0, 12.9, 25.8, 38.7, 51.6] },
  { cx: 65.0, cy: 81.01, p: 3.6, p2: 4.1, stops: [0, 13.34, 26.68, 40.01, 53.35] },
  { cx: 16.23, cy: 47.68, p: 4.8, p2: 5.3, stops: [0, 12.46, 24.93, 37.39, 49.85] },
  { cx: 94.0, cy: 31.96, p: 5.9, p2: 6.4, stops: [0, 11.59, 23.18, 34.76, 46.35] },
];

export function AuroraGradientBackground({
  theme,
  styleMode,
}: AuroraGradientBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // If cosmic mode, background-layers handles 3D ambient canvas instead
    if (styleMode === "cosmic") {
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

    const renderBloomFrame = (t: number) => {
      const ph = t * 0.2;
      const amt = 0.25;

      const [c0, c1, c2, c3, c4, c5] = theme.bloomColors;
      const colors = [c0, c1, c2, c3, c4, c5];

      const radialGradients = BLOOM_BLOBS.map((blob, i) => {
        // Continuous modulation formula: exactly 0 at ph = 0 so no snapping on start
        const dx = (Math.sin(ph * 0.55 + blob.p) - Math.sin(blob.p)) * 14 * amt;
        const dy = (Math.sin(ph * 0.43 + blob.p2) - Math.sin(blob.p2)) * 14 * amt;
        const x = blob.cx + dx;
        const y = blob.cy + dy;

        const color = colors[i] || colors[0];
        const s = blob.stops;

        return `radial-gradient(circle at ${x}% ${y}%, ${hexToRgba(color, 1)} ${s[0]}%, ${hexToRgba(color, 0.844)} ${s[1]}%, ${hexToRgba(color, 0.5)} ${s[2]}%, ${hexToRgba(color, 0.156)} ${s[3]}%, ${hexToRgba(color, 0)} ${s[4]}%)`;
      });

      container.style.backgroundColor = theme.bloomColors[0];
      container.style.backgroundImage = `${BLOOM_GRAIN_URL}, ${radialGradients.join(", ")}`;
      container.style.backgroundSize = "120px 120px, auto, auto, auto, auto, auto, auto";
      container.style.backgroundBlendMode = "overlay, normal, normal, normal, normal, normal, normal";
    };

    const renderWavesFrame = (t: number) => {
      const ph = t * 0.98;
      const amt = 0.75;
      const spin = ph * 1;
      const baseAngle = theme.ribbonAngle ?? 155;

      // Modulation: exactly 0 at ph = 0
      const angle = baseAngle + Math.sin(spin * 0.6) * 28 * amt;
      const [c0, c1, c2, c3] = theme.ribbonColors;

      const linearGrad = `linear-gradient(${angle}deg, ${c0} 0%, ${c0} 16.5%, ${c1} 20.79%, ${c1} 45.71%, ${c2} 54.29%, ${c2} 79.21%, ${c3} 83.5%, ${c3} 100%)`;

      container.style.backgroundColor = theme.ribbonColors[0];
      container.style.backgroundImage = `${WAVES_GRAIN_URL}, ${linearGrad}`;
      container.style.backgroundSize = "120px 120px, auto";
      container.style.backgroundBlendMode = "overlay, normal";
    };

    if (prefersReducedMotion) {
      // Static zero-offset render for accessibility
      if (styleMode === "bloom") {
        renderBloomFrame(0);
      } else {
        renderWavesFrame(0);
      }
      return;
    }

    let isRunning = true;

    const tick = (now: number) => {
      if (!isRunning) return;
      if (startTimeRef.current === null) {
        startTimeRef.current = now;
      }
      const elapsedSeconds = (now - startTimeRef.current) / 1000;

      if (styleMode === "bloom") {
        renderBloomFrame(elapsedSeconds);
      } else if (styleMode === "waves") {
        renderWavesFrame(elapsedSeconds);
      }

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

  if (styleMode === "cosmic") return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 pointer-events-none z-0 transition-[opacity] duration-700 will-change-[background-image]"
      aria-hidden="true"
    />
  );
}
