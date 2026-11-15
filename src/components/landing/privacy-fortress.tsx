"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { ShieldCheck, HardDrive, Share2, RotateCcw } from "lucide-react";
import { motionEasing } from "@/lib/motion/presets";
import "./privacy-and-vision.css";

const PRIVACY_PILLARS = [
  {
    id: "p-1",
    icon: HardDrive,
    badge: "TRANSPARENT LOCAL",
    title: "Browser-Local Plaintext Storage",
    desc: "Notes and response preferences are kept in plaintext browser storage on this profile. They are not account-isolated or synchronized across devices.",
    metric: "Client-only • Unencrypted",
  },
  {
    id: "p-2",
    icon: Share2,
    badge: "ZERO SURPRISES",
    title: "Opt-In Provider Sharing",
    desc: "Relevant notes and selected preference labels are sent to the selected AI provider only when you enable sharing.",
    metric: "Strict permission check",
  },
  {
    id: "p-3",
    icon: RotateCcw,
    badge: "INSTANT PURGE",
    title: "One-Click Context Reset",
    desc: "You can edit, export, or delete saved notes and preferences from Radiance settings at any time with a single click.",
    metric: "Full user governance",
  },
];

export function PrivacyFortress() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section 
      id="privacy"
      className="privacy-section-container section-atmosphere-privacy"
      aria-labelledby="privacy-heading"
    >
      <div className="privacy-shell">
        <motion.div 
          className="privacy-header"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: motionEasing.entrance }}
        >
          <div className="privacy-eyebrow">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
            <span>06 / Honest Architecture & Trust</span>
          </div>

          <h2 id="privacy-heading" className="privacy-title">
            Your context. Your choice.
          </h2>

          <p className="privacy-lede">
            Saved context stays under your control. Here is where it is stored and what happens when you choose to share it:
          </p>

          <div className="privacy-link-wrapper">
            <a 
              href="/privacy" 
              className="privacy-link"
            >
              <span>Read the current privacy model</span>
              <span aria-hidden="true" className="privacy-link-arrow">↗</span>
            </a>
          </div>
        </motion.div>

        <ul className="privacy-truth-grid">
          {PRIVACY_PILLARS.map((item, idx) => {
            const Icon = item.icon;
            return (
              <motion.li
                key={item.id}
                className="privacy-card"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: idx * 0.12, ease: motionEasing.entrance }}
              >
                <div className="privacy-card-header">
                  <div className="privacy-card-icon" aria-hidden="true">
                    <Icon className="h-5 w-5" />
                  </div>
                  <span className="privacy-card-badge">{item.badge}</span>
                </div>

                <h3 className="privacy-card-title">{item.title}</h3>
                <p className="privacy-card-desc">{item.desc}</p>

                <div className="privacy-card-footer">
                  <span className="privacy-card-metric">{item.metric}</span>
                </div>
              </motion.li>
            );
          })}
        </ul>

        {/* Technical Disclaimer Box */}
        <div className="privacy-boundary-box">
          <div className="privacy-boundary-icon" aria-hidden="true">
            <ShieldCheck className="h-5 w-5 text-emerald-400" />
          </div>
          <p className="privacy-boundary">
            Storage is not end-to-end encrypted. Do not save secrets here. Provider data handling follows the selected provider&apos;s API privacy terms.
          </p>
        </div>
      </div>
    </section>
  );
}
