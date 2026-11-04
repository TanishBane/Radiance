"use client";

import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  FileText,
  X,
  Square,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Attachment } from "@/lib/types/chat";
import { createAttachmentFromFile } from "@/lib/documents/parser";

export type ComposerMode = "Plan" | "Ask" | "Build";
export type EffortLevel = "Low" | "Medium" | "High" | "Max";
type ProviderType = "kimi" | "openai" | "spark";
type ModelFilterTab = "fav" | "all";

interface ModelOption {
  id: string;
  name: string;
  effort: EffortLevel;
  provider: ProviderType;
  isFav: boolean;
  efforts: EffortLevel[];
}

interface ContextTagOption {
  tag: string;
  category: string;
}

const INITIAL_MODELS: ModelOption[] = [
  {
    id: "kimi-k3",
    name: "Kimi K3",
    effort: "High",
    provider: "kimi",
    isFav: false,
    efforts: ["Low", "Medium", "High", "Max"],
  },
  {
    id: "gpt-56-terra",
    name: "GPT-5.6 Terra",
    effort: "Medium",
    provider: "openai",
    isFav: false,
    efforts: ["Low", "Medium", "High", "Max"],
  },
  {
    id: "gpt-56-sol",
    name: "GPT-5.6 Sol",
    effort: "Medium",
    provider: "openai",
    isFav: false,
    efforts: ["Low", "Medium", "High", "Max"],
  },
  {
    id: "sonnet-5",
    name: "Sonnet 5",
    effort: "High",
    provider: "spark",
    isFav: true,
    efforts: ["Low", "Medium", "High", "Max"],
  },
  {
    id: "opus-48",
    name: "Opus 4.8",
    effort: "High",
    provider: "spark",
    isFav: false,
    efforts: ["Low", "Medium", "High", "Max"],
  },
  {
    id: "fable-5",
    name: "Fable 5",
    effort: "High",
    provider: "spark",
    isFav: true,
    efforts: ["Medium", "High", "Max"],
  },
];

const CONTEXT_OPTIONS: ContextTagOption[] = [
  { tag: "@codebase", category: "Workspace" },
  { tag: "@docs", category: "References" },
  { tag: "@terminal", category: "Last output" },
];

const ALL_MODES: ComposerMode[] = ["Plan", "Ask", "Build"];

// TypeScript declarations for Web Speech API
interface SpeechRecognitionEventLike {
  results: Array<Array<{ transcript: string }>>;
}

interface SpeechRecognitionInstance {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEventLike) => void;
  onend: () => void;
  onerror: () => void;
  start: () => void;
  stop: () => void;
}

interface WindowWithSpeech extends Window {
  SpeechRecognition?: new () => SpeechRecognitionInstance;
  webkitSpeechRecognition?: new () => SpeechRecognitionInstance;
}

