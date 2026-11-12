import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { ShinyButton } from "@/components/ui/shiny-button";
import DemoOne from "@/components/ui/demo";

describe("ShinyButton Component Specifications", () => {
  it("renders button element with shiny-cta class and children", () => {
    render(<ShinyButton>Click Me</ShinyButton>);
    const button = screen.getByRole("button", { name: /click me/i });
    expect(button).toBeTruthy();
    expect(button.className).toContain("shiny-cta");
  });

  it("handles onClick events when clicked", () => {
    const handleClick = vi.fn();
    render(<ShinyButton onClick={handleClick}>Interactive</ShinyButton>);
    const button = screen.getByRole("button", { name: /interactive/i });
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders as an accessible link when href is provided", () => {
    render(<ShinyButton href="/chat">Chat with Radiance</ShinyButton>);
    const link = screen.getByRole("link", { name: /chat with radiance/i });
    expect(link).toBeTruthy();
    expect(link.getAttribute("href")).toBe("/chat");
    expect(link.className).toContain("shiny-cta");
  });

  it("supports size variants and custom class names", () => {
    render(
      <ShinyButton size="lg" className="custom-test-class">
        Large Button
      </ShinyButton>
    );
    const button = screen.getByRole("button", { name: /large button/i });
    expect(button.className).toContain("shiny-cta-lg");
    expect(button.className).toContain("custom-test-class");
  });

  it("renders SSR static markup without errors", () => {
    const markup = renderToStaticMarkup(
      <ShinyButton href="/chat">Server Rendered</ShinyButton>
    );
    expect(markup).toContain("shiny-cta");
    expect(markup).toContain("Server Rendered");
  });

  it("renders DemoOne component correctly", () => {
    const markup = renderToStaticMarkup(<DemoOne />);
    expect(markup).toContain("Get unlimited access");
    expect(markup).toContain("shiny-cta");
  });
});
