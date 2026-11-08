import Link from "next/link";

export function PrivacySection() {
  return (
    <section id="privacy" className="landing-section">
      <div className="landing-shell landing-split">
        <h2 className="landing-section-title">Your intelligence. Your control</h2>
        <div>
          <p className="landing-copy" style={{ marginTop: 0 }}>
            You save notes explicitly. You manage and delete them. You set response preferences.
            Sharing retrieved context with the selected AI provider is opt-in.
          </p>
          <p className="landing-copy">
            The current MVP stores Personal Intelligence profiles in browser storage. That storage is
            plaintext, is not isolated by account, is not synchronized, and is not end-to-end encrypted.
            Anyone using the same browser profile can read it.
          </p>
          <p className="landing-copy">
            When sharing is enabled, relevant notes and preference labels are sent to the selected
            external AI provider for processing. Radiance does not claim zero exposure, encrypted vaults,
            or protection that has not been built.
          </p>
          <p className="landing-copy">
            <Link href="/privacy">Read the current privacy model</Link>
          </p>
        </div>
      </div>
    </section>
  );
}