function ProviderBadgeIcon({ provider }: { provider: ProviderType }) {
  if (provider === "kimi") {
    return (
      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
        <path
          d="M4.2 3.2V12.8M4.2 8.2L10.4 3.2M6.8 6.2L11.2 12.8"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12.2" cy="4.2" r="1.15" fill="currentColor" />
      </svg>
    );
  }

  if (provider === "openai") {
    return (
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path
          d="M21.2 10.1c.2-1.5-.2-3.1-1.2-4.3-1.3-1.6-3.4-2.3-5.4-1.8-.9-1.1-2.3-1.8-3.8-1.8-2.1 0-3.9 1.3-4.6 3.2-1.5.3-2.8 1.2-3.6 2.5-1 1.8-.9 4 .2 5.7-.2 1.5.2 3.1 1.2 4.3 1.3 1.6 3.4 2.3 5.4 1.8.9 1.1 2.3 1.8 3.8 1.8 2.1 0 3.9-1.3 4.6-3.2 1.5-.3 2.8-1.2 3.6-2.5 1.1-1.8 1-4-.2-5.7z"
          stroke="currentColor"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.7" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg width="14" height="14" viewBox="0 0 18 18" fill="none">
      <g stroke="currentColor" strokeWidth="1.35" strokeLinecap="round">
        <line x1="9" y1="2.2" x2="9" y2="15.8" />
        <line x1="2.2" y1="9" x2="15.8" y2="9" />
        <line x1="4.1" y1="4.1" x2="13.9" y2="13.9" />
        <line x1="13.9" y1="4.1" x2="4.1" y2="13.9" />
        <line x1="6.4" y1="2.7" x2="11.6" y2="15.3" />
        <line x1="2.7" y1="6.4" x2="15.3" y2="11.6" />
      </g>
      <circle cx="9" cy="9" r="1.4" fill="currentColor" />
    </svg>
  );
}

function CheckmarkIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 16 16"
      fill="none"
      className="shrink-0 text-[var(--accent)]"
    >
      <path
        d="M3.2 8.5L6.5 11.8L13 4.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

interface ChatComposerProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function ChatComposer({
  onSend,
  onStop,
  isGenerating,
  disabled = false,
}: ChatComposerProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [mode, setMode] = useState<ComposerMode>("Build");
  const [modeMenuOpen, setModeMenuOpen] = useState(false);

  const [autoMode, setAutoMode] = useState(false);
  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [modelFilterTab, setModelFilterTab] = useState<ModelFilterTab>("fav");
  const [models, setModels] = useState<ModelOption[]>(INITIAL_MODELS);
  const [activeModelId, setActiveModelId] = useState("fable-5");
  const [hoveredModelId, setHoveredModelId] = useState<string | null>(null);

  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isSubmittingRef = useRef(false);
  const isHoveringModelRowRef = useRef(false);
  const isHoveringEffortMenuRef = useRef(false);
  const hideEffortTimerRef = useRef<number | null>(null);

  useEffect(() => {
    isSubmittingRef.current = false;
  }, [input, isGenerating]);

  // Voice recording timer
  useEffect(() => {
    if (!isRecording) return;
    const interval = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(interval);
  }, [isRecording]);

  // Global click-outside listener
  useEffect(() => {
    const handleGlobalClick = () => {
      setModeMenuOpen(false);
      setModelMenuOpen(false);
      setHoveredModelId(null);
      setContextMenuOpen(false);
    };
    window.addEventListener("click", handleGlobalClick);
    return () => window.removeEventListener("click", handleGlobalClick);
  }, []);

  const clearHideEffortTimeout = useCallback(() => {
    if (hideEffortTimerRef.current !== null) {
      window.clearTimeout(hideEffortTimerRef.current);
      hideEffortTimerRef.current = null;
    }
  }, []);

  const scheduleHideEffortSubmenu = useCallback(() => {
    clearHideEffortTimeout();
    hideEffortTimerRef.current = window.setTimeout(() => {
      if (!isHoveringEffortMenuRef.current && !isHoveringModelRowRef.current) {
        setHoveredModelId(null);
      }
    }, 60);
  }, [clearHideEffortTimeout]);

  // Active models & mode memoization
  const orderedModes = useMemo(() => {
    const inactive = ALL_MODES.filter((m) => m !== mode);
    return [...inactive, mode];
  }, [mode]);

  const activeModel = useMemo(
    () => models.find((m) => m.id === activeModelId) || models[0],
    [models, activeModelId]
  );

  const favCount = useMemo(() => models.filter((m) => m.isFav).length, [models]);

  const visibleModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return models.filter((m) => {
      const matchesTab = modelFilterTab === "fav" ? m.isFav : true;
      const matchesSearch =
        m.name.toLowerCase().includes(q) || m.effort.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [models, modelFilterTab, searchQuery]);

  const hoveredModel = useMemo(
    () => (hoveredModelId ? models.find((m) => m.id === hoveredModelId) || null : null),
    [models, hoveredModelId]
  );

  const effortBottomOffsetPx = useMemo(() => {
    if (!hoveredModelId) return 0;
    const idx = visibleModels.findIndex((m) => m.id === hoveredModelId);
    if (idx < 0) return 0;
    const rowsFromBottom = visibleModels.length - 1 - idx;
    return rowsFromBottom <= 1 ? 0 : Math.min(96, (rowsFromBottom - 1) * 24);
  }, [visibleModels, hoveredModelId]);

  const isEffortMenuVisible =
    modelMenuOpen && searchQuery.trim().length === 0 && hoveredModel !== null;

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setInput(val);
    setContextMenuOpen(val.endsWith("@"));

    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
    }
  };

  const handleSubmit = () => {
    if (isSubmittingRef.current) return;
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || isGenerating || disabled) return;

    isSubmittingRef.current = true;
    try {
      onSend(trimmed, attachments);
      setInput("");
      setAttachments([]);
      setContextMenuOpen(false);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (err) {
      isSubmittingRef.current = false;
      throw err;
    }

    setTimeout(() => {
      isSubmittingRef.current = false;
    }, 300);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing || e.keyCode === 229) {
      return;
    }
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInsertContextTag = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    setInput((prev) => prev.replace(/@$/, `${tag} `));
    setContextMenuOpen(false);
    textareaRef.current?.focus();
  };

  // Web Speech API
  const toggleVoice = () => {
    const windowWithSpeech = window as unknown as WindowWithSpeech;
    const SpeechRecognition =
      windowWithSpeech.SpeechRecognition || windowWithSpeech.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Voice input is supported in Google Chrome, Edge, and Safari.");
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = "en-IN";

      recognition.onstart = () => {
        setRecordingSeconds(0);
        setIsRecording(true);
      };
      recognition.onresult = (event) => {
        const transcript = Array.from(event.results)
          .map((r) => r[0].transcript)
          .join("");
        setInput(transcript);
        if (textareaRef.current) {
          textareaRef.current.style.height = "auto";
          textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 140)}px`;
        }
      };
      recognition.onend = () => setIsRecording(false);
      recognition.onerror = () => setIsRecording(false);

      recognition.start();
      recognitionRef.current = recognition;
    } catch {
      setIsRecording(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    for (const file of files) {
      if (file.size > 10 * 1024 * 1024) {
        alert(`${file.name} exceeds the 10MB limit.`);
        continue;
      }
      try {
        const attachment = await createAttachmentFromFile(file);
        setAttachments((prev) => [...prev, attachment]);
      } catch (err) {
        alert(`Failed to parse file: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleToggleFavStar = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    setModels((prev) =>
      prev.map((m) => {
        if (m.id !== targetId) return m;
        return { ...m, isFav: !m.isFav };
      })
    );
  };

  const handleSelectModel = (e: React.MouseEvent, modelId: string) => {
    e.stopPropagation();
    setActiveModelId(modelId);
    setAutoMode(false);
    setModelMenuOpen(false);
    setHoveredModelId(null);
  };

  const handleSelectEffort = (e: React.MouseEvent, effort: EffortLevel) => {
    e.stopPropagation();
    if (!hoveredModelId) return;
    setModels((prev) =>
      prev.map((m) => (m.id === hoveredModelId ? { ...m, effort } : m))
    );
    setActiveModelId(hoveredModelId);
    setAutoMode(false);
  };

  const handleOpenModelMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModeMenuOpen(false);
    setContextMenuOpen(false);
    const nextOpen = !modelMenuOpen;
    setModelMenuOpen(nextOpen);
    if (nextOpen) {
      setModelFilterTab("fav");
      setHoveredModelId(null);
      setSearchQuery("");
    }
  };

  const formattedRecordingTime = useMemo(() => {
    const mins = Math.floor(recordingSeconds / 60);
    const secs = String(recordingSeconds % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  }, [recordingSeconds]);

  const isSubmitReady = input.trim().length > 0 || attachments.length > 0;

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 z-20 select-none">
      {/* Attached Files Preview Bar */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-[var(--surface)] border border-[var(--border)] animate-in fade-in slide-in-from-bottom-2 duration-200">
          {attachments.map((att) => (
            <div
              key={att.id}
              className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-lg bg-[var(--deep)] border border-[var(--border)] text-xs text-[var(--txt)]"
            >
              <FileText className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              <span className="font-mono text-[11px] truncate max-w-[150px]">{att.name}</span>
              <button
                type="button"
                onClick={() => removeAttachment(att.id)}
                className="p-1 rounded-md text-[var(--txt-muted)] hover:text-[var(--danger)] hover:bg-white/5 transition-colors"
                title="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main Composer Box */}
      <div className="relative rounded-2xl bg-[var(--surface-raised)] border border-[var(--border)] focus-within:border-[var(--border-accent)] focus-within:shadow-card transition-all duration-200 backdrop-blur-2xl shadow-card p-3">
        {/* @ Context Mention Popover */}
        {contextMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-4 bottom-[74px] w-56 rounded-xl p-1.5 z-40 bg-[var(--deep)]/95 backdrop-blur-xl border border-[var(--border)] shadow-modal animate-in fade-in duration-150"
          >
            <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--txt-muted)] font-semibold">
              Add Context
            </div>
            {CONTEXT_OPTIONS.map((item) => (
              <button
                key={item.tag}
                type="button"
                onClick={(e) => handleInsertContextTag(e, item.tag)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-colors"
              >
                <span className="font-mono text-[var(--accent)]">{item.tag}</span>
                <span className="text-[10px] text-[var(--txt-muted)]">{item.category}</span>
              </button>
            ))}
          </div>
        )}

        {/* Text Area */}
        <textarea
          ref={textareaRef}
          rows={1}
          value={input}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder="Ask RADIANCE anything... (Shift+Enter for newline)"
          className="w-full bg-transparent border-0 outline-none resize-none text-sm text-[var(--txt)] placeholder:text-[var(--txt-muted)] py-1.5 max-h-[140px] leading-relaxed font-sans mb-2"
        />

        {/* Hidden File Input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          accept="image/*,.pdf,text/plain,text/csv,.csv,.txt,.docx"
          onChange={handleFileChange}
        />

        {/* Bottom Controls Bar */}
        <div className="flex items-center justify-between gap-2 pt-1 border-t border-[var(--border)]">
          {/* Left Controls: Add Files, Mode Selector, Model Trigger */}
          <div className="flex items-center gap-2">
            {/* 1. Add Files Expanding Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group/btn h-8 px-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--txt-muted)] hover:text-[var(--txt)] transition-all flex items-center gap-1.5 text-xs font-mono touch-target"
              title="Attach file or media"
              aria-label="Add files"
            >
              <span className="text-base leading-none font-bold">+</span>
              <span className="hidden sm:inline-block max-w-0 overflow-hidden whitespace-nowrap group-hover/btn:max-w-[80px] transition-all duration-300">
                Add files
              </span>
            </button>

            {/* 2. Mode Selector (Build / Plan / Ask) */}
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setModelMenuOpen(false);
                  setHoveredModelId(null);
                  setModeMenuOpen((prev) => !prev);
                }}
                className="h-8 px-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--txt)] transition-all flex items-center gap-1.5 text-xs font-mono touch-target"
                aria-haspopup="true"
                aria-expanded={modeMenuOpen}
              >
                <span>{mode}</span>
                <ChevronDown className="w-3 h-3 text-[var(--txt-muted)]" />
              </button>

              {modeMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 bottom-full mb-2 w-36 rounded-xl p-1.5 z-40 bg-[var(--deep)]/95 backdrop-blur-xl border border-[var(--border)] shadow-modal animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-0.5"
                >
                  {orderedModes.map((m) => {
                    const isSelected = m === mode;
                    return (
                      <button
                        key={m}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setMode(m);
                          setModeMenuOpen(false);
                        }}
                        className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-mono flex items-center justify-between text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <span>{m}</span>
                        {isSelected && <CheckmarkIcon />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Model & Effort Trigger */}
            <div className="relative inline-flex items-center">
              {!autoMode ? (
                <button
                  type="button"
                  onClick={handleOpenModelMenu}
                  className="h-8 px-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--txt)] transition-all flex items-center gap-2 text-xs font-mono touch-target"
                  aria-haspopup="true"
                  aria-expanded={modelMenuOpen}
                >
                  <span className="w-4 h-4 rounded-full bg-[var(--accent-d)] flex items-center justify-center text-[var(--accent)] shrink-0">
                    <ProviderBadgeIcon provider={activeModel.provider} />
                  </span>
                  <span className="truncate max-w-[110px] sm:max-w-none">{activeModel.name}</span>
                  <span className="text-[10px] text-[var(--txt-muted)] hidden sm:inline">{activeModel.effort}</span>
                  <ChevronDown className="w-3 h-3 text-[var(--txt-muted)]" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleOpenModelMenu}
                  className="h-8 px-2.5 rounded-xl border border-[var(--accent)]/40 bg-[var(--accent-d)] text-[var(--accent)] transition-all flex items-center gap-1.5 text-xs font-mono touch-target"
                  aria-label="Auto model routing"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Auto</span>
                  <ChevronDown className="w-3 h-3 text-[var(--accent)]" />
                </button>
              )}

              {/* Model Selector Popover */}
              {modelMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 bottom-full mb-2 w-64 rounded-2xl p-2 z-40 bg-[var(--deep)]/95 backdrop-blur-2xl border border-[var(--border)] shadow-modal animate-in fade-in zoom-in-95 duration-150"
                >
                  {/* Search input */}
                  <div className="px-2.5 py-1 mb-1 border-b border-[var(--border)] flex items-center gap-2">
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search models..."
                      className="w-full bg-transparent border-none outline-none text-xs text-[var(--txt)] font-mono placeholder:text-[var(--txt-muted)]"
                    />
                  </div>

                  {/* Auto Toggle Row */}
                  <div className="flex items-center justify-between px-2.5 py-1.5 text-xs font-mono border-b border-[var(--border)] mb-1">
                    <span className="text-[var(--txt)] font-semibold">Auto Router</span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoMode}
                      onClick={(e) => {
                        e.stopPropagation();
                        setAutoMode((prev) => !prev);
                      }}
                      className={`w-8 h-4 rounded-full transition-colors relative flex items-center p-0.5 ${
                        autoMode ? "bg-[var(--accent)]" : "bg-[var(--surface-hover)]"
                      }`}
                    >
                      <span
                        className={`w-3 h-3 rounded-full bg-white transition-transform ${
                          autoMode ? "translate-x-4" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {/* Filter Pills (fav / all) */}
                  <div className="flex items-center gap-1 px-1 mb-1.5 text-[10px] font-mono">
                    <button
                      type="button"
                      onClick={() => setModelFilterTab("fav")}
                      className={`flex-1 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        modelFilterTab === "fav"
                          ? "bg-[var(--accent-d)] text-[var(--accent)] font-bold border border-[var(--accent)]/30"
                          : "text-[var(--txt-muted)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <span>★ fav</span>
                      {favCount > 0 && <span>({favCount})</span>}
                    </button>
                    <button
                      type="button"
                      onClick={() => setModelFilterTab("all")}
                      className={`flex-1 py-1 rounded-lg transition-colors flex items-center justify-center gap-1 ${
                        modelFilterTab === "all"
                          ? "bg-[var(--accent-d)] text-[var(--accent)] font-bold border border-[var(--accent)]/30"
                          : "text-[var(--txt-muted)] hover:bg-[var(--surface-hover)]"
                      }`}
                    >
                      <span>all</span>
                      <span>({models.length})</span>
                    </button>
                  </div>

                  {/* Models List */}
                  <div className="flex flex-col gap-0.5 max-h-48 overflow-y-auto">
                    {visibleModels.map((m) => {
                      const isSelected = !autoMode && m.id === activeModelId;
                      const isHovered = m.id === hoveredModelId;
                      return (
                        <div
                          key={m.id}
                          onClick={(e) => handleSelectModel(e, m.id)}
                          onMouseEnter={() => {
                            clearHideEffortTimeout();
                            isHoveringModelRowRef.current = true;
                            setHoveredModelId(m.id);
                          }}
                          onMouseLeave={() => {
                            isHoveringModelRowRef.current = false;
                            scheduleHideEffortSubmenu();
                          }}
                          className={`flex items-center justify-between px-2.5 py-1.5 rounded-xl cursor-pointer text-xs font-mono transition-colors ${
                            isSelected
                              ? "bg-[var(--accent-d)] border border-[var(--accent)]/40 text-[var(--txt)]"
                              : isHovered
                              ? "bg-[var(--surface-hover)] text-[var(--txt)]"
                              : "text-[var(--txt-dim)] hover:bg-[var(--surface-hover)]"
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="w-4 h-4 rounded-full bg-[var(--surface)] flex items-center justify-center shrink-0">
                              <ProviderBadgeIcon provider={m.provider} />
                            </span>
                            <span className="truncate">{m.name}</span>
                            <span className="text-[10px] text-[var(--txt-muted)]">{m.effort}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              type="button"
                              onClick={(e) => handleToggleFavStar(e, m.id)}
                              className={`p-1 rounded text-xs transition-colors ${
                                m.isFav ? "text-amber-400" : "text-[var(--txt-muted)] hover:text-amber-300"
                              }`}
                            >
                              ★
                            </button>
                            {isSelected && <CheckmarkIcon />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Floating Effort Submenu */}
              {isEffortMenuVisible && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={() => {
                    clearHideEffortTimeout();
                    isHoveringEffortMenuRef.current = true;
                  }}
                  onMouseLeave={() => {
                    isHoveringEffortMenuRef.current = false;
                    scheduleHideEffortSubmenu();
                  }}
                  style={{ bottom: `${effortBottomOffsetPx}px` }}
                  className="absolute left-[272px] bottom-full mb-2 w-32 rounded-xl p-1.5 z-50 bg-[var(--deep)]/95 backdrop-blur-xl border border-[var(--border)] shadow-modal animate-in fade-in duration-100 flex flex-col gap-0.5"
                >
                  <div className="px-2 py-1 text-[10px] font-mono text-[var(--txt-muted)] uppercase tracking-wider font-semibold">
                    Effort
                  </div>
                  {hoveredModel?.efforts.map((level) => {
                    const isCurrent = hoveredModel.effort === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={(e) => handleSelectEffort(e, level)}
                        className="w-full text-left px-2 py-1 rounded-lg text-xs font-mono flex items-center justify-between text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-colors"
                      >
                        <span>{level}</span>
                        {isCurrent && <CheckmarkIcon />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right Controls: Voice Toggle & Send/Stop Buttons */}
          <div className="flex items-center gap-2">
            {/* 4. Voice Input Expanding Button */}
            <button
              type="button"
              onClick={toggleVoice}
              className={`group/rec h-8 px-2.5 rounded-xl border border-[var(--border)] transition-all flex items-center gap-1.5 text-xs font-mono touch-target ${
                isRecording
                  ? "bg-red-500/20 border-red-500/40 text-red-400 animate-pulse"
                  : "bg-[var(--surface)] text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)]"
              }`}
              title={isRecording ? "Stop recording" : "Record voice input"}
              aria-label="Record voice input"
            >
              {isRecording ? (
                <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              ) : (
                <span className="text-sm">🎙</span>
              )}
              <span className="hidden sm:inline-block max-w-0 overflow-hidden whitespace-nowrap group-hover/rec:max-w-[80px] transition-all duration-300">
                {isRecording ? formattedRecordingTime : "Record"}
              </span>
            </button>

            {/* 5. Send / Stop Toggle */}
            {isGenerating ? (
              <button
                type="button"
                onClick={() => onStop()}
                aria-label="Stop response generation"
                data-testid="stop-button"
                className="w-8 h-8 rounded-xl bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90 transition-all shadow-sm shrink-0 flex items-center justify-center touch-target"
                title="Stop response generation"
              >
                <Square className="w-3.5 h-3.5 fill-white" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={(!input.trim() && attachments.length === 0) || disabled}
                aria-label="Send message"
                data-testid="send-button"
                className={`w-8 h-8 rounded-xl transition-all shadow-sm shrink-0 flex items-center justify-center touch-target ${
                  isSubmitReady
                    ? "bg-gradient-to-br from-[var(--accent-b)] to-[var(--accent)] text-[var(--void)] font-bold hover:opacity-90"
                    : "bg-[var(--surface)] border border-[var(--border)] text-[var(--txt-muted)] opacity-40 pointer-events-none"
                }`}
                title="Send message (Enter)"
              >
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 12.8V3.2M8 3.2L3.8 7.4M8 3.2L12.2 7.4"
                    stroke="currentColor"
                    strokeWidth="1.65"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Footer Hints */}
        <div className="flex items-center justify-between px-1 pt-2 text-[10px] text-[var(--txt-muted)] font-mono">
          <span>{input.length} chars</span>
          <span className="hidden sm:inline">Enter send · Shift+Enter newline · @ for context</span>
        </div>
      </div>

      <div className="text-center text-[10px] text-[var(--txt-muted)] font-light mt-2 opacity-70">
        Radiance generates high-precision responses. Verify mission-critical details.
      </div>
    </div>
  );
}
