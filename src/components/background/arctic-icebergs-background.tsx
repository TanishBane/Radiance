"use client";

import React, { useEffect, useRef } from "react";
import createArcticIcebergs, { meta } from "@/lib/ascii-art/arctic-icebergs";

export interface ArcticIcebergsBackgroundProps {
  className?: string;
}

/**
 * ArcticIcebergsBackground: Generative Textmode Polar Landscape
 *
 * Icebergs drifting on a dark polar sea under a faint emerald aurora,
 * with oceanic swell rolling past them. Replaces the former star chase.
 */
export function ArcticIcebergsBackground({ className }: ArcticIcebergsBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number | null = null;
    let isDisposed = false;
    let isVisible = true;
    let lastFrameTime = 0;
    const targetFps = meta.fps || 20;
    const frameInterval = 1000 / targetFps;

    // Instantiate generator instance
    const renderGenerator = createArcticIcebergs();
    const { cols, rows, palette } = meta;

    // Check prefers-reduced-motion
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // Resize handler with high-DPI scaling
    let displayWidth = window.innerWidth;
    let displayHeight = window.innerHeight;

    const handleResize = () => {
      if (!canvas || isDisposed) return;
      displayWidth = window.innerWidth;
      displayHeight = window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      canvas.width = Math.floor(displayWidth * dpr);
      canvas.height = Math.floor(displayHeight * dpr);
      canvas.style.width = `${displayWidth}px`;
      canvas.style.height = `${displayHeight}px`;

      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };

    handleResize();
    window.addEventListener("resize", handleResize, { passive: true });

    // Visibility change handler to preserve battery/CPU when tab is inactive
    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      if (isVisible && !animId) {
        lastFrameTime = performance.now();
        animId = requestAnimationFrame(renderLoop);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const startTime = performance.now();

    const renderLoop = (now: number) => {
      if (isDisposed) return;

      if (!isVisible) {
        animId = null;
        return;
      }

      const elapsed = now - lastFrameTime;

      if (elapsed >= frameInterval) {
        lastFrameTime = now - (elapsed % frameInterval);

        // Time parameter `t` in seconds (slowed down if reduced motion)
        const t = prefersReducedMotion ? 1.0 : (now - startTime) * 0.001;

        // Generate the 100x36 frame
        const frame = renderGenerator(t);

        // Clear canvas with deep polar void background
        ctx.fillStyle = "#02050c";
        ctx.fillRect(0, 0, displayWidth, displayHeight);

        // Compute grid cell metrics
        const cellW = displayWidth / cols;
        const cellH = displayHeight / rows;
        const fontSize = Math.max(9, Math.floor(cellH * 0.92));

        ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        // Draw each grid character with its palette color
        const totalCells = cols * rows;
        for (let idx = 0; idx < totalCells; idx++) {
          const ch = frame.ch[idx];
          if (!ch || ch === " ") continue;

          const colorKey = frame.co[idx];
          const colorHex = palette[colorKey] || "#ffffff";

          const x = idx % cols;
          const y = Math.floor(idx / cols);

          const cx = (x + 0.5) * cellW;
          const cy = (y + 0.5) * cellH;

          ctx.fillStyle = colorHex;
          ctx.fillText(ch, cx, cy);
        }

        // If reduced motion, one frame is enough
        if (prefersReducedMotion) {
          animId = null;
          return;
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    animId = requestAnimationFrame(renderLoop);

    return () => {
      isDisposed = true;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={`fixed inset-0 pointer-events-none -z-10 w-full h-full select-none ${className || ""}`}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        zIndex: 0,
        pointerEvents: "none",
        backgroundColor: "#02050c",
      }}
      aria-hidden="true"
    />
  );
}
