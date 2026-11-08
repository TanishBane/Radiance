import React from "react";
import { IntelligenceField } from "./intelligence-field";
import { LandingCta } from "./landing-cta";

export function LandingHero() {
  return (
    <section className="landing-shell landing-hero landing-hero-showcase" aria-labelledby="landing-hero-title">
      <div className="landing-hero-copy">
        <h1 id="landing-hero-title" className="landing-display">
          A little context changes the next answer
        </h1>
        <p className="landing-lede">
          Save the notes and response preferences you choose. Radiance can bring relevant ones into
          a later conversation when you enable sharing.
        </p>
        <div className="landing-hero-actions">
          <LandingCta size="lg" />
          <LandingCta href="#product" variant="ghost" size="lg">
            See how it works
          </LandingCta>
        </div>
        <p className="landing-hero-proof">
          <span>Saved note · Keep citations inline</span>
          <span>More concise</span>
        </p>
      </div>
      <IntelligenceField />
    </section>
  );
}
