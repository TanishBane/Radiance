"use client";

import React, { useRef, useState, useEffect } from "react";
import { Paperclip, Mic, MicOff, Send, Square, X, FileText } from "lucide-react";
import { Attachment } from "@/lib/types/chat";

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

interface ChatComposerProps {
  onSend: (text: string, attachments: Attachment[]) => void;
  onStop: () => void;
  isGenerating: boolean;
  disabled?: boolean;
}

export function ChatComposer({ onSend, onStop, isGenerating, disabled = false }: ChatComposerProps) {
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const recognitionRef = useRef<SpeechRecognitionInstance | null>(null);

  // Auto-resize textarea
  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 140)}px`;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleSubmit = () => {
    const trimmed = input.trim();
    if ((!trimmed && attachments.length === 0) || isGenerating || disabled) return;

    onSend(trimmed, attachments);
    setInput("");
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  // ── Voice Input using Web Speech API ──
  const toggleVoice = () => {
    if (typeof window === "undefined") return;
    const win = window as unknown as WindowWithSpeech;
    const SpeechRecognition = win.SpeechRecognition || win.webkitSpeechRecognition;

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

      recognition.onstart = () => setIsRecording(true);
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

  // ── File Ingestion Handler ──
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      alert("File size must be 10MB or less.");
      return;
    }

    const isImage = file.type.startsWith("image/");
    const isPDF = file.type === "application/pdf" || file.name.endsWith(".pdf");
    const isText = file.type === "text/plain" || file.name.endsWith(".txt");
    const isCSV = file.type === "text/csv" || file.name.endsWith(".csv");
    const isDoc = file.name.endsWith(".docx") || file.name.endsWith(".doc");

    const reader = new FileReader();

    if (isText || isCSV) {
      reader.onload = (event) => {
        const text = String(event.target?.result || "");
        setAttachments((prev) => [
          ...prev,
          {
            id: `att_${Date.now()}`,
            name: file.name,
            type: isCSV ? "csv" : "text",
            mime: file.type || "text/plain",
            size: file.size,
            extractedText: text,
          },
        ]);
      };
      reader.readAsText(file);
    } else {
      reader.onload = (event) => {
        const dataUrl = String(event.target?.result || "");
        setAttachments((prev) => [
          ...prev,
          {
            id: `att_${Date.now()}`,
            name: file.name,
            type: isImage ? "image" : isPDF ? "pdf" : "doc",
            mime: file.type || (isPDF ? "application/pdf" : "application/octet-stream"),
            size: file.size,
            dataUrl: isImage ? dataUrl : undefined,
          },
        ]);
      };
      reader.readAsDataURL(file);
    }

    e.target.value = "";
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  return (
    <div className="w-full max-w-3xl mx-auto px-4 pb-4 z-20">
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
      <div className="relative rounded-2xl bg-[var(--surface)] border border-[var(--border)] focus-within:border-[var(--accent)] focus-within:shadow-[0_0_25px_var(--accent-g)] transition-all duration-300">
        <div className="flex items-end gap-2 p-3">
          {/* File Upload Trigger */}
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2 rounded-xl text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-colors shrink-0"
            title="Attach file (image, PDF, CSV, text, document)"
          >
            <Paperclip className="w-4 h-4" />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            accept="image/*,.pdf,text/plain,text/csv,.csv,.txt,.docx"
            onChange={handleFileChange}
          />

          {/* Text Area */}
          <textarea
            ref={textareaRef}
            rows={1}
            value={input}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder="Ask RADIANCE anything... (Shift+Enter for newline)"
            className="flex-1 bg-transparent border-0 outline-none resize-none text-sm text-[var(--txt)] placeholder:text-[var(--txt-muted)] py-1.5 max-h-[140px] leading-relaxed"
          />

          {/* Microphone Voice Toggle */}
          <button
            type="button"
            onClick={toggleVoice}
            className={`p-2 rounded-xl transition-all shrink-0 ${
              isRecording
                ? "bg-[var(--danger)]/20 text-[var(--danger)] animate-pulse shadow-[0_0_15px_rgba(232,85,85,0.4)]"
                : "text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)]"
            }`}
            title={isRecording ? "Stop voice recording" : "Voice input"}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          {/* Send / Stop Toggle Button */}
          {isGenerating ? (
            <button
              type="button"
              onClick={onStop}
              className="p-2.5 rounded-xl bg-[var(--danger)] text-white hover:bg-[var(--danger)]/90 transition-all shadow-[0_0_15px_rgba(232,85,85,0.3)] shrink-0"
              title="Stop response generation"
            >
              <Square className="w-4 h-4 fill-white" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={(!input.trim() && attachments.length === 0) || disabled}
              className="p-2.5 rounded-xl bg-gradient-to-br from-[var(--accent-b)] to-[var(--accent)] text-[var(--void)] font-bold transition-all disabled:opacity-30 disabled:pointer-events-none hover:scale-105 shadow-[0_0_20px_var(--accent-g)] shrink-0"
              title="Send message (Enter)"
            >
              <Send className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Footer Hints */}
        <div className="flex items-center justify-between px-4 pb-2 pt-0 text-[10px] text-[var(--txt-muted)] font-mono">
          <span>{input.length} chars</span>
          <span className="hidden sm:inline">Enter send · Shift+Enter newline · Ctrl+K shortcuts</span>
        </div>
      </div>

      <div className="text-center text-[10px] text-[var(--txt-muted)] font-light mt-2 opacity-70">
        Radiance generates high-precision responses. Verify mission-critical details.
      </div>
    </div>
  );
}
