import type { Metadata } from "next";
import Link from "next/link";
import { RadianceLogo } from "@/components/branding/radiance-logo";
import { WifiOff, MessageSquare } from "lucide-react";

export const metadata: Metadata = {
  title: "Offline | RADIANCE",
  description: "Radiance is currently offline. Your local conversation history remains accessible.",
};

export default function OfflinePage() {
  return (
    <main className="min-h-[100dvh] bg-[#0d0915] text-[#f0ede6] flex flex-col items-center justify-center px-4 py-8 relative overflow-hidden select-none">
      <div className="w-full max-w-md p-6 sm:p-8 rounded-2xl bg-[rgba(255,255,255,0.035)] border border-[rgba(255,255,255,0.09)] backdrop-blur-2xl shadow-2xl flex flex-col items-center text-center relative z-10">
        <div className="w-14 h-14 rounded-2xl bg-[var(--surface-raised)] border border-[var(--border-accent)] flex items-center justify-center mb-5 shadow-[0_0_24px_rgba(124,92,255,0.2)]">
          <RadianceLogo variant="symbol" size="md" />
        </div>

        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-[rgba(232,200,73,0.12)] border border-[rgba(232,200,73,0.3)] text-[var(--warn)] text-xs font-medium mb-3">
          <WifiOff className="w-3.5 h-3.5" />
          <span>No Internet Connection</span>
        </div>

        <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight mb-2 text-[#f3f1ec]">
          Offline Workspace
        </h1>

        <p className="text-sm text-[var(--txt-dim)] leading-relaxed mb-6 max-w-sm">
          Live multi-provider inference is paused while disconnected. You can continue reading previously saved conversations and editing personal notes.
        </p>

        <Link
          href="/chat"
          className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium bg-[var(--accent)] text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_20px_var(--accent-g)] min-h-[44px] touch-target"
        >
          <MessageSquare className="w-4 h-4" />
          Browse Saved Chats
        </Link>
      </div>
    </main>
  );
}
