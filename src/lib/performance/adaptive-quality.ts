/**
 * Radiance Adaptive Visual Quality Engine
 *
 * Evaluates hardware capabilities, network conditions, user motion preferences,
 * and WebGL context availability to dynamically assign a visual performance tier:
 * - High: Desktop / high-end hardware with unthrottled WebGL (4,200 stars, 2.0 DPR cap, bloom)
 * - Balanced: Mid-range mobile / moderate hardware (1,800 stars, 1.5 DPR cap to prevent thermal throttling)
 * - Lightweight: Reduced motion / low power / Save-Data mode / low concurrency (600 stars, 1.0 DPR cap, calm drift, 0 barrel roll)
 */

"use client";

import { useEffect, useState } from "react";

export type VisualQualityTier = "high" | "balanced" | "lightweight";

export interface ClientCapabilities {
  prefersReducedMotion: boolean;
  hardwareConcurrency: number;
  devicePixelRatio: number;
  saveData: boolean;
  webglSupported: boolean;
  isMobile: boolean;
}

export interface VisualTierConfig {
  tier: VisualQualityTier;
  starCount: number;
  maxDpr: number;
  enableBloom: boolean;
  driftSpeed: number;
  barrelRoll: number;
  twinkle: number;
  repelStrength: number;
}

export const VISUAL_TIER_CONFIGS: Record<VisualQualityTier, VisualTierConfig> = {
  high: {
    tier: "high",
    starCount: 4200,
    maxDpr: 2.0,
    enableBloom: true,
    driftSpeed: 2.35,
    barrelRoll: 0.03,
    twinkle: 1.0,
    repelStrength: 0.35,
  },
  balanced: {
    tier: "balanced",
    starCount: 1800,
    maxDpr: 1.5,
    enableBloom: false,
    driftSpeed: 1.5,
    barrelRoll: 0.015,
    twinkle: 0.7,
    repelStrength: 0.2,
  },
  lightweight: {
    tier: "lightweight",
    starCount: 600,
    maxDpr: 1.0,
    enableBloom: false,
    driftSpeed: 0.2, // Near-static calm drift
    barrelRoll: 0.0, // 0 barrel roll when requested
    twinkle: 0.2,
    repelStrength: 0.0,
  },
};

/**
 * Safely inspects browser WebGL support via test canvas context.
 */
export function isWebGLSupported(): boolean {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return false;
  }
  // If WebGLRenderingContext is missing (e.g. jsdom or unsupported browser), bail out cleanly
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
 * Evaluates current client hardware, network constraints, and user preferences.
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
  const connection = (nav as unknown as { connection?: { saveData?: boolean } })?.connection;
  const saveData = Boolean(connection?.saveData);

  const webglSupported = isWebGLSupported();

  const userAgent = nav?.userAgent ?? "";
  const isMobileUserAgent = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isSmallScreen = typeof window.innerWidth === "number" && window.innerWidth <= 768;
  const isMobile = isMobileUserAgent || isSmallScreen;

  return {
    prefersReducedMotion,
    hardwareConcurrency,
    devicePixelRatio,
    saveData,
    webglSupported,
    isMobile,
  };
}

/**
 * Determines the visual quality tier based on evaluated client capabilities.
 */
export function getVisualQualityTier(
  capabilities?: Partial<ClientCapabilities>
): VisualQualityTier {
  const merged: ClientCapabilities = {
    ...detectClientCapabilities(),
    ...capabilities,
  };

  // Tier Rule 1: Reduced motion, active save-data, or missing WebGL drops to Lightweight
  if (merged.prefersReducedMotion || merged.saveData || !merged.webglSupported) {
    return "lightweight";
  }

  // Tier Rule 2: Low-concurrency hardware (<= 2 logical cores) drops to Lightweight
  if (merged.hardwareConcurrency <= 2) {
    return "lightweight";
  }

  // Tier Rule 3: Mobile devices
  if (merged.isMobile) {
    // Very constrained mobile CPU drops to Lightweight
    if (merged.hardwareConcurrency <= 4) {
      return "lightweight";
    }
    // Standard capable mobile runs on Balanced (clamped DPR, 1800 stars)
    return "balanced";
  }

  // Tier Rule 4: Desktop devices
  // Moderate desktop concurrency (3-4 cores) runs Balanced
  if (merged.hardwareConcurrency <= 4) {
    return "balanced";
  }

  // Capable desktop (>= 6 cores, unthrottled WebGL, no save-data, no reduced motion)
  return "high";
}

/**
 * Retrieves the configuration parameters for a specified visual quality tier.
 */
export function getVisualTierConfig(tier: VisualQualityTier): VisualTierConfig {
  return VISUAL_TIER_CONFIGS[tier];
}

/**
 * React hook that dynamically detects and subscribes to visual capability changes.
 */
export function useAdaptiveQuality(overrideTier?: VisualQualityTier) {
  const [capabilities, setCapabilities] = useState<ClientCapabilities>(() => ({
    prefersReducedMotion: false,
    hardwareConcurrency: 4,
    devicePixelRatio: 1,
    saveData: false,
    webglSupported: true,
    isMobile: false,
  }));

  const [tier, setTier] = useState<VisualQualityTier>(overrideTier ?? "high");

  useEffect(() => {
    const caps = detectClientCapabilities();
    setCapabilities(caps);
    const computedTier = overrideTier ?? getVisualQualityTier(caps);
    setTier(computedTier);

    if (typeof window !== "undefined" && typeof window.matchMedia === "function") {
      const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
      const onChange = (e: MediaQueryListEvent) => {
        const nextCaps = {
          ...detectClientCapabilities(),
          prefersReducedMotion: e.matches,
        };
        setCapabilities(nextCaps);
        setTier(overrideTier ?? getVisualQualityTier(nextCaps));
      };

      mediaQuery.addEventListener?.("change", onChange);
      return () => mediaQuery.removeEventListener?.("change", onChange);
    }
  }, [overrideTier]);

  const config = VISUAL_TIER_CONFIGS[tier];

  return {
    tier,
    config,
    capabilities,
    isReducedMotion: capabilities.prefersReducedMotion,
    isMobile: capabilities.isMobile,
    isSaveData: capabilities.saveData,
    webglSupported: capabilities.webglSupported,
  };
}
