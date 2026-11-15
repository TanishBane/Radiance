"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
import { 
  SlidersHorizontal, 
  Sparkles, 
  Layers, 
  Terminal, 
  BookOpen, 
  Check, 
  Code2 
} from "lucide-react";
import { motionEasing } from "@/lib/motion/presets";
import "./personal-intelligence-story.css";

type PreferenceMode = "concise" | "detailed" | "structured";

interface ModeDetail {
  id: PreferenceMode;
  label: string;
  badge: string;
  tag: string;
  icon: React.ComponentType<{ className?: string }>;
  userPrompt: string;
  output: React.ReactNode;
}

const MODES: Record<PreferenceMode, ModeDetail> = {
  concise: {
    id: "concise",
    label: "Concise",
    badge: "Concise",
    tag: "Quick Read · Core Essentials",
    icon: Sparkles,
    userPrompt: "How does distributed consensus work in Raft?",
    output: (
      <div className="space-y-3">
        <p className="text-white text-base leading-relaxed">
          <strong className="text-violet-300 font-semibold">Raft</strong> elects a single leader via randomized election timers. All log entries flow unidirectionally from Leader → Followers.
        </p>
        <div className="p-3 rounded-lg bg-black/40 border border-violet-500/20 text-sm text-slate-300 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-violet-400" aria-hidden="true" />
          <span>A log entry commits once acknowledged by a strict majority of nodes (<code>⌊N/2⌋ + 1</code>).</span>
        </div>
      </div>
    )
  },
  detailed: {
    id: "detailed",
    label: "Detailed",
    badge: "Detailed",
    tag: "Comprehensive · In-depth Analysis",
    icon: BookOpen,
    userPrompt: "How does distributed consensus work in Raft?",
    output: (
      <div className="space-y-3.5 text-sm leading-relaxed">
        <p className="text-slate-200">
          Raft decomposes consensus into three independent sub-problems to maximize understandability and formal verification:
        </p>
        <div className="space-y-2 border-l-2 border-violet-500/30 pl-3">
          <p className="text-slate-300">
            <strong className="text-white">1. Leader Election:</strong> Nodes start as Followers. If heartbeat intervals lapse, nodes transition to Candidate, increment their <em>Term counter</em>, and request votes.
          </p>
          <p className="text-slate-300">
            <strong className="text-white">2. Log Replication:</strong> The elected leader accepts client requests, appends them to its local WAL (Write-Ahead Log), and dispatches <code>AppendEntries</code> RPCs.
          </p>
          <p className="text-slate-300">
            <strong className="text-white">3. Safety Invariants:</strong> The <em>Leader Completeness Property</em> guarantees that if a log entry is committed in a given term, that entry will be present in the logs of all leaders across subsequent terms.
          </p>
        </div>
      </div>
    )
  },
  structured: {
    id: "structured",
    label: "Structured",
    badge: "Structured",
    tag: "Machine Readable · Matrix & Code",
    icon: Terminal,
    userPrompt: "How does distributed consensus work in Raft?",
    output: (
      <div className="space-y-3 font-mono text-xs">
        <div className="p-3 rounded-lg bg-black/50 border border-white/10 space-y-2">
          <div className="text-amber-400 font-bold uppercase tracking-wider flex items-center gap-2">
            <Code2 className="w-3.5 h-3.5" />
            <span>State Machine Transitions</span>
          </div>
          <div className="text-slate-300 pl-2 border-l border-white/10 space-y-1">
            <div>• Follower  → [heartbeat timeout] → Candidate</div>
            <div>• Candidate → [majority votes]    → Leader</div>
            <div>• Leader    → [higher term seen]  → Follower</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-black/50 border border-cyan-500/20 space-y-1.5">
          <div className="text-cyan-400 font-bold uppercase tracking-wider">Quorum Threshold Model</div>
          <div className="text-slate-300">
            <code>Commit_Rule = Count(Acks) &gt; TotalNodes / 2</code>
          </div>
        </div>
      </div>
    )
  }
};

export function PreferenceSandbox() {
  const [selectedMode, setSelectedMode] = useState<PreferenceMode>("concise");
  const current = MODES[selectedMode];
  const shouldReduceMotion = useReducedMotion();

  return (
    <section 
      id="preferences"
      className="preference-sandbox-section section-atmosphere-preferences"
      aria-labelledby="preferences-heading"
    >
      <div className="preference-sandbox-shell">
        <motion.div 
          className="preference-sandbox-header"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, ease: motionEasing.entrance }}
        >
          <div className="preference-eyebrow">
            <SlidersHorizontal className="w-3.5 h-3.5 text-amber-400" />
            <span>Section 04 · Response Calibration</span>
          </div>

          <h2 id="preferences-heading" className="preference-title">
            An answer should feel right for you.
          </h2>

          <p className="preference-lede">
            Switch between formatting preferences to witness how Radiance adapts the structure, density, and cadence of identical questions without loss of technical rigor.
          </p>
        </motion.div>

        {/* Sandbox Stage */}
        <motion.div 
          className="preference-stage-container"
          initial={shouldReduceMotion ? false : { opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.6, delay: 0.1, ease: motionEasing.entrance }}
        >
          {/* Segmented Control Bar */}
          <div className="preference-toggle-bar" role="group" aria-label="Response style">
            {(["concise", "detailed", "structured"] as PreferenceMode[]).map((mode) => {
              const item = MODES[mode];
              const isActive = selectedMode === mode;
              const ModeIcon = item.icon;
              return (
                <button
                  key={mode}
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setSelectedMode(mode)}
                  className={`preference-toggle-btn touch-target ${isActive ? "preference-toggle-btn-active" : ""}`}
                >
                  <ModeIcon className="w-3.5 h-3.5 opacity-80" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Dynamic Result Card */}
          <div className="preference-result-card">
            <div className="preference-result-meta">
              <div className="flex items-center gap-2">
                <span className="preference-result-label">
                  {current.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {current.tag}
                </span>
              </div>
              <span className="text-xs text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-md">
                Prompt: &ldquo;{current.userPrompt}&rdquo;
              </span>
            </div>

            <div className="preference-result-body" aria-live="polite">
              <AnimatePresence mode="wait">
                <motion.div
                  key={selectedMode}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                  transition={shouldReduceMotion ? { duration: 0 } : { duration: 0.2, ease: motionEasing.entrance }}
                >
                  {current.output}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>

          <p className="preference-demo-note">
            Illustrative demonstration · Response preferences are configurable in Radiance settings
          </p>
        </motion.div>
      </div>
    </section>
  );
}
