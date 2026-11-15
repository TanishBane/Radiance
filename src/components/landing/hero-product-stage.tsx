"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "motion/react";
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
  Bookmark,
  SlidersHorizontal,
  ShieldCheck,
  CheckCircle2
} from "lucide-react";
import { RadianceLogo } from "@/components/branding/radiance-logo";
import { motionEasing } from "@/lib/motion/presets";
import "./hero-landscape.css";

interface SuggestionItem {
  id: string;
  label: string;
  category: "understand" | "create" | "explore";
  icon: React.ReactNode;
  sampleReply: string;
  noteTag: string;
  prefTag: string;
  contextTag: string;
}

type CategoryKey = "understand" | "create" | "explore";

const CATEGORIES: { key: CategoryKey; label: string; icon: React.ReactNode; color: string }[] = [
  { key: "understand", label: "Understand", icon: <BookOpen className="w-3.5 h-3.5 text-cyan-400" />, color: "cyan" },
  { key: "create", label: "Create", icon: <Sparkles className="w-3.5 h-3.5 text-blue-400" />, color: "blue" },
  { key: "explore", label: "Explore", icon: <Compass className="w-3.5 h-3.5 text-violet-400" />, color: "violet" },
];

const SUGGESTIONS: Record<CategoryKey, SuggestionItem[]> = {
  understand: [
    {
      id: "u-1",
      label: "character from a book",
      category: "understand",
      icon: <BookOpen className="w-3.5 h-3.5 text-cyan-400" />,
      sampleReply: "Analyzing character arc: In chapter 4, their motivations pivot from external validation to self-preservation, directly echoing your saved thesis notes.",
      noteTag: "Thesis: keep citations inline",
      prefTag: "More concise",
      contextTag: "Saved note · Thesis context active",
    },
    {
      id: "u-2",
      label: "pack accordingly",
      category: "understand",
      icon: <Tag className="w-3.5 h-3.5 text-cyan-300" />,
      sampleReply: "Tailored packing checklist prepared: prioritizing lightweight layers and technical gear based on your 4-day alpine trek preference.",
      noteTag: "4-day alpine trek gear checklist",
      prefTag: "Concise bullet format",
      contextTag: "Preference · Concise bullet format",
    },
    {
      id: "u-3",
      label: "research a topic",
      category: "understand",
      icon: <Play className="w-3.5 h-3.5 text-rose-400" />,
      sampleReply: "Synthesizing latest benchmark findings: Groq Llama-3.3 TTFT stands at 180ms with 0 token leakage across sessions.",
      noteTag: "Distributed consensus & Raft logs",
      prefTag: "High technical precision",
      contextTag: "Saved note · Technical architecture",
    },
  ],
  create: [
    {
      id: "c-1",
      label: "job negotiation and accept...",
      category: "create",
      icon: <Briefcase className="w-3.5 h-3.5 text-blue-400" />,
      sampleReply: "Drafted formal counter-proposal: anchored on equity vesting schedule and remote flexibility, maintaining a respectful collaborative tone.",
      noteTag: "Target compensation breakdown",
      prefTag: "Professional collaborative tone",
      contextTag: "Preference · Professional tone",
    },
    {
      id: "c-2",
      label: "game night planning",
      category: "create",
      icon: <Flame className="w-3.5 h-3.5 text-amber-400" />,
      sampleReply: "Game night itinerary locked: 4 cooperative tabletop rounds sequenced for 6 players with zero elimination downtime.",
      noteTag: "6-player boardgame group",
      prefTag: "Structured timeline",
      contextTag: "Saved note · 6-player boardgame group",
    },
    {
      id: "c-3",
      label: "out of office message",
      category: "create",
      icon: <Sparkles className="w-3.5 h-3.5 text-cyan-400" />,
      sampleReply: "Concise OOO crafted: dates clearly demarcated, emergency escalation paths specified, zero unnecessary filler.",
      noteTag: "Coverage handover: Sarah & David",
      prefTag: "More concise",
      contextTag: "Preference · High conciseness",
    },
  ],
  explore: [
    {
      id: "e-1",
      label: "spring getaway",
      category: "explore",
      icon: <Compass className="w-3.5 h-3.5 text-emerald-400" />,
      sampleReply: "Curated 3 spring destinations within 3 hours train ride: quiet coastal routes, botanical trails, and curated local dining.",
      noteTag: "Prefers train travel",
      prefTag: "Curated recommendations",
      contextTag: "Saved note · Prefers train travel",
    },
    {
      id: "e-2",
      label: "plant care tips",
      category: "explore",
      icon: <Leaf className="w-3.5 h-3.5 text-teal-400" />,
      sampleReply: "Monstera & Ficus moisture protocol: water only when top 2 inches dry out; direct morning sunlight recommended.",
      noteTag: "Indoor humidity 45%",
      prefTag: "Step-by-step instructions",
      contextTag: "Preference · Step-by-step instructions",
    },
    {
      id: "e-3",
      label: "cooking trends",
      category: "explore",
      icon: <Flame className="w-3.5 h-3.5 text-rose-400" />,
      sampleReply: "Emerging trends: koji fermentation, high-hydration focaccia, and cold-pressed citrus marinades.",
      noteTag: "Fermentation & sourdough focus",
      prefTag: "Structured overview",
      contextTag: "Preference · Structured overview",
    },
  ],
};

