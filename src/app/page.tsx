"use client";

import React, { useState, useEffect, useCallback } from "react";
import { PersonaMode, ToneKey, Attachment, ModelOption } from "@/lib/types/chat";
import { ThemeId, THEMES } from "@/lib/types/theme";
import { DEFAULT_MODEL_ID, getModelById } from "@/lib/ai/models";

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
import { LegacyImportDialog } from "@/components/modals/legacy-import-dialog";

// Feature Modules
import { useChatSession } from "@/features/chat/hooks/use-chat-session";
import { useChatStream } from "@/features/chat/hooks/use-chat-stream";
import { ChatWorkspace } from "@/features/chat/components/chat-workspace";

export default function RadianceApp() {
  const [showSplash, setShowSplash] = useState(true);
  const [theme, setTheme] = useState<ThemeId>("default");
  const [modelId, setModelId] = useState(DEFAULT_MODEL_ID);
  const [mode, setMode] = useState<PersonaMode>("default");
  const [tone, setTone] = useState<ToneKey>("default");
  const [language, setLanguage] = useState<"en" | "hi">("en");

  // Drawers & Modals State
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [legacyImportOpen, setLegacyImportOpen] = useState(false);

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
    setConversations,
  } = useChatSession();

  const handleStreamComplete = useCallback(
    (assistantMsg: any) => {
      appendAssistantMessage(assistantMsg, messages, tone, language);
    },
    [appendAssistantMessage, messages, tone, language]
  );

  const handleStreamError = useCallback((error: Error) => {
    alert(`Inference error: ${error.message}`);
  }, []);

  const { isGenerating, streamingContent, send, stop } = useChatStream({
    modelId,
    mode,
    tone,
    language,
    onStreamComplete: handleStreamComplete,
    onError: handleStreamError,
  });

  const selectedTheme = THEMES[theme] || THEMES.default;
  const selectedModel = getModelById(modelId);

  // Apply Theme CSS Tokens
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", selectedTheme.accent);
    root.style.setProperty("--accent-b", selectedTheme.accentB);
    root.style.setProperty("--accent-d", selectedTheme.accentD);
    root.style.setProperty("--accent-g", selectedTheme.accentG);
    if (selectedTheme.bgGradient) {
      root.style.setProperty("--bg-gradient", selectedTheme.bgGradient);
    }
  }, [selectedTheme]);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "N") {
        e.preventDefault();
        newChat();
      } else if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setShortcutsOpen((prev) => !prev);
      } else if ((e.ctrlKey || e.metaKey) && e.key === "l") {
        e.preventDefault();
        setHistoryOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setHistoryOpen(false);
        setSettingsOpen(false);
        setShortcutsOpen(false);
        setLegacyImportOpen(false);
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [newChat]);

  const handleSend = (text: string, attachments: Attachment[] = []) => {
    const nextMessages = appendUserMessage(text, attachments);
    send(nextMessages);
  };

  return (
    <div className="relative flex flex-col h-screen w-screen overflow-hidden bg-[var(--void)] text-[var(--txt)] font-sans select-none">
      {/* Three.js Shader Nebula Background */}
      <AmbientCanvas accentColor={selectedTheme.accent} />
      <BackgroundLayers />

      {/* Intro Splash Animation */}
      {showSplash && <IntroSplash onComplete={() => setShowSplash(false)} />}

      {/* Top Application Bar */}
      <Topbar
        selectedModel={selectedModel}
        onSelectModel={(m: ModelOption) => setModelId(m.id)}
        mode={mode}
        onClearMode={() => setMode("default")}
        language={language}
        onToggleLanguage={(l) => setLanguage(l)}
        onClearChat={newChat}
        onNewChat={newChat}
      />

      {/* Main Workspace Frame */}
      <div className="flex-1 flex overflow-hidden relative">
        <SidebarDock
          onNewChat={newChat}
          onToggleHistory={() => setHistoryOpen((h) => !h)}
          onToggleSettings={() => setSettingsOpen((s) => !s)}
          onOpenShortcuts={() => setShortcutsOpen(true)}
          currentMode={mode}
          onSelectMode={setMode}
        />

        <div className="flex-1 flex flex-col pl-14 md:pl-16">
          <ChatWorkspace
            messages={messages}
            streamingContent={streamingContent}
            isGenerating={isGenerating}
            activeFollowUps={activeFollowUps}
            mode={mode}
            onSend={handleSend}
            onStop={stop}
            onSelectSuggestion={handleSend}
            onOpenSettings={() => setSettingsOpen(true)}
          />
        </div>
      </div>

      {/* Slide-out Navigation Drawers & Dialogs */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        conversations={conversations}
        activeConversationId={activeConvId || undefined}
        onSelectConversation={(id: string) => {
          selectConversation(id);
          setHistoryOpen(false);
        }}
        onTogglePin={togglePin}
        onDeleteConversation={deleteConversation}
        onDeleteAll={deleteAllConversations}
        onOpenLegacyImport={() => {
          setHistoryOpen(false);
          setLegacyImportOpen(true);
        }}
      />

      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        activeTone={tone}
        onSelectTone={setTone}
        activeTheme={theme}
        onSelectTheme={setTheme}
      />

      <ShortcutsDialog isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />
      <LegacyImportDialog
        isOpen={legacyImportOpen}
        onClose={() => setLegacyImportOpen(false)}
        onImportSuccess={async () => {
          setLegacyImportOpen(false);
          const list = await import("@/lib/db/conversations").then((m) => m.conversationService.list());
          setConversations(list);
        }}
      />
    </div>
  );
}
