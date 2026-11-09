"use client";

import React, { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Sparkles, Globe, ArrowUpRight } from "lucide-react";
import { FlutedGlassTorus } from "./fluted-glass-torus";
import { HeroProductStage } from "./hero-product-stage";
import { IntelligenceField } from "./intelligence-field";
import { LandingCta } from "./landing-cta";
import "./hero-landscape.css";

export function HeroLandscape() {
  const [currentTime, setCurrentTime] = useState("07:23:14 AM");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: true,
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section 
      className="hero-landscape-section section-atmosphere-hero landing-hero"
      aria-labelledby="hero-display-heading"
    >
      <div className="hero-landscape-shell">
        {/* Top Hero Split Showcase (Synasite & Retreats Editorial Grid) */}
        <div className="hero-showcase-grid">
          {/* Left Column: Editorial Typography & High-Craft CTAs */}
          <motion.div 
            className="hero-editorial-column"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 id="hero-display-heading" className="hero-narrative-title landing-display">
              AI that brings your{" "}
              <em className="hero-serif-accent">context forward.</em>
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

          {/* Right Column: Fluted Glass Slit-Scan Prism & Aurora Torus (Synasite Reference) */}
          <motion.div
            className="hero-visual-column"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          >
            <FlutedGlassTorus />
          </motion.div>
        </div>

        {/* Live Telemetry Status Dock (Synasite Reference) */}
        <motion.div 
          className="hero-telemetry-dock"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          aria-label="Live engine telemetry"
        >
          <div className="telemetry-node">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="telemetry-label">Local-First · Client Private</span>
          </div>

          <div className="telemetry-node telemetry-clock-node">
            <span className="telemetry-clock-value" aria-label="Live timestamp">{currentTime}</span>
          </div>

          <div className="telemetry-node telemetry-ethos-node">
            <span className="telemetry-ethos-title">A Simple Idea.</span>
            <span className="telemetry-sub">00.18s TTFT · Plaintext Engine</span>
          </div>

          <div className="telemetry-node telemetry-action-node">
            <a href="/chat" className="telemetry-action-link">
              <span>Let&apos;s Work Together</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </motion.div>

        {/* Central Luminous Product Stage (Full-width interactive experience) */}
        <motion.div
          className="hero-stage-wrapper"
          style={{ width: "100%", maxWidth: "980px", marginTop: "3.5rem" }}
          initial={{ opacity: 0, scale: 0.97, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <HeroProductStage />
        </motion.div>

        {/* Live Interactive Context Proof (Centered below product stage) */}
        <motion.div
          className="hero-field-wrapper"
          style={{ width: "100%", maxWidth: "980px", marginTop: "3.5rem" }}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <IntelligenceField />
        </motion.div>
      </div>
    </section>
  );
}
