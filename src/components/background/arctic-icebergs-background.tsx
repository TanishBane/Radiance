"use client";

import React, { useEffect, useRef } from "react";
import createArcticIcebergs, { meta as icebergsMeta } from "@/lib/ascii-art/arctic-icebergs";
import createBalloonValley, {
  meta as valleyMeta,
  LEVELS as VALLEY_LEVELS,
  W as VALLEY_W,
  H as VALLEY_H,
} from "@/lib/ascii-art/balloon-valley-sunrise";
import createMoonlitSea, { meta as moonlitMeta } from "@/lib/ascii-art/moonlit-sea";
import createMountainSunrise, { meta as mountainMeta } from "@/lib/ascii-art/mountain-sunrise";
import createNycSkylineNight, { meta as skylineMeta } from "@/lib/ascii-art/nyc-skyline-night";
import createOrbitWindowEarth, {
  meta as earthMeta,
  LEVELS as EARTH_LEVELS,
  W as EARTH_W,
  H as EARTH_H,
} from "@/lib/ascii-art/orbit-window-earth";
import createAutumnRoadCyclist, {
  meta as cyclistMeta,
  LEVELS as CYCLIST_LEVELS,
  W as CYCLIST_W,
  H as CYCLIST_H,
} from "@/lib/ascii-art/autumn-road-cyclist";
import createAutumnPagodaMaples, {
  meta as pagodaMeta,
  LEVELS as PAGODA_LEVELS,
  W as PAGODA_W,
  H as PAGODA_H,
} from "@/lib/ascii-art/autumn-pagoda-maples";
import createFallingLeaves, { meta as leavesMeta } from "@/lib/ascii-art/falling-leaves";
import createAuroraCurtains, { meta as auroraMeta } from "@/lib/ascii-art/aurora-curtains";
import {
  computeLayerOpacities,
  planBackingStores,
  sectionProgress,
  MAX_FULL_RESOLUTION_LAYERS,
} from "@/lib/scroll/fade-pipeline";

export interface ArcticIcebergsBackgroundProps {
  className?: string;
}

type DrawFrame = (
  ctx: CanvasRenderingContext2D,
  time: number,
  width: number,
  height: number
) => void;

interface SceneDefinition {
  testId: string;
  sectionId: string | null;
  fps: number;
  createDraw: () => DrawFrame;
}

interface Scene {
  definition: SceneDefinition;
  canvas: HTMLCanvasElement | null;
  ctx: CanvasRenderingContext2D | null;
  draw: DrawFrame | null;
  frameInterval: number;
  allocated: boolean;
  active: boolean;
  near: boolean;
  hasFrame: boolean;
  drawnStatic: boolean;
  lastDraw: number;
  lastOpacity: number;
}

const CANVAS_FONT = '"Cascadia Code", "Fira Code", "Courier New", monospace';

interface CharacterFrame {
  ch: string[];
  co: number[];
}

interface LevelFrame {
  levels: ArrayLike<number>;
  colorIndices: ArrayLike<number>;
  palHex: string[];
}

