"use client";

import React from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Sparkles, Shield, RotateCcw } from "lucide-react";
import { motionEasing } from "@/lib/motion/presets";

export function ImmersiveFinalCta() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section
      id="start"
      className="section-atmosphere-final landing-section landing-finale landing-conversion relative overflow-hidden"
      aria-labelledby="final-cta-heading"
    >
      {/* Immersive ambient luminous glow backdrop */}
      <div 
        className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute w-[640px] h-[340px] rounded-full bg-gradient-to-r from-purple-600/25 via-pink-600/20 to-amber-500/15 blur-[90px] transform -translate-y-6" />
        <div className="absolute w-[360px] h-[360px] rounded-full border border-purple-500/15 opacity-40 animate-pulse" />
      </div>

      <motion.div
        className="landing-shell landing-finale-inner landing-conversion-inner relative z-10 flex flex-col items-center text-center max-w-4xl mx-auto px-4"
        initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: motionEasing.entrance }}
      >
        <div className="landing-eyebrow inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-300 text-xs font-mono uppercase tracking-widest mb-6">
          <Sparkles className="h-3.5 w-3.5 text-purple-300" aria-hidden="true" />
          <span>09 / Ready When You Are</span>
        </div>

        <div className="landing-finale-copy max-w-2xl">
          <h2 
            id="final-cta-heading"
            className="landing-section-title text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-5 text-balance"
          >
            Your next conversation can feel different.
          </h2>
          <p className="landing-copy text-lg text-slate-300 leading-relaxed max-w-xl mx-auto mb-8 text-balance">
            Bring your context forward. Notes you store and preferences you set stay in this browser, shared with models only when you turn sharing on.
          </p>
        </div>

        <div className="landing-hero-actions landing-conversion-actions flex flex-col sm:flex-row items-center gap-4 mb-8">
          <motion.div
            whileHover={shouldReduceMotion ? undefined : { scale: 1.03, y: -2 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <Link 
              href="/chat" 
              className="landing-cta landing-cta-lg landing-final-cta group inline-flex items-center gap-2.5 px-8 py-4 rounded-full text-base font-semibold text-white bg-gradient-to-r from-orange-600 via-pink-600 to-purple-600 hover:from-orange-500 hover:via-pink-500 hover:to-purple-500 shadow-lg shadow-pink-500/25 transition-all duration-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-400"
            >
              <span>Chat with Radiance</span>
              <ArrowRight 
                aria-hidden="true" 
                className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-1" 
              />
            </Link>
          </motion.div>
        </div>

        {/* Reassuring trust micro-badges */}
        <div className="flex flex-wrap items-center justify-center gap-6 pt-4 border-t border-white/10 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-1.5">
            <Shield className="h-3.5 w-3.5 text-emerald-400" aria-hidden="true" />
            <span>Browser-local storage</span>
          </div>
          <span className="text-white/20" aria-hidden="true">•</span>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
            <span>Opt-in model sharing</span>
          </div>
          <span className="text-white/20" aria-hidden="true">•</span>
          <div className="flex items-center gap-1.5">
            <RotateCcw className="h-3.5 w-3.5 text-purple-400" aria-hidden="true" />
            <span>One-click reset</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
