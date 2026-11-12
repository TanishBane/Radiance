"use client";

import React from "react";
import { motion, useReducedMotion } from "motion/react";
import { ArrowUpRight } from "lucide-react";
import { motionEasing } from "@/lib/motion/presets";
import VoxelWallScene from "@/components/ui/voxel-wall";
import "./landing-atmosphere.css";

export function ImmersiveFinalCta() {
  const shouldReduceMotion = useReducedMotion();

  return (
    <section 
      id="start"
      className="section-atmosphere-final landing-section landing-finale landing-conversion py-28 sm:py-36 px-6 text-center relative overflow-hidden"
      aria-labelledby="final-cta-heading"
    >
      {/* 3D Voxel Wall Interactive Background */}
      <div 
        className="absolute inset-0 w-full h-full pointer-events-none z-0 overflow-hidden"
        aria-hidden="true"
      >
        <VoxelWallScene className="w-full h-full" height="100%" />
        {/* Soft radial vignette so typography remains crisp & legible */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/60 pointer-events-none" />
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center relative z-10">
        {/* Luminous Logo Badge */}
        <motion.div
          className="mb-8"
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.5, ease: motionEasing.entrance }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 to-violet-500/20 border border-cyan-400/40 shadow-[0_0_32px_rgba(6,182,212,0.3)] flex items-center justify-center backdrop-blur-sm">
            <span className="font-sans font-extrabold text-2xl bg-gradient-to-br from-cyan-300 via-white to-violet-400 bg-clip-text text-transparent">
              R
            </span>
          </div>
        </motion.div>

        <motion.h2 
          id="final-cta-heading" 
          className="font-sans text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-6 drop-shadow-md"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: motionEasing.entrance }}
        >
          Your next conversation can feel different.
        </motion.h2>

        <motion.p 
          className="text-lg sm:text-xl text-slate-300 max-w-2xl mb-10 leading-relaxed drop-shadow-sm"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1, ease: motionEasing.entrance }}
        >
          Bring your context. Shape your experience. Meet Radiance.
        </motion.p>

        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.2, ease: motionEasing.entrance }}
        >
          <a
            href="/chat"
            className="landing-cta landing-cta-lg landing-final-cta inline-flex items-center gap-2.5 px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 via-blue-600 to-violet-600 text-white font-semibold text-lg shadow-[0_4px_32px_rgba(6,182,212,0.4)] hover:shadow-[0_8px_40px_rgba(6,182,212,0.6)] hover:-translate-y-0.5 transition-all duration-200"
          >
            <span>Start a conversation with Radiance</span>
            <ArrowUpRight className="w-5 h-5" />
          </a>
        </motion.div>

        <p className="mt-6 text-sm text-slate-400 drop-shadow-sm">
          Plaintext local storage · Context sharing starts disabled · Direct LLM reasoning
        </p>
      </div>
    </section>
  );
}
