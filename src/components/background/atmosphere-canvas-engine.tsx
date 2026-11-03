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

export function AtmosphereCanvasEngine({ theme, engine }: AtmosphereCanvasEngineProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafIdRef = useRef<number | null>(null);

  useEffect(() => {
    // Only handle canvas-based engines
    const canvasEngines = [
      "aurora-curtains",
      "warp-speed",
      "cyber-grid",
      "quantum-field",
      "liquid-lava",
      "matrix-rain",
      "zen-minimal",
      "radial-pulse",
      "particle-vortex",
      "bokeh-blur",
    ];

    if (!canvasEngines.includes(engine)) {
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

    // ── Engine 1: Aurora Curtains ──
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

    // ── Engine 2: Hyper Warp Speed ──
    interface Star {
      x: number;
      y: number;
      z: number;
      pz: number;
    }
    const stars: Star[] = Array.from({ length: 250 }, () => ({
      x: (Math.random() - 0.5) * width * 2,
      y: (Math.random() - 0.5) * height * 2,
      z: Math.random() * width,
      pz: Math.random() * width,
    }));

    const drawWarpSpeed = () => {
      ctx.fillStyle = "rgba(6, 6, 10, 0.25)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      stars.forEach((star) => {
        star.pz = star.z;
        star.z -= 18;
        if (star.z <= 0) {
          star.z = width;
          star.pz = width;
          star.x = (Math.random() - 0.5) * width * 2;
          star.y = (Math.random() - 0.5) * height * 2;
        }

        const k = 128.0 / star.z;
        const px = star.x * k + cx;
        const py = star.y * k + cy;

        const pk = 128.0 / star.pz;
        const ppx = star.x * pk + cx;
        const ppy = star.y * pk + cy;

        const alpha = Math.min(1, (1 - star.z / width) * 1.5);
        ctx.strokeStyle = `rgba(${r2}, ${g2}, ${b2}, ${alpha})`;
        ctx.lineWidth = Math.max(0.5, (1 - star.z / width) * 2.5);

        ctx.beginPath();
        ctx.moveTo(ppx, ppy);
        ctx.lineTo(px, py);
        ctx.stroke();
      });
    };

    // ── Engine 3: Tron Cyber Grid ──
    const drawCyberGrid = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      const horizon = height * 0.55;
      const fov = 300;

      // Draw horizon glow
      const horizonGrad = ctx.createLinearGradient(0, horizon - 80, 0, horizon + 20);
      horizonGrad.addColorStop(0, "transparent");
      horizonGrad.addColorStop(0.8, `rgba(${r1}, ${g1}, ${b1}, 0.25)`);
      horizonGrad.addColorStop(1, "transparent");
      ctx.fillStyle = horizonGrad;
      ctx.fillRect(0, horizon - 80, width, 100);

      ctx.strokeStyle = `rgba(${r1}, ${g1}, ${b1}, 0.25)`;
      ctx.lineWidth = 1;

      // Perspective lines radiating outward
      const numLines = 24;
      for (let i = -numLines / 2; i <= numLines / 2; i++) {
        const x = (width / 2) + i * 45;
        ctx.beginPath();
        ctx.moveTo(width / 2, horizon);
        ctx.lineTo(x * 3 - (width), height);
        ctx.stroke();
      }

      // Horizontal lines advancing towards viewer
      const speed = (t * 60) % 40;
      for (let z = 0; z < height - horizon; z += 18) {
        const lineY = horizon + Math.pow((z + speed) / (height - horizon), 2) * (height - horizon);
        if (lineY > height) continue;
        const alpha = Math.min(0.35, ((lineY - horizon) / (height - horizon)) * 0.4);
        ctx.strokeStyle = `rgba(${r2}, ${g2}, ${b2}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(0, lineY);
        ctx.lineTo(width, lineY);
        ctx.stroke();
      }
    };

    // ── Engine 4: Quantum Constellations ──
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

    // ── Engine 5: Molten Metablobs ──
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

    // ── Engine 6: Digital Glyph Rain (Matrix) ──
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

    // ── Engine 7: Zen Minimalist Ambient Glow ──
    const drawZenMinimal = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      // Slow breathing luminance
      const pulse = Math.sin(t * 0.8) * 0.05 + 0.15;
      const cx = width / 2;
      const cy = height * 0.45;
      const radius = Math.min(width, height) * 0.55;

      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      grad.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, ${pulse})`);
      grad.addColorStop(0.5, `rgba(${r2}, ${g2}, ${b2}, ${pulse * 0.4})`);
      grad.addColorStop(1, "transparent");

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.fill();
    };

    // ── Engine 8: Harmonic Radial Pulse ──
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

    // ── Engine 9: Stellar Vortex ──
    const vortexStars = Array.from({ length: 180 }, () => ({
      angle: Math.random() * Math.PI * 2,
      dist: Math.random() * Math.min(width, height) * 0.6 + 20,
      speed: Math.random() * 0.008 + 0.003,
      size: Math.random() * 2 + 1,
    }));

    const drawParticleVortex = () => {
      ctx.fillStyle = "rgba(6, 6, 10, 0.15)";
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      vortexStars.forEach((s) => {
        s.angle += s.speed;
        s.dist -= 0.2;
        if (s.dist <= 10) {
          s.dist = Math.min(width, height) * 0.6;
        }

        const x = cx + Math.cos(s.angle) * s.dist;
        const y = cy + Math.sin(s.angle) * s.dist;
        const alpha = Math.min(1, s.dist / 150);

        ctx.fillStyle = `rgba(${r2}, ${g2}, ${b2}, ${alpha * 0.8})`;
        ctx.beginPath();
        ctx.arc(x, y, s.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // ── Engine 10: Cinematic Bokeh Discs ──
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
      drawZenMinimal(0);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      if (!isRunning) return;
      const t = (now - start) / 1000;
      frame++;

      switch (engine) {
        case "aurora-curtains":
          drawAuroraCurtains(t);
          break;
        case "warp-speed":
          drawWarpSpeed();
          break;
        case "cyber-grid":
          drawCyberGrid(t);
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
        case "zen-minimal":
          drawZenMinimal(t);
          break;
        case "radial-pulse":
          drawRadialPulse(t);
          break;
        case "particle-vortex":
          drawParticleVortex();
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

  const canvasEngines = [
    "aurora-curtains",
    "warp-speed",
    "cyber-grid",
    "quantum-field",
    "liquid-lava",
    "matrix-rain",
    "zen-minimal",
    "radial-pulse",
    "particle-vortex",
    "bokeh-blur",
  ];

  if (!canvasEngines.includes(engine)) return null;

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0 transition-opacity duration-700"
      aria-hidden="true"
    />
  );
}
