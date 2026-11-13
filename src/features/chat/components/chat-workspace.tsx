"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage, Attachment, FeedbackRating, ModelOption } from "@/lib/types/chat";
import { MessageItem } from "@/components/chat/message-item";
import { WelcomeCard } from "@/components/chat/welcome-card";
import { FollowUpChips } from "@/components/chat/follow-up-chips";
import { ChatComposer } from "@/components/chat/chat-composer";
import { formatMarkdown } from "@/lib/utils/format";
import { RadianceLogo } from "@/components/branding/radiance-logo";
import { AlertCircle, RotateCcw } from "lucide-react";
import type { UiLanguage } from "@/lib/i18n/ui";

export interface ChatWorkspaceProps {
  language?: UiLanguage;
  messages: ChatMessage[];
  streamingContent: string;
  isGenerating: boolean;
  activeFollowUps: string[];
  onSend: (text: string, attachments?: Attachment[], mode?: string) => void;
  onStop: () => void;
  onSelectSuggestion: (text: string) => void;
  onOpenSettings?: () => void;
  selectedModel?: ModelOption;
  onSelectModel?: (model: ModelOption) => void;
  enterToSend?: boolean;

  // Milestone 3 Extensions: Inference, Errors & Actions
  streamError?: Error | null;
  onRetry?: () => void;
  onRegenerate?: (messageId: string) => void;
  onEditUserMessage?: (messageId: string, newContent: string) => void;
  onEditMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: FeedbackRating) => void;
  onRememberMessage?: (messageId: string, content: string) => void;
  onOpenPersonalIntelligence?: () => void;
  onFocusChange?: (focused: boolean) => void;
}

interface ChatErrorCardProps {
  error: string | Error;
  errorDetails?: string;
  onRetry?: () => void;
}

/**
 * In-Message Structured Error Card.
 * Replaces disruptive window.alert() with an accessible, in-chat visual error state and prominent Retry button.
 */
