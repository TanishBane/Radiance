import { LandingCta } from "./landing-cta";

export function FinalCta() {
  return (
    <section id="start" className="landing-section landing-finale">
      <div className="landing-shell" style={{ position: "relative" }}>
        <h2 className="landing-section-title">Start a more personal conversation</h2>
        <p className="landing-copy">
          Bring your context. Shape your experience. Discover what a more personal AI can feel like.
        </p>
        <div className="landing-hero-actions">
          <LandingCta size="lg" className="landing-final-cta">
            Chat with Radiance
          </LandingCta>
        </div>
        <p className="landing-copy" style={{ color: "var(--txt-muted)" }}>
          Your next conversation starts here
        </p>
      </div>
    </section>
  );
}
