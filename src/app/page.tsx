"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ToneKey, Attachment, ModelOption, ChatMessage, FeedbackRating } from "@/lib/types/chat";
import { ThemeId, THEMES, GradientStyle } from "@/lib/types/theme";
import {
  initializeDynamicTheme,
  applyThemeToDom,
  persistManualTheme,
} from "@/lib/theme/dynamic-theme";
import { DEFAULT_MODEL_ID, getModelById } from "@/lib/ai/models";
import { conversationService } from "@/lib/db/conversations";

import dynamic from "next/dynamic";

// Background & Branding (AmbientCanvas code-split to defer Three.js from initial JS payload)
const AmbientCanvas = dynamic(
  () => import("@/components/background/ambient-canvas").then((m) => m.AmbientCanvas),
  { ssr: false }
);
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
  const [gradientStyle, setGradientStyle] = useState<GradientStyle>("cinematic-studio");
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
      if (messagesRef.current.length === 0) {
        return;
      }
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

  // Dynamic Color Theme System: automatically assign a fresh theme on site visit
  useEffect(() => {
    const assignedTheme = initializeDynamicTheme();
    setTheme(assignedTheme);
  }, []);

  // Apply Theme CSS Tokens to document root with complete variable coverage
  useEffect(() => {
    applyThemeToDom(selectedTheme);
  }, [selectedTheme]);

  const handleSelectTheme = useCallback((themeId: string) => {
    if (THEMES[themeId]) {
      setTheme(themeId);
      persistManualTheme(themeId);
    }
  }, []);

  // Safe Conversation Navigation (prevents cross-session stream contamination)
  const handleNewChat = useCallback(() => {
    if (isGenerating) stop(true);
    newChat();
  }, [isGenerating, stop, newChat]);

  const handleSelectConversation = useCallback(
    (id: string) => {
      if (isGenerating) stop(true);
      selectConversation(id);
      setHistoryOpen(false);
    },
    [isGenerating, stop, selectConversation]
  );

  // Safe Stop Handler for Composer (explicit partial token retention, Feature 18)
  const handleStop = useCallback(() => {
    stop(false);
  }, [stop]);

  // Safe History Drawer Conversation Deletion (halts active inference on deletion)
  const handleDeleteConversation = useCallback(
    async (id: string) => {
      if (isGenerating && activeConvId === id) {
        stop(true);
      }
      await deleteConversation(id);
    },
    [isGenerating, activeConvId, stop, deleteConversation]
  );

  const handleDeleteAllConversations = useCallback(
    async () => {
      if (isGenerating) {
        stop(true);
      }
      await deleteAllConversations();
    },
    [isGenerating, stop, deleteAllConversations]
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
    (text: string, attachments: Attachment[] = [], mode?: string) => {
      const nextMessages = appendUserMessage(text, attachments);
      send(nextMessages, undefined, mode);
    },
    [appendUserMessage, send]
  );

  const handleRegenerate = useCallback(
    async (messageId: string) => {
      if (isGenerating) {
        stop(true);
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
        stop(true);
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
        stop(true);
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
    <div className="relative flex flex-row h-[100dvh] w-full max-w-full overflow-hidden bg-[var(--void)] text-[var(--txt)] font-sans select-none">
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
            onStop={handleStop}
            onSelectSuggestion={handleSend}
            onOpenSettings={() => setSettingsOpen(true)}
            selectedModel={selectedModel}
            onSelectModel={(m: ModelOption) => setModelId(m.id)}
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
        onDeleteConversation={handleDeleteConversation}
        onDeleteAll={handleDeleteAllConversations}
      />

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        activeTone={tone}
        onSelectTone={setTone}
        activeTheme={theme}
        onSelectTheme={handleSelectTheme}
        gradientStyle={gradientStyle}
        onSelectGradientStyle={setGradientStyle}
      />

      <ShortcutsDialog isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
    </div>
  );
}