export function HeroProductStage() {
  const shouldReduceMotion = useReducedMotion();
  const [activeCategory, setActiveCategory] = useState<CategoryKey>("understand");
  const [activeSuggestion, setActiveSuggestion] = useState<SuggestionItem>(SUGGESTIONS.understand[0]);
  const [isTyping, setIsTyping] = useState(false);
  const [sharingOn, setSharingOn] = useState(false);

  const handleSelectSuggestion = (item: SuggestionItem) => {
    if (activeSuggestion.id === item.id) return;
    setIsTyping(true);
    setActiveSuggestion(item);
    setActiveCategory(item.category);
    setTimeout(() => {
      setIsTyping(false);
    }, 280);
  };

  const handleSelectCategory = (cat: CategoryKey) => {
    setActiveCategory(cat);
    if (activeSuggestion.category !== cat) {
      handleSelectSuggestion(SUGGESTIONS[cat][0]);
    }
  };

  return (
    <figure 
      className="hero-stage-container"
      aria-label="An illustrative Radiance conversation"
    >
      {/* Central Radiance Brand Header */}
      <div className="hero-stage-header">
        <h2 className="hero-stage-title">
          Hello, I Am <span className="hero-stage-brand-lockup" role="img" aria-label="Radiance">
            <RadianceLogo variant="symbol" size="md" showWordmark={false} className="hero-stage-brand-symbol [&>svg]:!w-full [&>svg]:!h-full" aria-hidden />
            <span className="hero-stage-radiance-gradient">adiance</span>
          </span>
        </h2>

        <p className="hero-stage-tagline">
          Illuminate what is possible. Stream real-time reasoning, analyze documents, generate Flux visuals, and explore complex ideas.
        </p>

        <div className="hero-stage-prompt-status">
          <span className="hero-stage-dot" aria-hidden="true" />
          <span>Tell me what&apos;s on your mind, or pick a suggestion.</span>
        </div>
      </div>

      {/* Responsive Category Selector Tabs */}
      <div 
        className="hero-stage-category-tabs" 
        role="tablist" 
        aria-label="Suggestion category tabs"
      >
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              tabIndex={isActive ? 0 : -1}
              onClick={() => handleSelectCategory(cat.key)}
              className={`hero-stage-tab-btn ${isActive ? "hero-stage-tab-btn-active" : ""}`}
            >
              {cat.icon}
              <span>{cat.label}</span>
              <span className="hero-stage-tab-count">3</span>
            </button>
          );
        })}
      </div>

      {/* Suggestion Cards Triad */}
      <div className="hero-stage-triad">
        {CATEGORIES.map((cat) => {
          const isCurrentCat = activeCategory === cat.key;
          return (
            <div 
              key={cat.key}
              className={`hero-stage-card hero-stage-card-${cat.color} ${isCurrentCat ? "hero-stage-card-focused" : ""}`}
            >
              <div className="hero-stage-card-header">
                <span className={`hero-stage-card-title text-${cat.color}-300 flex items-center gap-1.5`}>
                  {cat.icon}
                  {cat.label}
                </span>
                {isCurrentCat && (
                  <span className="hero-stage-card-active-dot" aria-label="Active category" />
                )}
              </div>

              <div className="hero-stage-pills">
                {SUGGESTIONS[cat.key].map((item) => {
                  const isSelected = activeSuggestion.id === item.id;
                  return (
                    <motion.button
                      key={item.id}
                      type="button"
                      onClick={() => handleSelectSuggestion(item)}
                      className={`hero-stage-pill ${isSelected ? "hero-stage-pill-active" : ""}`}
                      aria-pressed={isSelected}
                      whileHover={shouldReduceMotion ? undefined : { scale: 1.015, x: 2 }}
                      whileTap={shouldReduceMotion ? undefined : { scale: 0.985 }}
                      transition={{ duration: 0.16 }}
                    >
                      <span className="hero-stage-pill-icon">{item.icon}</span>
                      <span className="hero-stage-pill-label truncate">{item.label}</span>
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 ml-auto shrink-0" />
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Interactive Output Display */}
      <div className="hero-stage-output-preview" aria-live="polite">
        <div className="hero-stage-tags-row">
          <div className="hero-stage-context-pills">
            <span className="hero-stage-context-badge hero-stage-context-note">
              <Bookmark className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hero-stage-tag-type">Saved note</span>
              <span className="hero-stage-tag-sep">·</span>
              <span className="hero-stage-tag-val">{activeSuggestion.noteTag}</span>
            </span>

            <span className="hero-stage-context-badge hero-stage-context-pref">
              <SlidersHorizontal className="w-3.5 h-3.5 text-violet-400 shrink-0" />
              <span className="hero-stage-tag-type">Response preference</span>
              <span className="hero-stage-tag-sep">·</span>
              <span className="hero-stage-tag-val">{activeSuggestion.prefTag}</span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSharingOn(!sharingOn)}
            className={`hero-stage-sharing-toggle ${sharingOn ? "hero-stage-sharing-active" : ""}`}
            title="Toggle provider sharing for this demo"
            aria-pressed={sharingOn}
          >
            <ShieldCheck className={`w-3.5 h-3.5 ${sharingOn ? "text-emerald-400" : "text-slate-400"}`} />
            <span>Provider sharing: {sharingOn ? "Allowed" : "Blocked"} (only when you turn sharing on)</span>
          </button>
        </div>

        {/* Conversation Dialogue Flow */}
        <div className="hero-stage-dialogue-card">
          <div className="hero-stage-user-bubble">
            <span className="hero-stage-bubble-avatar">You</span>
            <span className="hero-stage-bubble-query">“Ask RADIANCE about {activeSuggestion.label}”</span>
          </div>

          <div className="hero-stage-ai-bubble">
            <div className="hero-stage-ai-avatar">
              <RadianceLogo variant="symbol" size="sm" aria-hidden />
            </div>
            <div className="hero-stage-ai-content">
              <AnimatePresence mode="wait">
                {isTyping ? (
                  <motion.div
                    key="typing-stream"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="hero-stage-typing-indicator"
                  >
                    <span className="hero-stage-typing-dot" />
                    <span className="hero-stage-typing-dot" />
                    <span className="hero-stage-typing-dot" />
                    <span className="text-xs text-slate-400 ml-1.5">Synthesizing personal context...</span>
                  </motion.div>
                ) : (
                  <motion.p
                    key={activeSuggestion.id}
                    initial={shouldReduceMotion ? false : { opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={shouldReduceMotion ? undefined : { opacity: 0, y: -5 }}
                    transition={{ duration: 0.22, ease: motionEasing.standard }}
                    className="hero-stage-output-text"
                  >
                    {activeSuggestion.sampleReply}
                  </motion.p>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>

        <p className="hero-stage-footnote">
          <strong>A little context changes the next answer.</strong> Illustrative conversation · not connected to a live profile.
        </p>
      </div>

      {/* Floating Luminous Composer Dock */}
      <div className="hero-stage-composer">
        <div className="hero-stage-input-row">
          <span className="hero-stage-placeholder">
            {isTyping ? "Applying saved context & preferences..." : `Ask RADIANCE about ${activeSuggestion.label}...`}
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
            
            <div className="hero-stage-model-badge" title="Model tier">
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>Build</span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>

            <div className="hero-stage-model-badge hero-stage-model-badge-active" title="Active engine">
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
    </figure>
  );
}
