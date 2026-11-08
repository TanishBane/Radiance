import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { ProductIntroduction } from "@/components/landing/product-introduction";
import { PersonalIntelligenceSection } from "@/components/landing/personal-intelligence-section";
import { HowItWorks } from "@/components/landing/how-it-works";
import { FeatureShowcase } from "@/components/landing/feature-showcase";

describe("product storytelling", () => {
  it("explains explicit, user-controlled context without implying automatic memory", () => {
    const html = renderToStaticMarkup(<ProductIntroduction />);
    expect(html).toContain("Saved by you. Ready when it matters.");
    expect(html).toContain("Nothing is inferred in the background");
    expect(html).toContain("story-visual");
  });

  it("shows personal intelligence controls and their sharing boundary", () => {
    const html = renderToStaticMarkup(<PersonalIntelligenceSection />);
    expect(html).toContain("Notes you choose to keep");
    expect(html).toContain("Sharing starts off");
    expect(html).toContain("Settings");
  });

  it("presents the implemented workflow in order", () => {
    const html = renderToStaticMarkup(<HowItWorks />);
    expect(html.indexOf("Save a note")).toBeLessThan(html.indexOf("Choose your answer style"));
    expect(html.indexOf("Choose your answer style")).toBeLessThan(html.indexOf("Ask a question"));
    expect(html).toContain("lexical matching");
  });

  it("showcases current capabilities and the local-first sharing default", () => {
    const html = renderToStaticMarkup(<FeatureShowcase />);
    expect(html).toContain("up to five notes");
    expect(html).toContain("Your notes stay here");
    expect(html).toContain("aria-label=\"Example provider sharing setting\"");
  });
});
