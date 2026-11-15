"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { Database, Search, Layers, Sparkles } from "lucide-react";
import { motionEasing } from "@/lib/motion/presets";
import "./context-pipeline.css";

const STAGES = [
  {
    key: "store",
    step: "01",
    status: "DEVICE LOCAL",
    statusType: "emerald",
    icon: Database,
    title: "Local Note Store",
    desc: "Notes and response preferences are stored in plaintext in this browser profile. They are not synchronized across devices.",
    metric: "Zero cloud syncing",
  },
  {
    key: "matcher",
    step: "02",
    status: "DETERMINISTIC",
    statusType: "amber",
    icon: Search,
    title: "Bounded Lexical Matcher",
    desc: "Keyword-driven token matching compares a new prompt with saved notes to identify relevant context without ungrounded vector drift.",
    metric: "Exact token relevance",
  },
  {
    key: "envelope",
    step: "03",
    status: "OPT-IN ONLY",
    statusType: "violet",
    icon: Layers,
    title: "Context Injection Envelope",
    desc: "A limited, user-governed set of matching notes and selected preference labels is assembled into a clean request envelope only when sharing is active.",
    metric: "Strict token boundary",
  },
  {
    key: "synthesis",
    step: "04",
    status: "STREAMING",
    statusType: "cyan",
    icon: Sparkles,
    title: "Model Synthesis Stream",
    desc: "The model you selected receives the request and any context you chose to share, then generates its reply through real-time streaming.",
    metric: "Multi-provider SSE",
  },
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
          <div className="pipeline-eyebrow">
            <span className="pipeline-pulse-dot" aria-hidden="true" />
            <span>05 / Context Retrieval Pipeline</span>
          </div>

          <h2 id="pipeline-heading" className="pipeline-title">
            The right context. At the right moment.
          </h2>

          <p className="pipeline-lede">
            Follow the path from notes saved on this device to a later request. Matching context is transparent, bounded, and shared only when you turn sharing on.
          </p>
        </motion.div>

        <div className="pipeline-track-container">
          <div className="pipeline-flow-connector" aria-hidden="true">
            <div className="pipeline-flow-pulse" />
          </div>

          <ol className="pipeline-track">
            {STAGES.map((stage, idx) => {
              const Icon = stage.icon;
              return (
                <motion.li
                  key={stage.key}
                  className="pipeline-node"
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: idx * 0.12, ease: motionEasing.entrance }}
                >
                  <div className="pipeline-node-meta">
                    <span className="pipeline-node-step">{stage.step}</span>
                    <div className={`pipeline-status-badge status-${stage.statusType}`}>
                      <span className="pipeline-status-indicator" aria-hidden="true" />
                      <span>{stage.status}</span>
                    </div>
                  </div>

                  <div className="pipeline-icon-wrap" aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </div>

                  <h3 className="pipeline-node-title">{stage.title}</h3>
                  <p className="pipeline-node-desc">{stage.desc}</p>

                  <div className="pipeline-node-metric">
                    <span className="pipeline-metric-label">{stage.metric}</span>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>
      </div>
    </section>
  );
}
