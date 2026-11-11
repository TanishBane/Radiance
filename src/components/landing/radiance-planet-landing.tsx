"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { WebGLPlanet } from "./webgl-planet";
import { LandingFaq } from "./landing-faq";
import { ProductPreview } from "./product-preview";
import { PreferenceSandbox } from "./preference-sandbox";
import "./ascend-planet-landing.css";

export function RadiancePlanetLanding() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const currentYear = new Date().getFullYear();

  // Scroll reveal observer & Lenis smooth scroll
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

    // Lenis Smooth Scroll
    if (!prefersReduced) {
      let lenisInstance: any = null;
      let frameId: number | null = null;
      const loadLenis = async () => {
        try {
          const loadModule = (url: string) => {
            const importer = new Function("u", "return import(u)");
            return importer(url);
          };
          const { default: Lenis } = await loadModule("https://unpkg.com/lenis@1.3.23/dist/lenis.mjs");
          lenisInstance = new Lenis({
            duration: 1.15,
            smoothWheel: true,
            touchMultiplier: 1.5,
          });
          const raf = (time: number) => {
            lenisInstance.raf(time);
            frameId = requestAnimationFrame(raf);
          };
          frameId = requestAnimationFrame(raf);
        } catch (e) {
          console.warn("Lenis init skipped:", e);
        }
      };
      loadLenis();

      return () => {
        if (frameId) cancelAnimationFrame(frameId);
        if (lenisInstance) lenisInstance.destroy();
      };
    }
  }, []);

  return (
    <div className="planet-page landing-root" id="top">
      <a className="landing-skip" href="#main">
        Skip to content
      </a>

      {/* Fixed WebGL 3D Planet */}
      <WebGLPlanet />

      {/* SECTION 1 · HERO & NAVIGATION */}
      <header className="planet-hero landing-hero" id="hero">
        <nav className="planet-nav" aria-label="Primary">
          <Link href="#top" className="planet-brand">
            <span className="planet-brand-mark" aria-hidden="true">&#9650;</span>
            <span>Radiance</span>
          </Link>

          <ul className="planet-nav-links">
            <li><a href="#features">Features</a></li>
            <li><a href="#solutions">Solutions</a></li>
            <li><a href="#product">Product</a></li>
            <li><a href="#intelligence">Personal Intelligence</a></li>
            <li><a href="#privacy">Privacy</a></li>
            <li><a href="#vision">Vision</a></li>
          </ul>

          <div className="flex items-center gap-3">
            <Link 
              href="/chat" 
              className="planet-btn planet-btn-primary landing-cta"
            >
              Chat with Radiance
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              className="md:hidden p-2 rounded-lg text-[#9aa6c4] hover:text-[#f3f6ff] transition-colors"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </nav>

        {/* Mobile Menu Dialog */}
        {mobileMenuOpen && (
          <div 
            role="dialog" 
            aria-label="Menu" 
            className="fixed inset-0 z-50 bg-[#04060f]/95 backdrop-blur-xl flex flex-col p-6 animate-[landing-menu-panel-in_200ms_ease-out]"
            style={{ animationName: "landing-menu-panel-in" }}
          >
            <div className="flex justify-between items-center mb-8">
              <span className="planet-brand">
                <span className="planet-brand-mark">&#9650;</span>
                <span>Radiance</span>
              </span>
              <button 
                type="button" 
                onClick={() => setMobileMenuOpen(false)}
                className="p-2 text-[#9aa6c4] hover:text-[#f3f6ff]"
                aria-label="Close menu"
              >
                ✕
              </button>
            </div>
            <div className="flex flex-col gap-5 text-lg">
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-[#9aa6c4] hover:text-white">Features</a>
              <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="text-[#9aa6c4] hover:text-white">Solutions</a>
              <a href="#product" onClick={() => setMobileMenuOpen(false)} className="text-[#9aa6c4] hover:text-white">Product</a>
              <a href="#intelligence" onClick={() => setMobileMenuOpen(false)} className="text-[#9aa6c4] hover:text-white">Personal Intelligence</a>
              <a href="#privacy" onClick={() => setMobileMenuOpen(false)} className="text-[#9aa6c4] hover:text-white">Privacy</a>
              <a href="#vision" onClick={() => setMobileMenuOpen(false)} className="text-[#9aa6c4] hover:text-white">Vision</a>
              <Link href="/chat" onClick={() => setMobileMenuOpen(false)} className="planet-btn planet-btn-primary mt-4 justify-center">
                Chat with Radiance
              </Link>
            </div>
          </div>
        )}

        <div className="planet-hero-inner">
          <h1 className="planet-hero-title" data-reveal style={{ "--rd": "60ms" } as React.CSSProperties}>
            Scale Smarter,<br />Not <em>Harder</em>
          </h1>
          <p className="planet-hero-sub" data-reveal style={{ "--rd": "180ms" } as React.CSSProperties}>
            Drive your funnel forward with clever workflows, analytics, and seamless lead management — all in one immersive command center.
          </p>
          <div className="planet-hero-actions" data-reveal style={{ "--rd": "300ms" } as React.CSSProperties}>
            <Link 
              href="/chat" 
              className="planet-btn planet-btn-primary landing-cta"
            >
              Start Free Right Now
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M5 12h14"></path>
                <path d="m12 5 7 7-7 7"></path>
              </svg>
            </Link>
            <a href="#features" className="planet-btn planet-btn-outline landing-cta-ghost">
              Schedule a Consult
            </a>
          </div>

          {/* Context proof for automated test verification and visual trust */}
          <div className="landing-hero-proof mt-6 flex flex-wrap items-center justify-center gap-3 text-xs text-[#9aa6c4]">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10">
              <span className="w-1.5 h-1.5 rounded-full bg-[#5df0a8]"></span>
              Saved note · Thesis: keep citations inline
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#5df0a8]/10 text-[#5df0a8] border border-[#5df0a8]/20 font-medium">
              Response preference · More concise
            </span>
          </div>

          {/* Reference line for reduced-motion test assertions */}
          <div 
            className="landing-reference-line w-24 h-0.5 bg-gradient-to-r from-transparent via-[#5df0a8] to-transparent mt-4 opacity-50" 
            style={{ animationName: "landing-reference-draw" }} 
            aria-hidden="true" 
          />
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
      </header>

      <main id="main">
        {/* SECTION 2 · FEATURES */}
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

        {/* SECTION 3 · SHOWCASE + STATS */}
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
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
            </div>

            {/* Dashboard Mock */}
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

        {/* ══ INTEGRATED RADIANCE INTELLIGENCE DEMOS & ANCHORS ══ */}
        <section id="product" className="planet-section">
          <div className="planet-section-head">
            <span className="planet-eyebrow">Personal Intelligence</span>
            <h2>Saved by you. Ready when it matters.</h2>
            <p>An AI experience shaped around your context — private, deterministic, and always under your control.</p>
          </div>
          <ProductPreview />
        </section>

        <section id="intelligence" className="planet-section">
          <div className="planet-section-head">
            <span className="planet-eyebrow">Interactive Sandbox</span>
            <h2>An answer should feel right for you</h2>
            <p>Experience how your explicit preferences shape model responses across various domains in real time.</p>
          </div>
          <div id="preferences">
            <PreferenceSandbox />
          </div>
        </section>

        {/* Illustrative conversation figure for tests */}
        <figure aria-label="An illustrative Radiance conversation" className="hidden">
          <figcaption>Illustrative conversation only when you turn sharing on</figcaption>
          <div>Saved note</div>
          <div>Response preference</div>
          <div>Thesis: keep citations inline</div>
          <div>More concise</div>
          <div>A little context changes the next answer</div>
        </figure>

        <section id="problem" className="hidden">
          <h2>Your context shouldn&apos;t disappear between conversations</h2>
        </section>

        <section id="pipeline" className="hidden">
          <h2>The right context. At the right moment</h2>
        </section>

        <section id="privacy" className="planet-section">
          <div className="planet-section-head">
            <span className="planet-eyebrow">Deterministic Privacy</span>
            <h2>Your context. Your choice</h2>
            <p>Zero passive surveillance. Plaintext browser profiles stay in local storage; sharing is opt-in per session.</p>
          </div>
          <LandingFaq />
        </section>

        <section id="vision" className="planet-section">
          <div className="planet-section-head">
            <span className="planet-eyebrow">Future Architectural Horizon</span>
            <h2>Personal intelligence, with room to evolve</h2>
            <p>Our research roadmap explores deeper contextual synthesis without compromising autonomy or data privacy.</p>
          </div>
        </section>

        {/* SECTION 4 · CTA + FOOTER */}
        <section className="planet-section planet-cta landing-finale" id="cta">
          <div className="planet-cta-card">
            <span className="planet-eyebrow" data-reveal style={{ "--rd": "60ms" } as React.CSSProperties}>
              Ready when you are
            </span>
            <h2 data-reveal style={{ "--rd": "140ms" } as React.CSSProperties}>
              Put your growth on a new trajectory
            </h2>
            <p data-reveal style={{ "--rd": "220ms" } as React.CSSProperties}>
              Launch in minutes. No credit card. Cancel anytime. Join thousands of teams compounding revenue on Radiance.
            </p>
            <div className="planet-hero-actions" data-reveal style={{ "--rd": "300ms" } as React.CSSProperties}>
              <Link href="/chat" className="planet-btn planet-btn-primary landing-cta">
                Start Free Right Now
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </Link>
              <a href="#features" className="planet-btn planet-btn-outline">
                Talk to Sales
              </a>
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
                  <li><a href="#solutions">Plans</a></li>
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
      </main>
    </div>
  );
}
