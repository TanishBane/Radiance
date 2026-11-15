"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { 
  Sliders, 
  Database, 
  Search, 
  MessageSquare, 
  CheckCircle2, 
  ArrowRight,
  ShieldCheck,
  FileText
} from "lucide-react";
import { motionEasing } from "@/lib/motion/presets";

interface StepDetail {
  id: string;
  label: string;
  rail: string;
  badgeColor: string;
  title: string;
  body: string;
  sample: string;
  icon: React.ComponentType<{ className?: string }>;
  tag: string;
}

const STEPS: StepDetail[] = [
  {
    id: "save",
    label: "Save a preference",
    rail: "Personal Intelligence",
    badgeColor: "var(--radiance-violet, #8b5cf6)",
    title: "You save a preference",
    body: "Demonstration data: “More concise” is recorded as a response preference. No automatic learning is taking place.",
    sample: "Preference · More concise",
    icon: Sliders,
    tag: "Explicit User Setting"
  },
  {
    id: "vault",
    label: "See it stored",
    rail: "Saved on this device",
    badgeColor: "var(--radiance-cyan, #06b6d4)",
    title: "The note appears in Settings",
    body: "Demonstration data: a project note sits beside the preference. You can edit or delete either item anytime.",
    sample: "Note · Thesis: keep citations inline",
    icon: Database,
    tag: "Local Browser Storage"
  },
  {
    id: "retrieve",
    label: "Ask later",
    rail: "Lexical retrieval",
    badgeColor: "var(--radiance-coral, #fb923c)",
    title: "A later question retrieves overlap",
    body: "Demonstration data: asking about the thesis outline matches the saved note. Unrelated notes are not attached.",
    sample: "Retrieved · Thesis: keep citations inline",
    icon: Search,
    tag: "Bounded Token Overlap"
  },
  {
    id: "reply",
    label: "See the shape",
    rail: "Reply preview",
    badgeColor: "var(--radiance-emerald, #10b981)",
    title: "The reply follows the preference",
    body: "Demonstration data: the preview is shorter because the concise preference is in effect, and only if sharing is enabled.",
    sample: "Here is a short outline with inline citations…",
    icon: MessageSquare,
    tag: "Form-Fitted Output"
  },
];

export function ProductPreview() {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const shouldReduceMotion = useReducedMotion();
  const IconComponent = current.icon;

  return (
    <section id="preview" className="landing-section landing-product-preview" aria-labelledby="preview-heading">
      <div className="landing-shell">
        <motion.div 
          className="landing-preview-intro"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: motionEasing.entrance }}
        >
          <div className="problem-eyebrow">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400" aria-hidden="true" />
            <span>Interactive Walkthrough</span>
          </div>
          <h2 id="preview-heading" className="landing-section-title">The current path</h2>
          <p className="landing-copy landing-preview-description">
            This sequence uses demonstration data. It is not connected to your Personal Intelligence vault.
          </p>
        </motion.div>

        <motion.div 
          className="landing-preview"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1, ease: motionEasing.entrance }}
        >
          {/* Navigation Toolbar */}
          <div className="landing-preview-toolbar">
            <div className="landing-preview-steps" role="group" aria-label="Walkthrough steps">
              {STEPS.map((item, index) => {
                const ItemIcon = item.icon;
                const isSelected = index === step;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={isSelected}
                    aria-controls="landing-preview-content"
                    onClick={() => setStep(index)}
                    className="touch-target"
                  >
                    <ItemIcon className="w-3.5 h-3.5 mr-1.5 inline-block opacity-75" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </div>
            <div className="landing-preview-meta">
              <span className="landing-preview-count">
                Step {step + 1} of {STEPS.length}
              </span>
              <span className="landing-demo-tag">Demonstration data</span>
            </div>
          </div>

          {/* Interactive Preview Body */}
          <div id="landing-preview-content" className="landing-preview-body" aria-live="polite">
            <aside className="landing-preview-rail">
              <div className="flex items-center gap-2 mb-3">
                <span
                  style={{
                    display: "inline-block",
                    width: "8px",
                    height: "8px",
                    borderRadius: "50%",
                    backgroundColor: current.badgeColor,
                  }}
                  aria-hidden="true"
                />
                <span className="font-semibold text-white text-xs uppercase tracking-wider">
                  {current.rail}
                </span>
              </div>
              <div className="text-xs text-slate-400 font-mono bg-white/[0.03] border border-white/5 rounded-lg p-2.5 mt-2">
                <div className="text-violet-300 font-medium mb-1 flex items-center gap-1.5">
                  <ShieldCheck className="w-3 h-3 text-violet-400" />
                  <span>Privacy Mode</span>
                </div>
                <div>{current.tag}</div>
              </div>
            </aside>

            <AnimatePresence mode="wait">
              <motion.div
                key={current.id}
                className="landing-preview-main"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -10 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.25, ease: motionEasing.entrance }}
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="p-1.5 rounded-md bg-white/5 border border-white/10 text-white">
                    <IconComponent className="w-4 h-4" />
                  </span>
                  <h3 className="m-0">
                    {current.title}
                  </h3>
                </div>

                <p className="landing-copy">
                  {current.body}
                </p>

                <div className="landing-preview-sample">
                  <span
                    className="landing-preview-sample-mark"
                    aria-hidden="true"
                    style={{ backgroundColor: current.badgeColor }}
                  />
                  <span className="font-mono text-sm text-slate-200">
                    {current.sample}
                  </span>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
