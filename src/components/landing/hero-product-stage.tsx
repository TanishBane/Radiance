"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Terminal, 
  Send, 
  Mic, 
  Plus, 
  ChevronDown, 
  BookOpen, 
  Briefcase, 
  Compass, 
  Tag, 
  Play, 
  Flame, 
  Leaf,
  CheckCircle2,
  ShieldCheck
} from "lucide-react";
import "./hero-landscape.css";

interface SuggestionItem {
  id: string;
  label: string;
  category: "understand" | "create" | "explore";
  icon?: React.ReactNode;
  sampleReply: string;
  contextTag: string;
}

const SUGGESTIONS: Record<string, SuggestionItem[]> = {
  understand: [
    {
      id: "u-1",
      label: "character from a book",
      category: "understand",
      icon: <BookOpen className="w-3.5 h-3.5 text-cyan-400" />,
      sampleReply: "Analyzing character arc: In chapter 4, their motivations pivot from external validation to self-preservation, directly echoing your saved thesis notes.",
      contextTag: "Saved Note · Thesis context active"
    },
    {
      id: "u-2",
      label: "pack accordingly",
      category: "understand",
      icon: <Tag className="w-3.5 h-3.5 text-blue-400" />,
      sampleReply: "Tailored packing checklist prepared: prioritizing lightweight layers and technical gear based on your 4-day alpine trek preference.",
      contextTag: "Preference · Concise bullet format"
    },
    {
      id: "u-3",
      label: "research a topic",
      category: "understand",
      icon: <Play className="w-3.5 h-3.5 text-rose-400" />,
      sampleReply: "Synthesizing latest benchmark findings: Groq Llama-3.3 TTFT stands at 180ms with 0 token leakage across sessions.",
      contextTag: "Saved Note · Technical architecture"
    }
  ],
  create: [
    {
      id: "c-1",
      label: "job negotiation and accept...",
      category: "create",
      icon: <Briefcase className="w-3.5 h-3.5 text-blue-400" />,
      sampleReply: "Drafted formal counter-proposal: anchored on equity vesting schedule and remote flexibility, maintaining a respectful collaborative tone.",
      contextTag: "Preference · Professional tone"
    },
    {
      id: "c-2",
      label: "game night planning",
      category: "create",
      icon: <Flame className="w-3.5 h-3.5 text-amber-400" />,
      sampleReply: "Game night itinerary locked: 4 cooperative tabletop rounds sequenced for 6 players with zero elimination downtime.",
      contextTag: "Saved Note · 6-player boardgame group"
    },
    {
      id: "c-3",
      label: "out of office message",
      category: "create",
      icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
      sampleReply: "Concise OOO crafted: dates clearly demarcated, emergency escalation paths specified, zero unnecessary filler.",
      contextTag: "Preference · High conciseness"
    }
  ],
  explore: [
    {
      id: "e-1",
      label: "spring getaway",
      category: "explore",
      icon: <Compass className="w-3.5 h-3.5 text-emerald-400" />,
      sampleReply: "Curated 3 spring destinations within 3 hours train ride: quiet coastal routes, botanical trails, and curated local dining.",
      contextTag: "Saved Note · Prefers train travel"
    },
    {
      id: "e-2",
      label: "plant care tips",
      category: "explore",
      icon: <Leaf className="w-3.5 h-3.5 text-teal-400" />,
      sampleReply: "Monstera & Ficus moisture protocol: water only when top 2 inches dry out; direct morning sunlight recommended.",
      contextTag: "Preference · Step-by-step instructions"
    },
    {
      id: "e-3",
      label: "cooking trends",
      category: "explore",
      icon: <Flame className="w-3.5 h-3.5 text-coral-400" />,
      sampleReply: "Emerging trends: koji fermentation, high-hydration focaccia, and cold-pressed citrus marinades.",
      contextTag: "Preference · Structured overview"
    }
  ]
};

