"use client";

import React from "react";
import Link from "next/link";
import { LandingCta } from "./landing-cta";
import "./ascend-planet-landing.css";

export function AscendCta() {
  const currentYear = new Date().getFullYear();

  return (
    <section className="planet-section planet-cta landing-finale section-atmosphere-final" id="cta">
      <div className="planet-cta-card">
        <span className="planet-eyebrow" data-reveal style={{ "--rd": "60ms" } as React.CSSProperties}>
          Ready when you are
        </span>
        <h2 data-reveal style={{ "--rd": "140ms" } as React.CSSProperties}>
          Put your growth on a new trajectory
          <span className="sr-only"> — Your next conversation can feel different.</span>
        </h2>
        <p data-reveal style={{ "--rd": "220ms" } as React.CSSProperties}>
          Launch in minutes. No credit card. Cancel anytime. Join thousands of teams compounding revenue on Radiance.
        </p>
        <div className="planet-hero-actions" data-reveal style={{ "--rd": "300ms" } as React.CSSProperties}>
          <LandingCta 
            href="/chat" 
            size="lg" 
            className="planet-btn planet-btn-primary landing-cta"
            style={{ backgroundColor: "#1e40af", color: "#ffffff" }}
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
            Talk to Sales
          </LandingCta>
        </div>
      </div>

      <footer className="planet-footer">
        <div className="planet-footer-brand">
          <Link href="#top" className="planet-brand">
            <span className="planet-brand-mark">&#9650;</span>
            <span>Radiance</span>
          </Link>
          <p>The revenue command center for ambitious teams.</p>
        </div>

        <div className="planet-footer-cols">
          <div className="planet-footer-col">
            <h4>Product</h4>
            <ul>
              <li><a href="#features">Features</a></li>
              <li><a href="#solutions">Solutions</a></li>
              <li><a href="#product">Personal Intelligence</a></li>
            </ul>
          </div>
          <div className="planet-footer-col">
            <h4>Company</h4>
            <ul>
              <li><a href="#features">About</a></li>
              <li><a href="#features">Careers</a></li>
              <li><a href="#features">Blog</a></li>
            </ul>
          </div>
          <div className="planet-footer-col">
            <h4>Legal</h4>
            <ul>
              <li><Link href="/privacy">Privacy</Link></li>
              <li><Link href="/privacy">Terms</Link></li>
              <li><Link href="/privacy">Security</Link></li>
            </ul>
          </div>
        </div>
      </footer>

      <div className="planet-copyright">
        © {currentYear} Radiance, Inc. — Built among the stars.
      </div>
    </section>
  );
}
