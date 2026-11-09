"use client";

import React from "react";
import { motion } from "motion/react";
import { 
  XCircle, 
  CheckCircle2, 
  Sparkles, 
  RotateCcw, 
  Zap, 
  ArrowRight,
  Database
} from "lucide-react";
import "./problem-comparison.css";

export function ProblemComparisonSection() {
  return (
    <section 
      id="problem"
      className="problem-section section-atmosphere-problem"
      aria-labelledby="problem-heading"
    >
      <div className="problem-shell">
        <motion.div 
          className="problem-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 id="problem-heading" className="problem-title">
            Your context shouldn&apos;t disappear between conversations.
          </h2>

          <p className="problem-lede">
            Traditional AI models reset every session. You repeat your role, your formatting constraints, and your preferences again and again. Radiance remembers your explicit guidance so you can focus on building.
          </p>
        </motion.div>

        {/* Side-by-Side Comparison */}
        <div className="problem-comparison-grid" data-ui>
          {/* Left: Without Saved Context */}
          <motion.div 
            className="problem-panel problem-panel-generic"
            initial={{ opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="problem-panel-header">
              <span className="font-semibold text-slate-200">Without Saved Context</span>
              <span className="problem-badge-state problem-badge-red">
                <XCircle className="w-3.5 h-3.5" />
                <span>Starts from zero every session</span>
              </span>
            </div>

            <div className="problem-dialogue-flow">
              <div className="problem-bubble-user">
                &ldquo;Remember, I&apos;m writing a technical spec in TypeScript. Keep types strictly declared and don&apos;t use `any`. Also keep explanations brief.&rdquo;
              </div>

              <div className="problem-bubble-ai">
                &ldquo;Understood! Here is a general boilerplate tutorial on TypeScript interfaces with 12 paragraphs of introductory background...&rdquo;
              </div>
            </div>

            <div className="problem-panel-footer text-rose-300/80">
              <RotateCcw className="w-4 h-4 text-rose-400" />
              <span>User is forced to repeatedly re-declare constraints and filter fluff.</span>
            </div>
          </motion.div>

          {/* Right: With Radiance Personal Intelligence */}
          <motion.div 
            className="problem-panel problem-panel-radiance"
            initial={{ opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
          >
            <div className="problem-panel-header">
              <span className="font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>With Radiance Personal Intelligence</span>
              </span>
              <span className="problem-badge-state problem-badge-cyan">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Context brought forward automatically</span>
              </span>
            </div>

            <div className="problem-active-context-bar">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Saved notes and preferences active: Strict TypeScript · Concise Output</span>
            </div>

            <div className="problem-dialogue-flow">
              <div className="problem-bubble-user" style={{ background: "rgba(6, 182, 212, 0.15)", borderColor: "rgba(6, 182, 212, 0.3)" }}>
                &ldquo;Outline the session state machine for the new auth workflow.&rdquo;
              </div>

              <div className="problem-bubble-ai" style={{ background: "rgba(10, 22, 42, 0.8)", borderColor: "rgba(6, 182, 212, 0.2)" }}>
                &ldquo;Here is the discriminated union state model. Strictly typed, zero `any`, inline transitions:&rdquo;
                <div className="mt-2 p-2 rounded bg-black/40 font-mono text-xs text-cyan-300">
                  type AuthState = &#123; status: &apos;idle&apos; &#125; | &#123; status: &apos;authenticating&apos;; token: string &#125;;
                </div>
              </div>
            </div>

            <div className="problem-panel-footer text-cyan-300/90">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Instant relevance without prompting overhead or redundant instructions.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
