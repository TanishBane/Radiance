"use client";

import React from "react";
import { LandingCta } from "./landing-cta";
import { IntelligenceField } from "./intelligence-field";
import { HeroProductStage } from "./hero-product-stage";
import "./ascend-planet-landing.css";

export function AscendHero() {
  return (
    <section className="planet-hero landing-hero hero-landscape-section" id="hero">
      <div className="planet-hero-inner">
        <h1 className="planet-hero-title landing-display" data-reveal style={{ "--rd": "60ms" } as React.CSSProperties}>
          Scale Smarter,<br />Not <em>Harder</em>
          <span className="sr-only"> — AI that brings your context forward</span>
        </h1>

        <p className="planet-hero-sub landing-lede" data-reveal style={{ "--rd": "180ms" } as React.CSSProperties}>
          Drive your funnel forward with clever workflows, analytics, and seamless lead management — all in one immersive command center.
        </p>

        <div className="planet-hero-actions landing-hero-actions" data-reveal style={{ "--rd": "300ms" } as React.CSSProperties}>
          <LandingCta 
            href="/chat" 
            size="lg" 
            className="planet-btn planet-btn-primary landing-cta hero-btn-primary"
            style={{
              backgroundColor: "#1e40af",
              color: "#ffffff",
            }}
          >
            Start Free Right Now
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </LandingCta>

          <LandingCta 
            href="#features" 
            variant="ghost" 
            size="lg" 
            className="planet-btn planet-btn-outline landing-cta-ghost"
          >
            Schedule a Consult
          </LandingCta>
        </div>

        {/* Context proof capsule - sits compactly under hero actions within 844px */}
        <p className="landing-hero-proof mt-4 flex flex-wrap items-center justify-center gap-2 text-xs text-[#9aa6c4]">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
            <span className="w-1.5 h-1.5 rounded-full bg-[#5df0a8]"></span>
            Saved note · Keep citations inline
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5df0a8]/10 text-[#5df0a8] border border-[#5df0a8]/20 font-medium">
            More concise
          </span>
        </p>

        {/* Reference line for motion tests */}
        <div 
          className="landing-reference-line w-24 h-0.5 bg-gradient-to-r from-transparent via-[#5df0a8] to-transparent mt-2.5 opacity-60" 
          aria-hidden="true" 
        />
      </div>

      {/* Illustrative conversation figure */}
      <div className="sr-only">
        <IntelligenceField />
      </div>

      {/* Logos Row */}
      <div className="planet-logos" data-reveal style={{ "--rd": "420ms" } as React.CSSProperties}>
        <span className="planet-logos-label">Trusted by fast-moving teams</span>
        <div className="planet-logos-row">
          <span className="planet-logo">Nimbus</span>
          <span className="planet-logo">Pluma</span>
          <span className="planet-logo">Citrus</span>
          <span className="planet-logo">Spider</span>
          <span className="planet-logo">Helod</span>
          <span className="planet-logo">Vertx</span>
        </div>
      </div>

      {/* Interactive Hero Product Stage (Radiance Ambient Chat Interface) */}
      <div className="planet-stage-mount w-full max-w-4xl mx-auto px-4 mt-8" data-reveal style={{ "--rd": "520ms" } as React.CSSProperties}>
        <HeroProductStage />
      </div>
    </section>
  );
}
