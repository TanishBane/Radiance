"use client";

import React, { useEffect, useRef } from "react";
import createArcticIcebergs, { meta as icebergsMeta } from "@/lib/ascii-art/arctic-icebergs";
import createBalloonValley, { meta as valleyMeta, LEVELS as VALLEY_LEVELS, W as VALLEY_W, H as VALLEY_H } from "@/lib/ascii-art/balloon-valley-sunrise";
import createMoonlitSea, { meta as moonlitMeta } from "@/lib/ascii-art/moonlit-sea";
import createMountainSunrise, { meta as mountainMeta } from "@/lib/ascii-art/mountain-sunrise";
import createNycSkylineNight, { meta as skylineMeta } from "@/lib/ascii-art/nyc-skyline-night";
import createOrbitWindowEarth, { meta as earthMeta, LEVELS as EARTH_LEVELS, W as EARTH_W, H as EARTH_H } from "@/lib/ascii-art/orbit-window-earth";
import createAutumnRoadCyclist, { meta as cyclistMeta, LEVELS as CYCLIST_LEVELS, W as CYCLIST_W, H as CYCLIST_H } from "@/lib/ascii-art/autumn-road-cyclist";
import createAutumnPagodaMaples, { meta as pagodaMeta, LEVELS as PAGODA_LEVELS, W as PAGODA_W, H as PAGODA_H } from "@/lib/ascii-art/autumn-pagoda-maples";
import createFallingLeaves, { meta as leavesMeta } from "@/lib/ascii-art/falling-leaves";
import createAuroraCurtains, { meta as auroraMeta } from "@/lib/ascii-art/aurora-curtains";

export interface ArcticIcebergsBackgroundProps {
  className?: string;
}

function drawAsciiCells(
  ctx: CanvasRenderingContext2D,
  cols: number,
  rows: number,
  cellW: number,
  cellH: number,
  glyphAt: (index: number) => string,
  colorAt: (index: number) => string
) {
  for (let index = 0; index < cols * rows; index++) {
    const glyph = glyphAt(index);
    if (!glyph || glyph === " ") continue;

    ctx.fillStyle = colorAt(index);
    const x = index % cols;
    const y = Math.floor(index / cols);
    ctx.fillText(glyph, (x + 0.5) * cellW, (y + 0.5) * cellH);
  }
}

interface LayerController {
  canvas: HTMLCanvasElement;
  renderFrame: (t: number) => void;
  targetFps: number;
  isActive: boolean;
  start: () => void;
  stop: () => void;
  resize: () => void;
  destroy: () => void;
}

