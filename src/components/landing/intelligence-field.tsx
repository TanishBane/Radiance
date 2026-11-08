"use client";

import { useReducedMotion } from "motion/react";
import { useRef } from "react";
import { RADIANCE_SYMBOL_STRIPES } from "@/components/branding/radiance-logo";

const NOTES = [
  { x: "8%", y: "18%", text: "Prefers concise answers with one worked example" },
  { x: "70%", y: "12%", text: "Thesis outline lives in weekly research notes" },
  { x: "6%", y: "68%", text: "Explain architecture before showing code" },
  { x: "64%", y: "74%", text: "Do not share context unless sharing is enabled" },
] as const;

export function IntelligenceField() {
  const reduce = useReducedMotion();
  const fieldRef = useRef<HTMLDivElement>(null);

  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (reduce) return;
    const node = fieldRef.current;
    if (!node) return;
    const bounds = node.getBoundingClientRect();
    const x = ((event.clientX - bounds.left) / bounds.width) * 100;
    const y = ((event.clientY - bounds.top) / bounds.height) * 100;
    node.style.setProperty("--lx", `${x}%`);
    node.style.setProperty("--ly", `${y}%`);
  };

  return (
    <div
      ref={fieldRef}
      className="landing-field"
      onPointerMove={onPointerMove}
      aria-hidden="true"
    >
      <svg viewBox="0 0 800 700" fill="none">
        <g fill="currentColor" opacity="0.86" transform="translate(90 40) scale(0.78)">
          {RADIANCE_SYMBOL_STRIPES.map((stripe) => (
            <path key={stripe.id} d={stripe.d} />
          ))}
        </g>
        <g stroke="currentColor" strokeOpacity="0.18" fill="none">
          <path d="M220 210 C 300 260, 360 280, 420 330" />
          <path d="M520 180 C 500 250, 470 300, 430 340" />
          <path d="M210 470 C 280 430, 340 400, 410 360" />
          <path d="M540 490 C 500 430, 460 390, 424 350" />
        </g>
        <circle cx="410" cy="340" r="7" fill="var(--accent)" />
      </svg>
      {NOTES.map((note) => (
        <div key={note.text} className="landing-note" style={{ left: note.x, top: note.y }}>
          {note.text}
        </div>
      ))}
    </div>
  );
}
