'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';

export type ThemeMode = 'dark' | 'light';
export type ComposerMode = 'Plan' | 'Ask' | 'Build';
export type EffortLevel = 'Low' | 'Medium' | 'High' | 'Max';
type ProviderType = 'kimi' | 'openai' | 'spark';
type ModelFilterTab = 'fav' | 'all';

export interface AIComposerSubmission {
  prompt: string;
  mode: ComposerMode;
  modelId: string;
  modelName: string;
  effort: EffortLevel;
  autoMode: boolean;
  attachedFiles: string[];
  files: File[];
}

export interface AIComposerProps {
  /** Theme applied on mount and whenever the demo/control prop changes. */
  initialTheme?: ThemeMode;
  /** Show the optional upgrade banner below the composer. */
  showUpgradeBanner?: boolean;
  /** Show the interactive walkthrough button. */
  showWalkthroughControl?: boolean;
  /** Receives the prompt and selected browser File objects; connect this to your own AI backend. */
  onSubmit?: (submission: AIComposerSubmission) => void;
}

interface ModelOption {
  id: string;
  name: string;
  effort: EffortLevel;
  provider: ProviderType;
  isFav: boolean;
  efforts: EffortLevel[];
}

interface ContextTagOption {
  tag: string;
  category: string;
}

const INITIAL_MODELS: ModelOption[] = [
  {
    id: 'kimi-k3',
    name: 'Kimi K3',
    effort: 'High',
    provider: 'kimi',
    isFav: false,
    efforts: ['Low', 'Medium', 'High', 'Max'],
  },
  {
    id: 'gpt-56-terra',
    name: 'GPT-5.6 Terra',
    effort: 'Medium',
    provider: 'openai',
    isFav: false,
    efforts: ['Low', 'Medium', 'High', 'Max'],
  },
  {
    id: 'gpt-56-sol',
    name: 'GPT-5.6 Sol',
    effort: 'Medium',
    provider: 'openai',
    isFav: false,
    efforts: ['Low', 'Medium', 'High', 'Max'],
  },
  {
    id: 'sonnet-5',
    name: 'Sonnet 5',
    effort: 'High',
    provider: 'spark',
    isFav: true,
    efforts: ['Low', 'Medium', 'High', 'Max'],
  },
  {
    id: 'opus-48',
    name: 'Opus 4.8',
    effort: 'High',
    provider: 'spark',
    isFav: false,
    efforts: ['Low', 'Medium', 'High', 'Max'],
  },
  {
    id: 'fable-5',
    name: 'Fable 5',
    effort: 'High',
    provider: 'spark',
    isFav: true,
    efforts: ['Medium', 'High', 'Max'],
  },
];

const CONTEXT_OPTIONS: ContextTagOption[] = [
  { tag: '@codebase', category: 'Workspace' },
  { tag: '@docs', category: 'References' },
  { tag: '@terminal', category: 'Last output' },
];

const ALL_MODES: ComposerMode[] = ['Plan', 'Ask', 'Build'];

function ProviderBadgeIcon({ provider }: { provider: ProviderType }) {
  if (provider === 'kimi') {
    return (
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <path
          d="M4.2 3.2V12.8M4.2 8.2L10.4 3.2M6.8 6.2L11.2 12.8"
          stroke="#F4F4F6"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12.2" cy="4.2" r="1.15" fill="#F4F4F6" />
      </svg>
    );
  }

  if (provider === 'openai') {
    return (
      <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
        <path
          d="M21.2 10.1c.2-1.5-.2-3.1-1.2-4.3-1.3-1.6-3.4-2.3-5.4-1.8-.9-1.1-2.3-1.8-3.8-1.8-2.1 0-3.9 1.3-4.6 3.2-1.5.3-2.8 1.2-3.6 2.5-1 1.8-.9 4 .2 5.7-.2 1.5.2 3.1 1.2 4.3 1.3 1.6 3.4 2.3 5.4 1.8.9 1.1 2.3 1.8 3.8 1.8 2.1 0 3.9-1.3 4.6-3.2 1.5-.3 2.8-1.2 3.6-2.5 1.1-1.8 1-4-.2-5.7z"
          stroke="#F4F4F6"
          strokeWidth="1.65"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle cx="12" cy="12" r="2.7" stroke="#F4F4F6" strokeWidth="1.5" />
      </svg>
    );
  }

  return (
    <svg width="15" height="15" viewBox="0 0 18 18" fill="none">
      <g stroke="#E87B58" strokeWidth="1.35" strokeLinecap="round">
        <line x1="9" y1="2.2" x2="9" y2="15.8" />
        <line x1="2.2" y1="9" x2="15.8" y2="9" />
        <line x1="4.1" y1="4.1" x2="13.9" y2="13.9" />
        <line x1="13.9" y1="4.1" x2="4.1" y2="13.9" />
        <line x1="6.4" y1="2.7" x2="11.6" y2="15.3" />
        <line x1="2.7" y1="6.4" x2="15.3" y2="11.6" />
      </g>
      <circle cx="9" cy="9" r="1.4" fill="#18181c" />
    </svg>
  );
}

