import { LandingReveal } from "./landing-reveal";

export function FutureVision() {
  return (
    <section id="vision" className="landing-section">
      <div className="landing-shell landing-split">
        <LandingReveal>
          <h2 className="landing-section-title">An intelligence experience that grows with you</h2>
        </LandingReveal>
        <LandingReveal>
          <p className="landing-copy" style={{ marginTop: 0 }}>
            The longer-term direction is an AI that understands how you communicate, learn, think, and work —
            with richer memory, more adaptive preferences, and subject-specific knowledge.
          </p>
          <p className="landing-copy">
            That is not the product shipping today. Semantic retrieval, automatic memory extraction,
            cross-device sync, and encryption are future work, not present claims.
          </p>
          <p className="landing-copy">
            What exists now is the honest foundation: you write the context, you set the preferences,
            you control whether that material is shared with a model.
          </p>
        </LandingReveal>
      </div>
    </section>
  );
}
