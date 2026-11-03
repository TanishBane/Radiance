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

// Localized radial lighting anchors for restrained, premium ambient depth
const BLOOM_BLOBS = [
  // Top-center subtle ambient crest (frames the topbar softly)
  { cx: 50.0, cy: 12.0, p: 0.0, p2: 0.5, stops: [0, 20, 42, 65, 85], maxAlpha: 0.28, interactive: false },
  // Top-right subtle atmospheric wing
  { cx: 82.0, cy: 22.0, p: 1.2, p2: 1.7, stops: [0, 18, 36, 55, 75], maxAlpha: 0.20, interactive: false },
  // Bottom-left subtle perimeter accent
  { cx: 16.0, cy: 82.0, p: 2.4, p2: 2.9, stops: [0, 16, 34, 52, 70], maxAlpha: 0.16, interactive: false },
  // Bottom-right subtle ground glow
  { cx: 88.0, cy: 85.0, p: 3.6, p2: 4.1, stops: [0, 15, 30, 48, 65], maxAlpha: 0.14, interactive: false },
  // Left-mid perimeter accent
  { cx: 8.0, cy: 45.0, p: 4.8, p2: 5.3, stops: [0, 14, 28, 44, 60], maxAlpha: 0.12, interactive: false },
  // Interactive ambient spotlight (subtly tracks user activity)
  { cx: 50.0, cy: 45.0, p: 5.9, p2: 6.4, stops: [0, 18, 38, 58, 80], maxAlpha: 0.14, interactive: true },
];

export function AuroraGradientBackground({
  theme,
  styleMode,
}: AuroraGradientBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rafIdRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const mousePosRef = useRef({ x: 0, y: 0 });
  const smoothMouseRef = useRef({ x: 0, y: 0 });

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

    // Track user mouse activity for ambient parallax
    const handleMouseMove = (e: MouseEvent) => {
      mousePosRef.current.x = (e.clientX / window.innerWidth - 0.5) * 2;
      mousePosRef.current.y = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Respect user's motion preferences
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const renderBloomFrame = (t: number) => {
      const ph = t * 0.2;
      const amt = 0.25;

      // Smooth lerp mouse tracking
      if (!prefersReducedMotion) {
        smoothMouseRef.current.x += (mousePosRef.current.x - smoothMouseRef.current.x) * 0.04;
        smoothMouseRef.current.y += (mousePosRef.current.y - smoothMouseRef.current.y) * 0.04;
      }

      const [c0, c1, c2, c3, c4, c5] = theme.bloomColors;
      const colors = [c0, c1, c2, c3, c4, c5];

      const radialGradients = BLOOM_BLOBS.map((blob, i) => {
        // Continuous modulation formula: exactly 0 at ph = 0 so no snapping on start
        const dx = (Math.sin(ph * 0.55 + blob.p) - Math.sin(blob.p)) * 14 * amt;
        const dy = (Math.sin(ph * 0.43 + blob.p2) - Math.sin(blob.p2)) * 14 * amt;

        // Interactive subtle shift with mouse parallax
        const shiftX = blob.interactive ? smoothMouseRef.current.x * 12 : smoothMouseRef.current.x * 4;
        const shiftY = blob.interactive ? smoothMouseRef.current.y * 10 : smoothMouseRef.current.y * 3;

        const x = blob.cx + dx + shiftX;
        const y = blob.cy + dy + shiftY;

        const color = colors[i] || colors[0];
        const s = blob.stops;
        const a = blob.maxAlpha ?? 0.22;

        return `radial-gradient(circle at ${x}% ${y}%, ${hexToRgba(color, a)} ${s[0]}%, ${hexToRgba(color, a * 0.8)} ${s[1]}%, ${hexToRgba(color, a * 0.45)} ${s[2]}%, ${hexToRgba(color, a * 0.12)} ${s[3]}%, ${hexToRgba(color, 0)} ${s[4]}%)`;
      });

      // Pure deep void base for premium contrast
      container.style.backgroundColor = "#06050a";
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

      container.style.backgroundColor = "#06050a";
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
      window.removeEventListener("mousemove", handleMouseMove);
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
