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
  "ambient-spotlight",
  "aurora-curtains",
  "meteor-shower",
  "radiant-grid",
  "quantum-field",
  "liquid-lava",
  "matrix-rain",
  "fluid-aurora",
  "radial-pulse",
  "solar-corona",
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
    const mousePos = { x: width * 0.5, y: height * 0.45 };
    const smoothMouse = { x: width * 0.5, y: height * 0.45 };
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.x = e.clientX;
      mousePos.y = e.clientY;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Touch tracking for mobile and tablet responsiveness
    const handleTouch = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        mousePos.x = e.touches[0].clientX;
        mousePos.y = e.touches[0].clientY;
      }
    };
    window.addEventListener("touchstart", handleTouch, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const [r1, g1, b1] = hexToRgb(theme.accent);
    const [r2, g2, b2] = hexToRgb(theme.accentB);
    const [r3, g3, b3] = hexToRgb(theme.accentC);

    let isRunning = true;
    let frame = 0;

    // ═════════════════════════════════════════════════════════════════════════
    // ── 1. AMBIENT SPOTLIGHT: Luxury Conical Studio Beam & Specular Diffusion
    // ═════════════════════════════════════════════════════════════════════════
    interface PhotonMote {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      phase: number;
    }
    const photonMotes: PhotonMote[] = Array.from({ length: 36 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.25,
      vy: -Math.random() * 0.35 - 0.05,
      radius: Math.random() * 1.8 + 0.8,
      phase: Math.random() * Math.PI * 2,
    }));

    const drawAmbientSpotlight = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      // Light source origin at top of viewport, softly tracking cursor with spring dampening
      const originX = width * 0.5 + (smoothMouse.x - width * 0.5) * 0.35;
      const originY = -height * 0.12;

      // Volumetric conical spotlight cone
      ctx.save();
      ctx.globalCompositeOperation = "screen";

      const targetX = smoothMouse.x;
      const targetY = smoothMouse.y;
      const coneSpread = Math.max(width * 0.4, 450);

      const coneGrad = ctx.createRadialGradient(
        originX,
        originY,
        30,
        targetX,
        targetY,
        coneSpread * 1.5
      );
      coneGrad.addColorStop(0, `rgba(${r2}, ${g2}, ${b2}, 0.24)`);
      coneGrad.addColorStop(0.3, `rgba(${r1}, ${g1}, ${b1}, 0.14)`);
      coneGrad.addColorStop(0.7, `rgba(${r3}, ${g3}, ${b3}, 0.05)`);
      coneGrad.addColorStop(1, "transparent");

      ctx.fillStyle = coneGrad;
      ctx.beginPath();
      ctx.moveTo(originX - 60, originY);
      ctx.lineTo(originX + 60, originY);
      ctx.lineTo(targetX + coneSpread, height * 1.1);
      ctx.lineTo(targetX - coneSpread, height * 1.1);
      ctx.closePath();
      ctx.fill();

      // Ground specular pool at mouse focus
      const poolRadius = 380;
      const poolGrad = ctx.createRadialGradient(
        targetX,
        targetY,
        0,
        targetX,
        targetY,
        poolRadius
      );
      poolGrad.addColorStop(0, `rgba(${r2}, ${g2}, ${b2}, 0.20)`);
      poolGrad.addColorStop(0.45, `rgba(${r1}, ${g1}, ${b1}, 0.08)`);
      poolGrad.addColorStop(1, "transparent");

      ctx.fillStyle = poolGrad;
      ctx.beginPath();
      ctx.ellipse(targetX, targetY, poolRadius, poolRadius * 0.55, 0, 0, Math.PI * 2);
      ctx.fill();

      // Atmospheric floating photons inside spotlight beam
      photonMotes.forEach((m) => {
        m.x += m.vx + Math.sin(t * 0.4 + m.phase) * 0.15;
        m.y += m.vy;

        if (m.y < -10) m.y = height + 10;
        if (m.x < -10) m.x = width + 10;
        if (m.x > width + 10) m.x = -10;

        // Check proximity to spotlight target
        const distToLight = Math.hypot(m.x - targetX, m.y - targetY);
        const inLight = distToLight < poolRadius * 1.2;
        const shimmer = Math.sin(t * 2.2 + m.phase) * 0.35 + 0.65;
        const alpha = inLight ? shimmer * 0.65 : 0.12;

        ctx.fillStyle = `rgba(${r2}, ${g2}, ${b2}, ${alpha})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
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
    // ── 3. CELESTIAL METEORS: Incandescent Diagonal Shooting Stars
    // ═════════════════════════════════════════════════════════════════════════
    interface Meteor {
      x: number;
      y: number;
      speed: number;
      length: number;
      size: number;
      angleRad: number;
      alpha: number;
    }

    const meteorAngle = (215 * Math.PI) / 180; // Diagonal flight angle: top-right to bottom-left
    const cosM = Math.cos(meteorAngle);
    const sinM = Math.sin(meteorAngle);

    const meteors: Meteor[] = Array.from({ length: 18 }, () => ({
      x: Math.random() * (width + 500),
      y: Math.random() * (height - 200) - 100,
      speed: Math.random() * 5 + 4,
      length: Math.random() * 90 + 70,
      size: Math.random() * 1.5 + 1.2,
      angleRad: meteorAngle,
      alpha: Math.random() * 0.5 + 0.4,
    }));

    // Quiescent background stars for celestial night sky
    const staticStars = Array.from({ length: 48 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 1.2 + 0.5,
      alpha: Math.random() * 0.45 + 0.15,
      twinkleSpeed: Math.random() * 2 + 1,
      phase: Math.random() * Math.PI * 2,
    }));

    const drawMeteorShower = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      // Quiescent twinkling stars
      staticStars.forEach((s) => {
        const twinkle = Math.sin(t * s.twinkleSpeed + s.phase) * 0.35 + 0.65;
        ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha * twinkle})`;
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Meteors
      meteors.forEach((m) => {
        m.x += cosM * m.speed;
        m.y += sinM * m.speed;

        // Respawn when out of screen bounds
        if (m.x < -200 || m.y > height + 200) {
          m.x = Math.random() * (width + 400) + 100;
          m.y = -Math.random() * 150 - 50;
          m.speed = Math.random() * 5 + 4;
          m.length = Math.random() * 90 + 70;
          m.alpha = Math.random() * 0.5 + 0.4;
        }

        const tailX = m.x - cosM * m.length;
        const tailY = m.y - sinM * m.length;

        // Meteor trail gradient
        const trailGrad = ctx.createLinearGradient(m.x, m.y, tailX, tailY);
        trailGrad.addColorStop(0, `rgba(255, 255, 255, ${m.alpha})`);
        trailGrad.addColorStop(0.25, `rgba(${r1}, ${g1}, ${b1}, ${m.alpha * 0.8})`);
        trailGrad.addColorStop(0.7, `rgba(${r3}, ${g3}, ${b3}, ${m.alpha * 0.3})`);
        trailGrad.addColorStop(1, "transparent");

        ctx.strokeStyle = trailGrad;
        ctx.lineWidth = m.size;
        ctx.beginPath();
        ctx.moveTo(m.x, m.y);
        ctx.lineTo(tailX, tailY);
        ctx.stroke();

        // Incandescent head glow
        ctx.fillStyle = `rgba(255, 255, 255, ${m.alpha * 0.95})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 1.1, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(${r2}, ${g2}, ${b2}, ${m.alpha * 0.4})`;
        ctx.beginPath();
        ctx.arc(m.x, m.y, m.size * 3.2, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // ═════════════════════════════════════════════════════════════════════════
    // ── 4. RADIANT GRID: Architectural Grid with Dynamic Spotlight Mask
    // ═════════════════════════════════════════════════════════════════════════
    const drawRadiantGrid = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      const cellSize = 44;
      const lightRadius = 320;
      const mx = smoothMouse.x;
      const my = smoothMouse.y;

      // Base ultra-subtle grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.025)";
      ctx.lineWidth = 1;

      ctx.beginPath();
      for (let x = 0; x <= width; x += cellSize) {
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
      }
      for (let y = 0; y <= height; y += cellSize) {
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
      }
      ctx.stroke();

      // Dynamic illuminated grid lines within cursor radius
      const startX = Math.max(0, Math.floor((mx - lightRadius) / cellSize) * cellSize);
      const endX = Math.min(width, Math.ceil((mx + lightRadius) / cellSize) * cellSize);
      const startY = Math.max(0, Math.floor((my - lightRadius) / cellSize) * cellSize);
      const endY = Math.min(height, Math.ceil((my + lightRadius) / cellSize) * cellSize);

      for (let x = startX; x <= endX; x += cellSize) {
        const dx = Math.abs(x - mx);
        if (dx < lightRadius) {
          const dySpan = Math.sqrt(lightRadius * lightRadius - dx * dx);
          const y1 = Math.max(0, my - dySpan);
          const y2 = Math.min(height, my + dySpan);

          const grad = ctx.createLinearGradient(x, y1, x, y2);
          const maxAlpha = (1 - dx / lightRadius) * 0.35;
          grad.addColorStop(0, "transparent");
          grad.addColorStop(0.5, `rgba(${r1}, ${g1}, ${b1}, ${maxAlpha})`);
          grad.addColorStop(1, "transparent");

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x, y1);
          ctx.lineTo(x, y2);
          ctx.stroke();
        }
      }

      for (let y = startY; y <= endY; y += cellSize) {
        const dy = Math.abs(y - my);
        if (dy < lightRadius) {
          const dxSpan = Math.sqrt(lightRadius * lightRadius - dy * dy);
          const x1 = Math.max(0, mx - dxSpan);
          const x2 = Math.min(width, mx + dxSpan);

          const grad = ctx.createLinearGradient(x1, y, x2, y);
          const maxAlpha = (1 - dy / lightRadius) * 0.35;
          grad.addColorStop(0, "transparent");
          grad.addColorStop(0.5, `rgba(${r1}, ${g1}, ${b1}, ${maxAlpha})`);
          grad.addColorStop(1, "transparent");

          ctx.strokeStyle = grad;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.moveTo(x1, y);
          ctx.lineTo(x2, y);
          ctx.stroke();
        }
      }

      // Illuminated crosshairs and points at grid intersections near cursor
      for (let x = startX; x <= endX; x += cellSize) {
        for (let y = startY; y <= endY; y += cellSize) {
          const dist = Math.hypot(x - mx, y - my);
          if (dist < lightRadius * 0.85) {
            const alpha = Math.pow(1 - dist / (lightRadius * 0.85), 1.5) * 0.6;
            ctx.fillStyle = `rgba(${r2}, ${g2}, ${b2}, ${alpha})`;
            ctx.beginPath();
            ctx.arc(x, y, 1.8, 0, Math.PI * 2);
            ctx.fill();

            // Tiny crosshair arms
            if (dist < lightRadius * 0.5) {
              ctx.strokeStyle = `rgba(${r2}, ${g2}, ${b2}, ${alpha * 0.8})`;
              ctx.lineWidth = 1;
              ctx.beginPath();
              ctx.moveTo(x - 3.5, y);
              ctx.lineTo(x + 3.5, y);
              ctx.moveTo(x, y - 3.5);
              ctx.lineTo(x, y + 3.5);
              ctx.stroke();
            }
          }
        }
      }

      // Smooth radial aura centered at cursor
      const auraGrad = ctx.createRadialGradient(mx, my, 0, mx, my, lightRadius);
      auraGrad.addColorStop(0, `rgba(${r1}, ${g1}, ${b1}, 0.12)`);
      auraGrad.addColorStop(0.6, `rgba(${r3}, ${g3}, ${b3}, 0.04)`);
      auraGrad.addColorStop(1, "transparent");
      ctx.fillStyle = auraGrad;
      ctx.beginPath();
      ctx.arc(mx, my, lightRadius, 0, Math.PI * 2);
      ctx.fill();
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
    // ── 8. FLUID AURORA: Multi-Chromatic Plasma Ribbons with Gaussian Dispersion
    // ═════════════════════════════════════════════════════════════════════════
    const drawFluidAurora = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      const ribbons = 4;
      const mouseBias = (smoothMouse.x / width - 0.5) * 40;

      for (let r = 0; r < ribbons; r++) {
        const ribbonRatio = r / (ribbons - 1);
        const cy = height * (0.28 + ribbonRatio * 0.45);
        const speed = 0.28 + r * 0.08;
        const phase = r * 1.2;

        const col =
          r === 0
            ? `rgba(${r1}, ${g1}, ${b1}, 0.22)`
            : r === 1
            ? `rgba(${r2}, ${g2}, ${b2}, 0.18)`
            : r === 2
            ? `rgba(${r3}, ${g3}, ${b3}, 0.15)`
            : `rgba(${r1}, ${g1}, ${b1}, 0.10)`;

        ctx.beginPath();
        ctx.moveTo(0, height);

        const step = 24;
        for (let x = 0; x <= width + step; x += step) {
          const nx = x / width;
          const y =
            cy +
            Math.sin(nx * 3.4 + t * speed + phase) * 65 +
            Math.cos(nx * 6.8 - t * 0.35 + phase) * 32 +
            Math.sin(nx * 1.8 + mouseBias * 0.03) * 20;
          ctx.lineTo(x, y);
        }

        ctx.lineTo(width, height);
        ctx.closePath();

        const grad = ctx.createLinearGradient(0, cy - 80, 0, height);
        grad.addColorStop(0, col);
        grad.addColorStop(0.6, col.replace(/[\d\.]+\)$/, "0.05)"));
        grad.addColorStop(1, "transparent");

        ctx.fillStyle = grad;
        ctx.fill();
      }

      ctx.restore();
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
    // ── 10. SOLAR CORONA: Horizon Celestial Eclipse & Incandescent Flares
    // ═════════════════════════════════════════════════════════════════════════
    interface FlareParticle {
      angle: number;
      dist: number;
      speed: number;
      size: number;
      alpha: number;
    }

    const flares: FlareParticle[] = Array.from({ length: 24 }, () => ({
      angle: -Math.PI * 0.95 + Math.random() * Math.PI * 0.9,
      dist: Math.random() * 80 + 20,
      speed: Math.random() * 0.4 + 0.2,
      size: Math.random() * 2 + 1,
      alpha: Math.random() * 0.5 + 0.3,
    }));

    const drawSolarCorona = (t: number) => {
      ctx.fillStyle = theme.bloomColors[0];
      ctx.fillRect(0, 0, width, height);

      const cx = width * 0.5;
      const cy = height * 0.92;
      const baseRadius = Math.min(width, height) * 0.45;

      ctx.save();
      ctx.globalCompositeOperation = "screen";

      // Broad coronal haze reaching upward into viewport
      const hazeRadius = baseRadius * 2.2;
      const hazeGrad = ctx.createRadialGradient(cx, cy, baseRadius * 0.8, cx, cy, hazeRadius);
      hazeGrad.addColorStop(0, `rgba(${r2}, ${g2}, ${b2}, 0.28)`);
      hazeGrad.addColorStop(0.35, `rgba(${r1}, ${g1}, ${b1}, 0.14)`);
      hazeGrad.addColorStop(0.75, `rgba(${r3}, ${g3}, ${b3}, 0.04)`);
      hazeGrad.addColorStop(1, "transparent");

      ctx.fillStyle = hazeGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, hazeRadius, 0, Math.PI * 2);
      ctx.fill();

      // 36 Prominence Solar Rays radiating from the eclipse horizon
      const rayCount = 36;
      for (let i = 0; i < rayCount; i++) {
        const theta = -Math.PI * 0.95 + (i / (rayCount - 1)) * Math.PI * 0.9;
        const breath = Math.sin(t * 1.5 + i * 0.6) * 35 + Math.cos(t * 0.8 + i * 1.1) * 20;
        const rayLen = 50 + breath;
        const rStart = baseRadius;
        const rEnd = baseRadius + rayLen;

        const x1 = cx + Math.cos(theta) * rStart;
        const y1 = cy + Math.sin(theta) * rStart;
        const x2 = cx + Math.cos(theta) * rEnd;
        const y2 = cy + Math.sin(theta) * rEnd;

        const rayAlpha = Math.sin((i / (rayCount - 1)) * Math.PI) * (0.35 + Math.sin(t * 2 + i) * 0.15);
        ctx.strokeStyle = `rgba(${r2}, ${g2}, ${b2}, ${rayAlpha})`;
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.stroke();
      }

      // Incandescent rim light right on the edge of the celestial horizon
      const rimGrad = ctx.createRadialGradient(cx, cy, baseRadius - 10, cx, cy, baseRadius + 25);
      rimGrad.addColorStop(0, "transparent");
      rimGrad.addColorStop(0.5, `rgba(255, 255, 255, 0.65)`);
      rimGrad.addColorStop(0.75, `rgba(${r1}, ${g1}, ${b1}, 0.45)`);
      rimGrad.addColorStop(1, "transparent");

      ctx.fillStyle = rimGrad;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius + 25, 0, Math.PI * 2);
      ctx.fill();

      // Floating coronal plasma motes
      flares.forEach((f) => {
        f.dist += f.speed;
        if (f.dist > 180) {
          f.dist = Math.random() * 20;
          f.angle = -Math.PI * 0.95 + Math.random() * Math.PI * 0.9;
        }

        const fx = cx + Math.cos(f.angle) * (baseRadius + f.dist);
        const fy = cy + Math.sin(f.angle) * (baseRadius + f.dist);
        const fade = (1 - f.dist / 180) * f.alpha;

        ctx.fillStyle = `rgba(${r2}, ${g2}, ${b2}, ${fade})`;
        ctx.beginPath();
        ctx.arc(fx, fy, f.size, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();

      // Occulting dark celestial body
      ctx.fillStyle = theme.bloomColors[0];
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius - 2, 0, Math.PI * 2);
      ctx.fill();
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
      drawAmbientSpotlight(0);
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
        case "ambient-spotlight":
          drawAmbientSpotlight(t);
          break;
        case "aurora-curtains":
          drawAuroraCurtains(t);
          break;
        case "meteor-shower":
          drawMeteorShower(t);
          break;
        case "radiant-grid":
          drawRadiantGrid(t);
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
        case "fluid-aurora":
          drawFluidAurora(t);
          break;
        case "radial-pulse":
          drawRadialPulse(t);
          break;
        case "solar-corona":
          drawSolarCorona(t);
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
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("touchmove", handleTouch);
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
