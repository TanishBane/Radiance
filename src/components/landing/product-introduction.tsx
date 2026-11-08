import React from "react";

export function ProductIntroduction() {
  return (
    <section id="product" className="landing-section story-introduction">
      <div className="landing-shell story-intro-grid">
        <div>
          <p className="story-eyebrow">A quieter kind of intelligence</p>
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
        <div className="story-visual story-note-visual" aria-label="Illustration of a saved project note">
          <div className="story-note-sheet">
            <span className="story-note-label">SAVED NOTE <span>01</span></span>
            <p>Current project</p>
            <strong>Building a thoughtful, private AI workspace.</strong>
            <span className="story-note-rule" />
            <small>Added by you · Available on this device</small>
          </div>
          <span className="story-note-orbit" aria-hidden="true" />
        </div>
      </div>
    </section>
  );
}
