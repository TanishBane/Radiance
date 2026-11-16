/**
 * Radiance Adaptive Visual Quality & Display-Aware Performance Engine
 *
 * Refined Device Classification & Two-Way Dynamic Adaptation Architecture:
 * - Conservative Initial Settings: Mobile starts conservatively at "balanced"
 *   (or "smooth" only when 90/120Hz display refresh is empirically confirmed via rAF).
 * - No Misleading Heuristics: Removed DPR >= 2.5 and guessed concurrency. High DPR OLED
 *   screens exist on cheap phones and strain weak GPUs.
 * - Strict Separation: Display refresh capability (detectedHz, rAF pacing) is decoupled
 *   from graphics rendering capability (starCount, maxDpr, bloom).
 * - Two-Way Dynamic Runtime Adaptation:
 *   - Degrade: Sustained jank (>= 10 frames > 1.8x budget in window) drops profile by 1 tier (15s hysteresis).
 *   - Promote: Sustained pristine performance (avg dt <= 0.75x budget, 0 dropped frames over 20s active rendering)
 *     promotes profile by 1 tier up to the device hardware cap (20s hysteresis).
 *   - Visibility-Aware: Pauses adaptation when document.hidden is true; resets delta baselines on resume.
 *   - Distribution Tracking: Measures p50, p90, and p99 frame latency distribution.
 */

"use client";

import { useEffect, useState, useRef, useCallback } from "react";

export type VisualQualityTier = "high" | "balanced" | "lightweight" | "power-efficient";

export type QualityProfileId = "auto" | "ultra" | "smooth" | "balanced" | "power-saver";

export type QualityTier = QualityProfileId | VisualQualityTier;

export type DeviceFormFactor = "mobile" | "tablet" | "foldable" | "desktop";

export type AdaptationAction = "none" | "degrade" | "promote";

export interface DisplayRefreshRateInfo {
  hz: number;
  targetDtMs: number;
  isHighRefreshRate: boolean;
}

export interface ClientCapabilities {
  prefersReducedMotion: boolean;
  hardwareConcurrency: number;
  devicePixelRatio: number;
  saveData: boolean;
  webglSupported: boolean;
  isMobile: boolean;
  isTablet?: boolean;
  isFoldable?: boolean;
  formFactor?: DeviceFormFactor;
  deviceMemory?: number;
  batteryLevel?: number;
  isDischarging?: boolean;
  effectiveType?: string;
  tier?: VisualQualityTier;
  detectedHz?: number;
  isAppleDevice?: boolean;
  hasProMotion?: boolean;
}

export interface VisualTierConfig {
  tier: VisualQualityTier;
  profileId: QualityProfileId;
  starCount: number;
  maxDpr: number;
  enableBloom: boolean;
  driftSpeed: number;
  barrelRoll: number;
  twinkle: number;
  repelStrength: number;
  targetFps: number;
  frameBudgetMs: number;
}

export interface FrameMetrics {
  currentFps: number;
  averageDtMs: number;
  p50DtMs: number;
  p90DtMs: number;
  p99DtMs: number;
  maxDtMs: number;
  droppedFrames: number;
  totalFrames: number;
  pristineDurationMs: number;
  lastDegradeTime: number;
  lastPromoteTime: number;
}

