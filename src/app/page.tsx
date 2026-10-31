"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import dynamic from "next/dynamic";
import { BackgroundLayers } from "@/components/background/background-layers";
import { IntroSplash } from "@/components/branding/intro-splash";
import { Topbar } from "@/components/navigation/topbar";
import { SidebarDock } from "@/components/navigation/sidebar-dock";
import { HistoryDrawer } from "@/components/navigation/history-drawer";
import { SettingsDrawer } from "@/components/navigation/settings-drawer";
import { ShortcutsDialog } from "@/components/modals/shortcuts-dialog";
import { LegacyImportDialog } from "@/components/modals/legacy-import-dialog";
import { WelcomeCard } from "@/components/chat/welcome-card";
import { MessageItem } from "@/components/chat/message-item";
import { ChatComposer } from "@/components/chat/chat-composer";

import { AVAILABLE_MODELS, getModelById, DEFAULT_MODEL_ID } from "@/lib/ai/models";
import { COLOR_THEMES } from "@/lib/types/theme";
import { Attachment, ChatMessage, Conversation, ModelOption, PersonaMode, ToneKey } from "@/lib/types/chat";
import { safeLocalStorage } from "@/lib/utils/storage";

// Dynamically import Three.js AmbientCanvas with SSR disabled to prevent hydration mismatch
const AmbientCanvas = dynamic(
  () => import("@/components/background/ambient-canvas").then((m) => m.AmbientCanvas),
  { ssr: false }
);

const GEN_TRIGGERS = [
  "generate",
  "create an image",
  "draw",
  "make an image",
  "imagine",
  "show me an image",
  "picture of",
  "image of",
  "sketch",
  "illustration of",
  "paint me",
];

function shouldGenerateImage(text: string): boolean {
  const low = text.toLowerCase();
  return GEN_TRIGGERS.some((kw) => low.includes(kw));
}

