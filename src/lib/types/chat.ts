import type { Dispatch, SetStateAction } from "react";
import type { UiLanguage } from "@/lib/i18n/ui";

export type Role = "user" | "assistant" | "system";

export type FeedbackRating = "positive" | "negative" | null;

export interface Attachment {
  id: string;
  name: string;
  type: "image" | "pdf" | "text" | "csv" | "doc";
  mime: string;
  size: number;
  dataUrl?: string; // base64 preview (ephemeral)
  storagePath?: string;
  extractedText?: string;
}

export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  attachments?: Attachment[];
  generatedImageUrl?: string;
  isError?: boolean;
  errorDetails?: string;
  feedback?: FeedbackRating;
  personalization?: { memoryIds: string[]; preferenceIds: string[]; mode: "build" | "plan" | "ask" };
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  pinned: boolean;
  messages: ChatMessage[];
}

export type ToneKey =
  | "default"
  | "formal"
  | "casual"
  | "concise"
  | "academic"
  | "executive"
  | "mentor"
  | "technical"
  | "socratic"
  | "devil";

export interface ToneDefinition {
  id: ToneKey;
  label: string;
  icon: string;
  desc: string;
  prompt: string;
}

export type PersonaMode = "default";

export interface ModelOption {
  id: string;
  name: string;
  provider: "groq" | "gemini" | "openrouter";
  upstreamModel: string;
  sub: string;
  icon: string;
  supportsVision: boolean;
  supportsPdf: boolean;
  supportsTools?: boolean;
  contextWindow?: number;
  maxTokens: number;
  status: "active" | "deprecated" | "maintenance";
  verifiedDate: string;
  pricingTier?: "free" | "paid" | "standard";
}

/**
 * Generates a collision-resistant unique message ID.
 * Combines Unix millisecond timestamp with a 7-character base36 pseudo-random string.
 * Format: msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Generates a collision-resistant unique conversation ID.
 * Combines Unix millisecond timestamp with a 7-character base36 pseudo-random string.
 * Format: conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}
 */
export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export interface UseChatStreamReturn {
  isGenerating: boolean;
  streamingContent: string;
  streamError: Error | null;
  send: (messages: ChatMessage[], modelId?: string, mode?: string, personalization?: { provider: { memories: Array<{ category: string; content: string }>; preferences: string[] }; memoryIds: string[]; preferenceIds: string[] }) => Promise<void>;
  stop: (discardPartial?: boolean) => void;
  retryLast: () => Promise<void>;
}

export interface UseChatSessionReturn {
  conversations: Conversation[];
  activeConvId: string | null;
  isConversationHistoryLoaded: boolean;
  messages: ChatMessage[];
  activeFollowUps: string[];
  selectConversation: (id: string) => void;
  newChat: () => void;
  togglePin: (id: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  deleteAllConversations: () => Promise<void>;
  appendUserMessage: (text: string, attachments?: Attachment[]) => ChatMessage[];
  appendAssistantMessage: (
    assistantMessage: ChatMessage,
    currentMessages: ChatMessage[],
    tone: string,
    language?: UiLanguage
  ) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editUserMessage: (messageId: string, newContent: string) => Promise<ChatMessage[]>;
  setMessageFeedback: (messageId: string, feedback: FeedbackRating) => Promise<void>;
  setConversations: Dispatch<SetStateAction<Conversation[]>>;
  setMessages: Dispatch<SetStateAction<ChatMessage[]>>;
}

