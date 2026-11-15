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
import "./landing-folio.css";

import { LandingNav } from "./landing-nav";
import { HeroLandscape } from "./hero-landscape";
import { LandingFooter } from "./landing-footer";
import { FloatingMobileCTA } from "./floating-mobile-cta";

function SectionFallback({ id, minHeight = "520px" }: { id: string; minHeight?: string }) {
  return (
    <section
      id={id}
      aria-hidden="true"
      style={{
        minHeight,
        contentVisibility: "auto",
        containIntrinsicSize: `1px ${minHeight}`,
      }}
    />
  );
}

// Critical above-the-fold content (LandingNav, HeroLandscape) is imported statically for instant LCP.
// Below-the-fold storytelling sections are dynamically chunked with zero-shift fallback boundaries (CLS < 0.1).
const ProblemComparisonSection = dynamic(
  () => import("./problem-comparison-section").then((module) => module.ProblemComparisonSection),
  { loading: () => <SectionFallback id="problem" minHeight="540px" /> }
);
const ProductIntroduction = dynamic(
  () => import("./product-introduction").then((module) => module.ProductIntroduction),
  { loading: () => <SectionFallback id="product" minHeight="500px" /> }
);
const ProductPreview = dynamic(
  () => import("./product-preview").then((module) => module.ProductPreview),
  { loading: () => <SectionFallback id="preview" minHeight="560px" /> }
);
const PersonalIntelligenceStory = dynamic(
  () => import("./personal-intelligence-story").then((module) => module.PersonalIntelligenceStory),
  { loading: () => <SectionFallback id="intelligence" minHeight="600px" /> }
);
const PreferenceSandbox = dynamic(
  () => import("./preference-sandbox").then((module) => module.PreferenceSandbox),
  { loading: () => <SectionFallback id="preferences" minHeight="520px" /> }
);
const ContextPipelineSection = dynamic(
  () => import("./context-pipeline-section").then((module) => module.ContextPipelineSection),
  { loading: () => <SectionFallback id="pipeline" minHeight="540px" /> }
);
const PrivacyFortress = dynamic(
  () => import("./privacy-fortress").then((module) => module.PrivacyFortress),
  { loading: () => <SectionFallback id="privacy" minHeight="520px" /> }
);
const LandingFaq = dynamic(
  () => import("./landing-faq").then((module) => module.LandingFaq),
  { loading: () => <SectionFallback id="faq" minHeight="460px" /> }
);
const FutureVisionStory = dynamic(
  () => import("./future-vision-story").then((module) => module.FutureVisionStory),
  { loading: () => <SectionFallback id="vision" minHeight="480px" /> }
);
const ImmersiveFinalCta = dynamic(
  () => import("./immersive-final-cta").then((module) => module.ImmersiveFinalCta),
  { loading: () => <SectionFallback id="start" minHeight="420px" /> }
);

const ArcticIcebergsBackground = dynamic(
  () => import("@/components/background/arctic-icebergs-background").then((module) => module.ArcticIcebergsBackground),
  {
    ssr: false,
    loading: () => (
      <div
        className="fixed inset-0 pointer-events-none -z-10 bg-[#02050c]"
        style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", backgroundColor: "#02050c", zIndex: 0 }}
        aria-hidden="true"
      />
    ),
  }
);

export function LandingPage() {
  useEffect(() => {
    const motionQuery =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)")
        : null;

    let prefersReduced = motionQuery ? motionQuery.matches : false;

    let observer: IntersectionObserver | null = null;

    const applyReveal = (el: Element) => {
      if (prefersReduced) {
        el.classList.add("in");
      } else if (observer) {
        observer.observe(el);
      }
    };

    if (!prefersReduced && typeof IntersectionObserver !== "undefined") {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add("in");
              observer?.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: "0px 0px -6% 0px" }
      );
    }

    // Observe initial static elements
    document.querySelectorAll("[data-reveal]").forEach(applyReveal);

    // Observe dynamically mounted elements when dynamic chunks load
    let mutObserver: MutationObserver | null = null;
    if (typeof MutationObserver !== "undefined") {
      mutObserver = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              if (el.hasAttribute?.("data-reveal")) applyReveal(el);
              el.querySelectorAll?.("[data-reveal]").forEach(applyReveal);
            }
          });
        });
      });
      mutObserver.observe(document.body, { childList: true, subtree: true });
    }

    const handleMotionChange = (e: MediaQueryListEvent) => {
      prefersReduced = e.matches;
      if (prefersReduced) {
        document.querySelectorAll("[data-reveal]").forEach((el) => el.classList.add("in"));
        observer?.disconnect();
      }
    };

    if (motionQuery && typeof motionQuery.addEventListener === "function") {
      motionQuery.addEventListener("change", handleMotionChange);
    }

    return () => {
      observer?.disconnect();
      mutObserver?.disconnect();
      if (motionQuery && typeof motionQuery.removeEventListener === "function") {
        motionQuery.removeEventListener("change", handleMotionChange);
      }
    };
  }, []);

  return (
    <div className="landing-root planet-page" id="top">
      <a className="landing-skip" href="#main">
        Skip to content
      </a>

      {/* Fixed Arctic Icebergs Generative Textmode Background */}
      <ArcticIcebergsBackground />

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

      {/* Floating Sticky Mobile CTA */}
      <FloatingMobileCTA />
    </div>
  );
}
