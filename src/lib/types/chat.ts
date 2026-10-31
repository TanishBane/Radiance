export type Role = "user" | "assistant" | "system";

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

export type PersonaMode = "default" | "portfolio" | "student";

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
