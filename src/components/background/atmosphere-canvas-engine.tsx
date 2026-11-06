"use client";

import React, { useEffect, useRef } from "react";
import { ColorTheme, GradientStyle } from "@/lib/types/theme";

interface AtmosphereCanvasEngineProps {
  theme: ColorTheme;
  engine: GradientStyle;
}

// Convert hex to rgb tuple
function hexToRgb(hex: string): [number, number, number] {
  let c = hex.replace("#", "").trim();
  if (c.length === 3) {
    c = c
      .split("")
      .map((ch) => ch + ch)
      .join("");
  }
  const num = parseInt(c, 16);
  if (isNaN(num)) return [232, 168, 73];
  return [(num >> 16) & 255, (num >> 8) & 255, num & 255];
}

const CANVAS_ENGINES: GradientStyle[] = [
  "silk-caustics",
  "aurora-curtains",
  "spectral-rays",
  "topographic-flow",
  "quantum-field",
  "liquid-lava",
  "matrix-rain",
  "celestial-dust",
  "radial-pulse",
  "neural-lattice",
  "bokeh-blur",
];

export function AtmosphereCanvasEngine({ theme, engine }: AtmosphereCanvasEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!CANVAS_ENGINES.includes(engine)) {
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const [r1, g1, b1] = hexToRgb(theme.accent);
    const [r2, g2, b2] = hexToRgb(theme.accentB);
    const [r3, g3, b3] = hexToRgb(theme.accentC);

    let isRunning = true;
    let frame = 0;

    // ── Engine 1: Silk Caustics (Replaces Bloom Mesh with Anisotropic Refraction) ──
    const drawSilkCaustics = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      const ribbons = 6;
      for (let r = 0; r < ribbons; r++) {
        ctx.beginPath();
        const baseColor =
          r % 3 === 0
            ? `rgba(${r1}, ${g1}, ${b1}, 0.14)`
            : r % 3 === 1
            ? `rgba(${r2}, ${g2}, ${b2}, 0.12)`
            : `rgba(${r3}, ${g3}, ${b3}, 0.10)`;
        ctx.strokeStyle = baseColor;
        ctx.lineWidth = 1.6;

        const phase = r * 0.95;
        const cy = height * 0.18 + r * height * 0.13;
        for (let x = 0; x <= width; x += 16) {
          const normX = x / width;
          const y =
            cy +
            Math.sin(normX * 5.2 + t * 0.45 + phase) * 44 +
            Math.cos(normX * 3.1 - t * 0.3 + phase * 0.7) * 22;
          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        // Translucent under-wash gradient
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        ctx.closePath();
        const grad = ctx.createLinearGradient(0, cy - 40, 0, height);
        grad.addColorStop(0, baseColor.replace(/[\d\.]+\)$/, "0.035)"));
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fill();
      }
    };

    // ── Engine 2: Aurora Curtains ──
    const drawAuroraCurtains = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      const numWaves = 4;
      for (let w = 0; w < numWaves; w++) {
        ctx.beginPath();
        ctx.moveTo(0, height);

        const waveOffset = w * 0.8;
        const color = w % 2 === 0 ? `rgba(${r1}, ${g1}, ${b1}, 0.15)` : `rgba(${r2}, ${g2}, ${b2}, 0.12)`;
        ctx.fillStyle = color;

        for (let x = 0; x <= width; x += 15) {
          const normX = x / width;
          const y =
            height * 0.45 +
            Math.sin(normX * 4 + t * 0.8 + waveOffset) * 80 +
            Math.sin(normX * 8 - t * 0.5) * 40 +
            w * 40;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();
        ctx.fill();
      }
    };

    // ── Engine 3: Spectral Rays (Replaces Hyper Warp with Volumetric Light Dispersion) ──
    const drawSpectralRays = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      const numRays = 5;
      const angle = Math.PI / 4; // 45 deg diagonal sweep
      for (let i = 0; i < numRays; i++) {
        const rayOffset = (i / numRays) * width * 1.5 - width * 0.25;
        const drift = Math.sin(t * 0.25 + i * 1.1) * 60;
        const originX = rayOffset + drift;
        const rayWidth = 140 + Math.sin(t * 0.4 + i) * 35;
        const alpha = Math.sin(t * 0.5 + i * 0.8) * 0.035 + 0.065;

        const grad = ctx.createLinearGradient(
          originX,
          0,
          originX + Math.cos(angle) * height * 1.4,
          height
        );
        const col = i % 2 === 0 ? `rgba(${r1}, ${g1}, ${b1}` : `rgba(${r2}, ${g2}, ${b2}`;
        grad.addColorStop(0, `${col}, 0)`);
        grad.addColorStop(0.3, `${col}, ${alpha})`);
        grad.addColorStop(0.7, `${col}, ${alpha * 0.6})`);
        grad.addColorStop(1, `${col}, 0)`);

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(originX - rayWidth / 2, 0);
        ctx.lineTo(originX + rayWidth / 2, 0);
        ctx.lineTo(originX + rayWidth / 2 + Math.tan(angle * 0.6) * height, height);
        ctx.lineTo(originX - rayWidth / 2 + Math.tan(angle * 0.6) * height, height);
        ctx.closePath();
        ctx.fill();
      }
    };

    // ── Engine 4: Topographic Flow (Replaces Tron Grid with Generative Isolines) ──
    const drawTopographicFlow = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      const numLevels = 10;
      for (let lvl = 0; lvl < numLevels; lvl++) {
        const yBase = height * 0.15 + (lvl / numLevels) * height * 0.75;
        const color = lvl % 2 === 0
          ? `rgba(${r1}, ${g1}, ${b1}, 0.22)`
          : `rgba(${r2}, ${g2}, ${b2}, 0.16)`;

        ctx.strokeStyle = color;
        ctx.lineWidth = 0.9;
        ctx.beginPath();

        for (let x = 0; x <= width; x += 14) {
          const nx = x / width;
          const elevation =
            Math.sin(nx * 6 + t * 0.35 + lvl * 0.5) * 32 +
            Math.cos(nx * 12 - t * 0.2 + lvl * 0.8) * 16 +
            Math.sin(nx * 3 + lvl * 0.4) * 20;
          const y = yBase + elevation;

          if (x === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    };

    // ── Engine 5: Quantum Constellations ──
    interface Node {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }
    const nodes: Node[] = Array.from({ length: 65 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.8,
      vy: (Math.random() - 0.5) * 0.8,
      radius: Math.random() * 2 + 1,
    }));

    const drawQuantumField = () => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      nodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.fillStyle = `rgba(${r2}, ${g2}, ${b2}, 0.7)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connection lines
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            const alpha = (1 - dist / 120) * 0.25;
            ctx.strokeStyle = `rgba(${r1}, ${g1}, ${b1}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // ── Engine 6: Molten Metablobs ──
    interface Blob {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      color: string;
    }
    const blobs: Blob[] = [
      { x: width * 0.3, y: height * 0.4, vx: 0.4, vy: 0.3, r: 160, color: `rgba(${r1}, ${g1}, ${b1}, 0.25)` },
      { x: width * 0.7, y: height * 0.6, vx: -0.3, vy: -0.4, r: 190, color: `rgba(${r2}, ${g2}, ${b2}, 0.20)` },
      { x: width * 0.5, y: height * 0.8, vx: 0.2, vy: -0.3, r: 140, color: `rgba(${r3}, ${g3}, ${b3}, 0.22)` },
      { x: width * 0.2, y: height * 0.7, vx: -0.2, vy: 0.2, r: 120, color: `rgba(${r1}, ${g1}, ${b1}, 0.18)` },
    ];

    const drawLiquidLava = () => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      blobs.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x - b.r < 0 || b.x + b.r > width) b.vx *= -1;
        if (b.y - b.r < 0 || b.y + b.r > height) b.vy *= -1;

        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, b.color);
        grad.addColorStop(0.7, b.color.replace(/[\d\.]+\)$/, "0.08)"));
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // ── Engine 7: Digital Glyph Rain (Matrix) ──
    const glyphs = "01アイウエオカキクケコサシスセソタチツテトRADIANCE";
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);

    const drawMatrixRain = () => {
      ctx.fillStyle = "rgba(6, 6, 10, 0.12)";
      ctx.fillRect(0, 0, width, height);

      ctx.fillStyle = `rgba(${r1}, ${g1}, ${b1}, 0.85)`;
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = glyphs[Math.floor(Math.random() * glyphs.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.fillText(text, x, y);

        if (y > height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    // ── Engine 8: Celestial Dust (Replaces Zen Obsidian with Tranquil Brownian Particulate) ──
    interface CelestialParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      phase: number;
      depth: number;
    }
    const dustParticles: CelestialParticle[] = Array.from({ length: 95 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.35 - 0.05,
      r: Math.random() * 2.2 + 0.8,
      alpha: Math.random() * 0.35 + 0.15,
      phase: Math.random() * Math.PI * 2,
      depth: Math.random(),
    }));

    const drawCelestialDust = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      dustParticles.forEach((p) => {
        p.x += p.vx + Math.sin(t * 0.4 + p.phase) * 0.15;
        p.y += p.vy;

        if (p.y < -10) p.y = height + 10;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;

        const pulseAlpha = p.alpha * (Math.sin(t * 1.4 + p.phase) * 0.3 + 0.7);
        const col = p.depth > 0.5 ? `rgba(${r2}, ${g2}, ${b2}` : `rgba(${r1}, ${g1}, ${b1}`;

        // Soft aura
        ctx.fillStyle = `${col}, ${pulseAlpha * 0.35})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r * 2.2, 0, Math.PI * 2);
        ctx.fill();

        // Core
        ctx.fillStyle = `${col}, ${pulseAlpha})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // ── Engine 9: Harmonic Radial Pulse ──
    const drawRadialPulse = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.sqrt(cx * cx + cy * cy);
      const ringCount = 6;

      for (let i = 0; i < ringCount; i++) {
        const progress = ((t * 0.3 + i / ringCount) % 1);
        const r = progress * maxR;
        const alpha = Math.sin(progress * Math.PI) * 0.22;

        ctx.strokeStyle = `rgba(${r1}, ${g1}, ${b1}, ${alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    // ── Engine 10: Neural Lattice (Replaces Stellar Vortex with Cognitive Graph Topology) ──
    interface LatticeNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      phase: number;
    }
    const latticeNodes: LatticeNode[] = Array.from({ length: 48 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 1.8 + 1.2,
      phase: Math.random() * Math.PI * 2,
    }));

    const drawNeuralLattice = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      // Update positions
      latticeNodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 10 || n.x > width - 10) n.vx *= -1;
        if (n.y < 10 || n.y > height - 10) n.vy *= -1;
      });

      // Draw connective synapses
      const maxDist = 135;
      for (let i = 0; i < latticeNodes.length; i++) {
        for (let j = i + 1; j < latticeNodes.length; j++) {
          const dx = latticeNodes[i].x - latticeNodes[j].x;
          const dy = latticeNodes[i].y - latticeNodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const norm = 1 - dist / maxDist;
            const alpha = norm * norm * 0.28;
            ctx.strokeStyle = `rgba(${r1}, ${g1}, ${b1}, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.beginPath();
            ctx.moveTo(latticeNodes[i].x, latticeNodes[i].y);
            ctx.lineTo(latticeNodes[j].x, latticeNodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw synaptic nodes
      latticeNodes.forEach((n) => {
        const pulse = Math.sin(t * 1.8 + n.phase) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(${r2}, ${g2}, ${b2}, ${pulse * 0.85})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${r3}, ${g3}, ${b3}, ${pulse * 0.25})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 2.8, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // ── Engine 11: Cinematic Bokeh Discs ──
    interface Bokeh {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
    }
    const bokehs: Bokeh[] = Array.from({ length: 24 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      r: Math.random() * 50 + 25,
      alpha: Math.random() * 0.15 + 0.05,
    }));

    const drawBokehBlur = () => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      bokehs.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x < -b.r) b.x = width + b.r;
        if (b.x > width + b.r) b.x = -b.r;
        if (b.y < -b.r) b.y = height + b.r;
        if (b.y > height + b.r) b.y = -b.r;

        const grad = ctx.createRadialGradient(b.x, b.y, b.r * 0.5, b.x, b.y, b.r);
        grad.addColorStop(0, `rgba(${r2}, ${g2}, ${b2}, ${b.alpha})`);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    if (prefersReducedMotion) {
      // Draw static first frame
      drawSilkCaustics(0);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      if (!isRunning) return;
      const t = (now - start) / 1000;
      frame++;

      switch (engine) {
        case "silk-caustics":
          drawSilkCaustics(t);
          break;
        case "aurora-curtains":
          drawAuroraCurtains(t);
          break;
        case "spectral-rays":
          drawSpectralRays(t);
          break;
        case "topographic-flow":
          drawTopographicFlow(t);
          break;
        case "quantum-field":
          drawQuantumField();
          break;
        case "liquid-lava":
          drawLiquidLava();
          break;
        case "matrix-rain":
          if (frame % 2 === 0) drawMatrixRain();
          break;
        case "celestial-dust":
          drawCelestialDust(t);
          break;
        case "radial-pulse":
          drawRadialPulse(t);
          break;
        case "neural-lattice":
          drawNeuralLattice(t);
          break;
        case "bokeh-blur":
          drawBokehBlur();
          break;
      }

      rafIdRef.current = requestAnimationFrame(tick);
    };

    rafIdRef.current = requestAnimationFrame(tick);

    const handleVisibility = () => {
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
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isRunning = false;
      if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [theme, engine]);

  if (!CANVAS_ENGINES.includes(engine)) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
}
