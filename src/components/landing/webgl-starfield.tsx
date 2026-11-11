"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/examples/jsm/postprocessing/ShaderPass.js";
import { GammaCorrectionShader } from "three/examples/jsm/shaders/GammaCorrectionShader.js";
import { CopyShader } from "three/examples/jsm/shaders/CopyShader.js";

export interface ChatbotThemePreset {
  id: string;
  name: string;
  bgColor: string;
  flameA: string;
  flameB: string;
  colorA: string;
  colorB: string;
  colorC: string;
  accent: string;
  accentB: string;
}

export const CHATBOT_STARFIELD_THEMES: ChatbotThemePreset[] = [
  {
    id: "mint",
    name: "Mint Nebula",
    bgColor: "#0a0a24",
    flameA: "#aee9ff",
    flameB: "#c79bff",
    colorA: "#aef6cf",
    colorB: "#5fe6a0",
    colorC: "#eafff2",
    accent: "#5df0a8",
    accentB: "#2fd38a"
  },
  {
    id: "violet",
    name: "Violet Aurora",
    bgColor: "#0c0818",
    flameA: "#c4a0ff",
    flameB: "#6d4aff",
    colorA: "#bfa7ff",
    colorB: "#7c5cff",
    colorC: "#e27aff",
    accent: "#7c5cff",
    accentB: "#bfa7ff"
  },
  {
    id: "ocean",
    name: "Ocean Azure",
    bgColor: "#040d1a",
    flameA: "#38bdf8",
    flameB: "#0284c7",
    colorA: "#80d8ff",
    colorB: "#49a8e8",
    colorC: "#b3e5fc",
    accent: "#38bdf8",
    accentB: "#0284c7"
  },
  {
    id: "neon",
    name: "Cyber Neon",
    bgColor: "#050e12",
    flameA: "#00f5d4",
    flameB: "#f72585",
    colorA: "#00f5d4",
    colorB: "#70e000",
    colorC: "#f72585",
    accent: "#00f5d4",
    accentB: "#70e000"
  },
  {
    id: "amber",
    name: "Solar Amber",
    bgColor: "#140a04",
    flameA: "#fbbf24",
    flameB: "#d97706",
    colorA: "#fde68a",
    colorB: "#f59e0b",
    colorC: "#fb923c",
    accent: "#f59e0b",
    accentB: "#fbbf24"
  },
  {
    id: "rose",
    name: "Cosmic Rose",
    bgColor: "#16050e",
    flameA: "#f43f5e",
    flameB: "#c084fc",
    colorA: "#fda4af",
    colorB: "#f43f5e",
    colorC: "#e879f9",
    accent: "#f43f5e",
    accentB: "#fda4af"
  },
  {
    id: "celestial",
    name: "Arctic Celestial",
    bgColor: "#050d18",
    flameA: "#67e8f9",
    flameB: "#818cf8",
    colorA: "#a5f3fc",
    colorB: "#38bdf8",
    colorC: "#c084fc",
    accent: "#38bdf8",
    accentB: "#818cf8"
  },
  {
    id: "amethyst",
    name: "Amethyst Night",
    bgColor: "#0d0617",
    flameA: "#c084fc",
    flameB: "#e879f9",
    colorA: "#d8b4fe",
    colorB: "#a855f7",
    colorC: "#f472b6",
    accent: "#a855f7",
    accentB: "#c084fc"
  }
];

