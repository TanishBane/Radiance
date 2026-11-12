import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProblemComparisonSection } from "@/components/landing/problem-comparison-section";

describe("Problem Comparison Section (Section 02)", () => {
  it("renders the section with heading and comparison panels", () => {
    const markup = renderToStaticMarkup(<ProblemComparisonSection />);
    expect(markup).toContain("Your context shouldn&#x27;t disappear between conversations.");
    expect(markup).toContain("Without Saved Context");
    expect(markup).toContain("With Radiance Personal Intelligence");
  });

  it("accurately demonstrates repeated manual prompts versus automatic context assembly", () => {
    const markup = renderToStaticMarkup(<ProblemComparisonSection />);
    expect(markup).toContain("Starts from zero every session");
    expect(markup).toContain("Context shared only when you choose");
    expect(markup).toContain("Saved notes and preferences active");
  });
});
