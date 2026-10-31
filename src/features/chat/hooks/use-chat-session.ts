"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Conversation, ChatMessage, Attachment } from "@/lib/types/chat";
import { conversationService } from "@/lib/db/conversations";
import { generateFollowUpQuestions } from "@/lib/ai/followups";

export function useChatSession() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeFollowUps, setActiveFollowUps] = useState<string[]>([]);
  const activeConvRef = useRef<string | null>(null);

  // Sync ref with activeConvId
  useEffect(() => {
    activeConvRef.current = activeConvId;
  }, [activeConvId]);

  // Load conversations on mount
  useEffect(() => {
    conversationService.list().then((loaded) => {
      setConversations(loaded);
    });
  }, []);

  const selectConversation = useCallback((id: string) => {
    conversationService.list().then((list) => {
      const conv = list.find((c) => c.id === id);
      if (conv) {
        setActiveConvId(conv.id);
        setMessages(conv.messages);
        setActiveFollowUps([]);
      }
    });
  }, []);

  const newChat = useCallback(() => {
    setActiveConvId(null);
    setMessages([]);
    setActiveFollowUps([]);
  }, []);

  const togglePin = useCallback(async (id: string) => {
    const list = await conversationService.list();
    const conv = list.find((c) => c.id === id);
    if (!conv) return;

    await conversationService.togglePin(id, conv.pinned);
    const updated = await conversationService.list();
    setConversations(updated);
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      await conversationService.delete(id);
      const updated = await conversationService.list();
      setConversations(updated);
      if (activeConvRef.current === id) {
        newChat();
      }
    },
    [newChat]
  );

  const deleteAllConversations = useCallback(async () => {
    const list = await conversationService.list();
    for (const c of list) {
      await conversationService.delete(c.id);
    }
    setConversations([]);
    newChat();
  }, [newChat]);

  const appendUserMessage = useCallback(
    (text: string, attachments: Attachment[] = []): ChatMessage[] => {
      const userMessage: ChatMessage = {
        id: `msg_${Date.now()}`,
        role: "user",
        content: text,
        createdAt: Date.now(),
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const nextMessages = [...messages, userMessage];
      setMessages(nextMessages);
      setActiveFollowUps([]);
      return nextMessages;
    },
    [messages]
  );

  const appendAssistantMessage = useCallback(
    async (assistantMessage: ChatMessage, currentMessages: ChatMessage[], tone: string, language: string) => {
      const finalMessages = [...currentMessages, assistantMessage];
      setMessages(finalMessages);

      // Derive title from first user message
      const firstUserMsg = finalMessages.find((m) => m.role === "user");
      const title = firstUserMsg ? firstUserMsg.content.slice(0, 36).trim() || "New Chat" : "New Chat";

      const convId = activeConvRef.current || `conv_${Date.now()}`;
      if (!activeConvRef.current) {
        setActiveConvId(convId);
      }

      const updatedConv: Conversation = {
        id: convId,
        title,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        pinned: false,
        messages: finalMessages,
      };

      await conversationService.save(updatedConv);
      const updatedList = await conversationService.list();
      setConversations(updatedList);

      // Generate intelligent follow-up suggestions in background
      try {
        const followUps = await generateFollowUpQuestions(assistantMessage.content, tone, language);
        if (followUps && followUps.length > 0) {
          setActiveFollowUps(followUps);
        }
      } catch {
        // Non-critical background task failure
      }
    },
    []
  );

  return {
    conversations,
    activeConvId,
    messages,
    activeFollowUps,
    selectConversation,
    newChat,
    togglePin,
    deleteConversation,
    deleteAllConversations,
    appendUserMessage,
    appendAssistantMessage,
    setConversations,
  };
}
