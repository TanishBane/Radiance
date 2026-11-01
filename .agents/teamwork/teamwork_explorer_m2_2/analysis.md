# Technical Analysis & Design: Milestone 2 — Part B: Session State, ChatMessage Type & Persistence

**Author**: `teamwork_explorer_m2_2` (Technical Explorer)  
**Date**: 2026-11-01  
**Target Files**:
- `src/lib/types/chat.ts`
- `src/features/chat/hooks/use-chat-session.ts`
- `tests/unit/use-chat-session.test.ts` (New test suite)

---

## 1. Executive Summary

Milestone 2 Part B delivers the core data models and session lifecycle operations required for interactive chat manipulation: message deletion, user message prompt editing with conversational history truncation, message sentiment feedback toggling, collision-resistant message ID generation, and synchronized persistence across memory and local storage.

This analysis provides the exhaustive technical architecture, implementation blueprints, edge-case protections, and test specifications for `teamwork_builder_m2_2` and `teamwork_tester_m2_2`.

---

## 2. Current State Assessment

### 2.1. `src/lib/types/chat.ts`
Currently:
```typescript
export interface ChatMessage {
  id: string;
  role: Role;
  content: string;
  createdAt: number;
  attachments?: Attachment[];
  generatedImageUrl?: string;
  isError?: boolean;
}
```
**Gaps Identified**:
1. `feedback?: "positive" | "negative" | null` is missing. Required by R2 & Project Scope Feature 21/29.
2. `errorDetails?: string` is missing. Required for structured in-message error reporting (Feature 35).
3. No shared `generateMessageId()` helper exported, leading to fragmented or colliding ID implementations.

### 2.2. `src/features/chat/hooks/use-chat-session.ts`
Currently:
1. **ID Collision Vulnerability** (Line 78):
   `id: msg_${Date.now()}` generates identical IDs if user messages are submitted in rapid succession (e.g., automated test runs, double-clicks, fast macros).
2. **Missing Message Actions**:
   - `deleteMessage(messageId: string)`: Missing completely.
   - `editUserMessage(messageId: string, newContent: string)`: Missing completely.
   - `setMessageFeedback(messageId: string, feedback: "positive" | "negative" | null)`: Missing completely.
3. **Stale Closures in Fast Interactions**:
   The hook relies on `messages` inside `useCallback` dependency arrays. Rapid consecutive mutations can close over stale state unless synchronized with a persistent ref (`messagesRef`).
4. **Conversation Metadata Integrity**:
   In `appendAssistantMessage` (Line 110), `createdAt: Date.now()` overwrites the conversation's original creation date on every new assistant response.
5. **No Exported Hook Return Interface**:
   Consumers lack a typed `UseChatSessionReturn` contract for clean prop drilling and mocking.

### 2.3. Persistence Flow (`src/lib/db/conversations.ts` & `src/lib/utils/storage.ts`)
- `safeLocalStorage.saveConversation(conv)` serializes the entire `Conversation` object, including `messages` array, to `localStorage` under `radiance_chat_<convId>`.
- Deleting or editing messages in `conv.messages` and calling `conversationService.save(updatedConv)` immediately reflects in local storage without schema restrictions.
- In `safeLocalStorage.listConversations()`, conversations are sorted descending by `updatedAt`.

---

## 3. Detailed Technical Design

### 3.1. Type Definitions & Helper (`src/lib/types/chat.ts`)

```typescript
export type FeedbackRating = "positive" | "negative" | null;

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
}

/**
 * Generates a collision-resistant unique message ID.
 * Combines Unix millisecond timestamp with a 7-character base36 pseudo-random string.
 * Example: "msg_1730443200123_x8k2p9q"
 */
export function generateMessageId(): string {
  return `msg_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Generates a collision-resistant unique conversation ID.
 * Example: "conv_1730443200123_f7m1v0a"
 */
