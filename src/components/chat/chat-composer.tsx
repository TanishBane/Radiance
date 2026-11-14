"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import { motion, useReducedMotion } from "motion/react";
import {
  FileText,
  X,
  Square,
  ChevronDown,
  Atom,
  Check,
  Mic,
  Zap,
  Gauge,
  Sparkles,
  Cpu,
  Layers,
  Terminal,
  Compass,
  MessageSquare,
} from "lucide-react";
import { Attachment, ModelOption } from "@/lib/types/chat";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID, getModelById } from "@/lib/ai/models";
import { createAttachmentFromFile } from "@/lib/documents/parser";
import { uiText, type UiLanguage } from "@/lib/i18n/ui";

export type ComposerMode = "Plan" | "Ask" | "Build";

interface ContextTagOption {
  tag: string;
  category: string;
}

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

function CheckmarkIcon() {
  return (
    <Check
      className="w-3.5 h-3.5 text-[var(--accent)] shrink-0"
      strokeWidth={2.5}
      aria-hidden="true"
    />
  );
}

function renderModelIcon(modelId: string) {
  switch (modelId) {
    case "groq-fast":
      return <Zap className="w-4 h-4 text-amber-400 shrink-0" strokeWidth={2} />;
    case "groq-instant":
      return <Gauge className="w-4 h-4 text-emerald-400 shrink-0" strokeWidth={2} />;
    case "gemini-quality":
      return <Sparkles className="w-4 h-4 text-sky-400 shrink-0" strokeWidth={2} />;
    case "gemini-pro":
      return <Cpu className="w-4 h-4 text-purple-400 shrink-0" strokeWidth={2} />;
    case "openrouter-reasoning":
      return <Layers className="w-4 h-4 text-rose-400 shrink-0" strokeWidth={2} />;
    default:
      return <Atom className="w-4 h-4 text-[var(--accent)] shrink-0" strokeWidth={2} />;
  }
}

function renderModeIcon(mode: ComposerMode) {
  switch (mode) {
    case "Build":
      return <Terminal className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" strokeWidth={2} />;
    case "Plan":
      return <Compass className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" strokeWidth={2} />;
    case "Ask":
      return <MessageSquare className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" strokeWidth={2} />;
    default:
      return null;
  }
}

export interface ChatComposerProps {
  language?: UiLanguage;
  onSend: (text: string, attachments: Attachment[], mode?: ComposerMode) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  selectedModel?: ModelOption;
  onSelectModel?: (model: ModelOption) => void;
  enterToSend?: boolean;
  onFocusChange?: (focused: boolean) => void;
}

