import { LandingReveal } from "./landing-reveal";

const FEATURES = [
  {
    title: "Personal memory",
    copy: "Save and manage notes up to 500 characters each. Common credential patterns are blocked. You can search, edit, export, or clear the vault on this device.",
    visual: "Notes stay in a list you own. Nothing is added unless you save it from chat or from Settings.",
  },
  {
    title: "Personalized responses",
    copy: "Choose answer style along a few axes: concise or detailed, technical or simpler language, more examples, more practical guidance.",
    visual: "Preferences are recorded as explicit signals, not guessed from tone of voice.",
  },
  {
    title: "Context-aware conversations",
    copy: "When sharing is on, a later question can pull in up to five lexically relevant notes plus a handful of preference labels.",
    visual: "Retrieval scores overlap between your question and saved text. Unrelated notes stay out of the request.",
  },
  {
    title: "Provider sharing control",
    copy: "Sharing retrieved context with the selected AI provider is opt-in and independent from chat history.",
    visual: "If sharing is off, notes remain on the device and are not attached to the inference request.",
  },
  {
    title: "Personal Intelligence settings",
    copy: "Open Settings and go to Personal Intelligence to review notes, preferences, sharing, export, and deletion.",
    visual: "The same panel is available from a remembered chat message or from the sidebar.",
  },
] as const;

export function FeatureShowcase() {
  return (
    <section id="features" className="landing-section">
      <div className="landing-shell">
        <LandingReveal>
          <h2 className="landing-section-title">What you can do now</h2>
        </LandingReveal>
        <div className="landing-features" style={{ marginTop: 56 }}>
          {FEATURES.map((feature) => (
            <article key={feature.title} className="landing-feature">
              <div className="landing-feature-copy">
                <span className="landing-mark" aria-hidden="true" />
                <h3>{feature.title}</h3>
                <p>{feature.copy}</p>
              </div>
              <div className="landing-panel">
                <p style={{ margin: 0 }}>{feature.visual}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
