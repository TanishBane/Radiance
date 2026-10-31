import React from "react";

export function BackgroundLayers({ bgGradient }: { bgGradient?: string | null }) {
  return (
    <>
      {/* ══ AMBIENT GRADIENT MESH ══ */}
      <div
        className="fixed inset-0 pointer-events-none z-0 transition-all duration-700"
        style={{
          background: bgGradient || undefined,
        }}
      />

      {/* ══ PROCEDURAL FILM GRAIN NOISE ══ */}
      <div
        className="fixed -inset-1/2 pointer-events-none z-[1] opacity-[0.032]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
        aria-hidden="true"
      />

      {/* ══ OPTICAL RADIAL VIGNETTE ══ */}
      <div
        className="fixed inset-0 pointer-events-none z-[2]"
        style={{
          background: "radial-gradient(ellipse 75% 75% at 50% 50%, transparent 40%, rgba(0, 0, 0, 0.6) 100%)",
        }}
        aria-hidden="true"
      />
    </>
  );
}
