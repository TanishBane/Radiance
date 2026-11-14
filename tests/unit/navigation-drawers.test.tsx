import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HistoryDrawer } from "@/components/navigation/history-drawer";
import { SidebarProvider, MobileSidebar } from "@/components/ui/sidebar";
import { Conversation } from "@/lib/types/chat";

describe("Navigation Drawers Unit Specifications (Accessibility & Dialog Semantics)", () => {
  describe("HistoryDrawer Component", () => {
    const mockConversations: Conversation[] = [
      {
        id: "conv_1",
        title: "Quantum Computing Analysis",
        pinned: true,
        createdAt: 1000,
        updatedAt: 2000,
        messages: [{ id: "m1", role: "user", content: "Query 1", createdAt: 1000 }],
      },
      {
        id: "conv_2",
        title: "React Server Components",
        pinned: false,
        createdAt: 3000,
        updatedAt: 4000,
        messages: [{ id: "m2", role: "user", content: "Query 2", createdAt: 3000 }],
      },
    ];

    it("renders nothing when isOpen is false", () => {
      render(
        <HistoryDrawer
          isOpen={false}
          onClose={vi.fn()}
          conversations={mockConversations}
          activeConversationId="conv_1"
          onSelectConversation={vi.fn()}
          onTogglePin={vi.fn()}
          onDeleteConversation={vi.fn()}
          onDeleteAll={vi.fn()}
        />
      );

      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("renders dialog with conversation list and pinned section when open", () => {
      render(
        <HistoryDrawer
          isOpen={true}
          onClose={vi.fn()}
          conversations={mockConversations}
          activeConversationId="conv_1"
          onSelectConversation={vi.fn()}
          onTogglePin={vi.fn()}
          onDeleteConversation={vi.fn()}
          onDeleteAll={vi.fn()}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeDefined();
      expect(screen.getByText("Conversations")).toBeDefined();
      expect(screen.getByText("Pinned")).toBeDefined();
      expect(screen.getByText("Quantum Computing Analysis")).toBeDefined();
      expect(screen.getByText("React Server Components")).toBeDefined();
    });

    it("focuses the conversation search field when the drawer opens", () => {
      render(
        <HistoryDrawer
          isOpen={true}
          onClose={vi.fn()}
          conversations={mockConversations}
          activeConversationId="conv_1"
          onSelectConversation={vi.fn()}
          onTogglePin={vi.fn()}
          onDeleteConversation={vi.fn()}
          onDeleteAll={vi.fn()}
        />
      );

      expect(document.activeElement).toBe(screen.getByRole("searchbox", { name: "Search chat history..." }));
    });

    it("invokes onSelectConversation when clicking an item", () => {
      const onSelect = vi.fn();
      render(
        <HistoryDrawer
          isOpen={true}
          onClose={vi.fn()}
          conversations={mockConversations}
          activeConversationId="conv_1"
          onSelectConversation={onSelect}
          onTogglePin={vi.fn()}
          onDeleteConversation={vi.fn()}
          onDeleteAll={vi.fn()}
        />
      );

      const item = screen.getByText("React Server Components");
      fireEvent.click(item);
      expect(onSelect).toHaveBeenCalledWith("conv_2");
    });
  });

  describe("MobileSidebar Component (Focus Trap, Escape Dismissal, Scroll Lock & Dialog Semantics)", () => {
    it("renders nothing when open is false", () => {
      render(
        <SidebarProvider open={false}>
          <MobileSidebar>
            <nav>Links</nav>
          </MobileSidebar>
        </SidebarProvider>
      );
      expect(screen.queryByRole("dialog")).toBeNull();
    });

    it("renders dialog with role='dialog' and aria-modal='true' when open", () => {
      render(
        <SidebarProvider open={true}>
          <MobileSidebar>
            <nav>Links</nav>
          </MobileSidebar>
        </SidebarProvider>
      );
      const dialog = screen.getByRole("dialog");
      expect(dialog).toBeDefined();
      expect(dialog.getAttribute("aria-modal")).toBe("true");
      expect(dialog.getAttribute("aria-label")).toBe("Mobile navigation drawer");
      expect(dialog.className).toContain("safe-h-screen");
      expect(dialog.className).toContain("h-[100dvh]");
    });

    it("locks document.body overflow when open and restores it when unmounted", () => {
      document.body.style.overflow = "auto";
      const { unmount } = render(
        <SidebarProvider open={true}>
          <MobileSidebar>
            <nav>Links</nav>
          </MobileSidebar>
        </SidebarProvider>
      );
      expect(document.body.style.overflow).toBe("hidden");
      unmount();
      expect(document.body.style.overflow).toBe("auto");
    });

    it("dismisses drawer upon pressing Escape key", () => {
      const setOpen = vi.fn();
      render(
        <SidebarProvider open={true} setOpen={setOpen}>
          <MobileSidebar>
            <nav>Links</nav>
          </MobileSidebar>
        </SidebarProvider>
      );
      fireEvent.keyDown(window, { key: "Escape" });
      expect(setOpen).toHaveBeenCalledWith(false);
    });

    it("renders close button with touch-target ergonomics >=44x44px and dismisses on click", () => {
      const setOpen = vi.fn();
      render(
        <SidebarProvider open={true} setOpen={setOpen}>
          <MobileSidebar>
            <nav>Links</nav>
          </MobileSidebar>
        </SidebarProvider>
      );
      const closeBtn = screen.getByRole("button", { name: /close drawer/i });
      expect(closeBtn).toBeDefined();
      expect(closeBtn.className).toContain("touch-target");
      expect(closeBtn.className).toContain("min-w-[44px]");
      expect(closeBtn.className).toContain("min-h-[44px]");
      fireEvent.click(closeBtn);
      expect(setOpen).toHaveBeenCalledWith(false);
    });
  });
});