function CheckmarkIcon() {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 16 16"
      fill="none"
      className="flex-shrink-0"
      style={{ color: 'var(--text-primary)' }}
    >
      <path
        d="M3.2 8.5L6.5 11.8L13 4.5"
        stroke="currentColor"
        strokeWidth="1.65"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function AIComposer({
  initialTheme,
  showUpgradeBanner = true,
  showWalkthroughControl = true,
  onSubmit,
}: AIComposerProps = {}) {
  const [theme, setThemeState] = useState<ThemeMode>(initialTheme ?? 'dark');
  const [promptText, setPromptText] = useState<string>('');
  const [mode, setMode] = useState<ComposerMode>('Build');
  const [modeMenuOpen, setModeMenuOpen] = useState<boolean>(false);

  const [autoMode, setAutoMode] = useState<boolean>(false);
  const [modelMenuOpen, setModelMenuOpen] = useState<boolean>(false);
  const [searchRevealed, setSearchRevealed] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [modelFilterTab, setModelFilterTab] = useState<ModelFilterTab>('fav');
  const [models, setModels] = useState<ModelOption[]>(INITIAL_MODELS);
  const [activeModelId, setActiveModelId] = useState<string>('fable-5');
  const [hoveredModelId, setHoveredModelId] = useState<string | null>(null);
  const [modelMenuPointerReady, setModelMenuPointerReady] = useState<boolean>(false);

  const [attachedFiles, setAttachedFiles] = useState<string[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);

  const [bannerDismissed, setBannerDismissed] = useState<boolean>(false);
  const [proModalOpen, setProModalOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [contextMenuOpen, setContextMenuOpen] = useState<boolean>(false);

  // Walkthrough tour state
  const [isPlayingTour, setIsPlayingTour] = useState<boolean>(false);
  const [tourExpandAddFiles, setTourExpandAddFiles] = useState<boolean>(false);
  const [tourExpandRecord, setTourExpandRecord] = useState<boolean>(false);
  const [tourHoverAutoPill, setTourHoverAutoPill] = useState<boolean>(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const promptInputRef = useRef<HTMLTextAreaElement | null>(null);
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const isHoveringModelRowRef = useRef<boolean>(false);
  const isHoveringEffortMenuRef = useRef<boolean>(false);
  const hideEffortTimerRef = useRef<number | null>(null);
  const tourTimersRef = useRef<number[]>([]);

  // Load saved preferences from localStorage on mount
  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('ai_composer_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
      }
      const savedFavs = localStorage.getItem('ai_composer_fav_models');
      if (savedFavs) {
        const parsed: unknown = JSON.parse(savedFavs);
        if (Array.isArray(parsed)) {
          setModels((prev) =>
            prev.map((m) => ({
              ...m,
              isFav: parsed.includes(m.id),
            }))
          );
        }
      }
    } catch {
      // Ignore storage access errors in sandboxed iframes
    }
  }, []);

  useEffect(() => {
    if (initialTheme) setThemeState(initialTheme);
  }, [initialTheme]);

  const setTheme = useCallback((nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
    try {
      localStorage.setItem('ai_composer_theme', nextTheme);
    } catch {
      // Ignore storage errors
    }
  }, []);

  // Recording interval
  useEffect(() => {
    if (!isRecording) return;
    const intervalId = window.setInterval(() => {
      setRecordingSeconds((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(intervalId);
  }, [isRecording]);

  // Global click-outside handler to close open popovers
  useEffect(() => {
    const handleGlobalClick = () => {
      setModeMenuOpen(false);
      setModelMenuOpen(false);
      setHoveredModelId(null);
      setContextMenuOpen(false);
    };
    window.addEventListener('click', handleGlobalClick);
    return () => window.removeEventListener('click', handleGlobalClick);
  }, []);

  const clearHideEffortTimeout = useCallback(() => {
    if (hideEffortTimerRef.current !== null) {
      window.clearTimeout(hideEffortTimerRef.current);
      hideEffortTimerRef.current = null;
    }
  }, []);

  const scheduleHideEffortSubmenu = useCallback(() => {
    clearHideEffortTimeout();
    hideEffortTimerRef.current = window.setTimeout(() => {
      if (!isHoveringEffortMenuRef.current && !isHoveringModelRowRef.current) {
        setHoveredModelId(null);
      }
    }, 60);
  }, [clearHideEffortTimeout]);

  // Ordered modes so the active mode is always anchored at the bottom with a checkmark (00:07 & 00:11)
  const orderedModes = useMemo(() => {
    const inactive = ALL_MODES.filter((m) => m !== mode);
    return [...inactive, mode];
  }, [mode]);

  const activeModel = useMemo(
    () => models.find((m) => m.id === activeModelId) || models[5],
    [models, activeModelId]
  );

  const favCount = useMemo(() => models.filter((m) => m.isFav).length, [models]);

  const visibleModels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return models.filter((m) => {
      const matchesTab = modelFilterTab === 'fav' ? m.isFav : true;
      const matchesSearch =
        m.name.toLowerCase().includes(q) || m.effort.toLowerCase().includes(q);
      return matchesTab && matchesSearch;
    });
  }, [models, modelFilterTab, searchQuery]);

  const hoveredModel = useMemo(
    () => (hoveredModelId ? models.find((m) => m.id === hoveredModelId) || null : null),
    [models, hoveredModelId]
  );

  // Calculate vertical bottom offset so the Effort submenu tracks the hovered model row (0:13 to 0:15)
  const effortBottomOffsetPx = useMemo(() => {
    if (!hoveredModelId) return 0;
    const idx = visibleModels.findIndex((m) => m.id === hoveredModelId);
    if (idx < 0) return 0;
    const rowsFromBottom = visibleModels.length - 1 - idx;
    return rowsFromBottom <= 1 ? 0 : Math.min(96, (rowsFromBottom - 1) * 24);
  }, [visibleModels, hoveredModelId]);

  const isEffortMenuVisible =
    modelMenuOpen && searchQuery.trim().length === 0 && hoveredModel !== null;

  const handleToggleFavStar = (e: React.MouseEvent, targetId: string) => {
    e.stopPropagation();
    setModels((prev) => {
      const updated = prev.map((m) => {
        if (m.id !== targetId) return m;
        return { ...m, isFav: !m.isFav };
      });
      const targetAfter = updated.find((m) => m.id === targetId);
      if (targetAfter?.isFav) {
        setActiveModelId(targetId);
        setAutoMode(false);
      }
      try {
        const favIds = updated.filter((m) => m.isFav).map((m) => m.id);
        localStorage.setItem('ai_composer_fav_models', JSON.stringify(favIds));
      } catch {
        // Ignore storage errors
      }
      return updated;
    });
  };

  const handleSelectModel = (e: React.MouseEvent, modelId: string) => {
    e.stopPropagation();
    setActiveModelId(modelId);
    setAutoMode(false);
    setModelMenuOpen(false);
    setHoveredModelId(null);
  };

  const handleSelectEffort = (e: React.MouseEvent, effort: EffortLevel) => {
    e.stopPropagation();
    if (!hoveredModelId) return;
    setModels((prev) =>
      prev.map((m) => (m.id === hoveredModelId ? { ...m, effort } : m))
    );
    setActiveModelId(hoveredModelId);
    setAutoMode(false);
  };

  const handleOpenModelMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    setModeMenuOpen(false);
    setContextMenuOpen(false);

    const nextOpen = !modelMenuOpen;
    setModelMenuOpen(nextOpen);
    if (nextOpen) {
      setModelFilterTab('fav');
      setHoveredModelId(null);
      setModelMenuPointerReady(false);
      setSearchRevealed(false);
      setSearchQuery('');
      window.setTimeout(() => {
        setSearchRevealed(true);
      }, 160);
    }
  };

  const handleToggleAutoInMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextAuto = !autoMode;
    setAutoMode(nextAuto);
    if (nextAuto) {
      window.setTimeout(() => {
        setModelMenuOpen(false);
        setHoveredModelId(null);
      }, 180);
    }
  };

  const handlePromptChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setPromptText(val);
    setContextMenuOpen(val.endsWith('@'));
  };

  const handleInsertContextTag = (e: React.MouseEvent, tag: string) => {
    e.stopPropagation();
    setPromptText((prev) => prev.replace(/@$/, `${tag} `));
    setContextMenuOpen(false);
    promptInputRef.current?.focus();
  };

  const handleRecordClick = () => {
    if (!isRecording) {
      setRecordingSeconds(0);
      setIsRecording(true);
    } else {
      setIsRecording(false);
      if (!promptText.trim()) {
        setPromptText('Refactor @codebase authentication middleware and add unit tests');
      }
    }
  };

  const handleSubmitPrompt = () => {
    if (isRecording) setIsRecording(false);

    const trimmed = promptText.trim();
    if (!trimmed && attachedFiles.length === 0) {
      setToastMessage('Enter a prompt or attach a file to continue.');
      return;
    }

    const routingLabel = autoMode
      ? 'Auto Router'
      : `${activeModel.name} (${activeModel.effort})`;
    const submission: AIComposerSubmission = {
      prompt: trimmed,
      mode,
      modelId: activeModel.id,
      modelName: activeModel.name,
      effort: activeModel.effort,
      autoMode,
      attachedFiles: [...attachedFiles],
      files: [...selectedFiles],
    };

    try {
      onSubmit?.(submission);
      setToastMessage(
        onSubmit
          ? `[${mode} · ${routingLabel}] Request passed to the onSubmit handler.`
          : `[${mode} · ${routingLabel}] UI demo only — connect onSubmit to execute this prompt.`
      );
    } catch {
      setToastMessage('The onSubmit handler failed. Check your integration and try again.');
      return;
    }

    setPromptText('');
    setAttachedFiles([]);
    setSelectedFiles([]);
    setContextMenuOpen(false);
  };

  const clearWalkthroughTimers = useCallback(() => {
    tourTimersRef.current.forEach((id) => window.clearTimeout(id));
    tourTimersRef.current = [];
    setIsPlayingTour(false);
    setTourExpandAddFiles(false);
    setTourExpandRecord(false);
    setTourHoverAutoPill(false);
  }, []);

  const runVideoWalkthrough = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isPlayingTour) {
      clearWalkthroughTimers();
      return;
    }

    clearWalkthroughTimers();
    setIsPlayingTour(true);

    // Reset state to 00:00 of the video
    setMode('Build');
    setModeMenuOpen(false);
    setAutoMode(false);
    setModelMenuOpen(false);
    setActiveModelId('fable-5');
    setHoveredModelId(null);
    setSearchQuery('');
    setSearchRevealed(false);

    const schedule = (fn: () => void, delayMs: number) => {
      const timerId = window.setTimeout(fn, delayMs);
      tourTimersRef.current.push(timerId);
    };

    // 00:02 - Expand "+ Add files"
    schedule(() => setTourExpandAddFiles(true), 600);
    schedule(() => setTourExpandAddFiles(false), 1900);

    // 00:06 - Open Mode selector ("Build v") -> switch to "Plan" -> switch back to "Build"
    schedule(() => setModeMenuOpen(true), 2400);
    schedule(() => {
      setMode('Plan');
      setModeMenuOpen(false);
    }, 3500);
    schedule(() => setModeMenuOpen(true), 4400);
    schedule(() => {
      setMode('Build');
      setModeMenuOpen(false);
    }, 5400);

    // 00:13.2 - Open Model selector ("Fable 5 High v"), show all models in tour, reveal Search bar & hover Fable 5
    schedule(() => {
      setModelMenuOpen(true);
      setModelFilterTab('all');
      setHoveredModelId('fable-5');
      setSearchRevealed(false);
    }, 6100);

    schedule(() => {
      setSearchRevealed(true);
    }, 6350);

    // 00:14.2 - Glide cursor up over Opus 4.8 -> GPT-5.6 Sol -> Kimi K3 (Effort submenu glides vertically)
    schedule(() => setHoveredModelId('opus-48'), 6900);
    schedule(() => setHoveredModelId('gpt-56-sol'), 7350);
    schedule(() => setHoveredModelId('kimi-k3'), 7800);

    // 00:15.2 - Move cursor up to "Search models" -> Effort submenu hides & model highlight clears
    schedule(() => {
      setHoveredModelId(null);
      searchInputRef.current?.focus();
    }, 8350);

    // 00:17.0 - Type "so" in Search models
    schedule(() => setSearchQuery('so'), 9100);

    // 00:19.0 - Clear search
    schedule(() => {
      setSearchQuery('');
      setHoveredModelId('fable-5');
    }, 10300);

    // 00:21.0 - Toggle "Auto" ON
    schedule(() => setAutoMode(true), 11400);
    schedule(() => {
      setModelMenuOpen(false);
      setHoveredModelId(null);
    }, 11900);

    // 00:24.0 - Hover "Auto v" to reveal inline blue toggle
    schedule(() => setTourHoverAutoPill(true), 12800);

    // 00:25.0 - Click inline toggle to return to "Fable 5 High v"
    schedule(() => {
      setTourHoverAutoPill(false);
      setAutoMode(false);
    }, 14100);

    // 00:27.0 - Hover Microphone button to expand "Record"
    schedule(() => setTourExpandRecord(true), 15000);
    schedule(() => {
      setTourExpandRecord(false);
      setIsPlayingTour(false);
    }, 16500);
  };

  const formattedRecordingTime = useMemo(() => {
    const mins = Math.floor(recordingSeconds / 60);
    const secs = String(recordingSeconds % 60).padStart(2, '0');
    return `${mins}:${secs}`;
  }, [recordingSeconds]);

  const isSubmitReady = promptText.trim().length > 0 || attachedFiles.length > 0;

  return (
    <div
      data-theme={theme}
      aria-label="AI prompt composer"
      className="aic-root min-h-screen w-full flex flex-col items-center justify-center p-4 sm:p-8 select-none overflow-x-hidden"
      style={{
        backgroundColor: 'var(--bg-canvas)',
        color: 'var(--text-primary)',
        fontFamily:
          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        fontFeatureSettings: "'cv02', 'cv03', 'cv04', 'cv11'",
        transition: 'background-color 0.28s ease, color 0.22s ease',
      }}
    >
      <style>{`
        .aic-root[data-theme="dark"] {
          --bg-canvas: #3e3c44;
          --card-bg: #18181c;
          --card-border: rgba(255, 255, 255, 0.065);
          --card-focus-border: rgba(255, 255, 255, 0.12);
          --card-shadow: 0 20px 45px -15px rgba(0, 0, 0, 0.45), 0 1px 0 0 rgba(255, 255, 255, 0.05) inset;

          --pill-bg: #26262c;
          --pill-hover-bg: #2d2d34;
          --pill-border: rgba(255, 255, 255, 0.095);
          --pill-hover-border: rgba(255, 255, 255, 0.15);
          --pill-inset: 0 1px 0 0 rgba(255, 255, 255, 0.05) inset;

          --ghost-hover-bg: rgba(255, 255, 255, 0.045);
          --ghost-hover-border: rgba(255, 255, 255, 0.075);

          --popover-bg-start: #2b2b33;
          --popover-bg-end: #1f1f25;
          --popover-border: rgba(255, 255, 255, 0.12);
          --popover-shadow: 0 22px 48px -10px rgba(0, 0, 0, 0.65), 0 1px 0 0 rgba(255, 255, 255, 0.08) inset;
          --menu-item-hover: rgba(255, 255, 255, 0.065);
          --model-row-hover: rgba(14, 14, 18, 0.68);

          --filter-track-bg: rgba(12, 12, 16, 0.48);
          --filter-track-border: rgba(255, 255, 255, 0.06);
          --filter-active-bg: #2c2c35;
          --filter-active-border: rgba(255, 255, 255, 0.11);
          --filter-active-shadow: 0 2px 6px rgba(0, 0, 0, 0.28);

          --text-primary: #f4f4f6;
          --text-secondary: #8e8d95;
          --text-muted: #6e6d76;
          --placeholder-color: #8c8b93;
          --icon-primary: #e4e4e8;
          --chevron-color: #9e9da6;
          --effort-header: #d4d4d8;

          --submit-bg: #222227;
          --submit-border: rgba(255, 255, 255, 0.08);
          --submit-color: #7c7b84;
          --submit-ready-bg: #2d2d35;
          --submit-ready-border: rgba(255, 255, 255, 0.16);
          --submit-ready-color: #f4f4f6;

          --switch-off-bg: #484852;
          --accent-blue: #1d74f5;
          --accent-coral: #e87b58;

          --pro-banner-bg:
            radial-gradient(ellipse 52% 130% at 81% 50%, rgba(58, 126, 86, 0.56) 0%, rgba(34, 78, 52, 0.32) 48%, rgba(24, 24, 28, 0.96) 85%),
            #18181c;
          --pro-banner-border: rgba(255, 255, 255, 0.065);
          --pro-banner-shadow: 0 14px 32px -12px rgba(0, 0, 0, 0.4), -1px 0 0 0 rgba(120, 200, 150, 0.22) inset;
          --pro-banner-mask: linear-gradient(90deg, rgba(255,255,255,0.04) 0%, rgba(255,255,255,0.05) 55%, rgba(126, 204, 155, 0.32) 85%, rgba(126, 204, 155, 0.18) 100%);
          --pro-link-color: #8da8ff;
          --pro-link-underline: rgba(141, 168, 255, 0.45);
          --pro-link-hover: #a8beff;
          --upgrade-btn-bg: rgba(96, 148, 114, 0.48);
          --upgrade-btn-border: rgba(168, 222, 186, 0.36);
          --upgrade-btn-text: #f4f4f6;
          --upgrade-btn-hover-bg: rgba(112, 168, 132, 0.65);
          --upgrade-btn-hover-border: rgba(190, 240, 205, 0.55);
          --dismiss-color: #a5b8ac;

          --toast-bg: rgba(30, 30, 36, 0.95);
          --toast-border: rgba(255, 255, 255, 0.1);
          --chip-bg: #24242b;
          --chip-border: rgba(255, 255, 255, 0.1);
          --floating-bar-bg: rgba(24, 24, 28, 0.82);
          --floating-bar-border: rgba(255, 255, 255, 0.1);
          --modal-bg: #1b1b21;
          --modal-border: rgba(255, 255, 255, 0.15);
        }

        .aic-root[data-theme="light"] {
          --bg-canvas: #ececef;
          --card-bg: #ffffff;
          --card-border: rgba(24, 24, 28, 0.085);
          --card-focus-border: rgba(24, 24, 28, 0.16);
          --card-shadow: 0 20px 44px -16px rgba(15, 23, 42, 0.09), 0 2px 8px -2px rgba(15, 23, 42, 0.04), 0 1px 0 0 rgba(255, 255, 255, 0.9) inset;

          --pill-bg: #f3f3f6;
          --pill-hover-bg: #eaeaf0;
          --pill-border: rgba(24, 24, 28, 0.09);
          --pill-hover-border: rgba(24, 24, 28, 0.16);
          --pill-inset: 0 1px 0 0 rgba(255, 255, 255, 0.8) inset;

          --ghost-hover-bg: rgba(24, 24, 28, 0.045);
          --ghost-hover-border: rgba(24, 24, 28, 0.08);

          --popover-bg-start: #ffffff;
          --popover-bg-end: #f7f7fa;
          --popover-border: rgba(24, 24, 28, 0.11);
          --popover-shadow: 0 22px 48px -12px rgba(15, 23, 42, 0.16), 0 4px 14px -4px rgba(15, 23, 42, 0.07), 0 1px 0 0 rgba(255, 255, 255, 0.9) inset;
          --menu-item-hover: rgba(24, 24, 28, 0.055);
          --model-row-hover: rgba(24, 24, 28, 0.065);

          --filter-track-bg: rgba(24, 24, 28, 0.055);
          --filter-track-border: rgba(24, 24, 28, 0.06);
          --filter-active-bg: #ffffff;
          --filter-active-border: rgba(24, 24, 28, 0.09);
          --filter-active-shadow: 0 1px 4px rgba(15, 23, 42, 0.08);

          --text-primary: #18181c;
          --text-secondary: #6c6b74;
          --text-muted: #94939d;
          --placeholder-color: #82818a;
          --icon-primary: #27272c;
          --chevron-color: #6c6b74;
          --effort-header: #52525b;

          --submit-bg: #f3f3f6;
          --submit-border: rgba(24, 24, 28, 0.085);
          --submit-color: #8e8d96;
          --submit-ready-bg: #18181c;
          --submit-ready-border: #18181c;
          --submit-ready-color: #ffffff;

          --switch-off-bg: #d0d0d8;
          --accent-blue: #1d74f5;
          --accent-coral: #e87b58;

          --pro-banner-bg:
            radial-gradient(ellipse 52% 130% at 81% 50%, rgba(52, 168, 108, 0.24) 0%, rgba(110, 205, 150, 0.12) 48%, rgba(255, 255, 255, 0.98) 85%),
            #ffffff;
          --pro-banner-border: rgba(24, 24, 28, 0.085);
          --pro-banner-shadow: 0 14px 32px -12px rgba(15, 23, 42, 0.08), -1px 0 0 0 rgba(45, 160, 100, 0.18) inset;
          --pro-banner-mask: linear-gradient(90deg, rgba(24,24,28,0.03) 0%, rgba(24,24,28,0.04) 55%, rgba(45, 160, 100, 0.32) 85%, rgba(45, 160, 100, 0.18) 100%);
          --pro-link-color: #3b63e6;
          --pro-link-underline: rgba(59, 99, 230, 0.4);
          --pro-link-hover: #1d4ed8;
          --upgrade-btn-bg: rgba(36, 138, 84, 0.15);
          --upgrade-btn-border: rgba(36, 138, 84, 0.35);
          --upgrade-btn-text: #145332;
          --upgrade-btn-hover-bg: rgba(36, 138, 84, 0.24);
          --upgrade-btn-hover-border: rgba(36, 138, 84, 0.5);
          --dismiss-color: #5b7667;

          --toast-bg: rgba(255, 255, 255, 0.95);
          --toast-border: rgba(24, 24, 28, 0.1);
          --chip-bg: #ffffff;
          --chip-border: rgba(24, 24, 28, 0.12);
          --floating-bar-bg: rgba(255, 255, 255, 0.88);
          --floating-bar-border: rgba(24, 24, 28, 0.1);
          --modal-bg: #ffffff;
          --modal-border: rgba(24, 24, 28, 0.12);
        }

        .aic-composer-card {
          position: relative;
          width: 100%;
          max-width: 596px;
          background: var(--card-bg);
          border-radius: 24px;
          border: 1px solid var(--card-border);
          box-shadow: var(--card-shadow);
          padding: 20px 18px 16px 18px;
          transition: background-color 0.25s ease, border-color 0.2s ease, box-shadow 0.25s ease;
        }

        .aic-composer-card:focus-within {
          border-color: var(--card-focus-border);
        }

        .aic-prompt-input {
          width: 100%;
          background: transparent;
          border: none;
          outline: none;
          resize: none;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 16px;
          line-height: 1.5;
          font-weight: 400;
          letter-spacing: -0.011em;
          min-height: 28px;
          max-height: 140px;
          padding: 0 2px;
          margin-bottom: 18px;
          user-select: text;
          transition: color 0.2s ease;
        }

        .aic-prompt-input::placeholder {
          color: var(--placeholder-color);
          opacity: 1;
        }

        .aic-pill-control {
          height: 38px;
          border-radius: 9999px;
          background: var(--pill-bg);
          border: 1px solid var(--pill-border);
          box-shadow: var(--pill-inset);
          color: var(--text-primary);
          font-family: inherit;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          position: relative;
          overflow: hidden;
          transition:
            width 0.28s cubic-bezier(0.22, 1, 0.36, 1),
            background-color 0.18s ease,
            border-color 0.18s ease,
            color 0.18s ease,
            transform 0.12s ease;
        }

        .aic-pill-control:hover {
          background: var(--pill-hover-bg);
          border-color: var(--pill-hover-border);
        }

        .aic-pill-control:active {
          transform: scale(0.98);
        }

        .aic-add-files-btn {
          width: 38px;
          padding: 0 10px;
          justify-content: flex-start;
        }

        .aic-add-files-btn:hover,
        .aic-add-files-btn.expanded {
          width: 116px;
          padding: 0 13px 0 11px;
        }

        .aic-add-files-label {
          opacity: 0;
          transform: translateX(-6px);
          white-space: nowrap;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.011em;
          margin-left: 7px;
          transition:
            opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }

        .aic-add-files-btn:hover .aic-add-files-label,
        .aic-add-files-btn.expanded .aic-add-files-label {
          opacity: 1;
          transform: translateX(0);
        }

        .aic-mode-btn {
          padding: 0 13px 0 15px;
          gap: 7px;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.011em;
        }

        .aic-mode-btn.menu-open .mode-btn-text {
          color: var(--text-muted);
        }

        .aic-model-trigger-btn {
          height: 38px;
          border-radius: 9999px;
          padding: 0 11px 0 7px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.011em;
          cursor: pointer;
          transition:
            background-color 0.2s ease,
            border-color 0.2s ease,
            color 0.2s ease,
            padding 0.24s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .aic-model-trigger-btn:hover {
          background: var(--ghost-hover-bg);
          border-color: var(--ghost-hover-border);
        }

        .aic-auto-trigger-btn {
          height: 38px;
          border-radius: 9999px;
          padding: 0 12px;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          background: transparent;
          border: 1px solid transparent;
          color: var(--text-primary);
          font-family: inherit;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.011em;
          cursor: pointer;
          transition: all 0.24s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .aic-auto-trigger-btn:hover,
        .aic-auto-trigger-btn.hovered-state {
          background: var(--pill-bg);
          border-color: var(--pill-border);
          box-shadow: var(--pill-inset);
          padding: 0 11px 0 14px;
          gap: 12px;
        }

        .aic-auto-trigger-btn .aic-auto-chevron {
          display: inline-flex;
        }

        .aic-auto-trigger-btn .aic-auto-inline-switch {
          display: none;
          align-items: center;
        }

        .aic-auto-trigger-btn:hover .aic-auto-chevron,
        .aic-auto-trigger-btn.hovered-state .aic-auto-chevron {
          display: none;
        }

        .aic-auto-trigger-btn:hover .aic-auto-inline-switch,
        .aic-auto-trigger-btn.hovered-state .aic-auto-inline-switch {
          display: inline-flex;
        }

        .aic-record-btn {
          width: 38px;
          padding: 0 10px;
          justify-content: flex-start;
        }

        .aic-record-btn:hover,
        .aic-record-btn.expanded,
        .aic-record-btn.recording {
          width: 105px;
          padding: 0 14px 0 11px;
        }

        .aic-record-btn.recording {
          background: rgba(239, 68, 68, 0.16);
          border-color: rgba(239, 68, 68, 0.45);
          color: #ef4444;
        }

        .aic-record-label {
          opacity: 0;
          transform: translateX(6px);
          white-space: nowrap;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.011em;
          margin-left: 7px;
          transition:
            opacity 0.2s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.24s cubic-bezier(0.22, 1, 0.36, 1);
          pointer-events: none;
        }

        .aic-record-btn:hover .aic-record-label,
        .aic-record-btn.expanded .aic-record-label,
        .aic-record-btn.recording .aic-record-label {
          opacity: 1;
          transform: translateX(0);
        }

        .aic-submit-btn {
          width: 38px;
          height: 38px;
          border-radius: 9999px;
          background: var(--submit-bg);
          border: 1px solid var(--submit-border);
          color: var(--submit-color);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .aic-submit-btn:hover,
        .aic-submit-btn.ready {
          background: var(--submit-ready-bg);
          border-color: var(--submit-ready-border);
          color: var(--submit-ready-color);
        }

        .aic-submit-btn:active {
          transform: scale(0.95);
        }

        .aic-glass-popover {
          background: linear-gradient(160deg, var(--popover-bg-start) 0%, var(--popover-bg-end) 100%);
          border: 1px solid var(--popover-border);
          box-shadow: var(--popover-shadow);
          backdrop-filter: blur(18px);
          -webkit-backdrop-filter: blur(18px);
          transform-origin: bottom left;
          transition:
            opacity 0.18s cubic-bezier(0.22, 1, 0.36, 1),
            transform 0.2s cubic-bezier(0.22, 1, 0.36, 1),
            bottom 0.18s cubic-bezier(0.22, 1, 0.36, 1),
            background 0.22s ease,
            border-color 0.22s ease;
        }

        .aic-popover-hidden {
          opacity: 0;
          transform: translateY(6px) scale(0.97);
          pointer-events: none;
        }

        .aic-popover-visible {
          opacity: 1;
          transform: translateY(0) scale(1);
          pointer-events: auto;
        }

        .aic-effort-submenu-bridge::before {
          content: "";
          position: absolute;
          top: -8px;
          bottom: -8px;
          left: -16px;
          width: 16px;
        }

        .aic-mode-menu-item {
          height: 36px;
          padding: 0 14px;
          border-radius: 11px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: inherit;
          font-size: 15px;
          font-weight: 500;
          letter-spacing: -0.011em;
          color: var(--text-primary);
          cursor: pointer;
          transition: background-color 0.14s ease, color 0.14s ease;
        }

        .aic-mode-menu-item:hover {
          background: var(--menu-item-hover);
        }

        /* Refined Segmented Filter Bar (fav / all) matching overall Inter UI typography */
        .aic-model-filter-bar {
          display: flex;
          align-items: center;
          padding: 2px;
          margin: 2px 6px 6px 6px;
          border-radius: 9999px;
          background: var(--filter-track-bg);
          border: 1px solid var(--filter-track-border);
        }

        .aic-model-filter-pill {
          flex: 1;
          height: 26px;
          padding: 0 10px;
          border-radius: 9999px;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 13.5px;
          font-weight: 500;
          letter-spacing: -0.012em;
          font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
          color: var(--text-secondary);
          background: transparent;
          border: 1px solid transparent;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 5px;
          cursor: pointer;
          transition:
            color 0.16s ease,
            background-color 0.18s cubic-bezier(0.22, 1, 0.36, 1),
            border-color 0.18s ease,
            box-shadow 0.18s ease;
        }

        .aic-model-filter-pill:hover {
          color: var(--text-primary);
        }

        .aic-model-filter-pill.active {
          color: var(--text-primary);
          background: var(--filter-active-bg);
          border-color: var(--filter-active-border);
          box-shadow: var(--filter-active-shadow);
        }

        .aic-fav-star-btn {
          width: 22px;
          height: 22px;
          border-radius: 9999px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          color: var(--text-muted);
          background: transparent;
          border: none;
          padding: 0;
          cursor: pointer;
          flex-shrink: 0;
          transition: transform 0.16s cubic-bezier(0.22, 1, 0.36, 1), color 0.16s ease;
        }

        .aic-fav-star-btn:hover {
          color: #facc15;
          transform: scale(1.16);
        }

        .aic-fav-star-btn.starred {
          color: #facc15;
        }

        .aic-fav-star-btn:active {
          transform: scale(0.9);
        }

        .aic-model-row {
          height: 38px;
          padding: 0 11px 0 6px;
          border-radius: 9999px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-family: inherit;
          letter-spacing: -0.011em;
          cursor: pointer;
          transition: background-color 0.14s ease;
        }

        .aic-model-row:hover,
        .aic-model-row.active-hover {
          background: var(--model-row-hover);
        }

        .aic-ios-switch {
          width: 40px;
          height: 23px;
          border-radius: 9999px;
          background: var(--switch-off-bg);
          padding: 2.5px;
          display: inline-flex;
          align-items: center;
          cursor: pointer;
          transition: background-color 0.2s ease;
          position: relative;
          flex-shrink: 0;
        }

        .aic-ios-switch.on {
          background: var(--accent-blue);
        }

        .aic-ios-switch-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #ffffff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.35);
          transform: translateX(0);
          transition: transform 0.22s cubic-bezier(0.22, 1, 0.36, 1);
        }

        .aic-ios-switch.on .aic-ios-switch-thumb {
          transform: translateX(17px);
        }

        .aic-pro-banner {
          width: 100%;
          max-width: 596px;
          margin-top: 12px;
          height: 52px;
          border-radius: 18px;
          padding: 0 16px 0 18px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--pro-banner-bg);
          border: 1px solid var(--pro-banner-border);
          box-shadow: var(--pro-banner-shadow);
          position: relative;
          overflow: hidden;
          transition: opacity 0.25s ease, transform 0.25s ease, background 0.25s ease;
        }

        .aic-pro-banner::after {
          content: "";
          position: absolute;
          inset: 0;
          border-radius: 18px;
          padding: 1px;
          background: var(--pro-banner-mask);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
        }

        .aic-pro-link {
          color: var(--pro-link-color);
          text-decoration: underline;
          text-decoration-color: var(--pro-link-underline);
          text-underline-offset: 3px;
          transition: color 0.15s ease, text-decoration-color 0.15s ease;
          cursor: pointer;
        }

        .aic-pro-link:hover {
          color: var(--pro-link-hover);
          text-decoration-color: var(--pro-link-hover);
        }

        .aic-upgrade-pill-btn {
          height: 32px;
          padding: 0 14px;
          border-radius: 9999px;
          background: var(--upgrade-btn-bg);
          border: 1px solid var(--upgrade-btn-border);
          box-shadow: 0 1px 0 0 rgba(255, 255, 255, 0.12) inset;
          color: var(--upgrade-btn-text);
          font-family: inherit;
          font-size: 14.5px;
          font-weight: 500;
          letter-spacing: -0.011em;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .aic-upgrade-pill-btn:hover {
          background: var(--upgrade-btn-hover-bg);
          border-color: var(--upgrade-btn-hover-border);
          transform: translateY(-0.5px);
        }

        .aic-search-row-wrap {
          overflow: hidden;
          max-height: 0;
          opacity: 0;
          transition:
            max-height 0.24s cubic-bezier(0.22, 1, 0.36, 1),
            opacity 0.2s ease,
            margin-bottom 0.2s ease;
          margin-bottom: 0;
        }

        .aic-search-row-wrap.revealed {
          max-height: 42px;
          opacity: 1;
          margin-bottom: 4px;
        }

        .aic-floating-control-pill {
          background: var(--floating-bar-bg);
          border: 1px solid var(--floating-bar-border);
          color: var(--text-primary);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transition: all 0.2s ease;
        }

        .aic-theme-segment-btn {
          padding: 4px 10px;
          border-radius: 9999px;
          font-family: inherit;
          font-size: 12px;
          font-weight: 500;
          letter-spacing: -0.01em;
          display: inline-flex;
          align-items: center;
          gap: 5px;
          color: var(--text-secondary);
          cursor: pointer;
          transition: all 0.18s ease;
        }

        .aic-theme-segment-btn.active {
          background: var(--pill-bg);
          color: var(--text-primary);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
        }

        @keyframes aicPulseDot {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.45; transform: scale(0.85); }
        }

        .aic-recording-dot {
          animation: aicPulseDot 1.2s infinite ease-in-out;
        }
      `}</style>

      {/* Hidden file input for "+ Add files" */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        multiple
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          if (files.length > 0) {
            setAttachedFiles((prev) => [...prev, ...files.map((f) => f.name)]);
            setSelectedFiles((prev) => [...prev, ...files]);
          }
          e.target.value = '';
        }}
      />

      {/* Main Workspace Container */}
      <main className="w-full max-w-[596px] flex flex-col items-center relative">
        {/* Submitted Prompt / Activity Toast */}
        {toastMessage && (
          <div
            role="status"
            aria-live="polite"
            className="w-full mb-3 px-4 py-3 rounded-[18px] shadow-xl flex items-center justify-between text-sm transition-all"
            style={{
              background: 'var(--toast-bg)',
              border: '1px solid var(--toast-border)',
              color: 'var(--text-primary)',
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
              <span className="truncate">{toastMessage}</span>
            </div>
            <button
              type="button"
              onClick={() => setToastMessage(null)}
              className="ml-3 text-xs px-2.5 py-1 rounded-full transition"
              style={{
                background: 'var(--pill-bg)',
                color: 'var(--text-secondary)',
              }}
            >
              Clear
            </button>
          </div>
        )}

        {/* Attached Context File Chips */}
        {attachedFiles.length > 0 && (
          <div className="w-full mb-2.5 flex flex-wrap gap-2">
            {attachedFiles.map((fileName, idx) => (
              <div
                key={`${fileName}-${idx}`}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs shadow-sm"
                style={{
                  background: 'var(--chip-bg)',
                  border: '1px solid var(--chip-border)',
                  color: 'var(--text-primary)',
                }}
              >
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <path
                    d="M9.5 2H4.5C3.67 2 3 2.67 3 3.5V12.5C3 13.33 3.67 14 4.5 14H11.5C12.33 14 13 13.33 13 12.5V5.5L9.5 2Z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                  />
                </svg>
                <span className="max-w-[160px] truncate">{fileName}</span>
                <button
                  type="button"
                  onClick={() => {
                    setAttachedFiles((prev) => prev.filter((_, i) => i !== idx));
                    setSelectedFiles((prev) => prev.filter((_, i) => i !== idx));
                  }}
                  className="opacity-70 hover:opacity-100 ml-0.5"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Primary Composer Card */}
        <section className="aic-composer-card">
          {/* @ Context Mention Popover */}
          <div
            className={`aic-glass-popover ${
              contextMenuOpen ? 'aic-popover-visible' : 'aic-popover-hidden'
            } absolute left-4 bottom-[74px] w-56 rounded-[16px] p-1.5 z-40`}
          >
            <div
              className="px-2.5 py-1 text-[11px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--text-secondary)' }}
            >
              Add Context
            </div>
            {CONTEXT_OPTIONS.map((item) => (
              <button
                key={item.tag}
                type="button"
                onClick={(e) => handleInsertContextTag(e, item.tag)}
                className="aic-mode-menu-item w-full text-left px-2.5 py-1.5 rounded-lg text-sm flex items-center justify-between"
              >
                <span>{item.tag}</span>
                <span className="text-xs" style={{ color: 'var(--text-secondary)' }}>
                  {item.category}
                </span>
              </button>
            ))}
          </div>

          {/* Prompt Textarea */}
          <textarea
            ref={promptInputRef}
            rows={1}
            value={promptText}
            onChange={handlePromptChange}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmitPrompt();
              }
            }}
            className="aic-prompt-input"
            placeholder="Plan, Build, Automate / @ for context"
            aria-label="Prompt input"
          />

          {/* Bottom Controls Bar */}
          <div className="flex items-center justify-between gap-2 relative">
            {/* Left Controls Group */}
            <div className="flex items-center gap-2.5">
              {/* 1. "+ Add files" Expanding Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className={`aic-pill-control aic-add-files-btn ${
                  tourExpandAddFiles ? 'expanded' : ''
                }`}
                aria-label="Add files"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  className="flex-shrink-0"
                  style={{ color: 'var(--icon-primary)' }}
                >
                  <path
                    d="M8 2.5V13.5M2.5 8H13.5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                  />
                </svg>
                <span className="aic-add-files-label">Add files</span>
              </button>

              {/* 2. Mode Selector ("Build v" / "Plan v" / "Ask v") */}
              <div className="relative">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setModelMenuOpen(false);
                    setHoveredModelId(null);
                    setModeMenuOpen((prev) => !prev);
                  }}
                  className={`aic-pill-control aic-mode-btn ${
                    modeMenuOpen ? 'menu-open' : ''
                  }`}
                  aria-haspopup="true"
                  aria-expanded={modeMenuOpen}
                >
                  <span className="mode-btn-text transition-colors">{mode}</span>
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 16 16"
                    fill="none"
                    className="mt-0.5"
                    style={{ color: 'var(--chevron-color)' }}
                  >
                    <path
                      d="M4 6L8 10L12 6"
                      stroke="currentColor"
                      strokeWidth="1.65"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                {/* Mode Popover Menu */}
                <div
                  className={`aic-glass-popover ${
                    modeMenuOpen ? 'aic-popover-visible' : 'aic-popover-hidden'
                  } absolute left-0 bottom-0 w-[148px] rounded-[18px] p-1.5 z-30`}
                  role="menu"
                >
                  <div className="flex flex-col gap-0.5">
                    {orderedModes.map((modeOption) => {
                      const isSelected = modeOption === mode;
                      return (
                        <div
                          key={modeOption}
                          role="menuitem"
                          onClick={(e) => {
                            e.stopPropagation();
                            setMode(modeOption);
                            setModeMenuOpen(false);
                          }}
                          className="aic-mode-menu-item"
                        >
                          <span>{modeOption}</span>
                          {isSelected && <CheckmarkIcon />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* 3. Model & Effort Selector ("Fable 5 High v" or "Auto v") */}
              <div className="relative inline-flex items-center">
                {!autoMode ? (
                  <button
                    type="button"
                    onClick={handleOpenModelMenu}
                    className="aic-model-trigger-btn"
                    aria-haspopup="true"
                    aria-expanded={modelMenuOpen}
                  >
                    <span className="w-[26px] h-[26px] rounded-full bg-[#0d0d10] flex items-center justify-center flex-shrink-0 border border-white/10">
                      <ProviderBadgeIcon provider={activeModel.provider} />
                    </span>
                    <span className="flex items-baseline gap-1.5 whitespace-nowrap">
                      <span
                        className="font-medium"
                        style={{ color: 'var(--text-primary)' }}
                      >
                        {activeModel.name}
                      </span>
                      <span
                        className="font-normal"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {activeModel.effort}
                      </span>
                    </span>
                    <svg
                      width="13"
                      height="13"
                      viewBox="0 0 16 16"
                      fill="none"
                      className="mt-0.5"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <path
                        d="M4 6L8 10L12 6"
                        stroke="currentColor"
                        strokeWidth="1.65"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                ) : (
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={handleOpenModelMenu}
                    className={`aic-auto-trigger-btn ${
                      tourHoverAutoPill ? 'hovered-state' : ''
                    }`}
                    aria-label="Auto model routing"
                  >
                    <span
                      className="font-medium select-none"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Auto
                    </span>
                    <span
                      className="aic-auto-chevron mt-0.5"
                      style={{ color: 'var(--text-secondary)' }}
                    >
                      <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                        <path
                          d="M4 6L8 10L12 6"
                          stroke="currentColor"
                          strokeWidth="1.65"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span className="aic-auto-inline-switch">
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          setAutoMode(false);
                          setTourHoverAutoPill(false);
                        }}
                        className="aic-ios-switch on"
                        title="Turn off Auto routing"
                      >
                        <span className="aic-ios-switch-thumb" />
                      </span>
                    </span>
                  </div>
                )}

                {/* Model Selector Popover Menu */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  className={`aic-glass-popover ${
                    modelMenuOpen ? 'aic-popover-visible' : 'aic-popover-hidden'
                  } absolute left-0 bottom-0 w-[256px] rounded-[20px] p-2 z-30`}
                >
                  {/* Collapsible Search Models Input at Top */}
                  <div
                    onMouseEnter={() => {
                      isHoveringModelRowRef.current = false;
                      setHoveredModelId(null);
                    }}
                    className={`aic-search-row-wrap ${
                      searchRevealed || searchQuery.length > 0 ? 'revealed' : ''
                    }`}
                  >
                    <div className="flex items-center gap-2 px-2.5 h-8 rounded-lg">
                      <svg
                        width="15"
                        height="15"
                        viewBox="0 0 16 16"
                        fill="none"
                        className="flex-shrink-0"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        <circle
                          cx="7.2"
                          cy="7.2"
                          r="4.8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                        />
                        <path
                          d="M10.8 10.8L13.8 13.8"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                      <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search models"
                        autoComplete="off"
                        className="w-full bg-transparent border-none outline-none text-[14.5px] font-normal tracking-[-0.011em]"
                        style={{ color: 'var(--text-primary)' }}
                      />
                    </div>
                  </div>

                  {/* Auto Toggle Row */}
                  <div
                    onMouseEnter={() => {
                      isHoveringModelRowRef.current = false;
                      setHoveredModelId(null);
                    }}
                    className="flex items-center justify-between px-2.5 h-9"
                  >
                    <span
                      className="text-[15px] font-medium tracking-[-0.011em]"
                      style={{ color: 'var(--text-primary)' }}
                    >
                      Auto
                    </span>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={autoMode}
                      onClick={handleToggleAutoInMenu}
                      className={`aic-ios-switch ${autoMode ? 'on' : ''}`}
                    >
                      <span className="aic-ios-switch-thumb" />
                    </button>
                  </div>

                  {/* Cohesive fav / all Segmented Filter Bar Below Auto */}
                  <div
                    role="tablist"
                    aria-label="Filter models"
                    onMouseEnter={() => {
                      isHoveringModelRowRef.current = false;
                      setHoveredModelId(null);
                    }}
                    className="aic-model-filter-bar"
                  >
                    <button
                      type="button"
                      role="tab"
                      aria-selected={modelFilterTab === 'fav'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModelFilterTab('fav');
                        setHoveredModelId(null);
                      }}
                      className={`aic-model-filter-pill ${
                        modelFilterTab === 'fav' ? 'active' : ''
                      }`}
                    >
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 16 16"
                        fill={modelFilterTab === 'fav' ? '#FACC15' : 'none'}
                        stroke={modelFilterTab === 'fav' ? '#FACC15' : 'currentColor'}
                        strokeWidth="1.4"
                        strokeLinejoin="round"
                        className="flex-shrink-0"
                      >
                        <path d="M8 1.6L9.95 5.55L14.3 6.18L11.15 9.25L11.89 13.58L8 11.53L4.11 13.58L4.85 9.25L1.7 6.18L6.05 5.55L8 1.6Z" />
                      </svg>
                      <span>fav</span>
                      {favCount > 0 && (
                        <span
                          className="text-[11.5px] font-normal opacity-75"
                          style={{ color: 'var(--text-secondary)' }}
                        >
                          {favCount}
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      role="tab"
                      aria-selected={modelFilterTab === 'all'}
                      onClick={(e) => {
                        e.stopPropagation();
                        setModelFilterTab('all');
                        setHoveredModelId(null);
                      }}
                      className={`aic-model-filter-pill ${
                        modelFilterTab === 'all' ? 'active' : ''
                      }`}
                    >
                      <span>all</span>
                      <span
                        className="text-[11.5px] font-normal opacity-70"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {models.length}
                      </span>
                    </button>
                  </div>

                  {/* Models List */}
                  <div className="flex flex-col gap-0.5">
                    {visibleModels.length === 0 ? (
                      <div
                        className="px-3 py-3 text-center text-[13px] tracking-[-0.01em]"
                        style={{ color: 'var(--text-secondary)' }}
                      >
                        {modelFilterTab === 'fav' ? (
                          <>
                            No favourite models yet. Switch to{' '}
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setModelFilterTab('all');
                              }}
                              className="underline font-medium"
                              style={{ color: 'var(--text-primary)' }}
                            >
                              all
                            </button>{' '}
                            and press ★ to add.
                          </>
                        ) : (
                          'No matching models'
                        )}
                      </div>
                    ) : (
                      visibleModels.map((m) => {
                        const isSelected = !autoMode && m.id === activeModelId;
                        const isHovered =
                          m.id === hoveredModelId && searchQuery.trim().length === 0;
                        return (
                          <div
                            key={m.id}
                            onClick={(e) => handleSelectModel(e, m.id)}
                            onMouseEnter={() => {
                              clearHideEffortTimeout();
                              isHoveringModelRowRef.current = true;
                              if (modelMenuPointerReady) {
                                setHoveredModelId(m.id);
                              }
                            }}
                            onMouseMove={() => {
                              clearHideEffortTimeout();
                              isHoveringModelRowRef.current = true;
                              if (!modelMenuPointerReady) {
                                setModelMenuPointerReady(true);
                              }
                              if (hoveredModelId !== m.id) {
                                setHoveredModelId(m.id);
                              }
                            }}
                            onMouseLeave={() => {
                              isHoveringModelRowRef.current = false;
                              scheduleHideEffortSubmenu();
                            }}
                            className={`aic-model-row ${isHovered ? 'active-hover' : ''}`}
                          >
                            <div className="flex items-center gap-2 min-w-0 pr-1">
                              <span className="w-[26px] h-[26px] rounded-full bg-[#0c0c0f] flex items-center justify-center flex-shrink-0 border border-white/10">
                                <ProviderBadgeIcon provider={m.provider} />
                              </span>
                              <span className="text-[14.5px] truncate">
                                <span
                                  className="font-medium"
                                  style={{ color: 'var(--text-primary)' }}
                                >
                                  {m.name}
                                </span>
                                <span
                                  className="font-normal ml-1"
                                  style={{ color: 'var(--text-secondary)' }}
                                >
                                  {m.effort}
                                </span>
                              </span>
                              <button
                                type="button"
                                onClick={(e) => handleToggleFavStar(e, m.id)}
                                className={`aic-fav-star-btn ${m.isFav ? 'starred' : ''}`}
                                title={
                                  m.isFav
                                    ? 'Remove from favourites'
                                    : 'Add to favourites'
                                }
                                aria-label={`Toggle favourite for ${m.name}`}
                              >
                                {m.isFav ? (
                                  <svg
                                    width="13.5"
                                    height="13.5"
                                    viewBox="0 0 16 16"
                                    fill="#FACC15"
                                    stroke="#FACC15"
                                    strokeWidth="1.2"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M8 1.6L9.95 5.55L14.3 6.18L11.15 9.25L11.89 13.58L8 11.53L4.11 13.58L4.85 9.25L1.7 6.18L6.05 5.55L8 1.6Z" />
                                  </svg>
                                ) : (
                                  <svg
                                    width="13.5"
                                    height="13.5"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="1.35"
                                    strokeLinejoin="round"
                                  >
                                    <path d="M8 1.6L9.95 5.55L14.3 6.18L11.15 9.25L11.89 13.58L8 11.53L4.11 13.58L4.85 9.25L1.7 6.18L6.05 5.55L8 1.6Z" />
                                  </svg>
                                )}
                              </button>
                            </div>
                            {isSelected && <CheckmarkIcon />}
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Floating Effort Submenu (Appears on model hover & tracks vertically) */}
                <div
                  onClick={(e) => e.stopPropagation()}
                  onMouseEnter={() => {
                    clearHideEffortTimeout();
                    isHoveringEffortMenuRef.current = true;
                  }}
                  onMouseLeave={() => {
                    isHoveringEffortMenuRef.current = false;
                    scheduleHideEffortSubmenu();
                  }}
                  style={{ bottom: `${effortBottomOffsetPx}px` }}
                  className={`aic-glass-popover aic-effort-submenu-bridge ${
                    isEffortMenuVisible ? 'aic-popover-visible' : 'aic-popover-hidden'
                  } absolute left-[266px] w-[148px] rounded-[18px] p-2 z-30`}
                >
                  <div
                    className="px-2.5 py-1.5 text-[14.5px] font-medium tracking-[-0.011em]"
                    style={{ color: 'var(--effort-header)' }}
                  >
                    Effort
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {hoveredModel?.efforts.map((level) => {
                      const isCurrentEffort = hoveredModel.effort === level;
                      return (
                        <div
                          key={level}
                          onClick={(e) => handleSelectEffort(e, level)}
                          className="aic-mode-menu-item h-[34px] px-2.5 text-[14.5px]"
                        >
                          <span>{level}</span>
                          {isCurrentEffort && <CheckmarkIcon />}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Controls Group */}
            <div className="flex items-center gap-2.5">
              {/* 4. Microphone / "Record" Expanding Button */}
              <button
                type="button"
                onClick={handleRecordClick}
                className={`aic-pill-control aic-record-btn ${
                  tourExpandRecord ? 'expanded' : ''
                } ${isRecording ? 'recording' : ''}`}
                aria-label="Record voice input"
              >
                <span
                  className="flex-shrink-0 flex items-center justify-center"
                  style={{ color: 'var(--icon-primary)' }}
                >
                  {isRecording ? (
                    <span className="w-2.5 h-2.5 rounded-full bg-red-500 aic-recording-dot" />
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <rect
                        x="5.5"
                        y="1.8"
                        width="5"
                        height="7.6"
                        rx="2.5"
                        stroke="currentColor"
                        strokeWidth="1.45"
                      />
                      <path
                        d="M3.2 7.2C3.2 9.85 5.35 12 8 12C10.65 12 12.8 9.85 12.8 7.2"
                        stroke="currentColor"
                        strokeWidth="1.45"
                        strokeLinecap="round"
                      />
                      <path
                        d="M8 12V14.2M5.8 14.2H10.2"
                        stroke="currentColor"
                        strokeWidth="1.45"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                </span>
                <span className="aic-record-label">
                  {isRecording ? formattedRecordingTime : 'Record'}
                </span>
              </button>

              {/* 5. Submit Up-Arrow Button */}
              <button
                type="button"
                onClick={handleSubmitPrompt}
                className={`aic-submit-btn ${isSubmitReady ? 'ready' : ''}`}
                aria-label="Submit prompt"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 12.8V3.2M8 3.2L3.8 7.4M8 3.2L12.2 7.4"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* Bottom "Upgrade to Pro" Banner */}
        {showUpgradeBanner && !bannerDismissed && (
          <aside className="aic-pro-banner">
            <div className="flex items-center gap-1.5 text-[15px] tracking-[-0.011em] truncate pr-2">
              <span
                className="font-medium"
                style={{ color: 'var(--text-primary)' }}
              >
                Upgrade to Pro.
              </span>
              <button
                type="button"
                onClick={() => setProModalOpen(true)}
                className="aic-pro-link font-normal"
              >
                See Pro benefits
              </button>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={() => setProModalOpen(true)}
                className="aic-upgrade-pill-btn"
              >
                Upgrade
              </button>
              <button
                type="button"
                onClick={() => setBannerDismissed(true)}
                className="transition-opacity hover:opacity-100 opacity-75 p-1"
                style={{ color: 'var(--dismiss-color)' }}
                aria-label="Dismiss Upgrade banner"
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path
                    d="M2.5 2.5L11.5 11.5M11.5 2.5L2.5 11.5"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>
          </aside>
        )}
      </main>

      {/* Floating Theme Switcher & Demo Controls */}
      <div className="fixed bottom-4 right-4 flex items-center gap-2 z-20 flex-wrap justify-end">
        <div
          className="aic-floating-control-pill p-1 rounded-full shadow-lg flex items-center gap-0.5"
          role="group"
          aria-label="Theme selector"
        >
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`aic-theme-segment-btn ${theme === 'light' ? 'active' : ''}`}
            aria-pressed={theme === 'light'}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <circle cx="8" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.5" />
              <path
                d="M8 1.5V3M8 13V14.5M1.5 8H3M13 8H14.5M3.4 3.4L4.45 4.45M11.55 11.55L12.6 12.6M12.6 3.4L11.55 4.45M4.45 11.55L3.4 12.6"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <span>Light</span>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`aic-theme-segment-btn ${theme === 'dark' ? 'active' : ''}`}
            aria-pressed={theme === 'dark'}
          >
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <path
                d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z"
                stroke="currentColor"
                strokeWidth="1.45"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span>Dark</span>
          </button>
        </div>

        {showUpgradeBanner && bannerDismissed && (
          <button
            type="button"
            onClick={() => setBannerDismissed(false)}
            className="aic-floating-control-pill px-3 py-1.5 rounded-full text-xs shadow-lg"
          >
            Restore Pro Banner
          </button>
        )}

        {showWalkthroughControl && (
          <button
            type="button"
            onClick={runVideoWalkthrough}
            className="aic-floating-control-pill px-3.5 py-1.5 rounded-full text-xs font-medium shadow-lg flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>{isPlayingTour ? 'Playing Tour...' : 'Replay Video Tour'}</span>
          </button>
        )}
      </div>

      {/* Pro Benefits Modal */}
      {proModalOpen && (
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) setProModalOpen(false);
          }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            className="w-full max-w-md rounded-[24px] shadow-2xl overflow-hidden transition-colors"
            style={{
              background: 'var(--modal-bg)',
              border: '1px solid var(--modal-border)',
              color: 'var(--text-primary)',
            }}
          >
            <div
              className="p-6"
              style={{
                background:
                  'radial-gradient(circle at 85% 15%, rgba(58, 126, 86, 0.28), transparent 65%)',
              }}
            >
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-500 border border-emerald-500/30">
                  Pro Plan
                </span>
                <button
                  type="button"
                  onClick={() => setProModalOpen(false)}
                  className="opacity-70 hover:opacity-100 p-1"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <path
                      d="M3.5 3.5L12.5 12.5M12.5 3.5L3.5 12.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>
              <h2
                className="text-lg font-semibold mb-1"
                style={{ color: 'var(--text-primary)' }}
              >
                Unlock Full Frontier Reasoning
              </h2>
              <p
                className="text-sm mb-5"
                style={{ color: 'var(--text-secondary)' }}
              >
                Access Max effort compute across Fable 5, Opus 4.8, and GPT-5.6
                models with unlimited context attachments.
              </p>
              <ul
                className="space-y-2.5 text-sm mb-6"
                style={{ color: 'var(--text-primary)' }}
              >
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">
                    ✓
                  </span>
                  <span>
                    Unlimited High &amp; Max Effort runs on Fable 5 and Opus 4.8
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">
                    ✓
                  </span>
                  <span>
                    Smart Auto-routing across Kimi K3, GPT-5.6 Terra &amp; Sol
                  </span>
                </li>
                <li className="flex items-center gap-2.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center text-xs">
                    ✓
                  </span>
                  <span>
                    Full-repo @context indexing and voice-to-build automation
                  </span>
                </li>
              </ul>
              <div className="flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setProModalOpen(false)}
                  className="px-4 py-2 rounded-full text-sm transition"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Maybe later
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProModalOpen(false);
                    setToastMessage(
                      'Pro Trial activated — Max Effort unlocked across all models.'
                    );
                  }}
                  className="aic-upgrade-pill-btn px-5"
                >
                  Activate Pro Trial
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