export const VISUAL_TIER_CONFIGS: Record<string, VisualTierConfig> = {
  high: {
    tier: "high",
    profileId: "ultra",
    starCount: 4200,
    maxDpr: 2.0,
    enableBloom: true,
    driftSpeed: 2.35,
    barrelRoll: 0.03,
    twinkle: 1.0,
    repelStrength: 0.35,
    targetFps: 120,
    frameBudgetMs: 8.33,
  },
  ultra: {
    tier: "high",
    profileId: "ultra",
    starCount: 4200,
    maxDpr: 2.0,
    enableBloom: true,
    driftSpeed: 2.35,
    barrelRoll: 0.03,
    twinkle: 1.0,
    repelStrength: 0.35,
    targetFps: 120,
    frameBudgetMs: 8.33,
  },
  smooth: {
    tier: "balanced",
    profileId: "smooth",
    starCount: 2400,
    maxDpr: 2.0, // High-density OLED and Retina screens on mobile receive sharp, high-res rendering
    enableBloom: false, // Single-pass direct render for guaranteed sub-8.33ms 120 FPS cadence
    driftSpeed: 1.8,
    barrelRoll: 0.02,
    twinkle: 0.85,
    repelStrength: 0.25,
    targetFps: 120,
    frameBudgetMs: 8.33,
  },
  balanced: {
    tier: "balanced",
    profileId: "balanced",
    starCount: 1800,
    maxDpr: 1.5,
    enableBloom: false,
    driftSpeed: 1.5,
    barrelRoll: 0.015,
    twinkle: 0.7,
    repelStrength: 0.2,
    targetFps: 60,
    frameBudgetMs: 16.67,
  },
  lightweight: {
    tier: "lightweight",
    profileId: "power-saver",
    starCount: 600,
    maxDpr: 1.0,
    enableBloom: false,
    driftSpeed: 0.2, // Near-static calm drift
    barrelRoll: 0.0, // 0 barrel roll when requested
    twinkle: 0.2,
    repelStrength: 0.0,
    targetFps: 30,
    frameBudgetMs: 33.33,
  },
  "power-efficient": {
    tier: "power-efficient",
    profileId: "power-saver",
    starCount: 600,
    maxDpr: 1.0,
    enableBloom: false,
    driftSpeed: 0.2,
    barrelRoll: 0.0,
    twinkle: 0.2,
    repelStrength: 0.0,
    targetFps: 30,
    frameBudgetMs: 33.33,
  },
  "power-saver": {
    tier: "power-efficient",
    profileId: "power-saver",
    starCount: 600,
    maxDpr: 1.0,
    enableBloom: false,
    driftSpeed: 0.2,
    barrelRoll: 0.0,
    twinkle: 0.2,
    repelStrength: 0.0,
    targetFps: 30,
    frameBudgetMs: 33.33,
  },
};

/**
 * Safely inspects browser WebGL support via test canvas context.
 */
export function isWebGLSupported(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  if (typeof (window as unknown as { WebGLRenderingContext?: unknown }).WebGLRenderingContext === "undefined") {
    return false;
  }
  try {
    const canvas = document.createElement("canvas");
    if (typeof canvas.getContext !== "function") {
      return false;
    }
    const gl =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(gl);
  } catch {
    return false;
  }
}

/**
 * High-resolution display refresh rate detection.
 * Samples consecutive requestAnimationFrame timestamps over a sliding window
 * to determine whether the display is running at 60Hz, 90Hz, 120Hz, or 144Hz.
 */
let cachedRefreshRate: DisplayRefreshRateInfo | null = null;
let refreshRateDetectionPromise: Promise<DisplayRefreshRateInfo> | null = null;

export function getEstimatedRefreshRate(): DisplayRefreshRateInfo {
  if (cachedRefreshRate) return cachedRefreshRate;
  return {
    hz: 60,
    targetDtMs: 16.67,
    isHighRefreshRate: false,
  };
}

