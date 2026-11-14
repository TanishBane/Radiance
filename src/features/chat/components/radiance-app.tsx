"use client";

import React, { useState, useEffect, useCallback, useRef } from "react";
import { ToneKey, Attachment, ModelOption, ChatMessage, FeedbackRating } from "@/lib/types/chat";
import { ThemeId, THEMES, GradientStyle, ATMOSPHERE_ENGINES } from "@/lib/types/theme";
import { uiText } from "@/lib/i18n/ui";
import { applyThemeToDom } from "@/lib/theme/dynamic-theme";
import { DEFAULT_MODEL_ID, getModelById } from "@/lib/ai/models";
import { conversationService } from "@/lib/db/conversations";
import { safeLocalStorage } from "@/lib/utils/storage";
import {
  DEFAULT_SETTINGS,
  loadSettings,
  resetSettings,
  saveSettings,
  SETTINGS_STORAGE_KEY,
} from "@/features/settings/settings-service";
import type { RadianceSettings } from "@/features/settings/settings-schema";
import { matchesShortcut } from "@/features/settings/keyboard-shortcuts";
import { addMemory, createDefaultIntelligenceProfile, INTELLIGENCE_STORAGE_KEY, loadIntelligenceProfile, saveIntelligenceProfile } from "@/features/intelligence/profile-store";
import { buildPersonalizationContext, toProviderPersonalization } from "@/features/intelligence/retrieval";
import type { PersonalIntelligenceProfile, PersonalizationScope } from "@/features/intelligence/profile-schema";

// Background & Branding
import { AmbientCanvas } from "@/components/background/ambient-canvas";
import { BackgroundLayers } from "@/components/background/background-layers";
import { IntroSplash } from "@/components/branding/intro-splash";

// Navigation & Drawers
import { Topbar } from "@/components/navigation/topbar";
import { SidebarDock } from "@/components/navigation/sidebar-dock";
import { HistoryDrawer } from "@/components/navigation/history-drawer";
import { MobileBottomNav } from "@/components/navigation/mobile-bottom-nav";
import { SettingsCenter } from "@/features/settings/settings-center";

// Feature Modules
import { useChatSession } from "@/features/chat/hooks/use-chat-session";
import { useChatStream } from "@/features/chat/hooks/use-chat-stream";
import { ChatWorkspace } from "@/features/chat/components/chat-workspace";

