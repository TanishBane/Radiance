"use client";

import { useEffect, useState, useCallback } from "react";
import { safeLocalStorage } from "@/lib/utils/storage";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
}

export function usePWA() {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isStandalone, setIsStandalone] = useState<boolean>(false);
  const [canInstall, setCanInstall] = useState<boolean>(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // 1. Initial State Checks
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);
    const checkStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;
    setIsStandalone(checkStandalone);

    // 2. Network State Listeners
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    // 3. Mobile Install Prompt Interception
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      // Suppress if user dismissed recently (within 7 days)
      const dismissedUntil = safeLocalStorage.get<string | null>("radiance_pwa_dismissed_until", null);
      if (!dismissedUntil || Date.now() > Number(dismissedUntil)) {
        setCanInstall(true);
      }
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // 4. Service Worker Registration
    if ("serviceWorker" in navigator && process.env.NODE_ENV === "production") {
      navigator.serviceWorker
        .register("/sw.js")
        .then((reg) => {
          setSwRegistration(reg);

          reg.addEventListener("updatefound", () => {
            const installing = reg.installing;
            if (!installing) return;
            installing.addEventListener("statechange", () => {
              if (installing.state === "installed" && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
              }
            });
          });
        })
        .catch((err) => {
          console.warn("[PWA] ServiceWorker registration failed:", err);
        });

      // Reload when new SW claims client
      let refreshing = false;
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!refreshing) {
          refreshing = true;
          window.location.reload();
        }
      });
    }

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const promptInstall = useCallback(async () => {
    if (!deferredPrompt) return false;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    setDeferredPrompt(null);
    setCanInstall(false);
    return outcome === "accepted";
  }, [deferredPrompt]);

  const dismissInstall = useCallback(() => {
    setCanInstall(false);
    // Dismiss for 7 days
    safeLocalStorage.set(
      "radiance_pwa_dismissed_until",
      String(Date.now() + 7 * 24 * 60 * 60 * 1000)
    );
  }, []);

  const applyUpdate = useCallback(() => {
    if (swRegistration?.waiting) {
      swRegistration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
  }, [swRegistration]);

  return {
    isOnline,
    isStandalone,
    canInstall,
    promptInstall,
    dismissInstall,
    updateAvailable,
    applyUpdate,
  };
}
