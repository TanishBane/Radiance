"use client";

import { useState, useRef, useCallback } from "react";
import { ChatMessage, UseChatStreamReturn, generateMessageId } from "@/lib/types/chat";

export interface UseChatStreamOptions {
  modelId: string;
  tone: string;
  language: string;
  onStreamComplete: (assistantMessage: ChatMessage) => void;
  onError?: (error: Error) => void;
}

export function useChatStream({
  modelId,
  tone,
  language,
  onStreamComplete,
  onError,
}: UseChatStreamOptions): UseChatStreamReturn {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const [streamError, setStreamError] = useState<Error | null>(null);

  const abortControllerRef = useRef<AbortController | null>(null);
  const isGeneratingRef = useRef(false);
  const lastMessagesRef = useRef<ChatMessage[] | null>(null);
  const lastModelIdRef = useRef<string | undefined>(undefined);
  const discardPartialRef = useRef(false);

  const lastModeRef = useRef<string | undefined>(undefined);

  const stop = useCallback((discardPartial: boolean | unknown = false) => {
    if (discardPartial === true) {
      discardPartialRef.current = true;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    isGeneratingRef.current = false;
    setIsGenerating(false);
    setStreamingContent("");
  }, []);

  const send = useCallback(
    async (messagesToSend: ChatMessage[], overrideModelId?: string, overrideMode?: string) => {
      if (isGeneratingRef.current) return;

      lastMessagesRef.current = messagesToSend;
      lastModelIdRef.current = overrideModelId;
      lastModeRef.current = overrideMode;

      discardPartialRef.current = false;
      isGeneratingRef.current = true;
      setIsGenerating(true);
      setStreamingContent("");
      setStreamError(null);

      const controller = new AbortController();
      abortControllerRef.current = controller;

      let accumulated = "";

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: controller.signal,
          body: JSON.stringify({
            messages: messagesToSend.map((m) => ({
              id: m.id,
              role: m.role,
              content: m.content,
              attachments: m.attachments,
            })),
            modelId: overrideModelId || modelId,
            mode: overrideMode || "build",
            tone,
            language,
          }),
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `Server responded with status ${res.status}`);
        }

        const reader = res.body?.getReader();
        if (!reader) throw new Error("No readable response body received.");

        const decoder = new TextDecoder();
        let buffer = "";

        const processLine = (rawLine: string) => {
          const line = rawLine.endsWith("\r") ? rawLine.slice(0, -1) : rawLine;
          if (!line) return;

          // Vercel AI SDK text part: 0:"token"
          if (line.startsWith('0:"')) {
            try {
              const token = JSON.parse(line.slice(2));
              accumulated += token;
              setStreamingContent(accumulated);
            } catch {
              // Ignore partial unescaped slices
            }
          } else if (line.startsWith("0:")) {
            // Raw text part without quotes
            accumulated += line.slice(2);
            setStreamingContent(accumulated);
          } else if (line.startsWith("3:")) {
            // Vercel AI SDK stream error part
            try {
              const errPayload = JSON.parse(line.slice(2));
              const msg =
                typeof errPayload === "string"
                  ? errPayload
                  : errPayload.message || "Streaming inference error";
              throw new Error(msg);
            } catch (pErr) {
              if (pErr instanceof Error && pErr.message !== "Unexpected end of JSON input") {
                throw pErr;
              }
              throw new Error(line.slice(2));
            }
          }
        };

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            processLine(line);
          }
        }

        // Flush any remaining residual buffer after stream completion
        if (buffer.length > 0) {
          processLine(buffer);
          buffer = "";
        }

        if (controller.signal.aborted || discardPartialRef.current) {
          discardPartialRef.current = false;
          setStreamingContent("");
          isGeneratingRef.current = false;
          setIsGenerating(false);
          abortControllerRef.current = null;
          return;
        }

        const assistantMsg: ChatMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: accumulated || "*(No response generated)*",
          createdAt: Date.now(),
        };

        setStreamingContent("");
        isGeneratingRef.current = false;
        setIsGenerating(false);
        abortControllerRef.current = null;
        onStreamComplete(assistantMsg);
      } catch (err: unknown) {
        const isAbort =
          controller.signal.aborted ||
          (typeof DOMException !== "undefined" && err instanceof DOMException && err.name === "AbortError") ||
          (err instanceof Error && (err.name === "AbortError" || err.message.toLowerCase().includes("aborted")));

        if (isAbort) {
          const shouldDiscard = discardPartialRef.current;
          discardPartialRef.current = false;

          if (!shouldDiscard && accumulated.trim().length > 0) {
            const assistantMsg: ChatMessage = {
              id: generateMessageId(),
              role: "assistant",
              content: accumulated,
              createdAt: Date.now(),
            };
            onStreamComplete(assistantMsg);
          }
          setStreamingContent("");
          isGeneratingRef.current = false;
          setIsGenerating(false);
          setStreamError(null);
          abortControllerRef.current = null;
          return;
        }

        const error = err instanceof Error ? err : new Error(String(err));
        setStreamError(error);
        isGeneratingRef.current = false;
        setIsGenerating(false);
        setStreamingContent("");
        abortControllerRef.current = null;
        onError?.(error);
      }
    },
    [modelId, tone, language, onStreamComplete, onError]
  );

  const retryLast = useCallback(async () => {
    if (isGeneratingRef.current) return;
    if (!lastMessagesRef.current || lastMessagesRef.current.length === 0) return;
    await send(lastMessagesRef.current, lastModelIdRef.current, lastModeRef.current);
  }, [send]);

  return {
    isGenerating,
    streamingContent,
    streamError,
    send,
    stop,
    retryLast,
  };
}
