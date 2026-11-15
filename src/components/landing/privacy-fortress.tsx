"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { motionEasing } from "@/lib/motion/presets";
import "./privacy-and-vision.css";

const PRIVACY_PILLARS = [
  {
    id: "p-1",
    title: "Stored on this device",
    desc: "Notes and response preferences are kept in plaintext browser storage on this profile. They are not account-isolated or synchronized across devices."
  },
  {
    id: "p-2",
    title: "Sharing is your choice",
    desc: "Relevant notes and selected preference labels are sent to the selected AI provider only when you enable sharing."
  },
  {
    id: "p-3",
    title: "Manage your saved context",
    desc: "You can edit, export, or delete saved notes and preferences from Radiance settings."
  }
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
          <h2 id="privacy-heading" className="privacy-title">
            Your context. Your choice.
          </h2>

          <p className="privacy-lede">
            Saved context stays under your control. Here is where it is stored and what happens when you choose to share it:
          </p>
          <div className="mt-4">
            <a 
              href="/privacy" 
              className="privacy-link"
            >
              <span>Read the current privacy model</span>
              <span aria-hidden="true">↗</span>
            </a>
          </div>
        </motion.div>

        <ul className="privacy-truth-grid">
          {PRIVACY_PILLARS.map((item, idx) => (
            <motion.li
              key={item.id}
              className="privacy-card"
              initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, delay: idx * 0.12, ease: motionEasing.entrance }}
            >
              <h3 className="privacy-card-title">{item.title}</h3>
              <p className="privacy-card-desc">{item.desc}</p>
            </motion.li>
          ))}
        </ul>

        {/* Technical Disclaimer Box */}
        <p className="privacy-boundary">
          Storage is not end-to-end encrypted. Do not save secrets here. Provider data handling follows the selected provider&apos;s API privacy terms.
        </p>
      </div>
    </section>
  );
}