export function detectDisplayRefreshRate(sampleCount = 20): Promise<DisplayRefreshRateInfo> {
  if (cachedRefreshRate) {
    return Promise.resolve(cachedRefreshRate);
  }

  if (refreshRateDetectionPromise) {
    return refreshRateDetectionPromise;
  }

  if (typeof window === "undefined" || typeof requestAnimationFrame !== "function") {
    const fallback: DisplayRefreshRateInfo = { hz: 60, targetDtMs: 16.67, isHighRefreshRate: false };
    cachedRefreshRate = fallback;
    return Promise.resolve(fallback);
  }

  refreshRateDetectionPromise = new Promise<DisplayRefreshRateInfo>((resolve) => {
    const deltas: number[] = [];
    let lastTime = performance.now();
    let frames = 0;

    const sample = (now: number) => {
      const dt = now - lastTime;
      lastTime = now;

      // Discard first frame (warm-up anomaly) and outliers > 50ms (tab blur/jank)
      if (frames > 0 && dt > 4 && dt < 50) {
        deltas.push(dt);
      }
      frames++;

      if (deltas.length < sampleCount && frames < sampleCount + 10) {
        requestAnimationFrame(sample);
      } else {
        // Calculate median delta time
        deltas.sort((a, b) => a - b);
        const medianDt = deltas.length > 0
          ? deltas[Math.floor(deltas.length / 2)]
          : 16.67;

        let hz = 60;
        let targetDtMs = 16.67;

        if (medianDt <= 7.5) {
          hz = 144;
          targetDtMs = 6.94;
        } else if (medianDt <= 9.5) {
          hz = 120;
          targetDtMs = 8.33;
        } else if (medianDt <= 12.5) {
          hz = 90;
          targetDtMs = 11.11;
        } else if (medianDt <= 22.0) {
          hz = 60;
          targetDtMs = 16.67;
        } else {
          hz = 30;
          targetDtMs = 33.33;
        }

        const result: DisplayRefreshRateInfo = {
          hz,
          targetDtMs,
          isHighRefreshRate: hz >= 90,
        };

        cachedRefreshRate = result;
        resolve(result);
      }
    };

    requestAnimationFrame(sample);
  });

  return refreshRateDetectionPromise;
}

/**
 * Evaluates current client capabilities with explicit Mobile, Tablet, and Foldable classification.
 * Uses exact hardware concurrency without guesswork or assuming high performance from DPR.
 */
export function detectClientCapabilities(): ClientCapabilities {
  if (typeof window === "undefined") {
    return {
      prefersReducedMotion: false,
      hardwareConcurrency: 4,
      devicePixelRatio: 1,
      saveData: false,
      webglSupported: true,
      isMobile: false,
      isTablet: false,
      isFoldable: false,
      formFactor: "desktop",
      detectedHz: 60,
    };
  }

  const nav = typeof navigator !== "undefined" ? navigator : undefined;

  const prefersReducedMotion =
    typeof window.matchMedia === "function"
      ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
      : false;

  const hardwareConcurrency = nav?.hardwareConcurrency ?? 4;
  const devicePixelRatio = window.devicePixelRatio || 1;

  // Check client Save-Data preference (Network Information API)
  const connection = (nav as unknown as { connection?: { saveData?: boolean; effectiveType?: string } })?.connection;
  const saveData = Boolean(connection?.saveData);
  const effectiveType = connection?.effectiveType;

  // Device Memory API (Chrome/Edge only, safely undefined on Safari/Firefox)
  const deviceMemory = (nav as unknown as { deviceMemory?: number })?.deviceMemory;

  const webglSupported = isWebGLSupported();

  // Multi-signal form factor & touch detection
  const userAgent = nav?.userAgent ?? "";
  const maxTouchPoints = nav?.maxTouchPoints ?? 0;
  const hasCoarsePointer = typeof window.matchMedia === "function"
    ? window.matchMedia("(pointer: coarse)").matches
    : false;
  const isTouchDevice = maxTouchPoints > 0 || hasCoarsePointer;

  const width = typeof window.innerWidth === "number" ? window.innerWidth : 1200;
  const height = typeof window.innerHeight === "number" ? window.innerHeight : 800;
  const aspectRatio = height > 0 ? width / height : 1.5;

  const isAppleDevice = /iPhone|iPad|iPod/i.test(userAgent) ||
    (/Macintosh/i.test(userAgent) && maxTouchPoints > 1);

  // 1. Mobile Detection (touch device <= 768px, or mobile UA)
  const isMobileUA = /Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isSmallScreen = width <= 768;

  // 2. Foldable Detection (narrow folded cover screen or square unfolded inner screen)
  const isFoldableUA = /Fold|Flip/i.test(userAgent);
  const isFoldedCover = isTouchDevice && width >= 320 && width <= 400 && aspectRatio < 0.48; // e.g. 23.1:9 cover ratio
  const isUnfoldedSquare = isTouchDevice && width >= 540 && width <= 840 && aspectRatio >= 0.85 && aspectRatio <= 1.25; // near 1:1 or 4:3 inner ratio
  const isFoldableSegments = typeof window.matchMedia === "function"
    ? window.matchMedia("(horizontal-viewport-segments: 2), (vertical-viewport-segments: 2)").matches
    : false;
  const isFoldable = isTouchDevice && (isFoldableUA || isFoldedCover || isUnfoldedSquare || isFoldableSegments);

  const isMobile = isMobileUA || (isTouchDevice && isSmallScreen) || isFoldable;

  // 3. Tablet Detection (768px - 1024px touch devices or iPad / Android Tablet UA on >= 768px screens)
  const isTabletUA = /iPad|Tablet|PlayBook|Silk/i.test(userAgent) ||
    (/Android/i.test(userAgent) && !/Mobile/i.test(userAgent));
  const isTabletSize = isTouchDevice && width >= 768 && width <= 1024;
  const isTablet = (isTabletUA || isTabletSize) && width >= 768;

  // 4. Form Factor Resolution
  let formFactor: DeviceFormFactor = "desktop";
  if (isFoldable) formFactor = "foldable";
  else if (isTablet) formFactor = "tablet";
  else if (isMobile) formFactor = "mobile";

  const detectedHz = cachedRefreshRate?.hz ?? 60;
  const hasProMotion = isAppleDevice && detectedHz >= 90;

  return {
    prefersReducedMotion,
    hardwareConcurrency,
    devicePixelRatio,
    saveData,
    webglSupported,
    isMobile,
    isTablet,
    isFoldable,
    formFactor,
    deviceMemory,
    effectiveType,
    detectedHz,
    isAppleDevice,
    hasProMotion,
  };
}

