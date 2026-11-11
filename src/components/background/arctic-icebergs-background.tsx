"use client";

import React, { useEffect, useRef, useState } from "react";
import createArcticIcebergs, { meta as icebergsMeta } from "@/lib/ascii-art/arctic-icebergs";
import createBalloonValley, { meta as valleyMeta, LEVELS, W as VALLEY_W, H as VALLEY_H } from "@/lib/ascii-art/balloon-valley-sunrise";
import createMoonlitSea, { meta as moonlitMeta } from "@/lib/ascii-art/moonlit-sea";

export interface ArcticIcebergsBackgroundProps {
  className?: string;
}

/**
 * AtmosphericArtBackground:
 * Multi-Stage Generative ASCII Textmode Canvas System:
 * 1. Upper Page / Hero: Arctic Icebergs (dark polar night, emerald aurora curtain, drifting icebergs).
 * 2. Problem Comparison Section ("Your context shouldn't disappear..."):
 *    Slowly & smoothly cross-fades into Balloon Valley Sunrise (morning sun, misty mountain valleys, hot air balloons).
 * 3. Product Introduction Section ("Saved by you. Ready when it matters."):
 *    Slowly & smoothly cross-fades into Moonlit Sea (full moon, calm night ocean, breaking swell reflection, twinkling stars).
 */
