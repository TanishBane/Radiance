"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { motionEasing } from "@/lib/motion/presets";
import "./privacy-and-vision.css";

const HORIZONS = [
  {
    title: "Adaptive Memory",
    desc: "A possible future direction is helping people review and approve useful context from longer conversations."
  },
  {
    title: "Multi-Document Synthesis",
    desc: "A possible future direction is connecting user-selected details across multiple documents."
  },
  {
    title: "Cross-Model Context Translation",
    desc: "A possible future direction is making saved preferences easier to carry between different models."
  }
];

export function FutureVisionStory() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section 
      id="vision"
      className="vision-section-container section-atmosphere-vision"
      aria-labelledby="vision-heading"
    >
      <div className="vision-shell">
        <motion.div 
          className="vision-header"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: motionEasing.entrance }}
        >
          <h2 id="vision-heading" className="vision-title">
            What might come next.
          </h2>

          <p className="vision-lede">
            These are ideas for future work, not features available in Radiance today.
          </p>
        </motion.div>

        <ul className="vision-grid">
          {HORIZONS.map((item, idx) => (
            <motion.li
              key={item.title}
              className="vision-card"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: idx * 0.12, ease: motionEasing.entrance }}
            >
              <h3 className="vision-card-title">{item.title}</h3>
              <p className="vision-card-desc">{item.desc}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
