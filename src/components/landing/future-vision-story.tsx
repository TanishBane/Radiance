"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { 
  Sparkles, 
  BrainCircuit, 
  FileStack, 
  Layers3, 
  ArrowRight
} from "lucide-react";
import { motionEasing } from "@/lib/motion/presets";
import "./privacy-and-vision.css";

const HORIZONS = [
  {
    badge: "Horizon 1",
    title: "Adaptive Memory",
    desc: "Autonomous summarization of complex conversational arcs into compact, high-value preference tokens with explicit user approval gates.",
    icon: <BrainCircuit className="w-5 h-5 text-violet-400" />
  },
  {
    badge: "Horizon 2",
    title: "Multi-Document Synthesis",
    desc: "Cross-document context linking across technical architecture specs, markdown notebooks, and code repositories directly in-session.",
    icon: <FileStack className="w-5 h-5 text-pink-400" />
  },
  {
    badge: "Horizon 3",
    title: "Cross-Model Context Translation",
    desc: "Format-preserving context projection allowing seamless model switching (Groq Llama 3.3 ↔ Gemini 2.0 ↔ Claude) without prompt re-tuning.",
    icon: <Layers3 className="w-5 h-5 text-cyan-400" />
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
          <span className="sr-only">Future Architectural Horizon</span>
          <h2 id="vision-heading" className="vision-title">
            Personal intelligence, with room to evolve.
          </h2>

          <p className="vision-lede">
            Our research roadmap explores deeper contextual understanding without compromising user autonomy or deterministic privacy boundaries.
          </p>
        </motion.div>

        {/* 3-Card Vision Grid */}
        <div className="vision-grid">
          {HORIZONS.map((item, idx) => (
            <motion.div
              key={item.title}
              className="vision-card"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: idx * 0.12, ease: motionEasing.entrance }}
            >
              <div className="flex items-center justify-between">
                <span className="vision-badge">{item.badge}</span>
                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center">
                  {item.icon}
                </div>
              </div>

              <h3 className="vision-card-title">{item.title}</h3>
              <p className="vision-card-desc">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
