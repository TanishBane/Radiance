import React from "react";
import { IntelligenceField } from "./intelligence-field";
import { LandingCta } from "./landing-cta";

export function LandingHero() {
  return (
    <section
      className="landing-shell landing-hero landing-hero-showcase landing-hero-redesign"
      aria-labelledby="landing-hero-title"
    >
      <div className="landing-hero-copy">
        <p className="hero-eyebrow">
          <span aria-hidden="true" />Personal Intelligence, reimagined
        </p>
        <h1 id="landing-hero-title" className="landing-display">
          AI that understands the <em>context</em> behind your conversations.
        </h1>
        <p className="landing-lede">
          Bring your saved context and preferences into your AI experience. Radiance helps make relevant conversations more personal, useful and consistent.
        </p>
        <div className="landing-hero-actions">
          <LandingCta size="lg">Chat with Radiance <span aria-hidden="true">↗</span></LandingCta>
          <LandingCta href="#intelligence" variant="ghost" size="lg">
            Explore Personal Intelligence <span aria-hidden="true">↓</span>
          </LandingCta>
        </div>
        <p className="landing-hero-proof hero-trust-row" aria-label="Saved context preview">
          <span>Saved note · Keep citations inline</span>
          <span>More concise</span>
        </p>
      </div>
      <IntelligenceField />
    </section>
  );
}