export default function RadianceApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [settings, setSettings] = useState<RadianceSettings>(DEFAULT_SETTINGS);
  const [intelligenceProfile, setIntelligenceProfile] = useState<PersonalIntelligenceProfile>(() => createDefaultIntelligenceProfile());
  const theme = (settings.theme || "violet") as ThemeId;
  const gradientStyle = (settings.gradientStyle || "waves") as GradientStyle;
  const modelId = settings.modelId || DEFAULT_MODEL_ID;
  const tone = settings.tone as ToneKey;
  const language = settings.language;

  // Drawers & Modals State
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [previewGradientStyle, setPreviewGradientStyle] = useState<GradientStyle | null>(null);
  const [previewSaveFailed, setPreviewSaveFailed] = useState(false);
  const [settingsSection, setSettingsSection] = useState("general");
  const [isComposerFocused, setIsComposerFocused] = useState(false);
  const visibleGradientStyle = previewGradientStyle ?? gradientStyle;
  const previewedAtmosphereEngine = ATMOSPHERE_ENGINES.find((engine) => engine.id === previewGradientStyle);

  const handleAtmospherePreview = useCallback((engine: GradientStyle | null) => {
    setPreviewSaveFailed(false);
    setPreviewGradientStyle(engine);
  }, []);

  const handleSettingsChange = useCallback((nextSettings: RadianceSettings) => {
    const withThemeHistory = nextSettings.theme !== settings.theme
      ? {
          ...nextSettings,
          themeHistory: [nextSettings.theme, ...settings.themeHistory.filter((id) => id !== nextSettings.theme)].slice(0, 5),
        }
      : nextSettings;
    if (!saveSettings(withThemeHistory)) return false;
    setSettings(withThemeHistory);
    return true;
  }, [settings]);

  const handleIntelligenceProfileChange = useCallback((nextProfile: PersonalIntelligenceProfile) => {
    if (!saveIntelligenceProfile(nextProfile)) return false;
    setIntelligenceProfile(nextProfile);
    return true;
  }, []);

  const makePersonalizationRequest = useCallback((query: string, mode?: string) => {
    const scope: PersonalizationScope = mode === "plan" || mode === "ask" ? mode : "build";
    const context = buildPersonalizationContext(intelligenceProfile, query, scope);
    return {
      provider: toProviderPersonalization(context),
      memoryIds: context.memories.map((memory) => memory.id),
      preferenceIds: context.preferences.map((preference) => preference.id),
    };
  }, [intelligenceProfile]);

  const openSettings = useCallback((section = "general") => {
    setSettingsSection(section);
    setSettingsOpen(true);
    setHistoryOpen(false);
    setMobileSidebarOpen(false);
  }, []);

  // Feature Hooks
  const {
    conversations,
    activeConvId,
    isConversationHistoryLoaded,
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
    customInstructions: settings.customInstructions,
    onStreamComplete: handleStreamComplete,
    onError: handleStreamError,
  });

  const selectedTheme = THEMES[theme] || THEMES.violet;
  const selectedModel = getModelById(modelId);

  // Restore and validate local preferences; rotate palettes through the registered theme set.
  useEffect(() => {
    setSettings(loadSettings(undefined, true));
    setIntelligenceProfile(loadIntelligenceProfile());
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  useEffect(() => {
    const handleStorage = (event: StorageEvent) => {
      if (event.key === SETTINGS_STORAGE_KEY) setSettings(loadSettings());
      if (event.key === INTELLIGENCE_STORAGE_KEY) setIntelligenceProfile(loadIntelligenceProfile());
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  // Apply Theme CSS Tokens to document root with complete variable coverage
  useEffect(() => {
    applyThemeToDom(selectedTheme);
  }, [selectedTheme]);

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
      if (e.defaultPrevented) return;
      if (matchesShortcut(e, "new-chat")) {
        e.preventDefault();
        setSettingsOpen(false);
        handleNewChat();
      } else if (matchesShortcut(e, "settings-shortcuts")) {
        e.preventDefault();
        openSettings("general");
      } else if (matchesShortcut(e, "history")) {
        e.preventDefault();
        setSettingsOpen(false);
        setHistoryOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setMobileSidebarOpen(false);
        setHistoryOpen(false);
        setSettingsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [handleNewChat, openSettings]);

  const handleExportConversations = useCallback(() => {
    const localConversations = safeLocalStorage.listConversations();
    if (localConversations.length === 0) return false;
    try {
      const file = new Blob([JSON.stringify(localConversations, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = `radiance-conversations-${new Date().toISOString().slice(0, 10)}.json`;
      link.click();
      URL.revokeObjectURL(url);
      return true;
    } catch {
      return false;
    }
  }, []);

  const handleClearConversations = useCallback(async () => {
    try {
      await handleDeleteAllConversations();
      return true;
    } catch {
      return false;
    }
  }, [handleDeleteAllConversations]);

  // ── Action Handlers ──

  const handleSend = useCallback(
    (text: string, attachments: Attachment[] = [], mode?: string) => {
      const nextMessages = appendUserMessage(text, attachments);
      send(nextMessages, undefined, mode, makePersonalizationRequest(text, mode));
    },
    [appendUserMessage, send, makePersonalizationRequest]
  );

  const handleRememberMessage = useCallback((messageId: string, text: string) => {
    const result = addMemory(intelligenceProfile, {
      content: text,
      category: "context",
      importance: 3,
      source: activeConvId ? { type: "conversation", conversationId: activeConvId, messageId } : { type: "manual" },
    });
    if (result.ok) handleIntelligenceProfileChange(result.profile);
    openSettings("personal-intelligence");
  }, [intelligenceProfile, activeConvId, handleIntelligenceProfileChange, openSettings]);

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

      const latestUserText = prunedMessages.filter((message) => message.role === "user").at(-1)?.content ?? "";
      await send(prunedMessages, undefined, "build", makePersonalizationRequest(latestUserText, "build"));
    },
    [isGenerating, stop, activeConvId, setMessages, setConversations, send, makePersonalizationRequest]
  );

  const handleEditUserMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!newContent.trim()) return;
      if (isGenerating) {
        stop(true);
      }

      const truncatedMessages = await editUserMessage(messageId, newContent);
      if (truncatedMessages && truncatedMessages.length > 0) {
        const latestUserText = truncatedMessages.filter((message) => message.role === "user").at(-1)?.content ?? "";
        await send(truncatedMessages, undefined, "build", makePersonalizationRequest(latestUserText, "build"));
      }
    },
    [isGenerating, stop, editUserMessage, send, makePersonalizationRequest]
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
    <div className="relative flex flex-row h-screen h-[100dvh] w-full max-w-full overflow-hidden bg-[var(--void)] text-[var(--txt)] font-sans select-none">
      {/* Background Engines */}
      {visibleGradientStyle === "cosmic" && (
        <AmbientCanvas accentColor={selectedTheme.accent} />
      )}
      <BackgroundLayers
        theme={selectedTheme}
        gradientStyle={visibleGradientStyle}
        bgGradient={selectedTheme.bgGradient}
      />

      {/* Intro Splash Animation */}
      {showSplash && <IntroSplash onComplete={() => setShowSplash(false)} />}

      {/* Left: Full-Height Sidebar Dock */}
      <SidebarDock
        language={language}
        open={mobileSidebarOpen}
        setOpen={setMobileSidebarOpen}
        settingsActive={settingsOpen}
        historyActive={historyOpen}
        conversations={conversations}
        activeConversationId={activeConvId || undefined}
        onSelectConversation={handleSelectConversation}
        isConversationHistoryLoaded={isConversationHistoryLoaded}
        onNewChat={handleNewChat}
        onToggleHistory={() => {
          setSettingsOpen(false);
          setHistoryOpen((h) => !h);
        }}
        onToggleSettings={openSettings}
      />

      {/* Right: Main Application Pane */}
      <main className="flex-1 flex flex-col min-w-0 h-full overflow-hidden relative z-10">
        <Topbar
          language={language}
          onToggleLanguage={(l) => handleSettingsChange({ ...settings, language: l })}
          onClearChat={handleNewChat}
          onNewChat={handleNewChat}
          onToggleMobileMenu={() => setMobileSidebarOpen((prev) => !prev)}
        />

        {previewGradientStyle && !settingsOpen && (
          <div
            className="shrink-0 border-b border-[var(--border)] bg-[var(--surface-overlay)]/90 px-4 py-3 backdrop-blur-md sm:px-6"
          >
            <div className="mx-auto flex max-w-6xl flex-col gap-2.5 sm:flex-row sm:items-center sm:justify-between">
              <div role="status" aria-live="polite" className="min-w-0">
                <p className="truncate text-sm font-semibold text-[var(--txt)]">
                  {uiText(language, "Previewing")} {previewedAtmosphereEngine?.label ?? previewGradientStyle}
                </p>
                <p className="text-xs text-[var(--txt-muted)]">{uiText(language, "Temporary preview — not saved")}</p>
                {previewSaveFailed && (
                  <p className="mt-1 text-xs text-[var(--danger)]">{uiText(language, "Could not save. Check browser storage and try again.")}</p>
                )}
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const saved = handleSettingsChange({ ...settings, gradientStyle: previewGradientStyle });
                    setPreviewSaveFailed(!saved);
                    if (saved) {
                      setPreviewGradientStyle(null);
                    }
                  }}
                  className="min-h-11 rounded-xl bg-[var(--accent)] px-4 text-sm font-semibold text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-b)]"
                >{uiText(language, "Apply background")}</button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewSaveFailed(false);
                    openSettings("appearance");
                  }}
                  className="min-h-11 rounded-xl border border-[var(--border-hover)] px-4 text-sm font-medium text-[var(--txt)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >{uiText(language, "Back to appearance settings")}</button>
                <button
                  type="button"
                  onClick={() => {
                    setPreviewSaveFailed(false);
                    setPreviewGradientStyle(null);
                  }}
                  className="min-h-11 rounded-xl px-3 text-sm text-[var(--txt-dim)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                >{uiText(language, "Cancel preview")}</button>
              </div>
            </div>
          </div>
        )}

        <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          <ChatWorkspace
            messages={messages}
            conversations={conversations}
            isConversationHistoryLoaded={isConversationHistoryLoaded}
            language={language}
            streamingContent={streamingContent}
            isGenerating={isGenerating}
            streamError={streamError}
            activeFollowUps={activeFollowUps}
            onSend={handleSend}
            onStop={handleStop}
            onSelectSuggestion={handleSend}
            onOpenSettings={() => setSettingsOpen(true)}
            selectedModel={selectedModel}
            onSelectModel={(m: ModelOption) => handleSettingsChange({ ...settings, modelId: m.id })}
            enterToSend={settings.enterToSend}
            onRegenerate={handleRegenerate}
            onEditUserMessage={handleEditUserMessage}
            onDeleteMessage={handleDeleteMessage}
            onFeedback={handleFeedback}
            onRememberMessage={handleRememberMessage}
            onOpenPersonalIntelligence={() => openSettings("personal-intelligence")}
            onRetry={handleRetry}
            onFocusChange={setIsComposerFocused}
          />
        </div>
        {/* Mobile Thumb-Zone Bottom Navigation */}
        <MobileBottomNav
          language={language}
          isComposerFocused={isComposerFocused}
          activeTab={
            historyOpen
              ? "history"
              : settingsOpen
              ? "settings"
              : "chat"
          }
          onNewChat={handleNewChat}
          onToggleHistory={() => {
            setSettingsOpen(false);
            setHistoryOpen((prev) => !prev);
          }}
          onToggleSettings={() => {
            setHistoryOpen(false);
            openSettings("general");
          }}
          onFocusChat={() => {
            setHistoryOpen(false);
            setSettingsOpen(false);
          }}
        />
      </main>

      {/* Slide-out Navigation Drawers & Dialogs */}
      <HistoryDrawer
        language={language}
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        conversations={conversations}
        activeConversationId={activeConvId || undefined}
        onSelectConversation={handleSelectConversation}
        onTogglePin={togglePin}
        onDeleteConversation={handleDeleteConversation}
        onDeleteAll={handleDeleteAllConversations}
      />

      <SettingsCenter
        language={language}
        open={settingsOpen}
        onOpenChange={setSettingsOpen}
        section={settingsSection}
        settings={settings}
        onChange={handleSettingsChange}
        onReset={() => {
          if (!resetSettings()) return false;
          setSettings(DEFAULT_SETTINGS);
          return true;
        }}
        onExportConversations={handleExportConversations}
        onClearConversations={handleClearConversations}
        conversationCount={conversations.length}
        intelligenceProfile={intelligenceProfile}
        onIntelligenceProfileChange={handleIntelligenceProfileChange}
        onPreviewAtmosphere={handleAtmospherePreview}
        previewingAtmosphere={previewGradientStyle}
      />
    </div>
  );
}
