"use client";

import React, { useState, useMemo, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Conversation } from "@/lib/types/chat";
import { formatRelativeTime } from "@/lib/utils/format";
import { X, Search, Pin, Trash2, MessageSquare, Plus, Settings2, Sparkles, HardDrive } from "lucide-react";
import { uiText, type UiLanguage } from "@/lib/i18n/ui";
import { safeVibrate } from "@/lib/mobile/haptics";

interface HistoryDrawerProps {
  language?: UiLanguage;
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onDeleteAll: () => void;
  onNewChat?: () => void;
  onOpenSettings?: (section?: string) => void;
}

export function HistoryDrawer({
  language = "en",
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onTogglePin,
  onDeleteConversation,
  onDeleteAll,
  onNewChat,
  onOpenSettings,
}: HistoryDrawerProps) {
  const t = (text: string) => uiText(language, text);
  const [search, setSearch] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.messages.some((m) => m.content.toLowerCase().includes(q))
    );
  }, [conversations, search]);

  const pinned = filtered.filter((c) => c.pinned);
  const unpinned = filtered.filter((c) => !c.pinned);

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
      <Dialog.Overlay className="radiance-dialog-overlay fixed inset-0 z-[50] bg-black/60 backdrop-blur-sm" />

      <Dialog.Content
        data-testid="history-drawer"
        aria-label="Conversations"
        onOpenAutoFocus={(event) => {
          event.preventDefault();
          searchInputRef.current?.focus();
        }}
        className="radiance-dialog-panel radiance-dialog-right fixed right-0 top-0 bottom-0 h-screen h-[100dvh] w-80 max-w-[88vw] z-[55] flex flex-col pt-[max(0.75rem,env(safe-area-inset-top,0px))] pb-[max(0.75rem,env(safe-area-inset-bottom,0px))] pl-[max(0.5rem,env(safe-area-inset-left,0px))] pr-[max(0.5rem,env(safe-area-inset-right,0px))] bg-[var(--deep)]/95 backdrop-blur-2xl border-l border-[var(--border)] shadow-[-20px_0_50px_rgba(0,0,0,0.6)] outline-none"
      >
        <Dialog.Description className="sr-only">{t("Search, select, and manage saved conversations.")}</Dialog.Description>
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
            <Dialog.Title className="font-serif font-bold text-base text-[var(--txt)]">{t("Conversations")}</Dialog.Title>
          </div>
          <div className="flex items-center gap-1">
            {conversations.length > 0 && (
              <button
                type="button"
                onClick={onDeleteAll}
                className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-[var(--txt-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors touch-target flex items-center justify-center cursor-pointer"
                title={t("Delete all conversations")}
                aria-label={t("Delete all conversations")}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <Dialog.Close asChild>
            <button
              type="button"
              className="min-w-[44px] min-h-[44px] p-2 rounded-xl text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-colors touch-target flex items-center justify-center cursor-pointer"
              aria-label={t("Close conversation history")}
            >
              <X className="w-4 h-4" />
            </button>
            </Dialog.Close>
          </div>
        </div>

        {/* Start New Chat Action Hero */}
        {onNewChat && (
          <div className="px-3 pt-3">
            <button
              type="button"
              onClick={() => {
                safeVibrate("tap");
                onNewChat();
                onClose();
              }}
              className="w-full flex items-center justify-center gap-2 min-h-[44px] px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-[var(--accent)] via-[var(--accent-b)] to-[var(--accent-c)] text-[var(--void)] font-bold text-xs shadow-[0_4px_16px_var(--accent-g)] active:scale-[0.98] transition-all cursor-pointer touch-target border border-white/20"
              aria-label={t("Start New Chat")}
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              <span>{t("Start New Chat")}</span>
            </button>
          </div>
        )}

        {/* Search */}
        <div className="p-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus-within:border-[var(--accent)]">
            <Search className="w-3.5 h-3.5 text-[var(--txt-muted)] shrink-0" />
            <input
              ref={searchInputRef}
              type="search"
              name="conversation-search"
              aria-label={t("Search chat history...")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("Search chat history...")}
              className="w-full bg-transparent border-0 outline-none text-base sm:text-xs text-[var(--txt)] placeholder:text-[var(--txt-muted)]"
            />
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--txt-muted)] font-mono">
              {search ? t("No matching conversations found.") : t("No saved conversations yet.")}
            </div>
          ) : (
            <>
              {/* Pinned Section */}
              {pinned.length > 0 && (
                <div className="flex flex-col gap-1 mb-2">
                  <div className="px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-[var(--accent)] opacity-80">
                    {t("Pinned")}
                  </div>
                  {pinned.map((c) => (
                    <ConversationItem
                      key={c.id}
                      conv={c}
                      language={language}
                      isActive={c.id === activeConversationId}
                      onSelect={() => onSelectConversation(c.id)}
                      onTogglePin={() => onTogglePin(c.id)}
                      onDelete={() => onDeleteConversation(c.id)}
                    />
                  ))}
                </div>
              )}

              {/* Unpinned / Recent Section */}
              {unpinned.length > 0 && (
                <div className="flex flex-col gap-1">
                  {pinned.length > 0 && (
                    <div className="px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-[var(--txt-muted)]">
                      {t("Recent")}
                    </div>
                  )}
                  {unpinned.map((c) => (
                    <ConversationItem
                      key={c.id}
                      conv={c}
                      language={language}
                      isActive={c.id === activeConversationId}
                      onSelect={() => onSelectConversation(c.id)}
                      onTogglePin={() => onTogglePin(c.id)}
                      onDelete={() => onDeleteConversation(c.id)}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer Navigation: Settings, Intelligence & Local Storage Status */}
        <div className="p-3 border-t border-[var(--border)] bg-[var(--surface-raised)]/40 flex flex-col gap-2 shrink-0">
          {onOpenSettings && (
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  safeVibrate("selection");
                  onOpenSettings("general");
                  onClose();
                }}
                className="flex-1 flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-xs text-[var(--txt)] font-medium transition-colors touch-target min-h-[44px] cursor-pointer"
                aria-label={t("Settings")}
              >
                <Settings2 className="w-4 h-4 text-[var(--txt-muted)] shrink-0" />
                <span>{t("Settings")}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  safeVibrate("selection");
                  onOpenSettings("personal-intelligence");
                  onClose();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[var(--border-accent)] bg-[var(--accent-d)]/60 hover:bg-[var(--accent-d)] text-xs text-[var(--accent-b)] font-semibold transition-colors touch-target min-h-[44px] cursor-pointer"
                aria-label={t("Personal Intelligence")}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0" />
                <span>{t("Context")}</span>
              </button>
            </div>
          )}

          {/* Local storage privacy badge */}
          <div className="flex items-center justify-between px-1 text-[10px] font-mono text-[var(--txt-muted)] select-none">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>{t("Local Storage")}</span>
            </span>
            <span>{t("Private & Offline")}</span>
          </div>
        </div>
      </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function ConversationItem({
  conv,
  language,
  isActive,
  onSelect,
  onTogglePin,
  onDelete,
}: {
  conv: Conversation;
  language: UiLanguage;
  isActive: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
  const t = (text: string) => uiText(language, text);
  return (
    <div
      className={`group flex items-center justify-between p-2.5 rounded-xl transition-all border ${
        isActive
          ? "bg-[var(--accent-d)] border-[var(--accent)]/50 text-[var(--txt)]"
          : "bg-[var(--surface)] border-transparent hover:bg-[var(--surface-hover)] hover:border-[var(--border)] text-[var(--txt-dim)]"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="flex flex-col flex-1 min-w-0 pr-2 text-left bg-transparent border-0 cursor-pointer p-0 min-h-[44px] justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)] rounded-lg touch-target"
        aria-label={`${t("Select conversation")}: ${conv.title}`}
      >
        <span className="text-xs font-medium truncate w-full">{conv.title}</span>
        <span className="text-[10px] text-[var(--txt-muted)] font-mono">
          {formatRelativeTime(conv.updatedAt, language)}
        </span>
      </button>

      <div className="flex items-center gap-1 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`min-w-[44px] min-h-[44px] p-2 rounded-lg hover:bg-white/10 transition-colors flex items-center justify-center touch-target cursor-pointer ${
            conv.pinned ? "text-[var(--accent)] opacity-100" : "text-[var(--txt-muted)]"
          }`}
          title={t(conv.pinned ? "Unpin chat" : "Pin chat")}
          aria-label={t(conv.pinned ? "Unpin chat" : "Pin chat")}
        >
          <Pin className="w-3.5 h-3.5 fill-current" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="min-w-[44px] min-h-[44px] p-2 rounded-lg text-[var(--txt-muted)] hover:text-[var(--danger)] hover:bg-white/10 transition-colors flex items-center justify-center touch-target cursor-pointer"
          title={t("Delete chat")}
          aria-label={t("Delete chat")}
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
