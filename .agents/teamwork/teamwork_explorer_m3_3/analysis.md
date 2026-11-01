# Architectural Analysis: Page Callback Wiring & State Coordination (Milestone 3 Explorer 3)

**Author**: `teamwork_explorer_m3_3`  
**Working Directory**: `c:\Tanixai-main\.agents\teamwork\teamwork_explorer_m3_3\`  
**Target Files**: `src/app/page.tsx`, `src/features/chat/components/chat-workspace.tsx`, `src/components/chat/message-item.tsx`  
**Dependencies**: `src/features/chat/hooks/use-chat-session.ts`, `src/features/chat/hooks/use-chat-stream.ts`, `src/lib/types/chat.ts`  
**Status**: Completed Analysis  

---

## 1. Executive Summary

Milestone 2 completed the foundational streaming and session state infrastructure (`use-chat-stream.ts`, `use-chat-session.ts`, `ChatMessage` types, and `chat-composer.tsx`). However, `src/app/page.tsx` currently operates as a disconnected shell:
1. It does not destructure or connect the state mutation methods (`deleteMessage`, `editUserMessage`, `setMessageFeedback`) provided by `useChatSession`.
2. It does not pass `streamError` or `retryLast` from `useChatStream` into `ChatWorkspace`.
3. It emits disruptive native modal dialogs via `alert(\`Inference error: ${error.message}\`)` on line 62 rather than routing errors cleanly into in-chat error cards.
4. It does not bind or pass message action callbacks (`onRegenerate`, `onEditUserMessage`, `onDeleteMessage`, `onFeedback`, `onRetry`) to `ChatWorkspace`.
5. It is vulnerable to stale closure issues during `handleStreamComplete` and cross-conversation stream contamination when switching conversations during active inference.

This document specifies the exact callback designs, state coordination mechanics, error routing, interface contracts, and unit test specifications required to complete Milestone 3 integration.

---

## 2. Current State Audit (`src/app/page.tsx`)

### 2.1 Hook Destructuring Deficiencies
Direct observation of `src/app/page.tsx` (lines 40–71):

```typescript
// Lines 40-52:
const {
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
} = useChatSession();

// Lines 54-63:
const handleStreamComplete = useCallback(
  (assistantMsg: any) => {
    appendAssistantMessage(assistantMsg, messages, tone, language);
  },
  [appendAssistantMessage, messages, tone, language]
);

const handleStreamError = useCallback((error: Error) => {
  alert(`Inference error: ${error.message}`);
}, []);

// Lines 65-71:
const { isGenerating, streamingContent, send, stop } = useChatStream({
  modelId,
  tone,
  language,
  onStreamComplete: handleStreamComplete,
  onError: handleStreamError,
});
```

**Issues Identified**:
- `useChatSession` exports `deleteMessage`, `editUserMessage`, `setMessageFeedback`, `setMessages`, and `setConversations` (see `use-chat-session.ts` lines 266–284), but none of these are destructured or utilized in `page.tsx`.
- `useChatStream` exports `streamError` and `retryLast` (see `use-chat-stream.ts` lines 195–203), but neither is destructured or wired to `ChatWorkspace`.
- `handleStreamError` on line 62 invokes `window.alert()`. This breaks automated browser testing, interrupts the UX, freezes the JS thread, and violates Requirement R3 / Survey Item 61.

### 2.2 Workspace Props Omissions
Direct observation of `src/app/page.tsx` (lines 156–165):

```typescript
<ChatWorkspace
  messages={messages}
  streamingContent={streamingContent}
  isGenerating={isGenerating}
  activeFollowUps={activeFollowUps}
  onSend={handleSend}
  onStop={stop}
  onSelectSuggestion={handleSend}
  onOpenSettings={() => setSettingsOpen(true)}
/>
```

**Issues Identified**:
- Zero action handlers are passed: `ChatWorkspace` has no access to regeneration, prompt editing, message deletion, sentiment feedback, or stream retry.
- `streamError` is omitted: `ChatWorkspace` cannot render the in-message error card when network or API errors occur.

### 2.3 Stale Closure & Cross-Conversation Race Conditions
1. **Stale `messages` in `handleStreamComplete`**:
   `handleStreamComplete` closes over `messages` via `useCallback(..., [appendAssistantMessage, messages, tone, language])`. When `handleSend` triggers `send(nextMessages)`, the initial render closure of `handleStreamComplete` may hold stale message references before React reconciles the DOM. A defensive `messagesRef` is required to ensure `appendAssistantMessage` receives the true current history.
2. **Active Stream Contamination**:
   If a user triggers `newChat()` or clicks a different conversation in `HistoryDrawer` while an SSE stream is in-flight, the stream continues accumulating in the background and eventually appends the assistant reply to the *new* or *switched* conversation! `newChat` and `selectConversation` must immediately call `stop()` if `isGenerating` is true.

---

## 3. End-to-End Callback Design

### 3.1 `onRegenerate(messageId: string)`
**Requirement**: Stop stream if running, prune to previous user turn, update session and storage, invoke `stream.send()`.

#### Step-by-Step Logic:
1. **Halt Ongoing Generation**:
   Check `if (isGenerating) stop();` to immediately cancel any in-flight SSE stream and abort network requests.
2. **Locate Target Message**:
   Find `targetIdx = messages.findIndex((m) => m.id === messageId)`. If `-1`, exit gracefully.
3. **Prune to Prompting Turn**:
   Search backwards from `targetIdx` to find the nearest preceding user message:
   ```typescript
   let userIdx = targetIdx;
   while (userIdx >= 0 && messages[userIdx].role !== "user") {
     userIdx--;
   }
   if (userIdx < 0) return; // Guard: No preceding user turn exists to regenerate from
   ```
4. **Slice Conversation History**:
   ```typescript
   const prunedMessages = messages.slice(0, userIdx + 1);
   messagesRef.current = prunedMessages;
   setMessages(prunedMessages);
   ```
5. **Sync Storage / Persistence**:
   If `activeConvId` is present:
   ```typescript
   const list = await conversationService.list();
   const existing = list.find((c) => c.id === activeConvId);
   if (existing) {
     await conversationService.save({
       ...existing,
       updatedAt: Date.now(),
       messages: prunedMessages,
     });
     const updatedList = await conversationService.list();
     setConversations(updatedList);
   }
   ```
6. **Trigger Inference**:
   Call `await send(prunedMessages);`. The subsequent assistant response will be appended directly to `prunedMessages` on completion via `appendAssistantMessage`.

---

### 3.2 `onEditUserMessage(messageId: string, newContent: string)`
**Requirement**: Call `session.editUserMessage()`, invoke `stream.send()` with truncated history.

#### Step-by-Step Logic:
1. **Validate & Halt**:
   Validate `if (!newContent.trim()) return;`. If `isGenerating`, immediately call `stop()`.
2. **Execute Session Truncation**:
   Call `const truncatedMessages = await editUserMessage(messageId, newContent);`.
   *Note*: Milestone 2's `editUserMessage` already performs:
   - Slicing off all downstream turns (`[...current.slice(0, targetIndex), updatedMsg]`).
   - Title recalculation if editing the initial user turn.
   - Persistence save via `conversationService.save()`.
   - Returning `truncatedMessages` as `Promise<ChatMessage[]>`.
3. **Trigger Inference**:
   If `truncatedMessages && truncatedMessages.length > 0`:
   ```typescript
   await send(truncatedMessages);
   ```

---

### 3.3 `onDeleteMessage(messageId: string)`
**Requirement**: Call `session.deleteMessage()`.

#### Step-by-Step Logic:
1. **Halt if Deleting Active Turn**:
   If `isGenerating` is true, call `stop()` to prevent orphaned tokens from appending.
2. **Execute Session Deletion**:
   Call `await deleteMessage(messageId);`.
   *Note*: Milestone 2's `deleteMessage` removes the item by ID from in-memory state, updates `messagesRef`, clears `activeFollowUps`, and updates storage.
3. **Clean Fallback**:
   If the deleted message was the last one, `messages` becomes `[]`, causing `ChatWorkspace` to naturally present the `WelcomeCard`.

---

### 3.4 `onFeedback(messageId: string, rating: FeedbackRating)`
**Requirement**: Call `session.setMessageFeedback()`.

#### Step-by-Step Logic:
1. **Execute Feedback Update**:
   Call `await setMessageFeedback(messageId, rating);`.
   *Note*: `FeedbackRating = "positive" | "negative" | null`. Milestone 2's `setMessageFeedback` toggles the sentiment (if same rating is clicked twice, sets to `null`), updates in-memory `ChatMessage.feedback`, and saves to persistence.

---

### 3.5 `onRetry()`
**Requirement**: Call `stream.retryLast()`.

#### Step-by-Step Logic:
1. **Guard & Dispatch**:
   If `isGenerating`, return early.
   Invoke `await retryLast();`.
   *Note*: Milestone 2's `retryLast()` in `useChatStream` preserves `lastMessagesRef` and `lastModelIdRef`, resets `streamError: null`, and initiates `send()`.

---

## 4. Error Architecture: Elimination of `window.alert()`

### 4.1 Root Cause & Negative Impact
In `src/app/page.tsx` line 61–63:
```typescript
const handleStreamError = useCallback((error: Error) => {
  alert(`Inference error: ${error.message}`);
}, []);
```
- Native `alert()` modal halts the browser UI thread and stops animation loops.
- Causes automated Playwright and Vitest tests to hang unless dialog handlers are explicitly bound.
- Violates Project Requirement R3 (Item 61 & 69 in `PROJECT.md`).

### 4.2 Replacement Architecture
1. In `src/app/page.tsx`:
   Replace `alert()` with telemetry logging:
   ```typescript
   const handleStreamError = useCallback((error: Error) => {
     console.error("[Radiance] Inference stream error:", error);
   }, []);
   ```
2. Destructure `streamError` from `useChatStream`:
   ```typescript
   const { isGenerating, streamingContent, streamError, send, stop, retryLast } = useChatStream({
     modelId,
     tone,
     language,
     onStreamComplete: handleStreamComplete,
     onError: handleStreamError,
   });
   ```
3. Pass `streamError` and `onRetry` down to `ChatWorkspace`:
   ```typescript
   <ChatWorkspace
     ...
     streamError={streamError}
     onRetry={handleRetry}
   />
   ```
4. `ChatWorkspace` renders the in-chat structured error card when `streamError` is non-null:
   - Displays error description with alert icon.
   - Displays accessible "Retry" button linked to `onRetry`.
   - Clicking "Retry" calls `retryLast()`, which automatically clears `streamError: null` and restarts inference.

---

## 5. Component Props Interface Contracts

To ensure perfect alignment across Milestone 3 subagents (Explorer 1, Explorer 2, Explorer 3), the component props contracts are structured as follows:

### 5.1 `ChatWorkspaceProps` Contract (`src/features/chat/components/chat-workspace.tsx`)

```typescript
import { ChatMessage, Attachment, FeedbackRating } from "@/lib/types/chat";

export interface ChatWorkspaceProps {
  // Existing Properties
  messages: ChatMessage[];
  streamingContent: string;
  isGenerating: boolean;
  activeFollowUps: string[];
  onSend: (text: string, attachments?: Attachment[]) => void;
  onStop: () => void;
  onSelectSuggestion: (text: string) => void;
  onOpenSettings: () => void;

  // New Milestone 3 Properties
  streamError?: Error | null;
  onRegenerate?: (messageId: string) => void;
  onEditUserMessage?: (messageId: string, newContent: string) => void;
  onDeleteMessage?: (messageId: string) => void;
  onFeedback?: (messageId: string, feedback: FeedbackRating) => void;
  onRetry?: () => void;
}
```

### 5.2 `MessageItemProps` Contract (`src/components/chat/message-item.tsx`)

```typescript
import { ChatMessage, FeedbackRating } from "@/lib/types/chat";

export interface MessageItemProps {
  message: ChatMessage;
  isStreaming?: boolean;
  followUps?: string[];
  onSelectFollowUp?: (q: string) => void;

  // Milestone 3 Action Callbacks
  onRegenerate?: () => void;
  onEdit?: (newContent: string) => void;
  onDelete?: () => void;
  onFeedback?: (rating: FeedbackRating) => void;
  onRetry?: () => void;
}
```

### 5.3 Delegation Mapping in `ChatWorkspace`
`ChatWorkspace` maps its ID-aware callbacks to `MessageItem` by currying `msg.id`:

```tsx
{messages.map((msg) => (
  <MessageItem
    key={msg.id}
    message={msg}
    onRegenerate={onRegenerate ? () => onRegenerate(msg.id) : undefined}
    onEdit={onEditUserMessage ? (newContent) => onEditUserMessage(msg.id, newContent) : undefined}
    onDelete={onDeleteMessage ? () => onDeleteMessage(msg.id) : undefined}
    onFeedback={onFeedback ? (rating) => onFeedback(msg.id, rating) : undefined}
    onRetry={onRetry}
  />
))}
```

**Benefits of this Contract Structure**:
1. **Backwards Compatibility**: Maintains the exact existing `onRegenerate?: () => void` and `onEdit?: (text: string) => void` shapes in `message-item.tsx`.
2. **Encapsulation**: `MessageItem` does not need to know about conversation-level IDs or storage logic; it simply invokes its local callback.
3. **Decoupled Testing**: Unit tests for `MessageItem` can trigger `onRegenerate()` directly without passing mock message ID arguments.

---

## 6. Implementation Blueprint for `src/app/page.tsx`

The following code is the complete, drop-in replacement specification for `src/app/page.tsx`:

```tsx
"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ToneKey, Attachment, ModelOption, ChatMessage, FeedbackRating } from "@/lib/types/chat";
import { ThemeId, THEMES, GradientStyle } from "@/lib/types/theme";
import { DEFAULT_MODEL_ID, getModelById } from "@/lib/ai/models";
import { conversationService } from "@/lib/db/conversations";

// Background & Branding
import { AmbientCanvas } from "@/components/background/ambient-canvas";
import { BackgroundLayers } from "@/components/background/background-layers";
import { IntroSplash } from "@/components/branding/intro-splash";

// Navigation & Drawers
import { Topbar } from "@/components/navigation/topbar";
import { SidebarDock } from "@/components/navigation/sidebar-dock";
import { HistoryDrawer } from "@/components/navigation/history-drawer";
import { SettingsDrawer } from "@/components/navigation/settings-drawer";
import { ShortcutsDialog } from "@/components/modals/shortcuts-dialog";

// Feature Modules
import { useChatSession } from "@/features/chat/hooks/use-chat-session";
import { useChatStream } from "@/features/chat/hooks/use-chat-stream";
import { ChatWorkspace } from "@/features/chat/components/chat-workspace";

export default function RadianceApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState<ThemeId>("violet");
  const [gradientStyle, setGradientStyle] = useState<GradientStyle>("bloom");
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [tone, setTone] = useState<ToneKey>("default");
  const [language, setLanguage] = useState<"en" | "hi">("en");

  // Drawers & Modals State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);

  // Feature Hooks
  const {
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
    setMessages,
    setConversations,
  } = useChatSession();

  // Defensive ref synchronization to eliminate stale closure bugs
  const messagesRef = useRef<ChatMessage[]>(messages);
  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  const handleStreamComplete = useCallback(
    (assistantMsg: ChatMessage) => {
      appendAssistantMessage(assistantMsg, messagesRef.current, tone, language);
    },
    [appendAssistantMessage, tone, language]
  );

  const handleStreamError = useCallback((error: Error) => {
    console.error("[Radiance] Inference stream error:", error);
  }, []);

  const { isGenerating, streamingContent, streamError, send, stop, retryLast } = useChatStream({
    modelId,
    tone,
    language,
    onStreamComplete: handleStreamComplete,
    onError: handleStreamError,
  });

  const selectedTheme = THEMES[theme] || THEMES.violet;
  const selectedModel = getModelById(modelId);

  // Apply Theme CSS Tokens
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", selectedTheme.accent);
    root.style.setProperty("--accent-b", selectedTheme.accentB);
    root.style.setProperty("--accent-c", selectedTheme.accentC);
    root.style.setProperty("--accent-d", selectedTheme.accentD);
    root.style.setProperty("--accent-g", selectedTheme.accentG);
    root.style.setProperty("--text-gradient", selectedTheme.textGradient);
    if (selectedTheme.bgGradient) {
      root.style.setProperty("--bg-gradient", selectedTheme.bgGradient);
    }
  }, [selectedTheme]);

  // Safe Conversation Navigation (prevents cross-session stream contamination)
  const handleNewChat = useCallback(() => {
    if (isGenerating) stop();
    newChat();
  }, [isGenerating, stop, newChat]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      if (isGenerating) stop();
      selectConversation(id);
      setHistoryOpen(false);
    },
    [isGenerating, stop, selectConversation]
  );

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "N") {
        e.preventDefault();
        handleNewChat();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "l") {
        e.preventDefault();
        setHistoryOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setMobileSidebarOpen(false);
        setHistoryOpen(false);
        setSettingsOpen(false);
        setShortcutsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNewChat]);

  // ── Action Handlers ──

  const handleSend = useCallback(
    (text: string, attachments: Attachment[] = []) => {
      const nextMessages = appendUserMessage(text, attachments);
      send(nextMessages);
    },
    [appendUserMessage, send]
  );

  const handleRegenerate = useCallback(
    async (messageId: string) => {
      if (isGenerating) {
        stop();
      }

      const current = messagesRef.current;
      const targetIndex = current.findIndex((m) => m.id === messageId);
      if (targetIndex === -1) return;

      // Find nearest preceding user prompt
      let userIndex = targetIndex;
      while (userIndex >= 0 && current[userIndex].role !== "user") {
        userIndex--;
      }
      if (userIndex < 0) return;

      const prunedMessages = current.slice(0, userIndex + 1);
      messagesRef.current = prunedMessages;
      setMessages(prunedMessages);

      if (activeConvId) {
        const list = await conversationService.list();
        const existing = list.find((c) => c.id === activeConvId);
        if (existing) {
          const updatedConv = {
            ...existing,
            updatedAt: Date.now(),
            messages: prunedMessages,
          };
          await conversationService.save(updatedConv);
          const updatedList = await conversationService.list();
          setConversations(updatedList);
        }
      }

      await send(prunedMessages);
    },
    [isGenerating, stop, activeConvId, setMessages, setConversations, send]
  );

  const handleEditUserMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!newContent.trim()) return;
      if (isGenerating) {
        stop();
      }

      const truncatedMessages = await editUserMessage(messageId, newContent);
      if (truncatedMessages && truncatedMessages.length > 0) {
        await send(truncatedMessages);
      }
    },
    [isGenerating, stop, editUserMessage, send]
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      if (isGenerating) {
        stop();
      }
      await deleteMessage(messageId);
    },
    [isGenerating, stop, deleteMessage]
  );

  const handleFeedback = useCallback(
    async (messageId: string, rating: FeedbackRating) => {
      await setMessageFeedback(messageId, rating);
    },
    [setMessageFeedback]
  );

  const handleRetry = useCallback(async () => {
    if (isGenerating) return;
    await retryLast();
  }, [isGenerating, retryLast]);

  return (
    <div className="relative flex flex-row h-[100dvh] w-screen overflow-hidden bg-[var(--void)] text-[var(--txt)] font-sans select-none">
      {/* Background Engines */}
      {gradientStyle === "cosmic" && (
        <AmbientCanvas accentColor={selectedTheme.accent} />
      )}
      <BackgroundLayers
        theme={selectedTheme}
        gradientStyle={gradientStyle}
        bgGradient={selectedTheme.bgGradient}
      />

      {/* Intro Splash Animation */}
      {showSplash && <IntroSplash onComplete={() => setShowSplash(false)} />}

      {/* Left: Full-Height Sidebar Dock */}
      <SidebarDock
        open={mobileSidebarOpen}
        setOpen={setMobileSidebarOpen}
        onNewChat={handleNewChat}
        onToggleHistory={() => setHistoryOpen((h) => !h)}
        onToggleSettings={() => setSettingsOpen((s) => !s)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
      />

      {/* Right: Main Application Pane */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        <Topbar
          selectedModel={selectedModel}
          onSelectModel={(m: ModelOption) => setModelId(m.id)}
          language={language}
          onToggleLanguage={(l) => setLanguage(l)}
          onClearChat={handleNewChat}
          onNewChat={handleNewChat}
          onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)}
        />

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <ChatWorkspace
            messages={messages}
            streamingContent={streamingContent}
            isGenerating={isGenerating}
            streamError={streamError}
            activeFollowUps={activeFollowUps}
            onSend={handleSend}
            onStop={stop}
            onSelectSuggestion={handleSend}
            onOpenSettings={() => setSettingsOpen(true)}
            onRegenerate={handleRegenerate}
            onEditUserMessage={handleEditUserMessage}
            onDeleteMessage={handleDeleteMessage}
            onFeedback={handleFeedback}
            onRetry={handleRetry}
          />
        </div>
      </main>

      {/* Slide-out Navigation Drawers & Dialogs */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        conversations={conversations}
        activeConversationId={activeConvId || undefined}
        onSelectConversation={handleSelectConversation}
        onTogglePin={togglePin}
        onDeleteConversation={deleteConversation}
        onDeleteAll={deleteAllConversations}
      />

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        activeTone={tone}
        onSelectTone={setTone}
        activeTheme={theme}
        onSelectTheme={setTheme}
        gradientStyle={gradientStyle}
        onSelectGradientStyle={setGradientStyle}
      />

      <ShortcutsDialog isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
```

---

## 7. Comprehensive Unit & Integration Test Specifications

To verify the integration in Milestone 3, a dedicated test suite `tests/unit/page-callback-wiring.test.tsx` should cover the following 16 scenarios:

### Test Suite Structure: `tests/unit/page-callback-wiring.test.tsx`

```typescript
describe("Page Callback Wiring & State Coordination", () => {
  // Group 1: Regeneration Callback Mechanics
  it("stops ongoing stream before executing regeneration");
  it("prunes conversation history to the preceding user message on regenerate");
  it("persists pruned messages to conversationService when active conversation exists");
  it("resubmits pruned message slice to stream.send()");
  it("safely ignores regenerate when message ID does not exist");
  it("safely ignores regenerate when no preceding user prompt exists");

  // Group 2: Edit User Message Callback Mechanics
  it("aborts active stream if editing occurs during inference");
  it("delegates prompt edit to session.editUserMessage");
  it("invokes stream.send with truncated messages returned by editUserMessage");
  it("ignores whitespace-only edit submissions");

  // Group 3: Message Deletion Callback Mechanics
  it("halts active stream when deleting a message mid-inference");
  it("delegates deletion to session.deleteMessage");
  it("reverts workspace view to welcome card when final message is deleted");

  // Group 4: Feedback Sentiment Mechanics
  it("delegates sentiment rating toggle to session.setMessageFeedback");

  // Group 5: Retry Flow & In-Chat Error Recovery
  it("invokes stream.retryLast when onRetry is triggered");
  it("ensures window.alert is NEVER called on stream error");
  it("routes streamError into ChatWorkspace without disruptive modals");
});
```

---

## 8. Summary Table of Proposed Changes

| Target | Proposed Change | Rationale |
|---|---|---|
| `src/app/page.tsx:40-52` | Destructure `deleteMessage`, `editUserMessage`, `setMessageFeedback`, `setMessages`, `setConversations` | Required for callback handlers |
| `src/app/page.tsx:61-63` | Replace `alert()` with `console.error()` | Eliminates disruptive dialog, allows headless test execution |
| `src/app/page.tsx:65` | Destructure `streamError`, `retryLast` from `useChatStream` | Provides error card and retry capability |
| `src/app/page.tsx:new` | Add `messagesRef` synchronization `useEffect` | Prevents stale closures in async callbacks |
| `src/app/page.tsx:new` | Add `handleRegenerate`, `handleEditUserMessage`, `handleDeleteMessage`, `handleFeedback`, `handleRetry` | Fulfills Milestone 3 interactive action requirements |
| `src/app/page.tsx:new` | Wrap `newChat` & `selectConversation` with `isGenerating && stop()` guard | Eliminates cross-session stream contamination |
| `src/app/page.tsx:156-165` | Pass action callbacks + `streamError` + `onRetry` to `<ChatWorkspace />` | Completes end-to-end integration |
| `src/features/chat/components/chat-workspace.tsx` | Extend `ChatWorkspaceProps` with callbacks & `streamError` | Type safety and component hierarchy interface |
