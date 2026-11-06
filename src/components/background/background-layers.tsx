"use client";

import React from "react";
import { ColorTheme, GradientStyle } from "@/lib/types/theme";
import { AuroraGradientBackground } from "./aurora-gradient-background";
import { AtmosphereCanvasEngine } from "./atmosphere-canvas-engine";
import { AtmosphericParticles } from "./atmospheric-particles";

interface BackgroundLayersProps {
  bgGradient?: string | null;
  theme?: ColorTheme;
  gradientStyle?: GradientStyle;
}

export function BackgroundLayers({
  bgGradient,
  theme,
  gradientStyle = "cinematic-studio",
}: BackgroundLayersProps) {
  const isWaves = gradientStyle === "waves";
  const isCosmic = gradientStyle === "cosmic";

  return (
    <>
      {/* ══ 21st.dev ANIMATED GRADIENT ENGINE (Ribbon Waves) ══ */}
      {theme && isWaves && (
        <AuroraGradientBackground theme={theme} styleMode={gradientStyle} />
      )}

      {/* ══ DIVERSE ATMOSPHERE CANVAS ENGINES (11 Distinct Interactive Modes) ══ */}
      {theme && !isWaves && !isCosmic && (
        <AtmosphereCanvasEngine theme={theme} engine={gradientStyle} />
      )}

      {/* ══ CINEMATIC FALLBACK GRADIENT (for Cosmic 3D mode) ══ */}
      {isCosmic && (
        <div
          className="fixed inset-0 pointer-events-none z-0 transition-all duration-700"
          style={{
            background: bgGradient || undefined,
          }}
        />
      )}

      {/* ══ SUBTLE ATMOSPHERIC CELESTIAL PARTICLES & DEPTH ══ */}
      <AtmosphericParticles />

      {/* ══ PROCEDURAL FILM GRAIN NOISE ══ */}
      <div
        className="fixed -inset-1/2 pointer-events-none z-[1] opacity-[0.028]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
        aria-hidden="true"
      />

      {/* ══ OPTICAL RADIAL VIGNETTE (Eliminates glare behind text, concentrates soft perimeter lighting) ══ */}
      <div
        className="fixed inset-0 pointer-events-none z-[2]"
        style={{
          background:
            "radial-gradient(ellipse 65% 55% at 50% 45%, rgba(6, 5, 10, 0.72) 0%, rgba(6, 5, 10, 0.25) 55%, rgba(6, 5, 10, 0.88) 100%)",
        }}
        aria-hidden="true"
      />

      {/* ══ 2.39:1 CINEMATIC VIEWFINDER CORNER GUIDES ══ */}
      <div className="fixed inset-0 pointer-events-none z-[3] hidden sm:block select-none opacity-25" aria-hidden="true">
        <div className="absolute top-3 left-3 w-3 h-3 border-t border-l border-white/40" />
        <div className="absolute top-3 right-3 w-3 h-3 border-t border-r border-white/40" />
        <div className="absolute bottom-3 left-3 w-3 h-3 border-b border-l border-white/40" />
        <div className="absolute bottom-3 right-3 w-3 h-3 border-b border-r border-white/40" />
      </div>
    </>
  );
}
