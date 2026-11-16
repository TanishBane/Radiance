import React from "react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import fs from "fs";
import path from "path";
import { render, screen, fireEvent, renderHook, act } from "@testing-library/react";

import { safeVibrate } from "@/lib/mobile/haptics";
import { shareContent } from "@/lib/mobile/share";
import {
  detectClientCapabilities,
  getVisualQualityTier,
  resolveVisualQualityTier,
  VISUAL_TIER_CONFIGS,
  type ClientCapabilities,
} from "@/lib/performance/adaptive-quality";
import { useVisualViewport } from "@/lib/mobile/use-visual-viewport";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { PWAInstallBanner } from "@/components/ui/pwa-install-banner";
import { FloatingMobileCTA } from "@/components/landing/floating-mobile-cta";
import { ChatComposer } from "@/components/chat/chat-composer";
import { MessageItem } from "@/components/chat/message-item";
import { viewport } from "@/app/layout";
import { safeLocalStorage } from "@/lib/utils/storage";
import type { ChatMessage } from "@/lib/types/chat";

describe("Radiance Mobile Systems & PWA Architecture Invariants", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("1. PWA Web App Manifest & Service Worker Invariants", () => {
    it("validates manifest.webmanifest and manifest.json conform to dark violet identity (#0d0915)", () => {
      const manifestPath = path.resolve(__dirname, "../../public/manifest.webmanifest");
      const manifestJsonPath = path.resolve(__dirname, "../../public/manifest.json");

      expect(fs.existsSync(manifestPath)).toBe(true);
      expect(fs.existsSync(manifestJsonPath)).toBe(true);

      const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf-8"));
      expect(manifest.id).toBe("/radiance-ai-app");
      expect(manifest.display).toBe("standalone");
      expect(manifest.background_color).toBe("#0d0915");
      expect(manifest.theme_color).toBe("#0d0915");
      expect(manifest.shortcuts.length).toBeGreaterThanOrEqual(2);
      expect(manifest.share_target).toBeDefined();

      const maskableIcon = manifest.icons.find((icon: { purpose?: string }) =>
        icon.purpose?.includes("maskable")
      );
      expect(maskableIcon).toBeDefined();
    });

    it("verifies public/sw.js enforces zero-leakage privacy and never caches /api/* routes", () => {
      const swPath = path.resolve(__dirname, "../../public/sw.js");
      expect(fs.existsSync(swPath)).toBe(true);
      const swCode = fs.readFileSync(swPath, "utf-8");

      expect(swCode).toContain("NON_CACHEABLE_PATTERNS");
      expect(swCode).toContain("/\\/api\\//i");
      expect(swCode).toContain("/\\/auth\\//i");
      expect(swCode).toContain("/supabase\\.co/i");
      expect(swCode).toContain("OFFLINE_DISCONNECTED");
      expect(swCode).toContain("skipWaiting");
      expect(swCode).toContain("clients.claim");
      expect(swCode).toContain("PURGE_USER_DATA");
    });
  });

  describe("2. Device-Aware Performance Profiles (High, Balanced, Power Efficient)", () => {
    it("exports power-efficient configuration matching lightweight constraints", () => {
      expect(VISUAL_TIER_CONFIGS["power-efficient"]).toBeDefined();
      expect(VISUAL_TIER_CONFIGS["power-efficient"].maxDpr).toBe(1.0);
      expect(VISUAL_TIER_CONFIGS["power-efficient"].enableBloom).toBe(false);
      expect(VISUAL_TIER_CONFIGS["power-efficient"].starCount).toBe(600);
    });

    it("assigns power-efficient tier when device battery is low (<= 20%) and discharging", () => {
      const lowBatteryMobile: Partial<ClientCapabilities> = {
        isMobile: true,
        hardwareConcurrency: 8,
        deviceMemory: 8,
        batteryLevel: 0.15,
        isDischarging: true,
        webglSupported: true,
        saveData: false,
        prefersReducedMotion: false,
      };

      expect(resolveVisualQualityTier(lowBatteryMobile)).toBe("power-efficient");
    });

    it("assigns power-efficient tier when device memory is constrained (<= 2GB)", () => {
      const lowMemMobile: Partial<ClientCapabilities> = {
        isMobile: true,
        hardwareConcurrency: 6,
        deviceMemory: 2,
        webglSupported: true,
        saveData: false,
        prefersReducedMotion: false,
      };

      expect(resolveVisualQualityTier(lowMemMobile)).toBe("power-efficient");
    });

    it("resolves High tier for capable flagship mobile/desktop hardware", () => {
      const flagshipDesktop: Partial<ClientCapabilities> = {
        isMobile: false,
        hardwareConcurrency: 8,
        webglSupported: true,
        saveData: false,
        prefersReducedMotion: false,
      };

      expect(resolveVisualQualityTier(flagshipDesktop)).toBe("high");
    });

    it("safely falls back to sensible tier when hardware APIs are missing (Safari/Firefox)", () => {
      const missingApisDevice: Partial<ClientCapabilities> = {
        isMobile: true,
        hardwareConcurrency: 6,
        deviceMemory: undefined,
        batteryLevel: undefined,
        isDischarging: undefined,
        effectiveType: undefined,
        webglSupported: true,
        saveData: false,
        prefersReducedMotion: false,
      };

      // Capable mobile with 6 cores falls back gracefully to balanced tier
      expect(resolveVisualQualityTier(missingApisDevice)).toBe("balanced");
    });

    it("detects mobile via touch capability and coarse pointer even without mobile UA string", () => {
      vi.stubGlobal("navigator", {
        userAgent: "CustomTabletBrowser/1.0",
        maxTouchPoints: 5,
        hardwareConcurrency: 4,
      });

      vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
        matches: query.includes("pointer: coarse"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      // Set window width to compact mobile/tablet width
      window.innerWidth = 600;

      const caps = detectClientCapabilities();
      expect(caps.isMobile).toBe(true);
    });
  });

  describe("3. Mobile Haptic Feedback & Reduced-Motion Safety", () => {
    it("triggers navigator.vibrate with standard vibration micro-pulses", () => {
      const vibrateMock = vi.fn().mockReturnValue(true);
      vi.stubGlobal("navigator", {
        vibrate: vibrateMock,
      });

      const res = safeVibrate("tap");
      expect(res).toBe(true);
      expect(vibrateMock).toHaveBeenCalledWith(8);

      safeVibrate("success");
      expect(vibrateMock).toHaveBeenCalledWith([10, 40, 12]);
    });

    it("bypasses vibration entirely when prefers-reduced-motion is active", () => {
      const vibrateMock = vi.fn().mockReturnValue(true);
      vi.stubGlobal("navigator", {
        vibrate: vibrateMock,
      });

      vi.spyOn(window, "matchMedia").mockImplementation((query) => ({
        matches: query.includes("prefers-reduced-motion: reduce"),
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      }));

      const res = safeVibrate("tap");
      expect(res).toBe(false);
      expect(vibrateMock).not.toHaveBeenCalled();
    });

    it("handles platforms without navigator.vibrate safely without error", () => {
      vi.stubGlobal("navigator", {});
      const res = safeVibrate("tap");
      expect(res).toBe(false);
    });
  });

  describe("4. Native Web Share API & Clipboard Fallback", () => {
    it("invokes navigator.share when available on mobile browser", async () => {
      const shareMock = vi.fn().mockResolvedValue(undefined);
      const canShareMock = vi.fn().mockReturnValue(true);

      vi.stubGlobal("navigator", {
        share: shareMock,
        canShare: canShareMock,
      });

      const result = await shareContent({
        title: "Test Note",
        text: "Sharing from Radiance",
        url: "https://radiance.ai/chat",
      });

      expect(result.shared).toBe(true);
      expect(result.method).toBe("native");
      expect(shareMock).toHaveBeenCalledWith({
        title: "Test Note",
        text: "Sharing from Radiance",
        url: "https://radiance.ai/chat",
      });
    });

    it("falls back to clipboard.writeText when navigator.share is unavailable", async () => {
      const writeTextMock = vi.fn().mockResolvedValue(undefined);

      vi.stubGlobal("navigator", {
        clipboard: {
          writeText: writeTextMock,
        },
      });

      const result = await shareContent({
        title: "Copied Title",
        text: "Copied message text",
      });

      expect(result.shared).toBe(true);
      expect(result.method).toBe("clipboard");
      expect(writeTextMock).toHaveBeenCalledWith("Copied Title\n\nCopied message text");
    });
  });

  describe("5. Mobile UI Components: OfflineIndicator & PWAInstallBanner", () => {
    it("renders OfflineIndicator when isOnline is false with truthful shell message", () => {
      vi.spyOn(safeLocalStorage, "listConversations").mockReturnValue([]);

      const { rerender } = render(<OfflineIndicator isOnline={true} />);
      expect(screen.queryByRole("status")).toBeNull();

      rerender(<OfflineIndicator isOnline={false} />);
      const alert = screen.getByRole("status");
      expect(alert).toBeDefined();
      expect(alert.textContent).toContain("Offline Mode");
      expect(alert.textContent).toContain("Application shell is available");
    });

    it("truthfully announces local chats availability when saved conversations exist", () => {
      vi.spyOn(safeLocalStorage, "listConversations").mockReturnValue([
        { id: "c1", title: "Local Chat", createdAt: 1, updatedAt: 2, pinned: false, messages: [] },
      ]);

      render(<OfflineIndicator isOnline={false} />);
      const alert = screen.getByRole("status");
      expect(alert.textContent).toContain("local chats available");
    });

    it("renders PWAInstallBanner with finger-friendly >=44x44px touch targets", () => {
      const handleInstall = vi.fn();
      const handleDismiss = vi.fn();

      render(
        <PWAInstallBanner
          canInstall={true}
          onInstall={handleInstall}
          onDismiss={handleDismiss}
        />
      );

      expect(screen.getByText("Install Radiance")).toBeDefined();
      const installBtn = screen.getByRole("button", { name: /install app/i });
      const notNowBtn = screen.getByRole("button", { name: /not now/i });

      expect(installBtn.className).toContain("min-h-[44px]");
      expect(installBtn.className).toContain("touch-target");
      expect(notNowBtn.className).toContain("min-h-[44px]");

      fireEvent.click(installBtn);
      expect(handleInstall).toHaveBeenCalledTimes(1);
    });

    it("renders FloatingMobileCTA with thumb-zone touch target ergonomics", () => {
      const observeMock = vi.fn();
      const disconnectMock = vi.fn();
      vi.stubGlobal(
        "IntersectionObserver",
        vi.fn().mockImplementation((callback) => {
          callback([{ isIntersecting: false }]);
          return {
            observe: observeMock,
            disconnect: disconnectMock,
          };
        })
      );

      const dummySec = document.createElement("section");
      dummySec.id = "hero";
      document.body.appendChild(dummySec);

      render(<FloatingMobileCTA />);

      const ctaLink = screen.getByRole("link", { name: /Chat with Radiance/i });
      expect(ctaLink).toBeDefined();
      expect(ctaLink.className).toContain("touch-target");
      expect(ctaLink.getAttribute("href")).toBe("/chat");

      document.body.removeChild(dummySec);
    });
  });

  describe("6. Mobile Chat Workspace Attachments & Message Sharing", () => {
    it("renders mobile camera capture input and attachment button in ChatComposer", () => {
      render(
        <ChatComposer
          onSend={vi.fn()}
          onStop={vi.fn()}
          isGenerating={false}
        />
      );

      const cameraInput = screen.getByLabelText("Take photo with camera");
      expect(cameraInput).toBeDefined();
      expect(cameraInput.getAttribute("capture")).toBe("environment");
      expect(cameraInput.getAttribute("accept")).toBe("image/*");

      const attachBtn = screen.getByRole("button", { name: "Add files" });
      expect(attachBtn).toBeDefined();
      expect(attachBtn.className).toContain("touch-target");
    });

    it("renders Share button in MessageItem for easy mobile distribution", async () => {
      const testMessage: ChatMessage = {
        id: "msg_share_1",
        role: "assistant",
        content: "Here is the key architectural insight for mobile.",
        createdAt: 1000,
      };

      render(
        <MessageItem
          message={testMessage}
          isStreaming={false}
        />
      );

      const shareBtn = screen.getByTestId("share-message-button");
      expect(shareBtn).toBeDefined();
      expect(shareBtn.getAttribute("aria-label")).toContain("Share message");
    });
  });

  describe("7. VisualViewport & Virtual Keyboard Resizing Invariants", () => {
    it("tracks keyboard appearance and sets --keyboard-height via VisualViewport API", () => {
      const listeners: Record<string, () => void> = {};
      const mockVisualViewport = {
        height: 500,
        offsetTop: 0,
        addEventListener: vi.fn((event: string, cb: () => void) => {
          listeners[event] = cb;
        }),
        removeEventListener: vi.fn(),
      };

      Object.defineProperty(window, "visualViewport", {
        value: mockVisualViewport,
        writable: true,
        configurable: true,
      });

      Object.defineProperty(window, "innerHeight", {
        value: 800,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useVisualViewport());

      // Initial state with 300px keyboard difference
      expect(result.current.keyboardHeight).toBe(300);
      expect(result.current.isKeyboardOpen).toBe(true);

      // Simulate keyboard collapse (viewport height expands to full innerHeight)
      mockVisualViewport.height = 800;
      act(() => {
        listeners["resize"]?.();
      });

      expect(result.current.keyboardHeight).toBe(0);
      expect(result.current.isKeyboardOpen).toBe(false);
    });

    it("preserves accessibility zoom by never setting user-scalable=no in layout viewport", () => {
      expect((viewport as Record<string, unknown>).userScalable).toBeUndefined();
      expect((viewport as Record<string, unknown>).maximumScale).toBeUndefined();
      expect(viewport.initialScale).toBe(1);
      expect(viewport.width).toBe("device-width");
    });
  });

  describe("8. Pull-to-Refresh & Overscroll Containment Invariants", () => {
    it("verifies chat scroll container has overscroll containment and touch pan-y in globals.css", () => {
      const css = fs.readFileSync(path.resolve(__dirname, "../../src/app/globals.css"), "utf-8");
      expect(css).toContain("overscroll-behavior-y: contain");
      expect(css).toContain("touch-action: pan-y");
    });
  });
});
