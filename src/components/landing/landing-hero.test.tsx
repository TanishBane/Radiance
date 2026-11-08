import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { LandingHero } from "./landing-hero";
import { IntelligenceField } from "./intelligence-field";

describe("landing hero product showcase", () => {
  it("presents the demo as illustrative and keeps context sharing conditional", () => {
    const markup = renderToStaticMarkup(<LandingHero />);
    expect(markup).toContain("A little context changes the next answer");
    expect(markup).toContain("Illustrative conversation");
    expect(markup).toContain("only when you turn sharing on");
    expect(markup).toContain("aria-label=\"An illustrative Radiance conversation\"");
  });

  it("shows saved notes and response preferences as separate context", () => {
    const markup = renderToStaticMarkup(<IntelligenceField />);
    expect(markup).toContain("Saved note");
    expect(markup).toContain("Response preference");
    expect(markup).toContain("Thesis: keep citations inline");
    expect(markup).toContain("More concise");
  });
});
