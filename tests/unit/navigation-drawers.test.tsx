import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { HistoryDrawer } from "@/components/navigation/history-drawer";
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
});
