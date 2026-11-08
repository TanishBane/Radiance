import React from "react";
import { LandingCta } from "./landing-cta";

export function FinalCta() {
  return (
    <section id="start" className="landing-section landing-finale landing-conversion">
      <div className="landing-shell landing-conversion-inner">
        <span className="landing-eyebrow">A better conversation starts with context</span>
        <h2 className="landing-section-title">Make room for a more personal kind of AI.</h2>
        <p className="landing-copy">
          Save what matters. Set the terms. Bring the context when you choose.
        </p>
        <div className="landing-hero-actions landing-conversion-actions">
          <LandingCta size="lg" className="landing-final-cta">
            Chat with Radiance
          </LandingCta>
        </div>
        <p className="landing-conversion-caption">No setup story. Just start with a conversation.</p>
      </div>
    </section>
  );
}
