import React from "react";

export function ProductIntroduction() {
  return (
    <section id="product" className="landing-section story-introduction">
      <div className="landing-shell story-intro-grid">
        <div>
          <h2 className="landing-section-title">Saved by you. Ready when it matters.</h2>
        </div>
        <div className="story-intro-copy">
          <p className="landing-copy" style={{ marginTop: 0 }}>
            A useful assistant should not make you start from zero. Keep the project details and working preferences you choose, then return to the work instead of repeating yourself.
          </p>
          <p className="landing-copy">
            Personal Intelligence gives those details a clear home: notes you save, preferences you set, and a sharing switch you control.
          </p>
          <p className="story-boundary">Nothing is inferred in the background. A note is saved only when you choose to save it.</p>
        </div>
        <div className="story-visual story-compare" data-ui aria-label="Illustrative comparison: a conversation without personal context and with a saved Radiance note">
          <article className="story-compare-panel story-before">
            <span className="story-compare-label">Without saved context</span>
            <p className="story-compare-question">“Help me draft the next chapter.”</p>
            <p className="story-compare-answer">What should I keep in mind about your outline and citation style?</p>
            <span className="story-compare-foot">You start from zero again.</span>
          </article>
          <article className="story-compare-panel story-after">
            <span className="story-compare-label">With your saved context</span>
            <p className="story-compare-question">“Help me draft the next chapter.”</p>
            <p className="story-compare-answer">I’ll keep citations inline and focus on your thesis outline.</p>
            <span className="story-compare-foot">Your note is used only when sharing is enabled.</span>
          </article>
        </div>
      </div>
    </section>
  );
}
