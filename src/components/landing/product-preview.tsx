"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";

const STEPS = [
  {
    id: "save",
    label: "Save a preference",
    rail: "Personal Intelligence",
    badgeColor: "var(--radiance-blue)",
    title: "You save a preference",
    body: "Demonstration data: “More concise” is recorded as a response preference. No automatic learning is taking place.",
    sample: "Preference · More concise",
  },
  {
    id: "vault",
    label: "See it stored",
    rail: "Saved on this device",
    badgeColor: "var(--radiance-violet)",
    title: "The note appears in Settings",
    body: "Demonstration data: a project note sits beside the preference. You can edit or delete either item.",
    sample: "Note · Thesis: keep citations inline",
  },
  {
    id: "retrieve",
    label: "Ask later",
    rail: "Lexical retrieval",
    badgeColor: "var(--radiance-amber)",
    title: "A later question retrieves overlap",
    body: "Demonstration data: asking about the thesis outline matches the saved note. Unrelated notes are not attached.",
    sample: "Retrieved · Thesis: keep citations inline",
  },
  {
    id: "reply",
    label: "See the shape",
    rail: "Reply preview",
    badgeColor: "var(--radiance-emerald)",
    title: "The reply follows the preference",
    body: "Demonstration data: the preview is shorter because the concise preference is in effect, and only if sharing is enabled.",
    sample: "Here is a short outline with inline citations…",
  },
] as const;

export function ProductPreview() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const shouldReduceMotion = useReducedMotion();

  return (
    <section id="preview" className="landing-section">
      <div className="landing-shell">
        <div style={{ maxWidth: "620px" }}>
          <h2 className="landing-section-title">A walk through the current path</h2>
          <p className="landing-copy" style={{ marginTop: "12px" }}>
            This sequence uses demonstration data. It is not connected to your Personal Intelligence vault.
          </p>
        </div>
        <div className="landing-preview" style={{ marginTop: 40 }}>
          <div className="landing-preview-toolbar">
            <div className="landing-preview-steps" role="group" aria-label="Demonstration steps">
              {STEPS.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  aria-pressed={index === step}
                  aria-controls="landing-preview-content"
                  onClick={() => setStep(index)}
                  style={{
                    position: "relative",
                    transition: "color 0.2s ease, background-color 0.2s ease",
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <span className="landing-demo-tag">Demonstration data</span>
          </div>
          <div id="landing-preview-content" className="landing-preview-body" aria-live="polite">
            <aside className="landing-preview-rail">
              <span
                style={{
                  display: "inline-block",
                  width: "8px",
                  height: "8px",
                  borderRadius: "50%",
                  backgroundColor: current.badgeColor,
                  marginRight: "8px",
                  boxShadow: `0 0 10px ${current.badgeColor}`,
                }}
              />
              {current.rail}
            </aside>
            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                className="landing-preview-main"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
              >
                <h3
                  style={{
                    margin: 0,
                    fontSize: "1.5rem",
                    fontWeight: 600,
                    letterSpacing: "-0.02em",
                    fontFamily: "var(--font-sans), sans-serif",
                  }}
                >
                  {current.title}
                </h3>
                <p className="landing-copy" style={{ marginTop: "10px", lineHeight: 1.65 }}>
                  {current.body}
                </p>
                <div
                  className="landing-panel"
                  style={{
                    marginTop: 24,
                    fontFamily: "var(--font-mono)",
                    fontSize: "0.875rem",
                    borderLeft: `3px solid ${current.badgeColor}`,
                    background: "rgba(255, 255, 255, 0.03)",
                    padding: "14px 18px",
                    borderRadius: "10px",
                  }}
                >
                  <p style={{ margin: 0, color: "var(--txt)" }}>{current.sample}</p>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
