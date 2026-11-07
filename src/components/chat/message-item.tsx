"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import * as DropdownMenu from "@radix-ui/react-dropdown-menu";
import { motion, useReducedMotion } from "motion/react";
import { ChatMessage, FeedbackRating } from "@/lib/types/chat";
import { getMotionTransition } from "@/lib/motion/presets";
import { formatMarkdown, formatRelativeTime } from "@/lib/utils/format";
import { RadianceLogo } from "@/components/branding/radiance-logo";
import { FollowUpChips } from "./follow-up-chips";
import {
  Copy,
  Check,
  RotateCcw,
  Edit2,
  FileText,
  Download,
  Volume2,
  VolumeX,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  MoreHorizontal,
  AlertCircle,
  RefreshCw,
  Clock,
} from "lucide-react";

const CODE_EXT_MAP: Record<string, string> = {
  typescript: "ts", ts: "ts", tsx: "tsx", javascript: "js", js: "js", jsx: "jsx",
  python: "py", py: "py", sql: "sql", json: "json", html: "html", css: "css",
  scss: "scss", bash: "sh", sh: "sh", shell: "sh", rust: "rs", rs: "rs",
  go: "go", golang: "go", c: "c", cpp: "cpp", "c++": "cpp", java: "java",
  yaml: "yaml", yml: "yaml", markdown: "md", md: "md",
};

const ACTION_BTN_CLS = "min-w-[44px] min-h-[44px] p-2 rounded-xl hover:bg-[var(--surface-hover)] hover:text-[var(--txt)] transition-colors touch-target cursor-pointer flex items-center justify-center";
const DROPDOWN_ITEM_CLS =
  "min-h-[44px] flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg cursor-pointer outline-none hover:bg-[var(--surface-hover)] focus:bg-[var(--surface-hover)] text-[var(--txt)] transition-colors select-none";

export interface MessageItemProps {
  message: ChatMessage;
  isStreaming?: boolean;
  followUps?: string[];
  onSelectFollowUp?: (q: string) => void;
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  onDelete?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: FeedbackRating) => void;
  onRetry?: () => void;
}

