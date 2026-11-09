"use client";

import React, { useState } from "react";

const CONTROLS = [
  {
    number: "01",
    title: "Notes you choose to keep",
    copy: "Save, edit, search, export, or delete your notes whenever you like.",
    tag: "ON THIS DEVICE",
  },
  {
    number: "02",
    title: "A style that feels like yours",
    copy: "Set your preferred level of detail, language complexity, examples, and practical guidance.",
    tag: "YOUR PREFERENCES",
  },
  {
    number: "03",
    title: "Sharing starts off",
    copy: "Choose whether relevant saved context can be included with a request to your selected provider.",
    tag: "OPT IN",
  },
] as const;

export function PersonalIntelligenceSection() {
  const [sharingOn, setSharingOn] = useState(false);

  return (
    <section id="intelligence-controls" className="landing-section story-intelligence">
      <div className="landing-shell">
        <div className="story-section-heading">
          <div>
            <p className="story-eyebrow">Personal Intelligence</p>
            <h2 className="landing-section-title">
              A little more you.
              <br />A lot more in reach.
            </h2>
          </div>
          <p className="landing-copy">
            One considered place in Settings for the context you want to carry forward. You stay in charge of what lives here and what gets shared.
          </p>
        </div>
        <div className="story-control-layout">
          <div className="story-control-list">
            {CONTROLS.map((item) => (
              <article className="story-control" key={item.number}>
                <span className="story-control-number">{item.number}</span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.copy}</p>
                </div>
                <span className="story-control-tag">{item.tag}</span>
              </article>
            ))}
          </div>
          <aside
            className="story-settings"
            aria-label="Illustrative Personal Intelligence settings preview"
          >
            <div className="story-settings-top">
              <span>RADIANCE / SETTINGS</span>
              <span>•••</span>
            </div>
            <span className="story-settings-kicker">ILLUSTRATIVE PREVIEW · SAMPLE DATA</span>
            <h3>Personal Intelligence</h3>
            <p className="story-settings-description">
              Choose what to remember and how to respond.
            </p>
            <div className="story-setting-row">
              <span>
                <strong>Saved notes</strong>
                <small>Project details and useful context</small>
              </span>
              <span className="story-setting-count">04</span>
            </div>
            <div className="story-setting-row">
              <span>
                <strong>Answer style</strong>
                <small>Concise · Practical · More examples</small>
              </span>
              <span aria-hidden="true">↗</span>
            </div>
            <div
              className="story-setting-row"
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
              aria-label={`Toggle illustrative sharing setting: currently ${sharingOn ? "on" : "off"}`}
            >
              <span>
                <strong>Share relevant notes</strong>
                <small>Include notes with provider requests</small>
              </span>
              <span
                className="story-toggle"
                aria-hidden="true"
                style={{
                  backgroundColor: sharingOn ? "var(--radiance-blue)" : undefined,
                  borderColor: sharingOn ? "var(--radiance-blue)" : undefined,
                  transition: "all 0.25s ease",
                }}
              >
                <span
                  style={{
                    transform: sharingOn ? "translateX(16px)" : "translateX(0)",
                    backgroundColor: sharingOn ? "#ffffff" : undefined,
                    transition: "transform 0.25s ease, background-color 0.25s ease",
                  }}
                />
              </span>
            </div>
            <span className="story-settings-footnote">
              {sharingOn
                ? "EXAMPLE · Sharing is on; relevant notes may be attached."
                : "EXAMPLE · Sharing is off; notes are not attached to requests."}
            </span>
          </aside>
        </div>
      </div>
    </section>
  );
}
