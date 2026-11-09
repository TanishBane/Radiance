"use client";

import React, { useState } from "react";

export function IntelligenceField() {
  const [sharingOn, setSharingOn] = useState(false);
  const [activeHighlight, setActiveHighlight] = useState<"note" | "pref" | null>(null);

  return (
    <figure
      className="landing-field"
      aria-label="An illustrative Radiance conversation"
    >
      <div className="landing-conversation">
        <span className="landing-chat-label" aria-hidden="true">
          Radiance · New conversation
        </span>
        <p className="landing-question">
          <span>Question</span>
          What belongs in the next chapter outline?
        </p>

        <svg
          className="landing-reference-lines"
          viewBox="0 0 760 300"
          preserveAspectRatio="none"
          aria-hidden="true"
        >
          <path
            className="landing-reference-line"
            pathLength="1"
            d="M508 86 C 520 82, 535 78, 550 74"
            style={{
              stroke: activeHighlight === "note" || sharingOn ? "var(--radiance-cyan)" : undefined,
              strokeWidth: activeHighlight === "note" || sharingOn ? 2 : undefined,
              transition: "stroke 0.25s ease, stroke-width 0.25s ease",
            }}
          />
          <path
            className="landing-reference-line"
            pathLength="1"
            d="M508 192 C 525 200, 535 208, 550 214"
            style={{
              stroke: activeHighlight === "pref" || sharingOn ? "var(--radiance-violet)" : undefined,
              strokeWidth: activeHighlight === "pref" || sharingOn ? 2 : undefined,
              transition: "stroke 0.25s ease, stroke-width 0.25s ease",
            }}
          />
        </svg>

        <p className="landing-answer">
          <strong
            style={{
              backgroundColor: activeHighlight === "pref" ? "rgba(139, 92, 246, 0.18)" : "transparent",
              borderRadius: "4px",
              padding: "1px 4px",
              transition: "background-color 0.2s ease",
            }}
          >
            Start with three sections.
          </strong>{" "}
          First, the question that frames the chapter. Then the evidence and its counterpoint. Close with what the reader should carry forward.{" "}
          <span
            style={{
              backgroundColor: activeHighlight === "note" ? "rgba(6, 182, 212, 0.18)" : "transparent",
              borderRadius: "4px",
              padding: "1px 4px",
              transition: "background-color 0.2s ease",
            }}
          >
            Keep citations inline so each idea stays connected to its source.
          </span>
        </p>
      </div>

      <aside className="landing-annotations" aria-label="Selected context">
        <h2>In the margin</h2>
        <dl
          className="landing-annotation"
          onClick={() => setActiveHighlight(activeHighlight === "note" ? null : "note")}
          style={{
            cursor: "pointer",
            outline: activeHighlight === "note" ? "1px solid var(--radiance-cyan)" : undefined,
            borderRadius: "8px",
            padding: "6px 8px",
            transition: "all 0.2s ease",
          }}
          title="Click to highlight in conversation"
        >
          <dt>Saved note</dt>
          <dd>Thesis: keep citations inline</dd>
        </dl>
        <dl
          className="landing-annotation"
          onClick={() => setActiveHighlight(activeHighlight === "pref" ? null : "pref")}
          style={{
            cursor: "pointer",
            outline: activeHighlight === "pref" ? "1px solid var(--radiance-violet)" : undefined,
            borderRadius: "8px",
            padding: "6px 8px",
            transition: "all 0.2s ease",
          }}
          title="Click to highlight in conversation"
        >
          <dt>Response preference</dt>
          <dd>More concise</dd>
        </dl>

        <div
          className="hero-sharing-control"
          onClick={() => setSharingOn(!sharingOn)}
          style={{ cursor: "pointer", userSelect: "none" }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSharingOn(!sharingOn);
            }
          }}
          aria-label={`Toggle example provider sharing. Currently ${sharingOn ? "on" : "off"}`}
        >
          <span>
            <strong>Share context with provider</strong>
            <small>{sharingOn ? "Illustrative · active for this demo" : "Illustrative · off by default"}</small>
          </span>
          <span
            className="hero-demo-toggle"
            role="img"
            aria-label={`Example setting: sharing is ${sharingOn ? "on" : "off"}`}
            style={{
              backgroundColor: sharingOn ? "var(--radiance-blue)" : undefined,
              borderColor: sharingOn ? "var(--radiance-blue)" : undefined,
              transition: "all 0.25s cubic-bezier(0.16, 1, 0.3, 1)",
            }}
          >
            <i
              style={{
                transform: sharingOn ? "translateX(15px)" : "translateX(0)",
                backgroundColor: sharingOn ? "#ffffff" : undefined,
                transition: "transform 0.25s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.25s ease",
              }}
            />
          </span>
        </div>
        <p className="landing-annotation-note">
          Relevant notes and preference labels are sent to the selected provider only when you turn sharing on.
        </p>
      </aside>
      <figcaption className="landing-demo-caption">
        <strong>A little context changes the next answer.</strong> Illustrative conversation · not connected to a profile or AI provider
      </figcaption>
    </figure>
  );
}