export function MessageItem({
  message,
  isStreaming = false,
  followUps,
  onSelectFollowUp,
  onRegenerate,
  onEdit,
  onDelete,
  onFeedback,
  onRetry,
}: MessageItemProps) {
  const isUser = message.role === "user";
  const prefersReducedMotion = useReducedMotion() ?? false;
  const [copied, setCopied] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);

  useEffect(() => {
    setEditContent(message.content);
  }, [message.content]);

  const handleCopy = () => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(message.content);
      }
    } catch {
      // Fallback silently if clipboard is restricted
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Safe Client-Side Export (Markdown Blob Download) ──
  const handleExportMarkdown = () => {
    try {
      const filename = `radiance-message-${message.id || Date.now()}.md`;
      const blob = new Blob([message.content], { type: "text/markdown;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch {
      // Fallback: clipboard copy if blob URL creation is restricted
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(message.content);
      }
    }
  };

  const handleFeedback = (rating: FeedbackRating) => {
    if (!onFeedback) return;
    const nextRating = message.feedback === rating ? null : rating;
    onFeedback(message.id, nextRating);
  };

  const handleDelete = () => {
    onDelete?.(message.id);
  };

  const handleSaveEdit = () => {
    if (!editContent.trim()) return;
    onEdit?.(editContent.trim());
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setEditContent(message.content);
    setIsEditing(false);
  };

  const handleEditKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === "Escape") {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  // ── Web Speech Synthesis (Text-to-Speech) ──
  const toggleSpeech = () => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) {
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    window.speechSynthesis.cancel(); // Stop any pending utterances
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

  // Delegate click for dynamically rendered code block interactive buttons
  const handleContentClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const target = e.target as HTMLElement;

    // 1. Copy code to clipboard
    const copyBtn = target.closest(".code-copy-btn") as HTMLElement | null;
    if (copyBtn) {
      const code = copyBtn.getAttribute("data-code");
      if (code && typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(code);
        copyBtn.textContent = "Copied!";
        setTimeout(() => {
          copyBtn.textContent = "Copy";
        }, 1800);
      }
      return;
    }

    // 2. Download code snippet
    const downloadBtn = target.closest(".code-download-btn") as HTMLElement | null;
    if (downloadBtn) {
      const code = downloadBtn.getAttribute("data-code");
      const lang = (downloadBtn.getAttribute("data-lang") || "txt").toLowerCase();
      if (code) {
        const ext = CODE_EXT_MAP[lang] || "txt";
        const filename = `snippet-${Date.now()}.${ext}`;
        try {
          const blob = new Blob([code], { type: "text/plain;charset=utf-8" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
          downloadBtn.textContent = "Saved!";
          setTimeout(() => {
            downloadBtn.textContent = "Download";
          }, 1800);
        } catch {
          if (typeof navigator !== "undefined" && navigator.clipboard) {
            navigator.clipboard.writeText(code);
          }
        }
      }
      return;
    }

    // 3. Toggle expand / collapse code block
    const collapseBtn = target.closest(".code-collapse-btn") as HTMLElement | null;
    if (collapseBtn) {
      const wrapper = collapseBtn.closest(".code-block-wrapper");
      if (wrapper) {
        wrapper.classList.toggle("is-collapsed");
        const icon = collapseBtn.querySelector(".collapse-icon");
        if (icon) {
          icon.textContent = wrapper.classList.contains("is-collapsed") ? "+" : "−";
        }
      }
      return;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: prefersReducedMotion ? 0 : 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={getMotionTransition("entrance", prefersReducedMotion)}
      className={`flex gap-3 max-w-3xl w-full mx-auto my-3.5 group min-w-0 ${
        isUser ? "flex-row-reverse self-end" : "self-start"
      }`}
    >
      {/* Avatar */}
      <div
        className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-mono text-[10px] font-bold border transition-transform duration-200 group-hover:scale-105 select-none ${
          isUser
            ? "bg-[var(--user-bg)] border-[var(--user-border)] text-[var(--accent-b)] shadow-sm"
            : message.isError
            ? "bg-red-950/40 border-red-500/40 text-red-400 shadow-sm"
            : "bg-[var(--surface-raised)] border-[var(--border)] text-[var(--txt)] shadow-sm"
        }`}
      >
        {isUser ? (
          "YOU"
        ) : message.isError ? (
          "!"
        ) : (
          <div className="flex items-center justify-center relative w-full h-full p-1" title="Radiance">
            <RadianceLogo variant="symbol" size="xs" showWordmark={false} className="w-4 h-3.5" />
            <span className="sr-only">RD</span>
          </div>
        )}
      </div>

      {/* Bubble Container */}
      <div
        className={`flex flex-col gap-1 min-w-0 ${
          isUser
            ? "items-end w-fit max-w-[85%] sm:max-w-[75%]"
            : "items-start w-full max-w-full sm:max-w-[90%]"
        }`}
      >
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed border transition-all w-full min-w-0 font-sans ${
            isUser
              ? "bg-[var(--user-bg)] border-[var(--user-border)] text-[var(--txt)] shadow-card backdrop-blur-xl"
              : message.isError
              ? "bg-red-950/30 border-red-500/40 border-l-2 border-l-red-500 text-red-200 shadow-card backdrop-blur-xl"
              : "bg-[var(--ai-bg)] border-[var(--ai-border)] border-l-2 border-l-[var(--accent)] text-[var(--txt)] shadow-card backdrop-blur-2xl"
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.dataUrl} alt={img.name} className="max-h-60 object-cover" />
                  </div>
                ))}
            </div>
          )}

          {/* Inline Edit Form for User Message */}
          {isEditing ? (
            <div className="flex flex-col gap-2 w-full pt-1">
              <textarea
                value={editContent}
                onChange={(e) => setEditContent(e.target.value)}
                onKeyDown={handleEditKeyDown}
                rows={3}
                aria-label="Edit message prompt"
                data-testid="edit-message-textarea"
                className="w-full bg-[var(--deep)] border border-[var(--border)] rounded-lg p-2.5 text-base sm:text-xs text-[var(--txt)] focus:border-[var(--accent)] outline-none resize-y min-h-[70px] font-sans"
                autoFocus
              />
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="min-h-[36px] px-3 py-1.5 text-xs rounded-lg border border-[var(--border)] text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-colors cursor-pointer touch-target flex items-center justify-center"
                  data-testid="cancel-edit-button"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  disabled={!editContent.trim()}
                  className="min-h-[36px] px-3.5 py-1.5 text-xs rounded-lg bg-[var(--accent)] text-[var(--deep)] font-medium hover:opacity-90 disabled:opacity-40 transition-opacity cursor-pointer touch-target flex items-center justify-center"
                  data-testid="save-edit-button"
                >
                  Save & Resubmit
                </button>
              </div>
            </div>
          ) : message.isError ? (
            /* Structured Error Card */
            <div className="flex flex-col gap-2" data-testid="in-message-error-card">
              <div className="flex items-center gap-2 text-xs font-semibold text-red-400">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Generation failed</span>
              </div>
              <p className="text-xs text-red-300 leading-relaxed break-words font-mono">
                {message.errorDetails || message.content || "An unexpected inference error occurred. Please try again."}
              </p>
              {onRetry && (
                <div className="mt-2 pt-2 border-t border-red-500/20 flex justify-end">
                  <button
                    type="button"
                    onClick={onRetry}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-200 border border-red-500/30 transition-colors cursor-pointer"
                    data-testid="error-retry-button"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Retry generation</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            /* Standard Text Message Content */
            <div
              className="prose prose-invert max-w-none break-words text-[13.5px] leading-relaxed select-text min-w-0"
              onClick={handleContentClick}
              dangerouslySetInnerHTML={{
                __html: formatMarkdown(message.content, { isStreaming }),
              }}
            />
          )}

          {/* Streaming Cursor */}
          {isStreaming && <span className="stream-cursor" />}

          {/* Generated Image Display (Pollinations Flux) */}
          {message.generatedImageUrl && (
            <div className="mt-3.5 flex flex-col gap-2 rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--deep)] p-2.5">
              <div className="font-mono text-[9px] uppercase tracking-widest text-[var(--accent)] flex items-center justify-between">
                <span>Generated visual</span>
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
          {/* Accessible Semantic Timestamp Display */}
          <time
            dateTime={new Date(message.createdAt).toISOString()}
            title={new Date(message.createdAt).toISOString()}
            aria-label={`Sent at ${new Date(message.createdAt).toISOString()}`}
            data-testid="message-timestamp"
            className="tabular-nums cursor-default select-none hover:text-[var(--txt)] transition-colors"
          >
            {formatRelativeTime(message.createdAt)}
          </time>

          {/* ══ Desktop Hover/Focus-Within Action Toolbar (Hierarchically Structured) ══ */}
          <div className="opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 focus-within:opacity-100 transition-opacity duration-200 hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 rounded-xl bg-[var(--surface-raised)] border border-[var(--border)] shadow-sm backdrop-blur-md">
            {/* Primary Actions Cluster: Copy & Edit / Regenerate */}
            <button
              type="button"
              onClick={handleCopy}
              className={ACTION_BTN_CLS}
              title={copied ? "Copied to clipboard" : "Copy message"}
              aria-label={copied ? "Copied to clipboard" : "Copy message"}
              data-testid="copy-message-button"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-[var(--success)]" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {/* Edit User Message */}
            {isUser && onEdit && (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className={ACTION_BTN_CLS}
                title="Edit message"
                aria-label="Edit message"
                data-testid="edit-message-button"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Regenerate Assistant Response */}
            {!isUser && !message.isError && onRegenerate && !isStreaming && (
              <button
                type="button"
                onClick={onRegenerate}
                className={ACTION_BTN_CLS}
                title="Regenerate response"
                aria-label="Regenerate response"
                data-testid="regenerate-message-button"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Evaluation & Audio Cluster (Assistant only) */}
            {!isUser && !message.isError && (
              <>
                <span className="w-[1px] h-3 bg-[var(--border)] mx-0.5" />
                <button
                  type="button"
                  onClick={toggleSpeech}
                  className={`p-1.5 rounded-lg transition-colors touch-target cursor-pointer ${
                    isSpeaking
                      ? "text-[var(--accent)] bg-[var(--accent-d)] animate-pulse"
                      : "hover:bg-[var(--surface-hover)] hover:text-[var(--txt)] text-[var(--txt-muted)]"
                  }`}
                  title={isSpeaking ? "Stop speech" : "Read aloud"}
                  aria-label={isSpeaking ? "Stop speech" : "Read aloud"}
                  data-testid="read-aloud-button"
                >
                  {isSpeaking ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>

                {onFeedback && (
                  <>
                    <button
                      type="button"
                      onClick={() => handleFeedback("positive")}
                      className={`p-1.5 rounded-lg transition-colors touch-target cursor-pointer ${
                        message.feedback === "positive"
                          ? "text-[var(--accent)] bg-[var(--accent-d)]"
                          : "hover:bg-[var(--surface-hover)] hover:text-[var(--txt)] text-[var(--txt-muted)]"
                      }`}
                      title={message.feedback === "positive" ? "Helpful response (selected)" : "Good response"}
                      aria-label="Good response"
                      aria-pressed={message.feedback === "positive"}
                      data-testid="feedback-positive-button"
                    >
                      <ThumbsUp className={`w-3.5 h-3.5 ${message.feedback === "positive" ? "fill-current" : ""}`} />
                    </button>

                    <button
                      type="button"
                      onClick={() => handleFeedback("negative")}
                      className={`p-1.5 rounded-lg transition-colors touch-target cursor-pointer ${
                        message.feedback === "negative"
                          ? "text-red-400 bg-red-500/10"
                          : "hover:bg-[var(--surface-hover)] hover:text-[var(--txt)] text-[var(--txt-muted)]"
                      }`}
                      title={message.feedback === "negative" ? "Unhelpful response (selected)" : "Poor response"}
                      aria-label="Poor response"
                      aria-pressed={message.feedback === "negative"}
                      data-testid="feedback-negative-button"
                    >
                      <ThumbsDown className={`w-3.5 h-3.5 ${message.feedback === "negative" ? "fill-current" : ""}`} />
                    </button>
                  </>
                )}
              </>
            )}

            {/* Retry Failed Generation */}
            {message.isError && onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="p-1.5 rounded-lg hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-colors touch-target cursor-pointer"
                title="Retry generation"
                aria-label="Retry generation"
                data-testid="retry-message-button"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            )}

            {/* Utility & Destructive Cluster */}
            <span className="w-[1px] h-3 bg-[var(--border)] mx-0.5" />

            {/* Safe Client-Side Export (Markdown Download) */}
            <button
              type="button"
              onClick={handleExportMarkdown}
              className={ACTION_BTN_CLS}
              title="Export message as Markdown"
              aria-label="Export message as Markdown"
              data-testid="export-message-button"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            {/* Delete Message */}
            {onDelete && (
              <button
                type="button"
                onClick={handleDelete}
                className="p-1.5 rounded-lg hover:bg-red-500/15 hover:text-red-400 text-[var(--txt-muted)] transition-colors touch-target cursor-pointer"
                title="Delete message"
                aria-label="Delete message"
                data-testid="delete-message-button"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* ══ Mobile Accessible Action Menu (Radix Dropdown, >=44x44px touch targets) ══ */}
          <div className="flex sm:hidden items-center">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger asChild>
                <button
                  type="button"
                  className="min-w-[44px] min-h-[44px] p-2 rounded-lg flex items-center justify-center text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] active:bg-[var(--surface-raised)] transition-colors touch-target focus-visible:ring-2 focus-visible:ring-[var(--accent)] cursor-pointer"
                  aria-label="Message actions"
                  data-testid="mobile-action-menu-trigger"
                >
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenu.Trigger>

              <DropdownMenu.Portal>
                <DropdownMenu.Content
                  className="z-50 min-w-[210px] p-1.5 rounded-xl bg-[var(--deep)]/95 backdrop-blur-xl border border-[var(--border)] shadow-[0_12px_36px_rgba(0,0,0,0.6)] text-[var(--txt)] animate-in fade-in-50 zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
                  sideOffset={6}
                  align={isUser ? "end" : "start"}
                >
                  {/* Copy */}
                  <DropdownMenu.Item
                    onSelect={handleCopy}
                    className={DROPDOWN_ITEM_CLS}
                    data-testid="mobile-action-copy"
                  >
                    {copied ? <Check className="w-4 h-4 text-[var(--success)] shrink-0" /> : <Copy className="w-4 h-4 text-[var(--txt-muted)] shrink-0" />}
                    <span>{copied ? "Copied to clipboard" : "Copy text"}</span>
                  </DropdownMenu.Item>

                  {/* Edit (User only) */}
                  {isUser && onEdit && (
                    <DropdownMenu.Item
                      onSelect={() => setIsEditing(true)}
                      className={DROPDOWN_ITEM_CLS}
                      data-testid="mobile-action-edit"
                    >
                      <Edit2 className="w-4 h-4 text-[var(--txt-muted)] shrink-0" />
                      <span>Edit prompt</span>
                    </DropdownMenu.Item>
                  )}

                  {/* Regenerate (Assistant only) */}
                  {!isUser && !message.isError && onRegenerate && (
                    <DropdownMenu.Item
                      onSelect={onRegenerate}
                      className={DROPDOWN_ITEM_CLS}
                      data-testid="mobile-action-regenerate"
                    >
                      <RotateCcw className="w-4 h-4 text-[var(--txt-muted)] shrink-0" />
                      <span>Regenerate response</span>
                    </DropdownMenu.Item>
                  )}

                  {/* Retry (Error only) */}
                  {message.isError && onRetry && (
                    <DropdownMenu.Item
                      onSelect={onRetry}
                      className="min-h-[44px] flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg cursor-pointer outline-none hover:bg-red-500/15 focus:bg-red-500/15 text-red-400 transition-colors select-none"
                      data-testid="mobile-action-retry"
                    >
                      <RefreshCw className="w-4 h-4 text-red-400 shrink-0" />
                      <span>Retry generation</span>
                    </DropdownMenu.Item>
                  )}

                  {/* Sentiment Feedback (Assistant only) */}
                  {!isUser && !message.isError && onFeedback && (
                    <>
                      <DropdownMenu.Item
                        onSelect={() => handleFeedback("positive")}
                        className={DROPDOWN_ITEM_CLS}
                        data-testid="mobile-action-feedback-positive"
                      >
                        <ThumbsUp className={`w-4 h-4 shrink-0 ${message.feedback === "positive" ? "text-[var(--accent)] fill-current" : "text-[var(--txt-muted)]"}`} />
                        <span>{message.feedback === "positive" ? "Liked response (toggle off)" : "Helpful response"}</span>
                      </DropdownMenu.Item>

                      <DropdownMenu.Item
                        onSelect={() => handleFeedback("negative")}
                        className={DROPDOWN_ITEM_CLS}
                        data-testid="mobile-action-feedback-negative"
                      >
                        <ThumbsDown className={`w-4 h-4 shrink-0 ${message.feedback === "negative" ? "text-red-400 fill-current" : "text-[var(--txt-muted)]"}`} />
                        <span>{message.feedback === "negative" ? "Disliked response (toggle off)" : "Unhelpful response"}</span>
                      </DropdownMenu.Item>
                    </>
                  )}

                  {/* Safe Client-Side Export */}
                  <DropdownMenu.Item
                    onSelect={handleExportMarkdown}
                    className={DROPDOWN_ITEM_CLS}
                    data-testid="mobile-action-export"
                  >
                    <Download className="w-4 h-4 text-[var(--txt-muted)] shrink-0" />
                    <span>Export Markdown (.md)</span>
                  </DropdownMenu.Item>

                  <DropdownMenu.Separator className="h-px my-1 bg-[var(--border)]" />

                  {/* ISO Timestamp Info Item */}
                  <div className="px-3 py-2 text-[11px] font-mono text-[var(--txt-muted)] flex items-center gap-2 select-none" data-testid="mobile-timestamp-item">
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>{new Date(message.createdAt).toISOString()}</span>
                  </div>

                  {/* Delete */}
                  {onDelete && (
                    <>
                      <DropdownMenu.Separator className="h-px my-1 bg-[var(--border)]" />
                      <DropdownMenu.Item
                        onSelect={handleDelete}
                        className="min-h-[44px] flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg cursor-pointer outline-none hover:bg-red-500/15 focus:bg-red-500/15 text-red-400 transition-colors select-none"
                        data-testid="mobile-action-delete"
                      >
                        <Trash2 className="w-4 h-4 text-red-400 shrink-0" />
                        <span>Delete message</span>
                      </DropdownMenu.Item>
                    </>
                  )}
                </DropdownMenu.Content>
              </DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
