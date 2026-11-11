import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  detectClientCapabilities,
  getVisualQualityTier,
  getVisualTierConfig,
  VISUAL_TIER_CONFIGS,
  type ClientCapabilities,
} from "@/lib/performance/adaptive-quality";

describe("Adaptive Visual Quality Engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("exports configurations with correct star counts for High, Balanced, and Lightweight", () => {
    expect(VISUAL_TIER_CONFIGS.high.starCount).toBe(4200);
    expect(VISUAL_TIER_CONFIGS.balanced.starCount).toBe(1800);
    expect(VISUAL_TIER_CONFIGS.lightweight.starCount).toBe(600);

    expect(VISUAL_TIER_CONFIGS.high.maxDpr).toBe(2.0);
    expect(VISUAL_TIER_CONFIGS.balanced.maxDpr).toBe(1.5);
    expect(VISUAL_TIER_CONFIGS.lightweight.barrelRoll).toBe(0.0);
    expect(VISUAL_TIER_CONFIGS.lightweight.driftSpeed).toBe(0.2);
  });

  it("retrieves the config for a given tier via getVisualTierConfig", () => {
    const highConfig = getVisualTierConfig("high");
    expect(highConfig.tier).toBe("high");
    expect(highConfig.starCount).toBe(4200);

    const balancedConfig = getVisualTierConfig("balanced");
    expect(balancedConfig.tier).toBe("balanced");
    expect(balancedConfig.starCount).toBe(1800);

    const lightweightConfig = getVisualTierConfig("lightweight");
    expect(lightweightConfig.tier).toBe("lightweight");
    expect(lightweightConfig.starCount).toBe(600);
  });

  it("assigns High tier to capable desktop with unthrottled WebGL and high concurrency", () => {
    const desktopCapabilities: Partial<ClientCapabilities> = {
      isMobile: false,
      hardwareConcurrency: 8,
      prefersReducedMotion: false,
      saveData: false,
      webglSupported: true,
      devicePixelRatio: 2,
    };

    expect(getVisualQualityTier(desktopCapabilities)).toBe("high");
  });

  it("assigns Balanced tier to mid-range mobile devices with concurrency > 4", () => {
    const mobileCapabilities: Partial<ClientCapabilities> = {
      isMobile: true,
      hardwareConcurrency: 6,
      prefersReducedMotion: false,
      saveData: false,
      webglSupported: true,
      devicePixelRatio: 2.5,
    };

    expect(getVisualQualityTier(mobileCapabilities)).toBe("balanced");
  });

  it("assigns Balanced tier to desktop with moderate concurrency (<= 4)", () => {
    const moderateDesktop: Partial<ClientCapabilities> = {
      isMobile: false,
      hardwareConcurrency: 4,
      prefersReducedMotion: false,
      saveData: false,
      webglSupported: true,
    };

    expect(getVisualQualityTier(moderateDesktop)).toBe("balanced");
  });

  it("assigns Lightweight tier immediately if prefersReducedMotion is true", () => {
    const reducedMotionDesktop: Partial<ClientCapabilities> = {
      isMobile: false,
      hardwareConcurrency: 16,
      prefersReducedMotion: true,
      saveData: false,
      webglSupported: true,
    };

    expect(getVisualQualityTier(reducedMotionDesktop)).toBe("lightweight");
  });

  it("assigns Lightweight tier when client has Save-Data enabled", () => {
    const saveDataDesktop: Partial<ClientCapabilities> = {
      isMobile: false,
      hardwareConcurrency: 12,
      prefersReducedMotion: false,
      saveData: true,
      webglSupported: true,
    };

    expect(getVisualQualityTier(saveDataDesktop)).toBe("lightweight");
  });

  it("assigns Lightweight tier when WebGL is unsupported", () => {
    const noWebGl: Partial<ClientCapabilities> = {
      isMobile: false,
      hardwareConcurrency: 8,
      prefersReducedMotion: false,
      saveData: false,
      webglSupported: false,
    };

    expect(getVisualQualityTier(noWebGl)).toBe("lightweight");
  });

  it("assigns Lightweight tier to constrained hardware with low concurrency (<= 2)", () => {
    const lowPowerDevice: Partial<ClientCapabilities> = {
      isMobile: false,
      hardwareConcurrency: 2,
      prefersReducedMotion: false,
      saveData: false,
      webglSupported: true,
    };

    expect(getVisualQualityTier(lowPowerDevice)).toBe("lightweight");
  });

  it("assigns Lightweight tier to constrained mobile devices (concurrency <= 4)", () => {
    const constrainedMobile: Partial<ClientCapabilities> = {
      isMobile: true,
      hardwareConcurrency: 4,
      prefersReducedMotion: false,
      saveData: false,
      webglSupported: true,
    };

    expect(getVisualQualityTier(constrainedMobile)).toBe("lightweight");
  });

  it("detectClientCapabilities returns safe fallback in non-browser environments", () => {
    const caps = detectClientCapabilities();
    expect(caps).toHaveProperty("prefersReducedMotion");
    expect(caps).toHaveProperty("hardwareConcurrency");
    expect(caps).toHaveProperty("devicePixelRatio");
    expect(caps).toHaveProperty("saveData");
    expect(caps).toHaveProperty("webglSupported");
    expect(caps).toHaveProperty("isMobile");
  });
});
