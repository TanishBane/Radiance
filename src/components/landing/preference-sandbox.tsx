"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sliders, 
  AlignLeft, 
  ListTree, 
  FileCode2, 
  Sparkles,
  Info
} from "lucide-react";
import "./personal-intelligence-story.css";

type PreferenceMode = "concise" | "detailed" | "structured";

interface ModeDetail {
  id: PreferenceMode;
  label: string;
  badge: string;
  icon: React.ReactNode;
  userPrompt: string;
  output: React.ReactNode;
}

const MODES: Record<PreferenceMode, ModeDetail> = {
  concise: {
    id: "concise",
    label: "Concise",
    badge: "Preference: High Signal · Zero Filler",
    icon: <AlignLeft className="w-4 h-4" />,
    userPrompt: "How does distributed consensus work in Raft?",
    output: (
      <div className="space-y-2">
        <p>
          <strong>Raft</strong> elects a single leader via randomized election timers. All log entries flow unidirectionally from Leader → Followers.
        </p>
        <p className="text-slate-300">
          A log entry commits once acknowledged by a strict majority of nodes (<code>⌊N/2⌋ + 1</code>).
        </p>
      </div>
    )
  },
  detailed: {
    id: "detailed",
    label: "Detailed",
    badge: "Preference: Deep Analytical Exposition",
    icon: <FileCode2 className="w-4 h-4" />,
    userPrompt: "How does distributed consensus work in Raft?",
    output: (
      <div className="space-y-3">
        <p>
          Raft decomposes consensus into three independent sub-problems to maximize understandability and formal verification:
        </p>
        <p className="text-slate-300">
          <strong>1. Leader Election:</strong> Nodes start as Followers. If heartbeat intervals lapse, nodes transition to Candidate, increment their <em>Term counter</em>, and request votes.
        </p>
        <p className="text-slate-300">
          <strong>2. Log Replication:</strong> The elected leader accepts client requests, appends them to its local WAL (Write-Ahead Log), and dispatches <code>AppendEntries</code> RPCs.
        </p>
        <p className="text-slate-300">
          <strong>3. Safety Invariants:</strong> The <em>Leader Completeness Property</em> guarantees that if a log entry is committed in a given term, that entry will be present in the logs of all leaders across subsequent terms.
        </p>
      </div>
    )
  },
  structured: {
    id: "structured",
    label: "Structured",
    badge: "Preference: Tabular & Architectural Hierarchy",
    icon: <ListTree className="w-4 h-4" />,
    userPrompt: "How does distributed consensus work in Raft?",
    output: (
      <div className="space-y-3 font-mono text-xs">
        <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1.5">
          <div className="text-amber-400 font-bold uppercase tracking-wider">State Machine Matrix:</div>
          <div className="text-slate-300">• Follower  → (heartbeat timeout) → Candidate</div>
          <div className="text-slate-300">• Candidate → (majority votes)    → Leader</div>
          <div className="text-slate-300">• Leader    → (higher term seen)  → Follower</div>
        </div>
        <div className="p-2.5 rounded bg-black/40 border border-white/5 space-y-1.5">
          <div className="text-cyan-400 font-bold uppercase tracking-wider">Quorum Threshold:</div>
          <div className="text-slate-300"><code>Commit_Rule = Count(Acks) &gt; TotalNodes / 2</code></div>
        </div>
      </div>
    )
  }
};

export function PreferenceSandbox() {
  const [selectedMode, setSelectedMode] = useState<PreferenceMode>("concise");
  const current = MODES[selectedMode];

  return (
    <section 
      id="preferences"
      className="preference-sandbox-section section-atmosphere-preferences"
      aria-labelledby="preferences-heading"
    >
      <div className="preference-sandbox-shell">
        <motion.div 
          className="preference-sandbox-header"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
        >
          <h2 id="preferences-heading" className="preference-title">
            An answer should feel right for you.
          </h2>

          <p className="preference-lede">
            Switch between formatting preferences to witness how Radiance adapts the structure, density, and cadence of identical questions without loss of technical rigor.
          </p>
        </motion.div>

        {/* Sandbox Stage */}
        <div className="preference-stage-container">
          {/* Segmented Control Bar */}
          <div className="preference-toggle-bar" role="tablist" aria-label="Response Preferences">
            {(["concise", "detailed", "structured"] as PreferenceMode[]).map((mode) => {
              const item = MODES[mode];
              const isActive = selectedMode === mode;
              return (
                <button
                  key={mode}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedMode(mode)}
                  className={`preference-toggle-btn ${isActive ? "preference-toggle-btn-active" : ""}`}
                >
                  {item.icon}
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Result Card */}
          <div className="preference-result-card">
            <div className="preference-result-meta">
              <span className="text-xs font-mono text-amber-400 font-semibold tracking-wide flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                {current.badge}
              </span>
              <span className="text-xs text-slate-400">
                Prompt: &ldquo;{current.userPrompt}&rdquo;
              </span>
            </div>

            <div className="preference-result-body" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedMode}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.22 }}
                >
                  {current.output}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-slate-400">
            <Info className="w-3.5 h-3.5 text-amber-400" />
            <span>Illustrative demonstration · Configurable live in Radiance Settings Center</span>
          </div>
        </div>
      </div>
    </section>
  );
}