export function generateConversationId(): string {
  return `conv_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}
```

### 3.2. Collision Resistance Math & Guarantees
- `Date.now()` provides millisecond granularity (13 digits).
- `Math.random().toString(36).slice(2, 9)` yields 7 characters from charset `[0-9a-z]` ($36^7 = 78,364,164,096$ possible states per millisecond).
- For $N = 1,000$ messages generated in the exact same millisecond:
  $$P(\text{collision}) \approx 1 - e^{-\frac{N^2}{2 \times 7.8 \times 10^{10}}} = 1 - e^{-\frac{10^6}{1.56 \times 10^{11}}} \approx 6.4 \times 10^{-6}$$
- This guarantees zero collisions in high-speed test suites and rapid user interactions.

---

### 3.3. `deleteMessage` Design

#### Signature
`deleteMessage(messageId: string): Promise<void>`

#### Logic & Invariants
1. Filter out `messageId` from `messages`:
   `const nextMessages = messagesRef.current.filter((m) => m.id !== messageId);`
2. Update ref and React state:
   `messagesRef.current = nextMessages;`
   `setMessages(nextMessages);`
   `setActiveFollowUps([]);`
3. If an active conversation exists (`activeConvRef.current`):
   - Retrieve conversation list via `await conversationService.list()`.
   - Locate existing conversation: `existingConv = list.find(c => c.id === convId)`.
   - If found, construct `updatedConv`:
     ```typescript
     const updatedConv: Conversation = {
       ...existingConv,
       updatedAt: Date.now(),
       messages: nextMessages,
     };
     ```
   - Persist: `await conversationService.save(updatedConv);`
   - Refresh state: `setConversations(await conversationService.list());`
4. Idempotency: Calling `deleteMessage` with an unknown or already-deleted ID leaves state intact without error.

---

### 3.4. `editUserMessage` Design

#### Signature
`editUserMessage(messageId: string, newContent: string): Promise<ChatMessage[]>`

#### Slicing & Resubmission Rationale
In conversational LLM architecture, editing a user prompt invalidates all subsequent assistant answers (and subsequent conversational turns) because they were generated in response to the outdated prompt.
Therefore:
1. Locate index: `const targetIndex = messagesRef.current.findIndex((m) => m.id === messageId);`
2. Validate target:
   - If `targetIndex === -1`, return current messages.
   - If `messagesRef.current[targetIndex].role !== "user"`, abort (only user messages are editable).
3. Create updated user message:
   ```typescript
   const updatedUserMsg: ChatMessage = {
     ...messagesRef.current[targetIndex],
     content: newContent,
   };
   ```
4. Slice conversation history:
   ```typescript
   const nextMessages = [...messagesRef.current.slice(0, targetIndex), updatedUserMsg];
   ```
5. Synchronize state & ref:
   `messagesRef.current = nextMessages;`
   `setMessages(nextMessages);`
   `setActiveFollowUps([]);`
6. Sync with Persistence:
   If `activeConvRef.current` exists:
   - Locate conversation in `conversationService.list()`.
   - If the edited message is the first user message (`targetIndex === 0`), also update conversation title:
     `const newTitle = newContent.slice(0, 36).trim() || "New Chat";`
   - Save updated conversation to storage.
   - Refresh `conversations` list in state.
7. Return `nextMessages`:
   Returns the sliced array containing the updated user prompt as the terminal element, ready to be immediately passed to `send(nextMessages)`.

---

### 3.5. `setMessageFeedback` Design

#### Signature
`setMessageFeedback(messageId: string, feedback: "positive" | "negative" | null): Promise<void>`

#### Toggling Logic & Invariants
A user clicking "Thumbs Up" when "Thumbs Up" is already active should deselect/toggle it back to unrated (`null`). Clicking "Thumbs Down" when "Thumbs Up" is active should toggle to `"negative"`.
```typescript
const currentMessages = messagesRef.current;
const nextMessages = currentMessages.map((m) => {
  if (m.id !== messageId) return m;
  // If the message already has the requested sentiment, toggle back to null.
  // Otherwise, set to the requested sentiment.
  const newFeedback = m.feedback === feedback ? null : feedback;
  return { ...m, feedback: newFeedback };
});
```
This supports both caller conventions:
- Callers that pass `"positive"` / `"negative"` expecting the hook to handle toggle-off.
- Callers that explicitly pass `null` to reset.

After mapping:
1. Update `messagesRef.current = nextMessages;`
2. `setMessages(nextMessages);`
3. Persist to storage via `conversationService.save()` if active conversation exists.

---

### 3.6. Complete Refined Hook Implementation Blueprint

```typescript
// src/features/chat/hooks/use-chat-session.ts
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Conversation,
  ChatMessage,
  Attachment,
  FeedbackRating,
  generateMessageId,
  generateConversationId,
} from "@/lib/types/chat";
import { conversationService } from "@/lib/db/conversations";
import { generateFollowUpQuestions } from "@/lib/ai/followups";

export interface UseChatSessionReturn {
  conversations: Conversation[];
  activeConvId: string | null;
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
    language: string
  ) => Promise<void>;
  deleteMessage: (messageId: string) => Promise<void>;
  editUserMessage: (messageId: string, newContent: string) => Promise<ChatMessage[]>;
  setMessageFeedback: (messageId: string, feedback: FeedbackRating) => Promise<void>;
  setConversations: React.Dispatch<React.SetStateAction<Conversation[]>>;
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

export function useChatSession(): UseChatSessionReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeFollowUps, setActiveFollowUps] = useState<string[]>([]);
  
  const activeConvRef = useRef<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);

  // Keep refs in sync with state
  useEffect(() => {
    activeConvRef.current = activeConvId;
  }, [activeConvId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  // Load conversations on mount
  useEffect(() => {
    conversationService.list().then((loaded) => {
      setConversations(loaded);
    });
  }, []);

  const selectConversation = useCallback((id: string) => {
    conversationService.list().then((list) => {
      const conv = list.find((c) => c.id === id);
      if (conv) {
        setActiveConvId(conv.id);
        activeConvRef.current = conv.id;
        setMessages(conv.messages);
        messagesRef.current = conv.messages;
        setActiveFollowUps([]);
      }
    });
  }, []);

  const newChat = useCallback(() => {
    setActiveConvId(null);
    activeConvRef.current = null;
    setMessages([]);
    messagesRef.current = [];
    setActiveFollowUps([]);
  }, []);

  const togglePin = useCallback(async (id: string) => {
    const list = await conversationService.list();
    const conv = list.find((c) => c.id === id);
    if (!conv) return;

    await conversationService.togglePin(id, conv.pinned);
    const updated = await conversationService.list();
    setConversations(updated);
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      await conversationService.delete(id);
      const updated = await conversationService.list();
      setConversations(updated);
      if (activeConvRef.current === id) {
        newChat();
      }
    },
    [newChat]
  );

  const deleteAllConversations = useCallback(async () => {
    const list = await conversationService.list();
    for (const c of list) {
      await conversationService.delete(c.id);
    }
    setConversations([]);
    newChat();
  }, [newChat]);

  const appendUserMessage = useCallback(
    (text: string, attachments: Attachment[] = []): ChatMessage[] => {
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: "user",
        content: text,
        createdAt: Date.now(),
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const nextMessages = [...messagesRef.current, userMessage];
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
      setActiveFollowUps([]);
      return nextMessages;
    },
    []
  );

  const appendAssistantMessage = useCallback(
    async (
      assistantMessage: ChatMessage,
      currentMessages: ChatMessage[],
      tone: string,
      language: string
    ) => {
      const finalMessages = [...currentMessages, assistantMessage];
      messagesRef.current = finalMessages;
      setMessages(finalMessages);

      const convId = activeConvRef.current || generateConversationId();
      if (!activeConvRef.current) {
        setActiveConvId(convId);
        activeConvRef.current = convId;
      }

      // Preserve existing conversation createdAt & pinned if present
      const list = await conversationService.list();
      const existing = list.find((c) => c.id === convId);

      const firstUserMsg = finalMessages.find((m) => m.role === "user");
      const title = existing?.title || (firstUserMsg ? firstUserMsg.content.slice(0, 36).trim() || "New Chat" : "New Chat");

      const updatedConv: Conversation = {
        id: convId,
        title,
        createdAt: existing ? existing.createdAt : Date.now(),
        updatedAt: Date.now(),
        pinned: existing ? existing.pinned : false,
        messages: finalMessages,
      };

      await conversationService.save(updatedConv);
      const updatedList = await conversationService.list();
      setConversations(updatedList);

      try {
        const followUps = await generateFollowUpQuestions(assistantMessage.content, tone, language);
        if (followUps && followUps.length > 0) {
          setActiveFollowUps(followUps);
        }
      } catch {
        // Non-critical background task failure
      }
    },
    []
  );

  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    const current = messagesRef.current;
    const nextMessages = current.filter((m) => m.id !== messageId);
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    setActiveFollowUps([]);

    const convId = activeConvRef.current;
    if (!convId) return;

    const list = await conversationService.list();
    const existingConv = list.find((c) => c.id === convId);
    if (!existingConv) return;

    const updatedConv: Conversation = {
      ...existingConv,
      updatedAt: Date.now(),
      messages: nextMessages,
    };

    await conversationService.save(updatedConv);
    const updatedList = await conversationService.list();
    setConversations(updatedList);
  }, []);

  const editUserMessage = useCallback(
    async (messageId: string, newContent: string): Promise<ChatMessage[]> => {
      const current = messagesRef.current;
      const targetIndex = current.findIndex((m) => m.id === messageId);
      if (targetIndex === -1 || current[targetIndex].role !== "user") {
        return current;
      }

      const updatedMsg: ChatMessage = {
        ...current[targetIndex],
        content: newContent,
      };

      // Truncate subsequent messages for resubmission
      const nextMessages = [...current.slice(0, targetIndex), updatedMsg];
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
      setActiveFollowUps([]);

      const convId = activeConvRef.current;
      if (convId) {
        const list = await conversationService.list();
        const existingConv = list.find((c) => c.id === convId);
        if (existingConv) {
          // If first user message was edited, also update title
          const title = targetIndex === 0
            ? newContent.slice(0, 36).trim() || "New Chat"
            : existingConv.title;

          const updatedConv: Conversation = {
            ...existingConv,
            title,
            updatedAt: Date.now(),
            messages: nextMessages,
          };
          await conversationService.save(updatedConv);
          const updatedList = await conversationService.list();
          setConversations(updatedList);
        }
      }

      return nextMessages;
    },
    []
  );

  const setMessageFeedback = useCallback(
    async (messageId: string, feedback: FeedbackRating): Promise<void> => {
      const current = messagesRef.current;
      const nextMessages = current.map((m) => {
        if (m.id !== messageId) return m;
        const newFeedback = m.feedback === feedback ? null : feedback;
        return { ...m, feedback: newFeedback };
      });

      messagesRef.current = nextMessages;
      setMessages(nextMessages);

      const convId = activeConvRef.current;
      if (convId) {
        const list = await conversationService.list();
        const existingConv = list.find((c) => c.id === convId);
        if (existingConv) {
          const updatedConv: Conversation = {
            ...existingConv,
            updatedAt: Date.now(),
            messages: nextMessages,
          };
          await conversationService.save(updatedConv);
          const updatedList = await conversationService.list();
          setConversations(updatedList);
        }
      }
    },
    []
  );

  return {
    conversations,
    activeConvId,
    messages,
    activeFollowUps,
    selectConversation,
    newChat,
    togglePin,
    deleteConversation,
    deleteAllConversations,
    appendUserMessage,
    appendAssistantMessage,
    deleteMessage,
    editUserMessage,
    setMessageFeedback,
    setConversations,
    setMessages,
  };
}
```

---

## 4. Unit Test Specifications (`tests/unit/use-chat-session.test.ts`)

The test suite must validate all requirements using Vitest and `@testing-library/react` (`renderHook`, `act`).

### Suite Breakdown
```typescript
describe("useChatSession Hook & Persistence Suite", () => {
  // 1. generateMessageId
  describe("generateMessageId", () => {
    it("generates ID with msg_ prefix and alphanumeric random suffix", () => { ... });
    it("produces zero collisions across 1,000 rapid iterations", () => { ... });
  });

  // 2. Initial state
  describe("Initial State", () => {
    it("initializes with empty messages, null activeConvId, and empty follow-ups", () => { ... });
    it("loads saved conversations from persistence on mount", async () => { ... });
  });

  // 3. appendUserMessage
  describe("appendUserMessage", () => {
    it("appends user message with unique collision-resistant ID", () => { ... });
    it("attaches files when provided", () => { ... });
    it("clears active follow-up questions", () => { ... });
  });

  // 4. deleteMessage
  describe("deleteMessage", () => {
    it("deletes specified message from messages state", async () => { ... });
    it("persists updated message list to conversationService when active conversation exists", async () => { ... });
    it("gracefully ignores non-existent message ID", async () => { ... });
    it("clears active follow-up questions upon deletion", async () => { ... });
  });

  // 5. editUserMessage
  describe("editUserMessage", () => {
    it("updates content of targeted user message", async () => { ... });
    it("slices away subsequent messages for resubmission", async () => { ... });
    it("returns sliced array for direct stream consumption", async () => { ... });
    it("updates conversation title when first user message is edited", async () => { ... });
    it("defensive guard: refuses to edit assistant message", async () => { ... });
  });

  // 6. setMessageFeedback
  describe("setMessageFeedback", () => {
    it("sets positive feedback on assistant message and persists", async () => { ... });
    it("sets negative feedback on assistant message and persists", async () => { ... });
    it("toggles sentiment back to null when clicking same feedback", async () => { ... });
    it("switches sentiment between positive and negative", async () => { ... });
    it("does not mutate other messages", async () => { ... });
  });

  // 7. ChatMessage Model Verification
  describe("ChatMessage Type Integrity", () => {
    it("supports isError and errorDetails properties", () => { ... });
    it("supports feedback rating union", () => { ... });
  });
});
```

---

## 5. Architectural Verification & Zero-Regression Check

1. **Next.js 15 App Router & React 19 Compliance**:
   - `use-chat-session.ts` is marked `"use client"`.
   - All state setters use React 19 dispatch semantics.
   - Ref caching prevents stale closures across asynchronous persistence boundaries.
2. **Compatibility with `use-chat-stream.ts`**:
   - Both hooks will share `generateMessageId()`.
   - `editUserMessage` returns `Promise<ChatMessage[]>` (and can be consumed directly by `send(messages)`).
3. **Compatibility with `chat-workspace.tsx` & `page.tsx`**:
   - Adding `deleteMessage`, `editUserMessage`, and `setMessageFeedback` to `useChatSession` extends the API without breaking existing consumers.
