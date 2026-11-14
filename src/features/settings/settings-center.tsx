"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, Check, ChevronDown, Command, Download, RotateCcw, Search, Settings2, Trash2, X } from "lucide-react";
import { APP_VERSION } from "@/lib/app-info";
import { AVAILABLE_MODELS } from "@/lib/ai/models";
import { TONES } from "@/lib/ai/prompts";
import { ATMOSPHERE_ENGINES, CURATED_COLOR_THEMES, type GradientStyle } from "@/lib/types/theme";
import { getMotionTransition } from "@/lib/motion/presets";
import { KEYBOARD_SHORTCUTS } from "./keyboard-shortcuts";
import { DEFAULT_SETTINGS } from "./settings-service";
import type { RadianceSettings } from "./settings-schema";
import { PersonalIntelligenceCenter } from "@/features/intelligence/personal-intelligence-center";
import type { PersonalIntelligenceProfile } from "@/features/intelligence/profile-schema";
import { uiText, type UiLanguage } from "@/lib/i18n/ui";

const SECTIONS = [
  { id: "general", label: "General" },
  { id: "appearance", label: "Appearance" },
  { id: "personalization", label: "Personalization" },
  { id: "personal-intelligence", label: "Personal Intelligence" },
  { id: "models", label: "AI & Models" },
  { id: "composer", label: "Chat & Composer" },
  { id: "data", label: "Data Controls" },
  { id: "about", label: "About" },
] as const;

type SectionId = (typeof SECTIONS)[number]["id"];
type SettingKey = keyof RadianceSettings;
type Confirmation = "reset" | "clear";

const SEARCH_TARGETS: Array<{ label: string; section: SectionId; id: string }> = [
  { label: "Keyboard Shortcuts", section: "general", id: "settings-shortcuts" },
  { label: "Local session", section: "general", id: "local-session" },
  { label: "Color theme", section: "appearance", id: "color-theme" },
  { label: "Atmosphere engine", section: "appearance", id: "atmosphere-engine" },
  { label: "Automatic palette rotation", section: "appearance", id: "auto-theme" },
  { label: "Response tone", section: "personalization", id: "response-tone" },
  { label: "Response language", section: "personalization", id: "response-language-setting" },
  { label: "Custom instructions", section: "personalization", id: "custom-instructions" },
  { label: "Personal Intelligence", section: "personal-intelligence", id: "personal-intelligence-center" },
  { label: "Default model", section: "models", id: "default-model" },
  { label: "Enter to send", section: "composer", id: "enter-to-send" },
  { label: "Export conversations", section: "data", id: "export-conversations" },
  { label: "Clear conversation history", section: "data", id: "clear-conversations" },
  { label: "Reset settings", section: "data", id: "reset-settings" },
  { label: "Application version", section: "about", id: "application-version" },
];

const noopPreviewAtmosphere = (_engine: GradientStyle | null) => {};

interface SettingsCenterProps {
  language?: UiLanguage;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  section: string;
  settings: RadianceSettings;
  onChange: (settings: RadianceSettings) => boolean;
  onReset: () => boolean;
  onExportConversations: () => boolean;
  onClearConversations: () => Promise<boolean>;
  conversationCount: number;
  intelligenceProfile: PersonalIntelligenceProfile;
  onIntelligenceProfileChange: (profile: PersonalIntelligenceProfile) => boolean;
  onPreviewAtmosphere?: (engine: GradientStyle | null) => void;
}

