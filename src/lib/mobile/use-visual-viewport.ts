"use client";

import { useState, useEffect } from "react";

export interface VisualViewportState {
  viewportHeight: number;
  keyboardHeight: number;
  isKeyboardOpen: boolean;
  isLayoutResizedByBrowser: boolean;
}

export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>({
    viewportHeight: typeof window !== "undefined" ? window.innerHeight : 0,
    keyboardHeight: 0,
    isKeyboardOpen: false,
    isLayoutResizedByBrowser: false,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const vv = window.visualViewport;
    let baselineHeight = typeof window !== "undefined" ? window.innerHeight : 0;
    let rafId: number | null = null;

    const updateViewport = () => {
      const windowHeight = window.innerHeight;
      const currentHeight = vv.height;

      // Update baseline when viewport expands (e.g. keyboard closed or orientation changed)
      if (currentHeight > baselineHeight) {
        baselineHeight = currentHeight;
      }

      // Check difference against innerHeight (iOS Safari) or baselineHeight (Android Chrome)
      const diffInner = windowHeight - currentHeight;
      const diffBaseline = baselineHeight - currentHeight;
      const diff = Math.max(diffInner, diffBaseline);

      const isKeyboardOpen = diff > 150; // Threshold for virtual keyboard
      const keyboardHeight = isKeyboardOpen ? Math.max(0, diff) : 0;
      const isLayoutResizedByBrowser = (windowHeight < baselineHeight - 100);

      setState({
        viewportHeight: currentHeight,
        keyboardHeight,
        isKeyboardOpen,
        isLayoutResizedByBrowser,
      });

      // Export dynamic CSS property for CSS layout bindings
      document.documentElement.style.setProperty("--keyboard-height", `${keyboardHeight}px`);
    };

    const scheduleUpdate = () => {
      if (process.env.NODE_ENV === "test") {
        updateViewport();
        return;
      }
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        updateViewport();
      });
    };

    vv.addEventListener("resize", scheduleUpdate, { passive: true });
    vv.addEventListener("scroll", scheduleUpdate, { passive: true });
    updateViewport();

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      vv.removeEventListener("resize", scheduleUpdate);
      vv.removeEventListener("scroll", scheduleUpdate);
      document.documentElement.style.removeProperty("--keyboard-height");
    };
  }, []);

  return state;
}
