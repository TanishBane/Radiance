"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { motionEasing } from "@/lib/motion/presets";
import "./context-pipeline.css";

const STAGES = [
  {
    key: "store",
    title: "Local Note Store",
    desc: "Notes and response preferences are stored in plaintext in this browser profile. They are not synchronized across devices."
  },
  {
    key: "matcher",
    title: "Bounded Lexical Matcher",
    desc: "Radiance compares a new prompt with saved notes using bounded lexical matching to identify relevant context."
  },
  {
    key: "envelope",
    title: "Request assembly",
    desc: "A limited set of matching notes and selected preference labels can be added to the request when sharing is enabled."
  },
  {
    key: "synthesis",
    title: "Model Synthesis Stream",
    desc: "The model you selected receives the request and any context you chose to share, then generates its reply."
  }
];

export function ContextPipelineSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section 
      id="pipeline"
      className="pipeline-section section-atmosphere-pipeline"
      aria-labelledby="pipeline-heading"
    >
      <div className="pipeline-shell">
        <motion.div 
          className="pipeline-header"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: motionEasing.entrance }}
        >
          <h2 id="pipeline-heading" className="pipeline-title">
            How chosen context reaches a reply.
          </h2>

          <p className="pipeline-lede">
            Follow the path from notes saved on this device to a later request. Matching context is shared only when you turn sharing on.
          </p>
        </motion.div>

        <ol className="pipeline-track">
          {STAGES.map((stage, idx) => (
            <motion.li
              key={stage.key}
              className="pipeline-node"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: idx * 0.12, ease: motionEasing.entrance }}
            >
              <h3 className="pipeline-node-title">{stage.title}</h3>
              <p className="pipeline-node-desc">{stage.desc}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
