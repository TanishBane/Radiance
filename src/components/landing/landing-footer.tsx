import React from "react";
import Link from "next/link";
import { RadianceLogo } from "@/components/branding/radiance-logo";

export function LandingFooter() {
  return (
    <footer className="landing-footer">
      <div className="landing-shell">
        <div className="landing-footer-grid">
          <div>
            <RadianceLogo variant="lockup" size="sm" aria-hidden />
            <p className="landing-copy">
              Radiance is personal intelligence AI: notes you save, preferences you set, and conversations
              that can use them when you allow it.
            </p>
          </div>
          <nav aria-label="Product">
            <p className="landing-footer-heading">Product</p>
            <Link href="#product">Product overview</Link>
            <Link href="#intelligence">Personal Intelligence</Link>
            <Link href="/chat">Chat</Link>
          </nav>
          <nav aria-label="Learn more">
            <p className="landing-footer-heading">Learn more</p>
            <Link href="#privacy">Privacy on this page</Link>
            <Link href="/privacy">Privacy model</Link>
            <Link href="#vision">Future vision</Link>
          </nav>
        </div>
        <p className="landing-footer-meta">© {new Date().getFullYear()} Radiance</p>
      </div>
    </footer>
  );
}