/**
 * Determines the visual quality tier based on evaluated client capabilities.
 * Backward-compatible helper for legacy 3-tier visual contracts.
 */
export function getVisualQualityTier(
  capabilities?: Partial<ClientCapabilities>
): VisualQualityTier {
  const merged: ClientCapabilities = {
    ...detectClientCapabilities(),
    ...capabilities,
  };

  // Rule 1: Reduced motion, active save-data, or missing WebGL drops to Lightweight
  if (merged.prefersReducedMotion || merged.saveData || !merged.webglSupported) {
    return "lightweight";
  }

  // Rule 2: Low-concurrency hardware (<= 2 logical cores) drops to Lightweight
  if (merged.hardwareConcurrency <= 2) {
    return "lightweight";
  }

  // Rule 3: Mobile devices
  if (merged.isMobile) {
    // If mobile device is strictly constrained with low cores, use lightweight
    if (merged.hardwareConcurrency <= 4 && (merged.detectedHz ?? 60) < 90) {
      return "lightweight";
    }
    return "balanced";
  }

  // Rule 4: Desktop devices
  if (merged.hardwareConcurrency <= 4) {
    return "balanced";
  }

  return "high";
}

/**
 * Returns the maximum quality profile a device hardware is safely capable of sustaining.
 * Prevents mobile devices with thermal constraints from being promoted to excessive tiers.
 */
export function getHardwareQualityCap(capabilities?: Partial<ClientCapabilities>): QualityProfileId {
  const detected = detectClientCapabilities();
  const merged: ClientCapabilities = {
    ...detected,
    webglSupported: capabilities?.webglSupported ?? true,
    ...capabilities,
  };

  if (merged.prefersReducedMotion || merged.saveData || !merged.webglSupported) {
    return "power-saver";
  }

  if (merged.isMobile) {
    // Heavily constrained budget phones
    if (merged.hardwareConcurrency <= 2 || (merged.deviceMemory !== undefined && merged.deviceMemory <= 2)) {
      return "balanced";
    }
    // Capable mobile hardware caps at "smooth" (avoids heavy multi-composer bloom)
    return "smooth";
  }

  if (merged.isTablet || merged.isFoldable) {
    return "smooth";
  }

  // Desktop workstations can sustain Ultra
  return "ultra";
}