export default function RadianceWorkspace() {
  // ── State ──
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedModel, setSelectedModel] = useState<ModelOption>(getModelById(DEFAULT_MODEL_ID));
  const [mode, setMode] = useState<PersonaMode>("default");
  const [tone, setTone] = useState<ToneKey>("default");
  const [themeId, setThemeId] = useState<string>("default");
  const [language, setLanguage] = useState<"en" | "hi">("en");

  // Streaming & Loading state
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState<string>("");
  const [activeFollowUps, setActiveFollowUps] = useState<string[]>([]);

  // Dialogs & Drawers
  const [historyOpen, setHistoryOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [legacyImportOpen, setLegacyImportOpen] = useState(false);

  const abortControllerRef = useRef<AbortController | null>(null);
  const chatScrollRef = useRef<HTMLDivElement | null>(null);

  // ── Sync Active Theme with CSS Root Variables ──
  const activeTheme = COLOR_THEMES[themeId] || COLOR_THEMES.default;
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--accent", activeTheme.accent);
    root.style.setProperty("--accent-d", activeTheme.accentD);
    root.style.setProperty("--accent-g", activeTheme.accentG);
    root.style.setProperty("--accent-b", activeTheme.accentB);
    root.style.setProperty("--user-bg", activeTheme.userBg);
    root.style.setProperty("--user-border", activeTheme.userBorder);
  }, [activeTheme]);

  // ── Initial Boot & Hydration ──
  useEffect(() => {
    const savedTone = safeLocalStorage.get<ToneKey>("radiance_tone", "default");
    const savedTheme = safeLocalStorage.get<string>("radiance_theme", "default");
    setTone(savedTone);
    setThemeId(savedTheme);

    const savedConvs = safeLocalStorage.listConversations();
    setConversations(savedConvs);

    if (savedConvs.length > 0) {
      const latest = savedConvs[0];
      setActiveConvId(latest.id);
      setMessages(latest.messages);
    }
  }, []);

  // ── Auto-scroll to bottom of chat ──
  useEffect(() => {
    if (chatScrollRef.current) {
      chatScrollRef.current.scrollTop = chatScrollRef.current.scrollHeight;
    }
  }, [messages, streamingContent]);

  const handleStop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  // ── Chat Actions ──
  const handleNewChat = useCallback(() => {
    if (isGenerating) handleStop();
    setActiveConvId(null);
    setMessages([]);
    setStreamingContent("");
    setActiveFollowUps([]);
    setHistoryOpen(false);
  }, [isGenerating, handleStop]);

  // ── Global Keyboard Hotkeys ──
  useEffect(() => {
    const handleGlobalKey = (e: KeyboardEvent) => {
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
        setHistoryOpen(false);
        setSettingsOpen(false);
        setShortcutsOpen(false);
        setLegacyImportOpen(false);
      }
    };
    window.addEventListener("keydown", handleGlobalKey);
    return () => window.removeEventListener("keydown", handleGlobalKey);
  }, [handleNewChat]);

  const handleSelectConversation = (id: string) => {
    if (isGenerating) handleStop();
    const conv = safeLocalStorage.getConversation(id);
    if (conv) {
      setActiveConvId(conv.id);
      setMessages(conv.messages);
      setStreamingContent("");
      setActiveFollowUps([]);
      setHistoryOpen(false);
    }
  };

  const handleTogglePin = (id: string) => {
    const conv = safeLocalStorage.getConversation(id);
    if (!conv) return;
    const updated = { ...conv, pinned: !conv.pinned };
    safeLocalStorage.saveConversation(updated);
    setConversations(safeLocalStorage.listConversations());
  };

  const handleDeleteConversation = (id: string) => {
    safeLocalStorage.deleteConversation(id);
    const updated = safeLocalStorage.listConversations();
    setConversations(updated);
    if (activeConvId === id) {
      handleNewChat();
    }
  };

  const handleDeleteAllConversations = () => {
    if (window.confirm("Are you sure you want to delete all saved conversations? This cannot be undone.")) {
      safeLocalStorage.deleteAllConversations();
      setConversations([]);
      handleNewChat();
    }
  };

  const handleClearCurrentChat = () => {
    setMessages([]);
    setStreamingContent("");
    setActiveFollowUps([]);
  };

  // ── Send Message & SSE Streaming Loop ──
  const handleSend = async (text: string, attachments: Attachment[] = []) => {
    if (isGenerating) return;

    const userMessage: ChatMessage = {
      id: `msg_${Date.now()}`,
      role: "user",
      content: text,
      createdAt: Date.now(),
      attachments: attachments.length > 0 ? attachments : undefined,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setActiveFollowUps([]);

    // Check for Flux image generation keyword trigger
    const willGenerateImage = shouldGenerateImage(text) && attachments.length === 0;

    setIsGenerating(true);
    setStreamingContent("");
    abortControllerRef.current = new AbortController();

    try {
      // 1. Dispatch SSE stream to /api/chat
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.content,
            attachments: m.attachments,
          })),
          modelId: selectedModel.id,
          mode,
          tone,
          language,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `HTTP ${response.status}`);
      }

      // Read SSE stream
      let fullAssistantText = "";
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            // Vercel AI SDK Data Stream protocol: lines starting with '0:' contain text delta chunks
            if (line.startsWith("0:")) {
              try {
                const textChunk = JSON.parse(line.slice(2));
                fullAssistantText += textChunk;
                setStreamingContent(fullAssistantText);
              } catch {
                // Ignore chunk parse anomalies
              }
            }
          }
        }
      }

      // 2. If Flux visual was triggered, generate image in parallel
      let generatedImgUrl: string | undefined;
      if (willGenerateImage) {
        try {
          const imgPrompt = text
            .replace(/generate|create an image|draw|make an image|imagine|show me an image|paint me/gi, "")
            .trim() || text;

          const imgRes = await fetch("/api/image", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ prompt: imgPrompt }),
          });
          if (imgRes.ok) {
            const imgData = await imgRes.json();
            generatedImgUrl = imgData.imageUrl;
          }
        } catch {
          // Visual generation failure is non-blocking
        }
      }

      // 3. Commit assistant message to conversation
      const assistantMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: "assistant",
        content: fullAssistantText || "(Response complete)",
        createdAt: Date.now(),
        generatedImageUrl: generatedImgUrl,
      };

      const finalMessages = [...nextMessages, assistantMessage];
      setMessages(finalMessages);
      setStreamingContent("");

      // 4. Persist to storage
      const convId = activeConvId || `conv_${Date.now()}`;
      const firstUserMsg = finalMessages.find((m) => m.role === "user");
      const title = firstUserMsg ? firstUserMsg.content.slice(0, 48) + (firstUserMsg.content.length > 48 ? "…" : "") : "New Conversation";

      const conv: Conversation = {
        id: convId,
        title,
        createdAt: activeConvId ? (conversations.find((c) => c.id === activeConvId)?.createdAt || Date.now()) : Date.now(),
        updatedAt: Date.now(),
        pinned: activeConvId ? (conversations.find((c) => c.id === activeConvId)?.pinned || false) : false,
        messages: finalMessages,
      };

      safeLocalStorage.saveConversation(conv);
      setActiveConvId(convId);
      setConversations(safeLocalStorage.listConversations());

      // 5. Contextual follow-up suggestions in background
      if (!willGenerateImage && text.length > 5) {
        fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...finalMessages.slice(-2).map((m) => ({ role: m.role, content: m.content })),
              {
                role: "user",
                content:
                  "Generate exactly 3 follow-up questions the user might ask next. " +
                  "Return ONLY a JSON array of 3 strings: [\"Q1?\", \"Q2?\", \"Q3?\"] with no markdown.",
              },
            ],
            modelId: "groq-fast",
          }),
        })
          .then((res) => res.text())
          .then((raw) => {
            const match = raw.match(/\[[\s\S]*?\]/);
            if (match) {
              const arr = JSON.parse(match[0]);
              if (Array.isArray(arr)) {
                setActiveFollowUps(arr.slice(0, 3));
              }
            }
          })
          .catch(() => {});
      }
    } catch (err: unknown) {
      if ((err as Error)?.name === "AbortError") {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: "assistant",
            content: "⏹ Generation cancelled by user.",
            createdAt: Date.now(),
          },
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: `msg_${Date.now()}`,
            role: "assistant",
            content: `Error: ${(err as Error)?.message || "Failed to reach AI service"}`,
            createdAt: Date.now(),
            isError: true,
          },
        ]);
      }
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  };

  return (
    <div className="relative w-screen h-screen flex flex-col bg-[var(--void)] text-[var(--txt)] pl-14 md:pl-16 overflow-hidden">
      {/* Cinematic Splash Intro */}
      <IntroSplash />

      {/* 3D WebGL Background Canvas with Theme Accent Synchronization */}
      <AmbientCanvas accentColor={activeTheme.accent} />

      {/* Atmospheric Background Layers (Grain, Vignette, Mesh) */}
      <BackgroundLayers bgGradient={activeTheme.bgGradient} />

      {/* Left Docked Navigation Rail */}
      <SidebarDock
        onNewChat={handleNewChat}
        onToggleHistory={() => setHistoryOpen(true)}
        onToggleSettings={() => setSettingsOpen(true)}
        onOpenShortcuts={() => setShortcutsOpen(true)}
        currentMode={mode}
        onSelectMode={(m) => setMode(m)}
      />

      {/* Top Application Bar */}
      <Topbar
        selectedModel={selectedModel}
        onSelectModel={setSelectedModel}
        mode={mode}
        onClearMode={() => setMode("default")}
        language={language}
        onToggleLanguage={setLanguage}
        onClearChat={handleClearCurrentChat}
        onNewChat={handleNewChat}
      />

      {/* Main Conversation Scroll Viewport */}
      <main
        ref={chatScrollRef}
        className="flex-1 overflow-y-auto px-4 py-6 z-10 scroll-smooth flex flex-col"
      >
        {messages.length === 0 ? (
          <WelcomeCard onSelectPrompt={(p) => handleSend(p)} />
        ) : (
          <div className="flex-1 flex flex-col justify-start">
            {messages.map((m, idx) => {
              const isLastAssistant = !isGenerating && idx === messages.length - 1 && m.role === "assistant";
              return (
                <MessageItem
                  key={m.id}
                  message={m}
                  followUps={isLastAssistant ? activeFollowUps : undefined}
                  onSelectFollowUp={(q) => handleSend(q)}
                  onRegenerate={() => {
                    const lastUser = [...messages].reverse().find((item) => item.role === "user");
                    if (lastUser) {
                      setMessages((prev) => prev.slice(0, -1));
                      handleSend(lastUser.content, lastUser.attachments);
                    }
                  }}
                  onEdit={(content) => {
                    handleClearCurrentChat();
                    handleSend(content);
                  }}
                />
              );
            })}

            {/* In-Flight Streaming Message */}
            {isGenerating && streamingContent && (
              <MessageItem
                message={{
                  id: "streaming_temp",
                  role: "assistant",
                  content: streamingContent,
                  createdAt: Date.now(),
                }}
                isStreaming={true}
              />
            )}
          </div>
        )}
      </main>

      {/* Input Docking Footer */}
      <ChatComposer
        onSend={handleSend}
        onStop={handleStop}
        isGenerating={isGenerating}
      />

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        conversations={conversations}
        activeConversationId={activeConvId || undefined}
        onSelectConversation={handleSelectConversation}
        onTogglePin={handleTogglePin}
        onDeleteConversation={handleDeleteConversation}
        onDeleteAll={handleDeleteAllConversations}
        onOpenLegacyImport={() => {
          setHistoryOpen(false);
          setLegacyImportOpen(true);
        }}
      />

      {/* Settings & Themes Drawer */}
      <SettingsDrawer
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        activeTone={tone}
        onSelectTone={(t) => {
          setTone(t);
          safeLocalStorage.set("radiance_tone", t);
        }}
        activeTheme={themeId}
        onSelectTheme={(th) => {
          setThemeId(th);
          safeLocalStorage.set("radiance_theme", th);
        }}
      />

      {/* Keyboard Shortcuts Dialog */}
      <ShortcutsDialog isOpen={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Legacy Tanix AI Chat Migration Dialog */}
      <LegacyImportDialog
        isOpen={legacyImportOpen}
        onClose={() => setLegacyImportOpen(false)}
        onImportSuccess={(count) => {
          setConversations(safeLocalStorage.listConversations());
          alert(`Successfully imported ${count} legacy conversation(s) into RADIANCE!`);
        }}
      />
    </div>
  );
}
