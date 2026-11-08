"use client";

import { useState } from "react";

const STEPS = [
  {
    id: "save",
    label: "Save a preference",
    rail: "Personal Intelligence",
    title: "You save a preference",
    body: "Demonstration data: “More concise” is recorded as a response preference. No automatic learning is taking place.",
    sample: "Preference · More concise",
  },
  {
    id: "vault",
    label: "See it stored",
    rail: "Saved on this device",
    title: "The note appears in Settings",
    body: "Demonstration data: a project note sits beside the preference. You can edit or delete either item.",
    sample: "Note · Thesis: keep citations inline",
  },
  {
    id: "retrieve",
    label: "Ask later",
    rail: "Lexical retrieval",
    title: "A later question retrieves overlap",
    body: "Demonstration data: asking about the thesis outline matches the saved note. Unrelated notes are not attached.",
    sample: "Retrieved · Thesis: keep citations inline",
  },
  {
    id: "reply",
    label: "See the shape",
    rail: "Reply preview",
    title: "The reply follows the preference",
    body: "Demonstration data: the preview is shorter because the concise preference is in effect, and only if sharing is enabled.",
    sample: "Here is a short outline with inline citations…",
  },
] as const;

export function ProductPreview() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];

  return (
    <section id="preview" className="landing-section">
      <div className="landing-shell">
        <h2 className="landing-section-title">A walk through the current path</h2>
        <p className="landing-copy">
          This sequence uses demonstration data. It is not connected to your Personal Intelligence vault.
        </p>
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
                >
                  {item.label}
                </button>
              ))}
            </div>
            <span className="landing-demo-tag">Demonstration data</span>
          </div>
          <div id="landing-preview-content" className="landing-preview-body" aria-live="polite">
            <aside className="landing-preview-rail">{current.rail}</aside>
            <div key={current.id} className="landing-preview-main">
              <h3 style={{ margin: 0, fontSize: "1.5rem", fontWeight: 500 }}>{current.title}</h3>
              <p className="landing-copy">{current.body}</p>
              <p
                className="landing-panel"
                style={{ marginTop: 24, fontFamily: "var(--font-mono)", fontSize: "0.875rem" }}
              >
                {current.sample}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
