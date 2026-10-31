"use client";

import React, { useState, useMemo } from "react";
import { Conversation } from "@/lib/types/chat";
import { formatRelativeTime } from "@/lib/utils/format";
import { X, Search, Pin, Trash2, MessageSquare, Download } from "lucide-react";

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onTogglePin: (id: string) => void;
  onDeleteConversation: (id: string) => void;
  onDeleteAll: () => void;
  onOpenLegacyImport: () => void;
}

export function HistoryDrawer({
  isOpen,
  onClose,
  conversations,
  activeConversationId,
  onSelectConversation,
  onTogglePin,
  onDeleteConversation,
  onDeleteAll,
  onOpenLegacyImport,
}: HistoryDrawerProps) {
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

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="fixed right-0 top-0 bottom-0 w-80 max-w-[85vw] z-50 flex flex-col bg-[var(--deep)]/95 backdrop-blur-2xl border-l border-[var(--border)] shadow-[-20px_0_50px_rgba(0,0,0,0.6)] animate-in slide-in-from-right duration-250">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-serif font-bold text-base text-[var(--txt)]">Conversations</span>
          </div>
          <div className="flex items-center gap-1">
            {conversations.length > 0 && (
              <button
                onClick={onDeleteAll}
                className="p-1.5 rounded-lg text-[var(--txt-muted)] hover:text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors"
                title="Delete all conversations"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[var(--txt-muted)] hover:text-[var(--txt)] hover:bg-[var(--surface-hover)] transition-colors"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
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
              placeholder="Search chat history..."
              className="w-full bg-transparent border-0 outline-none text-xs text-[var(--txt)] placeholder:text-[var(--txt-muted)]"
            />
          </div>
        </div>

        {/* Content List */}
        <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-1">
          {/* Legacy Import Banner */}
          <button
            onClick={onOpenLegacyImport}
            className="flex items-center justify-between p-2.5 mb-2 rounded-xl bg-[var(--accent-d)]/40 border border-[var(--accent)]/30 text-left hover:bg-[var(--accent-d)] transition-colors group"
          >
            <div className="flex flex-col">
              <span className="font-mono text-[10px] uppercase font-bold text-[var(--accent)]">
                Legacy Tanix AI Migration
              </span>
              <span className="text-[11px] text-[var(--txt-dim)]">
                Import saved chats from browser
              </span>
            </div>
            <Download className="w-4 h-4 text-[var(--accent)] group-hover:translate-y-0.5 transition-transform" />
          </button>

          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[var(--txt-muted)] font-mono">
              {search ? "No matching conversations found." : "No saved conversations yet."}
            </div>
          ) : (
            <>
              {/* Pinned Section */}
              {pinned.length > 0 && (
                <div className="flex flex-col gap-1 mb-2">
                  <div className="px-2 py-1 font-mono text-[9px] uppercase tracking-wider text-[var(--accent)] opacity-80">
                    Pinned
                  </div>
                  {pinned.map((c) => (
                    <ConversationItem
                      key={c.id}
                      conv={c}
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
                      Recent
                    </div>
                  )}
                  {unpinned.map((c) => (
                    <ConversationItem
                      key={c.id}
                      conv={c}
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
      </div>
    </>
  );
}

function ConversationItem({
  conv,
  isActive,
  onSelect,
  onTogglePin,
  onDelete,
}: {
  conv: Conversation;
  isActive: boolean;
  onSelect: () => void;
  onTogglePin: () => void;
  onDelete: () => void;
}) {
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
          {formatRelativeTime(conv.updatedAt)}
        </span>
      </div>

      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onTogglePin();
          }}
          className={`p-1 rounded hover:bg-white/10 ${
            conv.pinned ? "text-[var(--accent)] opacity-100" : "text-[var(--txt-muted)]"
          }`}
          title={conv.pinned ? "Unpin chat" : "Pin chat"}
        >
          <Pin className="w-3.5 h-3.5 fill-current" />
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1 rounded text-[var(--txt-muted)] hover:text-[var(--danger)] hover:bg-white/10"
          title="Delete chat"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
