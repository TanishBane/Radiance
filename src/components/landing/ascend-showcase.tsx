"use client";

import React from "react";
import Link from "next/link";
import "./ascend-planet-landing.css";

export function AscendShowcase() {
  return (
    <section className="planet-section planet-showcase" id="solutions">
      <div className="planet-showcase-grid">
        <div className="planet-showcase-copy">
          <span className="planet-eyebrow" data-reveal style={{ "--rd": "0ms" } as React.CSSProperties}>
            Built for momentum
          </span>
          <h2 data-reveal style={{ "--rd": "90ms" } as React.CSSProperties}>
            See the whole funnel move in real time
          </h2>
          <p data-reveal style={{ "--rd": "180ms" } as React.CSSProperties}>
            Every stage, every signal, every dollar — rendered live. Radiance gives operators the altitude to spot what’s working and the controls to double down instantly.
          </p>
          <Link 
            href="/chat" 
            className="planet-btn planet-btn-primary" 
            data-reveal 
            style={{ "--rd": "270ms" } as React.CSSProperties}
          >
            Explore the platform
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14"></path>
              <path d="m12 5 7 7-7 7"></path>
            </svg>
          </Link>
        </div>

        {/* Right dashboard mock */}
        <div className="planet-dashboard" data-reveal style={{ "--rd": "160ms" } as React.CSSProperties}>
          <div className="planet-dash-top">
            <span className="planet-dash-title">Pipeline · Q3</span>
            <span className="planet-dash-live">
              <span className="planet-dash-dot"></span>
              Live
            </span>
          </div>

          <div className="planet-dash-bars">
            <div className="planet-dash-bar" style={{ "--h": "62%", "--del": "0ms" } as React.CSSProperties}></div>
            <div className="planet-dash-bar" style={{ "--h": "88%", "--del": "90ms" } as React.CSSProperties}></div>
            <div className="planet-dash-bar" style={{ "--h": "47%", "--del": "180ms" } as React.CSSProperties}></div>
            <div className="planet-dash-bar" style={{ "--h": "95%", "--del": "270ms" } as React.CSSProperties}></div>
            <div className="planet-dash-bar" style={{ "--h": "71%", "--del": "360ms" } as React.CSSProperties}></div>
            <div className="planet-dash-bar" style={{ "--h": "80%", "--del": "450ms" } as React.CSSProperties}></div>
            <div className="planet-dash-bar" style={{ "--h": "58%", "--del": "540ms" } as React.CSSProperties}></div>
          </div>

          <div className="planet-dash-rows">
            <div className="planet-dash-row">
              <span>New leads 90%</span>
              <div className="planet-dash-track">
                <div className="planet-dash-fill" style={{ "--w": "90%" } as React.CSSProperties}></div>
              </div>
            </div>
            <div className="planet-dash-row">
              <span>Qualified 72%</span>
              <div className="planet-dash-track">
                <div className="planet-dash-fill" style={{ "--w": "72%" } as React.CSSProperties}></div>
              </div>
            </div>
            <div className="planet-dash-row">
              <span>In negotiation 48%</span>
              <div className="planet-dash-track">
                <div className="planet-dash-fill" style={{ "--w": "48%" } as React.CSSProperties}></div>
              </div>
            </div>
            <div className="planet-dash-row">
              <span>Closed won 34%</span>
              <div className="planet-dash-track">
                <div className="planet-dash-fill" style={{ "--w": "34%" } as React.CSSProperties}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="planet-stats">
        <div className="planet-stat" data-reveal style={{ "--rd": "0ms" } as React.CSSProperties}>
          <div className="planet-stat-value">3.4×</div>
          <div className="planet-stat-label">Faster pipeline velocity</div>
        </div>
        <div className="planet-stat" data-reveal style={{ "--rd": "80ms" } as React.CSSProperties}>
          <div className="planet-stat-value">92%</div>
          <div className="planet-stat-label">Lead capture accuracy</div>
        </div>
        <div className="planet-stat" data-reveal style={{ "--rd": "160ms" } as React.CSSProperties}>
          <div className="planet-stat-value">11k+</div>
          <div className="planet-stat-label">Teams scaling on Radiance</div>
        </div>
        <div className="planet-stat" data-reveal style={{ "--rd": "240ms" } as React.CSSProperties}>
          <div className="planet-stat-value">$2.1B</div>
          <div className="planet-stat-label">Revenue influenced</div>
        </div>
      </div>
    </section>
  );
}
