import { describe, it, expect } from "vitest";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import NotFound from "@/app/not-found";
import { AsciiArt } from "@/components/ui/ascii-art";

describe("ASCII Art Integration & 404 Experience Specifications", () => {
  it("renders AsciiArt placeholder during SSR to prevent hydration mismatches", () => {
    const markup = renderToStaticMarkup(<AsciiArt piece="starry-ridge" size={5} />);
    expect(markup).toContain("ascii-art-placeholder");
    expect(markup).toContain("aria-hidden=\"true\"");
  });

  it("renders 404 NotFound page with real heading, descriptive copy, and ASCII art piece", () => {
    const markup = renderToStaticMarkup(<NotFound />);
    // Rule: Real text, not the art, carries the page's heading
    expect(markup).toContain("Cosmic Horizon Not Found");
    expect(markup).toContain("404 · Signal Lost in Space");
    expect(markup).toContain("The celestial coordinate or document you requested has drifted past the observable mountain ridge.");
    // Rule: The art is decoration, sized properly
    expect(markup).toContain("ASCII Magic · Starry Ridge");
    // Rule: Navigation links
    expect(markup).toContain("href=\"/\"");
    expect(markup).toContain("Return to Overview");
    expect(markup).toContain("href=\"/chat\"");
    expect(markup).toContain("Open Chat Workspace");
  });
});
