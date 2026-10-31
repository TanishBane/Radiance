"use client";

import React, { useState, useEffect } from "react";
import { safeLocalStorage } from "@/lib/utils/storage";
import { formatRelativeTime } from "@/lib/utils/format";
import { X, Download, Check, AlertCircle } from "lucide-react";

interface LegacyImportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (importedCount: number) => void;
}

export function LegacyImportDialog({ isOpen, onClose, onImportSuccess }: LegacyImportDialogProps) {
  const [legacyChats, setLegacyChats] = useState<Array<{ id: string; title: string; ts: number; messageCount: number }>>([]);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isImporting, setIsImporting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const chats = safeLocalStorage.listLegacyChats();
      setLegacyChats(chats);
      setSelectedIds(new Set(chats.map((c) => c.id)));
    }
  }, [isOpen]);

  const toggleSelect = (id: string) => {
    const next = new Set(selectedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedIds(next);
  };

  const handleImport = () => {
    setIsImporting(true);
    let count = 0;
    selectedIds.forEach((id) => {
      const result = safeLocalStorage.importLegacyChat(id);
      if (result) count++;
    });
    setIsImporting(false);
    onImportSuccess(count);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150"
        onClick={onClose}
      />
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] max-w-[92vw] z-50 rounded-2xl bg-[var(--deep)]/95 backdrop-blur-2xl border border-[var(--border)] shadow-[0_25px_70px_rgba(0,0,0,0.85)] p-5 animate-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-[var(--accent)]" />
            <span className="font-serif font-bold text-base text-[var(--txt)]">Legacy Chat Migration</span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[var(--txt-muted)] hover:text-[var(--txt)]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-[var(--txt-dim)] leading-relaxed mb-3">
          Found <strong>{legacyChats.length}</strong> legacy Tanix AI conversations in your browser storage. You can migrate them safely into Radiance without storage quota bloat.
        </p>

        {legacyChats.length === 0 ? (
          <div className="py-8 flex flex-col items-center justify-center gap-2 text-center text-xs text-[var(--txt-muted)] font-mono">
            <AlertCircle className="w-6 h-6 text-[var(--txt-muted)]" />
            <span>No legacy Tanix AI conversations found in this browser.</span>
          </div>
        ) : (
          <>
            <div className="max-h-60 overflow-y-auto flex flex-col gap-1.5 p-1 border border-[var(--border)] rounded-xl bg-[var(--surface)]">
              {legacyChats.map((c) => {
                const isChecked = selectedIds.has(c.id);
                return (
                  <div
                    key={c.id}
                    onClick={() => toggleSelect(c.id)}
                    className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors ${
                      isChecked ? "bg-[var(--accent-d)]/60 text-[var(--txt)]" : "text-[var(--txt-dim)] hover:bg-white/5"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 pr-2">
                      <div
                        className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] shrink-0 ${
                          isChecked ? "bg-[var(--accent)] border-[var(--accent)] text-[var(--void)] font-bold" : "border-[var(--border)]"
                        }`}
                      >
                        {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                      </div>
                      <span className="text-xs font-medium truncate">{c.title}</span>
                    </div>
                    <span className="font-mono text-[10px] text-[var(--txt-muted)] shrink-0">
                      {formatRelativeTime(c.ts)}
                    </span>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-end gap-2.5 mt-4 pt-3 border-t border-[var(--border)]">
              <button
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-xs font-mono text-[var(--txt-muted)] hover:text-[var(--txt)]"
              >
                Cancel
              </button>
              <button
                onClick={handleImport}
                disabled={selectedIds.size === 0 || isImporting}
                className="px-4 py-1.5 rounded-lg text-xs font-mono font-bold bg-[var(--accent)] text-[var(--void)] hover:scale-105 transition-transform disabled:opacity-40 disabled:pointer-events-none"
              >
                {isImporting ? "Migrating..." : `Migrate ${selectedIds.size} Chat(s)`}
              </button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