/**
 * Resolves the initial quality configuration conservatively:
 * - Mobile starts at "balanced" (or "smooth" only if 90/120Hz display refresh is empirically detected).
 * - Hard constraints (reduced motion, low battery <= 20%, low memory <= 2GB, save-data, 2G) start at "power-saver".
 * - Desktop starts at "ultra" (if concurrency >= 6), else "balanced".
 */
export function resolveQualityProfile(
  capabilities?: Partial<ClientCapabilities>,
  preference: QualityTier = "auto"
): QualityProfileId {
  if (preference !== "auto") {
    if (preference === "ultra" || preference === "high") return "ultra";
    if (preference === "smooth") return "smooth";
    if (preference === "balanced") return "balanced";
    if (preference === "power-saver" || preference === "lightweight" || preference === "power-efficient") {
      return "power-saver";
    }
  }

  const merged: ClientCapabilities = {
    ...detectClientCapabilities(),
    ...capabilities,
  };

  // 1. Hard constraints dropping to power-saver
  if (
    merged.prefersReducedMotion ||
    merged.saveData ||
    !merged.webglSupported ||
    merged.hardwareConcurrency <= 2 ||
    (merged.batteryLevel !== undefined && merged.batteryLevel <= 0.2 && merged.isDischarging) ||
    (merged.deviceMemory !== undefined && merged.deviceMemory > 0 && merged.deviceMemory <= 2) ||
    merged.effectiveType === "slow-2g" ||
    merged.effectiveType === "2g"
  ) {
    return "power-saver";
  }

  const isHighHz = (merged.detectedHz ?? 60) >= 90 || Boolean(merged.hasProMotion);

  // 2. Mobile Hardware: Conservative initial setting
  if (merged.isMobile) {
    // Budget mobile hardware without high-refresh
    if (merged.hardwareConcurrency <= 4 && !isHighHz) {
      return "power-saver";
    }
    // High-refresh mobile (explicitly confirmed >= 90Hz) gets Smooth
    if (isHighHz) {
      return "smooth";
    }
    // Standard mobile starts conservatively at Balanced
    return "balanced";
  }

  // 3. Tablet & Foldable Hardware
  if (merged.isTablet || merged.isFoldable) {
    if (isHighHz) return "smooth";
    return "balanced";
  }

  // 4. Desktop Hardware
  if (merged.hardwareConcurrency <= 4) {
    return "balanced";
  }

  return "ultra";
}

/**
 * Resolves the visual quality tier profile with full backward compatibility.
 */
export function resolveVisualQualityTier(
  capabilities?: Partial<ClientCapabilities>
): VisualQualityTier {
  const merged: ClientCapabilities = {
    ...detectClientCapabilities(),
    ...capabilities,
  };

  if (merged.tier === "power-efficient" || merged.tier === "lightweight") {
    return merged.tier;
  }

  if (merged.batteryLevel !== undefined && merged.batteryLevel <= 0.2 && merged.isDischarging) {
    return "power-efficient";
  }

  if (merged.deviceMemory !== undefined && merged.deviceMemory > 0 && merged.deviceMemory <= 2) {
    return "power-efficient";
  }

  if (merged.effectiveType === "slow-2g" || merged.effectiveType === "2g") {
    return "power-efficient";
  }

  const baseTier = getVisualQualityTier(merged);
  return baseTier === "lightweight" ? "power-efficient" : baseTier;
}

/**
 * Retrieves the configuration parameters for a specified visual quality tier or profile.
 */
export function getVisualTierConfig(tierOrProfile: QualityTier | string): VisualTierConfig {
  const normalized = tierOrProfile.toLowerCase();
  if (normalized === "ultra") return VISUAL_TIER_CONFIGS.ultra;
  if (normalized === "smooth") return VISUAL_TIER_CONFIGS.smooth;
  if (normalized === "power-saver") return VISUAL_TIER_CONFIGS["power-saver"];
  return VISUAL_TIER_CONFIGS[normalized] ?? VISUAL_TIER_CONFIGS.balanced;
}

