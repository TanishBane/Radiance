import React from "react";
import Link from "next/link";
import { MessageSquare, ArrowLeft, Sparkles } from "lucide-react";
import { AsciiArt } from "@/components/ui/ascii-art";

export default function NotFound() {
  return (
    <main className="min-h-screen w-full flex flex-col items-center justify-center p-6 bg-[#04020a] text-slate-100 relative overflow-hidden">
      {/* Ambient background glows */}
      <div 
        className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[640px] h-[360px] bg-gradient-to-br from-violet-600/15 via-purple-800/10 to-transparent blur-3xl pointer-events-none -z-10"
        aria-hidden="true" 
      />

      <div className="max-w-3xl w-full mx-auto flex flex-col items-center text-center z-10">
        {/* Status Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-violet-500/10 border border-violet-400/25 text-violet-300 text-xs font-mono uppercase tracking-wider mb-6 shadow-[0_0_20px_rgba(139,92,246,0.2)]">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span>404 · Signal Lost in Space</span>
        </div>

        {/* Real Accessible Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-white mb-4 font-sans">
          Cosmic Horizon Not Found
        </h1>

        {/* Descriptive Body Text */}
        <p className="text-base sm:text-lg text-slate-300 max-w-xl mb-8 leading-relaxed">
          The celestial coordinate or document you requested has drifted past the observable mountain ridge. Radiance could not find this page.
        </p>

        {/* Animated ASCII Art Piece: Starry Ridge from ASCII Magic */}
        <div className="relative mb-10 w-full flex justify-center">
          <div className="relative rounded-2xl p-2 sm:p-3 bg-black/60 border border-violet-500/30 shadow-[0_0_50px_rgba(168,85,247,0.2)] backdrop-blur-md overflow-hidden max-w-full">
            <AsciiArt
              piece="starry-ridge"
              size={5}
              className="max-w-full overflow-hidden block"
            />
            <div className="text-[10px] font-mono text-slate-500 text-right mt-1 px-1">
              ASCII Magic · Starry Ridge
            </div>
          </div>
        </div>

        {/* Navigation Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-slate-900/90 border border-slate-700/80 text-white font-medium hover:bg-slate-800 hover:border-slate-600 transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4 text-slate-400" />
            <span>Return to Overview</span>
          </Link>

          <Link
            href="/chat"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-medium hover:opacity-95 shadow-[0_0_24px_rgba(139,92,246,0.35)] transition-all"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Open Chat Workspace</span>
          </Link>
        </div>
      </div>
    </main>
  );
}
