"use client";

import React from "react";
import { motion } from "motion/react";
import { 
  ShieldCheck, 
  HardDrive, 
  Share2, 
  Trash2, 
  Lock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import "./privacy-and-vision.css";

const PRIVACY_PILLARS = [
  {
    id: "p-1",
    title: "Browser-Local Plaintext Storage",
    desc: "Your Personal Intelligence notes and response preferences live strictly in your client's localStorage. There is zero background cloud profile synchronization.",
    icon: <HardDrive className="w-5 h-5 text-emerald-400" />
  },
  {
    id: "p-2",
    title: "Opt-In Provider Sharing",
    desc: "When interacting with external AI inference APIs (Groq, Gemini, OpenRouter), context transmission is disabled by default. You explicitly decide what gets shared.",
    icon: <Share2 className="w-5 h-5 text-teal-400" />
  },
  {
    id: "p-3",
    title: "One-Click Context Reset",
    desc: "Export your notes to portable JSON or permanently wipe your local memory profile in a single click from the Settings Center with zero residual trace.",
    icon: <Trash2 className="w-5 h-5 text-mint-400" />
  }
];

export function PrivacyFortress() {
  return (
    <section 
      id="privacy"
      className="privacy-section-container section-atmosphere-privacy"
      aria-labelledby="privacy-heading"
    >
      <div className="privacy-shell">
        <motion.div 
          className="privacy-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <div className="privacy-eyebrow">
            <Lock className="w-3.5 h-3.5 text-emerald-400" />
            <span>Honest Engineering &amp; Data Control</span>
          </div>

          <h2 id="privacy-heading" className="privacy-title">
            Your context. Your choice.
          </h2>

          <p className="privacy-lede">
            We reject deceptive privacy marketing. We don&apos;t make unsupported claims about zero-knowledge encryption where it doesn&apos;t exist. Here is the exact truth of Radiance&apos;s data boundaries:
          </p>
          <div className="mt-4">
            <a 
              href="/privacy" 
              className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
            >
              <span>Read the current privacy model</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </motion.div>

        {/* 3-Card Truth Grid */}
        <div className="privacy-truth-grid">
          {PRIVACY_PILLARS.map((item, idx) => (
            <motion.div
              key={item.id}
              className="privacy-card"
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
            >
              <div className="privacy-card-icon">
                {item.icon}
              </div>
              <h3 className="privacy-card-title">{item.title}</h3>
              <p className="privacy-card-desc">{item.desc}</p>
            </motion.div>
          ))}
        </div>

        {/* Technical Disclaimer Box */}
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/20 text-xs text-emerald-200/90 flex items-start gap-3">
          <AlertCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <p className="m-0 leading-relaxed">
            <strong>Technical MVP Boundary:</strong> Profile data is preserved in browser-local storage without account isolation or end-to-end encryption. Context sent to external model providers is governed by their respective API privacy policies.
          </p>
        </div>
      </div>
    </section>
  );
}
