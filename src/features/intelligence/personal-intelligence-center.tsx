"use client";

import React, { useState } from "react";
import { Download, Plus, Trash2 } from "lucide-react";
import {
  addMemory,
  clearIntelligenceProfile,
  deleteMemory,
  recordPreferenceFeedback,
  removePreferenceFeedback,
  setPersonalizationEnabled,
  updateMemory,
  INTELLIGENCE_STORAGE_KEY,
} from "./profile-store";
import { MEMORY_CATEGORIES, PREFERENCE_SIGNALS, type MemoryCategory, type PersonalIntelligenceProfile, type PreferenceSignal } from "./profile-schema";
import { uiText, type UiLanguage } from "@/lib/i18n/ui";

const SIGNAL_LABELS: Record<PreferenceSignal, string> = {
  "more-concise": "More concise", "more-detailed": "More detail", "more-technical": "More technical",
  "simpler-language": "Simpler language", "more-examples": "More examples", "more-practical": "More practical guidance",
};

export function PersonalIntelligenceCenter({
  language = "en",
  profile,
  onChange,
}: {
  language?: UiLanguage;
  profile: PersonalIntelligenceProfile;
  onChange: (next: PersonalIntelligenceProfile) => boolean;
}) {
  const t = (text: string) => uiText(language, text);
  const [content, setContent] = useState("");
  const [category, setCategory] = useState<MemoryCategory>("context");
  const [status, setStatus] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState("");
  const [memorySearch, setMemorySearch] = useState("");
  const [memoryFilter, setMemoryFilter] = useState<MemoryCategory | "all">("all");
  const [confirmClear, setConfirmClear] = useState(false);

  const commit = (next: PersonalIntelligenceProfile, success = "Saved on this device.") => {
    if (onChange(next)) setStatus(success);
    else setStatus("Could not save. Browser storage may be unavailable or full.");
  };

  const handleAdd = () => {
    const result = addMemory(profile, { content, category, importance: 3, source: { type: "manual" } });
    if (!result.ok) {
      const messages = { invalid: "Enter a note of up to 500 characters.", sensitive: "This looks like a credential or sensitive identifier. It was not saved.", duplicate: "A similar note already exists.", limit: "The vault is full. Remove a note before adding another." };
      setStatus(messages[result.reason]);
      return;
    }
    commit(result.profile, "Note saved on this device.");
    setContent("");
  };

  const exportProfile = () => {
    try {
      const blob = new Blob([JSON.stringify(profile, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `radiance-personal-intelligence-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
      setStatus("Personal profile exported.");
    } catch {
      setStatus("Profile export failed.");
    }
  };

  const clearProfile = () => {
    if (!clearIntelligenceProfile()) {
      setStatus("Could not clear browser storage.");
      return;
    }
    window.dispatchEvent(new StorageEvent("storage", { key: INTELLIGENCE_STORAGE_KEY }));
    setConfirmClear(false);
    setStatus("Personal profile deleted from this browser.");
  };

  const visibleMemories = profile.memories.filter((memory) =>
    (memoryFilter === "all" || memory.category === memoryFilter) &&
    memory.content.toLocaleLowerCase().includes(memorySearch.trim().toLocaleLowerCase())
  );

  return (
    <div className="space-y-6" id="personal-intelligence-center">
      <section className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-[var(--txt)]">{t("How this profile works")}</h3>
        <p className="mt-2 text-sm leading-relaxed text-[var(--txt-muted)]">{t("Radiance stores notes and response feedback in this browser only. Nothing is inferred or saved automatically. When sharing is enabled, only notes selected for the current request and your explicit response preferences are sent to the currently selected AI provider.")}</p>
        <p className="mt-2 text-xs leading-relaxed text-[var(--txt-muted)]">{t("Browser storage is not encrypted and is shared with anyone using this browser profile. There is no account sync or account-level isolation. Keep secrets and sensitive identifiers out of saved notes.")}</p>
        <label className="mt-4 flex cursor-pointer items-start gap-3 border-t border-[var(--border)] pt-4">
          <input type="checkbox" checked={profile.personalizationEnabled} onChange={(event) => commit(setPersonalizationEnabled(profile, event.target.checked), event.target.checked ? "Personal context sharing enabled." : "Personal context sharing disabled.")} className="mt-1 h-4 w-4 accent-[var(--accent)]" />
          <span><span className="block text-sm font-medium text-[var(--txt)]">{t("Share relevant saved context with AI requests")}</span><span className="mt-1 block text-xs leading-relaxed text-[var(--txt-muted)]">{t("Off by default. You can turn this off at any time. Existing conversation records are not changed.")}</span></span>
        </label>
      </section>

      <section className="space-y-3">
        <div><h3 className="text-sm font-semibold text-[var(--txt)]">{t("Saved notes")} <span className="font-normal text-[var(--txt-muted)]">({profile.memories.length}/100)</span></h3><p className="mt-1 text-xs text-[var(--txt-muted)]">{t("Add a note yourself or use “Remember” on one of your messages.")}</p></div>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_180px]">
          <label className="sr-only" htmlFor="personal-memory-search">{t("Search saved notes")}</label>
          <input id="personal-memory-search" type="search" value={memorySearch} onChange={(event) => setMemorySearch(event.target.value)} placeholder={t("Search saved notes")} className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--txt)] placeholder:text-[var(--txt-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" />
          <label className="sr-only" htmlFor="personal-memory-filter">{t("Filter saved notes by category")}</label>
          <select id="personal-memory-filter" value={memoryFilter} onChange={(event) => setMemoryFilter(event.target.value as MemoryCategory | "all")} className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--txt)] placeholder:text-[var(--txt-muted)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"><option value="all">{t("All categories")}</option>{MEMORY_CATEGORIES.map((value) => <option key={value} value={value}>{t(value[0].toUpperCase() + value.slice(1))}</option>)}</select>
        </div>
        <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_160px_auto]">
          <label className="sr-only" htmlFor="personal-memory-input">{t("New note")}</label>
          <input id="personal-memory-input" maxLength={500} value={content} onChange={(event) => setContent(event.target.value)} placeholder="For example: I prefer Python examples" className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--txt)] placeholder:text-[var(--txt-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" />
          <label className="sr-only" htmlFor="personal-memory-category">{t("Note category")}</label>
          <select id="personal-memory-category" value={category} onChange={(event) => setCategory(event.target.value as MemoryCategory)} className="min-h-11 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--txt)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]">{MEMORY_CATEGORIES.map((value) => <option key={value} value={value}>{value[0].toUpperCase() + value.slice(1)}</option>)}</select>
          <button type="button" onClick={handleAdd} disabled={!content.trim()} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-4 text-sm font-medium text-white disabled:opacity-50"><Plus className="h-4 w-4" />{t("Add note")}</button>
        </div>
        <ul className="divide-y divide-[var(--border)] rounded-2xl border border-[var(--border)]">
          {visibleMemories.map((memory) => <li key={memory.id} className="flex flex-col gap-3 p-3 sm:flex-row sm:items-center">
            {editingId === memory.id ? <input aria-label={t("Edit saved note")} maxLength={500} value={editDraft} onChange={(event) => setEditDraft(event.target.value)} className="min-h-11 min-w-0 flex-1 rounded-lg border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--txt)]" /> : <div className="min-w-0 flex-1"><p className="break-words text-sm text-[var(--txt)]">{memory.content}</p><p className="mt-1 text-xs text-[var(--txt-muted)]">{t(memory.category)} · {t(memory.source.type === "conversation" ? "saved from a conversation" : "manual note")} · {new Date(memory.createdAt).toLocaleDateString(language)}{memory.expiresAt ? ` · ${t("expires")} ${new Date(memory.expiresAt).toLocaleDateString(language)}` : ""}</p></div>}
            {editingId === memory.id ? <><button type="button" className="min-h-10 rounded-lg px-3 text-sm text-[var(--accent-b)]" onClick={() => { const next = updateMemory(profile, memory.id, { content: editDraft }); if (next) commit(next, t("Note updated.")); else setStatus(t("Note was not updated. It may contain sensitive information or duplicate another note.")); setEditingId(null); }}>{t("Save")}</button><button type="button" className="min-h-10 rounded-lg px-3 text-sm text-[var(--txt-muted)]" onClick={() => setEditingId(null)}>{t("Cancel")}</button></> : <button type="button" className="min-h-10 rounded-lg px-3 text-sm text-[var(--txt-muted)] hover:text-[var(--txt)]" onClick={() => { setEditingId(memory.id); setEditDraft(memory.content); }}>{t("Edit")}</button>}
            <button type="button" aria-label={`${t("Delete note")}: ${memory.content.slice(0, 60)}`} onClick={() => commit(deleteMemory(profile, memory.id), t("Note deleted."))} className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg px-3 text-sm text-[var(--danger)]"><Trash2 className="h-4 w-4" /><span className="sm:sr-only">{t("Delete")}</span></button>
          </li>)}
          {visibleMemories.length === 0 && <li className="p-4 text-sm text-[var(--txt-muted)]">{t(profile.memories.length === 0 ? "No notes saved yet." : "No notes match this search and category.")}</li>}
        </ul>
      </section>

      <section className="rounded-2xl border border-[var(--border)] p-4 sm:p-5">
        <h3 className="text-sm font-semibold text-[var(--txt)]">{t("Response preferences")}</h3>
        <p className="mt-1 text-xs text-[var(--txt-muted)]">{t("These are explicit choices. The latest choice in each category guides matching requests for up to 180 days.")}</p>
        <div className="mt-3 flex flex-wrap gap-2">{PREFERENCE_SIGNALS.map((signal) => <button type="button" key={signal} onClick={() => commit(recordPreferenceFeedback(profile, { signal, scope: "global" }), `${SIGNAL_LABELS[signal]} preference saved.`)} className="min-h-10 rounded-lg border border-[var(--border)] px-3 text-xs text-[var(--txt-dim)] hover:bg-[var(--surface-hover)]">{SIGNAL_LABELS[signal]}</button>)}</div>
        <ul className="mt-4 divide-y divide-[var(--border)] border-t border-[var(--border)]">{profile.preferenceFeedback.slice().reverse().map((item) => <li key={item.id} className="flex min-h-11 items-center justify-between gap-3 text-sm"><span className="text-[var(--txt-dim)]">{t(SIGNAL_LABELS[item.signal])} · {t(item.scope)} · {new Date(item.createdAt).toLocaleDateString(language)}</span><button type="button" aria-label={`${t("Remove")} ${t(SIGNAL_LABELS[item.signal])} ${t("preference")}`} onClick={() => commit(removePreferenceFeedback(profile, item.id), t("Preference removed."))} className="min-h-10 px-2 text-xs text-[var(--danger)]">{t("Remove")}</button></li>)}</ul>
      </section>

      <section className="flex flex-col gap-3 rounded-2xl border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
        <div><h3 className="text-sm font-semibold text-[var(--txt)]">{t("Export or delete this profile")}</h3><p className="mt-1 text-xs text-[var(--txt-muted)]">{t("This is separate from conversation history and Radiance display settings.")}</p></div>
        <div className="flex flex-wrap gap-2"><button type="button" onClick={exportProfile} className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-[var(--border)] px-3 text-sm text-[var(--txt)]"><Download className="h-4 w-4" />{t("Export JSON")}</button>{confirmClear ? <><button type="button" onClick={clearProfile} className="min-h-11 rounded-xl bg-[var(--danger)] px-3 text-sm text-white">{t("Confirm delete")}</button><button type="button" onClick={() => setConfirmClear(false)} className="min-h-11 rounded-xl px-3 text-sm text-[var(--txt-muted)]">{t("Cancel")}</button></> : <button type="button" onClick={() => setConfirmClear(true)} className="min-h-11 rounded-xl border border-[var(--danger)]/40 px-3 text-sm text-[var(--danger)]">{t("Delete profile")}</button>}</div>
      </section>
      <p role="status" aria-live="polite" className="min-h-5 text-xs text-[var(--accent-b)]">{status}</p>
    </div>
  );
}