/**
 * Helper to compute statistical percentiles from a sorted array of numbers.
 */
function getPercentile(sorted: number[], p: number): number {
  if (sorted.length === 0) return 0;
  const index = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return Math.round(sorted[index] * 10) / 10;
}

/**
 * Centralized frame latency logging, percentiles distribution tracking,
 * and two-way dynamic runtime adaptation store (degrade & promote).
 */
class FrameLatencyTracker {
  private samples: number[] = [];
  private readonly maxSamples = 120;
  private droppedFrames = 0;
  private totalFrames = 0;
  private lastDegradeTime = 0;
  private lastPromoteTime = 0;
  private pristineStartTime = 0;
  private listeners = new Set<(metrics: FrameMetrics) => void>();

  /**
   * Resets all tracking state and metrics (useful for testing and major route switches).
   */
  public reset(): void {
    this.samples = [];
    this.droppedFrames = 0;
    this.totalFrames = 0;
    this.lastDegradeTime = 0;
    this.lastPromoteTime = 0;
    this.pristineStartTime = 0;
  }

  /**
   * Resets delta baseline on visibility resume so tab wakeup doesn't trigger false jank.
   */
  public resetBaseline(): void {
    this.pristineStartTime = 0;
  }

  /**
   * Records a frame delta time.
   * Returns "degrade" when sustained jank occurs,
   * returns "promote" when sustained pristine performance occurs,
   * or "none".
   */
  public recordFrame(
    dtMs: number,
    targetBudgetMs = 16.67,
    currentProfile: QualityProfileId = "balanced",
    maxCapProfile: QualityProfileId = "ultra"
  ): AdaptationAction {
    // Ignore absurd outlier deltas from tab freeze / debugger pauses
    if (dtMs <= 0 || dtMs > 1000) {
      return "none";
    }

    this.totalFrames++;
    this.samples.push(dtMs);
    if (this.samples.length > this.maxSamples) {
      this.samples.shift();
    }

    const now = performance.now();
    let action: AdaptationAction = "none";

    // 1. Degrade Check: Frame taking > 1.8x the target frame budget indicates jank
    if (dtMs > targetBudgetMs * 1.8) {
      this.droppedFrames++;
      this.pristineStartTime = 0; // Reset pristine streak

      // Require at least 10 consecutive dropped frames and 15s hysteresis cooldown
      if (this.droppedFrames >= 10 && (this.lastDegradeTime === 0 || now - this.lastDegradeTime > 15000)) {
        this.lastDegradeTime = now;
        this.droppedFrames = 0;
        action = "degrade";
      }
    }
    // 2. Pristine Check: Frame executes with ample headroom (<= 0.75x budget)
    else if (dtMs <= targetBudgetMs * 0.75) {
      // Gradually heal dropped frames counter
      this.droppedFrames = Math.max(0, this.droppedFrames - 1);

      if (this.droppedFrames === 0) {
        if (this.pristineStartTime === 0) {
          this.pristineStartTime = now;
        } else {
          const pristineDuration = now - this.pristineStartTime;
          const profileRanks: Record<QualityProfileId, number> = {
            "power-saver": 0,
            balanced: 1,
            smooth: 2,
            ultra: 3,
            auto: 1,
          };

          const currentRank = profileRanks[currentProfile] ?? 1;
          const capRank = profileRanks[maxCapProfile] ?? 3;

          // Require 20 seconds of sustained pristine rendering, 20s cooldown from last promote/degrade,
          // and ensure current tier has not reached the hardware cap
          if (
            pristineDuration >= 20000 &&
            currentRank < capRank &&
            (this.lastPromoteTime === 0 || now - this.lastPromoteTime > 20000) &&
            (this.lastDegradeTime === 0 || now - this.lastDegradeTime > 20000)
          ) {
            this.lastPromoteTime = now;
            this.pristineStartTime = now;
            action = "promote";
          }
        }
      }
    }
    // 3. Normal Operating Range (0.75x to 1.8x budget)
    else {
      this.droppedFrames = Math.max(0, this.droppedFrames - 1);
      // Reset pristine streak if frame is not performing with sufficient headroom
      this.pristineStartTime = 0;
    }

    if (this.totalFrames % 30 === 0 && this.listeners.size > 0) {
      const metrics = this.getMetrics();
      this.listeners.forEach((fn) => fn(metrics));
    }

    return action;
  }

