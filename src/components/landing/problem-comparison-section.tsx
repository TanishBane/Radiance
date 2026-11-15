"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { 
  XCircle, 
  CheckCircle2, 
  RotateCcw, 
  Database
} from "lucide-react";
import { motionEasing } from "@/lib/motion/presets";
import "./problem-comparison.css";

export function ProblemComparisonSection() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section 
      id="problem"
      className="problem-section section-atmosphere-problem"
      aria-labelledby="problem-heading"
    >
      <div className="problem-shell">
        <motion.div 
          className="problem-header"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: motionEasing.entrance }}
        >
          <h2 id="problem-heading" className="problem-title">
            Keep the context you chose.
          </h2>

          <p className="problem-lede">
            A new conversation may not include the details from your last one. Radiance lets you save notes and response preferences, then choose whether relevant context is shared with your selected model.
          </p>
        </motion.div>

        {/* Side-by-Side Comparison */}
        <div className="problem-comparison-grid" data-ui>
          {/* Left: Without Saved Context */}
          <motion.div 
            className="problem-panel problem-panel-generic"
            initial={shouldReduceMotion ? false : { opacity: 0, x: -24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: motionEasing.entrance }}
          >
            <div className="problem-panel-header">
              <span className="font-semibold text-slate-200">Without Saved Context</span>
              <span className="problem-badge-state problem-badge-red">
                <XCircle className="w-3.5 h-3.5" />
                <span>Context may need repeating</span>
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
            initial={shouldReduceMotion ? false : { opacity: 0, x: 24 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: motionEasing.entrance }}
          >
            <div className="problem-panel-header">
              <span className="font-semibold text-white flex items-center gap-2">
                <span>With Radiance Personal Intelligence</span>
              </span>
              <span className="problem-badge-state problem-badge-cyan">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>When sharing is enabled</span>
              </span>
            </div>

            <div className="problem-active-context-bar">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              <span>Example saved notes and response preferences</span>
            </div>

            <div className="problem-dialogue-flow">
              <div className="problem-bubble-user">
                &ldquo;Outline the session state machine for the new auth workflow.&rdquo;
              </div>

              <div className="problem-bubble-ai">
                &ldquo;Here is the discriminated union state model. Strictly typed, zero `any`, inline transitions:&rdquo;
                <div className="mt-2 p-2 rounded bg-black/40 font-mono text-xs text-cyan-300">
                  type AuthState = &#123; status: &apos;idle&apos; &#125; | &#123; status: &apos;authenticating&apos;; token: string &#125;;
                </div>
              </div>
            </div>

            <div className="problem-panel-footer">
              <span>Relevant saved context is included only when sharing is on.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
