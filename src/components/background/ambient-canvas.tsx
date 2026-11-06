"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";

interface AmbientCanvasProps {
  accentColor?: string;
}

export function AmbientCanvas({ accentColor = "#e8a849" }: AmbientCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const colorRef = useRef<THREE.Color>(new THREE.Color(accentColor));
  const color2Ref = useRef<THREE.Color>(new THREE.Color(accentColor).offsetHSL(0.42, 0, 0.05));

  // Sync color changes from props into shader uniforms
  useEffect(() => {
    colorRef.current.set(accentColor);
    color2Ref.current.copy(colorRef.current).offsetHSL(0.42, 0, 0.05);
  }, [accentColor]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        powerPreference: "high-performance",
      });
    } catch {
      return; // Graceful fallback if WebGL is unavailable
    }

    const reduceMotion =
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const motionScale = reduceMotion ? 0.15 : 1;

    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x06060a, 0.045);

    const camera = new THREE.PerspectiveCamera(55, 1, 0.1, 100);
    camera.position.set(0, 0, 9);

    function resize() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    window.addEventListener("resize", resize);
    resize();

    // ── Procedural Nebula Shaders ──
    const blobVert = `
      uniform float uTime;
      uniform float uAmp;
      varying vec3 vNormal;
      varying vec3 vPos;
      void main() {
        vNormal = normalize(normalMatrix * normal);
        vec3 p = position;
        float n = sin(p.x * 1.4 + uTime * 0.35) * cos(p.y * 1.3 + uTime * 0.27) * sin(p.z * 1.5 + uTime * 0.42);
        p += normal * n * uAmp;
        vPos = (modelMatrix * vec4(p, 1.0)).xyz;
        gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
      }
    `;

    const blobFrag = `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying vec3 vNormal;
      varying vec3 vPos;
      void main() {
        vec3 viewDir = normalize(cameraPosition - vPos);
        float fresnel = pow(1.0 - max(dot(viewDir, normalize(vNormal)), 0.0), 2.4);
        vec3 glow = uColor * (0.12 + fresnel * 0.95);
        gl_FragColor = vec4(glow, uOpacity * (0.18 + fresnel * 0.55));
      }
    `;

    const blobs: THREE.Mesh<THREE.IcosahedronGeometry, THREE.ShaderMaterial>[] = [];
    const blobConfigs = [
      { pos: [-3.2, 1.1, -2] as const, scale: 2.6, speed: 0.6, amp: 0.35 },
      { pos: [3.4, -1.4, -4] as const, scale: 3.4, speed: 0.4, amp: 0.5 },
      { pos: [0.2, 2.6, -6] as const, scale: 2.1, speed: 0.8, amp: 0.3 },
      { pos: [-2.6, -2.2, -3] as const, scale: 1.7, speed: 1.0, amp: 0.25 },
    ];

    blobConfigs.forEach((cfg, i) => {
      const geo = new THREE.IcosahedronGeometry(1, 4);
      const mat = new THREE.ShaderMaterial({
        vertexShader: blobVert,
        fragmentShader: blobFrag,
        uniforms: {
          uTime: { value: Math.random() * 100 },
          uAmp: { value: cfg.amp },
          uColor: { value: i % 2 === 0 ? colorRef.current : color2Ref.current },
          uOpacity: { value: 1 },
        },
        transparent: true,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(geo, mat);
      mesh.position.set(cfg.pos[0], cfg.pos[1], cfg.pos[2]);
      mesh.scale.setScalar(cfg.scale);
      mesh.userData.speed = cfg.speed;
      scene.add(mesh);
      blobs.push(mesh);
    });

    // ── Particle Field ──
    function makeSprite() {
      const c = document.createElement("canvas");
      c.width = c.height = 64;
      const ctx = c.getContext("2d");
      if (!ctx) return new THREE.Texture();

      const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
      g.addColorStop(0, "rgba(255,255,255,0.9)");
      g.addColorStop(0.4, "rgba(255,255,255,0.25)");
      g.addColorStop(1, "rgba(255,255,255,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, 64, 64);
      return new THREE.CanvasTexture(c);
    }

    const PARTICLE_COUNT = 2200;
    const positions = new Float32Array(PARTICLE_COUNT * 3);
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      const r = 6 + Math.random() * 10;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(Math.random() * 2 - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta) * 0.6;
      positions[i * 3 + 2] = r * Math.cos(phi) - 4;
    }

    const pGeo = new THREE.BufferGeometry();
    pGeo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({
      size: 0.05,
      map: makeSprite(),
      transparent: true,
      opacity: 0.5,
      color: colorRef.current,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      sizeAttenuation: true,
    });
    const particles = new THREE.Points(pGeo, pMat);
    scene.add(particles);

    // ── Pointer Parallax ──
    const pointer = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };

    const handlePointerMove = (e: MouseEvent) => {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = (e.clientY / window.innerHeight) * 2 - 1;
    };

    window.addEventListener("mousemove", handlePointerMove, { passive: true });

    // ── Animation Loop ──
    let running = true;
    let lastTime = performance.now();
    let animId: number;

    function animate() {
      if (!running) return;
      animId = requestAnimationFrame(animate);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Dynamic color uniform refresh
      pMat.color.set(colorRef.current);
      blobs.forEach((b, idx) => {
        b.material.uniforms.uColor.value = idx % 2 === 0 ? colorRef.current : color2Ref.current;
        b.material.uniforms.uTime.value += dt * (b.userData.speed as number) * motionScale;
        b.rotation.y += dt * 0.03 * motionScale;
        b.rotation.x += dt * 0.015 * motionScale;
      });

      smooth.x += (pointer.x - smooth.x) * 0.02;
      smooth.y += (pointer.y - smooth.y) * 0.02;
      camera.position.x = smooth.x * 0.6;
      camera.position.y = -smooth.y * 0.4;
      camera.lookAt(0, 0, -3);

      particles.rotation.y += dt * 0.008 * motionScale;
      particles.rotation.x += dt * 0.003 * motionScale;

      renderer.render(scene, camera);
    }

    animate();

    const handleVisibility = () => {
      running = document.visibilityState === "visible";
      if (running) {
        lastTime = performance.now();
        animate();
      }
    };

    const handleContextLost = (e: Event) => {
      e.preventDefault();
      running = false;
      cancelAnimationFrame(animId);
    };

    canvas.addEventListener("webglcontextlost", handleContextLost, false);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      running = false;
      cancelAnimationFrame(animId);
      canvas.removeEventListener("webglcontextlost", handleContextLost);
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handlePointerMove);
      document.removeEventListener("visibilitychange", handleVisibility);
      renderer.dispose();
      blobs.forEach((b) => {
        b.geometry.dispose();
        b.material.dispose();
      });
      pGeo.dispose();
      pMat.dispose();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
      aria-hidden="true"
    />
  );
}
