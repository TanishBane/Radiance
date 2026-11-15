"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { motionEasing } from "@/lib/motion/presets";

export function ImmersiveFinalCta() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="start"
      className="section-atmosphere-final landing-section landing-finale landing-conversion"
      aria-labelledby="final-cta-heading"
    >
      <motion.div
        className="landing-shell landing-finale-inner"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: motionEasing.entrance }}
      >
        <div className="landing-finale-copy">
          <h2 id="final-cta-heading">Continue with the context you chose.</h2>
          <p>Start a real conversation with Radiance. Your saved context is shared only when you enable it.</p>
        </div>
        <Link href="/chat" className="landing-final-link">
          <span>Chat with Radiance</span>
          <ArrowUpRight aria-hidden="true" className="h-5 w-5" />
        </Link>
      </motion.div>
    </section>
  );
}
