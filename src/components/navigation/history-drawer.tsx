"use client";

import React, { useState, useMemo } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Conversation } from "@/lib/types/chat";
import { formatRelativeTime } from "@/lib/utils/format";
import { X, Search, Pin, Trash2, MessageSquare } from "lucide-react";
import { uiText, type UiLanguage } from "@/lib/i18n/ui";

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
}: HistoryDrawerProps) {
  const t = (text: string) => uiText(language, text);
  const [search, setSearch] = useState("");

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
      <Dialog.Overlay className="radiance-dialog-overlay fixed inset-0 z-40 bg-black/60 backdrop-blur-sm" />

      <Dialog.Content className="radiance-dialog-panel radiance-dialog-right fixed right-0 top-0 bottom-0 h-screen h-[100dvh] w-80 max-w-[88vw] z-50 flex flex-col pt-[env(safe-area-inset-top,0px)] pb-[env(safe-area-inset-bottom,0px)] pr-[env(safe-area-inset-right,0px)] bg-[var(--deep)]/95 backdrop-blur-2xl border-l border-[var(--border)] shadow-[-20px_0_50px_rgba(0,0,0,0.6)] outline-none">
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

        {/* Search */}
        <div className="p-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] focus-within:border-[var(--accent)]">
            <Search className="w-3.5 h-3.5 text-[var(--txt-muted)] shrink-0" />
            <input
              type="text"
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
      onClick={onSelect}
      className={`group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border ${
        isActive
          ? "bg-[var(--accent-d)] border-[var(--accent)]/50 text-[var(--txt)]"
          : "bg-[var(--surface)] border-transparent hover:bg-[var(--surface-hover)] hover:border-[var(--border)] text-[var(--txt-dim)]"
      }`}
    >
      <div className="flex flex-col flex-1 min-w-0 pr-2">
        <span className="text-xs font-medium truncate">{conv.title}</span>
        <span className="text-[10px] text-[var(--txt-muted)] font-mono">
          {formatRelativeTime(conv.updatedAt, language)}
        </span>
      </div>

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
