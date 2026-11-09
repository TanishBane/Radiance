"use client";

import React from "react";
import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { HeroProductStage } from "./hero-product-stage";
import { IntelligenceField } from "./intelligence-field";
import { LandingCta } from "./landing-cta";
import "./hero-landscape.css";

export function HeroLandscape() {
  return (
    <section 
      className="hero-landscape-section section-atmosphere-hero landing-hero"
      aria-labelledby="hero-display-heading"
    >
      <div className="hero-landscape-shell">
        {/* Centered Narrative Copy */}
        <motion.div 
          className="hero-narrative-block"
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="hero-eyebrow-badge">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Personal Intelligence, Reimagined</span>
          </div>

          <h1 id="hero-display-heading" className="hero-narrative-title landing-display">
            AI that brings your <em>context</em> forward.
          </h1>

          <p className="hero-narrative-lede landing-lede">
            Bring your saved context and preferences into your AI experience. Radiance helps make meaningful conversations more personal, useful, and consistent.
          </p>

          <div className="hero-actions-row landing-hero-actions">
            <LandingCta href="/chat" size="lg" className="hero-btn-primary">
              Chat with Radiance <span aria-hidden="true">↗</span>
            </LandingCta>

            <LandingCta href="#intelligence" variant="ghost" size="lg" className="hero-btn-secondary landing-cta-ghost">
              Explore Personal Intelligence <span aria-hidden="true">↓</span>
            </LandingCta>
          </div>

          <p className="landing-hero-proof hero-trust-row" aria-label="Saved context preview">
            <span>Saved note · Keep citations inline</span>
            <span>More concise</span>
          </p>
        </motion.div>

        {/* Central Luminous Product Stage (Full-width, perfectly centered) */}
        <motion.div
          className="hero-stage-wrapper"
          style={{ width: "100%", maxWidth: "980px" }}
          initial={{ opacity: 0, scale: 0.97, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
        >
          <HeroProductStage />
        </motion.div>

        {/* Live Interactive Context Proof (Centered below product stage) */}
        <motion.div
          className="hero-field-wrapper"
          style={{ width: "100%", maxWidth: "980px", marginTop: "3.5rem" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <IntelligenceField />
        </motion.div>
      </div>
    </section>
  );
}
