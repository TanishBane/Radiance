import React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { SidebarDock } from "@/components/navigation/sidebar-dock";

describe("SidebarDock local status", () => {
  it("shows local storage status without a Radiance Session profile or R badge", () => {
    render(
      <SidebarDock
        open
        setOpen={vi.fn()}
        onNewChat={vi.fn()}
        onToggleHistory={vi.fn()}
        onToggleSettings={vi.fn()}
        conversations={[]}
        onSelectConversation={vi.fn()}
        isConversationHistoryLoaded
      />
    );

    expect(screen.queryByText("Radiance Session")).toBeNull();
    expect(screen.queryByText(/^R$/)).toBeNull();
    expect(screen.getAllByText("Local").length).toBeGreaterThan(0);
  });
});
