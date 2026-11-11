"use client";

import React from "react";
import "./ascend-planet-landing.css";

export function AscendFeatures() {
  return (
    <section className="planet-section planet-features" id="features">
      <div className="planet-section-head">
        <span className="planet-eyebrow" data-reveal style={{ "--rd": "0ms" } as React.CSSProperties}>
          Everything in orbit
        </span>
        <h2 data-reveal style={{ "--rd": "80ms" } as React.CSSProperties}>
          One platform to run the entire revenue engine
        </h2>
        <p data-reveal style={{ "--rd": "160ms" } as React.CSSProperties}>
          Stop stitching tools together. Radiance unifies capture, automation, and insight into a single surface your whole team actually enjoys using.
        </p>
      </div>

      <div className="planet-feature-grid">
        {/* 1. workflow */}
        <div className="planet-card" data-reveal style={{ "--rd": "0ms" } as React.CSSProperties}>
          <div className="planet-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="6" height="6" rx="2"></rect>
              <rect x="15" y="15" width="6" height="6" rx="2"></rect>
              <path d="M6 9v3a3 3 0 0 0 3 3h3"></path>
            </svg>
          </div>
          <h3>Clever workflows</h3>
          <p>Automate every hand-off with visual, branching pipelines that move deals forward while you sleep.</p>
        </div>

        {/* 2. analytics */}
        <div className="planet-card" data-reveal style={{ "--rd": "90ms" } as React.CSSProperties}>
          <div className="planet-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 19V5"></path>
              <path d="M4 19h16"></path>
              <path d="M8 16v-4"></path>
              <path d="M13 16V8"></path>
              <path d="M18 16v-7"></path>
            </svg>
          </div>
          <h3>Live analytics</h3>
          <p>Real-time dashboards turn raw funnel data into the one number that tells you what to do next.</p>
        </div>

        {/* 3. leads */}
        <div className="planet-card" data-reveal style={{ "--rd": "180ms" } as React.CSSProperties}>
          <div className="planet-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
              <circle cx="9" cy="7" r="4"></circle>
              <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
              <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
            </svg>
          </div>
          <h3>Seamless leads</h3>
          <p>Capture, score, and route every lead automatically — no spreadsheet, no leak, no lag.</p>
        </div>

        {/* 4. bolt */}
        <div className="planet-card" data-reveal style={{ "--rd": "270ms" } as React.CSSProperties}>
          <div className="planet-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M13 2 3 14h9l-1 8 10-12h-9l1-8Z"></path>
            </svg>
          </div>
          <h3>Instant triggers</h3>
          <p>Fire actions across your stack the moment intent appears, in milliseconds not minutes.</p>
        </div>

        {/* 5. shield */}
        <div className="planet-card" data-reveal style={{ "--rd": "360ms" } as React.CSSProperties}>
          <div className="planet-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z"></path>
              <path d="m9 12 2 2 4-4"></path>
            </svg>
          </div>
          <h3>Enterprise-grade</h3>
          <p>SOC 2, SSO, and granular roles baked in — security that scales quietly with your team.</p>
        </div>

        {/* 6. globe */}
        <div className="planet-card" data-reveal style={{ "--rd": "450ms" } as React.CSSProperties}>
          <div className="planet-card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <path d="M2 12h20"></path>
              <path d="M12 2a15 15 0 0 1 0 20 15 15 0 0 1 0-20Z"></path>
            </svg>
          </div>
          <h3>Global by default</h3>
          <p>Multi-region, multi-currency, and low-latency everywhere your customers happen to be.</p>
        </div>
      </div>
    </section>
  );
}
