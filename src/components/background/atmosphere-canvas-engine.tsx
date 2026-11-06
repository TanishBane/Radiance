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

    // High-DPI Retina resolution calibration
    const dpr = Math.min(typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1, 2);
    let width = window.innerWidth;
    let height = window.innerHeight;

    const resizeCanvas = () => {
      if (!canvas) return;
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse tracking for subtle organic parallax
    const mousePos = { x: width * 0.5, y: height * 0.5 };
    const smoothMouse = { x: width * 0.5, y: height * 0.5 };
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const [r1, g1, b1] = hexToRgb(theme.accent);
    const [r2, g2, b2] = hexToRgb(theme.accentB);
    const [r3, g3, b3] = hexToRgb(theme.accentC);

    let isRunning = true;
    let frame = 0;

    // ═════════════════════════════════════════════════════════════════════════
    // ── 1. SILK CAUSTICS: Optical Bezier Refraction with Chromatic Dispersion
    // ═════════════════════════════════════════════════════════════════════════
    const drawSilkCaustics = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      const ribbons = 7;
      const mouseParallaxX = (smoothMouse.x / width - 0.5) * 40;
      const mouseParallaxY = (smoothMouse.y / height - 0.5) * 25;

      for (let r = 0; r < ribbons; r++) {
        const ribbonRatio = r / (ribbons - 1);
        const cy = height * (0.15 + ribbonRatio * 0.72) + mouseParallaxY * (1 - ribbonRatio);
        const speed = 0.22 + r * 0.035;
        const phase = r * 0.88;

        // Chromatic dispersion sub-passes: Red/Primary, Green/Secondary, Blue/Tertiary
        const channels = [
          { color: `rgba(${r1}, ${g1}, ${b1}, 0.16)`, offsetPhase: 0.0, lw: 1.8 },
          { color: `rgba(${r2}, ${g2}, ${b2}, 0.13)`, offsetPhase: 0.05, lw: 1.4 },
          { color: `rgba(${r3}, ${g3}, ${b3}, 0.11)`, offsetPhase: -0.05, lw: 1.2 },
        ];

        channels.forEach((ch) => {
          ctx.beginPath();
          ctx.strokeStyle = ch.color;
          ctx.lineWidth = ch.lw;

          const step = 32;
          const points: { x: number; y: number }[] = [];

          for (let x = -20; x <= width + 20; x += step) {
            const nx = x / width;
            const y =
              cy +
              Math.sin(nx * 4.2 + t * speed + phase + ch.offsetPhase) * 48 +
              Math.cos(nx * 8.4 - t * (speed * 0.7) + phase) * 22 +
              Math.sin(nx * 2.1 + mouseParallaxX * 0.04) * 16;
            points.push({ x, y });
          }

          if (points.length > 2) {
            ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length - 1; i++) {
              const xc = (points[i].x + points[i + 1].x) / 2;
              const yc = (points[i].y + points[i + 1].y) / 2;
              ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
            }
            const last = points[points.length - 1];
            ctx.lineTo(last.x, last.y);
            ctx.stroke();

            // Luminous caustics apex glow
            if (r % 2 === 0) {
              const midIdx = Math.floor(points.length * 0.45);
              const apex = points[midIdx];
              if (apex) {
                const glow = ctx.createRadialGradient(apex.x, apex.y, 0, apex.x, apex.y, 140);
                glow.addColorStop(0, `rgba(${r2}, ${g2}, ${b2}, 0.045)`);
                glow.addColorStop(1, "transparent");
                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(apex.x, apex.y, 140, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
        });
      }
    };

    // ═════════════════════════════════════════════════════════════════════════
    // ── 2. AURORA CURTAINS: Vertical Polar Light with Sine Harmonic Modulation
    // ═════════════════════════════════════════════════════════════════════════
    const drawAuroraCurtains = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      const numCurtains = 4;
      for (let c = 0; c < numCurtains; c++) {
        const baseColor = c % 2 === 0 ? `rgba(${r1}, ${g1}, ${b1}` : `rgba(${r2}, ${g2}, ${b2}`;
        const waveOffset = c * 0.9;
        const speed = 0.45 + c * 0.12;

        ctx.beginPath();
        ctx.moveTo(0, height);

        for (let x = 0; x <= width; x += 18) {
          const nx = x / width;
          const y =
            height * 0.42 +
            Math.sin(nx * 3.8 + t * speed + waveOffset) * 85 +
            Math.sin(nx * 7.6 - t * 0.3) * 35 +
            c * 42;
          ctx.lineTo(x, y);
        }
        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, height * 0.3, 0, height);
        grad.addColorStop(0, `${baseColor}, 0.18)`);
        grad.addColorStop(0.5, `${baseColor}, 0.08)`);
        grad.addColorStop(1, "transparent");
        ctx.fillStyle = grad;
        ctx.fill();
      }
    };

    // ═════════════════════════════════════════════════════════════════════════
    // ── 3. SPECTRAL RAYS: Cinematic Anamorphic Beams with Gaussian Decay
    // ═════════════════════════════════════════════════════════════════════════
    interface VolumetricBeam {
      originXRatio: number;
      sweepAngleDeg: number;
      widthSpread: number;
      phase: number;
      speed: number;
      maxAlpha: number;
    }
    const spectralBeams: VolumetricBeam[] = [
      { originXRatio: 0.15, sweepAngleDeg: 52, widthSpread: 260, phase: 0.0, speed: 0.28, maxAlpha: 0.09 },
      { originXRatio: 0.38, sweepAngleDeg: 46, widthSpread: 320, phase: 1.4, speed: 0.22, maxAlpha: 0.08 },
      { originXRatio: 0.62, sweepAngleDeg: 42, widthSpread: 380, phase: 2.8, speed: 0.25, maxAlpha: 0.075 },
      { originXRatio: 0.85, sweepAngleDeg: 38, widthSpread: 300, phase: 4.2, speed: 0.32, maxAlpha: 0.085 },
      { originXRatio: 0.50, sweepAngleDeg: 48, widthSpread: 420, phase: 5.6, speed: 0.18, maxAlpha: 0.065 },
    ];

    const drawSpectralRays = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      // Light superposition blending
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      const lightSourceY = -height * 0.15;
      const mouseBias = (smoothMouse.x / width - 0.5) * 50;

      spectralBeams.forEach((beam, idx) => {
        const drift = Math.sin(t * beam.speed + beam.phase) * 65 + mouseBias;
        const originX = width * beam.originXRatio + drift;
        const angleRad = (beam.sweepAngleDeg * Math.PI) / 180;

        const pulse = (Math.sin(t * 0.7 + beam.phase) * 0.5 + 0.5);
        const currentAlpha = beam.maxAlpha * (0.65 + pulse * 0.35);

        const targetX = originX + Math.tan(angleRad) * (height - lightSourceY);
        const topRadius = 45;
        const bottomRadius = beam.widthSpread;

        const grad = ctx.createLinearGradient(originX, lightSourceY, targetX, height);
        const col = idx % 2 === 0 ? `rgba(${r1}, ${g1}, ${b1}` : `rgba(${r2}, ${g2}, ${b2}`;
        const accentC = `rgba(${r3}, ${g3}, ${b3}`;

        grad.addColorStop(0, `${col}, ${currentAlpha * 1.5})`);
        grad.addColorStop(0.35, `${col}, ${currentAlpha})`);
        grad.addColorStop(0.75, `${accentC}, ${currentAlpha * 0.4})`);
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(originX - topRadius, lightSourceY);
        ctx.lineTo(originX + topRadius, lightSourceY);
        ctx.lineTo(targetX + bottomRadius, height);
        ctx.lineTo(targetX - bottomRadius, height);
        ctx.closePath();
        ctx.fill();
      });

      ctx.restore();
    };

    // ═════════════════════════════════════════════════════════════════════════
    // ── 4. TOPOGRAPHIC FLOW: Swiss Cartographic Elevation Isolines
    // ═════════════════════════════════════════════════════════════════════════
    const drawTopographicFlow = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      // 3 Dynamic geological centers orbiting in parametric curves
      const c1x = width * 0.28 + Math.sin(t * 0.22) * width * 0.08;
      const c1y = height * 0.38 + Math.cos(t * 0.28) * height * 0.08;
      const c2x = width * 0.72 + Math.cos(t * 0.18) * width * 0.10;
      const c2y = height * 0.62 + Math.sin(t * 0.24) * height * 0.09;
      const c3x = smoothMouse.x;
      const c3y = smoothMouse.y;

      const numStrata = 14;
      for (let s = 0; s < numStrata; s++) {
        const strataRatio = s / (numStrata - 1);
        const yBase = height * 0.10 + strataRatio * height * 0.82;
        const isIndexContour = s % 4 === 0;

        ctx.beginPath();
        ctx.lineWidth = isIndexContour ? 1.25 : 0.75;
        const alpha = isIndexContour ? 0.24 : 0.12;
        const col = isIndexContour ? `rgba(${r1}, ${g1}, ${b1}, ${alpha})` : `rgba(${r2}, ${g2}, ${b2}, ${alpha})`;
        ctx.strokeStyle = col;

        const points: { x: number; y: number }[] = [];
        const step = 28;

        for (let x = 0; x <= width; x += step) {
          const d1 = Math.hypot(x - c1x, yBase - c1y);
          const d2 = Math.hypot(x - c2x, yBase - c2y);
          const d3 = Math.hypot(x - c3x, yBase - c3y);

          const hill1 = Math.exp(-d1 / 280) * 58;
          const hill2 = Math.exp(-d2 / 320) * -44;
          const mouseDepression = Math.exp(-d3 / 240) * 36;

          const harmonic =
            Math.sin(x * 0.0032 + t * 0.28 + s * 0.45) * 26 +
            Math.cos(x * 0.0068 - t * 0.18 + s * 0.7) * 12;

          const y = yBase + hill1 + hill2 + mouseDepression + harmonic;
          points.push({ x, y });
        }

        if (points.length > 2) {
          ctx.moveTo(points[0].x, points[0].y);
          for (let i = 1; i < points.length - 1; i++) {
            const xc = (points[i].x + points[i + 1].x) / 2;
            const yc = (points[i].y + points[i + 1].y) / 2;
            ctx.quadraticCurveTo(points[i].x, points[i].y, xc, yc);
          }
          const last = points[points.length - 1];
          ctx.lineTo(last.x, last.y);
          ctx.stroke();

          // Elegant cartographic index elevation ticks
          if (isIndexContour) {
            for (let i = 2; i < points.length - 2; i += 6) {
              const pt = points[i];
              ctx.fillStyle = `rgba(${r1}, ${g1}, ${b1}, 0.35)`;
              ctx.beginPath();
              ctx.arc(pt.x, pt.y, 1.4, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
      }
    };

    // ═════════════════════════════════════════════════════════════════════════
    // ── 5. QUANTUM CONSTELLATIONS: Proximity-Linked Interactive Particle Web
    // ═════════════════════════════════════════════════════════════════════════
    interface QuantumNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
    }
    const quantumNodes: QuantumNode[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.7,
      vy: (Math.random() - 0.5) * 0.7,
      radius: Math.random() * 2 + 1,
    }));

    const drawQuantumField = () => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      quantumNodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > width) n.vx *= -1;
        if (n.y < 0 || n.y > height) n.vy *= -1;

        ctx.fillStyle = `rgba(${r2}, ${g2}, ${b2}, 0.75)`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      const maxDist = 125;
      for (let i = 0; i < quantumNodes.length; i++) {
        for (let j = i + 1; j < quantumNodes.length; j++) {
          const dx = quantumNodes[i].x - quantumNodes[j].x;
          const dy = quantumNodes[i].y - quantumNodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const alpha = (1 - dist / maxDist) * 0.28;
            ctx.strokeStyle = `rgba(${r1}, ${g1}, ${b1}, ${alpha})`;
            ctx.lineWidth = 0.85;
            ctx.beginPath();
            ctx.moveTo(quantumNodes[i].x, quantumNodes[i].y);
            ctx.lineTo(quantumNodes[j].x, quantumNodes[j].y);
            ctx.stroke();
          }
        }
      }
    };

    // ═════════════════════════════════════════════════════════════════════════
    // ── 6. MOLTEN METABLOBS: Viscous Fluid Convection with Radial Shading
    // ═════════════════════════════════════════════════════════════════════════
    interface MoltenBlob {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      color: string;
    }
    const moltenBlobs: MoltenBlob[] = [
      { x: width * 0.3, y: height * 0.4, vx: 0.35, vy: 0.25, r: 170, color: `rgba(${r1}, ${g1}, ${b1}, 0.26)` },
      { x: width * 0.7, y: height * 0.6, vx: -0.28, vy: -0.32, r: 200, color: `rgba(${r2}, ${g2}, ${b2}, 0.22)` },
      { x: width * 0.5, y: height * 0.8, vx: 0.18, vy: -0.25, r: 150, color: `rgba(${r3}, ${g3}, ${b3}, 0.24)` },
      { x: width * 0.2, y: height * 0.7, vx: -0.18, vy: 0.18, r: 130, color: `rgba(${r1}, ${g1}, ${b1}, 0.20)` },
    ];

    const drawLiquidLava = () => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      moltenBlobs.forEach((b) => {
        b.x += b.vx;
        b.y += b.vy;
        if (b.x - b.r < 0 || b.x + b.r > width) b.vx *= -1;
        if (b.y - b.r < 0 || b.y + b.r > height) b.vy *= -1;

        const grad = ctx.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r);
        grad.addColorStop(0, b.color);
        grad.addColorStop(0.7, b.color.replace(/[\d\.]+\)$/, "0.07)"));
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // ═════════════════════════════════════════════════════════════════════════
    // ── 7. DIGITAL GLYPH RAIN: Phosphor Stream with Decay Trails
    // ═════════════════════════════════════════════════════════════════════════
    const glyphs = "01アイウエオカキクケコサシスセソタチツテトRADIANCE";
    const fontSize = 14;
    const columns = Math.floor(width / fontSize);
    const drops = Array(columns).fill(1);

    const drawMatrixRain = () => {
      ctx.fillStyle = "rgba(6, 5, 10, 0.12)";
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

    // ═════════════════════════════════════════════════════════════════════════
    // ── 8. CELESTIAL DUST: 3-Tier Depth of Field with Macro Bokeh & Scintillation
    // ═════════════════════════════════════════════════════════════════════════
    interface CelestialParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
      phase: number;
      tier: "macro" | "mid" | "star";
    }

    const celestialField: CelestialParticle[] = [
      // Tier 1: Macro Bokeh (8 foreground particles)
      ...Array.from({ length: 8 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.18,
        vy: -Math.random() * 0.15 - 0.05,
        r: Math.random() * 24 + 20,
        alpha: Math.random() * 0.035 + 0.02,
        phase: Math.random() * Math.PI * 2,
        tier: "macro" as const,
      })),
      // Tier 2: Midground Brownian Motes (42 particles)
      ...Array.from({ length: 42 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: -Math.random() * 0.45 - 0.10,
        r: Math.random() * 2.2 + 1.2,
        alpha: Math.random() * 0.45 + 0.25,
        phase: Math.random() * Math.PI * 2,
        tier: "mid" as const,
      })),
      // Tier 3: Deep Stars (70 particles)
      ...Array.from({ length: 70 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.08,
        vy: -Math.random() * 0.12 - 0.02,
        r: Math.random() * 0.9 + 0.5,
        alpha: Math.random() * 0.5 + 0.2,
        phase: Math.random() * Math.PI * 2,
        tier: "star" as const,
      })),
    ];

    const drawCelestialDust = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      const mouseDeltaX = (smoothMouse.x / width - 0.5) * 30;

      celestialField.forEach((p) => {
        // Organic Brownian drift
        p.x += p.vx + Math.sin(t * 0.35 + p.phase) * 0.22;
        p.y += p.vy;

        if (p.y < -p.r * 2) p.y = height + p.r * 2;
        if (p.x < -p.r * 2) p.x = width + p.r * 2;
        if (p.x > width + p.r * 2) p.x = -p.r * 2;

        if (p.tier === "macro") {
          // Macro Bokeh: soft blurred gaussian halo
          const px = p.x + mouseDeltaX * 1.5;
          const grad = ctx.createRadialGradient(px, p.y, 0, px, p.y, p.r);
          grad.addColorStop(0, `rgba(${r2}, ${g2}, ${b2}, ${p.alpha * 1.2})`);
          grad.addColorStop(0.6, `rgba(${r1}, ${g1}, ${b1}, ${p.alpha * 0.5})`);
          grad.addColorStop(1, "transparent");

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(px, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else if (p.tier === "mid") {
          // Midground motes: luminous core + aura
          const pulse = Math.sin(t * 1.2 + p.phase) * 0.25 + 0.75;
          const currentAlpha = p.alpha * pulse;

          ctx.fillStyle = `rgba(${r1}, ${g1}, ${b1}, ${currentAlpha * 0.35})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r * 2.4, 0, Math.PI * 2);
          ctx.fill();

          ctx.fillStyle = `rgba(${r2}, ${g2}, ${b2}, ${currentAlpha})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Deep pinpoint stars with harmonic scintillation
          const twinkle = Math.sin(t * 2.8 + p.phase) * 0.4 + 0.6;
          ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha * twinkle * 0.65})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
      });
    };

    // ═════════════════════════════════════════════════════════════════════════
    // ── 9. HARMONIC RADIAL PULSE: Sonar Atmosphere Waves with Sinc Dissipation
    // ═════════════════════════════════════════════════════════════════════════
    const drawRadialPulse = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const maxR = Math.sqrt(cx * cx + cy * cy);
      const ringCount = 7;

      for (let i = 0; i < ringCount; i++) {
        const progress = ((t * 0.28 + i / ringCount) % 1);
        const r = progress * maxR;
        const alpha = Math.sin(progress * Math.PI) * 0.22;

        ctx.strokeStyle = `rgba(${r1}, ${g1}, ${b1}, ${alpha})`;
        ctx.lineWidth = 1.4;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    // ═════════════════════════════════════════════════════════════════════════
    // ── 10. NEURAL LATTICE: Synaptic Cognitive Graph with Action Potentials
    // ═════════════════════════════════════════════════════════════════════════
    interface SynapticNode {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      phase: number;
      pulseCharge: number;
    }
    const synapticNodes: SynapticNode[] = Array.from({ length: 42 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.45,
      vy: (Math.random() - 0.5) * 0.45,
      radius: Math.random() * 1.6 + 1.2,
      phase: Math.random() * Math.PI * 2,
      pulseCharge: 0,
    }));

    // Traveling action potential signals along synapses
    interface ActionSignal {
      sourceIdx: number;
      targetIdx: number;
      progress: number;
      speed: number;
    }
    const actionSignals: ActionSignal[] = Array.from({ length: 12 }, () => ({
      sourceIdx: Math.floor(Math.random() * 42),
      targetIdx: Math.floor(Math.random() * 42),
      progress: Math.random(),
      speed: Math.random() * 0.008 + 0.004,
    }));

    const drawNeuralLattice = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      // Update node positions
      synapticNodes.forEach((n) => {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 15 || n.x > width - 15) n.vx *= -1;
        if (n.y < 15 || n.y > height - 15) n.vy *= -1;
        n.pulseCharge = Math.max(0, n.pulseCharge - 0.02);
      });

      const maxDist = 145;

      // Draw synapses with bidirectional linear gradients
      for (let i = 0; i < synapticNodes.length; i++) {
        for (let j = i + 1; j < synapticNodes.length; j++) {
          const dx = synapticNodes[i].x - synapticNodes[j].x;
          const dy = synapticNodes[i].y - synapticNodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < maxDist) {
            const norm = 1 - dist / maxDist;
            const alpha = Math.pow(norm, 1.6) * 0.32;

            const grad = ctx.createLinearGradient(
              synapticNodes[i].x,
              synapticNodes[i].y,
              synapticNodes[j].x,
              synapticNodes[j].y
            );
            grad.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, ${alpha})`);
            grad.addColorStop(1, `rgba(${r2}, ${g2}, ${b2}, ${alpha})`);

            ctx.strokeStyle = grad;
            ctx.lineWidth = 0.9;
            ctx.beginPath();
            ctx.moveTo(synapticNodes[i].x, synapticNodes[i].y);
            ctx.lineTo(synapticNodes[j].x, synapticNodes[j].y);
            ctx.stroke();

            // Delicate Delaunay triad face fill
            if (dist < 85 && (i + j) % 5 === 0) {
              const k = (j + 1) % synapticNodes.length;
              ctx.fillStyle = `rgba(${r1}, ${g1}, ${b1}, 0.016)`;
              ctx.beginPath();
              ctx.moveTo(synapticNodes[i].x, synapticNodes[i].y);
              ctx.lineTo(synapticNodes[j].x, synapticNodes[j].y);
              ctx.lineTo(synapticNodes[k].x, synapticNodes[k].y);
              ctx.closePath();
              ctx.fill();
            }
          }
        }
      }

      // Draw and update active action potential signals
      actionSignals.forEach((sig) => {
        sig.progress += sig.speed;
        const n1 = synapticNodes[sig.sourceIdx];
        const n2 = synapticNodes[sig.targetIdx];

        if (n1 && n2) {
          const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
          if (dist < maxDist && sig.progress <= 1) {
            const sx = n1.x + (n2.x - n1.x) * sig.progress;
            const sy = n1.y + (n2.y - n1.y) * sig.progress;
            const signalAlpha = Math.sin(sig.progress * Math.PI) * 0.85;

            ctx.fillStyle = `rgba(${r3}, ${g3}, ${b3}, ${signalAlpha})`;
            ctx.beginPath();
            ctx.arc(sx, sy, 2.2, 0, Math.PI * 2);
            ctx.fill();
          } else if (sig.progress > 1) {
            n2.pulseCharge = 1;
            sig.sourceIdx = Math.floor(Math.random() * synapticNodes.length);
            sig.targetIdx = Math.floor(Math.random() * synapticNodes.length);
            sig.progress = 0;
          }
        }
      });

      // Draw synaptic nodes (nucleus + breathing aura)
      synapticNodes.forEach((n) => {
        const pulse = Math.sin(t * 1.6 + n.phase) * 0.3 + 0.7;
        const chargeBoost = n.pulseCharge * 0.5;

        // Outer energy aura
        ctx.fillStyle = `rgba(${r1}, ${g1}, ${b1}, ${(pulse * 0.22 + chargeBoost * 0.4)})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius * 3.5, 0, Math.PI * 2);
        ctx.fill();

        // Inner nucleus
        ctx.fillStyle = `rgba(${r2}, ${g2}, ${b2}, ${pulse * 0.95})`;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius + chargeBoost, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // ═════════════════════════════════════════════════════════════════════════
    // ── 11. CINEMATIC BOKEH DISCS: Soft Focal Blur Circles with Layered Depth
    // ═════════════════════════════════════════════════════════════════════════
    interface BokehDisc {
      x: number;
      y: number;
      vx: number;
      vy: number;
      r: number;
      alpha: number;
    }
    const bokehs: BokehDisc[] = Array.from({ length: 24 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.35,
      vy: (Math.random() - 0.5) * 0.35,
      r: Math.random() * 55 + 30,
      alpha: Math.random() * 0.16 + 0.06,
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
      // Draw static first frame for accessibility
      drawSilkCaustics(0);
      return;
    }

    const start = performance.now();
    const tick = (now: number) => {
      if (!isRunning) return;
      const t = (now - start) / 1000;
      frame++;

      // Smooth mouse interpolation
      smoothMouse.x += (mousePos.x - smoothMouse.x) * 0.04;
      smoothMouse.y += (mousePos.y - smoothMouse.y) * 0.04;

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
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
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
