"use client";

import React, { useEffect } from "react";
import dynamic from "next/dynamic";
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

import { DynamicThemeIndicator } from "./dynamic-theme-indicator";
import { LandingNav } from "./landing-nav";
import { HeroLandscape } from "./hero-landscape";
import { ProblemComparisonSection } from "./problem-comparison-section";
import { ProductIntroduction } from "./product-introduction";
import { ProductPreview } from "./product-preview";
import { PersonalIntelligenceStory } from "./personal-intelligence-story";
import { PreferenceSandbox } from "./preference-sandbox";
import { ContextPipelineSection } from "./context-pipeline-section";
import { PrivacyFortress } from "./privacy-fortress";
import { LandingFaq } from "./landing-faq";
import { FutureVisionStory } from "./future-vision-story";
import { ImmersiveFinalCta } from "./immersive-final-cta";
import { LandingFooter } from "./landing-footer";

const WebGLStarfield = dynamic(
  () => import("./webgl-starfield").then((module) => module.WebGLStarfield),
  { ssr: false }
);

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
      return () => observer.disconnect();
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
        {/* HERO: Authentic Radiance AI Personal Intelligence with Interactive Product Stage */}
        <HeroLandscape />

        {/* ══ CORE AUTHENTIC PRODUCT & INTELLIGENCE STORYTELLING ══ */}
        {/* 1. Problem Comparison: Without Saved Context vs With Radiance Context */}
        <ProblemComparisonSection />

        {/* 2. Product Introduction: Saved by you. Ready when it matters. */}
        <ProductIntroduction />

        {/* 3. Product Preview: Interactive walkthrough of context path */}
        <ProductPreview />

        {/* 4. Personal Intelligence Story: Saved notes, preferences, retrieval, sharing */}
        <PersonalIntelligenceStory />

        {/* 5. Preference Sandbox: Interactive concise / detailed / structured modes */}
        <PreferenceSandbox />

        {/* 6. Context Pipeline: Note store -> Lexical match -> Context injection -> Model synthesis */}
        <ContextPipelineSection />

        {/* 7. Privacy Fortress: Browser plaintext storage, opt-in sharing, reset controls */}
        <PrivacyFortress />

        {/* 8. FAQ: Clear, transparent answers on storage, privacy, and models */}
        <LandingFaq />

        {/* 9. Future Vision: Adaptive memory, multi-doc synthesis, cross-model translation */}
        <FutureVisionStory />

        {/* 10. Immersive Final CTA: "Your next conversation can feel different." */}
        <ImmersiveFinalCta />
      </main>

      {/* Global Landing Footer */}
      <LandingFooter />
    </div>
  );
}
