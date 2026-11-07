"use client";

import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  FileText,
  X,
  Square,
  ChevronDown,
  Cpu,
  Check,
  Mic,
} from "lucide-react";
import { Attachment, ModelOption } from "@/lib/types/chat";
import { AVAILABLE_MODELS, DEFAULT_MODEL_ID, getModelById } from "@/lib/ai/models";
import { createAttachmentFromFile } from "@/lib/documents/parser";

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

export interface ChatComposerProps {
  onSend: (text: string, attachments: Attachment[], mode?: ComposerMode) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled?: boolean;
  selectedModel?: ModelOption;
  onSelectModel?: (model: ModelOption) => void;
}

export function ChatComposer({
  onSend,
  onStop,
  isGenerating,
  disabled = false,
  selectedModel,
  onSelectModel,
}: ChatComposerProps) {
  const [input, setInput] = useState("");
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

    for (const file of files) {
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
    <div className="w-full max-w-3xl mx-auto px-3 sm:px-4 pb-[max(1rem,env(safe-area-inset-bottom,0px))] z-20 select-none">
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
                aria-label="Remove attachment"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Inline Non-blocking Notification Banner */}
      {composerNotice && (
        <div
          role="status"
          aria-live="polite"
          className="mb-2 px-3 py-1.5 rounded-xl text-xs font-mono bg-[var(--danger-d)] border border-[var(--danger)]/30 text-[var(--danger)] flex items-center justify-between shadow-sm animate-in fade-in slide-in-from-bottom-1 duration-150"
        >
          <span>{composerNotice}</span>
          <button
            type="button"
            onClick={() => setComposerNotice(null)}
            className="ml-2 hover:opacity-80 cursor-pointer p-0.5"
            aria-label="Dismiss notice"
          >
            <X className="w-3.5 h-3.5" />
          </button>
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
            <div className="px-2.5 py-1 text-xs font-mono text-[var(--txt-muted)]">
              Add context
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
          onFocus={() => {
            setTimeout(() => {
              if (typeof textareaRef.current?.scrollIntoView === "function") {
                textareaRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
              }
            }, 120);
          }}
          placeholder="Ask RADIANCE anything... (Shift+Enter for newline)"
          className="w-full bg-transparent border-0 outline-none resize-none text-base sm:text-sm text-[var(--txt)] placeholder:text-[var(--txt-muted)] py-1.5 max-h-[140px] leading-relaxed font-sans mb-2"
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
        <div className="flex items-center justify-between gap-1.5 sm:gap-2 pt-1 border-t border-[var(--border)]">
          {/* Left Controls: Add Files, Mode Selector, Model Trigger */}
          <div className="flex items-center gap-1.5 sm:gap-2 min-w-0 flex-1 overflow-x-visible">
            {/* 1. Add Files Expanding Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="group/btn h-8 px-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--txt-muted)] hover:text-[var(--txt)] transition-all flex items-center gap-1.5 text-xs font-mono touch-target"
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
                  setModeMenuOpen((prev) => !prev);
                }}
                className="h-8 px-2.5 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--txt)] transition-all flex items-center gap-1.5 text-xs font-mono touch-target"
                aria-haspopup="true"
                aria-expanded={modeMenuOpen}
              >
                <span>{mode}</span>
                <ChevronDown className="w-3 h-3 text-[var(--txt-muted)]" />
              </button>

              {modeMenuOpen && (
                <div
                  onClick={(e) => e.stopPropagation()}
                  className="fixed left-3 sm:absolute sm:left-0 bottom-24 sm:bottom-full mb-0 sm:mb-2 w-36 rounded-xl p-1.5 z-50 bg-[var(--deep)]/95 backdrop-blur-xl border border-[var(--border)] shadow-modal animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-0.5"
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

            {/* 3. Real Model Selector Pill (Image 2) */}
            <div className="relative inline-flex items-center">
              <button
                ref={modelTriggerRef}
                id="composer-model-trigger"
                type="button"
                data-testid="composer-model-trigger"
                onClick={handleOpenModelMenu}
                onKeyDown={handleTriggerKeyDown}
                title={activeModel.name}
                className="h-8 px-2.5 sm:px-3 rounded-full border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] hover:border-[var(--border-accent)] text-[var(--txt)] transition-all flex items-center gap-1.5 sm:gap-2 text-xs font-mono touch-target cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] active:scale-[0.98]"
                aria-haspopup="listbox"
                aria-expanded={modelMenuOpen}
                aria-controls="composer-model-listbox"
                aria-label={`Select AI model. Current model: ${activeModel.name}`}
              >
                <Cpu className="w-3.5 h-3.5 text-[#c084fc] shrink-0" aria-hidden="true" />
                <span className="font-mono text-xs sm:text-[13px] font-medium text-[var(--txt)] truncate max-w-[70px] xs:max-w-[110px] sm:max-w-none">
                  {activeModel.name}
                </span>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-[var(--txt-muted)] transition-transform duration-200 ${
                    modelMenuOpen ? "rotate-180" : ""
                  }`}
                  aria-hidden="true"
                />
              </button>

              {/* Model Selector Popover */}
              {modelMenuOpen && (
                <div
                  id="composer-model-listbox"
                  role="listbox"
                  aria-label="Available models"
                  aria-activedescendant={
                    focusedIndex >= 0 && AVAILABLE_MODELS[focusedIndex]
                      ? `model-option-${AVAILABLE_MODELS[focusedIndex].id}`
                      : undefined
                  }
                  tabIndex={-1}
                  onKeyDown={handleListboxKeyDown}
                  onClick={(e) => e.stopPropagation()}
                  className="absolute -left-16 sm:left-0 bottom-full mb-2 w-72 sm:w-80 max-w-[calc(100vw-2rem)] rounded-2xl p-2 z-50 bg-[var(--deep)]/95 backdrop-blur-2xl border border-[var(--border)] shadow-modal animate-in fade-in zoom-in-95 duration-150 flex flex-col gap-1 max-h-80 overflow-y-auto"
                >
                  <div className="px-3 py-1.5 text-xs font-mono text-[var(--txt-muted)] border-b border-[var(--border)] flex items-center justify-between select-none">
                    <span>Inference models</span>
                    <span className="text-[10px] text-[var(--txt-muted)]">Multi-provider</span>
                  </div>
                  <div className="flex flex-col gap-1 pt-1">
                    {AVAILABLE_MODELS.map((m, idx) => {
                      const isSelected = m.id === activeModel.id;
                      const isItemFocused = focusedIndex === idx;
                      return (
                        <button
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
                          onClick={(e) => handleSelectModel(e, m)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              handleSelectModel(e, m);
                            }
                          }}
                          className={`flex items-start gap-2.5 p-2.5 rounded-xl text-left transition-colors font-mono cursor-pointer focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[var(--accent)] ${
                            isSelected
                              ? "bg-[var(--accent-d)] border border-[var(--accent)] text-[var(--txt)] ring-1 ring-[var(--accent)]/40 shadow-sm"
                              : "hover:bg-[var(--surface-hover)] text-[var(--txt-dim)] hover:text-[var(--txt)] border border-transparent"
                          }`}
                        >
                          <span className="text-base mt-0.5 shrink-0 select-none">{m.icon}</span>
                          <div className="flex flex-col flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs font-semibold font-mono text-[var(--txt)] truncate">
                                {m.name}
                              </span>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <span className="text-[10px] capitalize px-1.5 py-0.5 rounded bg-[var(--surface)] text-[var(--txt-muted)] border border-[var(--border)] font-mono">
                                  {m.provider}
                                </span>
                                {isSelected && <CheckmarkIcon />}
                              </div>
                            </div>
                            <p className="text-[11px] text-[var(--txt-muted)] line-clamp-1 mt-0.5 leading-tight">
                              {m.sub}
                            </p>
                            <div className="flex items-center gap-2 mt-1.5 text-[9px] font-mono text-[var(--txt-muted)]">
                              {m.contextWindow && (
                                <span>{(m.contextWindow / 1024).toFixed(0)}k ctx</span>
                              )}
                              {m.supportsVision && (
                                <span className="text-[var(--txt-muted)] font-mono text-[10px]">Multimodal</span>
                              )}
                              {m.pricingTier === "free" && (
                                <span className="text-emerald-400 font-medium">Free</span>
                              )}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
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
              className={`group/rec h-8 px-2.5 rounded-full border border-[var(--border)] transition-all flex items-center gap-1.5 text-xs font-mono touch-target ${
                isRecording
                  ? "bg-red-500/20 border-red-500/40 text-red-400"
                  : "bg-[var(--surface)] text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)]"
              }`}
              title={isRecording ? "Stop recording" : "Record voice input"}
              aria-label="Record voice input"
            >
              {isRecording ? (
                <span className="w-2 h-2 rounded-full bg-red-500" />
              ) : (
                <Mic className="w-3.5 h-3.5 text-current shrink-0" />
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
                className="w-8 h-8 rounded-full bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90 transition-all shadow-sm shrink-0 flex items-center justify-center touch-target"
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
                className={`w-8 h-8 rounded-full transition-all shadow-sm shrink-0 flex items-center justify-center touch-target ${
                  isSubmitReady
                    ? "bg-[var(--accent)] text-[var(--void)] font-bold hover:opacity-90 active:scale-95"
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
        Radiance can make mistakes. Verify critical facts.
      </div>
    </div>
  );
}
