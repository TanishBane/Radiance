"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { 
  FileText, 
  Sliders, 
  Search, 
  ShieldCheck,
  CheckCircle2,
  Sparkles
} from "lucide-react";
import { motionEasing } from "@/lib/motion/presets";
import "./personal-intelligence-story.css";

interface PillarItem {
  id: string;
  title: string;
  desc: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  accentColor: string;
}

const PILLARS: PillarItem[] = [
  {
    id: "saved-notes",
    title: "Saved Notes",
    desc: "Preserve project constraints, coding rules, thesis points, and recurring definitions. Stored locally under your explicit direction.",
    tag: "Local Plaintext",
    icon: FileText,
    accentColor: "rgba(139, 92, 246, 0.4)"
  },
  {
    id: "response-preferences",
    title: "Response Preferences",
    desc: "Tune tone, explanation depth, and output structure. Prefer concise bullets, academic citations, or step-by-step technical blueprints.",
    tag: "Shape & Cadence",
    icon: Sliders,
    accentColor: "rgba(251, 146, 60, 0.4)"
  },
  {
    id: "context-retrieval",
    title: "Relevant Context Retrieval",
    desc: "Bounded lexical matching brings forward matching notes when relevant to the prompt, without sharing irrelevant private history.",
    tag: "Lexical BM25",
    icon: Search,
    accentColor: "rgba(6, 182, 212, 0.4)"
  },
  {
    id: "sharing-control",
    title: "Provider-Sharing Control",
    desc: "You control whether personal context reaches third-party AI models (Groq, Gemini, OpenRouter). Completely opt-in per request.",
    tag: "Strict Opt-In",
    icon: ShieldCheck,
    accentColor: "rgba(16, 185, 129, 0.4)"
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
          <div className="intelligence-story-eyebrow">
            <Sparkles className="w-3.5 h-3.5 text-violet-400" />
            <span>Section 03 · Four Foundations</span>
          </div>

          <h2 id="intelligence-story-title" className="intelligence-story-title">
            An AI experience shaped around your context.
          </h2>

          <p className="intelligence-story-lede">
            Radiance isn&apos;t a one-size-fits-all model. It combines a local contextual memory engine with your explicit preferences to deliver answers that sound and feel built for you.
          </p>
        </motion.div>

        {/* 4 Pillars Grid */}
        <ol className="intelligence-pillars-grid">
          {PILLARS.map((pillar, idx) => {
            const Icon = pillar.icon;
            return (
              <motion.li
                key={pillar.id}
                className="intelligence-pillar-card"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: idx * 0.1, ease: motionEasing.entrance }}
                whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
              >
                <div className="flex items-center justify-between">
                  <div className="intelligence-pillar-icon" style={{ borderColor: pillar.accentColor }}>
                    <Icon className="w-5 h-5 text-white" />
                  </div>
                  <span className="intelligence-pillar-tag">
                    {pillar.tag}
                  </span>
                </div>

                <div className="intelligence-pillar-copy">
                  <h3 className="intelligence-pillar-title">{pillar.title}</h3>
                  <p className="intelligence-pillar-desc">{pillar.desc}</p>
                </div>

                <div className="intelligence-pillar-footer">
                  <span className="text-xs font-mono text-slate-400">Pillar 0{idx + 1}</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 opacity-80" />
                </div>
              </motion.li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
