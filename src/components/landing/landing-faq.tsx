"use client";

import { useId, useState } from "react";

// The card reveal and open-state treatment adapt Hirael's MIT FAQ Accordion Reveal from 21st.dev.

const QUESTIONS = [
  {
    q: "What is Radiance?",
    a: "Radiance is a personal intelligence AI workspace. You chat with a model you select, and you can attach notes and response preferences that you have saved on this device.",
  },
  {
    q: "What is Personal Intelligence?",
    a: "It is the Settings section where you save notes, record how you want answers shaped, and choose whether retrieved context may be shared with the selected AI provider.",
  },
  {
    q: "How does Radiance use saved context?",
    a: "When sharing is enabled, Radiance compares your new question with saved notes using bounded lexical matching. A small relevant subset, plus selected preference labels, can be included in the request. It does not send the full vault, IDs, or timestamps.",
  },
  {
    q: "Can I control what Radiance remembers?",
    a: "Yes. Notes are saved only when you save them. You can edit, delete, export, or clear the profile. Radiance does not automatically extract memories from chat.",
  },
  {
    q: "Does Radiance share my personal context with AI providers?",
    a: "Only if you enable sharing. Then relevant notes and preference labels are sent to the selected provider for that reply. If sharing is off, those notes stay in the browser.",
  },
  {
    q: "Can I use Radiance with different AI models?",
    a: "Yes. The composer includes a model selector with the registered Radiance models, including Groq, Gemini, and OpenRouter options.",
  },
  {
    q: "How is Radiance different from a conventional chatbot?",
    a: "A conventional chatbot starts from the prompt you type. Radiance can also bring in notes and preferences you have stored, under your control, so later conversations do not require restating the same context.",
  },
  {
    q: "What privacy protections exist today?",
    a: "Sharing is opt-in, saves are explicit, and payloads are bounded. Storage is still plaintext browser storage without accounts, sync, or end-to-end encryption. Do not store secrets there.",
  },
  {
    q: "How do I start chatting?",
    a: "Use Chat with Radiance in the navigation, the hero, or the final section. That opens the real Radiance chat at /chat.",
  },
] as const;

export function LandingFaq() {
  const baseId = useId();
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section id="faq" className="landing-section">
      <div className="landing-shell landing-faq">
        <h2 className="landing-section-title">Questions</h2>
        <div className="landing-faq-list">
          {QUESTIONS.map((item, index) => {
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;
            const isOpen = open === index;
            return (
              <div
                key={item.q}
                className="landing-faq-item"
                data-open={isOpen}
                style={{ animationDelay: `${360 + index * 50}ms` }}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : index)}
                  >
                    <span>{item.q}</span>
                    <span aria-hidden="true">{isOpen ? "–" : "+"}</span>
                  </button>
                </h3>
                {isOpen ? (
                  <p id={panelId} role="region" aria-labelledby={buttonId}>
                    {item.a}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
