"use client";

import React, { useRef, useEffect } from "react";
import { ChatMessage, Attachment, PersonaMode } from "@/lib/types/chat";
import { MessageItem } from "@/components/chat/message-item";
import { WelcomeCard } from "@/components/chat/welcome-card";
import { FollowUpChips } from "@/components/chat/follow-up-chips";
import { ChatComposer } from "@/components/chat/chat-composer";

interface ChatWorkspaceProps {
  messages: ChatMessage[];
  streamingContent: string;
  isGenerating: boolean;
  activeFollowUps: string[];
  mode: PersonaMode;
  onSend: (text: string, attachments?: Attachment[]) => void;
  onStop: () => void;
  onSelectSuggestion: (text: string) => void;
  onOpenSettings: () => void;
}

export function ChatWorkspace({
  messages,
  streamingContent,
  isGenerating,
  activeFollowUps,
  mode,
  onSend,
  onStop,
  onSelectSuggestion,
  onOpenSettings: _onOpenSettings,
}: ChatWorkspaceProps) {
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  return (
    <div className="flex-1 flex flex-col relative overflow-hidden z-10">
      {/* Scrollable Message List */}
      <div ref={chatScrollRef} className="flex-1 overflow-y-auto px-4 py-6 scroll-smooth">
        {messages.length === 0 ? (
          <WelcomeCard mode={mode} onSelectPrompt={onSelectSuggestion} />
        ) : (
          <div className="max-w-3xl mx-auto space-y-6 pb-6">
            {messages.map((msg) => (
              <MessageItem key={msg.id} message={msg} />
            ))}

            {/* Active SSE Streaming Placeholder */}
            {streamingContent && (
              <MessageItem
                message={{
                  id: "streaming_active",
                  role: "assistant",
                  content: streamingContent,
                  createdAt: Date.now(),
                }}
                isStreaming={true}
              />
            )}
          </div>
        )}
      </div>

      {/* Follow-up Suggestion Chips */}
      {activeFollowUps.length > 0 && !isGenerating && (
        <div className="max-w-3xl mx-auto w-full px-4 mb-2">
          <FollowUpChips questions={activeFollowUps} onSelect={onSelectSuggestion} />
        </div>
      )}

      {/* Bottom Composer */}
      <ChatComposer
        onSend={onSend}
        onStop={onStop}
        isGenerating={isGenerating}
      />
    </div>
  );
}
