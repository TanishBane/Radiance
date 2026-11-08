import type { Metadata } from "next";
import Link from "next/link";
import { LandingCta } from "@/components/landing/landing-cta";
import { LandingFooter } from "@/components/landing/landing-footer";
import { LandingNav } from "@/components/landing/landing-nav";
import "@/components/landing/landing.css";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "How Radiance Personal Intelligence stores notes, handles sharing with AI providers, and what is not implemented yet.",
  alternates: {
    canonical: "/privacy",
  },
};

export default function PrivacyPage() {
  return (
    <div className="landing-root">
      <a className="landing-skip" href="#main">
        Skip to content
      </a>
      <LandingNav />
      <main id="main" className="landing-shell landing-section">
        <h1 className="landing-section-title">Current privacy model</h1>
        <p className="landing-copy">
          This page describes implemented behavior. It is not a legal policy and does not invent
          protections that have not been built.
        </p>
        <h2 className="landing-copy" style={{ color: "var(--txt)", fontSize: "1.5rem" }}>
          What you control
        </h2>
        <p className="landing-copy">
          Notes are saved only when you save them. You can edit, delete, export, or clear the Personal
          Intelligence profile. Response preferences are explicit. Sharing retrieved context with the
          selected AI provider starts disabled.
        </p>
        <h2 className="landing-copy" style={{ color: "var(--txt)", fontSize: "1.5rem" }}>
          What is stored where
        </h2>
        <p className="landing-copy">
          Personal Intelligence profiles live in browser local storage. The storage is plaintext, has no
          account isolation, and does not synchronize across devices. It is not end-to-end encrypted.
          Do not store passwords, keys, or other secrets in notes.
        </p>
        <h2 className="landing-copy" style={{ color: "var(--txt)", fontSize: "1.5rem" }}>
          What is sent to a provider
        </h2>
        <p className="landing-copy">
          When sharing is enabled, Radiance may attach a small set of relevant note texts and preference
          labels to the latest user message for the selected provider. It does not send profile IDs,
          memory IDs, provenance, timestamps, importance scores, or the full vault. If sharing is off,
          those notes stay in the browser.
        </p>
        <p className="landing-copy">
          <Link href="/">Back to the homepage</Link>
        </p>
        <div className="landing-hero-actions">
          <LandingCta />
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
