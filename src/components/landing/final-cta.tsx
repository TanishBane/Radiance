import React from "react";
import Link from "next/link";

export function FinalCta() {
  return (
    <section id="start" className="landing-section landing-finale landing-conversion">
      <div className="landing-shell landing-conversion-inner">
        <span className="landing-eyebrow">A better conversation starts with context</span>
        <h2 className="landing-section-title">Start a more personal conversation.</h2>
        <p className="landing-copy">Bring your context. Shape your experience. Discover Radiance.</p>
        <div className="landing-hero-actions landing-conversion-actions">
          <Link href="/chat" className="landing-cta landing-cta-lg landing-final-cta">
            Chat with Radiance <span aria-hidden="true">→</span>
          </Link>
        </div>
        <p className="landing-conversion-caption">No setup story. Just start with a conversation.</p>
      </div>
    </section>
  );
}
