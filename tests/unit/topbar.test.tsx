import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Topbar } from "@/components/navigation/topbar";

describe("Topbar language selector", () => {
  it("removes the assistant/version badge and exposes language choices", () => {
    render(
      <Topbar
        language="en"
        onToggleLanguage={vi.fn()}
        onClearChat={vi.fn()}
        onNewChat={vi.fn()}
      />
    );

    expect(screen.queryByText("Default Assistant")).toBeNull();
    expect(screen.queryByText(/V1\.0\.0/i)).toBeNull();
    expect(screen.getByRole("button", { name: "Translate" })).toBeDefined();
  });

  it("updates the saved language choice when Hindi is selected", () => {
    const onToggleLanguage = vi.fn();
    render(
      <Topbar
        language="en"
        onToggleLanguage={onToggleLanguage}
        onClearChat={vi.fn()}
        onNewChat={vi.fn()}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Translate" }));
    expect(screen.getByRole("option", { name: "हिन्दी" })).toBeDefined();
    expect(screen.getByRole("option", { name: "日本語" })).toBeDefined();
    fireEvent.click(screen.getByRole("option", { name: "日本語" }));
    expect(onToggleLanguage).toHaveBeenCalledWith("ja");
  });

  it("opens conversation search from the search icon", () => {
    const onOpenSearch = vi.fn();
    render(
      <Topbar
        language="en"
        onToggleLanguage={vi.fn()}
        onClearChat={vi.fn()}
        onNewChat={vi.fn()}
        onOpenSearch={onOpenSearch}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: "Search chats" }));
    expect(onOpenSearch).toHaveBeenCalledOnce();
  });

  it("exposes a touch-sized sidebar toggle with its current state", () => {
    const onToggleSidebar = vi.fn();
    render(
      <Topbar
        language="en"
        onToggleLanguage={vi.fn()}
        onClearChat={vi.fn()}
        onNewChat={vi.fn()}
        onToggleSidebar={onToggleSidebar}
        sidebarOpen={false}
      />
    );

    const toggle = screen.getByRole("button", { name: "Toggle sidebar" });
    expect(toggle.getAttribute("aria-pressed")).toBe("false");
    expect(toggle.className).toContain("min-w-[44px]");
    expect(toggle.className).toContain("min-h-[44px]");
    fireEvent.click(toggle);
    expect(onToggleSidebar).toHaveBeenCalledOnce();
  });
});
