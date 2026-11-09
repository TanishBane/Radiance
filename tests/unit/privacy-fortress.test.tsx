import React from "react";
import { describe, expect, it } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { PrivacyFortress } from "@/components/landing/privacy-fortress";
import { FutureVisionStory } from "@/components/landing/future-vision-story";

describe("Privacy Fortress & Future Vision (Sections 06 & 07)", () => {
  it("renders privacy section with accurate MVP disclosures", () => {
    const markup = renderToStaticMarkup(<PrivacyFortress />);
    expect(markup).toContain("Your context. Your choice.");
    expect(markup).toContain("Browser-Local Plaintext Storage");
    expect(markup).toContain("Opt-In Provider Sharing");
    expect(markup).toContain("One-Click Context Reset");
  });

  it("renders future vision section clearly distinguished from current functionality", () => {
    const markup = renderToStaticMarkup(<FutureVisionStory />);
    expect(markup).toContain("Personal intelligence, with room to evolve.");
    expect(markup).toContain("Future Architectural Horizon");
    expect(markup).toContain("Adaptive Memory");
    expect(markup).toContain("Cross-Model Context Translation");
  });
});