export function HeroProductStage() {
  const [activeSuggestion, setActiveSuggestion] = useState<SuggestionItem>(SUGGESTIONS.understand[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [sharingOn, setSharingOn] = useState(false);

  const handleSelectSuggestion = (item: SuggestionItem) => {
    setIsTyping(true);
    setActiveSuggestion(item);
    setTimeout(() => {
      setIsTyping(false);
    }, 280);
  };

  return (
    <div 
      className="hero-stage-container"
      role="region"
      aria-label="An illustrative Radiance conversation"
    >
      {/* Central Radiance Brand Header */}
      <div className="hero-stage-header">
        <div className="hero-stage-mark" aria-hidden="true">
          <div className="hero-stage-icon-box">
            <span className="hero-stage-r-logo">R</span>
          </div>
        </div>

        <h2 className="hero-stage-title">
          Hello, I Am <span className="hero-stage-radiance-gradient">Radiance</span>
        </h2>

        <p className="hero-stage-tagline">
          Illuminate what is possible. Stream real-time reasoning, analyze documents, generate Flux visuals, and explore complex ideas.
        </p>

        <div className="hero-stage-prompt-status">
          <span className="hero-stage-dot" aria-hidden="true" />
          <span>Tell me what&apos;s on your mind, or pick a suggestion.</span>
        </div>
      </div>

      {/* Suggestion Cards Triad */}
      <div className="hero-stage-triad">
        {/* Card 1: Understand (Cyan / Teal) */}
        <div className="hero-stage-card hero-stage-card-cyan">
          <div className="hero-stage-card-title text-cyan-300">
            Understand
          </div>
          <div className="hero-stage-pills">
            {SUGGESTIONS.understand.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className={`hero-stage-pill ${activeSuggestion.id === item.id ? "hero-stage-pill-active" : ""}`}
                aria-pressed={activeSuggestion.id === item.id}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Card 2: Create (Electric Blue / Sapphire) */}
        <div className="hero-stage-card hero-stage-card-blue">
          <div className="hero-stage-card-title text-blue-300">
            Create
          </div>
          <div className="hero-stage-pills">
            {SUGGESTIONS.create.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className={`hero-stage-pill ${activeSuggestion.id === item.id ? "hero-stage-pill-active" : ""}`}
                aria-pressed={activeSuggestion.id === item.id}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Card 3: Explore (Violet / Magenta) */}
        <div className="hero-stage-card hero-stage-card-violet">
          <div className="hero-stage-card-title text-violet-300">
            Explore
          </div>
          <div className="hero-stage-pills">
            {SUGGESTIONS.explore.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handleSelectSuggestion(item)}
                className={`hero-stage-pill ${activeSuggestion.id === item.id ? "hero-stage-pill-active" : ""}`}
                aria-pressed={activeSuggestion.id === item.id}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Floating Interactive Output Display */}
      <div className="hero-stage-output-preview" aria-live="polite">
        <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
          <div className="hero-stage-output-tag">
            <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            <span>{activeSuggestion.contextTag}</span>
          </div>

          <button
            type="button"
            onClick={() => setSharingOn(!sharingOn)}
            className="inline-flex items-center gap-1.5 min-h-[44px] text-xs text-slate-300 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-md border border-white/10 transition-colors touch-target"
            title="Toggle provider sharing for this demo"
          >
            <ShieldCheck className={`w-3 h-3 ${sharingOn ? "text-emerald-400" : "text-slate-400"}`} />
            <span>Provider sharing: {sharingOn ? "Allowed" : "Blocked"} (only when you turn sharing on)</span>
          </button>
        </div>

        <AnimatePresence mode="wait">
          <motion.p
            key={activeSuggestion.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="hero-stage-output-text"
          >
            {activeSuggestion.sampleReply}
          </motion.p>
        </AnimatePresence>

        <p className="mt-3 pt-2 border-t border-white/5 text-[0.775rem] text-slate-400">
          <strong>A little context changes the next answer.</strong> Illustrative conversation · not connected to a live profile.
        </p>
      </div>

      {/* Floating Luminous Composer Dock */}
      <div className="hero-stage-composer">
        <div className="hero-stage-input-row">
          <span className="hero-stage-placeholder">
            {isTyping ? "Applying saved context..." : `Ask RADIANCE about ${activeSuggestion.label}...`}
          </span>
        </div>
        
        <div className="hero-stage-controls-row">
          <div className="hero-stage-controls-left">
            <button 
              type="button" 
              className="hero-stage-btn-icon" 
              aria-label="Add attachment"
              title="Add attachment"
            >
              <Plus className="w-4 h-4 text-slate-400" />
            </button>
            
            <div className="hero-stage-model-badge">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Build</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            <div className="hero-stage-model-badge hero-stage-model-badge-active">
              <Sparkles className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="truncate max-w-[120px] xs:max-w-none">Radiance OpenWeights</span>
              <ChevronDown className="w-3 h-3 text-slate-400 shrink-0" />
            </div>
          </div>

          <div className="hero-stage-controls-right">
            <button 
              type="button" 
              className="hero-stage-btn-icon" 
              aria-label="Voice input"
              title="Voice input"
            >
              <Mic className="w-4 h-4 text-slate-400" />
            </button>
            
            <a 
              href="/chat"
              className="hero-stage-send-btn" 
              aria-label="Send message and launch chat"
              title="Send message"
            >
              <Send className="w-4 h-4 text-white" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
