"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { motionEasing } from "@/lib/motion/presets";

export function ProductIntroduction() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="product" className="landing-section story-introduction">
      <div className="landing-shell story-intro-grid">
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: motionEasing.entrance }}
        >
          <p className="story-eyebrow">Explicit Control</p>
          <h2 className="landing-section-title">Saved by you. Ready when it matters.</h2>
        </motion.div>
        <motion.div 
          className="story-intro-copy"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.1, ease: motionEasing.entrance }}
        >
          <p className="landing-copy" style={{ marginTop: 0 }}>
            Keep the project details and working preferences you choose, then return to the work without restating them each time.
          </p>
          <p className="landing-copy">
            Personal Intelligence gives those details a clear home: notes you save, preferences you set, and a sharing control you choose.
          </p>
          <p className="story-boundary">Nothing is inferred in the background. A note is saved only when you choose to save it.</p>
        </motion.div>
        <motion.div 
          className="story-visual story-compare" 
          data-ui 
          aria-label="Illustrative comparison: a conversation without personal context and with a saved Radiance note"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: 0.2, ease: motionEasing.entrance }}
        >
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
        </motion.div>
      </div>
    </section>
  );
}
