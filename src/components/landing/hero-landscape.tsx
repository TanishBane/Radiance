"use client";

import React, { useState, useEffect, memo } from "react";
import { Globe, ArrowUpRight } from "lucide-react";
import { HeroProductStage } from "./hero-product-stage";
import { LandingCta } from "./landing-cta";
import { ShinyButton } from "@/components/ui/shiny-button";
import "./hero-landscape.css";

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
  return (
    <section 
      id="hero"
      className="hero-landscape-section section-atmosphere-hero landing-hero"
      aria-labelledby="hero-display-heading"
    >
      <div className="hero-landscape-shell">
        {/* Top Hero Centered Showcase */}
        <div className="hero-center-showcase">
          {/* Editorial Typography & High-Craft CTAs */}
          <div className="hero-editorial-column hero-editorial-center">
            <h1 id="hero-display-heading" className="hero-narrative-title landing-display">
              AI that brings your{" "}
              <em className="hero-serif-accent">context forward.</em>
            </h1>

            <p className="hero-narrative-lede landing-lede">
              Bring your saved context and preferences into your AI experience. Radiance helps make meaningful conversations more personal, useful, and consistent.
            </p>

            <div className="hero-actions-row landing-hero-actions">
              <ShinyButton href="/chat" className="hero-btn-primary">
                Chat with Radiance <ArrowUpRight className="inline w-4 h-4 ml-1 -mt-0.5" />
              </ShinyButton>

              <LandingCta href="#intelligence" variant="ghost" size="lg" className="hero-btn-secondary landing-cta-ghost">
                Explore Personal Intelligence <span aria-hidden="true">↓</span>
              </LandingCta>
            </div>

            <p className="landing-hero-proof hero-trust-row" aria-label="Saved context preview">
              <span>Saved note · Keep citations inline</span>
              <span>More concise</span>
            </p>
          </div>
        </div>

        {/* Live Telemetry Status Dock (Synasite Reference) */}
        <div
          className="hero-telemetry-dock"
          aria-label="Live engine telemetry"
        >
          <div className="telemetry-node">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span className="telemetry-label">Browser-local notes · Sharing off by default</span>
          </div>

          <div className="telemetry-node telemetry-clock-node">
            <HeroLiveClock />
          </div>

          <div className="telemetry-node telemetry-ethos-node">
            <span className="telemetry-ethos-title">A Simple Idea.</span>
            <span className="telemetry-sub">Plaintext storage · Explicit saves</span>
          </div>

          <div className="telemetry-node telemetry-action-node">
            <a href="/chat" className="telemetry-action-link">
              <span>Let&apos;s Work Together</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Central Luminous Product Stage (Full-width interactive experience) */}
        <div
          className="hero-stage-wrapper"
          style={{ width: "100%", maxWidth: "980px", marginTop: "3.5rem" }}
        >
          <HeroProductStage />
        </div>
      </div>
    </section>
  );
}