function SwitchRow({
  id,
  title,
  description,
  checked,
  onCheckedChange,
}: {
  id: string;
  title: string;
  description: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div id={id} className="flex items-center justify-between gap-5 border-b border-[var(--border)] py-4 last:border-b-0">
      <div className="min-w-0">
        <div className="text-sm font-medium text-[var(--txt)]">{title}</div>
        <p className="mt-1 text-xs leading-relaxed text-[var(--txt-muted)]">{description}</p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={title}
        onClick={() => onCheckedChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full border transition-colors ${checked ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--border-hover)] bg-[var(--surface-hover)]"}`}
      >
        <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${checked ? "translate-x-[22px]" : "translate-x-0.5"}`} />
      </button>
    </div>
  );
}

function SelectRow({
  id,
  label,
  description,
  value,
  options,
  onChange,
}: {
  id: string;
  label: string;
  description: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
}) {
  return (
    <div id={id} className="flex flex-col gap-3 border-b border-[var(--border)] py-4 last:border-b-0 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <label htmlFor={`${id}-select`} className="text-sm font-medium text-[var(--txt)]">{label}</label>
        <p className="mt-1 text-xs leading-relaxed text-[var(--txt-muted)]">{description}</p>
      </div>
      <div className="relative w-full sm:w-64">
        <select
          id={`${id}-select`}
          aria-label={label}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 pr-9 text-sm text-[var(--txt)] outline-none transition-colors hover:border-[var(--border-hover)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
        >
          {options.map((option) => <option key={option.value} value={option.value} className="bg-[var(--deep)]">{option.label}</option>)}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--txt-muted)]" />
      </div>
    </div>
  );
}

export function SettingsCenter({
  language = "en",
  open,
  onOpenChange,
  section,
  settings,
  onChange,
  onReset,
  onExportConversations,
  onClearConversations,
  conversationCount,
  intelligenceProfile,
  onIntelligenceProfileChange,
  onPreviewAtmosphere = noopPreviewAtmosphere,
}: SettingsCenterProps) {
  const t = useCallback((text: string, values?: Record<string, string | number>) => uiText(language, text, values), [language]);
  const reducedMotion = useReducedMotion() ?? false;
  const [activeSection, setActiveSection] = useState<SectionId>("general");
  const [search, setSearch] = useState("");
  const [pendingSearchTarget, setPendingSearchTarget] = useState<string | null>(null);
  const [status, setStatus] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation | null>(null);
  const [pending, setPending] = useState(false);
  const [instructionsDraft, setInstructionsDraft] = useState(settings.customInstructions);
  const [pendingAtmosphere, setPendingAtmosphere] = useState<GradientStyle>(settings.gradientStyle as GradientStyle);
  const [previewedAtmosphere, setPreviewedAtmosphere] = useState<GradientStyle | null>(null);
  const confirmButtonRef = useRef<HTMLButtonElement>(null);
  const confirmationTriggerRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!open) return;
    setActiveSection(SECTIONS.some((entry) => entry.id === section) ? section as SectionId : "general");
    setSearch("");
    setStatus("");
  }, [open, section]);

  useEffect(() => setInstructionsDraft(settings.customInstructions), [settings.customInstructions]);

  useEffect(() => {
    if (!open) {
      setPendingAtmosphere(settings.gradientStyle as GradientStyle);
      setPreviewedAtmosphere(null);
      onPreviewAtmosphere(null);
      return;
    }
    setPendingAtmosphere(settings.gradientStyle as GradientStyle);
    setPreviewedAtmosphere(null);
  }, [open, settings.gradientStyle, onPreviewAtmosphere]);

  useEffect(() => {
    if (!pendingSearchTarget) return;
    const timeout = window.setTimeout(() => {
      const target = document.getElementById(pendingSearchTarget);
      target?.scrollIntoView?.({ block: "start", behavior: reducedMotion ? "instant" : "smooth" });
      if (target instanceof HTMLElement) target.focus({ preventScroll: true });
      setPendingSearchTarget(null);
    }, reducedMotion ? 0 : 240);
    return () => window.clearTimeout(timeout);
  }, [activeSection, pendingSearchTarget, reducedMotion]);

  useEffect(() => {
    if (!confirmation) return;
    confirmButtonRef.current?.focus();
  }, [confirmation]);

  const searchResults = useMemo(() => {
    const query = search.trim().toLowerCase();
    return query ? SEARCH_TARGETS.filter((target) => t(target.label).toLowerCase().includes(query)) : [];
  }, [search, t]);

  const changeSetting = <K extends SettingKey>(key: K, value: RadianceSettings[K]) => {
    const next = { ...settings, [key]: value };
    if (onChange(next)) setStatus(t("Saved locally"));
    else setStatus(t("Could not save. Check browser storage and try again."));
  };

  const navigateToResult = (result: (typeof SEARCH_TARGETS)[number]) => {
    setPendingSearchTarget(result.id);
    setActiveSection(result.section);
    setSearch("");
  };

  const runConfirmation = async () => {
    setPending(true);
    const succeeded = confirmation === "reset" ? onReset() : await onClearConversations();
    setPending(false);
    if (succeeded) {
      setStatus(t(confirmation === "reset" ? "Settings reset to defaults" : "Conversation history cleared"));
      setInstructionsDraft(DEFAULT_SETTINGS.customInstructions);
      setConfirmation(null);
      requestAnimationFrame(() => confirmationTriggerRef.current?.focus());
    } else {
      setStatus(t("The action could not be completed. Your data was not reported as changed."));
    }
  };

  const currentSection = SECTIONS.find((entry) => entry.id === activeSection)!;

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className={`radiance-dialog-overlay fixed inset-0 z-50 transition-colors ${previewedAtmosphere ? "bg-black/25" : "bg-black/70 backdrop-blur-sm"}`} />
        <Dialog.Content
          className={`radiance-dialog-center radiance-settings-panel fixed inset-0 z-50 flex h-[100dvh] w-full flex-col overflow-hidden border border-[var(--border)] ${previewedAtmosphere ? "bg-[var(--deep)]/85 backdrop-blur-md" : "bg-[var(--deep)]"} text-[var(--txt)] outline-none md:left-1/2 md:top-1/2 md:h-[min(780px,calc(100dvh-40px))] md:w-[min(1000px,calc(100vw-48px))] md:-translate-x-1/2 md:-translate-y-1/2 md:rounded-[24px] md:shadow-modal`}
          onEscapeKeyDown={(event) => {
            if (confirmation) {
              event.preventDefault();
              setConfirmation(null);
              requestAnimationFrame(() => confirmationTriggerRef.current?.focus());
            }
          }}
          onOpenAutoFocus={() => {
            previousFocusRef.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
          }}
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            previousFocusRef.current?.focus();
          }}
        >
          <Dialog.Description className="sr-only">{t("Manage your Radiance appearance, response behavior, models and local data.")}</Dialog.Description>
          <header className="flex shrink-0 items-center gap-3 border-b border-[var(--border)] bg-[var(--deep)] px-4 py-3 pt-[max(0.75rem,env(safe-area-inset-top,0px))] sm:px-6">
            <Dialog.Close asChild>
              <button type="button" aria-label={t("Back to chat")} className="flex h-11 min-w-11 items-center justify-center rounded-xl text-[var(--txt-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--txt)] md:hidden">
                <ArrowLeft className="h-5 w-5" />
              </button>
            </Dialog.Close>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <div className="hidden h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-[var(--accent)]/30 bg-[var(--accent-d)] text-[var(--accent-b)] sm:flex">
                <Settings2 className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <Dialog.Title className="font-serif text-lg font-semibold leading-tight text-[var(--txt)] sm:text-xl">{t("Radiance Settings")}</Dialog.Title>
                <p className="truncate text-xs text-[var(--txt-muted)]">{t("One place for your workspace preferences")}</p>
              </div>
            </div>
            <label className="relative hidden w-[min(280px,32vw)] sm:block">
              <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--txt-muted)]" />
              <input
                type="search"
                role="searchbox"
                aria-label={t("Search settings")}
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t("Search settings")}
                className="h-10 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--txt)] placeholder:text-[var(--txt-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
              />
            </label>
            <Dialog.Close asChild>
              <button type="button" aria-label={t("Close settings")} className="hidden h-11 w-11 shrink-0 items-center justify-center rounded-xl text-[var(--txt-muted)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--txt)] md:flex">
                <X className="h-4 w-4" />
              </button>
            </Dialog.Close>
          </header>

          <div className="border-b border-[var(--border)] px-4 py-3 md:hidden">
            <label htmlFor="settings-section-mobile" className="sr-only">{t("Settings section")}</label>
            <select
              id="settings-section-mobile"
              aria-label={t("Settings section")}
              value={activeSection}
              onChange={(event) => setActiveSection(event.target.value as SectionId)}
              className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 text-sm text-[var(--txt)] focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
            >
              {SECTIONS.map((entry) => <option key={entry.id} value={entry.id} className="bg-[var(--deep)]">{t(entry.label)}</option>)}
            </select>
          </div>

          <div className="flex min-h-0 flex-1">
            <nav aria-label={t("Settings sections")} className="hidden w-[220px] shrink-0 flex-col border-r border-[var(--border)] bg-[var(--void)]/35 p-3 md:flex">
              <div className="px-3 pb-2 pt-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--txt-muted)]">{t("Preferences")}</div>
              {SECTIONS.map((entry) => (
                <button
                  type="button"
                  key={entry.id}
                  aria-current={activeSection === entry.id ? "page" : undefined}
                  onClick={() => setActiveSection(entry.id)}
                  className={`mb-1 flex min-h-11 items-center rounded-xl px-3 text-left text-sm transition-colors ${activeSection === entry.id ? "bg-[var(--accent-d)] font-medium text-[var(--accent-b)]" : "text-[var(--txt-dim)] hover:bg-[var(--surface-hover)] hover:text-[var(--txt)]"}`}
                >{t(entry.label)}</button>
              ))}
              <div className="mt-auto border-t border-[var(--border)] px-3 pt-3 text-xs text-[var(--txt-muted)]">{t("Preferences are stored in this browser.")}</div>
            </nav>

            <div className="relative min-w-0 flex-1 overflow-y-auto overscroll-contain px-4 pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] pt-4 sm:px-7 sm:pt-6">
              <label className="relative mb-4 block sm:hidden">
                <Search aria-hidden="true" className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--txt-muted)]" />
                <input
                  type="search"
                  role="searchbox"
                  aria-label={t("Search settings")}
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder={t("Search settings")}
                  className="h-11 w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] pl-9 pr-3 text-sm text-[var(--txt)] placeholder:text-[var(--txt-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                />
              </label>

              {searchResults.length > 0 && (
                <div className="absolute inset-x-4 top-4 z-20 rounded-2xl border border-[var(--border-hover)] bg-[var(--surface-overlay)] p-2 shadow-modal sm:inset-x-7 sm:top-6">
                  {searchResults.map((result) => (
                    <button
                      type="button"
                      key={result.id}
                      onClick={() => navigateToResult(result)}
                      className="flex min-h-11 w-full items-center justify-between gap-3 rounded-xl px-3 text-left text-sm text-[var(--txt-dim)] hover:bg-[var(--surface-hover)] hover:text-[var(--txt)]"
                    >
                      <span>{t(result.label)}</span>
                      <span className="text-xs text-[var(--txt-muted)]">{t(SECTIONS.find((entry) => entry.id === result.section)?.label ?? "General")}</span>
                    </button>
                  ))}
                  {searchResults.length === 0 && <p className="px-3 py-2 text-sm text-[var(--txt-muted)]">{t("No matching settings.")}</p>}
                </div>
              )}
              {search.trim() && searchResults.length === 0 && <p role="status" className="mb-3 text-sm text-[var(--txt-muted)]">{t("No settings match “{search}”.", { search })}</p>}

              <AnimatePresence mode="wait" initial={false}>
                <motion.section
                  key={activeSection}
                  initial={reducedMotion ? undefined : { opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reducedMotion ? undefined : { opacity: 0, y: -3 }}
                  transition={getMotionTransition("interaction", reducedMotion)}
                  aria-labelledby="settings-section-title"
                  className="mx-auto max-w-[720px] pb-8"
                >
                  <div className="mb-6 border-b border-[var(--border)] pb-5">
                    <p className="mb-1 text-xs font-medium uppercase tracking-[0.13em] text-[var(--accent-b)]">{t(currentSection.label)}</p>
                    <h2 id="settings-section-title" className="font-serif text-2xl font-semibold tracking-tight text-[var(--txt)] sm:text-[28px]">{t(currentSection.label)}</h2>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-[var(--txt-muted)]">{t(sectionDescription(activeSection))}</p>
                  </div>

                  {activeSection === "general" && (
                    <div className="space-y-6">
                      <section id="settings-shortcuts" aria-labelledby="shortcuts-title">
                        <h3 id="shortcuts-title" className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--txt)]"><Command className="h-4 w-4 text-[var(--accent-b)]" />{t("Keyboard Shortcuts")}</h3>
                        <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                          {KEYBOARD_SHORTCUTS.map((shortcut) => (
                            <div key={shortcut.id} className="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--border)] px-3 last:border-0 sm:px-4">
                              <span className="text-sm text-[var(--txt-dim)]">{shortcut.label}</span>
                              <kbd className="whitespace-nowrap rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 font-mono text-xs text-[var(--accent-b)]">{shortcut.keys}</kbd>
                            </div>
                          ))}
                          <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[var(--border)] px-3 sm:px-4">
                            <span className="text-sm text-[var(--txt-dim)]">{t("Send message")}</span>
                            <kbd className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 font-mono text-xs text-[var(--accent-b)]">{settings.enterToSend ? "Enter" : "Ctrl / ⌘ + Enter"}</kbd>
                          </div>
                          <div className="flex min-h-12 items-center justify-between gap-3 px-3 sm:px-4">
                            <span className="text-sm text-[var(--txt-dim)]">{t("New line")}</span>
                            <kbd className="rounded-lg border border-[var(--border)] bg-[var(--surface)] px-2.5 py-1.5 font-mono text-xs text-[var(--accent-b)]">{settings.enterToSend ? "Shift + Enter" : "Enter"}</kbd>
                          </div>
                        </div>
                          <p className="mt-2 text-xs text-[var(--txt-muted)]">{t("These actions use the application’s registered shortcuts. Browser and operating-system shortcuts are not customized here.")}</p>
                      </section>

                      <section id="local-session" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4">
                          <div className="flex items-center gap-2 text-sm font-semibold text-[var(--txt)]"><span className="h-2 w-2 rounded-full bg-emerald-400" />{t("Local session")}</div>
                          <p className="mt-2 text-sm leading-relaxed text-[var(--txt-muted)]">{t("Your preferences and conversations are stored in this browser. This app instance has no signed-in account or settings sync connection.")}</p>
                      </section>
                    </div>
                  )}

                  {activeSection === "appearance" && (
                    <div className="space-y-6">
                      <section id="color-theme">
                        <div className="mb-3">
                          <h3 className="text-sm font-semibold text-[var(--txt)]">{t("Color theme")}</h3>
                          <p className="mt-1 text-xs text-[var(--txt-muted)]">{t("Choose from the palettes already used by Radiance surfaces and background rendering.")}</p>
                        </div>
                        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-4 lg:grid-cols-5">
                          {CURATED_COLOR_THEMES.map((theme) => {
                            const selected = settings.theme === theme.id;
                            return (
                              <button
                                key={theme.id}
                                type="button"
                                aria-label={`${theme.label} ${t("color palette")}`}
                                aria-pressed={selected}
                                onClick={() => {
                                  const next = { ...settings, theme: theme.id, autoTheme: false };
                                  if (onChange(next)) setStatus(t("Saved locally"));
                                  else setStatus(t("Could not save. Check browser storage and try again."));
                                }}
                                className={`flex min-h-[64px] items-center gap-2 rounded-xl border px-2.5 text-left transition-colors ${selected ? "border-[var(--accent)] bg-[var(--accent-d)]" : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--border-hover)]"}`}
                              >
                                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-white/25" style={{ background: theme.swatchGradient }}>
                                  {selected && <Check className="h-3.5 w-3.5 text-white drop-shadow" />}
                                </span>
                                <span className="line-clamp-2 text-xs leading-tight text-[var(--txt-dim)]">{theme.label}</span>
                              </button>
                            );
                          })}
                        </div>
                      </section>

                      <section className="border-t border-[var(--border)] pt-3">
                        <SelectRow
                          id="atmosphere-engine"
                          label={t("Atmosphere engine")}
                          description={t("Choose a background engine, preview it, then apply it when ready.")}
                          value={pendingAtmosphere}
                          options={ATMOSPHERE_ENGINES.map((engine) => ({ value: engine.id, label: engine.label }))}
                          onChange={(value) => {
                            setPendingAtmosphere(value as GradientStyle);
                            setPreviewedAtmosphere(null);
                            onPreviewAtmosphere(null);
                          }}
                        />
                        <div className="-mt-2 flex flex-col gap-3 border-b border-[var(--border)] pb-4 sm:flex-row sm:items-center sm:justify-between">
                          <p className="max-w-md text-xs leading-relaxed text-[var(--txt-muted)]" aria-live="polite">
                            {previewedAtmosphere
                              ? t("Temporary preview active. Apply to save this background.")
                              : t("Your current background stays active until you apply a preview.")}
                          </p>
                          <div className="flex shrink-0 flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewedAtmosphere(pendingAtmosphere);
                                onPreviewAtmosphere(pendingAtmosphere);
                              }}
                              className="min-h-10 rounded-xl border border-[var(--border-hover)] px-4 text-sm font-medium text-[var(--txt)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                            >{t("Preview")}</button>
                            {previewedAtmosphere && (
                              <button
                                type="button"
                                onClick={() => {
                                  const next = { ...settings, gradientStyle: previewedAtmosphere };
                                  if (onChange(next)) {
                                    setStatus(t("Saved locally"));
                                    onPreviewAtmosphere(null);
                                    setPreviewedAtmosphere(null);
                                  } else {
                                    setStatus(t("Could not save. Check browser storage and try again."));
                                  }
                                }}
                                className="min-h-10 rounded-xl bg-[var(--accent)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent-b)]"
                              >{t("Apply background")}</button>
                            )}
                            {previewedAtmosphere && (
                              <button
                                type="button"
                                onClick={() => {
                                  setPreviewedAtmosphere(null);
                                  onPreviewAtmosphere(null);
                                }}
                                className="min-h-10 rounded-xl px-3 text-sm text-[var(--txt-dim)] transition-colors hover:bg-[var(--surface-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                              >{t("Cancel preview")}</button>
                            )}
                          </div>
                        </div>
                        <SwitchRow
                          id="auto-theme"
                          title={t("Rotate palette on each visit")}
                          description={t("Choose a different registered palette when the app opens. Selecting a palette turns this off so your choice stays selected.")}
                          checked={settings.autoTheme}
                          onCheckedChange={(value) => changeSetting("autoTheme", value)}
                        />
                      </section>
                    </div>
                  )}

                  {activeSection === "personalization" && (
                    <div className="space-y-5">
                      <SelectRow
                        id="response-tone"
                        label={t("Response tone")}
                        description={t("This tone is sent with new requests and shapes the assistant response.")}
                        value={settings.tone}
                        options={Object.values(TONES).map((tone) => ({ value: tone.id, label: `${tone.label} — ${tone.desc}` }))}
                        onChange={(value) => changeSetting("tone", value as RadianceSettings["tone"])}
                      />
                      <SelectRow
                        id="response-language-setting"
                        label={t("Interface and response language")}
                        description={t("Changes the interface language and the language requested for AI responses.")}
                        value={settings.language}
                        options={[
                          { value: "en", label: "English" },
                          { value: "hi", label: "हिन्दी" },
                          { value: "es", label: "Español" },
                          { value: "fr", label: "Français" },
                          { value: "de", label: "Deutsch" },
                          { value: "pt", label: "Português" },
                          { value: "ja", label: "日本語" },
                        ]}
                        onChange={(value) => changeSetting("language", value as RadianceSettings["language"])}
                      />
                      <section id="custom-instructions" className="border-t border-[var(--border)] pt-5">
                        <div className="mb-3">
                          <label htmlFor="custom-instructions-input" className="text-sm font-semibold text-[var(--txt)]">{t("Custom instructions")}</label>
                          <p className="mt-1 text-xs leading-relaxed text-[var(--txt-muted)]">{t("A personal preference included with your AI request. Radiance keeps its own system and safety instructions authoritative.")}</p>
                        </div>
                        <textarea
                          id="custom-instructions-input"
                          aria-label={t("Custom instructions")}
                          maxLength={2000}
                          rows={5}
                          value={instructionsDraft}
                          onChange={(event) => setInstructionsDraft(event.target.value)}
                          className="w-full resize-y rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 text-sm leading-relaxed text-[var(--txt)] placeholder:text-[var(--txt-muted)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]"
                          placeholder={t("For example: Use metric units and explain unfamiliar terms.")}
                        />
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <span className="text-xs text-[var(--txt-muted)]">{instructionsDraft.length} / 2,000 characters</span>
                          <button
                            type="button"
                            onClick={() => changeSetting("customInstructions", instructionsDraft.trim())}
                            disabled={instructionsDraft.length > 2000}
                            className="min-h-10 rounded-xl bg-[var(--accent)] px-4 text-sm font-medium text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                          >{t("Save instructions")}</button>
                        </div>
                      </section>
                    </div>
                  )}

                  {activeSection === "models" && (
                    <div id="default-model" className="space-y-3">
                      <h3 className="text-sm font-semibold text-[var(--txt)]">{t("Default model")}</h3>
                      <p className="text-xs leading-relaxed text-[var(--txt-muted)]">{t("Used for new requests unless you choose another model in the composer. Provider credentials remain server-side; availability depends on deployment configuration.")}</p>
                      <div className="overflow-hidden rounded-2xl border border-[var(--border)]">
                        {AVAILABLE_MODELS.filter((model) => model.status === "active").map((model) => (
                          <label key={model.id} className="flex min-h-[68px] cursor-pointer items-center gap-3 border-b border-[var(--border)] px-4 last:border-0 hover:bg-[var(--surface)]">
                            <input
                              type="radio"
                              name="default-model"
                              value={model.id}
                              checked={settings.modelId === model.id}
                              onChange={() => changeSetting("modelId", model.id)}
                              className="h-4 w-4 accent-[var(--accent)]"
                            />
                            <span className="min-w-0 flex-1">
                              <span className="block text-sm font-medium text-[var(--txt)]">{model.name}</span>
                              <span className="mt-0.5 block text-xs text-[var(--txt-muted)]">{model.provider} · {model.sub}</span>
                            </span>
                            <span className="hidden text-xs text-[var(--accent-b)] sm:block">{t(model.supportsVision || model.supportsPdf ? "Multimodal" : "Text")}</span>
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {activeSection === "personal-intelligence" && (
                    <PersonalIntelligenceCenter language={language} profile={intelligenceProfile} onChange={onIntelligenceProfileChange} />
                  )}

                  {activeSection === "composer" && (
                    <div>
                      <SwitchRow
                        id="enter-to-send"
                        title={t("Enter sends a message")}
                        description={t("When off, Enter inserts a line and Ctrl/Cmd+Enter sends. Shift+Enter always inserts a line.")}
                        checked={settings.enterToSend}
                        onCheckedChange={(value) => changeSetting("enterToSend", value)}
                      />
                    </div>
                  )}

                  {activeSection === "data" && (
                    <div className="space-y-4">
                      <section id="export-conversations" className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--txt)]">{t("Export conversations")}</h3>
                          <p className="mt-1 text-xs text-[var(--txt-muted)]">{t("Download {count} locally available conversation(s) as a JSON file.", { count: conversationCount })}</p>
                        </div>
                        <button type="button" onClick={() => setStatus(t(onExportConversations() ? "Conversation export downloaded" : "No conversations were available to export"))} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm text-[var(--txt)] transition-colors hover:bg-[var(--surface-hover)]">
                          <Download className="h-4 w-4" />{t("Export")}
                        </button>
                      </section>
                      <section id="clear-conversations" className="flex flex-col gap-4 rounded-2xl border border-[var(--danger)]/25 bg-[var(--danger-d)]/30 p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--txt)]">{t("Clear conversation history")}</h3>
                          <p className="mt-1 text-xs leading-relaxed text-[var(--txt-muted)]">{t("Deletes local conversation records. This cannot be undone and does not reset your preferences.")}</p>
                        </div>
                        <button type="button" disabled={conversationCount === 0} onClick={(event) => { confirmationTriggerRef.current = event.currentTarget; setConfirmation("clear"); }} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--danger)]/40 px-4 text-sm text-[var(--danger)] transition-colors hover:bg-[var(--danger-d)] disabled:cursor-not-allowed disabled:opacity-45">
                          <Trash2 className="h-4 w-4" />{t("Clear history")}
                        </button>
                      </section>
                      <section id="reset-settings" className="flex flex-col gap-4 rounded-2xl border border-[var(--border)] p-4 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <h3 className="text-sm font-semibold text-[var(--txt)]">{t("Reset settings")}</h3>
                          <p className="mt-1 text-xs leading-relaxed text-[var(--txt-muted)]">{t("Restore preference defaults. Conversations and other local data are kept.")}</p>
                        </div>
                        <button type="button" onClick={(event) => { confirmationTriggerRef.current = event.currentTarget; setConfirmation("reset"); }} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-xl border border-[var(--border)] px-4 text-sm text-[var(--txt-dim)] transition-colors hover:bg-[var(--surface-hover)] hover:text-[var(--txt)]">
                          <RotateCcw className="h-4 w-4" />{t("Reset settings")}
                        </button>
                      </section>
                    </div>
                  )}

                  {activeSection === "about" && (
                    <div id="application-version" className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5">
                      <div className="font-serif text-xl font-semibold text-[var(--txt)]">RADIANCE</div>
                      <p className="mt-2 text-sm text-[var(--txt-dim)]">{t("Illuminate what is possible.")}</p>
                      <dl className="mt-5 divide-y divide-[var(--border)] border-y border-[var(--border)]">
                        <div className="flex min-h-12 items-center justify-between gap-3 text-sm"><dt className="text-[var(--txt-muted)]">{t("Version")}</dt><dd className="font-mono text-xs text-[var(--txt)]">{APP_VERSION}</dd></div>
                        <div className="flex min-h-12 items-center justify-between gap-3 text-sm"><dt className="text-[var(--txt-muted)]">{t("Session")}</dt><dd className="text-[var(--txt)]">{t("Local browser")}</dd></div>
                      </dl>
                    </div>
                  )}
                </motion.section>
              </AnimatePresence>

              <div role="status" aria-live="polite" className="pointer-events-none sticky bottom-0 min-h-6 bg-gradient-to-t from-[var(--deep)] via-[var(--deep)]/95 to-transparent pt-2 text-xs text-[var(--accent-b)]">{status}</div>
            </div>
          </div>

          {confirmation && (
            <div className="absolute inset-0 z-[70] flex items-center justify-center bg-black/65 p-4" onMouseDown={(event) => event.target === event.currentTarget && setConfirmation(null)}>
              <div role="alertdialog" aria-modal="true" aria-labelledby="confirmation-title" aria-describedby="confirmation-description" className="w-full max-w-md rounded-2xl border border-[var(--border-hover)] bg-[var(--surface-overlay)] p-5 shadow-modal">
                <h2 id="confirmation-title" className="font-serif text-xl font-semibold text-[var(--txt)]">{t(confirmation === "reset" ? "Reset settings?" : "Clear conversation history?")}</h2>
                <p id="confirmation-description" className="mt-2 text-sm leading-relaxed text-[var(--txt-muted)]">
                  {confirmation === "reset"
                    ? t("Appearance, model, tone, language, composer and instruction preferences return to their defaults. Conversations are kept.")
                    : t("This permanently removes {count} locally stored conversation(s). Settings are kept.", { count: conversationCount })}
                </p>
                <div className="mt-6 flex justify-end gap-2">
                  <button type="button" disabled={pending} onClick={() => setConfirmation(null)} className="min-h-11 rounded-xl px-4 text-sm text-[var(--txt-dim)] hover:bg-[var(--surface-hover)]">{t("Cancel")}</button>
                  <button ref={confirmButtonRef} type="button" disabled={pending} onClick={runConfirmation} className={`min-h-11 rounded-xl px-4 text-sm font-medium text-white disabled:opacity-60 ${confirmation === "clear" ? "bg-[var(--danger)] hover:opacity-90" : "bg-[var(--accent)] hover:opacity-90"}`}>
                    {pending ? t("Working…") : confirmation === "reset" ? t("Reset preferences") : t("Clear conversations")}
                  </button>
                </div>
              </div>
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function sectionDescription(section: SectionId): string {
  switch (section) {
    case "general": return "Keyboard access and the current session’s storage behavior.";
    case "appearance": return "Curate the color and atmospheric rendering used across your workspace.";
    case "personalization": return "Set the response style and preferences sent with new AI requests.";
    case "personal-intelligence": return "Review the notes and explicit response preferences stored in this browser, and control what is shared with an AI provider.";
    case "models": return "Choose the default registered model for your next request.";
    case "composer": return "Adjust how the message composer handles the Enter key.";
    case "data": return "Export or remove local conversation data and reset preferences independently.";
    case "about": return "Application identity and verified build version.";
  }
}
