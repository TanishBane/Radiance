import { describe, expect, it, vi, beforeEach, afterEach } from "vitest";
import {
  detectClientCapabilities,
  getVisualQualityTier,
  getVisualTierConfig,
  resolveVisualQualityTier,
  resolveQualityProfile,
  detectDisplayRefreshRate,
  getEstimatedRefreshRate,
  recordFrameLatency,
  globalFrameTracker,
  getHardwareQualityCap,
  VISUAL_TIER_CONFIGS,
  type ClientCapabilities,
} from "@/lib/performance/adaptive-quality";

describe("Adaptive Visual Quality Engine", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    globalFrameTracker.reset();
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
    expect(caps).toHaveProperty("isTablet");
    expect(caps).toHaveProperty("isFoldable");
    expect(caps).toHaveProperty("formFactor");
  });

  describe("5 Explicit Quality Profiles & Display Awareness", () => {
    it("defines the 5 standardized quality profiles: Ultra, Smooth, Balanced, Power Saver, and Auto", () => {
      const ultra = getVisualTierConfig("ultra");
      expect(ultra.starCount).toBe(4200);
      expect(ultra.maxDpr).toBe(2.0);
      expect(ultra.enableBloom).toBe(true);
      expect(ultra.targetFps).toBe(120);
      expect(ultra.frameBudgetMs).toBe(8.33);

      const smooth = getVisualTierConfig("smooth");
      expect(smooth.starCount).toBe(2400);
      expect(smooth.maxDpr).toBe(2.0); // Upgraded to 2.0 for Retina/OLED mobile flagships
      expect(smooth.enableBloom).toBe(false);
      expect(smooth.targetFps).toBe(120);
      expect(smooth.frameBudgetMs).toBe(8.33);

      const balanced = getVisualTierConfig("balanced");
      expect(balanced.starCount).toBe(1800);
      expect(balanced.maxDpr).toBe(1.5);
      expect(balanced.enableBloom).toBe(false);
      expect(balanced.targetFps).toBe(60);
      expect(balanced.frameBudgetMs).toBe(16.67);

      const powerSaver = getVisualTierConfig("power-saver");
      expect(powerSaver.starCount).toBe(600);
      expect(powerSaver.maxDpr).toBe(1.0);
      expect(powerSaver.enableBloom).toBe(false);
      expect(powerSaver.targetFps).toBe(30);
      expect(powerSaver.frameBudgetMs).toBe(33.33);
    });

    it("resolves Smooth profile for mobile devices when high refresh rate (90/120Hz) is empirically confirmed", () => {
      const flagshipMobile: Partial<ClientCapabilities> = {
        isMobile: true,
        hardwareConcurrency: 8,
        detectedHz: 120,
        prefersReducedMotion: false,
        saveData: false,
        webglSupported: true,
      };

      expect(resolveQualityProfile(flagshipMobile)).toBe("smooth");
    });

    it("resolves Balanced profile conservatively for mobile devices at 60Hz without high refresh rate", () => {
      const standardMobile: Partial<ClientCapabilities> = {
        isMobile: true,
        hardwareConcurrency: 6,
        detectedHz: 60,
        prefersReducedMotion: false,
        saveData: false,
        webglSupported: true,
      };

      expect(resolveQualityProfile(standardMobile)).toBe("balanced");
    });

    it("resolves Ultra profile for high-concurrency desktop devices (Desktop preservation invariant)", () => {
      const desktopCaps: Partial<ClientCapabilities> = {
        isMobile: false,
        hardwareConcurrency: 12,
        detectedHz: 60,
        prefersReducedMotion: false,
        saveData: false,
        webglSupported: true,
      };

      expect(resolveQualityProfile(desktopCaps)).toBe("ultra");
    });

    it("resolves Smooth for high-refresh Tablet devices (10% allocation)", () => {
      const iPadProTablet: Partial<ClientCapabilities> = {
        isMobile: false,
        isTablet: true,
        hardwareConcurrency: 8,
        detectedHz: 120,
        prefersReducedMotion: false,
        saveData: false,
        webglSupported: true,
      };

      expect(resolveQualityProfile(iPadProTablet)).toBe("smooth");
    });

    it("resolves Power Saver profile when battery is low and discharging", () => {
      const lowBattery: Partial<ClientCapabilities> = {
        isMobile: true,
        hardwareConcurrency: 8,
        batteryLevel: 0.15,
        isDischarging: true,
        webglSupported: true,
      };

      expect(resolveQualityProfile(lowBattery)).toBe("power-saver");
    });

    it("resolves Power Saver profile when reduced motion is preferred", () => {
      const reducedMotion: Partial<ClientCapabilities> = {
        isMobile: false,
        hardwareConcurrency: 16,
        prefersReducedMotion: true,
        webglSupported: true,
      };

      expect(resolveQualityProfile(reducedMotion)).toBe("power-saver");
    });

    it("determines correct hardware quality caps across form factors", () => {
      expect(getHardwareQualityCap({ isMobile: true, hardwareConcurrency: 8 })).toBe("smooth");
      expect(getHardwareQualityCap({ isTablet: true, hardwareConcurrency: 8 })).toBe("smooth");
      expect(getHardwareQualityCap({ isMobile: false, hardwareConcurrency: 12 })).toBe("ultra");
      expect(getHardwareQualityCap({ prefersReducedMotion: true })).toBe("power-saver");
    });

    it("returns estimated refresh rate fallback safely in non-browser environments", () => {
      const rate = getEstimatedRefreshRate();
      expect(rate).toHaveProperty("hz");
      expect(rate).toHaveProperty("targetDtMs");
      expect(rate).toHaveProperty("isHighRefreshRate");
      expect(rate.hz).toBeGreaterThanOrEqual(30);
    });

    it("records frame latency and computes p50, p90, and p99 percentiles distribution", () => {
      for (let i = 1; i <= 100; i++) {
        recordFrameLatency(i * 0.3, 16.67);
      }

      const metrics = globalFrameTracker.getMetrics();
      expect(metrics.totalFrames).toBeGreaterThan(0);
      expect(metrics.averageDtMs).toBeGreaterThan(0);
      expect(metrics.p50DtMs).toBeGreaterThan(0);
      expect(metrics.p90DtMs).toBeGreaterThanOrEqual(metrics.p50DtMs);
      expect(metrics.p99DtMs).toBeGreaterThanOrEqual(metrics.p90DtMs);
      expect(metrics.currentFps).toBeGreaterThan(0);
    });

    it("triggers degradation when sustained jank (>= 10 frames > 1.8x budget) occurs", () => {
      let triggeredDegrade = false;
      // Deliver 10 consecutive frames exceeding 1.8x of 16.67ms (35.0ms > 30.0ms)
      for (let i = 0; i < 12; i++) {
        const action = recordFrameLatency(35.0, 16.67, "balanced", "ultra");
        if (action === "degrade") {
          triggeredDegrade = true;
        }
      }
      expect(triggeredDegrade).toBe(true);
    });
  });
});
