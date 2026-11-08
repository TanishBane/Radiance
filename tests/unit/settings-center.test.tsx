import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SettingsCenter } from "@/features/settings/settings-center";
import { DEFAULT_SETTINGS } from "@/features/settings/settings-service";

function renderSettings(overrides: Record<string, unknown> = {}) {
  const props = {
    open: true,
    onOpenChange: vi.fn(),
    section: "general",
    settings: DEFAULT_SETTINGS,
    onChange: vi.fn(() => true),
    onReset: vi.fn(() => true),
    onExportConversations: vi.fn(),
    onClearConversations: vi.fn(async () => true),
    conversationCount: 2,
    ...overrides,
  };
  render(<SettingsCenter {...props} />);
  return props;
}

describe("Settings Center", () => {
  beforeEach(() => window.localStorage.clear());

  it("opens the keyboard shortcut reference from internal section navigation", async () => {
    renderSettings();
    fireEvent.click(screen.getByRole("button", { name: "Appearance" }));
    expect(await screen.findByRole("heading", { name: "Appearance" })).toBeDefined();
    fireEvent.click(screen.getByRole("button", { name: "General" }));
    expect(await screen.findByRole("heading", { name: "Keyboard Shortcuts" })).toBeDefined();
    expect(await screen.findByText("Ctrl / ⌘ + K")).toBeDefined();
  });

  it("searches settings and navigates to the matching control", async () => {
    renderSettings();
    fireEvent.change(screen.getAllByRole("searchbox", { name: "Search settings" })[0], {
      target: { value: "response language" },
    });
    fireEvent.click(await screen.findByRole("button", { name: /Response language.*Personalization/i }));
    expect(await screen.findByLabelText("Response language")).toBeDefined();
  });

  it("requires confirmation before resetting preferences", async () => {
    const props = renderSettings();
    fireEvent.click(screen.getByRole("button", { name: "Data Controls" }));
    fireEvent.click(await screen.findByRole("button", { name: "Reset settings" }));
    expect(await screen.findByRole("alertdialog")).toBeDefined();
    expect(props.onReset).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Reset preferences" }));
    expect(props.onReset).toHaveBeenCalledTimes(1);
  });

  it("shows local session information without implying cloud sync", () => {
    renderSettings();
    expect(screen.getByText("Local session")).toBeDefined();
    expect(screen.queryByText(/synced to cloud/i)).toBeNull();
  });
});
