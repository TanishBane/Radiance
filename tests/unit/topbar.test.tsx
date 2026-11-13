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
});