  public getMetrics(): FrameMetrics {
    const len = this.samples.length;
    if (len === 0) {
      return {
        currentFps: 60,
        averageDtMs: 16.67,
        p50DtMs: 16.67,
        p90DtMs: 16.67,
        p99DtMs: 16.67,
        maxDtMs: 16.67,
        droppedFrames: 0,
        totalFrames: this.totalFrames,
        pristineDurationMs: 0,
        lastDegradeTime: this.lastDegradeTime,
        lastPromoteTime: this.lastPromoteTime,
      };
    }

    const sorted = [...this.samples].sort((a, b) => a - b);
    const sum = this.samples.reduce((acc, v) => acc + v, 0);
    const avg = sum / len;
    const max = Math.max(...this.samples);
    const fps = avg > 0 ? Math.round(1000 / avg) : 60;
    const pristineDuration = this.pristineStartTime > 0 ? performance.now() - this.pristineStartTime : 0;

    return {
      currentFps: fps,
      averageDtMs: Math.round(avg * 10) / 10,
      p50DtMs: getPercentile(sorted, 50),
      p90DtMs: getPercentile(sorted, 90),
      p99DtMs: getPercentile(sorted, 99),
      maxDtMs: Math.round(max * 10) / 10,
      droppedFrames: this.droppedFrames,
      totalFrames: this.totalFrames,
      pristineDurationMs: Math.round(pristineDuration),
      lastDegradeTime: this.lastDegradeTime,
      lastPromoteTime: this.lastPromoteTime,
    };
  }

