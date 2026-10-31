"use client";

import { useState, useRef, useCallback } from "react";
import { ChatMessage, Attachment } from "@/lib/types/chat";

interface UseChatStreamOptions {
  modelId: string;
  mode: string;
  tone: string;
  language: string;
  onStreamComplete: (assistantMessage: ChatMessage) => void;
  onError: (error: Error) => void;
}

export function useChatStream({
  modelId,
  mode,
  tone,
  language,
  onStreamComplete,
  onError,
}: UseChatStreamOptions) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [streamingContent, setStreamingContent] = useState("");
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsGenerating(false);
  }, []);

  const send = useCallback(
    async (messagesToSend: ChatMessage[]) => {
      if (isGenerating) return;

      setIsGenerating(true);
      setStreamingContent("");

      const controller = new AbortController();
      abortControllerRef.current = controller;

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
            modelId,
            mode,
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
        let accumulated = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split("\n");

          for (const line of lines) {
            // Vercel AI SDK text part: 0:"token"
            if (line.startsWith('0:"')) {
              try {
                const token = JSON.parse(line.slice(2));
                accumulated += token;
                setStreamingContent(accumulated);
              } catch {
                // Ignore partial JSON parse errors
              }
            } else if (line.startsWith("0:")) {
              // Raw string without quotes
              accumulated += line.slice(2);
              setStreamingContent(accumulated);
            }
          }
        }

        const assistantMsg: ChatMessage = {
          id: `msg_${Date.now()}`,
          role: "assistant",
          content: accumulated || "*(No response generated)*",
          createdAt: Date.now(),
        };

        setStreamingContent("");
        setIsGenerating(false);
        abortControllerRef.current = null;
        onStreamComplete(assistantMsg);
      } catch (err: unknown) {
        if (err instanceof Error && err.name === "AbortError") {
          // Intentional stop
          setIsGenerating(false);
          return;
        }

        const error = err instanceof Error ? err : new Error(String(err));
        setIsGenerating(false);
        setStreamingContent("");
        abortControllerRef.current = null;
        onError(error);
      }
    },
    [isGenerating, modelId, mode, tone, language, onStreamComplete, onError]
  );

  return {
    isGenerating,
    streamingContent,
    send,
    stop,
  };
}
