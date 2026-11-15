"use client";

import React from "react";
import { Download, X } from "lucide-react";
import { RadianceLogo } from "@/components/branding/radiance-logo";

interface PWAInstallBannerProps {
  canInstall: boolean;
  onInstall: () => void;
  onDismiss: () => void;
}

export function PWAInstallBanner({ canInstall, onInstall, onDismiss }: PWAInstallBannerProps) {
  if (!canInstall) return null;

  return (
    <aside
      aria-label="Install Radiance Application"
      className="fixed bottom-[calc(var(--mobile-bottom-nav-h,58px)+env(safe-area-inset-bottom,0px)+8px)] md:bottom-4 left-3 right-3 sm:left-auto sm:right-4 sm:w-96 z-40 p-3.5 rounded-2xl bg-[#0d0915]/95 border border-[var(--border-accent)] shadow-[0_8px_32px_rgba(0,0,0,0.5)] backdrop-blur-2xl text-[var(--txt)] transition-all animate-in fade-in slide-in-from-bottom-3"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] flex items-center justify-center shrink-0">
            <RadianceLogo variant="symbol" size="sm" />
          </div>
          <div>
            <h4 className="text-sm font-semibold tracking-tight text-[var(--txt)]">
              Install Radiance
            </h4>
            <p className="text-xs text-[var(--txt-dim)] leading-tight mt-0.5">
              Full-screen spatial canvas, instant launch & offline local notes.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[var(--txt-muted)] hover:text-[var(--txt)] p-1 rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer touch-target"
          aria-label="Dismiss install prompt"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={onDismiss}
          className="px-3 py-1.5 rounded-lg text-xs font-medium text-[var(--txt-dim)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] min-h-[44px] flex items-center justify-center cursor-pointer touch-target"
        >
          Not now
        </button>
        <button
          type="button"
          onClick={onInstall}
          className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[var(--accent)] text-white hover:brightness-110 active:scale-95 transition-all shadow-[0_0_16px_var(--accent-g)] min-h-[44px] flex items-center gap-1.5 cursor-pointer touch-target"
        >
          <Download className="w-3.5 h-3.5" />
          Install App
        </button>
      </div>
    </aside>
  );
}
