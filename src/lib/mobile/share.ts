/**
 * Radiance Native Web Share & Clipboard Fallback Utility
 */

export interface SharePayload {
  title?: string;
  text?: string;
  url?: string;
}

export interface ShareResult {
  shared: boolean;
  method: "native" | "clipboard" | "failed";
  error?: string;
}

export async function shareContent(payload: SharePayload): Promise<ShareResult> {
  const shareData: ShareData = {
    title: payload.title || "RADIANCE",
    text: payload.text,
    url: payload.url || (typeof window !== "undefined" ? window.location.href : undefined),
  };

  // 1. Try Native Web Share API (Mobile Safari, Android Chrome, Edge)
  if (
    typeof navigator !== "undefined" &&
    typeof navigator.share === "function" &&
    typeof navigator.canShare === "function" &&
    navigator.canShare(shareData)
  ) {
    try {
      await navigator.share(shareData);
      return { shared: true, method: "native" };
    } catch (err) {
      // User aborted share sheet (AbortError) is not a true failure
      if (err instanceof Error && err.name === "AbortError") {
        return { shared: false, method: "native", error: "User cancelled share" };
      }
      // Fall through to clipboard fallback
    }
  }

  // 2. Clipboard Fallback
  const copyText = [payload.title, payload.text, payload.url]
    .filter(Boolean)
    .join("\n\n");

  if (typeof navigator !== "undefined" && navigator.clipboard && typeof navigator.clipboard.writeText === "function") {
    try {
      await navigator.clipboard.writeText(copyText);
      return { shared: true, method: "clipboard" };
    } catch (clipErr) {
      return {
        shared: false,
        method: "failed",
        error: clipErr instanceof Error ? clipErr.message : "Clipboard write failed",
      };
    }
  }

  return { shared: false, method: "failed", error: "Sharing unsupported on this client" };
}
