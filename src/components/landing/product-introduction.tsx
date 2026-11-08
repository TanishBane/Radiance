export function ProductIntroduction() {
  return (
    <section id="product" className="landing-section">
      <div className="landing-shell landing-split">
        <h2 className="landing-section-title">Not just another conversation</h2>
        <div>
          <p className="landing-copy" style={{ marginTop: 0 }}>
            A conventional chatbot treats every session as a clean slate. You restate the same constraints,
            the same project facts, the same preference for brevity or depth.
          </p>
          <p className="landing-copy">
            Radiance is built around Personal Intelligence: an explicit place to save what should remain
            available, choose how answers should be shaped, and decide whether retrieved notes may leave
            the browser for the selected AI provider.
          </p>
          <p className="landing-copy">
            Nothing is inferred in the background. Notes are saved when you save them. Retrieval is bounded
            lexical matching against those notes, not a hidden profile of who you are.
          </p>
        </div>
      </div>
    </section>
  );
}
