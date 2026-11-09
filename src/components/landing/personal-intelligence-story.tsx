"use client";

import React from "react";
import { motion } from "motion/react";
import { 
  FileText, 
  Sliders, 
  Search, 
  ShieldCheck, 
  Sparkles,
  ArrowRight
} from "lucide-react";
import "./personal-intelligence-story.css";

const PILLARS = [
  {
    id: "pillar-1",
    icon: <FileText className="w-5 h-5 text-violet-400" />,
    iconBg: "rgba(139, 92, 246, 0.15)",
    title: "Saved Notes",
    desc: "Preserve project constraints, coding rules, thesis points, and recurring definitions. Stored locally under your explicit direction."
  },
  {
    id: "pillar-2",
    icon: <Sliders className="w-5 h-5 text-rose-400" />,
    iconBg: "rgba(244, 63, 94, 0.15)",
    title: "Response Preferences",
    desc: "Tune tone, explanation depth, and output structure. Prefer concise bullets, academic citations, or step-by-step technical blueprints."
  },
  {
    id: "pillar-3",
    icon: <Search className="w-5 h-5 text-cyan-400" />,
    iconBg: "rgba(6, 182, 212, 0.15)",
    title: "Relevant Context Retrieval",
    desc: "Bounded lexical matching brings forward matching notes when relevant to the prompt, without sharing irrelevant private history."
  },
  {
    id: "pillar-4",
    icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
    iconBg: "rgba(16, 185, 129, 0.15)",
    title: "Provider-Sharing Control",
    desc: "You control whether personal context reaches third-party AI models (Groq, Gemini, OpenRouter). Completely opt-in per request."
  }
];

export function PersonalIntelligenceStory() {
  return (
    <section 
      id="intelligence"
      className="intelligence-story-section section-atmosphere-intelligence"
      aria-labelledby="intelligence-story-title"
    >
      <div className="intelligence-story-shell">
        <motion.div 
          className="intelligence-story-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="intelligence-story-eyebrow">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>The Personal Intelligence Core</span>
          </div>

          <h2 id="intelligence-story-title" className="intelligence-story-title">
            An AI experience shaped around your context.
          </h2>

          <p className="intelligence-story-lede">
            Radiance isn&apos;t a one-size-fits-all model. It combines a local contextual memory engine with your explicit preferences to deliver answers that sound and feel built for you.
          </p>
        </motion.div>

        {/* 4 Pillars Grid */}
        <div className="intelligence-pillars-grid">
          {PILLARS.map((pillar, idx) => (
            <motion.div
              key={pillar.id}
              className="intelligence-pillar-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
            >
              <div 
                className="intelligence-pillar-icon"
                style={{ background: pillar.iconBg }}
              >
                {pillar.icon}
              </div>
              <h3 className="intelligence-pillar-title">{pillar.title}</h3>
              <p className="intelligence-pillar-desc">{pillar.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
