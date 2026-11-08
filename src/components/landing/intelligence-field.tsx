export function IntelligenceField() {
  return (
    <figure
      className="landing-field"
      aria-label="An illustrative Radiance conversation"
    >
      <div className="landing-conversation">
        <p className="landing-question">
          <span>Question</span>
          What belongs in the next chapter outline?
        </p>
        <svg className="landing-reference-lines" viewBox="0 0 760 300" preserveAspectRatio="none" aria-hidden="true">
          <path className="landing-reference-line" pathLength="1" d="M508 86 C 520 82, 535 78, 550 74" />
          <path className="landing-reference-line" pathLength="1" d="M508 192 C 525 200, 535 208, 550 214" />
        </svg>
        <p className="landing-answer">
          <strong>Start with three sections.</strong> Keep citations inline and the outline concise.
        </p>
        <figcaption className="landing-demo-caption">
          Illustrative conversation · not connected to your profile
        </figcaption>
      </div>

      <aside className="landing-annotations" aria-label="Selected context">
        <h2>In the margin</h2>
        <dl className="landing-annotation">
          <dt>Saved note</dt>
          <dd>Thesis: keep citations inline</dd>
        </dl>
        <dl className="landing-annotation">
          <dt>Response preference</dt>
          <dd>More concise</dd>
        </dl>
        <p className="landing-annotation-note">
          Relevant notes are shared with the selected provider only when you turn sharing on.
        </p>
      </aside>
    </figure>
  );
}
