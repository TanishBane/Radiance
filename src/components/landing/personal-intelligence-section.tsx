const IDEAS = [
  {
    title: "Personal context",
    copy: "Save information you consider important. Each note is stored in Personal Intelligence, with a category you choose, and can be edited or deleted later.",
    wide: true,
  },
  {
    title: "Adaptive preferences",
    copy: "Set how answers should be structured: more concise or more detailed, more technical or simpler language, more examples, or more practical guidance.",
  },
  {
    title: "Relevant retrieval",
    copy: "When you ask a new question, Radiance scores saved notes against the query with bounded lexical matching and can attach a small relevant subset.",
  },
  {
    title: "User control",
    copy: "Sharing starts off. You decide what is saved and whether retrieved notes and preference labels may be sent to the selected provider.",
  },
] as const;

export function PersonalIntelligenceSection() {
  return (
    <section id="intelligence" className="landing-section">
      <div className="landing-shell">
        <div>
          <h2 className="landing-section-title">Your AI. Your context. Your way</h2>
          <p className="landing-copy">
            Personal Intelligence is the control surface for notes and response preferences.
            It lives in Settings, on this device, and only participates in a reply when you have
            enabled sharing for retrieved context.
          </p>
        </div>
        <div className="landing-mosaic" style={{ marginTop: 48 }}>
          {IDEAS.map((idea) => (
            <article key={idea.title} className={`landing-panel${"wide" in idea && idea.wide ? " landing-panel-wide" : ""}`}>
              <span className="landing-mark" aria-hidden="true" />
              <h3>{idea.title}</h3>
              <p>{idea.copy}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
