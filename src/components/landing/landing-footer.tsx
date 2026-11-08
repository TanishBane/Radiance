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
          <div>
            <p style={{ margin: "0 0 12px", color: "var(--txt)" }}>Product</p>
            <Link href="#product">Product</Link>
            <br />
            <Link href="#intelligence">Personal Intelligence</Link>
            <br />
            <Link href="/chat">Chat</Link>
          </div>
          <div>
            <p style={{ margin: "0 0 12px", color: "var(--txt)" }}>Information</p>
            <Link href="#privacy">Privacy on this page</Link>
            <br />
            <Link href="/privacy">Privacy model</Link>
            <br />
            <Link href="#vision">Vision</Link>
          </div>
        </div>
        <p className="landing-footer-meta">© {new Date().getFullYear()} Radiance</p>
      </div>
    </footer>
  );
}
