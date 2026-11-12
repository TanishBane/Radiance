"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { 
  Database, 
  Search, 
  Workflow, 
  Cpu, 
  Zap,
  CheckCircle2
} from "lucide-react";
import { motionEasing } from "@/lib/motion/presets";
import "./context-pipeline.css";

const STAGES = [
  {
    key: "store",
    step: "Local Store",
    title: "Local Note Store",
    desc: "Saved notes and preferences remain in this browser's localStorage as plaintext until an active prompt triggers context assembly.",
    icon: <Database className="w-5 h-5 text-cyan-400" />,
    iconBg: "rgba(6, 182, 212, 0.15)"
  },
  {
    key: "matcher",
    step: "Lexical Match",
    title: "Bounded Lexical Matcher",
    desc: "Keyword-driven token matching checks incoming prompt tokens against saved note triggers without executing unverified vector extrapolations.",
    icon: <Search className="w-5 h-5 text-amber-400" />,
    iconBg: "rgba(245, 158, 11, 0.15)"
  },
  {
    key: "envelope",
    step: "Context Envelope",
    title: "Context Injection Envelope",
    desc: "Matched constraints are assembled into an isolated system preamble, clearly demarcated to prevent prompt injection or drift.",
    icon: <Workflow className="w-5 h-5 text-coral-400" />,
    iconBg: "rgba(251, 146, 60, 0.15)"
  },
  {
    key: "synthesis",
    step: "Model Synthesis",
    title: "Model Synthesis Stream",
    desc: "Target model (Groq, Gemini, OpenRouter) streams formatted reasoning tokens adhering strictly to your verified preferences.",
    icon: <Cpu className="w-5 h-5 text-blue-400" />,
    iconBg: "rgba(59, 130, 246, 0.15)"
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
            The right context. At the right moment.
          </h2>

          <p className="pipeline-lede">
            Trace how Radiance retrieves and activates your personal knowledge. A bounded, transparent pipeline that values determinism, user consent, and token efficiency over opaque autonomous agents.
          </p>
        </motion.div>

        {/* 4-Stage Pathway Grid */}
        <div className="pipeline-track" data-ui>
          {STAGES.map((stage, idx) => (
            <motion.div
              key={stage.key}
              className="pipeline-node"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: idx * 0.12, ease: motionEasing.entrance }}
            >
              <div className="flex items-center justify-between">
                <span className="pipeline-node-step">{stage.step}</span>
                <div 
                  className="pipeline-node-icon"
                  style={{ background: stage.iconBg }}
                >
                  {stage.icon}
                </div>
              </div>

              <h3 className="pipeline-node-title">{stage.title}</h3>
              <p className="pipeline-node-desc">{stage.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
