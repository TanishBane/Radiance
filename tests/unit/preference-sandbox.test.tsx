import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PreferenceSandbox } from "@/components/landing/preference-sandbox";
import { PersonalIntelligenceStory } from "@/components/landing/personal-intelligence-story";

describe("Personal Intelligence & Preference Sandbox (Sections 03 & 04)", () => {
  it("renders the Personal Intelligence story section with four core capability pillars", () => {
    const markup = renderToStaticMarkup(<PersonalIntelligenceStory />);
    expect(markup).toContain("An AI experience shaped around your context.");
    expect(markup).toContain("Saved Notes");
    expect(markup).toContain("Response Preferences");
    expect(markup).toContain("Relevant Context Retrieval");
    expect(markup).toContain("Provider-Sharing Control");
  });

  it("renders the interactive preference sandbox with concise, detailed, and structured options", () => {
    const markup = renderToStaticMarkup(<PreferenceSandbox />);
    expect(markup).toContain("An answer should feel right for you.");
    expect(markup).toContain("Concise");
    expect(markup).toContain("Detailed");
    expect(markup).toContain("Structured");
    expect(markup).toContain("Illustrative demonstration");
  });
});
