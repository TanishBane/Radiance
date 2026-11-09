"use client";

import React from "react";
import "./fluted-glass-torus.css";

export function FlutedGlassTorus() {
  return (
    <div className="fluted-stage-shell" aria-hidden="true">
      {/* Ambient background glow */}
      <div className="fluted-stage-ambient" />

      {/* The Aurora Torus Light Ring (Synasite Reference) */}
      <div className="aurora-torus-container">
        <svg 
          className="aurora-torus-svg" 
          viewBox="0 0 400 400" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="torusGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.95" />
              <stop offset="35%" stopColor="#84cc16" stopOpacity="0.9" />
              <stop offset="70%" stopColor="#06b6d4" stopOpacity="0.95" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.85" />
            </linearGradient>
            <linearGradient id="torusGrad2" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.9" />
              <stop offset="50%" stopColor="#14b8a6" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.9" />
            </linearGradient>
            <filter id="torusHeavyGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="22" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="12" result="blur2" />
              <feMerge>
                <feMergeNode in="blur1" />
                <feMergeNode in="blur2" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <filter id="torusAtmosphere" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="40" />
            </filter>
          </defs>

          {/* Deep atmospheric aura */}
          <circle
            cx="200"
            cy="200"
            r="125"
            stroke="url(#torusGrad1)"
            strokeWidth="56"
            filter="url(#torusAtmosphere)"
            opacity="0.6"
          />

          {/* Sharp glowing torus core */}
          <circle
            cx="200"
            cy="200"
            r="125"
            stroke="url(#torusGrad1)"
            strokeWidth="38"
            strokeLinecap="round"
            filter="url(#torusHeavyGlow)"
          />

          {/* Inner chromatic highlight */}
          <circle
            cx="200"
            cy="200"
            r="125"
            stroke="url(#torusGrad2)"
            strokeWidth="16"
            strokeDasharray="450 150"
            filter="url(#torusHeavyGlow)"
            opacity="0.9"
          />
        </svg>
      </div>

      {/* Fluted Vertical Glass Reeded Slats (Synasite Slit-Scan Refraction) */}
      <div className="fluted-reeding-grid">
        {[1, 2, 3, 4, 5, 6].map((slat) => (
          <div key={slat} className="fluted-slat">
            <div className="fluted-slat-sheen" />
            <div className="fluted-slat-refract" />
            <div className="fluted-slat-bevel" />
          </div>
        ))}
      </div>

      {/* Retreats Illuminated Topography Perspective Grid */}
      <div className="retreats-topography-stage">
        <div className="topography-grid-mesh" />
        <div className="topography-heat-horizon" />
      </div>

      {/* Boutique Technical Telemetry Badges */}
      <div className="fluted-stage-badge top-right">
        <span className="fluted-badge-dot" />
        <span>OPTICAL REFRACTION 01</span>
      </div>

      <div className="fluted-stage-badge bottom-left">
        <span>AURORA TORUS · 60 FPS</span>
      </div>
    </div>
  );
}