export function WebGLStarfield() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let isDisposed = false;
    let animId: number | null = null;
    let resizeListener: (() => void) | null = null;
    let scrollListener: (() => void) | null = null;
    let mouseMoveListener: ((e: MouseEvent) => void) | null = null;
    let mouseOutListener: (() => void) | null = null;

    async function initStarfield() {
      try {
        if (isDisposed || !canvas) return;

        function hexToVec3(hex: string) {
          const n = parseInt(hex.slice(1), 16);
          return new THREE.Vector3(((n >> 16) & 255) / 255, ((n >> 8) & 255) / 255, (n & 255) / 255);
        }

        const CONFIG = {
          bgColor: "#0a0a24",
          flameColor: "#aee9ff",
          flameColor2: "#c79bff",
          flameAmt: 0.2,
          colorA: "#aef6cf",
          colorB: "#5fe6a0",
          colorC: "#eafff2",
          opacity: 2,
          pointSize: 50,
          brightness: 1.85,
          drift: 2.35,
          twinkle: 1,
          spin: 0.03,
          repelRadius: 5,
          repelStrength: 0.35,
          scrollPush: 8,
          scrollDrift: 6,
          scrollSpin: 0.1,
          parallax: 0.6,
        };

        const PREPARED_THEMES = CHATBOT_STARFIELD_THEMES.map((t) => ({
          ...t,
          bgVec: hexToVec3(t.bgColor),
          flameAVec: hexToVec3(t.flameA),
          flameBVec: hexToVec3(t.flameB),
          colorAVec: hexToVec3(t.colorA),
          colorBVec: hexToVec3(t.colorB),
          colorCVec: hexToVec3(t.colorC),
        }));

        const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.VSMShadowMap;

        const scene = new THREE.Scene();
        scene.background = new THREE.Color(0x000000);
        scene.fog = new THREE.Fog(0x000000, 0, 15);

        const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 80);
        camera.position.set(0, 0, 5);

        const LAYERS = { NONE: 0, TORUS_SCENE: 1, BLOOM_SCENE: 2, ENTIRE_SCENE: 3 };
        camera.layers.enable(LAYERS.TORUS_SCENE);
        camera.layers.enable(LAYERS.BLOOM_SCENE);
        camera.layers.enable(LAYERS.ENTIRE_SCENE);
        scene.add(camera);

        const dummyHalo = new THREE.DataTexture(new Uint8Array([0, 0, 0, 0]), 1, 1, THREE.RGBAFormat);
        dummyHalo.needsUpdate = true;

        const renderScene = new RenderPass(scene, camera);

        // 1. torusComposer
        const torusComposer = new EffectComposer(renderer);
        torusComposer.renderToScreen = false;
        torusComposer.addPass(renderScene);
        torusComposer.addPass(new ShaderPass(GammaCorrectionShader));
        torusComposer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.22, 0.2, 0));
        torusComposer.addPass(new ShaderPass(CopyShader));

        // 2. bloomComposer
        const bloomComposer = new EffectComposer(renderer);
        bloomComposer.renderToScreen = false;
        bloomComposer.addPass(renderScene);
        bloomComposer.addPass(new UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 0.4, 0.55, 0));
        bloomComposer.addPass(new ShaderPass(GammaCorrectionShader));

        // 3. finalComposer with FinalPass
        const FinalPassShader = {
          uniforms: {
            iTime: { value: 0 },
            tDiffuse: { value: null },
            torusTexture: { value: null },
            bloomTexture: { value: null },
            haloTexture: { value: dummyHalo },
            uBg: { value: hexToVec3(CONFIG.bgColor) },
            uFlameA: { value: hexToVec3(CONFIG.flameColor) },
            uFlameB: { value: hexToVec3(CONFIG.flameColor2) },
            uFlameAmt: { value: CONFIG.flameAmt }
          },
          vertexShader: `
            varying vec2 vUv;
            void main() {
              vUv = uv;
              gl_Position = vec4(position, 1.0);
            }
          `,
          fragmentShader: `
            uniform float iTime;
            uniform sampler2D tDiffuse;
            uniform sampler2D bloomTexture;
            uniform sampler2D torusTexture;
            uniform sampler2D haloTexture;
            uniform vec3 uBg;
            uniform vec3 uFlameA;
            uniform vec3 uFlameB;
            uniform float uFlameAmt;
            varying vec2 vUv;

            vec3 warp3d(vec3 pos, float t) {
              float curv = .8, a = 1.9, b = 0.7;
              pos *= 2.;
              pos.x += curv * sin(t + a * pos.y) + t * b;
              pos.y += curv * cos(t + a * pos.x);
              pos.z += curv * sin(t + a * pos.z) + t * b;
              pos.z += curv * cos(t + a * pos.y);
              pos.x += curv * sin(t + a * pos.x);
              pos.x += curv * cos(t + a * pos.z);
              return 0.5 + 0.5 * cos(pos.xyz + vec3(1, 2, 4));
            }

            void main() {
              vec2 uv = 2. * vUv - 1.;
              vec3 w = pow(warp3d(vec3(uv.x, sin(uv.y), uv.y), iTime * 1.5), vec3(1.5));
              vec3 flame = 1.5 * uFlameA * w.x;
              flame *= w.y;
              flame += uFlameB * w.z;
              flame *= smoothstep(0.25, 1., abs(uv.y));
              float md = smoothstep(-0.7, 1., -uv.y * uv.x);
              flame *= md * md;
              vec3 bg = uBg * (1.0 - 0.4 * length(uv));
              vec3 halo = texture2D(haloTexture, vUv).xyz;
              gl_FragColor = vec4(bg + flame * uFlameAmt + texture2D(bloomTexture, vUv).xyz + texture2D(torusTexture, vUv).xyz + texture2D(tDiffuse, vUv).xyz + halo, 1.);
            }
          `
        };

        const finalComposer = new EffectComposer(renderer);
        finalComposer.addPass(renderScene);
        const finalPass = new ShaderPass(FinalPassShader);
        finalComposer.addPass(finalPass);

        finalPass.uniforms.bloomTexture.value = bloomComposer.renderTarget1.texture;
        finalPass.uniforms.torusTexture.value = torusComposer.renderTarget1.texture;

        // Build Starfield BufferGeometry (4200 stars, depth 30)
        const count = 4200;
        const depth = 30;

        const positions = new Float32Array(count * 3);
        const palette = new Float32Array(count);
        const bright = new Float32Array(count);
        const scales = new Float32Array(count);
        const phases = new Float32Array(count);

        for (let i = 0; i < count; i++) {
          const i3 = i * 3;
          positions[i3]     = (Math.random() - 0.5) * 24;
          positions[i3 + 1] = (Math.random() - 0.5) * 16;
          positions[i3 + 2] = (Math.random() - 0.5) * 30;
          palette[i] = Math.floor(Math.random() * 3);
          bright[i]  = 0.7 + Math.random() * 0.6;
          scales[i]  = 0.5 + Math.pow(Math.random(), 1.4) * 2.5;
          phases[i]  = Math.random();
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('aScale', new THREE.Float32BufferAttribute(scales, 1));
        geometry.setAttribute('aPhase', new THREE.Float32BufferAttribute(phases, 1));
        geometry.setAttribute('aPalette', new THREE.Float32BufferAttribute(palette, 1));
        geometry.setAttribute('aBright', new THREE.Float32BufferAttribute(bright, 1));

        const starMaterial = new THREE.ShaderMaterial({
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          uniforms: {
            uTime: { value: 0 },
            uSize: { value: CONFIG.pointSize },
            uOpacity: { value: 0 },
            uDrift: { value: 0 },
            uDepth: { value: 30 },
            uTwinkle: { value: CONFIG.twinkle },
            uCursor: { value: new THREE.Vector3() },
            uRepelRadius: { value: CONFIG.repelRadius },
            uRepelStrength: { value: CONFIG.repelStrength },
            uActivity: { value: 0 },
            uColorA: { value: hexToVec3(CONFIG.colorA) },
            uColorB: { value: hexToVec3(CONFIG.colorB) },
            uColorC: { value: hexToVec3(CONFIG.colorC) },
            uBrightness: { value: CONFIG.brightness }
          },
          vertexShader: `
            uniform float uTime; uniform float uSize; uniform float uDrift; uniform float uDepth; uniform float uTwinkle;
            uniform vec3 uCursor; uniform float uRepelRadius; uniform float uRepelStrength; uniform float uActivity;
            uniform vec3 uColorA; uniform vec3 uColorB; uniform vec3 uColorC;
            attribute float aScale; attribute float aPhase; attribute float aPalette; attribute float aBright;
            varying vec3 vColor; varying float vTwinkle;
            void main() {
              vec3 pos = position;
              pos.z = mod(pos.z + uDrift + (uDepth * 0.5), uDepth) - (uDepth * 0.5);

              float tw = sin(uTime * 1.6 + aPhase * 6.2831);
              vTwinkle = (1.0 - uTwinkle) + uTwinkle * (0.55 + 0.45 * tw);

              vec4 modelPosition = modelMatrix * vec4(pos, 1.0);

              vec3 toParticle = modelPosition.xyz - uCursor;
              float dist = length(toParticle);
              float falloff = smoothstep(uRepelRadius, 0.0, dist);
              modelPosition.xyz += normalize(toParticle + vec3(0.0001)) * falloff * uRepelStrength * uActivity;

              vec4 viewPosition = viewMatrix * modelPosition;
              gl_Position = projectionMatrix * viewPosition;
              gl_PointSize = uSize * aScale;
              gl_PointSize *= (1.0 / -viewPosition.z);

              vec3 base = aPalette < 0.5 ? uColorA : (aPalette < 1.5 ? uColorB : uColorC);
              vColor = base * aBright;
            }
          `,
          fragmentShader: `
            uniform float uOpacity; uniform float uBrightness;
            varying vec3 vColor; varying float vTwinkle;
            void main() {
              vec2 uv = gl_PointCoord - 0.5;
              float d = length(uv);
              if (d > 0.5) discard;
              float strength = pow(1.0 - d * 2.0, 4.0);
              vec3 color = mix(vec3(0.0), vColor, strength);
              gl_FragColor = vec4(color * uBrightness, strength * uOpacity * vTwinkle);
            }
          `
        });

        const points = new THREE.Points(geometry, starMaterial);
        const group = new THREE.Group();
        group.add(points);
        scene.add(group);

        // Crucial for Three.js frustum traversal: enable all layers on both group and points
        group.layers.enable(LAYERS.TORUS_SCENE);
        group.layers.enable(LAYERS.BLOOM_SCENE);
        group.layers.enable(LAYERS.ENTIRE_SCENE);

        points.layers.enable(LAYERS.TORUS_SCENE);
        points.layers.enable(LAYERS.BLOOM_SCENE);
        points.layers.enable(LAYERS.ENTIRE_SCENE);

        // Pointer Tracking (World Cursor Void Repel)
        let lastMove = performance.now();
        let active = false;
        const POINTER = {
          ndc: new THREE.Vector2(),
          world: new THREE.Vector3(),
          activity: 0
        };

        mouseMoveListener = (e: MouseEvent) => {
          POINTER.ndc.x = (e.clientX / window.innerWidth) * 2 - 1;
          POINTER.ndc.y = -(e.clientY / window.innerHeight) * 2 + 1;
          active = true;
          lastMove = performance.now();
        };
        window.addEventListener("mousemove", mouseMoveListener, { passive: true });

        mouseOutListener = () => {
          active = false;
        };
        window.addEventListener("mouseout", mouseOutListener);

        // Double-Damped Scroll Smoothing
        let scrollTarget = 0;
        let scrollSmooth = 0;
        let scrollCurrent = 0;
        const mouseSmooth = new THREE.Vector2();

        scrollListener = () => {
          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          scrollTarget = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
        };
        window.addEventListener("scroll", scrollListener, { passive: true });

        // 45-Second Dynamic Theme Fading Engine
        const FADE_PERIOD = 45.0; // 45 seconds slow fading transition
        let pauseTimeAccumulator = 0;
        let isPaused = false;
        let customOffset = 0;

        // Custom window event listeners for theme controls
        const handleThemeSkip = () => {
          customOffset += 1;
        };
        const handleThemeToggle = () => {
          isPaused = !isPaused;
        };
        window.addEventListener("radiance:theme-next", handleThemeSkip);
        window.addEventListener("radiance:theme-toggle-pause", handleThemeToggle);

        let t0 = performance.now() / 1000;
        const appearStart = performance.now();
        let uDrift = 0;
        let lastEmittedSec = -1;

        function renderFrame() {
          if (isDisposed) return;
          animId = requestAnimationFrame(renderFrame);

          const now = performance.now();
          const t = now / 1000;
          const dt = Math.min(0.05, t - t0);
          t0 = t;

          if (!isPaused) {
            pauseTimeAccumulator += dt;
          }

          // 45-Second Continuous Theme Cross-Fade
          const totalTime = pauseTimeAccumulator + customOffset * FADE_PERIOD;
          const cycleProgress = (totalTime % (PREPARED_THEMES.length * FADE_PERIOD)) / FADE_PERIOD;
          const currentIdx = Math.floor(cycleProgress) % PREPARED_THEMES.length;
          const nextIdx = (currentIdx + 1) % PREPARED_THEMES.length;
          const localProgress = cycleProgress - Math.floor(cycleProgress);

          // Smooth sinusoidal S-curve interpolation
          const blend = 0.5 - 0.5 * Math.cos(localProgress * Math.PI);

          const themeA = PREPARED_THEMES[currentIdx];
          const themeB = PREPARED_THEMES[nextIdx];

          starMaterial.uniforms.uColorA.value.lerpVectors(themeA.colorAVec, themeB.colorAVec, blend);
          starMaterial.uniforms.uColorB.value.lerpVectors(themeA.colorBVec, themeB.colorBVec, blend);
          starMaterial.uniforms.uColorC.value.lerpVectors(themeA.colorCVec, themeB.colorCVec, blend);

          finalPass.uniforms.uBg.value.lerpVectors(themeA.bgVec, themeB.bgVec, blend);
          finalPass.uniforms.uFlameA.value.lerpVectors(themeA.flameAVec, themeB.flameAVec, blend);
          finalPass.uniforms.uFlameB.value.lerpVectors(themeA.flameBVec, themeB.flameBVec, blend);

          // Emit theme change state to DOM and CustomEvents once per second
          const currentSec = Math.floor(t);
          if (currentSec !== lastEmittedSec) {
            lastEmittedSec = currentSec;
            const timeLeft = Math.max(0, Math.ceil(FADE_PERIOD * (1 - localProgress)));
            
            // Gracefully update DOM root CSS variable so website components glow in harmony
            const root = document.documentElement;
            root.style.setProperty("--theme-accent", themeA.accent);
            root.style.setProperty("--theme-accent-next", themeB.accent);
            
            window.dispatchEvent(
              new CustomEvent("radiance:theme-update", {
                detail: {
                  current: themeA,
                  next: themeB,
                  progress: localProgress,
                  timeLeft,
                  isPaused,
                },
              })
            );
          }

          // World Cursor Void Repel
          if (active) {
            const p = new THREE.Vector3(POINTER.ndc.x, POINTER.ndc.y, 0.5);
            p.unproject(camera);
            const dir = p.sub(camera.position).normalize();
            if (Math.abs(dir.z) > 1e-4) {
              const tIntersect = -camera.position.z / dir.z;
              if (tIntersect > 0 && isFinite(tIntersect)) {
                const target = camera.position.clone().add(dir.multiplyScalar(tIntersect));
                POINTER.world.lerp(target, 0.12);
              }
            }
          } else {
            POINTER.world.lerp(new THREE.Vector3(0, 0, 0), 0.12);
          }

          const idleSec = (now - lastMove) / 1000;
          const want = active && idleSec < 3 ? 1 : 0;
          POINTER.activity += (want - POINTER.activity) * 0.06;

          starMaterial.uniforms.uCursor.value.copy(POINTER.world);
          starMaterial.uniforms.uActivity.value = POINTER.activity;

          // Double-Damped Scroll Smoothing
          scrollSmooth += (scrollTarget - scrollSmooth) * 0.1;
          scrollCurrent += (scrollSmooth - scrollCurrent) * 0.06;
          mouseSmooth.x += (POINTER.ndc.x - mouseSmooth.x) * 0.06;
          mouseSmooth.y += (POINTER.ndc.y - mouseSmooth.y) * 0.06;

          const scroll = scrollCurrent;
          const m = mouseSmooth;

          starMaterial.uniforms.uTime.value = t;
          uDrift += dt * (CONFIG.drift + scroll * CONFIG.scrollDrift);
          starMaterial.uniforms.uDrift.value = uDrift;

          camera.position.set(m.x * CONFIG.parallax, m.y * CONFIG.parallax, 5 - scroll * CONFIG.scrollPush);
          camera.lookAt(m.x * CONFIG.parallax, m.y * CONFIG.parallax, -10);

          // Appear Fade-In
          const elapsed = now - appearStart;
          const fade = Math.min(Math.max((elapsed - 300) / 1400, 0), 1);
          starMaterial.uniforms.uOpacity.value = fade * CONFIG.opacity;

          group.rotation.z += dt * (CONFIG.spin + scroll * CONFIG.scrollSpin);

          finalPass.uniforms.iTime.value = t;

          // Render Composers
          camera.layers.set(LAYERS.TORUS_SCENE);
          torusComposer.render();
          camera.layers.set(LAYERS.BLOOM_SCENE);
          bloomComposer.render();

          // Connect output render buffer textures to final composite shader
          finalPass.uniforms.bloomTexture.value = bloomComposer.readBuffer.texture;
          finalPass.uniforms.torusTexture.value = torusComposer.readBuffer.texture;

          camera.layers.set(LAYERS.ENTIRE_SCENE);
          finalComposer.render();
        }

        renderFrame();

        resizeListener = () => {
          const w = window.innerWidth;
          const h = window.innerHeight;
          renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          renderer.setSize(w, h);
          camera.aspect = w / h;
          camera.updateProjectionMatrix();

          torusComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          torusComposer.setSize(w, h);
          bloomComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          bloomComposer.setSize(w, h);
          finalComposer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
          finalComposer.setSize(w, h);

          const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
          scrollTarget = maxScroll > 0 ? Math.min(Math.max(window.scrollY / maxScroll, 0), 1) : 0;
        };
        window.addEventListener("resize", resizeListener);
      } catch (err) {
        console.warn("[Radiance Starfield] Initialization fallback:", err);
      }
    }

    initStarfield();

    return () => {
      isDisposed = true;
      if (animId) cancelAnimationFrame(animId);
      if (resizeListener) window.removeEventListener("resize", resizeListener);
      if (scrollListener) window.removeEventListener("scroll", scrollListener);
      if (mouseMoveListener) window.removeEventListener("mousemove", mouseMoveListener);
      if (mouseOutListener) window.removeEventListener("mouseout", mouseOutListener);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      id="scene"
      className="planet-canvas starfield-canvas"
      aria-hidden="true"
      style={{
        position: "fixed",
        inset: 0,
        width: "100vw",
        height: "100vh",
        display: "block",
        zIndex: 0,
        pointerEvents: "none",
      }}
    />
  );
}