import React from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { FollowUpChips } from "@/components/chat/follow-up-chips";

describe("FollowUpChips", () => {
  it("moves through follow-up suggestions with carousel controls and selects the active question", () => {
    const onSelect = vi.fn();
    render(
      <FollowUpChips
        questions={["First question", "Second question", "Third question"]}
        onSelect={onSelect}
      />
    );

    const carousel = screen.getByRole("region", { name: "Suggested follow-up questions" });
    expect(screen.getByText("Suggestion 1 of 3")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Next suggestion" }));
    expect(screen.getByText("Suggestion 2 of 3")).toBeDefined();

    fireEvent.click(screen.getByRole("button", { name: "Use suggestion: Second question" }));
    expect(onSelect).toHaveBeenCalledWith("Second question");

    fireEvent.keyDown(carousel, { key: "ArrowLeft" });
    expect(screen.getByText("Suggestion 1 of 3")).toBeDefined();
  });

  it("keeps a two-question carousel navigable", () => {
    render(<FollowUpChips questions={["One", "Two"]} onSelect={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Next suggestion" }));

    expect(screen.getByText("Suggestion 2 of 2")).toBeDefined();
    expect(screen.getByRole("button", { name: "Use suggestion: Two" }).getAttribute("aria-current")).toBe(
      "true"
    );
  });

  it("shows compact suggestions as one contained card without neighboring slides", () => {
    render(
      <FollowUpChips
        questions={["First question", "Second question"]}
        onSelect={vi.fn()}
        label="Left"
        compact
      />
    );

    expect(screen.getByText(/^next$/i)).toBeDefined();
    const activeSuggestion = screen.getByRole("button", { name: "Use suggestion: First question" });
    expect(activeSuggestion).toBeDefined();
    expect(activeSuggestion.style.background).toBe("");
    expect(screen.queryByRole("button", { name: "Use suggestion: Second question" })).toBeNull();
  });
});
