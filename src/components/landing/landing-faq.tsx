"use client";

import React, { useId, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { HelpCircle, ChevronDown, Sparkles } from "lucide-react";
import { motionEasing } from "@/lib/motion/presets";

const CATEGORIES = [
  { id: "all", label: "All Questions" },
  { id: "context", label: "Context & Memory" },
  { id: "privacy", label: "Privacy & Storage" },
  { id: "models", label: "Models & Workspace" },
] as const;

type CategoryId = (typeof CATEGORIES)[number]["id"];

interface FaqItem {
  q: string;
  a: string;
  category: CategoryId;
}

const QUESTIONS: readonly FaqItem[] = [
  {
    category: "all",
    q: "What is Radiance?",
    a: "Radiance is a personal intelligence AI workspace. You chat with a model you select, and you can attach notes and response preferences that you have saved on this device.",
  },
  {
    category: "context",
    q: "What is Personal Intelligence?",
    a: "It is the Settings section where you save notes, record how you want answers shaped, and choose whether retrieved context may be shared with the selected AI provider.",
  },
  {
    category: "context",
    q: "How does Radiance use saved context?",
    a: "When sharing is enabled, Radiance compares your new question with saved notes using bounded lexical matching. A small relevant subset, plus selected preference labels, can be included in the request. It does not send the full vault, IDs, or timestamps.",
  },
  {
    category: "context",
    q: "Can I control what Radiance remembers?",
    a: "Yes. Notes are saved only when you save them. You can edit, delete, export, or clear the profile. Radiance does not automatically extract memories from chat.",
  },
  {
    category: "privacy",
    q: "Does Radiance share my personal context with AI providers?",
    a: "Only if you enable sharing. Then relevant notes and preference labels are sent to the selected provider for that reply. If sharing is off, those notes stay in the browser.",
  },
  {
    category: "models",
    q: "Can I use Radiance with different AI models?",
    a: "Yes. The composer includes a model selector with the registered Radiance models, including Groq, Gemini, and OpenRouter options.",
  },
  {
    category: "context",
    q: "How is Radiance different from a conventional chatbot?",
    a: "A conventional chatbot starts from the prompt you type. Radiance can also bring in notes and preferences you have stored, under your control, so later conversations do not require restating the same context.",
  },
  {
    category: "privacy",
    q: "What privacy protections exist today?",
    a: "Sharing is opt-in, saves are explicit, and payloads are bounded. Storage is still plaintext browser storage without accounts, sync, or end-to-end encryption. Do not store secrets there.",
  },
  {
    category: "models",
    q: "How do I start chatting?",
    a: "Use Chat with Radiance in the navigation, the hero, or the final section. That opens the real Radiance chat at /chat.",
  },
] as const;

export function LandingFaq() {
  const baseId = useId();
  const shouldReduceMotion = useReducedMotion();
  const [open, setOpen] = useState<number | null>(0);
  const [activeCategory, setActiveCategory] = useState<CategoryId>("all");

  const filteredQuestions = QUESTIONS.map((item, originalIndex) => ({
    ...item,
    originalIndex,
  })).filter((item) => activeCategory === "all" || item.category === activeCategory || item.category === "all");

  return (
    <section id="faq" className="landing-section" aria-labelledby="faq-heading">
      <div className="landing-shell landing-faq">
        <div className="landing-faq-heading">
          <div className="landing-eyebrow inline-flex items-center gap-1.5 mb-3 text-xs tracking-wider uppercase font-mono text-purple-400">
            <HelpCircle className="h-3.5 w-3.5" aria-hidden="true" />
            <span>08 / Frequently Asked Questions</span>
          </div>
          <h2 id="faq-heading" className="landing-section-title">
            Questions, answered.
          </h2>
          <p className="landing-copy text-slate-400 text-sm mt-3 leading-relaxed">
            Direct, technical answers about local storage, keyword-driven context retrieval, and model integrations.
          </p>

          <div className="landing-faq-categories flex flex-wrap gap-1.5 mt-6" role="tablist" aria-label="FAQ categories">
            {CATEGORIES.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  onClick={() => {
                    setActiveCategory(cat.id);
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-mono transition-all duration-200 ${
                    isSelected
                      ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                      : "bg-white/[0.03] text-slate-400 border border-white/5 hover:text-slate-200 hover:bg-white/[0.06]"
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="landing-faq-list" role="region" aria-label="Accordion items">
          {filteredQuestions.map((item) => {
            const index = item.originalIndex;
            const panelId = `${baseId}-panel-${index}`;
            const buttonId = `${baseId}-button-${index}`;
            const isOpen = open === index;

            return (
              <div
                key={item.q}
                className="landing-faq-item"
                data-open={isOpen}
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : index)}
                    className="group"
                  >
                    <span className="landing-faq-question-text">{item.q}</span>
                    <span 
                      aria-hidden="true" 
                      className={`landing-faq-icon transition-transform duration-200 ${
                        isOpen ? "rotate-180 text-purple-400" : "text-slate-400 group-hover:text-slate-200"
                      }`}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </span>
                  </button>
                </h3>
                <div 
                  id={panelId} 
                  role="region" 
                  aria-labelledby={buttonId} 
                  hidden={!isOpen}
                  className="landing-faq-panel"
                >
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={shouldReduceMotion ? undefined : { opacity: 0, y: -4 }}
                        transition={{ duration: 0.2, ease: motionEasing.entrance }}
                      >
                        <p>{item.a}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
