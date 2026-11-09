import React from "react";
import Link from "next/link";

export function PrivacySection() {
  return (
    <section id="privacy" className="landing-section landing-privacy">
      <div className="landing-shell landing-privacy-layout">
        <div className="landing-privacy-heading">
          <span className="landing-eyebrow">Privacy, plainly</span>
          <h2 className="landing-section-title">A little more personal. Still in your hands.</h2>
          <p className="landing-privacy-note">A clear view of what happens today, not promises about tomorrow.</p>
          <Link className="landing-privacy-link" href="/privacy">Read the current privacy model <span aria-hidden="true">↗</span></Link>
        </div>
        <div className="landing-privacy-details">
          <article className="landing-privacy-card landing-privacy-card-primary">
            <span className="landing-privacy-number">01 / Your choices</span>
            <h3>You decide what stays, and what goes.</h3>
            <p>You save notes explicitly, manage or delete them, and set your response preferences. Sharing retrieved context with your selected AI provider is always opt-in.</p>
          </article>
          <article className="landing-privacy-card">
            <span className="landing-privacy-number">02 / Where it lives</span>
            <h3>Today, your profile lives in this browser.</h3>
            <p>The current MVP stores Personal Intelligence in browser storage as plaintext. It is not end-to-end encrypted, account-isolated, or synced, so anyone with access to this browser profile may be able to read it.</p>
          </article>
          <article className="landing-privacy-card">
            <span className="landing-privacy-number">03 / When context travels</span>
            <h3>Only with your permission.</h3>
            <p>When sharing is enabled, relevant notes and preference labels are sent to the selected external AI provider for processing. We make no claim of zero exposure or protections that have not been built.</p>
          </article>
        </div>
      </div>
    </section>
  );
}
