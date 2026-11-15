"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { 
  XCircle, 
  CheckCircle2, 
  RotateCcw, 
  Database,
  Sparkles,
  ArrowRight
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
          <div className="problem-eyebrow">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-400" aria-hidden="true" />
            <span>Section 02 · Context Continuity</span>
          </div>

          <h2 id="problem-heading" className="problem-title">
            Your context shouldn&apos;t disappear between conversations.
          </h2>

          <p className="problem-lede">
            A new conversation shouldn&apos;t mean re-explaining your stack and constraints from zero. Radiance preserves your selected notes and response style locally, automatically assembling relevant context when sharing is enabled.
          </p>
        </motion.div>

        {/* Side-by-Side Comparison */}
        <div className="problem-comparison-grid" data-ui>
          {/* Left: Without Saved Context */}
          <motion.div 
            className="problem-panel problem-panel-generic"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: motionEasing.entrance }}
            whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
          >
            <div className="problem-panel-header">
              <span className="font-semibold text-slate-200">Without Saved Context</span>
              <span className="problem-badge-state problem-badge-red">
                <XCircle className="w-3.5 h-3.5 shrink-0" />
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

              <div className="problem-annotation-badge problem-annotation-rose">
                <span>Repeated manual overhead · Session resets on page reload</span>
              </div>
            </div>

            <div className="problem-panel-footer text-rose-300/80">
              <RotateCcw className="w-4 h-4 text-rose-400 shrink-0" />
              <span>User is forced to repeatedly re-declare constraints and filter fluff.</span>
            </div>
          </motion.div>

          {/* Right: With Radiance Personal Intelligence */}
          <motion.div 
            className="problem-panel problem-panel-radiance"
            initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1, ease: motionEasing.entrance }}
            whileHover={shouldReduceMotion ? undefined : { y: -4, transition: { duration: 0.2 } }}
          >
            <div className="problem-panel-header">
              <span className="font-semibold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-violet-400" />
                <span>With Radiance Personal Intelligence</span>
              </span>
              <span className="problem-badge-state problem-badge-cyan">
                <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                <span>Context brought forward automatically</span>
              </span>
            </div>

            <div className="problem-active-context-bar">
              <Database className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Saved notes and preferences active</span>
              <span className="problem-active-pill ml-auto">Opt-in Lexical Match</span>
            </div>

            <div className="problem-dialogue-flow">
              <div className="problem-bubble-user">
                &ldquo;Outline the session state machine for the new auth workflow.&rdquo;
              </div>

              <div className="problem-bubble-ai">
                &ldquo;Here is the discriminated union state model. Strictly typed, zero `any`, inline transitions:&rdquo;
                <div className="mt-2.5 p-2.5 rounded-lg bg-black/50 border border-violet-500/20 font-mono text-xs text-cyan-300 overflow-x-auto">
                  type AuthState = &#123; status: &apos;idle&apos; &#125; | &#123; status: &apos;authenticating&apos;; token: string &#125;;
                </div>
              </div>
            </div>

            <div className="problem-panel-footer">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>Relevant saved context is included only when sharing is on.</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
