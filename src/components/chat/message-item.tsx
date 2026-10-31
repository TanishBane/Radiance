"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { ChatMessage } from "@/lib/types/chat";
import { formatMarkdown, formatRelativeTime } from "@/lib/utils/format";
import { FollowUpChips } from "./follow-up-chips";
import { Copy, Check, RotateCcw, Edit2, FileText, Download, Volume2, VolumeX } from "lucide-react";

interface MessageItemProps {
  message: ChatMessage;
  isStreaming?: boolean;
  followUps?: string[];
  onSelectFollowUp?: (q: string) => void;
  onRegenerate?: () => void;
  onEdit?: (text: string) => void;
}

export function MessageItem({
  message,
  isStreaming = false,
  followUps,
  onSelectFollowUp,
  onRegenerate,
  onEdit,
}: MessageItemProps) {
  const isUser = message.role === "user";
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Web Speech Synthesis (Text-to-Speech) ──
  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      alert("Text-to-speech is not supported in this browser.");
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending utterances
    // Strip markdown symbols for clean audio speech
    const cleanText = message.content.replace(/[#*`_~\[\]()]/g, "");
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = "en-US";
    utterance.rate = 1.05;

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  useEffect(() => {
    return () => {
      if (typeof window !== "undefined" && "speechSynthesis" in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  // Delegate click for dynamically rendered code copy buttons
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("code-copy-btn")) {
      const code = target.getAttribute("data-code");
      if (code) {
        navigator.clipboard.writeText(code);
        target.textContent = "Copied!";
        setTimeout(() => {
          target.textContent = "Copy";
        }, 1800);
      }
    }
  };

  return (
    <div
      className={`flex gap-3 max-w-3xl w-full mx-auto my-3.5 group transition-all duration-300 ${
        isUser ? "flex-row-reverse self-end" : "self-start"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-mono text-[10px] font-bold border transition-transform duration-200 group-hover:scale-105 select-none ${
          isUser
            ? "bg-[var(--user-bg)] border-[var(--user-border)] text-[var(--accent-b)] shadow-[0_0_15px_var(--accent-d)]"
            : "bg-[var(--surface-raised)] border-[var(--border)] text-[var(--txt)] shadow-sm"
        }`}
      >
        {isUser ? "YOU" : <span className="gradient-text-brand">RD</span>}
      </div>

      {/* Bubble Container */}
      <div className="flex flex-col gap-1 max-w-[calc(100%-44px)]">
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed border transition-all ${
            isUser
              ? "bg-[var(--user-bg)] border-[var(--user-border)] rounded-tr-sm text-[var(--txt)]"
              : "bg-[var(--ai-bg)] border-[var(--ai-border)] border-l-2 border-l-[var(--accent)] rounded-tl-sm text-[var(--txt)] shadow-[0_4px_24px_rgba(0,0,0,0.25)] glass-panel"
          }`}
        >
          {/* User Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2.5">
              {message.attachments.map((att) => (
                <div
                  key={att.id}
                  className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[var(--deep)] border border-[var(--border)] text-xs text-[var(--txt-dim)]"
                >
                  <FileText className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
                  <span className="font-mono text-[11px] truncate max-w-[160px]">{att.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* User Image Previews */}
          {message.attachments?.some((a) => a.type === "image" && a.dataUrl) && (
            <div className="flex flex-wrap gap-2 mb-2">
              {message.attachments
                .filter((a) => a.type === "image" && a.dataUrl)
                .map((img) => (
                  <div key={img.id} className="relative rounded-lg overflow-hidden border border-[var(--border)] max-w-xs shadow-md">
                    <img src={img.dataUrl} alt={img.name} className="max-h-60 object-cover" />
                  </div>
                ))}
            </div>
          )}

          {/* Text Message Content */}
          <div
            className="prose prose-invert max-w-none break-words text-[13.5px] leading-relaxed select-text"
            onClick={handleContentClick}
            dangerouslySetInnerHTML={{
              __html: formatMarkdown(message.content),
            }}
          />

          {/* Streaming Cursor */}
          {isStreaming && <span className="stream-cursor" />}

          {/* Generated Image Display (Pollinations Flux) */}
          {message.generatedImageUrl && (
            <div className="mt-3.5 flex flex-col gap-2 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--deep)] p-2.5">
              <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--accent)] flex items-center justify-between">
                <span>Synthesized Flux Visual</span>
                <span className="text-[8px] text-[var(--txt-muted)] font-mono">1024x1024</span>
              </div>
              <div className="relative aspect-square max-w-sm rounded-lg overflow-hidden bg-black/40 shadow-inner">
                <Image
                  src={message.generatedImageUrl}
                  alt="Generated visual"
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="flex justify-end gap-2 pt-1">
                <a
                  href={message.generatedImageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--accent)] hover:bg-[var(--surface-hover)] transition-colors touch-target"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          )}

          {/* Follow-up Question Chips */}
          {followUps && followUps.length > 0 && onSelectFollowUp && (
            <div className="mt-2 pt-2 border-t border-[var(--border)]">
              <FollowUpChips questions={followUps} onSelect={onSelectFollowUp} />
            </div>
          )}
        </div>

        {/* Message Meta & Action Toolbar */}
        <div
          className={`flex items-center gap-2 px-1 text-[10px] text-[var(--txt-muted)] font-mono ${
            isUser ? "justify-end" : "justify-start"
          }`}
        >
          <span className="tabular-nums">{formatRelativeTime(message.createdAt)}</span>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
            <button
              type="button"
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] hover:text-[var(--txt)] transition-colors touch-target"
              title="Copy message"
              aria-label="Copy message"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {!isUser && (
              <button
                type="button"
                onClick={toggleSpeech}
                className={`p-1.5 rounded-md transition-colors touch-target ${
                  isSpeaking
                    ? "text-[var(--accent)] bg-[var(--accent-d)] animate-pulse"
                    : "hover:bg-[var(--surface-hover)] hover:text-[var(--txt)] text-[var(--txt-muted)]"
                }`}
                title={isSpeaking ? "Stop speech" : "Read aloud"}
                aria-label={isSpeaking ? "Stop speech" : "Read aloud"}
              >
                {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            )}

            {isUser && onEdit && (
              <button
                type="button"
                onClick={() => onEdit(message.content)}
                className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] hover:text-[var(--txt)] transition-colors touch-target"
                title="Edit message"
                aria-label="Edit message"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {!isUser && onRegenerate && (
              <button
                type="button"
                onClick={onRegenerate}
                className="p-1.5 rounded-md hover:bg-[var(--surface-hover)] hover:text-[var(--txt)] transition-colors touch-target"
                title="Regenerate response"
                aria-label="Regenerate response"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
