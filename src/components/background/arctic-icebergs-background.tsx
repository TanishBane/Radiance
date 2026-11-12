"use client";

import React, { useEffect, useRef, useState } from "react";
import createArcticIcebergs, { meta as icebergsMeta } from "@/lib/ascii-art/arctic-icebergs";
import createBalloonValley, { meta as valleyMeta, LEVELS, W as VALLEY_W, H as VALLEY_H } from "@/lib/ascii-art/balloon-valley-sunrise";
import createMoonlitSea, { meta as moonlitMeta } from "@/lib/ascii-art/moonlit-sea";
import createMountainSunrise, { meta as mountainMeta } from "@/lib/ascii-art/mountain-sunrise";
import createNycSkylineNight, { meta as skylineMeta } from "@/lib/ascii-art/nyc-skyline-night";
import createOrbitWindowEarth, { meta as earthMeta, LEVELS as EARTH_LEVELS, W as EARTH_W, H as EARTH_H } from "@/lib/ascii-art/orbit-window-earth";
import createAutumnRoadCyclist, { meta as cyclistMeta, LEVELS as CYCLIST_LEVELS, W as CYCLIST_W, H as CYCLIST_H } from "@/lib/ascii-art/autumn-road-cyclist";
import createAutumnPagodaMaples, { meta as pagodaMeta, LEVELS as PAGODA_LEVELS, W as PAGODA_W, H as PAGODA_H } from "@/lib/ascii-art/autumn-pagoda-maples";
import createFallingLeaves, { meta as leavesMeta } from "@/lib/ascii-art/falling-leaves";
import createAuroraCurtains, { meta as auroraMeta } from "@/lib/ascii-art/aurora-curtains";
import createStarryRidge, { meta as starryMeta, LEVELS as STARRY_LEVELS } from "@/lib/ascii-art/starry-ridge";

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
 * 4. Product Preview Section ("A walk through the current path"):
 *    Slowly & smoothly cross-fades into Mountain Sunrise (sun rising behind five layered mountain ranges, valley mist, drifting birds).
 * 5. Personal Intelligence Section ("An AI experience shaped around your context."):
 *    Slowly & smoothly cross-fades into City Skyline Night (dense skyscraper skyline, glowing windows, river reflection).
 * 6. Response Preferences Section ("An answer should feel right for you."):
 *    Slowly & smoothly cross-fades into Orbit Window Earth (space station window looking out at rotating Earth, cloud bands, rising limb sun).
 * 7. Context Pipeline Section ("The right context. At the right moment."):
 *    Slowly & smoothly cross-fades into Autumn Road Cyclist (sunlit forest road, canopy of gold/orange, drifting leaves, lone cyclist).
 * 8. Privacy Fortress Section ("Your context. Your choice."):
 *    Slowly & smoothly cross-fades into Autumn Pagoda Maples (five tier pagoda, evening sky, far hills, maples, arched bridge over mirrored pond, glowing lanterns, swaying branch, falling leaves).
 * 9. FAQ Section ("Questions, answered."):
 *    Slowly & smoothly cross-fades into Falling Leaves (autumn leaves tumbling and drifting down from a golden tree in a warm haze onto a carpet of fallen leaves).
 * 10. Future Vision Section ("Personal intelligence, with room to evolve."):
 *     Slowly & smoothly cross-fades into Aurora Curtains (three folded ribbons of aurora sway across the night sky, drifting rays, starry expanse, silhouetted hills).
 * 11. Final CTA Section ("Your next conversation can feel different."):
 *     Slowly & smoothly cross-fades into Starry Ridge (violet sky full of stars, Milky Way, dark mountain ridge, shooting stars).
 */
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
  const canvasStarryRef = useRef<HTMLCanvasElement | null>(null);

  const [fadeValley, setFadeValley] = useState(0);
  const [fadeMoonlit, setFadeMoonlit] = useState(0);
  const [fadeMountain, setFadeMountain] = useState(0);
  const [fadeSkyline, setFadeSkyline] = useState(0);
  const [fadeEarth, setFadeEarth] = useState(0);
  const [fadeCyclist, setFadeCyclist] = useState(0);
  const [fadePagoda, setFadePagoda] = useState(0);
  const [fadeLeaves, setFadeLeaves] = useState(0);
  const [fadeAurora, setFadeAurora] = useState(0);
  const [fadeStarry, setFadeStarry] = useState(0);

  // Scroll listener tracking #problem, #product, and #preview sections
  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          const vh = window.innerHeight;
          const startFade = vh * 0.92;
          const endFade = vh * 0.22;

          // 1. Problem Comparison Section -> Transition to Balloon Valley
          const problemEl = document.getElementById("problem");
          if (problemEl) {
            const rect = problemEl.getBoundingClientRect();
            const raw = Math.max(0, Math.min(1, (startFade - rect.top) / (startFade - endFade)));
            const smooth = raw * raw * (3 - 2 * raw);
            setFadeValley(smooth);
          }

          // 2. Product Introduction Section ("Saved by you...") -> Transition to Moonlit Sea
          const productEl = document.getElementById("product");
          if (productEl) {
            const rect = productEl.getBoundingClientRect();
            const raw = Math.max(0, Math.min(1, (startFade - rect.top) / (startFade - endFade)));
            const smooth = raw * raw * (3 - 2 * raw);
            setFadeMoonlit(smooth);
          }

          // 3. Product Preview Section ("A walk through the current path") -> Transition to Mountain Sunrise
          const previewEl = document.getElementById("preview");
          if (previewEl) {
            const rect = previewEl.getBoundingClientRect();
            const raw = Math.max(0, Math.min(1, (startFade - rect.top) / (startFade - endFade)));
            const smooth = raw * raw * (3 - 2 * raw);
            setFadeMountain(smooth);
          }

          // 4. Personal Intelligence Section ("An AI experience shaped around your context.") -> Transition to City Skyline Night
          const intelligenceEl = document.getElementById("intelligence");
          if (intelligenceEl) {
            const rect = intelligenceEl.getBoundingClientRect();
            const raw = Math.max(0, Math.min(1, (startFade - rect.top) / (startFade - endFade)));
            const smooth = raw * raw * (3 - 2 * raw);
            setFadeSkyline(smooth);
          }

          // 5. Response Preferences Section ("An answer should feel right for you.") -> Transition to Orbit Window Earth
          const preferencesEl = document.getElementById("preferences");
          if (preferencesEl) {
            const rect = preferencesEl.getBoundingClientRect();
            const raw = Math.max(0, Math.min(1, (startFade - rect.top) / (startFade - endFade)));
            const smooth = raw * raw * (3 - 2 * raw);
            setFadeEarth(smooth);
          }

          // 6. Context Pipeline Section ("The right context. At the right moment.") -> Transition to Autumn Road Cyclist
          const pipelineEl = document.getElementById("pipeline");
          if (pipelineEl) {
            const rect = pipelineEl.getBoundingClientRect();
            const raw = Math.max(0, Math.min(1, (startFade - rect.top) / (startFade - endFade)));
            const smooth = raw * raw * (3 - 2 * raw);
            setFadeCyclist(smooth);
          }

          // 7. Privacy Fortress Section ("Your context. Your choice.") -> Transition to Autumn Pagoda Maples
          const privacyEl = document.getElementById("privacy");
          if (privacyEl) {
            const rect = privacyEl.getBoundingClientRect();
            const raw = Math.max(0, Math.min(1, (startFade - rect.top) / (startFade - endFade)));
            const smooth = raw * raw * (3 - 2 * raw);
            setFadePagoda(smooth);
          }

          // 8. FAQ Section ("Questions, answered.") -> Transition to Falling Leaves
          const faqEl = document.getElementById("faq");
          if (faqEl) {
            const rect = faqEl.getBoundingClientRect();
            const raw = Math.max(0, Math.min(1, (startFade - rect.top) / (startFade - endFade)));
            const smooth = raw * raw * (3 - 2 * raw);
            setFadeLeaves(smooth);
          }

          // 9. Future Vision Section ("Personal intelligence, with room to evolve.") -> Transition to Aurora Curtains
          const visionEl = document.getElementById("vision");
          if (visionEl) {
            const rect = visionEl.getBoundingClientRect();
            const raw = Math.max(0, Math.min(1, (startFade - rect.top) / (startFade - endFade)));
            const smooth = raw * raw * (3 - 2 * raw);
            setFadeAurora(smooth);
          }

          // 10. Final CTA Section ("Your next conversation can feel different.") -> Transition to Starry Ridge
          const startEl = document.getElementById("start");
          if (startEl) {
            const rect = startEl.getBoundingClientRect();
            const raw = Math.max(0, Math.min(1, (startFade - rect.top) / (startFade - endFade)));
            const smooth = raw * raw * (3 - 2 * raw);
            setFadeStarry(smooth);
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

    const isLayerActive =
      fadeValley < 0.99 &&
      fadeMoonlit < 0.99 &&
      fadeMountain < 0.99 &&
      fadeSkyline < 0.99 &&
      fadeEarth < 0.99 &&
      fadeCyclist < 0.99 &&
      fadePagoda < 0.99 &&
      fadeLeaves < 0.99 &&
      fadeAurora < 0.99 &&
      fadeStarry < 0.99;

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
  }, [fadeValley, fadeMoonlit, fadeMountain, fadeSkyline, fadeEarth, fadeCyclist, fadePagoda, fadeLeaves, fadeAurora, fadeStarry]);

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

    const isLayerActive =
      fadeValley > 0.01 &&
      fadeMoonlit < 0.99 &&
      fadeMountain < 0.99 &&
      fadeSkyline < 0.99 &&
      fadeEarth < 0.99 &&
      fadeCyclist < 0.99 &&
      fadePagoda < 0.99 &&
      fadeLeaves < 0.99 &&
      fadeAurora < 0.99 &&
      fadeStarry < 0.99;

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
  }, [fadeValley, fadeMoonlit, fadeMountain, fadeSkyline, fadeEarth, fadeCyclist, fadePagoda, fadeLeaves, fadeAurora, fadeStarry]);

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

    const isLayerActive =
      fadeMoonlit > 0.01 &&
      fadeMountain < 0.99 &&
      fadeSkyline < 0.99 &&
      fadeEarth < 0.99 &&
      fadeCyclist < 0.99 &&
      fadePagoda < 0.99 &&
      fadeLeaves < 0.99 &&
      fadeAurora < 0.99 &&
      fadeStarry < 0.99;

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
  }, [fadeMoonlit, fadeMountain, fadeSkyline, fadeEarth, fadeCyclist, fadePagoda, fadeLeaves, fadeAurora, fadeStarry]);

  // 4. Mountain Sunrise Canvas Controller
  useEffect(() => {
    const canvas = canvasMountainRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number | null = null;
    let isDisposed = false;
    let isVisible = true;
    let lastFrameTime = 0;
    const targetFps = mountainMeta.fps || 20;
    const frameInterval = 1000 / targetFps;

    const renderMountain = createMountainSunrise();
    const { cols, rows, palette } = mountainMeta;

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

    const isLayerActive =
      fadeMountain > 0.01 &&
      fadeSkyline < 0.99 &&
      fadeEarth < 0.99 &&
      fadeCyclist < 0.99 &&
      fadePagoda < 0.99 &&
      fadeLeaves < 0.99 &&
      fadeAurora < 0.99 &&
      fadeStarry < 0.99;

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
        const frame = renderMountain(t);

        // Mountain twilight sky wash
        ctx.fillStyle = "#1b1f4d";
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
          const colorHex = palette[colorKey] || "#ffd27f";

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
  }, [fadeMountain, fadeSkyline, fadeEarth, fadeCyclist, fadePagoda, fadeLeaves, fadeAurora, fadeStarry]);

  // 5. City Skyline Night Canvas Controller
  useEffect(() => {
    const canvas = canvasSkylineRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number | null = null;
    let isDisposed = false;
    let isVisible = true;
    let lastFrameTime = 0;
    const targetFps = skylineMeta.fps || 15;
    const frameInterval = 1000 / targetFps;

    const renderSkyline = createNycSkylineNight();
    const { cols, rows, palette } = skylineMeta;

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

    const isLayerActive =
      fadeSkyline > 0.01 &&
      fadeEarth < 0.99 &&
      fadeCyclist < 0.99 &&
      fadePagoda < 0.99 &&
      fadeLeaves < 0.99 &&
      fadeAurora < 0.99 &&
      fadeStarry < 0.99;

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
        const frame = renderSkyline(t);

        // Night sky base wash
        ctx.fillStyle = "#05071a";
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
          const colorHex = palette[colorKey] || "#d9e2ff";

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
  }, [fadeSkyline, fadeEarth, fadeCyclist, fadePagoda, fadeLeaves, fadeAurora, fadeStarry]);

  // 6. Orbit Window Earth Canvas Controller
  useEffect(() => {
    const canvas = canvasEarthRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number | null = null;
    let isDisposed = false;
    let isVisible = true;
    let lastFrameTime = 0;
    const targetFps = earthMeta.fps || 15;
    const frameInterval = 1000 / targetFps;

    const renderEarth = createOrbitWindowEarth();
    const cols = EARTH_W;
    const rows = EARTH_H;

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

    const isLayerActive =
      fadeEarth > 0.01 &&
      fadeCyclist < 0.99 &&
      fadePagoda < 0.99 &&
      fadeLeaves < 0.99 &&
      fadeAurora < 0.99 &&
      fadeStarry < 0.99;

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
        const frame = renderEarth(t);

        // Deep space void base wash
        ctx.fillStyle = "#04060c";
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
          const ch = EARTH_LEVELS[lv];
          const colorHex = frame.palHex[frame.colorIndices[idx]] || "#fffaf0";

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
  }, [fadeEarth, fadeCyclist, fadePagoda, fadeLeaves, fadeAurora, fadeStarry]);

  // 7. Autumn Road Cyclist Canvas Controller
  useEffect(() => {
    const canvas = canvasCyclistRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number | null = null;
    let isDisposed = false;
    let isVisible = true;
    let lastFrameTime = 0;
    const targetFps = cyclistMeta.fps || 15;
    const frameInterval = 1000 / targetFps;

    const renderCyclist = createAutumnRoadCyclist();
    const cols = CYCLIST_W;
    const rows = CYCLIST_H;

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

    const isLayerActive =
      fadeCyclist > 0.01 &&
      fadePagoda < 0.99 &&
      fadeLeaves < 0.99 &&
      fadeAurora < 0.99 &&
      fadeStarry < 0.99;

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
        const frame = renderCyclist(t);

        // Autumn woodland dark base wash
        ctx.fillStyle = "#1a0c08";
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
          const ch = CYCLIST_LEVELS[lv];
          const colorHex = frame.palHex[frame.colorIndices[idx]] || "#fff2cc";

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
  }, [fadeCyclist, fadePagoda, fadeLeaves, fadeAurora, fadeStarry]);

  // 8. Autumn Pagoda Maples Canvas Controller
  useEffect(() => {
    const canvas = canvasPagodaRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number | null = null;
    let isDisposed = false;
    let isVisible = true;
    let lastFrameTime = 0;
    const targetFps = pagodaMeta.fps || 15;
    const frameInterval = 1000 / targetFps;

    const renderPagoda = createAutumnPagodaMaples();
    const cols = PAGODA_W;
    const rows = PAGODA_H;

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

    const isLayerActive =
      fadePagoda > 0.01 &&
      fadeLeaves < 0.99 &&
      fadeAurora < 0.99 &&
      fadeStarry < 0.99;

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
        const frame = renderPagoda(t);

        // Autumn dusk pagoda deep base wash
        ctx.fillStyle = "#1e0e12";
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
          const ch = PAGODA_LEVELS[lv];
          const colorHex = frame.palHex[frame.colorIndices[idx]] || "#fffaea";

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
  }, [fadePagoda, fadeLeaves, fadeAurora, fadeStarry]);

  // 9. Falling Leaves Canvas Controller
  useEffect(() => {
    const canvas = canvasLeavesRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number | null = null;
    let isDisposed = false;
    let isVisible = true;
    let lastFrameTime = 0;
    const targetFps = leavesMeta.fps || 24;
    const frameInterval = 1000 / targetFps;

    const renderLeaves = createFallingLeaves();
    const { cols, rows, palette } = leavesMeta;

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

    const isLayerActive =
      fadeLeaves > 0.01 &&
      fadeAurora < 0.99 &&
      fadeStarry < 0.99;

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
        const frame = renderLeaves(t);

        // Warm golden autumn haze deep base wash
        ctx.fillStyle = "#1e120a";
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
          const colorHex = palette[colorKey] || "#f0c48a";

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
  }, [fadeLeaves, fadeAurora, fadeStarry]);

  // 10. Aurora Curtains Canvas Controller
  useEffect(() => {
    const canvas = canvasAuroraRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number | null = null;
    let isDisposed = false;
    let isVisible = true;
    let lastFrameTime = 0;
    const targetFps = auroraMeta.fps || 20;
    const frameInterval = 1000 / targetFps;

    const renderAurora = createAuroraCurtains();
    const { cols, rows, palette } = auroraMeta;

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

    const isLayerActive = fadeAurora > 0.01 && fadeStarry < 0.99;

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
        const frame = renderAurora(t);

        // Deep polar night wash
        ctx.fillStyle = "#02040c";
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
          const colorHex = palette[colorKey] || "#a8ffc8";

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
  }, [fadeAurora, fadeStarry]);

  // 11. Starry Ridge Canvas Controller
  useEffect(() => {
    const canvas = canvasStarryRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d", { alpha: false });
    if (!ctx) return;

    let animId: number | null = null;
    let isDisposed = false;
    let isVisible = true;
    let lastFrameTime = 0;
    const targetFps = starryMeta.fps || 15;
    const frameInterval = 1000 / targetFps;

    const renderStarry = createStarryRidge();
    const cols = starryMeta.cols || 192;
    const rows = starryMeta.rows || 108;

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

    const isLayerActive = fadeStarry > 0.01;

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
        const frame = renderStarry(t);

        // Cosmic deep night wash
        ctx.fillStyle = "#020008";
        ctx.fillRect(0, 0, displayWidth, displayHeight);

        const cellW = displayWidth / cols;
        const cellH = displayHeight / rows;
        const fontSize = Math.max(8, Math.floor(cellH * 0.95));

        ctx.font = `${fontSize}px "Cascadia Code", "Fira Code", "Courier New", monospace`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const totalCells = cols * rows;
        for (let idx = 0; idx < totalCells; idx++) {
          const ch = frame.ch[idx];
          if (!ch || ch === " ") continue;

          const colorHex = frame.co[idx] || "#ffedce";

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
  }, [fadeStarry]);

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
          opacity: Math.max(0, (1 - fadeValley) * (1 - fadeMoonlit) * (1 - fadeMountain) * (1 - fadeSkyline) * (1 - fadeEarth) * (1 - fadeCyclist) * (1 - fadePagoda) * (1 - fadeLeaves) * (1 - fadeAurora) * (1 - fadeStarry)),
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
          opacity: Math.max(0, fadeValley * (1 - fadeMoonlit) * (1 - fadeMountain) * (1 - fadeSkyline) * (1 - fadeEarth) * (1 - fadeCyclist) * (1 - fadePagoda) * (1 - fadeLeaves) * (1 - fadeAurora) * (1 - fadeStarry)),
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
          opacity: Math.max(0, fadeMoonlit * (1 - fadeMountain) * (1 - fadeSkyline) * (1 - fadeEarth) * (1 - fadeCyclist) * (1 - fadePagoda) * (1 - fadeLeaves) * (1 - fadeAurora) * (1 - fadeStarry)),
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "opacity",
        }}
        aria-hidden="true"
      />

      {/* 4. Mountain Sunrise Layer (Cross-fades in from Product Preview Section: "A walk through the current path") */}
      <canvas
        ref={canvasMountainRef}
        data-testid="canvas-mountain"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: Math.max(0, fadeMountain * (1 - fadeSkyline) * (1 - fadeEarth) * (1 - fadeCyclist) * (1 - fadePagoda) * (1 - fadeLeaves) * (1 - fadeAurora) * (1 - fadeStarry)),
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "opacity",
        }}
        aria-hidden="true"
      />

      {/* 5. City Skyline Night Layer (Cross-fades in from Personal Intelligence Section: "An AI experience shaped around your context.") */}
      <canvas
        ref={canvasSkylineRef}
        data-testid="canvas-skyline"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: Math.max(0, fadeSkyline * (1 - fadeEarth) * (1 - fadeCyclist) * (1 - fadePagoda) * (1 - fadeLeaves) * (1 - fadeAurora) * (1 - fadeStarry)),
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "opacity",
        }}
        aria-hidden="true"
      />

      {/* 6. Orbit Window Earth Layer (Cross-fades in from Response Preferences Section: "An answer should feel right for you.") */}
      <canvas
        ref={canvasEarthRef}
        data-testid="canvas-earth"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: Math.max(0, fadeEarth * (1 - fadeCyclist) * (1 - fadePagoda) * (1 - fadeLeaves) * (1 - fadeAurora) * (1 - fadeStarry)),
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "opacity",
        }}
        aria-hidden="true"
      />

      {/* 7. Autumn Road Cyclist Layer (Cross-fades in from Context Pipeline Section: "The right context. At the right moment.") */}
      <canvas
        ref={canvasCyclistRef}
        data-testid="canvas-cyclist"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: Math.max(0, fadeCyclist * (1 - fadePagoda) * (1 - fadeLeaves) * (1 - fadeAurora) * (1 - fadeStarry)),
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "opacity",
        }}
        aria-hidden="true"
      />

      {/* 8. Autumn Pagoda Maples Layer (Cross-fades in from Privacy Fortress Section: "Your context. Your choice.") */}
      <canvas
        ref={canvasPagodaRef}
        data-testid="canvas-pagoda"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: Math.max(0, fadePagoda * (1 - fadeLeaves) * (1 - fadeAurora) * (1 - fadeStarry)),
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "opacity",
        }}
        aria-hidden="true"
      />

      {/* 9. Falling Leaves Layer (Cross-fades in from FAQ Section: "Questions, answered.") */}
      <canvas
        ref={canvasLeavesRef}
        data-testid="canvas-leaves"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: Math.max(0, fadeLeaves * (1 - fadeAurora) * (1 - fadeStarry)),
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "opacity",
        }}
        aria-hidden="true"
      />

      {/* 10. Aurora Curtains Layer (Cross-fades in from Future Vision Section: "Personal intelligence, with room to evolve.") */}
      <canvas
        ref={canvasAuroraRef}
        data-testid="canvas-aurora"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: Math.max(0, fadeAurora * (1 - fadeStarry)),
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "opacity",
        }}
        aria-hidden="true"
      />

      {/* 11. Starry Ridge Layer (Cross-fades in from Final CTA Section: "Your next conversation can feel different.") */}
      <canvas
        ref={canvasStarryRef}
        data-testid="canvas-starry"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          opacity: fadeStarry,
          transition: "opacity 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
          willChange: "opacity",
        }}
        aria-hidden="true"
      />
    </div>
  );
}