export function ChatErrorCard({ error, errorDetails, onRetry }: ChatErrorCardProps) {
  const errorMessage =
    typeof error === "string" ? error : error?.message || "An error occurred during response generation.";

  return (
    <div
      data-testid="in-message-error-card"
      role="alert"
      aria-live="assertive"
      className="flex gap-3 max-w-3xl w-full mx-auto my-3.5 self-start"
    >
      {/* Error State Avatar */}
      <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-mono text-[10px] font-bold border border-[var(--danger)]/30 bg-[var(--danger-d)] text-[var(--danger)] shadow-sm select-none">
        <AlertCircle className="w-4 h-4 text-[var(--danger)]" aria-hidden="true" />
      </div>

      {/* Error Bubble Card */}
      <div className="flex flex-col gap-1 max-w-[calc(100%-44px)] w-full">
        <div className="px-4 py-3.5 rounded-2xl rounded-tl-sm text-sm border bg-[var(--danger-d)]/40 border-[var(--danger)]/30 border-l-4 border-l-[var(--danger)] text-[var(--txt)] shadow-[0_4px_24px_rgba(232,85,85,0.08)] glass-panel">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="font-semibold text-xs uppercase tracking-wider text-[var(--danger)]">
              Generation Error
            </span>
          </div>

          <p className="text-[13px] leading-relaxed text-[var(--txt-dim)] break-words">
            {errorMessage}
          </p>

          {errorDetails && errorDetails !== errorMessage && (
            <p className="mt-2 text-xs font-mono text-[var(--txt-muted)] bg-black/20 p-2 rounded border border-[var(--border)] break-all">
              {errorDetails}
            </p>
          )}

          {onRetry && (
            <div className="mt-3 pt-2.5 border-t border-[var(--danger)]/20 flex items-center gap-2">
              <button
                type="button"
                onClick={onRetry}
                data-testid="error-retry-button"
                aria-label="Retry failed generation"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--danger)] hover:bg-[var(--danger)]/85 text-white shadow-sm transition-all duration-200 active:scale-95 touch-target focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--danger)] cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
                <span>Retry</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function ChatWorkspace({
  language = "en",
  messages,
  streamingContent,
  isGenerating,
  activeFollowUps,
  onSend,
  onStop,
  onSelectSuggestion,
  onOpenSettings: _onOpenSettings,
  selectedModel,
  onSelectModel,
  enterToSend = true,
  streamError,
  onRetry,
  onRegenerate,
  onEditUserMessage,
  onEditMessage,
  onDeleteMessage,
  onFeedback,
  onRememberMessage,
  onOpenPersonalIntelligence,
  onFocusChange,
}: ChatWorkspaceProps) {
  const chatScrollRef = useRef<HTMLDivElement | null>(null);
  const handleEdit = onEditUserMessage || onEditMessage;

  // Auto-scroll to bottom of chat when messages, stream tokens, generation status, or errors update
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent, isGenerating, streamError]);

  const hasContent = messages.length > 0 || isGenerating || Boolean(streamingContent) || Boolean(streamError);
  const showFollowUps = activeFollowUps.length > 0 && !isGenerating && !streamError;

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden z-10">
      {/* Scrollable Message List */}
      <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-3 sm:px-4 py-4 sm:py-6 scroll-smooth overscroll-contain [-webkit-overflow-scrolling:touch]">
        {!hasContent ? (
          <WelcomeCard language={language} onSelectPrompt={onSelectSuggestion} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6 pb-6">
            {messages.map((msg) =>
              msg.isError ? (
                <ChatErrorCard
                  key={msg.id}
                  error={msg.content || "An error occurred during response generation."}
                  errorDetails={msg.errorDetails}
                  onRetry={onRetry}
                />
              ) : (
                <MessageItem
                  key={msg.id}
                  message={msg}
                  onRegenerate={onRegenerate ? () => onRegenerate(msg.id) : undefined}
                  onEdit={handleEdit ? (newText) => handleEdit(msg.id, newText) : undefined}
                  onDelete={onDeleteMessage}
                  onFeedback={onFeedback}
                  onRemember={onRememberMessage}
                  onOpenPersonalIntelligence={onOpenPersonalIntelligence}
                  onRetry={onRetry}
                />
              )
            )}

            {/* Active Inference Indicator during TTFT (isGenerating is true but streamingContent is empty) */}
            {isGenerating && !streamingContent && (
              <div
                data-testid="active-inference-indicator"
                className="flex gap-3 max-w-3xl w-full mx-auto my-3.5 self-start animate-fade-in"
              >
                <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-mono text-[10px] font-bold border select-none bg-[var(--surface-raised)] border-[var(--border)] text-[var(--txt)] shadow-sm p-1">
                  <RadianceLogo variant="symbol" size="xs" showWordmark={false} className="w-4 h-3.5" />
                  <span className="sr-only">RD</span>
                </div>
                <div className="flex flex-col gap-1 max-w-[calc(100%-44px)]">
                  <div
                    role="status"
                    aria-live="polite"
                    aria-label="Generating response"
                    className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed border transition-all bg-[var(--ai-bg)] border-[var(--ai-border)] border-l-2 border-l-[var(--accent)] text-[var(--txt)] shadow-[0_4px_24px_rgba(0,0,0,0.25)] glass-panel inline-flex items-center gap-2.5"
                  >
                    <span className="flex items-center gap-1.5 py-0.5" aria-hidden="true">
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse [animation-delay:200ms]" />
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--accent)] animate-pulse [animation-delay:400ms]" />
                    </span>
                    <span className="font-mono text-xs text-[var(--txt-muted)] tracking-wide">
                      Thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Active SSE Streaming Placeholder with Progressive Markdown and Active Stream Cursor */}
            {streamingContent ? (
              <div
                data-testid="streaming-message"
                className="flex gap-3 max-w-3xl w-full mx-auto my-3.5 self-start"
              >
                <div className="w-8 h-8 rounded-xl shrink-0 flex items-center justify-center font-mono text-[10px] font-bold border select-none bg-[var(--surface-raised)] border-[var(--border)] text-[var(--txt)] shadow-sm p-1">
                  <RadianceLogo variant="symbol" size="xs" showWordmark={false} className="w-4 h-3.5" />
                  <span className="sr-only">RD</span>
                </div>
                <div className="flex flex-col gap-1 max-w-[calc(100%-44px)] w-full">
                  <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed border transition-all bg-[var(--ai-bg)] border-[var(--ai-border)] border-l-2 border-l-[var(--accent)] text-[var(--txt)] shadow-[0_4px_24px_rgba(0,0,0,0.25)] glass-panel">
                    <div
                      data-testid="streaming-content"
                      className="prose prose-invert max-w-none break-words text-[13.5px] leading-relaxed select-text inline"
                      dangerouslySetInnerHTML={{
                        __html: formatMarkdown(streamingContent, { isStreaming: true }),
                      }}
                    />
                    <span
                      data-testid="stream-cursor"
                      className="inline-block w-2 h-4 bg-[var(--accent)] ml-1 animate-pulse align-middle"
                      aria-hidden="true"
                    />
                  </div>
                </div>
              </div>
            ) : null}

            {/* Active Stream Error Card */}
            {streamError && !isGenerating && (
              <ChatErrorCard
                error={streamError}
                onRetry={onRetry}
              />
            )}
          </div>
        )}
      </div>

      <div
        className="mx-auto grid w-full max-w-[1440px] grid-cols-2 items-end gap-x-2 gap-y-2 px-3 sm:gap-x-4 md:grid-cols-[minmax(7rem,0.9fr)_minmax(0,3fr)_minmax(7rem,0.9fr)]"
        data-testid="composer-dock"
      >
        {showFollowUps && (
          <div
            className="min-w-0 md:col-start-1 md:row-start-1 md:self-center"
            data-testid="left-follow-up-lane"
          >
            <FollowUpChips
              questions={activeFollowUps}
              onSelect={onSelectSuggestion}
              label="Left"
              compact
            />
          </div>
        )}

        {/* Bottom Composer */}
        <div
          className={`min-w-0 ${
            showFollowUps
              ? "col-span-2 row-start-2 md:col-span-1 md:col-start-2 md:row-start-1"
              : "col-span-2 row-start-1 md:col-span-3"
          }`}
          data-testid="composer-lane"
        >
          <ChatComposer
            language={language}
            onSend={onSend}
            onStop={onStop}
            isGenerating={isGenerating}
            selectedModel={selectedModel}
            onSelectModel={onSelectModel}
            enterToSend={enterToSend}
            onFocusChange={onFocusChange}
          />
        </div>

        {showFollowUps && (
          <div
            className="min-w-0 col-start-2 row-start-1 md:col-start-3 md:row-start-1 md:self-center"
            data-testid="right-follow-up-lane"
          >
            <FollowUpChips
              questions={activeFollowUps}
              onSelect={onSelectSuggestion}
              label="Right"
              startAt={Math.min(1, activeFollowUps.length - 1)}
              compact
            />
          </div>
        )}
      </div>
    </div>
  );
}
