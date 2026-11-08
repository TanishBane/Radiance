import { IntelligenceField } from "./intelligence-field";
import { LandingCta } from "./landing-cta";

export function LandingHero() {
  return (
    <section className="landing-shell landing-hero" aria-labelledby="landing-hero-title">
      <div>
        <h1 id="landing-hero-title" className="landing-display">
          Intelligence that understands you
        </h1>
        <p className="landing-lede">
          Radiance brings the notes and response preferences you choose into later conversations,
          so the model you select can answer with more of your context instead of starting from a blank prompt every time.
        </p>
        <div className="landing-hero-actions">
          <LandingCta size="lg" />
          <LandingCta href="#intelligence" variant="ghost" size="lg">
            Discover Personal Intelligence
          </LandingCta>
        </div>
      </div>
      <IntelligenceField />
    </section>
  );
}
