import React from "react";

const STEPS = [
  { index: "01", title: "Save a note", copy: "Add the project fact or detail you want available again. Nothing is added automatically." },
  { index: "02", title: "Choose your answer style", copy: "Set the response preferences that help you work, from concise explanations to more examples." },
  { index: "03", title: "Ask a question", copy: "When sharing is enabled, bounded lexical matching can bring up to five relevant notes into a later request." },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-section story-how">
      <div className="landing-shell">
        <div className="story-section-heading story-how-heading">
          <div><p className="story-eyebrow">A simple loop, by design</p><h2 className="landing-section-title">Context, on your terms.</h2></div>
          <p className="landing-copy">Three deliberate steps. No hidden learning, no surprise sharing, and no claim that every old detail is always in view.</p>
        </div>
        <ol className="story-steps">
          {STEPS.map((step) => (
            <li className="story-step" key={step.index}>
              <span className="story-step-index">{step.index}</span>
              <span className="story-step-node" aria-hidden="true" />
              <h3>{step.title}</h3><p>{step.copy}</p>
            </li>
          ))}
        </ol>
        <p className="story-method-note">Relevant notes are selected with bounded lexical matching against what you asked.</p>
      </div>
    </section>
  );
}