export function ArcticIcebergsBackground({ className }: ArcticIcebergsBackgroundProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasIcebergsRef = useRef<HTMLCanvasElement | null>(null);
  const canvasValleyRef = useRef<HTMLCanvasElement | null>(null);
  const canvasMoonlitRef = useRef<HTMLCanvasElement | null>(null);
  const canvasMountainRef = useRef<HTMLCanvasElement | null>(null);
  const canvasSkylineRef = useRef<HTMLCanvasElement | null>(null);
  const canvasEarthRef = useRef<HTMLCanvasElement | null>(null);
  const canvasCyclistRef = useRef<HTMLCanvasElement | null>(null);
  const canvasPagodaRef = useRef<HTMLCanvasElement | null>(null);
  const canvasLeavesRef = useRef<HTMLCanvasElement | null>(null);
  const canvasAuroraRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let isDisposed = false;
    let ticking = false;
    let scrollRafId: number | null = null;

    const motionQuery =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    let prefersReducedMotion = motionQuery ? motionQuery.matches : false;

    // Helper to create a single layer controller
    function initLayer(
      canvas: HTMLCanvasElement | null,
      targetFps: number,
      renderFn: (ctx: CanvasRenderingContext2D, width: number, height: number, t: number) => void
    ): LayerController | null {
      if (!canvas || typeof canvas.getContext !== "function") return null;

      let ctx: CanvasRenderingContext2D | null = null;
      try {
        ctx = canvas.getContext("2d", { alpha: false });
      } catch {
        return null;
      }
      if (!ctx) return null;

      let animId: number | null = null;
      let lastFrameTime = 0;
      let isActive = false;
      const frameInterval = 1000 / targetFps;
      const startTime = performance.now();

      let displayWidth = window.innerWidth;
      let displayHeight = window.innerHeight;

      const resize = () => {
        if (!canvas || !ctx || isDisposed) return;
        displayWidth = window.innerWidth;
        displayHeight = window.innerHeight;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);

        canvas.width = Math.floor(displayWidth * dpr);
        canvas.height = Math.floor(displayHeight * dpr);
        canvas.style.width = `${displayWidth}px`;
        canvas.style.height = `${displayHeight}px`;

        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);

        if (prefersReducedMotion && isActive) {
          renderFn(ctx, displayWidth, displayHeight, 1.0);
        }
      };

      const loop = (now: number) => {
        if (isDisposed || !isActive || document.hidden || prefersReducedMotion || !ctx) {
          animId = null;
          return;
        }

        const elapsed = now - lastFrameTime;
        if (elapsed >= frameInterval) {
          lastFrameTime = now - (elapsed % frameInterval);
          const t = (now - startTime) * 0.001;
          renderFn(ctx, displayWidth, displayHeight, t);
        }

        animId = requestAnimationFrame(loop);
      };

      const start = () => {
        if (isDisposed || document.hidden) return;
        isActive = true;

        if (prefersReducedMotion) {
          if (ctx) renderFn(ctx, displayWidth, displayHeight, 1.0);
          return;
        }

        if (animId === null) {
          lastFrameTime = performance.now();
          animId = requestAnimationFrame(loop);
        }
      };

      const stop = () => {
        isActive = false;
        if (animId !== null) {
          cancelAnimationFrame(animId);
          animId = null;
        }
      };

      resize();

      return {
        canvas,
        targetFps,
        get isActive() {
          return isActive;
        },
        set isActive(val: boolean) {
          isActive = val;
        },
        renderFrame: (t: number) => {
          if (ctx) renderFn(ctx, displayWidth, displayHeight, t);
        },
        start,
        stop,
        resize,
        destroy: () => {
          stop();
        },
      };
    }

    // 1. Icebergs
    const renderIcebergsGen = createArcticIcebergs();
    const layerIcebergs = initLayer(canvasIcebergsRef.current, icebergsMeta.fps || 20, (ctx, w, h, t) => {
      const frame = renderIcebergsGen(t);
      ctx.fillStyle = "#02050c";
      ctx.fillRect(0, 0, w, h);
      const cellW = w / icebergsMeta.cols;
      const cellH = h / icebergsMeta.rows;
      const fontSize = Math.max(9, Math.floor(cellH * 0.92));
      ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      drawAsciiCells(ctx, icebergsMeta.cols, icebergsMeta.rows, cellW, cellH, (i) => frame.ch[i] || " ", (i) => icebergsMeta.palette[frame.co[i]] || "#ffffff");
    });

    // 2. Balloon Valley
    const renderValleyGen = createBalloonValley();
    const layerValley = initLayer(canvasValleyRef.current, valleyMeta.fps || 15, (ctx, w, h, t) => {
      const frame = renderValleyGen(t);
      ctx.fillStyle = "#5a80b8";
      ctx.fillRect(0, 0, w, h);
      const cellW = w / VALLEY_W;
      const cellH = h / VALLEY_H;
      const fontSize = Math.max(8, Math.floor(cellH * 0.95));
      ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      drawAsciiCells(ctx, VALLEY_W, VALLEY_H, cellW, cellH, (i) => VALLEY_LEVELS[frame.levels[i]] || " ", (i) => frame.palHex[frame.colorIndices[i]] || "#fff6e8");
    });

    // 3. Moonlit Sea
    const renderMoonlitGen = createMoonlitSea();
    const layerMoonlit = initLayer(canvasMoonlitRef.current, moonlitMeta.fps || 20, (ctx, w, h, t) => {
      const frame = renderMoonlitGen(t);
      ctx.fillStyle = "#030612";
      ctx.fillRect(0, 0, w, h);
      const cellW = w / moonlitMeta.cols;
      const cellH = h / moonlitMeta.rows;
      const fontSize = Math.max(9, Math.floor(cellH * 0.92));
      ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      drawAsciiCells(ctx, moonlitMeta.cols, moonlitMeta.rows, cellW, cellH, (i) => frame.ch[i] || " ", (i) => moonlitMeta.palette[frame.co[i]] || "#dfe8ff");
    });

    // 4. Mountain Sunrise
    const renderMountainGen = createMountainSunrise();
    const layerMountain = initLayer(canvasMountainRef.current, mountainMeta.fps || 20, (ctx, w, h, t) => {
      const frame = renderMountainGen(t);
      ctx.fillStyle = "#1b1f4d";
      ctx.fillRect(0, 0, w, h);
      const cellW = w / mountainMeta.cols;
      const cellH = h / mountainMeta.rows;
      const fontSize = Math.max(9, Math.floor(cellH * 0.92));
      ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      drawAsciiCells(ctx, mountainMeta.cols, mountainMeta.rows, cellW, cellH, (i) => frame.ch[i] || " ", (i) => mountainMeta.palette[frame.co[i]] || "#ffd27f");
    });

    // 5. Skyline Night
    const renderSkylineGen = createNycSkylineNight();
    const layerSkyline = initLayer(canvasSkylineRef.current, skylineMeta.fps || 15, (ctx, w, h, t) => {
      const frame = renderSkylineGen(t);
      ctx.fillStyle = "#05071a";
      ctx.fillRect(0, 0, w, h);
      const cellW = w / skylineMeta.cols;
      const cellH = h / skylineMeta.rows;
      const fontSize = Math.max(9, Math.floor(cellH * 0.92));
      ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      drawAsciiCells(ctx, skylineMeta.cols, skylineMeta.rows, cellW, cellH, (i) => frame.ch[i] || " ", (i) => skylineMeta.palette[frame.co[i]] || "#d9e2ff");
    });

    // 6. Orbit Earth
    const renderEarthGen = createOrbitWindowEarth();
    const layerEarth = initLayer(canvasEarthRef.current, earthMeta.fps || 15, (ctx, w, h, t) => {
      const frame = renderEarthGen(t);
      ctx.fillStyle = "#04060c";
      ctx.fillRect(0, 0, w, h);
      const cellW = w / EARTH_W;
      const cellH = h / EARTH_H;
      const fontSize = Math.max(8, Math.floor(cellH * 0.95));
      ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      drawAsciiCells(ctx, EARTH_W, EARTH_H, cellW, cellH, (i) => EARTH_LEVELS[frame.levels[i]] || " ", (i) => frame.palHex[frame.colorIndices[i]] || "#fffaf0");
    });

    // 7. Autumn Cyclist
    const renderCyclistGen = createAutumnRoadCyclist();
    const layerCyclist = initLayer(canvasCyclistRef.current, cyclistMeta.fps || 15, (ctx, w, h, t) => {
      const frame = renderCyclistGen(t);
      ctx.fillStyle = "#1a0c08";
      ctx.fillRect(0, 0, w, h);
      const cellW = w / CYCLIST_W;
      const cellH = h / CYCLIST_H;
      const fontSize = Math.max(8, Math.floor(cellH * 0.95));
      ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      drawAsciiCells(ctx, CYCLIST_W, CYCLIST_H, cellW, cellH, (i) => CYCLIST_LEVELS[frame.levels[i]] || " ", (i) => frame.palHex[frame.colorIndices[i]] || "#fff2cc");
    });

    // 8. Pagoda Maples
    const renderPagodaGen = createAutumnPagodaMaples();
    const layerPagoda = initLayer(canvasPagodaRef.current, pagodaMeta.fps || 15, (ctx, w, h, t) => {
      const frame = renderPagodaGen(t);
      ctx.fillStyle = "#1e0e12";
      ctx.fillRect(0, 0, w, h);
      const cellW = w / PAGODA_W;
      const cellH = h / PAGODA_H;
      const fontSize = Math.max(8, Math.floor(cellH * 0.95));
      ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      drawAsciiCells(ctx, PAGODA_W, PAGODA_H, cellW, cellH, (i) => PAGODA_LEVELS[frame.levels[i]] || " ", (i) => frame.palHex[frame.colorIndices[i]] || "#fffaea");
    });

    // 9. Falling Leaves
    const renderLeavesGen = createFallingLeaves();
    const layerLeaves = initLayer(canvasLeavesRef.current, leavesMeta.fps || 24, (ctx, w, h, t) => {
      const frame = renderLeavesGen(t);
      ctx.fillStyle = "#1e120a";
      ctx.fillRect(0, 0, w, h);
      const cellW = w / leavesMeta.cols;
      const cellH = h / leavesMeta.rows;
      const fontSize = Math.max(9, Math.floor(cellH * 0.92));
      ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      drawAsciiCells(ctx, leavesMeta.cols, leavesMeta.rows, cellW, cellH, (i) => frame.ch[i] || " ", (i) => leavesMeta.palette[frame.co[i]] || "#f0c48a");
    });

    // 10. Aurora Curtains
    const renderAuroraGen = createAuroraCurtains();
    const layerAurora = initLayer(canvasAuroraRef.current, auroraMeta.fps || 20, (ctx, w, h, t) => {
      const frame = renderAuroraGen(t);
      ctx.fillStyle = "#02040c";
      ctx.fillRect(0, 0, w, h);
      const cellW = w / auroraMeta.cols;
      const cellH = h / auroraMeta.rows;
      const fontSize = Math.max(9, Math.floor(cellH * 0.92));
      ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      drawAsciiCells(ctx, auroraMeta.cols, auroraMeta.rows, cellW, cellH, (i) => frame.ch[i] || " ", (i) => auroraMeta.palette[frame.co[i]] || "#a8ffc8");
    });

    const allLayers = [
      layerIcebergs,
      layerValley,
      layerMoonlit,
      layerMountain,
      layerSkyline,
      layerEarth,
      layerCyclist,
      layerPagoda,
      layerLeaves,
      layerAurora,
    ];

    // Scroll listener tracking section visibility and updating canvas opacity directly in the DOM
    const sectionIds = [
      "problem",
      "product",
      "preview",
      "intelligence",
      "preferences",
      "pipeline",
      "privacy",
      "faq",
      "vision",
      "start",
    ];

    // Pre-cached section vertical offsets to eliminate synchronous layout thrashing during scroll
    const cachedSectionTops: (number | null)[] = new Array(sectionIds.length).fill(null);
    let cachedVh = typeof window !== "undefined" ? window.innerHeight : 800;

    const measureSections = () => {
      if (isDisposed || typeof window === "undefined") return;
      cachedVh = window.innerHeight;
      const scrollY = window.scrollY || window.pageYOffset || 0;
      for (let i = 0; i < sectionIds.length; i++) {
        const el = document.getElementById(sectionIds[i]);
        if (el) {
          const rect = el.getBoundingClientRect();
          cachedSectionTops[i] = rect.top + scrollY;
        } else {
          cachedSectionTops[i] = null;
        }
      }
    };

    const updateFades = () => {
      if (isDisposed) return;
      const vh = cachedVh;
      const startFade = vh * 0.92;
      const endFade = vh * 0.22;
      const fadeDist = startFade - endFade;
      const scrollY = typeof window !== "undefined" ? (window.scrollY || window.pageYOffset || 0) : 0;

      const rawFades: number[] = new Array(10).fill(0);

      for (let i = 0; i < sectionIds.length; i++) {
        let sectionTop = cachedSectionTops[i];
        if (sectionTop === null) {
          // Fallback if section was not mounted when initial measure occurred
          const el = document.getElementById(sectionIds[i]);
          if (el) {
            const rect = el.getBoundingClientRect();
            sectionTop = rect.top + scrollY;
            cachedSectionTops[i] = sectionTop;
          }
        }
        if (sectionTop !== null) {
          const relativeTop = sectionTop - scrollY;
          const raw = Math.max(0, Math.min(1, (startFade - relativeTop) / fadeDist));
          rawFades[i] = raw * raw * (3 - 2 * raw);
        }
      }

      const [fVal, fMoon, fMount, fSky, fEarth, fCyc, fPag, fLea, fAur, fStart] = rawFades;

      // Cascading opacities matching cross-fade architecture
      const opacities: number[] = [
        Math.max(0, (1 - fVal) * (1 - fMoon) * (1 - fMount) * (1 - fSky) * (1 - fEarth) * (1 - fCyc) * (1 - fPag) * (1 - fLea) * (1 - fAur) * (1 - fStart)),
        Math.max(0, fVal * (1 - fMoon) * (1 - fMount) * (1 - fSky) * (1 - fEarth) * (1 - fCyc) * (1 - fPag) * (1 - fLea) * (1 - fAur) * (1 - fStart)),
        Math.max(0, fMoon * (1 - fMount) * (1 - fSky) * (1 - fEarth) * (1 - fCyc) * (1 - fPag) * (1 - fLea) * (1 - fAur) * (1 - fStart)),
        Math.max(0, fMount * (1 - fSky) * (1 - fEarth) * (1 - fCyc) * (1 - fPag) * (1 - fLea) * (1 - fAur) * (1 - fStart)),
        Math.max(0, fSky * (1 - fEarth) * (1 - fCyc) * (1 - fPag) * (1 - fLea) * (1 - fAur) * (1 - fStart)),
        Math.max(0, fEarth * (1 - fCyc) * (1 - fPag) * (1 - fLea) * (1 - fAur) * (1 - fStart)),
        Math.max(0, fCyc * (1 - fPag) * (1 - fLea) * (1 - fAur) * (1 - fStart)),
        Math.max(0, fPag * (1 - fLea) * (1 - fAur) * (1 - fStart)),
        Math.max(0, fLea * (1 - fAur) * (1 - fStart)),
        Math.max(0, fAur * (1 - fStart)),
      ];

      for (let i = 0; i < allLayers.length; i++) {
        const layer = allLayers[i];
        if (!layer) continue;
        const op = opacities[i];
        layer.canvas.style.opacity = op.toFixed(3);

        if (op > 0.005) {
          if (!layer.isActive) {
            layer.start();
          }
        } else {
          if (layer.isActive) {
            layer.stop();
          }
        }
      }
    };

    const onScroll = () => {
      if (!ticking) {
        scrollRafId = window.requestAnimationFrame(() => {
          updateFades();
          ticking = false;
          scrollRafId = null;
        });
        ticking = true;
      }
    };

    const onResize = () => {
      allLayers.forEach((l) => l?.resize());
      measureSections();
      onScroll();
    };

    const onVisibilityChange = () => {
      if (document.hidden) {
        allLayers.forEach((l) => l?.stop());
      } else {
        updateFades();
      }
    };

    const onMotionChange = (e: MediaQueryListEvent) => {
      prefersReducedMotion = e.matches;
      if (prefersReducedMotion) {
        allLayers.forEach((l) => {
          l?.stop();
          if (parseFloat(l?.canvas.style.opacity || "0") > 0.005) {
            l?.renderFrame(1.0);
          }
        });
      } else {
        updateFades();
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    if (motionQuery && typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", onMotionChange);
    }

    // Initial section layout caching & activation pass
    measureSections();
    updateFades();

    return () => {
      isDisposed = true;
      if (scrollRafId !== null) cancelAnimationFrame(scrollRafId);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onResize);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      if (motionQuery && typeof motionQuery.removeEventListener === "function") {
        motionQuery.removeEventListener("change", onMotionChange);
      }
      allLayers.forEach((l) => l?.destroy());
    };
  }, []);

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
          opacity: 1,
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-hidden="true"
      />

      {/* 2. Balloon Valley Sunrise Layer */}
      <canvas
        ref={canvasValleyRef}
        data-testid="canvas-valley"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-hidden="true"
      />

      {/* 3. Moonlit Sea Layer */}
      <canvas
        ref={canvasMoonlitRef}
        data-testid="canvas-moonlit"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-hidden="true"
      />

      {/* 4. Mountain Sunrise Layer */}
      <canvas
        ref={canvasMountainRef}
        data-testid="canvas-mountain"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-hidden="true"
      />

      {/* 5. City Skyline Night Layer */}
      <canvas
        ref={canvasSkylineRef}
        data-testid="canvas-skyline"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-hidden="true"
      />

      {/* 6. Orbit Window Earth Layer */}
      <canvas
        ref={canvasEarthRef}
        data-testid="canvas-earth"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-hidden="true"
      />

      {/* 7. Autumn Road Cyclist Layer */}
      <canvas
        ref={canvasCyclistRef}
        data-testid="canvas-cyclist"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-hidden="true"
      />

      {/* 8. Autumn Pagoda Maples Layer */}
      <canvas
        ref={canvasPagodaRef}
        data-testid="canvas-pagoda"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-hidden="true"
      />

      {/* 9. Falling Leaves Layer */}
      <canvas
        ref={canvasLeavesRef}
        data-testid="canvas-leaves"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-hidden="true"
      />

      {/* 10. Aurora Curtains Layer */}
      <canvas
        ref={canvasAuroraRef}
        data-testid="canvas-aurora"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: 0,
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
