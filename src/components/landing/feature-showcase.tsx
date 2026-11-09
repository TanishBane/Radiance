import React from "react";

const FEATURES = [
  { id: "notes", title: "A useful note, not a hidden profile", copy: "Keep project details in notes you can review, edit, export, or remove.", visual: "A short list, written and maintained by you.", kind: "notes", status: "Available now" },
  { id: "preferences", title: "Answers shaped around your preferences", copy: "Choose the response style that works for you, then update it whenever your needs change.", visual: "Concise  ─────●──  Detailed", kind: "preferences", status: "Available now" },
  { id: "retrieval", title: "Only relevant context moves forward", copy: "With sharing enabled, up to five notes can be selected for a question using bounded lexical matching.", visual: "Question  →  Matching notes  →  Provider request", kind: "retrieval", status: "Available now" },
] as const;

export function FeatureShowcase() {
  return (
    <section id="features" className="landing-section story-features">
      <div className="landing-shell">
        <div className="story-section-heading story-feature-heading">
          <div><h2 className="landing-section-title">Thoughtful by default. Useful by choice.</h2></div>
          <p className="landing-copy">A closer look at what Personal Intelligence does today, and where your choices shape it.</p>
        </div>
        <div className="story-feature-list" data-ui>
          {FEATURES.map((feature) => (
            <article className="story-feature" key={feature.id}>
              <div className="story-feature-copy"><span className="story-feature-status">{feature.status}</span><h3>{feature.title}</h3><p>{feature.copy}</p></div>
              <div className={`story-feature-visual story-feature-${feature.kind}`} aria-hidden="true">
                {feature.kind === "notes" ? <><span className="story-mini-note"><i /> Project milestones</span><span className="story-mini-note"><i /> Writing preferences</span><span className="story-mini-note"><i /> Research context</span></> : null}
                {feature.kind === "preferences" ? <><span className="story-preference-label">Your answer length</span><span className="story-preference-track"><i /></span><span className="story-preference-ends"><span>Concise</span><span>Detailed</span></span></> : null}
                {feature.kind === "retrieval" ? <><span className="story-retrieval-question">“What are the milestones for this project?”</span><span className="story-retrieval-arrow" aria-hidden="true">↓</span><span className="story-retrieval-match">2 relevant notes selected</span></> : null}
              </div>
            </article>
          ))}
        </div>
        <div className="story-sharing-note"><span className="story-sharing-dot" aria-hidden="true" /><p><strong>Your notes stay here unless you opt in.</strong> When sharing is off, retrieved notes are not attached to provider requests.</p><span className="story-sharing-toggle" role="img" aria-label="Example provider sharing setting"><i /></span></div>
      </div>
    </section>
  );
}