export function ChatComposer({
  language = "en",
  onSend,
  onStop,
  isGenerating,
  disabled = false,
  selectedModel,
  onSelectModel,
  enterToSend = true,
  onFocusChange,
}: ChatComposerProps) {
  const shouldReduceMotion = useReducedMotion();
  const [input, setInput] = useState("");
  const [animatedPlaceholder, setAnimatedPlaceholder] = useState(uiText(language, "Ask RADIANCE anything..."));
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [mode, setMode] = useState<ComposerMode>("Build");
  const [modeMenuOpen, setModeMenuOpen] = useState(false);

  const [modelMenuOpen, setModelMenuOpen] = useState(false);
  const [internalModel, setInternalModel] = useState<ModelOption>(() =>
    selectedModel || getModelById(DEFAULT_MODEL_ID)
  );

  useEffect(() => {
    if (selectedModel) {
      setInternalModel(selectedModel);
    }
  }, [selectedModel]);

  const activeModel = selectedModel || internalModel;

  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [composerNotice, setComposerNotice] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setComposerNotice(msg);
    setTimeout(() => {
      setComposerNotice((curr) => (curr === msg ? null : curr));
    }, 4500);
  };

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);
  const isSubmittingRef = useRef(false);
  const modelTriggerRef = useRef<HTMLButtonElement | null>(null);
  const optionRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const [focusedIndex, setFocusedIndex] = useState<number>(-1);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    if (input || isGenerating || disabled) {
      setAnimatedPlaceholder(uiText(language, "Ask RADIANCE anything..."));
      return;
    }

    const suggestions = [
      uiText(language, "What would you like to understand today?"),
      uiText(language, "Bring your context into the conversation..."),
      uiText(language, "Ask RADIANCE anything..."),
    ];
    let suggestionIndex = 0;
    let characterIndex = 0;
    let delayTimer: number | undefined;
    let typingTimer: number | undefined;

    const typeNext = () => {
      const suggestion = suggestions[suggestionIndex];
      characterIndex += 1;
      setAnimatedPlaceholder(suggestion.slice(0, characterIndex));

      if (characterIndex < suggestion.length) {
        typingTimer = window.setTimeout(typeNext, 48);
        return;
      }

      delayTimer = window.setTimeout(() => {
        suggestionIndex = (suggestionIndex + 1) % suggestions.length;
        characterIndex = 0;
        setAnimatedPlaceholder("");
        typingTimer = window.setTimeout(typeNext, 350);
      }, 1900);
    };

    delayTimer = window.setTimeout(typeNext, 900);
    return () => {
      window.clearTimeout(delayTimer);
      window.clearTimeout(typingTimer);
    };
  }, [disabled, input, isGenerating, language]);

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

  // Synchronize focusedIndex and manage focus when model popover opens
  useEffect(() => {
    if (modelMenuOpen) {
      const idx = AVAILABLE_MODELS.findIndex((m) => m.id === activeModel.id);
      const targetIdx = idx >= 0 ? idx : 0;
      setFocusedIndex(targetIdx);
      const timer = window.setTimeout(() => {
        optionRefs.current[targetIdx]?.focus();
      }, 40);
      return () => window.clearTimeout(timer);
    } else {
      setFocusedIndex(-1);
    }
  }, [modelMenuOpen, activeModel.id]);

  // Global click-outside and Escape key listener
  useEffect(() => {
    const handleGlobalClick = () => {
      setModeMenuOpen(false);
      setModelMenuOpen(false);
      setContextMenuOpen(false);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setModeMenuOpen(false);
        if (modelMenuOpen) {
          setModelMenuOpen(false);
          modelTriggerRef.current?.focus();
        }
        setContextMenuOpen(false);
      }
    };

    window.addEventListener("click", handleGlobalClick);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("click", handleGlobalClick);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modelMenuOpen]);

  // Mode ordering memoization
  const orderedModes = useMemo(() => {
    const inactive = ALL_MODES.filter((m) => m !== mode);
    return [...inactive, mode];
  }, [mode]);

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
      if (mode && mode !== "Build") {
        onSend(trimmed, attachments, mode);
      } else {
        onSend(trimmed, attachments);
      }
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
    if (e.key === "Enter" && e.shiftKey) return;
    if (e.key === "Enter" && (enterToSend ? !e.ctrlKey && !e.metaKey : e.ctrlKey || e.metaKey)) {
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
      showNotice("Voice input is supported in Google Chrome, Edge, and Safari.");
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

    if (attachments.length >= 10) {
      showNotice("Maximum limit of 10 attachments per message reached.");
      e.target.value = "";
      return;
    }

    const availableSlots = 10 - attachments.length;
    if (files.length > availableSlots) {
      showNotice(`Only ${availableSlots} more attachment${availableSlots === 1 ? "" : "s"} allowed (max 10 total).`);
    }

    const allowedFiles = files.slice(0, availableSlots);

    for (const file of allowedFiles) {
      if (file.size > 10 * 1024 * 1024) {
        showNotice(`${file.name} exceeds the 10MB limit.`);
        continue;
      }
      try {
        const attachment = await createAttachmentFromFile(file);
        setAttachments((prev) => [...prev, attachment]);
      } catch (err) {
        showNotice(`Failed to parse file: ${err instanceof Error ? err.message : "Unknown error"}`);
      }
    }
    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSelectModel = (
    e: React.MouseEvent | React.KeyboardEvent,
    model: ModelOption
  ) => {
    e.stopPropagation();
    setInternalModel(model);
    onSelectModel?.(model);
    setModelMenuOpen(false);
    modelTriggerRef.current?.focus();
  };

  const handleOpenModelMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModeMenuOpen(false);
    setContextMenuOpen(false);
    setModelMenuOpen((prev) => !prev);
  };

  const handleListboxKeyDown = (e: React.KeyboardEvent) => {
    const len = AVAILABLE_MODELS.length;
    let next = -1;
    if (e.key === "ArrowDown") next = (focusedIndex + 1) % len;
    else if (e.key === "ArrowUp") next = (focusedIndex - 1 + len) % len;
    else if (e.key === "Home") next = 0;
    else if (e.key === "End") next = len - 1;
    else if (e.key === "Escape") {
      e.preventDefault();
      setModelMenuOpen(false);
      modelTriggerRef.current?.focus();
      return;
    }
    if (next >= 0) {
      e.preventDefault();
      setFocusedIndex(next);
      optionRefs.current[next]?.focus();
    }
  };

  const handleTriggerKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      setModelMenuOpen(true);
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
    <div className="relative isolate z-30 w-full max-w-3xl mx-auto px-3 sm:px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] select-none">
      {/* Attached Files Preview Bar */}
      {attachments.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2 p-2 rounded-xl bg-gradient-to-r from-[var(--surface-raised)]/90 via-[var(--surface-raised)]/70 to-[var(--accent-d)]/20 border border-white/[0.10] shadow-sm backdrop-blur-xl animate-in fade-in slide-in-from-bottom-2 duration-200">
          {attachments.map((att) => (
            <motion.div
              key={att.id}
              initial={shouldReduceMotion ? undefined : { opacity: 0, scale: 0.9, y: 4 }}
              animate={shouldReduceMotion ? undefined : { opacity: 1, scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="flex items-center gap-2 pl-2.5 pr-1.5 py-1 rounded-lg bg-[var(--deep)]/90 border border-white/[0.08] text-xs text-[var(--txt)] shadow-xs"
            >
              <FileText className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
              <span className="font-mono text-[11px] truncate max-w-[150px]">{att.name}</span>
              <motion.button
                type="button"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.15 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
                onClick={() => removeAttachment(att.id)}
                className="p-1 rounded-md text-[var(--txt-muted)] hover:text-[var(--danger)] hover:bg-white/5 transition-colors cursor-pointer"
                title={uiText(language, "Remove attachment")}
                aria-label={uiText(language, "Remove attachment")}
              >
                <X className="w-3 h-3" />
              </motion.button>
            </motion.div>
          ))}
        </div>
      )}

      {/* Inline Non-blocking Notification Banner */}
      {composerNotice && (
        <motion.div
          role="status"
          aria-live="polite"
          initial={shouldReduceMotion ? undefined : { opacity: 0, y: 4, scale: 0.98 }}
          animate={shouldReduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="mb-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-[var(--danger-d)] border border-[var(--danger)]/30 text-[var(--danger)] flex items-center justify-between shadow-sm backdrop-blur-xl"
        >
          <span>{composerNotice}</span>
          <motion.button
            type="button"
            whileHover={shouldReduceMotion ? undefined : { scale: 1.15 }}
            whileTap={shouldReduceMotion ? undefined : { scale: 0.9 }}
            onClick={() => setComposerNotice(null)}
            className="ml-2 hover:opacity-80 cursor-pointer p-0.5"
            aria-label="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </motion.button>
        </motion.div>
      )}

      {/* Main Composer Box with Complete Theme Gradient Glassmorphism */}
      <motion.div
        className="relative rounded-2xl bg-gradient-to-br from-[var(--surface-raised)]/90 via-[var(--deep)]/85 to-[var(--accent-d)]/30 border border-white/[0.12] focus-within:border-[var(--border-accent)] focus-within:shadow-[0_0_36px_-4px_var(--accent-g),0_16px_48px_-12px_rgba(0,0,0,0.7)] transition-all duration-300 backdrop-blur-3xl shadow-[0_8px_32px_0_rgba(0,0,0,0.4),0_0_20px_-6px_var(--accent-g)] p-3 sm:p-3.5 group/composer overflow-visible z-20"
        animate={
          shouldReduceMotion
            ? undefined
            : {
                y: isFocused ? -1 : 0,
              }
        }
        transition={{ type: "spring", stiffness: 350, damping: 25 }}
      >
        {/* Theme Ambient Radial Glass Sheen */}
        <motion.div
          className="absolute inset-0 rounded-2xl bg-gradient-to-tr from-[var(--accent)]/[0.05] via-transparent to-[var(--accent-c)]/[0.06] pointer-events-none"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: isFocused ? 0.9 : 0.45,
                }
          }
          transition={{ duration: 0.3, ease: "easeOut" }}
        />

        {/* Optical Top Rim Specular Reflection */}
        <motion.div
          className="absolute inset-x-4 top-0 h-[1.5px] rounded-t-2xl bg-gradient-to-r from-transparent via-[var(--accent-b)]/40 to-transparent pointer-events-none"
          animate={
            shouldReduceMotion
              ? undefined
              : {
                  opacity: isFocused ? 0.95 : 0.45,
                  scaleX: isFocused ? 1 : 0.88,
                }
          }
          transition={{ type: "spring", stiffness: 350, damping: 28 }}
        />

        {/* @ Context Mention Popover */}
        {contextMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute left-4 bottom-[64px] w-56 rounded-xl p-1.5 z-40 bg-[var(--deep)]/95 backdrop-blur-2xl border border-white/[0.12] shadow-[0_12px_36px_0_rgba(0,0,0,0.6),0_0_20px_-4px_var(--accent-g)] flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150"
          >
            <div className="px-2.5 py-1 text-[10px] font-mono uppercase tracking-wider text-[var(--txt-muted)] font-semibold border-b border-white/[0.06] mb-1">
              {uiText(language, "Add Context")}
            </div>
            {CONTEXT_OPTIONS.map((item) => (
              <button
                key={item.tag}
                type="button"
                onClick={(e) => handleInsertContextTag(e, item.tag)}
                className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs flex items-center justify-between text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer"
              >
                <span className="font-mono text-[var(--accent-b)]">{item.tag}</span>
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
          onFocus={() => {
            setIsFocused(true);
            onFocusChange?.(true);
            setTimeout(() => {
              if (typeof textareaRef.current?.scrollIntoView === "function") {
                textareaRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }
            }, 120);
          }}
          onBlur={() => {
            setIsFocused(false);
            onFocusChange?.(false);
          }}
          placeholder={animatedPlaceholder}
          className="w-full bg-transparent border-0 outline-none resize-none text-base sm:text-sm text-[var(--txt)] placeholder:text-[var(--txt-muted)]/70 py-1 max-h-[140px] leading-relaxed font-sans mb-1.5 tracking-[-0.01em] selection:bg-[var(--accent-d)] selection:text-[var(--txt)] relative z-10"
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

        {/* Controls Bar with Professional Icons & Glassmorphic Pills */}
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-2 border-t border-white/[0.08] relative z-10">
          {/* Left Controls: Add Files, Mode Selector, Model Trigger */}
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-visible py-0.5">
            {/* 1. Add Files Expanding Glass Pill */}
            <motion.button
              type="button"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.04, y: -0.5 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={() => fileInputRef.current?.click()}
              className="group/btn h-8 px-2.5 rounded-full border border-white/[0.10] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-accent)] text-[var(--txt-muted)] hover:text-[var(--txt)] transition-all flex items-center gap-1.5 text-xs font-sans font-medium touch-target cursor-pointer backdrop-blur-md shadow-xs"
              title={uiText(language, "Attach file or media")}
              aria-label={uiText(language, "Add files")}
            >
              <span className="text-base leading-none font-bold transition-transform duration-200 group-hover/btn:rotate-90">
                +
              </span>
              <span className="hidden sm:inline-block max-w-0 overflow-hidden whitespace-nowrap group-hover/btn:max-w-[80px] transition-all duration-300 text-[11px] font-sans">
                {uiText(language, "Add files")}
              </span>
            </motion.button>

            {/* 2. Mode Selector Pill (Build / Plan / Ask) */}
            <div className="relative">
              <motion.button
                type="button"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.03, y: -0.5 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={(e) => {
                  e.stopPropagation();
                  setModelMenuOpen(false);
                  setModeMenuOpen((prev) => !prev);
                }}
                className="h-8 px-2.5 rounded-full border border-white/[0.10] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-accent)] text-[var(--txt)] transition-all flex items-center gap-1.5 text-xs font-sans font-medium touch-target cursor-pointer backdrop-blur-md shadow-xs"
                aria-haspopup="true"
                aria-expanded={modeMenuOpen}
              >
                {renderModeIcon(mode)}
                <span>{uiText(language, mode)}</span>
                <motion.span
                  animate={shouldReduceMotion ? undefined : { rotate: modeMenuOpen ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="inline-flex items-center justify-center text-[var(--txt-muted)]"
                >
                  <ChevronDown className="w-3 h-3" />
                </motion.span>
              </motion.button>

              {modeMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="absolute left-0 bottom-full mb-2 w-44 rounded-xl p-1.5 z-50 bg-[var(--deep)]/95 backdrop-blur-2xl border border-white/[0.12] shadow-[0_12px_36px_0_rgba(0,0,0,0.6),0_0_20px_-4px_var(--accent-g)] flex flex-col gap-0.5 animate-in fade-in zoom-in-95 duration-150"
                >
                  {orderedModes.map((m) => {
                    const isSelected = m === mode;
                    return (
                      <motion.button
                        key={m}
                        type="button"
                        whileHover={shouldReduceMotion ? undefined : { x: 2 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        onClick={(e) => {
                          e.stopPropagation();
                          setMode(m);
                          setModeMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-xs font-sans font-medium flex items-center justify-between text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer ${
                          isSelected ? "bg-[var(--accent-d)] text-[var(--accent-b)] font-semibold" : ""
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {renderModeIcon(m)}
                          <span>{uiText(language, m)}</span>
                        </div>
                        {isSelected && <CheckmarkIcon />}
                      </motion.button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 3. Real Model Selector Pill (Image 2) */}
            <div className="relative inline-flex items-center">
              <motion.button
                ref={modelTriggerRef}
                id="composer-model-trigger"
                type="button"
                data-testid="composer-model-trigger"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.03, y: -0.5 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.97 }}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                onClick={handleOpenModelMenu}
                onKeyDown={handleTriggerKeyDown}
                title={activeModel.name}
                className="h-8 px-2.5 sm:px-3 rounded-full border border-white/[0.10] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-accent)] text-[var(--txt)] transition-all flex items-center gap-1.5 sm:gap-2 text-xs font-sans font-medium touch-target cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] backdrop-blur-md shadow-xs"
                aria-haspopup="listbox"
                aria-expanded={modelMenuOpen}
                aria-controls="composer-model-listbox"
                aria-label={`${uiText(language, "Select AI model. Current model:")} ${activeModel.name}`}
              >
                <Atom className="w-3.5 h-3.5 text-[#c084fc] shrink-0" aria-hidden="true" />
                <span className="font-sans text-xs sm:text-[13px] font-medium text-[var(--txt)] truncate max-w-[70px] xs:max-w-[110px] sm:max-w-none">
                  {activeModel.name}
                </span>
                <motion.span
                  animate={shouldReduceMotion ? undefined : { rotate: modelMenuOpen ? 180 : 0 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                  className="inline-flex items-center justify-center text-[var(--txt-muted)]"
                  aria-hidden="true"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </motion.span>
              </motion.button>

              {/* Model Selector Popover */}
              {modelMenuOpen && (
                <div
                  id="composer-model-listbox"
                  role="listbox"
                  aria-label={uiText(language, "Available models")}
                  aria-activedescendant={
                    focusedIndex >= 0 && AVAILABLE_MODELS[focusedIndex]
                      ? `model-option-${AVAILABLE_MODELS[focusedIndex].id}`
                      : undefined
                  }
                  tabIndex={-1}
                  onKeyDown={handleListboxKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute -left-16 sm:left-0 bottom-full mb-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl p-2 z-50 bg-[var(--deep)]/95 backdrop-blur-2xl border border-white/[0.12] shadow-[0_16px_48px_0_rgba(0,0,0,0.65),0_0_28px_-4px_var(--accent-g)] flex flex-col gap-1 max-h-80 overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
                >
                  <div className="px-3 py-1.5 text-[10px] font-mono uppercase tracking-widest text-[var(--txt-muted)] border-b border-white/[0.08] flex items-center justify-between select-none">
                    <span>{uiText(language, "Frontier Inference Models")}</span>
                    <span className="text-[9px] text-[var(--accent-b)] font-semibold">{uiText(language, "Multi-Provider")}</span>
                  </div>
                  <div className="flex flex-col gap-1 pt-1">
                    {AVAILABLE_MODELS.map((m, idx) => {
                      const isSelected = m.id === activeModel.id;
                      const isItemFocused = focusedIndex === idx;
                      return (
                        <motion.button
                          key={m.id}
                          ref={(el) => {
                            optionRefs.current[idx] = el;
                          }}
                          id={`model-option-${m.id}`}
                          type="button"
                          role="option"
                          tabIndex={isItemFocused ? 0 : -1}
                          aria-selected={isSelected}
                          data-testid={`model-option-${m.id}`}
                          whileHover={shouldReduceMotion ? undefined : { x: 2 }}
                          transition={{ type: "spring", stiffness: 500, damping: 30 }}
                          onClick={(e) => handleSelectModel(e, m)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleSelectModel(e, m);
                            }
                          }}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-all font-sans cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                            isSelected
                              ? "bg-[var(--accent-d)] border border-[var(--accent)] text-[var(--txt)] ring-1 ring-[var(--accent)]/40 shadow-sm"
                              : "hover:bg-[var(--surface-hover)] text-[var(--txt-dim)] hover:text-[var(--txt)] border border-transparent"
                          }`}
                        >
                          <div className="mt-0.5 shrink-0 select-none">
                            {renderModelIcon(m.id)}
                          </div>
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold font-sans text-[var(--txt)] truncate">
                                {m.name}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--txt-muted)] border border-white/[0.08] font-mono">
                                  {m.provider}
                                </span>
                                {isSelected && <CheckmarkIcon />}
                              </div>
                            </div>
                            <p className="text-[11px] text-[var(--txt-muted)] line-clamp-1 mt-0.5 leading-tight font-sans">
                              {m.sub}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono text-[var(--txt-muted)]">
                              {m.contextWindow && (
                                <span className="tabular-nums">{(m.contextWindow / 1024).toFixed(0)}k {uiText(language, "ctx")}</span>
                              )}
                              {m.supportsVision && (
                                <span className="text-[var(--accent-b)] font-medium">✦ {uiText(language, "Multimodal")}</span>
                              )}
                              {m.pricingTier === "free" && (
                                <span className="text-emerald-400 font-medium">{uiText(language, "Free")}</span>
                              )}
                            </div>
                          </div>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Controls: Professional Voice Button & Send/Stop Buttons */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* 4. Voice Input Expanding Button with Professional Mic Icon */}
            <motion.button
              type="button"
              whileHover={shouldReduceMotion ? undefined : { scale: 1.04, y: -0.5 }}
              whileTap={shouldReduceMotion ? undefined : { scale: 0.96 }}
              transition={{ type: "spring", stiffness: 400, damping: 20 }}
              onClick={toggleVoice}
              className={`group/rec h-8 px-2.5 rounded-full border transition-all flex items-center gap-1.5 text-xs font-sans font-medium touch-target cursor-pointer backdrop-blur-md shadow-xs ${
                isRecording
                  ? "bg-red-500/20 border-red-500/40 text-red-400 ring-2 ring-red-500/20"
                  : "border-white/[0.10] bg-[var(--surface)] text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-accent)]"
              }`}
              title={uiText(language, isRecording ? "Stop recording" : "Record voice input")}
              aria-label={uiText(language, "Record voice input")}
            >
              {isRecording ? (
                <>
                  <motion.div
                    animate={shouldReduceMotion ? undefined : { scale: [1, 1.15, 1] }}
                    transition={{ duration: 1, repeat: Infinity, ease: "easeInOut" }}
                    className="shrink-0"
                  >
                    <Mic className="w-3.5 h-3.5 text-red-400 shrink-0" strokeWidth={2.2} />
                  </motion.div>
                  <span className="flex items-center gap-0.5 h-3.5 px-0.5" aria-hidden="true">
                    {[0, 1, 2, 3].map((barIndex) => (
                      <motion.span
                        key={barIndex}
                        className="w-[2px] bg-red-400 rounded-full inline-block origin-center"
                        animate={
                          shouldReduceMotion
                            ? undefined
                            : {
                                scaleY: [0.3, 1, 0.4, 0.9, 0.3],
                              }
                        }
                        transition={{
                          duration: 0.55 + barIndex * 0.1,
                          repeat: Infinity,
                          repeatType: "mirror",
                          ease: "easeInOut",
                          delay: barIndex * 0.08,
                        }}
                        style={{ height: "12px" }}
                      />
                    ))}
                  </span>
                </>
              ) : (
                <Mic className="w-3.5 h-3.5 text-[var(--txt-muted)] group-hover/rec:text-[var(--txt)] transition-colors shrink-0" strokeWidth={2} />
              )}
              <span className="hidden sm:inline-block max-w-0 overflow-hidden whitespace-nowrap group-hover/rec:max-w-[80px] transition-all duration-300 font-mono text-[11px]">
                {isRecording ? formattedRecordingTime : uiText(language, "Record")}
              </span>
            </motion.button>

            {/* 5. Send / Stop Toggle */}
            {isGenerating ? (
              <motion.button
                type="button"
                whileHover={shouldReduceMotion ? undefined : { scale: 1.08 }}
                whileTap={shouldReduceMotion ? undefined : { scale: 0.92 }}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: [1, 1.04, 1],
                        boxShadow: [
                          "0 0 10px rgba(232,85,85,0.4)",
                          "0 0 18px rgba(232,85,85,0.7)",
                          "0 0 10px rgba(232,85,85,0.4)",
                        ],
                      }
                }
                transition={{
                  duration: 1.6,
                  repeat: Infinity,
                  repeatType: "mirror",
                  ease: "easeInOut",
                }}
                onClick={() => onStop()}
                aria-label={uiText(language, "Stop response generation")}
                data-testid="stop-button"
                className="w-8 h-8 rounded-full bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90 transition-all shadow-[0_0_12px_rgba(232,85,85,0.4)] shrink-0 flex items-center justify-center touch-target cursor-pointer"
                title={uiText(language, "Stop response generation")}
              >
                <Square className="w-3.5 h-3.5 fill-white" />
              </motion.button>
            ) : (
              <motion.button
                type="button"
                whileHover={isSubmitReady && !shouldReduceMotion ? { scale: 1.08 } : undefined}
                whileTap={isSubmitReady && !shouldReduceMotion ? { scale: 0.92 } : undefined}
                animate={
                  shouldReduceMotion
                    ? undefined
                    : {
                        scale: isSubmitReady ? 1 : 0.96,
                      }
                }
                transition={{ type: "spring", stiffness: 450, damping: 25 }}
                onClick={handleSubmit}
                disabled={(!input.trim() && attachments.length === 0) || disabled}
                aria-label={uiText(language, "Send message")}
                data-testid="send-button"
                className={`group/send w-8 h-8 rounded-full transition-all shadow-sm shrink-0 flex items-center justify-center touch-target cursor-pointer ${
                  isSubmitReady
                    ? "bg-gradient-to-tr from-[var(--accent)] via-[var(--accent-b)] to-[var(--accent-c)] text-[var(--void)] font-bold shadow-[0_0_18px_var(--accent-g)] hover:brightness-110 active:brightness-95"
                    : "bg-[var(--surface)] border border-white/[0.08] text-[var(--txt-muted)] opacity-40 pointer-events-none"
                }`}
                title={uiText(language, "Send message (Enter)")}
              >
                <motion.svg
                  width="15"
                  height="15"
                  viewBox="0 0 16 16"
                  fill="none"
                  whileHover={shouldReduceMotion ? undefined : { y: -1.5 }}
                  transition={{ type: "spring", stiffness: 400, damping: 20 }}
                >
                  <path
                    d="M8 12.8V3.2M8 3.2L3.8 7.4M8 3.2L12.2 7.4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </motion.svg>
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
