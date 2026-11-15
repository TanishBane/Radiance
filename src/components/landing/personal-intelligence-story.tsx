"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { motionEasing } from "@/lib/motion/presets";
import "./personal-intelligence-story.css";

const PILLARS = [
  {
    id: "saved-notes",
    title: "Saved Notes",
    desc: "Preserve project constraints, coding rules, thesis points, and recurring definitions. Stored locally under your explicit direction."
  },
  {
    id: "response-preferences",
    title: "Response Preferences",
    desc: "Tune tone, explanation depth, and output structure. Prefer concise bullets, academic citations, or step-by-step technical blueprints."
  },
  {
    id: "context-retrieval",
    title: "Relevant Context Retrieval",
    desc: "Bounded lexical matching brings forward matching notes when relevant to the prompt, without sharing irrelevant private history."
  },
  {
    id: "sharing-control",
    title: "Provider-Sharing Control",
    desc: "You control whether personal context reaches third-party AI models (Groq, Gemini, OpenRouter). Completely opt-in per request."
  }
];

export function PersonalIntelligenceStory() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section 
      id="intelligence"
      className="intelligence-story-section section-atmosphere-intelligence"
      aria-labelledby="intelligence-story-title"
    >
      <div className="intelligence-story-shell">
        <motion.div 
          className="intelligence-story-header"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: motionEasing.entrance }}
        >
          <h2 id="intelligence-story-title" className="intelligence-story-title">
            Your context, carried forward.
          </h2>

          <p className="intelligence-story-lede">
            Radiance isn&apos;t a one-size-fits-all model. It combines a local contextual memory engine with your explicit preferences to deliver answers that sound and feel built for you.
          </p>
        </motion.div>

        {/* 4 Pillars Grid */}
        <ol className="intelligence-pillars-grid">
          {PILLARS.map((pillar, idx) => (
            <motion.li
              key={pillar.id}
              className="intelligence-pillar-card"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: idx * 0.1, ease: motionEasing.entrance }}
            >
              <span className="intelligence-pillar-marker" aria-hidden="true" />
              <div className="intelligence-pillar-copy">
                <h3 className="intelligence-pillar-title">{pillar.title}</h3>
                <p className="intelligence-pillar-desc">{pillar.desc}</p>
              </div>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