export function ArcticIcebergsBackground({ className }: ArcticIcebergsBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasIcebergsRef = useRef<HTMLCanvasElement | null>(null);
  const canvasValleyRef = useRef<HTMLCanvasElement | null>(null);
  const canvasMoonlitRef = useRef<HTMLCanvasElement | null>(null);

  const [fadeValley, setFadeValley] = useState(0);
  const [fadeMoonlit, setFadeMoonlit] = useState(0);

  // Scroll listener tracking the Problem Comparison and Product Introduction sections
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const vh = window.innerHeight;

          // 1. Problem Comparison Section -> Transition to Balloon Valley
          const problemEl = document.getElementById("problem");
          if (problemEl) {
            const rect = problemEl.getBoundingClientRect();
            const startFade = vh * 0.92;
            const endFade = vh * 0.22;
            const raw = Math.max(0, Math.min(1, (startFade - rect.top) / (startFade - endFade)));
            const smooth = raw * raw * (3 - 2 * raw);
            setFadeValley(smooth);
          }

          // 2. Product Introduction Section ("Saved by you. Ready when it matters.") -> Transition to Moonlit Sea
          const productEl = document.getElementById("product");
          if (productEl) {
            const rect = productEl.getBoundingClientRect();
            const startFade = vh * 0.92;
            const endFade = vh * 0.22;
            const raw = Math.max(0, Math.min(1, (startFade - rect.top) / (startFade - endFade)));
            const smooth = raw * raw * (3 - 2 * raw);
            setFadeMoonlit(smooth);
          }

          ticking = false;
        });
        ticking = true;
      }
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // 1. Arctic Icebergs Canvas Controller
  useEffect(() => {
    const canvas = canvasIcebergsRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number | null = null;
    let isDisposed = false;
    let isVisible = true;
    let lastFrameTime = 0;
    const targetFps = icebergsMeta.fps || 20;
    const frameInterval = 1000 / targetFps;

    const renderIcebergs = createArcticIcebergs();
    const { cols, rows, palette } = icebergsMeta;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    const isLayerActive = fadeValley < 0.99 && fadeMoonlit < 0.99;

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      if (isVisible && !animId && isLayerActive) {
        lastFrameTime = performance.now();
        animId = requestAnimationFrame(renderLoop);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const startTime = performance.now();

    const renderLoop = (now: number) => {
      if (isDisposed) return;

      if (!isVisible || !isLayerActive) {
        animId = null;
        return;
      }

      const elapsed = now - lastFrameTime;
      if (elapsed >= frameInterval) {
        lastFrameTime = now - (elapsed % frameInterval);

        const t = prefersReducedMotion ? 1.0 : (now - startTime) * 0.001;
        const frame = renderIcebergs(t);

        // Dark polar void background
        ctx.fillStyle = "#02050c";
        ctx.fillRect(0, 0, displayWidth, displayHeight);

        const cellW = displayWidth / cols;
        const cellH = displayHeight / rows;
        const fontSize = Math.max(9, Math.floor(cellH * 0.92));

        ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const totalCells = cols * rows;
        for (let idx = 0; idx < totalCells; idx++) {
          const ch = frame.ch[idx];
          if (!ch || ch === " ") continue;

          const colorKey = frame.co[idx];
          const colorHex = palette[colorKey] || "#ffffff";

          const x = idx % cols;
          const y = Math.floor(idx / cols);

          ctx.fillStyle = colorHex;
          ctx.fillText(ch, (x + 0.5) * cellW, (y + 0.5) * cellH);
        }

        if (prefersReducedMotion) {
          animId = null;
          return;
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    if (isLayerActive) {
      animId = requestAnimationFrame(renderLoop);
    }

    return () => {
      isDisposed = true;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fadeValley, fadeMoonlit]);

  // 2. Balloon Valley Sunrise Canvas Controller
  useEffect(() => {
    const canvas = canvasValleyRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number | null = null;
    let isDisposed = false;
    let isVisible = true;
    let lastFrameTime = 0;
    const targetFps = valleyMeta.fps || 15;
    const frameInterval = 1000 / targetFps;

    const renderValley = createBalloonValley();
    const cols = VALLEY_W;
    const rows = VALLEY_H;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    const isLayerActive = fadeValley > 0.01 && fadeMoonlit < 0.99;

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      if (isVisible && !animId && isLayerActive) {
        lastFrameTime = performance.now();
        animId = requestAnimationFrame(renderLoop);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const startTime = performance.now();

    const renderLoop = (now: number) => {
      if (isDisposed) return;

      if (!isVisible || !isLayerActive) {
        animId = null;
        return;
      }

      const elapsed = now - lastFrameTime;
      if (elapsed >= frameInterval) {
        lastFrameTime = now - (elapsed % frameInterval);

        const t = prefersReducedMotion ? 1.0 : (now - startTime) * 0.001;
        const frame = renderValley(t);

        // Sunrise sky base wash
        ctx.fillStyle = "#5a80b8";
        ctx.fillRect(0, 0, displayWidth, displayHeight);

        const cellW = displayWidth / cols;
        const cellH = displayHeight / rows;
        const fontSize = Math.max(8, Math.floor(cellH * 0.95));

        ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const totalCells = cols * rows;
        for (let idx = 0; idx < totalCells; idx++) {
          const lv = frame.levels[idx];
          const ch = LEVELS[lv];
          const colorHex = frame.palHex[frame.colorIndices[idx]] || "#fff6e8";

          const x = idx % cols;
          const y = Math.floor(idx / cols);

          ctx.fillStyle = colorHex;
          ctx.fillText(ch, (x + 0.5) * cellW, (y + 0.5) * cellH);
        }

        if (prefersReducedMotion) {
          animId = null;
          return;
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    if (isLayerActive) {
      animId = requestAnimationFrame(renderLoop);
    }

    return () => {
      isDisposed = true;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fadeValley, fadeMoonlit]);

  // 3. Moonlit Sea Canvas Controller
  useEffect(() => {
    const canvas = canvasMoonlitRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number | null = null;
    let isDisposed = false;
    let isVisible = true;
    let lastFrameTime = 0;
    const targetFps = moonlitMeta.fps || 20;
    const frameInterval = 1000 / targetFps;

    const renderMoonlit = createMoonlitSea();
    const { cols, rows, palette } = moonlitMeta;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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

    const isLayerActive = fadeMoonlit > 0.01;

    const handleVisibilityChange = () => {
      isVisible = document.visibilityState === "visible";
      if (isVisible && !animId && isLayerActive) {
        lastFrameTime = performance.now();
        animId = requestAnimationFrame(renderLoop);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    const startTime = performance.now();

    const renderLoop = (now: number) => {
      if (isDisposed) return;

      if (!isVisible || !isLayerActive) {
        animId = null;
        return;
      }

      const elapsed = now - lastFrameTime;
      if (elapsed >= frameInterval) {
        lastFrameTime = now - (elapsed % frameInterval);

        const t = prefersReducedMotion ? 1.0 : (now - startTime) * 0.001;
        const frame = renderMoonlit(t);

        // Dark moonlit sea base wash
        ctx.fillStyle = "#030612";
        ctx.fillRect(0, 0, displayWidth, displayHeight);

        const cellW = displayWidth / cols;
        const cellH = displayHeight / rows;
        const fontSize = Math.max(9, Math.floor(cellH * 0.92));

        ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const totalCells = cols * rows;
        for (let idx = 0; idx < totalCells; idx++) {
          const ch = frame.ch[idx];
          if (!ch || ch === " ") continue;

          const colorKey = frame.co[idx];
          const colorHex = palette[colorKey] || "#dfe8ff";

          const x = idx % cols;
          const y = Math.floor(idx / cols);

          ctx.fillStyle = colorHex;
          ctx.fillText(ch, (x + 0.5) * cellW, (y + 0.5) * cellH);
        }

        if (prefersReducedMotion) {
          animId = null;
          return;
        }
      }

      animId = requestAnimationFrame(renderLoop);
    };

    if (isLayerActive) {
      animId = requestAnimationFrame(renderLoop);
    }

    return () => {
      isDisposed = true;
      if (animId) cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [fadeMoonlit]);

  return (
    <div
      ref={containerRef}
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
    >
      {/* 1. Arctic Icebergs Layer (Hero & Top Page) */}
      <canvas
        ref={canvasIcebergsRef}
        data-testid="canvas-icebergs"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: Math.max(0, (1 - fadeValley) * (1 - fadeMoonlit)),
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "opacity",
        }}
        aria-hidden="true"
      />

      {/* 2. Balloon Valley Sunrise Layer (Cross-fades in from Problem Section onwards) */}
      <canvas
        ref={canvasValleyRef}
        data-testid="canvas-valley"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: Math.max(0, fadeValley * (1 - fadeMoonlit)),
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "opacity",
        }}
        aria-hidden="true"
      />

      {/* 3. Moonlit Sea Layer (Cross-fades in from Product Section: "Saved by you. Ready when it matters.") */}
      <canvas
        ref={canvasMoonlitRef}
        data-testid="canvas-moonlit"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: fadeMoonlit,
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "opacity",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
