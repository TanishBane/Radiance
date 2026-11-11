"use client";

import React, { useEffect } from "react";
import "./landing.css";
import "./landing-hero.css";
import "./landing-story.css";
import "./landing-conversion.css";
import "./landing-hero-redesign.css";
import "./landing-middle-redesign.css";
import "./landing-closing-redesign.css";
import "./landing-redesign.css";
import "./landing-atmosphere.css";
import "./hero-landscape.css";
import "./problem-comparison.css";
import "./personal-intelligence-story.css";
import "./context-pipeline.css";
import "./privacy-and-vision.css";
import "./ascend-planet-landing.css";

import { WebGLStarfield } from "./webgl-starfield";
import { DynamicThemeIndicator } from "./dynamic-theme-indicator";
import { LandingNav } from "./landing-nav";
import { AscendHero } from "./ascend-hero";
import { AscendFeatures } from "./ascend-features";
import { AscendShowcase } from "./ascend-showcase";
import { AscendCta } from "./ascend-cta";
import { ProblemComparisonSection } from "./problem-comparison-section";
import { ProductIntroduction } from "./product-introduction";
import { ProductPreview } from "./product-preview";
import { PersonalIntelligenceStory } from "./personal-intelligence-story";
import { PreferenceSandbox } from "./preference-sandbox";
import { ContextPipelineSection } from "./context-pipeline-section";
import { PrivacyFortress } from "./privacy-fortress";
import { FutureVisionStory } from "./future-vision-story";
import { LandingFaq } from "./landing-faq";

export function LandingPage() {
  useEffect(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const reveals = document.querySelectorAll("[data-reveal]");

    if (prefersReduced) {
      reveals.forEach((el) => el.classList.add("in"));
    } else {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.18, rootMargin: "0px 0px -8% 0px" }
      );
      reveals.forEach((el) => observer.observe(el));
    }


  }, []);

  return (
    <div className="landing-root planet-page" id="top">
      <a className="landing-skip" href="#main">
        Skip to content
      </a>

      {/* Fixed WebGL Starfield Canvas (Three.js r0.143 with 45s Dynamic Theme Fading) */}
      <WebGLStarfield />

      {/* Floating Dynamic 45-Second Theme HUD Indicator */}
      <DynamicThemeIndicator />

      {/* Global Navigation with Radix Dialog Menu */}
      <LandingNav />

      <main id="main">
        {/* SECTION 1 · HERO (Ascend - Scale Smarter, Not Harder) */}
        <AscendHero />

        {/* SECTION 2 · FEATURES (Everything in orbit · 6 Cards) */}
        <AscendFeatures />

        {/* SECTION 3 · SHOWCASE + STATS (Built for momentum · Live Pipeline Q3 Dashboard) */}
        <AscendShowcase />

        {/* ══ CORE PRODUCT & INTELLIGENCE STORYTELLING ══ */}
        <ProblemComparisonSection />
        <ProductIntroduction />
        <ProductPreview />

        <PersonalIntelligenceStory />
        <PreferenceSandbox />

        <ContextPipelineSection />

        <PrivacyFortress />
        <LandingFaq />

        <FutureVisionStory />

        {/* SECTION 4 · CTA + FOOTER (Ready when you are · Trajectory · Ascend Footer) */}
        <AscendCta />
      </main>
    </div>
  );
}
