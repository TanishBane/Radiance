"use client";

import React, { useState, useEffect } from "react";
import { WifiOff } from "lucide-react";
import { safeLocalStorage } from "@/lib/utils/storage";

export function OfflineIndicator({ isOnline }: { isOnline: boolean }) {
  const [hasSavedChats, setHasSavedChats] = useState(false);

  useEffect(() => {
    if (!isOnline) {
      const chats = safeLocalStorage.listConversations();
      setHasSavedChats(chats.length > 0);
    }
  }, [isOnline]);

  if (isOnline) return null;

  return (
    <aside
      role="status"
      aria-live="polite"
      className="fixed bottom-[calc(var(--mobile-bottom-nav-h,58px)+env(safe-area-inset-bottom,0px)+12px)] md:bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-3.5 py-2 rounded-full bg-[#0d0915]/95 border border-[var(--border-accent)] shadow-2xl backdrop-blur-xl text-xs text-[var(--txt)] pointer-events-auto select-none transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
    >
      <div className="w-2 h-2 rounded-full bg-[var(--warn)] animate-pulse shrink-0" />
      <WifiOff className="w-3.5 h-3.5 text-[var(--warn)] shrink-0" />
      <span className="font-medium">
        {hasSavedChats
          ? "Offline Mode — Application shell and local chats available. Reconnect for AI inference."
          : "Offline Mode — Application shell is available. Reconnect for AI inference."}
      </span>
    </aside>
  );
}
