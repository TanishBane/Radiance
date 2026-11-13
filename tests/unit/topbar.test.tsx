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
    expect(screen.getByRole("combobox", { name: "Translate" })).toBeDefined();
    expect(screen.getByRole("option", { name: "English" })).toBeDefined();
    expect(screen.getByRole("option", { name: "Hindi" })).toBeDefined();
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

    fireEvent.change(screen.getByRole("combobox", { name: "Translate" }), {
      target: { value: "hi" },
    });
    expect(onToggleLanguage).toHaveBeenCalledWith("hi");
  });
});
