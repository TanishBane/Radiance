"use client";

import React, { useEffect, useState } from "react";
import { Sparkles, SkipForward, Pause, Play } from "lucide-react";
import { ChatbotThemePreset, CHATBOT_STARFIELD_THEMES } from "./webgl-starfield";

export function DynamicThemeIndicator() {
  const [themeState, setThemeState] = useState<{
    current: ChatbotThemePreset;
    next: ChatbotThemePreset;
    progress: number;
    timeLeft: number;
    isPaused: boolean;
  }>({
    current: CHATBOT_STARFIELD_THEMES[0],
    next: CHATBOT_STARFIELD_THEMES[1],
    progress: 0,
    timeLeft: 45,
    isPaused: false,
  });

  useEffect(() => {
    const handleUpdate = (e: Event) => {
      const customEvent = e as CustomEvent<{
        current: ChatbotThemePreset;
        next: ChatbotThemePreset;
        progress: number;
        timeLeft: number;
        isPaused: boolean;
      }>;
      if (customEvent.detail) {
        setThemeState(customEvent.detail);
      }
    };

    window.addEventListener("radiance:theme-update", handleUpdate);
    return () => {
      window.removeEventListener("radiance:theme-update", handleUpdate);
    };
  }, []);

  const handleNext = () => {
    window.dispatchEvent(new CustomEvent("radiance:theme-next"));
  };

  const handleTogglePause = () => {
    window.dispatchEvent(new CustomEvent("radiance:theme-toggle-pause"));
    setThemeState((prev) => ({ ...prev, isPaused: !prev.isPaused }));
  };

  return (
    <div 
      className="fixed bottom-6 right-6 z-40 hidden sm:flex items-center gap-3 px-3.5 py-2 rounded-full bg-[#0a0f24]/85 border border-white/12 shadow-[0_12px_32px_rgba(0,0,0,0.6)] backdrop-blur-xl text-xs text-slate-300 pointer-events-auto transition-all hover:border-white/25"
      role="region"
      aria-label="Dynamic 45-second background theme controller"
    >
      <div className="flex items-center gap-2">
        <span 
          className="w-2.5 h-2.5 rounded-full transition-colors duration-500 shadow-sm"
          style={{ 
            backgroundColor: themeState.current.accent,
            boxShadow: `0 0 10px ${themeState.current.accent}`
          }}
          aria-hidden="true"
        />
        <span className="font-semibold text-white tracking-wide flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
          <span>{themeState.current.name}</span>
        </span>
      </div>

      <span className="text-slate-500 font-mono">→</span>

      <span className="text-slate-400 font-medium hidden md:inline">
        {themeState.next.name}
      </span>

      <div className="flex items-center gap-2 pl-1 border-l border-white/10">
        <span className="font-mono text-[11px] text-cyan-300 bg-cyan-950/60 px-1.5 py-0.5 rounded border border-cyan-800/40">
          {themeState.timeLeft}s
        </span>

        <div className="w-10 h-1.5 bg-white/10 rounded-full overflow-hidden relative">
          <div 
            className="h-full rounded-full transition-all duration-300"
            style={{ 
              width: `${Math.round(themeState.progress * 100)}%`,
              backgroundColor: themeState.current.accent 
            }}
          />
        </div>

        <button
          type="button"
          onClick={handleNext}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title="Jump to next chatbot theme"
          aria-label="Next theme"
        >
          <SkipForward className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={handleTogglePause}
          className="p-1 rounded hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
          title={themeState.isPaused ? "Resume 45s fade" : "Pause 45s fade"}
          aria-label={themeState.isPaused ? "Resume theme cycle" : "Pause theme cycle"}
        >
          {themeState.isPaused ? (
            <Play className="w-3.5 h-3.5 text-emerald-400" />
          ) : (
            <Pause className="w-3.5 h-3.5 text-amber-400" />
          )}
        </button>
      </div>
    </div>
  );
}