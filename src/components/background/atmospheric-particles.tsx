"use client";

import React, { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  radius: number;
  baseAlpha: number;
  alphaSpeed: number;
  phase: number;
  vx: number;
  vy: number;
  depth: number;
}

export function AtmosphericParticles() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext("2d");
    } catch {
      return;
    }
    if (!ctx) return;

    let animId: number;
    let isRunning = true;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener("resize", handleResize);

    // Mouse tracking with smooth lerp
    const targetMouse = { x: 0, y: 0 };
    const currentMouse = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      targetMouse.x = (e.clientX / width - 0.5) * 2;
      targetMouse.y = (e.clientY / height - 0.5) * 2;
    };
    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    // Touch tracking for mobile parallax ergonomics
    const handleTouch = (e: TouchEvent) => {
      if (e.touches && e.touches.length > 0) {
        targetMouse.x = (e.touches[0].clientX / width - 0.5) * 2;
        targetMouse.y = (e.touches[0].clientY / height - 0.5) * 2;
      }
    };
    window.addEventListener("touchstart", handleTouch, { passive: true });
    window.addEventListener("touchmove", handleTouch, { passive: true });

    // Generate ~50 subtle, microscopic celestial dust particles
    const PARTICLE_COUNT = Math.min(55, Math.floor((width * height) / 22000));
    const particles: Particle[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        radius: 0.6 + Math.random() * 1.2,
        baseAlpha: 0.12 + Math.random() * 0.22,
        alphaSpeed: 0.8 + Math.random() * 1.5,
        phase: Math.random() * Math.PI * 2,
        vx: (Math.random() - 0.5) * 0.12,
        vy: -0.06 - Math.random() * 0.10, // Gentle upward celestial drift
        depth: 0.3 + Math.random() * 0.7,
      });
    }

    let lastTime = performance.now();

    const render = (now: number) => {
      if (!isRunning) return;
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      ctx.clearRect(0, 0, width, height);

      // Smooth lerp mouse parallax
      if (!prefersReducedMotion) {
        currentMouse.x += (targetMouse.x - currentMouse.x) * 0.04;
        currentMouse.y += (targetMouse.y - currentMouse.y) * 0.04;
      }

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        if (!prefersReducedMotion) {
          p.x += p.vx;
          p.y += p.vy;

          // Wrap boundaries smoothly
          if (p.x < -10) p.x = width + 10;
          if (p.x > width + 10) p.x = -10;
          if (p.y < -10) p.y = height + 10;
          if (p.y > height + 10) p.y = -10;

          p.phase += p.alphaSpeed * dt;
        }

        const opacity = prefersReducedMotion
          ? p.baseAlpha
          : Math.max(0.04, Math.min(0.42, p.baseAlpha + Math.sin(p.phase) * 0.12));

        // Parallax offset based on mouse position and particle depth
        const offsetX = currentMouse.x * p.depth * 18;
        const offsetY = currentMouse.y * p.depth * 14;

        ctx.beginPath();
        ctx.arc(p.x + offsetX, p.y + offsetY, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.shadowColor = "rgba(255, 255, 255, 0.6)";
        ctx.shadowBlur = p.radius > 1 ? 3 : 0;
        ctx.fill();
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    const handleVisibility = () => {
      isRunning = document.visibilityState === "visible";
      if (isRunning) {
        lastTime = performance.now();
        animId = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(animId);
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      isRunning = false;
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouch);
      window.removeEventListener("touchmove", handleTouch);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-[1] opacity-75"
      aria-hidden="true"
    />
  );
}
