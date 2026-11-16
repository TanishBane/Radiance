"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";
import { safeVibrate } from "@/lib/mobile/haptics";

export function FloatingMobileCTA() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !("IntersectionObserver" in window)) return;

    const heroSection = document.getElementById("hero") || document.querySelector("section");
    if (!heroSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        // Show floating CTA when hero is mostly out of view
        setIsVisible(!entry.isIntersecting);
      },
      { threshold: 0.15 }
    );

    observer.observe(heroSection);
    return () => observer.disconnect();
  }, []);

  if (!isVisible) return null;

  return (
    <aside
      aria-label="Quick launch action"
      className="md:hidden fixed bottom-[max(1rem,env(safe-area-inset-bottom,0px))] inset-x-4 z-40 max-w-xs mx-auto animate-in fade-in slide-in-from-bottom-3 duration-300 pointer-events-auto"
    >
      <Link
        href="/chat"
        onClick={() => safeVibrate("tap")}
        className="flex items-center justify-between px-4 py-3 rounded-full bg-[#0d0915]/95 border border-[var(--border-accent)] shadow-[0_8px_32px_rgba(0,0,0,0.7),0_0_20px_var(--accent-g)] backdrop-blur-2xl text-xs font-semibold text-[var(--txt)] active:scale-95 transition-all touch-target min-h-[44px]"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-[var(--accent-b)] animate-pulse motion-reduce:animate-none" />
          <span>Chat with Radiance</span>
        </div>
        <div className="flex items-center gap-1 text-[var(--accent-b)]">
          <span className="text-[11px] font-mono">Launch</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </Link>
    </aside>
  );
}