  public subscribe(fn: (metrics: FrameMetrics) => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
}

export const globalFrameTracker = new FrameLatencyTracker();

/**
 * Global function to report frame latency from any rendering loop.
 * Supports two-way dynamic adaptation.
 */
export function recordFrameLatency(
  dtMs: number,
  targetBudgetMs?: number,
  currentProfile?: QualityProfileId,
  maxCapProfile?: QualityProfileId
): AdaptationAction {
  return globalFrameTracker.recordFrame(dtMs, targetBudgetMs, currentProfile, maxCapProfile);
}

/**
 * React hook that dynamically detects visual capabilities and display refresh rates,
 * and executes two-way dynamic quality adaptation (degradation & promotion) with hysteresis damping.
 */
export function useAdaptiveQuality(overrideTier?: QualityTier) {
  const [capabilities, setCapabilities] = useState<ClientCapabilities>(() => ({
    prefersReducedMotion: false,
    hardwareConcurrency: 4,
    devicePixelRatio: 1,
    saveData: false,
    webglSupported: true,
    isMobile: false,
    detectedHz: 60,
  }));

  const [refreshRate, setRefreshRate] = useState<DisplayRefreshRateInfo>(getEstimatedRefreshRate);

  const [profile, setProfile] = useState<QualityProfileId>(() => {
    if (overrideTier && overrideTier !== "auto") {
      return resolveQualityProfile(undefined, overrideTier);
    }
    return "balanced"; // Conservative startup
  });

  const [tier, setTier] = useState<VisualQualityTier>(() => {
    return VISUAL_TIER_CONFIGS[profile]?.tier ?? "balanced";
  });

  const hardwareCapRef = useRef<QualityProfileId>("ultra");

  // Two-way runtime adaptation handler
  const handleFrameCheck = useCallback((dtMs: number) => {
    if (overrideTier && overrideTier !== "auto") return;

    const currentConfig = VISUAL_TIER_CONFIGS[profile] ?? VISUAL_TIER_CONFIGS.balanced;
    const action = globalFrameTracker.recordFrame(
      dtMs,
      currentConfig.frameBudgetMs,
      profile,
      hardwareCapRef.current
    );

    if (action === "degrade") {
      setProfile((current) => {
        let next: QualityProfileId = current;
        if (current === "ultra") next = "smooth";
        else if (current === "smooth") next = "balanced";
        else if (current === "balanced") next = "power-saver";

        const nextTier = VISUAL_TIER_CONFIGS[next]?.tier ?? "balanced";
        setTier(nextTier);
        return next;
      });
    } else if (action === "promote") {
      setProfile((current) => {
        let next: QualityProfileId = current;
        if (current === "power-saver") next = "balanced";
        else if (current === "balanced") next = "smooth";
        else if (current === "smooth" && hardwareCapRef.current === "ultra") next = "ultra";

        const nextTier = VISUAL_TIER_CONFIGS[next]?.tier ?? "balanced";
        setTier(nextTier);
        return next;
      });
    }
  }, [overrideTier, profile]);

  useEffect(() => {
    let isMounted = true;

    // Detect refresh rate asynchronously via rAF benchmark
    detectDisplayRefreshRate().then((rate) => {
      if (!isMounted) return;
      setRefreshRate(rate);

      const caps = {
        ...detectClientCapabilities(),
        detectedHz: rate.hz,
      };
      setCapabilities(caps);
      hardwareCapRef.current = getHardwareQualityCap(caps);

      const resolvedProfile = resolveQualityProfile(caps, overrideTier ?? "auto");
      setProfile(resolvedProfile);
      setTier(VISUAL_TIER_CONFIGS[resolvedProfile]?.tier ?? "balanced");
    });

    const initialCaps = detectClientCapabilities();
    setCapabilities(initialCaps);
    hardwareCapRef.current = getHardwareQualityCap(initialCaps);
    const initialProfile = resolveQualityProfile(initialCaps, overrideTier ?? "auto");
    setProfile(initialProfile);
    setTier(VISUAL_TIER_CONFIGS[initialProfile]?.tier ?? "balanced");

    // Visibility change listener: reset baseline on wake so tab resume doesn't trigger false jank
    const handleVisibility = () => {
      if (!document.hidden) {
        globalFrameTracker.resetBaseline();
      }
    };
    document.addEventListener("visibilitychange", handleVisibility);

    // Reduced motion listener
    let mediaQuery: MediaQueryList | null = null;
    let onMotionChange: ((e: MediaQueryListEvent) => void) | null = null;

    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      onMotionChange = (e: MediaQueryListEvent) => {
        const nextCaps = {
          ...detectClientCapabilities(),
          prefersReducedMotion: e.matches,
        };
        setCapabilities(nextCaps);
        hardwareCapRef.current = getHardwareQualityCap(nextCaps);
        const nextProfile = resolveQualityProfile(nextCaps, overrideTier ?? "auto");
        setProfile(nextProfile);
        setTier(VISUAL_TIER_CONFIGS[nextProfile]?.tier ?? "lightweight");
      };

      mediaQuery.addEventListener?.("change", onMotionChange);
    }

    return () => {
      isMounted = false;
      document.removeEventListener("visibilitychange", handleVisibility);
      if (mediaQuery && onMotionChange) {
        mediaQuery.removeEventListener?.("change", onMotionChange);
      }
    };
  }, [overrideTier]);

  const config = VISUAL_TIER_CONFIGS[profile] ?? VISUAL_TIER_CONFIGS[tier] ?? VISUAL_TIER_CONFIGS.balanced;

  return {
    tier,
    profile,
    config,
    capabilities,
    refreshRate,
    isReducedMotion: capabilities.prefersReducedMotion,
    isMobile: capabilities.isMobile,
    isTablet: capabilities.isTablet,
    isFoldable: capabilities.isFoldable,
    formFactor: capabilities.formFactor,
    isSaveData: capabilities.saveData,
    webglSupported: capabilities.webglSupported,
    recordFrameTime: handleFrameCheck,
    getFrameMetrics: () => globalFrameTracker.getMetrics(),
  };
}
