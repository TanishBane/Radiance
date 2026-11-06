"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Conversation,
  ChatMessage,
  Attachment,
  FeedbackRating,
  UseChatSessionReturn,
  generateMessageId,
  generateConversationId,
} from "@/lib/types/chat";
import { conversationService } from "@/lib/db/conversations";
import { generateFollowUpQuestions } from "@/lib/ai/followups";

export function useChatSession(): UseChatSessionReturn {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeFollowUps, setActiveFollowUps] = useState<string[]>([]);
  const activeConvRef = useRef<string | null>(null);
  const messagesRef = useRef<ChatMessage[]>([]);
  const conversationsRef = useRef<Conversation[]>([]);

  // Sync refs with state
  useEffect(() => {
    activeConvRef.current = activeConvId;
  }, [activeConvId]);

  useEffect(() => {
    messagesRef.current = messages;
  }, [messages]);

  useEffect(() => {
    conversationsRef.current = conversations;
  }, [conversations]);

  // Load conversations on mount
  useEffect(() => {
    conversationService.list().then((loaded) => {
      setConversations(loaded);
    });
  }, []);

  const selectConversation = useCallback((id: string) => {
    const cached = conversationsRef.current.find((c) => c.id === id);
    if (cached) {
      setActiveConvId(cached.id);
      activeConvRef.current = cached.id;
      setMessages(cached.messages);
      messagesRef.current = cached.messages;
      setActiveFollowUps([]);
      return;
    }
    conversationService.list().then((list) => {
      const conv = list.find((c) => c.id === id);
      if (conv) {
        setActiveConvId(conv.id);
        activeConvRef.current = conv.id;
        setMessages(conv.messages);
        messagesRef.current = conv.messages;
        setActiveFollowUps([]);
      }
    });
  }, []);

  const newChat = useCallback(() => {
    setActiveConvId(null);
    activeConvRef.current = null;
    setMessages([]);
    messagesRef.current = [];
    setActiveFollowUps([]);
  }, []);

  const togglePin = useCallback(async (id: string) => {
    let conv: Conversation | null | undefined = conversationsRef.current.find((c) => c.id === id);
    if (!conv) {
      conv = await conversationService.get(id);
    }
    if (!conv) return;

    const nextPinned = !conv.pinned;
    const updatedConv: Conversation = { ...conv, pinned: nextPinned, updatedAt: Date.now() };
    setConversations((prev) => prev.map((c) => (c.id === id ? updatedConv : c)));
    await conversationService.togglePin(id, conv.pinned);
  }, []);

  const deleteConversation = useCallback(
    async (id: string) => {
      await conversationService.delete(id);
      setConversations((prev) => prev.filter((c) => c.id !== id));
      if (activeConvRef.current === id) {
        newChat();
      }
    },
    [newChat]
  );

  const deleteAllConversations = useCallback(async () => {
    await conversationService.deleteAll();
    setConversations([]);
    newChat();
  }, [newChat]);

  const appendUserMessage = useCallback(
    (text: string, attachments: Attachment[] = []): ChatMessage[] => {
      const userMessage: ChatMessage = {
        id: generateMessageId(),
        role: "user",
        content: text,
        createdAt: Date.now(),
        attachments: attachments.length > 0 ? attachments : undefined,
      };

      const nextMessages = [...messagesRef.current, userMessage];
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
      setActiveFollowUps([]);
      return nextMessages;
    },
    []
  );

  const appendAssistantMessage = useCallback(
    async (
      assistantMessage: ChatMessage,
      currentMessages: ChatMessage[],
      tone: string,
      language: string
    ) => {
      const finalMessages = [...currentMessages, assistantMessage];
      messagesRef.current = finalMessages;
      setMessages(finalMessages);

      const convId = activeConvRef.current || generateConversationId();
      if (!activeConvRef.current) {
        setActiveConvId(convId);
        activeConvRef.current = convId;
      }

      // Preserve existing conversation createdAt & pinned if present
      const existing =
        conversationsRef.current.find((c) => c.id === convId) ||
        (await conversationService.get(convId));

      const firstUserMsg = finalMessages.find((m) => m.role === "user");
      const title =
        existing?.title ||
        (firstUserMsg ? firstUserMsg.content.slice(0, 36).trim() || "New Chat" : "New Chat");

      const updatedConv: Conversation = {
        id: convId,
        title,
        createdAt: existing ? existing.createdAt : Date.now(),
        updatedAt: Date.now(),
        pinned: existing ? existing.pinned : false,
        messages: finalMessages,
      };

      setConversations((prev) => {
        const idx = prev.findIndex((c) => c.id === convId);
        if (idx >= 0) {
          const next = [...prev];
          next[idx] = updatedConv;
          return next;
        }
        return [updatedConv, ...prev];
      });

      await conversationService.save(updatedConv);

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

  const deleteMessage = useCallback(async (messageId: string): Promise<void> => {
    const current = messagesRef.current;
    const nextMessages = current.filter((m) => m.id !== messageId);
    messagesRef.current = nextMessages;
    setMessages(nextMessages);
    setActiveFollowUps([]);

    const convId = activeConvRef.current;
    if (!convId) return;

    const existingConv =
      conversationsRef.current.find((c) => c.id === convId) ||
      (await conversationService.get(convId));
    if (!existingConv) return;

    const updatedConv: Conversation = {
      ...existingConv,
      updatedAt: Date.now(),
      messages: nextMessages,
    };

    setConversations((prev) => prev.map((c) => (c.id === convId ? updatedConv : c)));
    await conversationService.save(updatedConv);
  }, []);

  const editUserMessage = useCallback(
    async (messageId: string, newContent: string): Promise<ChatMessage[]> => {
      const current = messagesRef.current;
      const targetIndex = current.findIndex((m) => m.id === messageId);
      if (targetIndex === -1 || current[targetIndex].role !== "user") {
        return current;
      }

      const updatedMsg: ChatMessage = {
        ...current[targetIndex],
        content: newContent,
      };

      // Truncate subsequent messages for resubmission
      const nextMessages = [...current.slice(0, targetIndex), updatedMsg];
      messagesRef.current = nextMessages;
      setMessages(nextMessages);
      setActiveFollowUps([]);

      const convId = activeConvRef.current;
      if (convId) {
        const existingConv =
          conversationsRef.current.find((c) => c.id === convId) ||
          (await conversationService.get(convId));
        if (existingConv) {
          // If first user message was edited, also update title
          const title =
            targetIndex === 0
              ? newContent.slice(0, 36).trim() || "New Chat"
              : existingConv.title;

          const updatedConv: Conversation = {
            ...existingConv,
            title,
            updatedAt: Date.now(),
            messages: nextMessages,
          };
          setConversations((prev) => prev.map((c) => (c.id === convId ? updatedConv : c)));
          await conversationService.save(updatedConv);
        }
      }

      return nextMessages;
    },
    []
  );

  const setMessageFeedback = useCallback(
    async (messageId: string, feedback: FeedbackRating): Promise<void> => {
      const current = messagesRef.current;
      const nextMessages = current.map((m) => {
        if (m.id !== messageId) return m;
        const newFeedback = m.feedback === feedback ? null : feedback;
        return { ...m, feedback: newFeedback };
      });

      messagesRef.current = nextMessages;
      setMessages(nextMessages);

      const convId = activeConvRef.current;
      if (convId) {
        const existingConv =
          conversationsRef.current.find((c) => c.id === convId) ||
          (await conversationService.get(convId));
        if (existingConv) {
          const updatedConv: Conversation = {
            ...existingConv,
            updatedAt: Date.now(),
            messages: nextMessages,
          };
          setConversations((prev) => prev.map((c) => (c.id === convId ? updatedConv : c)));
          await conversationService.save(updatedConv);
        }
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
    deleteMessage,
    editUserMessage,
    setMessageFeedback,
    setConversations,
    setMessages,
  };
}
