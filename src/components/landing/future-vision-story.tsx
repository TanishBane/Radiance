"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Compass, Sparkles, Network, FileSearch } from "lucide-react";
import { motionEasing } from "@/lib/motion/presets";
import "./privacy-and-vision.css";

const HORIZONS = [
  {
    title: "Adaptive Memory",
    badge: "RESEARCH TRACK",
    icon: Sparkles,
    desc: "A possible future direction is helping people review and approve useful context from longer conversations without autonomous background scraping.",
    detail: "Interactive context extraction with user review gates",
  },
  {
    title: "Multi-Document Synthesis",
    badge: "EXPLORATION",
    icon: FileSearch,
    desc: "A possible future direction is connecting user-selected details across multiple documents and structured local records under strict user supervision.",
    detail: "Cross-document lexical indexing & verified citations",
  },
  {
    title: "Cross-Model Context Translation",
    badge: "INTEROPERABILITY",
    icon: Network,
    desc: "A possible future direction is making saved preferences easier to carry between different models while maintaining consistent personal intelligence.",
    detail: "Standardized context format across Groq, Gemini & OpenRouter",
  },
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
          <div className="vision-eyebrow">
            <Compass className="h-4 w-4" aria-hidden="true" />
            <span>07 / Future Architectural Horizon</span>
          </div>

          <h2 id="vision-heading" className="vision-title">
            Personal intelligence, with room to evolve.
          </h2>

          <p className="vision-lede">
            Personal intelligence, with room to expand. These concepts outline our future architectural horizon and exploratory directions—not active features in Radiance today.
          </p>
        </motion.div>

        <ul className="vision-grid">
          {HORIZONS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.title}
                className="vision-card"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: idx * 0.12, ease: motionEasing.entrance }}
              >
                <div className="vision-card-header">
                  <div className="vision-card-icon" aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="vision-badge">{item.badge}</span>
                </div>

                <h3 className="vision-card-title">{item.title}</h3>
                <p className="vision-card-desc">{item.desc}</p>

                <div className="vision-card-footer">
                  <span className="vision-card-detail">{item.detail}</span>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
