import React from "react";
import Link from "next/link";
import { RadianceLogo } from "@/components/branding/radiance-logo";

export function LandingFooter() {
  return (
    <footer className="landing-footer" role="contentinfo">
      <div className="landing-shell">
        <div className="landing-footer-grid">
          <div className="landing-footer-brand">
            <RadianceLogo variant="lockup" size="sm" aria-hidden />
            <p className="landing-copy">
              Radiance is personal intelligence AI: notes you save, preferences you set, and conversations
              that can use them when you allow it.
            </p>
            <div className="landing-footer-pill mt-4 inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" aria-hidden="true" />
              <span>Deterministic Bounded Pipeline</span>
            </div>
          </div>
          <nav aria-label="Product">
            <p className="landing-footer-heading">Product</p>
            <Link href="#product">Product overview</Link>
            <Link href="#intelligence">Personal Intelligence</Link>
            <Link href="#pipeline">Context pipeline</Link>
            <Link href="/chat">Chat</Link>
          </nav>
          <nav aria-label="Learn more">
            <p className="landing-footer-heading">Learn more</p>
            <Link href="#privacy">Privacy on this page</Link>
            <Link href="/privacy">Privacy model</Link>
            <Link href="#faq">FAQ</Link>
            <Link href="#vision">Future vision</Link>
          </nav>
        </div>
        <div className="landing-footer-bottom flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-white/5">
          <p className="landing-footer-meta">© {new Date().getFullYear()} Radiance. All rights reserved.</p>
          <p className="text-xs text-slate-500 font-mono">Personal AI • Browser-first • Opt-in context</p>
        </div>
      </div>
    </footer>
  );
}
