"use client";

import { useState, useEffect } from "react";

export interface VisualViewportState {
  viewportHeight: number;
  keyboardHeight: number;
  isKeyboardOpen: boolean;
}

export function useVisualViewport(): VisualViewportState {
  const [state, setState] = useState<VisualViewportState>({
    viewportHeight: typeof window !== "undefined" ? window.innerHeight : 0,
    keyboardHeight: 0,
    isKeyboardOpen: false,
  });

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const vv = window.visualViewport;
    const updateViewport = () => {
      const windowHeight = window.innerHeight;
      const currentHeight = vv.height;
      const diff = windowHeight - currentHeight;
      const isKeyboardOpen = diff > 150; // Threshold for virtual keyboard
      const keyboardHeight = isKeyboardOpen ? Math.max(0, diff) : 0;

      setState({
        viewportHeight: currentHeight,
        keyboardHeight,
        isKeyboardOpen,
      });

      // Export dynamic CSS property for CSS layout bindings
      document.documentElement.style.setProperty("--keyboard-height", `${keyboardHeight}px`);
    };

    vv.addEventListener("resize", updateViewport);
    vv.addEventListener("scroll", updateViewport);
    updateViewport();

    return () => {
      vv.removeEventListener("resize", updateViewport);
      vv.removeEventListener("scroll", updateViewport);
      document.documentElement.style.removeProperty("--keyboard-height");
    };
  }, []);

  return state;
}