function drawCharacterFrame(
  ctx: CanvasRenderingContext2D,
  frame: CharacterFrame,
  palette: string[],
  cols: number,
  rows: number,
  baseColor: string,
  fallbackColor: string,
  fontScale: number,
  width: number,
  height: number
) {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, width, height);

  const cellW = width / cols;
  const cellH = height / rows;
  const fontSize = Math.max(8, Math.floor(cellH * fontScale));
  ctx.font = `${fontSize}px ${CANVAS_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  // Group glyphs by colour so the context changes fillStyle once per colour
  // instead of once per character. Cells never overlap, so the painted result
  // is identical.
  const buckets = new Map<string, number[]>();
  const totalCells = cols * rows;
  for (let index = 0; index < totalCells; index += 1) {
    const char = frame.ch[index];
    if (!char || char === " ") continue;
    const color = palette[frame.co[index]] || fallbackColor;
    const bucket = buckets.get(color);
    if (bucket) bucket.push(index);
    else buckets.set(color, [index]);
  }

  for (const [color, indices] of buckets) {
    ctx.fillStyle = color;
    for (const index of indices) {
      const x = index % cols;
      const y = Math.floor(index / cols);
      ctx.fillText(frame.ch[index], (x + 0.5) * cellW, (y + 0.5) * cellH);
    }
  }
}

function drawLevelFrame(
  ctx: CanvasRenderingContext2D,
  frame: LevelFrame,
  levels: string,
  cols: number,
  rows: number,
  baseColor: string,
  fallbackColor: string,
  fontScale: number,
  width: number,
  height: number
) {
  ctx.fillStyle = baseColor;
  ctx.fillRect(0, 0, width, height);

  const cellW = width / cols;
  const cellH = height / rows;
  const fontSize = Math.max(8, Math.floor(cellH * fontScale));
  ctx.font = `${fontSize}px ${CANVAS_FONT}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";

  const buckets = new Map<string, number[]>();
  const totalCells = cols * rows;
  for (let index = 0; index < totalCells; index += 1) {
    const color = frame.palHex[frame.colorIndices[index]] || fallbackColor;
    const bucket = buckets.get(color);
    if (bucket) bucket.push(index);
    else buckets.set(color, [index]);
  }

  for (const [color, indices] of buckets) {
    ctx.fillStyle = color;
    for (const index of indices) {
      const x = index % cols;
      const y = Math.floor(index / cols);
      ctx.fillText(levels[frame.levels[index]], (x + 0.5) * cellW, (y + 0.5) * cellH);
    }
  }
}

const SCENE_DEFINITIONS: SceneDefinition[] = [
  {
    testId: "canvas-icebergs",
    sectionId: null,
    fps: icebergsMeta.fps || 20,
    createDraw: () => {
      const render = createArcticIcebergs();
      const { cols, rows, palette } = icebergsMeta;
      return (ctx, time, width, height) =>
        drawCharacterFrame(ctx, render(time), palette, cols, rows, "#02050c", "#ffffff", 0.92, width, height);
    },
  },
  {
    testId: "canvas-valley",
    sectionId: "problem",
    fps: valleyMeta.fps || 15,
    createDraw: () => {
      const render = createBalloonValley();
      return (ctx, time, width, height) =>
        drawLevelFrame(
          ctx,
          render(time),
          VALLEY_LEVELS,
          VALLEY_W,
          VALLEY_H,
          "#5a80b8",
          "#fff6e8",
          0.95,
          width,
          height
        );
    },
  },
  {
    testId: "canvas-moonlit",
    sectionId: "product",
    fps: moonlitMeta.fps || 20,
    createDraw: () => {
      const render = createMoonlitSea();
      const { cols, rows, palette } = moonlitMeta;
      return (ctx, time, width, height) =>
        drawCharacterFrame(ctx, render(time), palette, cols, rows, "#030612", "#dfe8ff", 0.92, width, height);
    },
  },
  {
    testId: "canvas-mountain",
    sectionId: "preview",
    fps: mountainMeta.fps || 20,
    createDraw: () => {
      const render = createMountainSunrise();
      const { cols, rows, palette } = mountainMeta;
      return (ctx, time, width, height) =>
        drawCharacterFrame(ctx, render(time), palette, cols, rows, "#1b1f4d", "#ffd27f", 0.92, width, height);
    },
  },
  {
    testId: "canvas-skyline",
    sectionId: "intelligence",
    fps: skylineMeta.fps || 15,
    createDraw: () => {
      const render = createNycSkylineNight();
      const { cols, rows, palette } = skylineMeta;
      return (ctx, time, width, height) =>
        drawCharacterFrame(ctx, render(time), palette, cols, rows, "#05071a", "#d9e2ff", 0.92, width, height);
    },
  },
  {
    testId: "canvas-earth",
    sectionId: "preferences",
    fps: earthMeta.fps || 15,
    createDraw: () => {
      const render = createOrbitWindowEarth();
      return (ctx, time, width, height) =>
        drawLevelFrame(
          ctx,
          render(time),
          EARTH_LEVELS,
          EARTH_W,
          EARTH_H,
          "#04060c",
          "#fffaf0",
          0.95,
          width,
          height
        );
    },
  },
  {
    testId: "canvas-cyclist",
    sectionId: "pipeline",
    fps: cyclistMeta.fps || 15,
    createDraw: () => {
      const render = createAutumnRoadCyclist();
      return (ctx, time, width, height) =>
        drawLevelFrame(
          ctx,
          render(time),
          CYCLIST_LEVELS,
          CYCLIST_W,
          CYCLIST_H,
          "#1a0c08",
          "#fff2cc",
          0.95,
          width,
          height
        );
    },
  },
  {
    testId: "canvas-pagoda",
    sectionId: "privacy",
    fps: pagodaMeta.fps || 15,
    createDraw: () => {
      const render = createAutumnPagodaMaples();
      return (ctx, time, width, height) =>
        drawLevelFrame(
          ctx,
          render(time),
          PAGODA_LEVELS,
          PAGODA_W,
          PAGODA_H,
          "#1e0e12",
          "#fffaea",
          0.95,
          width,
          height
        );
    },
  },
  {
    testId: "canvas-leaves",
    sectionId: "faq",
    fps: leavesMeta.fps || 24,
    createDraw: () => {
      const render = createFallingLeaves();
      const { cols, rows, palette } = leavesMeta;
      return (ctx, time, width, height) =>
        drawCharacterFrame(ctx, render(time), palette, cols, rows, "#1e120a", "#f0c48a", 0.92, width, height);
    },
  },
  {
    testId: "canvas-aurora",
    sectionId: "vision",
    fps: auroraMeta.fps || 20,
    createDraw: () => {
      const render = createAuroraCurtains();
      const { cols, rows, palette } = auroraMeta;
      return (ctx, time, width, height) =>
        drawCharacterFrame(ctx, render(time), palette, cols, rows, "#02040c", "#a8ffc8", 0.92, width, height);
    },
  },
];

