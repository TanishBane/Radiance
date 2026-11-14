import type { ChatMessage } from "@/lib/types/chat";

export const MAX_ASSISTANT_REGENERATIONS = 1;

export function canRegenerateResponse(message: ChatMessage): boolean {
  return message.role === "assistant" &&
    !message.isError &&
    (message.regenerationCount ?? 0) < MAX_ASSISTANT_REGENERATIONS;
}

export function markRegeneratedResponse(
  previous: ChatMessage,
  regenerated: ChatMessage,
  regeneratedAt = Date.now()
): ChatMessage {
  return {
    ...regenerated,
    id: previous.id,
    responseMode: previous.responseMode ?? previous.personalization?.mode ?? regenerated.responseMode ?? "ask",
    regenerationCount: (previous.regenerationCount ?? 0) + 1,
    lastRegeneratedAt: regeneratedAt,
  };
}
