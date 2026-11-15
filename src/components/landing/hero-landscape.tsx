"use client";

import React, { useState, useEffect, memo } from "react";
import { AnimatePresence, motion, useReducedMotion, type Variants } from "motion/react";
import { Globe, ArrowUpRight } from "lucide-react";
import { HeroProductStage } from "./hero-product-stage";
import { HoverActionButton } from "@/components/ui/hover-button-1";
import { ShinyButton } from "@/components/ui/shiny-button";
import { motionEasing } from "@/lib/motion/presets";
import "./hero-landscape.css";

const heroHeadlineWords = ["context", "preferences", "notes"] as const;

// Variants for headline character reveal
const wordContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.042,
      delayChildren: 0.06,
    },
  },
  exit: {
    opacity: 0,
    y: "-0.28em",
    filter: "blur(3px)",
    transition: {
      duration: 0.22,
      ease: motionEasing.standard,
    },
  },
};

const charVariants: Variants = {
  hidden: {
    opacity: 0,
    y: "0.24em",
    filter: "blur(3px)",
  },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.24,
      ease: motionEasing.entrance,
    },
  },
};

// Coordinated entrance animation variants for top showcase
const showcaseContainerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.11,
      delayChildren: 0.04,
    },
  },
};

const showcaseItemVariants: Variants = {
  hidden: { opacity: 0, y: 22, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.62,
      ease: motionEasing.entrance,
    },
  },
};

const HeroLiveClock = memo(function HeroLiveClock() {
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
    <span className="telemetry-clock-value" aria-label="Live timestamp">
      {currentTime}
    </span>
  );
});

export function HeroLandscape() {
  const shouldReduceMotion = useReducedMotion();
  const [headlineWordIndex, setHeadlineWordIndex] = useState(0);

  useEffect(() => {
    if (shouldReduceMotion) return;

    const interval = setInterval(() => {
      setHeadlineWordIndex((index) => (index + 1) % heroHeadlineWords.length);
    }, 4400);

    return () => clearInterval(interval);
  }, [shouldReduceMotion]);

  const currentWord = heroHeadlineWords[headlineWordIndex];

  return (
    <section 
      id="hero"
      className="hero-landscape-section section-atmosphere-hero landing-hero"
      aria-labelledby="hero-display-heading"
    >
      <div className="hero-landscape-shell">
        {/* Top Hero Centered Showcase */}
        <div className="hero-center-showcase">
          {/* Editorial Typography & High-Craft CTAs with coordinated entrance reveals */}
          <motion.div 
            className="hero-editorial-column hero-editorial-center"
            variants={shouldReduceMotion ? undefined : showcaseContainerVariants}
            initial={shouldReduceMotion ? false : "hidden"}
            animate="visible"
          >
            <motion.h1
              id="hero-display-heading"
              className="hero-narrative-title landing-display"
              aria-label="AI that brings your context forward."
              variants={shouldReduceMotion ? undefined : showcaseItemVariants}
            >
              <span className="sr-only">AI that brings your context, preferences, and notes forward.</span>
              <span aria-hidden="true">
                AI that brings your{" "}
                <em className="hero-serif-accent">
                  <span className="hero-serif-accent-rotator">
                    {/* Layout-stability anchor: reserves exact width/height of the longest keyword */}
                    <span className="hero-serif-accent-measure">
                      preferences
                      <span className="hero-typing-caret" style={{ opacity: 0 }} />
                    </span>

                    {shouldReduceMotion ? (
                      <span className="hero-serif-accent-word">
                        {heroHeadlineWords[0]}
                      </span>
                    ) : (
                      <AnimatePresence initial={false} mode="wait">
                        <motion.span
                          key={currentWord}
                          className="hero-serif-accent-word"
                          variants={wordContainerVariants}
                          initial="hidden"
                          animate="visible"
                          exit="exit"
                        >
                          {currentWord.split("").map((char, index) => (
                            <motion.span
                              key={`${currentWord}-${index}-${char}`}
                              variants={charVariants}
                              className="hero-serif-accent-char"
                            >
                              {char}
                            </motion.span>
                          ))}
                          <span className="hero-typing-caret" />
                        </motion.span>
                      </AnimatePresence>
                    )}
                  </span>{" "}
                  forward.
                </em>
              </span>
            </motion.h1>

            <motion.p 
              className="hero-narrative-lede landing-lede"
              variants={shouldReduceMotion ? undefined : showcaseItemVariants}
            >
              Bring your saved context and preferences into your AI experience. Radiance helps make meaningful conversations more personal, useful, and consistent.
            </motion.p>

            <motion.div 
              className="hero-actions-row landing-hero-actions"
              variants={shouldReduceMotion ? undefined : showcaseItemVariants}
            >
              <ShinyButton href="/chat" className="hero-btn-primary">
                Chat with Radiance <ArrowUpRight className="inline w-4 h-4 ml-1 -mt-0.5" />
              </ShinyButton>

              <HoverActionButton
                href="#intelligence"
                label="Explore Personal Intelligence"
                className="hero-btn-secondary"
              />
            </motion.div>

            <motion.p 
              className="landing-hero-proof hero-trust-row" 
              aria-label="Saved context preview"
              variants={shouldReduceMotion ? undefined : showcaseItemVariants}
            >
              <span>Saved note · Keep citations inline</span>
              <span>More concise</span>
            </motion.p>
          </motion.div>
        </div>

        {/* Live Telemetry Status Dock (Synasite Reference) */}
        <motion.div 
          className="hero-telemetry-dock"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.65, delay: 0.36, ease: motionEasing.entrance }}
          aria-label="Live engine telemetry"
        >
          <div className="telemetry-node">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="telemetry-label">Local-First · Client Private</span>
          </div>

          <div className="telemetry-node telemetry-clock-node">
            <HeroLiveClock />
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
          initial={shouldReduceMotion ? false : { opacity: 0, scale: 0.97, y: 32 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.72, delay: 0.46, ease: motionEasing.entrance }}
        >
          <HeroProductStage />
        </motion.div>
      </div>
    </section>
  );
}