/**
 * Fixed, ten-layer atmospheric canvas background.
 *
 * All ten canvases remain in the document because the public test ids and the
 * fixed container are part of the page contract. Only the layers that can
 * actually be seen keep a full-resolution backing store: the measured scroll
 * geometry never shows more than two layers at once. Inactive layers are
 * reduced to a 1x1 buffer, so the memory ceiling is two full canvases instead
 * of ten.
 *
 * A single animation pipeline owns every layer:
 * - one passive scroll listener marks the frame dirty,
 * - section offsets are measured once and refreshed by ResizeObserver,
 * - IntersectionObserver marks nearby sections for cheap pre-warming,
 * - visibilitychange pauses all work in background tabs,
 * - one requestAnimationFrame loop stops when no layer needs to move.
 */
export function ArcticIcebergsBackground({ className }: ArcticIcebergsBackgroundProps) {
  const canvasRefs = useRef<Array<HTMLCanvasElement | null>>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const scenes: Scene[] = SCENE_DEFINITIONS.map((definition, index) => {
      const canvas = canvasRefs.current[index] ?? null;
      let ctx: CanvasRenderingContext2D | null = null;
      try {
        ctx = canvas?.getContext("2d", { alpha: false }) ?? null;
      } catch {
        ctx = null;
      }
      return {
        definition,
        canvas,
        ctx,
        draw: null,
        frameInterval: 1000 / Math.max(1, definition.fps),
        allocated: false,
        active: false,
        near: true,
        hasFrame: false,
        drawnStatic: false,
        lastDraw: 0,
        lastOpacity: index === 0 ? 1 : 0,
      };
    });

    if (scenes.every((scene) => !scene.canvas)) return;

    const motionQuery =
      typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;
    let prefersReducedMotion = motionQuery?.matches ?? false;

    let disposed = false;
    let paused = typeof document !== "undefined" && document.visibilityState !== "visible";
    let rafId: number | null = null;
    let dirty = true;

    let viewportWidth = window.innerWidth;
    let viewportHeight = window.innerHeight;
    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let sectionTops: Array<number | null> = [];
    let exitTop: number | null = null;

    const startedAt = performance.now();

    const sceneBySection = new Map<Element, Scene>();
    for (const scene of scenes) {
      if (!scene.definition.sectionId) continue;
      const element = document.getElementById(scene.definition.sectionId);
      if (element) sceneBySection.set(element, scene);
    }

    function allocate(scene: Scene) {
      const canvas = scene.canvas;
      const ctx = scene.ctx;
      if (!canvas || !ctx) {
        scene.allocated = true;
        return;
      }
      const width = Math.max(1, Math.floor(viewportWidth * dpr));
      const height = Math.max(1, Math.floor(viewportHeight * dpr));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      canvas.style.width = `${viewportWidth}px`;
      canvas.style.height = `${viewportHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      scene.allocated = true;
      scene.hasFrame = false;
      scene.drawnStatic = false;
      scene.lastDraw = 0;
    }

    function release(scene: Scene) {
      const canvas = scene.canvas;
      if (!canvas) return;
      if (canvas.width !== 1 || canvas.height !== 1) {
        canvas.width = 1;
        canvas.height = 1;
      }
      scene.allocated = false;
      scene.active = false;
      scene.hasFrame = false;
      scene.drawnStatic = false;
      scene.lastDraw = 0;
    }

    function drawScene(scene: Scene, now: number, staticFrame: boolean) {
      const canvas = scene.canvas;
      const ctx = scene.ctx;
      if (!canvas || !ctx || !scene.allocated) return;
      if (!scene.draw) scene.draw = scene.definition.createDraw();
      const time = staticFrame || prefersReducedMotion ? 1 : (now - startedAt) * 0.001;
      scene.draw(ctx, time, viewportWidth, viewportHeight);
      scene.hasFrame = true;
      scene.lastDraw = now;
    }

    function measure() {
      viewportWidth = window.innerWidth;
      viewportHeight = window.innerHeight;
      dpr = Math.min(window.devicePixelRatio || 1, 2);

      sectionTops = scenes.map((scene) => {
        const id = scene.definition.sectionId;
        if (!id) return null;
        const element = document.getElementById(id);
        if (!element) return null;
        return element.getBoundingClientRect().top + window.scrollY;
      });
      const exitElement = document.getElementById("start");
      exitTop = exitElement ? exitElement.getBoundingClientRect().top + window.scrollY : null;

      for (const scene of scenes) {
        if (scene.allocated) allocate(scene);
      }
      dirty = true;
      ensureLoop();
    }

    function writeOpacity(scene: Scene, opacity: number) {
      const next = Math.round(opacity * 10000) / 10000;
      if (Math.abs(next - scene.lastOpacity) < 0.0001) return;
      if (scene.canvas) scene.canvas.style.opacity = String(next);
      scene.lastOpacity = next;
    }

    function update(now: number) {
      const scrollY = window.scrollY;

      const fades: number[] = [];
      for (let i = 1; i < scenes.length; i += 1) {
        const top = sectionTops[i];
        fades.push(top == null ? 0 : sectionProgress(top, scrollY, viewportHeight));
      }
      const exitFade = exitTop == null ? 0 : sectionProgress(exitTop, scrollY, viewportHeight);
      const opacities = computeLayerOpacities(fades, exitFade);

      const allocationSet = planBackingStores(opacities, MAX_FULL_RESOLUTION_LAYERS);
      if (allocationSet.size < MAX_FULL_RESOLUTION_LAYERS) {
        // Pre-warm the next scene while its section approaches the viewport.
        let frontIndex = 0;
        for (let i = 0; i < opacities.length; i += 1) {
          if (opacities[i] > 0.001) frontIndex = i;
        }
        const nextIndex = frontIndex + 1;
        if (nextIndex < scenes.length && scenes[nextIndex].near) {
          allocationSet.add(nextIndex);
        }
      }

      const activeSet = new Set<number>();
      for (let i = 0; i < opacities.length; i += 1) {
        if (opacities[i] > 0.001 && allocationSet.has(i)) activeSet.add(i);
      }

      // Allocate and paint incoming layers before raising their opacity so the
      // first visible frame already contains the artwork.
      for (const index of allocationSet) {
        const scene = scenes[index];
        if (!scene.allocated) {
          allocate(scene);
          if (!prefersReducedMotion && scene.ctx) drawScene(scene, now, false);
        }
      }

      for (let i = 0; i < scenes.length; i += 1) {
        const scene = scenes[i];
        writeOpacity(scene, opacities[i]);
        scene.active = activeSet.has(i);
        if (!scene.active && allocationSet.has(i) && !scene.hasFrame && scene.ctx) {
          // Pre-warmed layer: render one frame without keeping the loop alive.
          drawScene(scene, now, false);
        }
      }

      for (let i = 0; i < scenes.length; i += 1) {
        if (!allocationSet.has(i) && scenes[i].allocated) release(scenes[i]);
      }
    }

    function frame(now: number) {
      rafId = null;
      if (disposed || paused) return;
      if (dirty) {
        dirty = false;
        update(now);
      }

      let keepRunning = false;

      if (prefersReducedMotion) {
        for (const scene of scenes) {
          if (scene.active && !scene.drawnStatic) {
            drawScene(scene, now, true);
            scene.drawnStatic = true;
          }
        }
      } else {
        for (const scene of scenes) {
          if (!scene.active) continue;
          keepRunning = true;
          if (now - scene.lastDraw >= scene.frameInterval) drawScene(scene, now, false);
        }
      }

      if (keepRunning) rafId = window.requestAnimationFrame(frame);
    }

    function ensureLoop() {
      if (disposed || paused || rafId !== null) return;
      rafId = window.requestAnimationFrame(frame);
    }

    function onScroll() {
      dirty = true;
      ensureLoop();
    }

    function onVisibilityChange() {
      if (document.visibilityState === "visible") {
        paused = false;
        dirty = true;
        ensureLoop();
      } else {
        paused = true;
        if (rafId !== null) {
          window.cancelAnimationFrame(rafId);
          rafId = null;
        }
      }
    }

    function onMotionPreferenceChange(event: MediaQueryListEvent) {
      prefersReducedMotion = event.matches;
      for (const scene of scenes) {
        scene.drawnStatic = false;
        scene.hasFrame = false;
      }
      dirty = true;
      ensureLoop();
    }

    const resizeObserver =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(measure) : null;
    resizeObserver?.observe(document.documentElement);
    for (const element of sceneBySection.keys()) resizeObserver?.observe(element);

    const intersectionObserver =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver(
            (entries) => {
              for (const entry of entries) {
                const scene = sceneBySection.get(entry.target);
                if (scene) scene.near = entry.isIntersecting;
              }
              dirty = true;
              ensureLoop();
            },
            { rootMargin: "50% 0px 50% 0px" }
          )
        : null;
    for (const element of sceneBySection.keys()) intersectionObserver?.observe(element);

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", measure, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);
    motionQuery?.addEventListener("change", onMotionPreferenceChange);

    measure();

    return () => {
      disposed = true;
      if (rafId !== null) window.cancelAnimationFrame(rafId);
      rafId = null;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", measure);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      motionQuery?.removeEventListener("change", onMotionPreferenceChange);
      resizeObserver?.disconnect();
      intersectionObserver?.disconnect();
      for (const scene of scenes) release(scene);
    };
  }, []);

  return (
    <div
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
      {SCENE_DEFINITIONS.map((definition, index) => (
        <canvas
          key={definition.testId}
          ref={(element) => {
            canvasRefs.current[index] = element;
          }}
          data-testid={definition.testId}
          width={1}
          height={1}
          aria-hidden="true"
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            opacity: index === 0 ? 1 : 0,
          }}
        />
      ))}
    </div>
  );
}
