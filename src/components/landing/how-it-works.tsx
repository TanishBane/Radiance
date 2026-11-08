import { LandingReveal } from "./landing-reveal";

const STEPS = [
  {
    index: "01",
    title: "Give Radiance context",
    copy: "Save relevant information you want available later. Notes are stored in the browser until you change or delete them.",
  },
  {
    index: "02",
    title: "Shape your experience",
    copy: "Record response preferences that match how you like answers: length, complexity, examples, and practicality.",
  },
  {
    index: "03",
    title: "Have more relevant conversations",
    copy: "On a later question, Radiance can retrieve matching saved notes and apply your latest preferences when preparing a reply.",
  },
] as const;

export function HowItWorks() {
  return (
    <section id="how-it-works" className="landing-section">
      <div className="landing-shell">
        <LandingReveal>
          <h2 className="landing-section-title">How it works today</h2>
          <p className="landing-copy">
            This is the implemented path: explicit save, explicit preferences, bounded retrieval.
            Radiance does not extract memories automatically from a conversation.
          </p>
        </LandingReveal>
        <div className="landing-steps" style={{ marginTop: 48 }}>
          {STEPS.map((step) => (
            <article key={step.index} className="landing-step">
              <span className="landing-step-index">{step.index}</span>
              <h3>{step.title}</h3>
              <p>{step.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
