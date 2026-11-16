import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import fs from "fs";
import path from "path";

import { Topbar } from "@/components/navigation/topbar";
import { HistoryDrawer } from "@/components/navigation/history-drawer";
import { ChatComposer } from "@/components/chat/chat-composer";
import { OfflineIndicator } from "@/components/ui/offline-indicator";
import { PWAInstallBanner } from "@/components/ui/pwa-install-banner";
import { AVAILABLE_MODELS } from "@/lib/ai/models";
import type { Conversation } from "@/lib/types/chat";

describe("Mobile UI/UX Reconstruction & Layout Collision Elimination", () => {
  const mockConversations: Conversation[] = [
    {
      id: "conv-1",
      title: "Mobile Architecture Optimization",
      pinned: true,
      createdAt: Date.now() - 3600000,
      updatedAt: Date.now() - 1800000,
      messages: [{ id: "m-1", role: "user", content: "Audit mobile UI", createdAt: Date.now() - 3600000 }],
    },
    {
      id: "conv-2",
      title: "Design System Guidelines",
      pinned: false,
      createdAt: Date.now() - 7200000,
      updatedAt: Date.now() - 3600000,
      messages: [{ id: "m-2", role: "user", content: "Review design tokens", createdAt: Date.now() - 7200000 }],
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("1. Centralized Z-Index Scale & Safe Area Tokens", () => {
    it("verifies globals.css defines the authoritative hierarchical z-index scale", () => {
      const globalsCssPath = path.resolve(__dirname, "../../src/app/globals.css");
      expect(fs.existsSync(globalsCssPath)).toBe(true);
      const css = fs.readFileSync(globalsCssPath, "utf-8");

      expect(css).toContain("--z-canvas: 0;");
      expect(css).toContain("--z-dock: 20;");
      expect(css).toContain("--z-composer: 25;");
      expect(css).toContain("--z-popover: 30;");
      expect(css).toContain("--z-floating-banner: 40;");
      expect(css).toContain("--z-drawer-backdrop: 50;");
      expect(css).toContain("--z-drawer: 55;");
      expect(css).toContain("--z-modal-backdrop: 60;");
      expect(css).toContain("--z-modal: 65;");
      expect(css).toContain("--z-toast: 80;");
      expect(css).toContain("--mobile-topbar-h: 52px;");
      expect(css).toContain("--mobile-bottom-nav-h: 58px;");
    });

    it("verifies landing page footer reserves clear scroll padding on mobile to prevent CTA overlap", () => {
      const landingCssPath = path.resolve(__dirname, "../../src/components/landing/landing.css");
      const landingCss = fs.readFileSync(landingCssPath, "utf-8");
      expect(landingCss).toContain(".landing-footer { padding-bottom: calc(96px + var(--sab)); }");
    });
  });

  describe("2. Unified Mobile Navigation & History Drawer", () => {
    it("renders prominent Start New Chat hero button inside the drawer", () => {
      const onNewChat = vi.fn();
      const onClose = vi.fn();

      render(
        <HistoryDrawer
          language="en"
          isOpen={true}
          onClose={onClose}
          conversations={mockConversations}
          onSelectConversation={vi.fn()}
          onTogglePin={vi.fn()}
          onDeleteConversation={vi.fn()}
          onDeleteAll={vi.fn()}
          onNewChat={onNewChat}
        />
      );

      const newChatBtn = screen.getByRole("button", { name: "Start New Chat" });
      expect(newChatBtn).toBeDefined();
      expect(newChatBtn.className).toContain("touch-target");
      expect(newChatBtn.className).toContain("min-h-[44px]");

      fireEvent.click(newChatBtn);
      expect(onNewChat).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });

    it("renders quick navigation footer with Settings and Personal Intelligence links", () => {
      const onOpenSettings = vi.fn();
      const onClose = vi.fn();

      render(
        <HistoryDrawer
          language="en"
          isOpen={true}
          onClose={onClose}
          conversations={mockConversations}
          onSelectConversation={vi.fn()}
          onTogglePin={vi.fn()}
          onDeleteConversation={vi.fn()}
          onDeleteAll={vi.fn()}
          onOpenSettings={onOpenSettings}
        />
      );

      const settingsBtn = screen.getByRole("button", { name: "Settings" });
      const contextBtn = screen.getByRole("button", { name: "Personal Intelligence" });

      expect(settingsBtn).toBeDefined();
      expect(contextBtn).toBeDefined();
      expect(settingsBtn.className).toContain("touch-target");
      expect(contextBtn.className).toContain("touch-target");

      fireEvent.click(settingsBtn);
      expect(onOpenSettings).toHaveBeenCalledWith("general");
      expect(onClose).toHaveBeenCalledTimes(1);

      fireEvent.click(contextBtn);
      expect(onOpenSettings).toHaveBeenCalledWith("personal-intelligence");
    });
  });

  describe("3. Chat Composer Mobile Action Sheets & Ergonomics", () => {
    it("renders controls bar with flex-nowrap to prevent multi-line button wrapping on 320px viewports", () => {
      const { container } = render(
        <ChatComposer
          onSend={vi.fn()}
          onStop={vi.fn()}
          isGenerating={false}
        />
      );

      const controlsCluster = container.querySelector(".flex-nowrap");
      expect(controlsCluster).toBeDefined();
      expect(controlsCluster?.className).toContain("overflow-visible");
    });

    it("renders model selector trigger with touch-friendly dimensions and text truncation", () => {
      render(
        <ChatComposer
          onSend={vi.fn()}
          onStop={vi.fn()}
          isGenerating={false}
        />
      );

      const trigger = screen.getByTestId("composer-model-trigger");
      expect(trigger.className).toContain("touch-target");
      expect(trigger.className).toContain("h-8");

      const label = trigger.querySelector(".truncate");
      expect(label).toBeDefined();
      expect(label?.className).toContain("max-w-[70px]");
    });

    it("opens model selector as a responsive mobile sheet anchored to bottom on mobile", () => {
      render(
        <ChatComposer
          onSend={vi.fn()}
          onStop={vi.fn()}
          isGenerating={false}
        />
      );

      fireEvent.click(screen.getByTestId("composer-model-trigger"));

      const listbox = screen.getByRole("listbox");
      expect(listbox).toBeDefined();
      // On mobile viewports: fixed to bottom with rounded top corners
      expect(listbox.className).toContain("fixed");
      expect(listbox.className).toContain("bottom-0");
      expect(listbox.className).toContain("rounded-t-[24px]");
      // On desktop viewports (md:): floating popover
      expect(listbox.className).toContain("md:bottom-full");
      expect(listbox.className).toContain("md:rounded-2xl");
    });

    it("renders add files menu with take photo, upload, and voice options with >=48px touch targets", () => {
      render(
        <ChatComposer
          onSend={vi.fn()}
          onStop={vi.fn()}
          isGenerating={false}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: "Add files" }));

      const photoBtn = screen.getByRole("button", { name: "Take Photo" });
      const uploadBtn = screen.getByRole("button", { name: "Upload Files" });
      const voiceBtn = screen.getByRole("button", { name: "Voice Input" });

      expect(photoBtn.className).toContain("min-h-[48px]");
      expect(uploadBtn.className).toContain("min-h-[48px]");
      expect(voiceBtn.className).toContain("min-h-[48px]");
    });
  });

  describe("4. Floating Banner Collision Avoidance & Keyboard Guard", () => {
    it("elevates OfflineIndicator above PWAInstallBanner when an install prompt is active", () => {
      const { rerender } = render(<OfflineIndicator isOnline={false} hasActiveBanner={false} />);
      let indicator = screen.getByRole("status");
      expect(indicator.className).toContain("md:bottom-6");

      rerender(<OfflineIndicator isOnline={false} hasActiveBanner={true} />);
      indicator = screen.getByRole("status");
      expect(indicator.className).toContain("md:bottom-28");
    });

    it("conceals OfflineIndicator and PWAInstallBanner when keyboard is active / composer is focused", () => {
      const { rerender } = render(
        <OfflineIndicator isOnline={false} isComposerFocused={false} />
      );
      expect(screen.getByRole("status")).toBeDefined();

      rerender(<OfflineIndicator isOnline={false} isComposerFocused={true} />);
      expect(screen.queryByRole("status")).toBeNull();

      const { rerender: rerenderPwa } = render(
        <PWAInstallBanner canInstall={true} onInstall={vi.fn()} onDismiss={vi.fn()} isComposerFocused={false} />
      );
      expect(screen.getByRole("complementary", { name: "Install Radiance Application" })).toBeDefined();

      rerenderPwa(
        <PWAInstallBanner canInstall={true} onInstall={vi.fn()} onDismiss={vi.fn()} isComposerFocused={true} />
      );
      expect(screen.queryByText("Install Radiance")).toBeNull();
    });
  });

  describe("5. Topbar Responsive Header Alignment", () => {
    it("renders streamlined header with touch targets and safe area padding", () => {
      render(
        <Topbar
          language="en"
          onToggleLanguage={vi.fn()}
          onClearChat={vi.fn()}
          onNewChat={vi.fn()}
          onToggleSidebar={vi.fn()}
          onOpenSearch={vi.fn()}
        />
      );

      const header = screen.getByRole("banner");
      expect(header.className).toContain("sticky");
      expect(header.className).toContain("top-0");
      expect(header.className).toContain("pt-[max(0.625rem,env(safe-area-inset-top,0px))]");
    });
  });
});
