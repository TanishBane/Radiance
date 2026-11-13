import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useChatSession } from "@/features/chat/hooks/use-chat-session";
import {
  generateMessageId,
  generateConversationId,
  ChatMessage,
  Conversation,
  FeedbackRating,
} from "@/lib/types/chat";
import { safeLocalStorage } from "@/lib/utils/storage";
import { conversationService } from "@/lib/db/conversations";
import { generateFollowUpQuestions } from "@/lib/ai/followups";

vi.mock("@/lib/ai/followups", () => ({
  generateFollowUpQuestions: vi.fn().mockResolvedValue([
    "What is quantum superposition?",
    "How do qubits work?",
  ]),
}));

describe("useChatSession Hook & Session State Specifications", () => {
  beforeEach(() => {
    safeLocalStorage.deleteAllConversations();
    vi.clearAllMocks();
  });

  describe("1. Collision-Resistant ID Generation", () => {
    it("generates message IDs with msg_ prefix and random suffix", () => {
      const id = generateMessageId();
      expect(id).toMatch(/^msg_\d+_[a-z0-9]+$/);
    });

    it("generates conversation IDs with conv_ prefix and random suffix", () => {
      const id = generateConversationId();
      expect(id).toMatch(/^conv_\d+_[a-z0-9]+$/);
    });

    it("produces zero collisions across 1,000 rapid iterations", () => {
      const ids = new Set<string>();
      const iterations = 1000;
      for (let i = 0; i < iterations; i++) {
        const id = generateMessageId();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
      expect(ids.size).toBe(iterations);
    });
  });

  describe("2. Initial State & Persistence Loading", () => {
    it("initializes with empty state when no saved conversations exist", async () => {
      const { result } = renderHook(() => useChatSession());
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });
      expect(result.current.messages).toEqual([]);
      expect(result.current.activeConvId).toBeNull();
      expect(result.current.activeFollowUps).toEqual([]);
      expect(result.current.conversations).toEqual([]);
      expect(result.current.isConversationHistoryLoaded).toBe(true);
    });

    it("loads saved conversations from persistence on mount", async () => {
      const existingConv: Conversation = {
        id: "conv_saved_1",
        title: "Previous Chat",
        createdAt: 1000,
        updatedAt: 1000,
        pinned: false,
        messages: [
          {
            id: "msg_user_saved",
            role: "user",
            content: "Saved query",
            createdAt: 1000,
          },
        ],
      };
      await conversationService.save(existingConv);

      const { result } = renderHook(() => useChatSession());

      await act(async () => {
        // Wait for conversationService.list() promise on mount
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(result.current.conversations.length).toBe(1);
      expect(result.current.conversations[0].id).toBe("conv_saved_1");
      expect(result.current.isConversationHistoryLoaded).toBe(true);
    });
  });

  describe("3. appendUserMessage", () => {
    it("appends user message with generated ID and timestamp", async () => {
      const { result } = renderHook(() => useChatSession());
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      let returnedMessages: ChatMessage[] = [];
      act(() => {
        returnedMessages = result.current.appendUserMessage("Hello Radiance AI");
      });

      expect(result.current.messages.length).toBe(1);
      expect(result.current.messages[0].content).toBe("Hello Radiance AI");
      expect(result.current.messages[0].role).toBe("user");
      expect(result.current.messages[0].id).toMatch(/^msg_\d+_[a-z0-9]+$/);
      expect(returnedMessages).toEqual(result.current.messages);
    });

    it("attaches files when provided", async () => {
      const { result } = renderHook(() => useChatSession());
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      act(() => {
        result.current.appendUserMessage("Analyze document", [
          {
            id: "att_1",
            name: "report.pdf",
            type: "pdf",
            mime: "application/pdf",
            size: 2048,
          },
        ]);
      });

      expect(result.current.messages[0].attachments).toHaveLength(1);
      expect(result.current.messages[0].attachments?.[0].name).toBe("report.pdf");
    });
  });

  describe("4. appendAssistantMessage & Metadata Preservation", () => {
    it("generates follow-ups using the latest user message and selected language", async () => {
      const { result } = renderHook(() => useChatSession());
      vi.mocked(generateFollowUpQuestions).mockResolvedValueOnce([
        "Best follow-up?",
        "Second-best follow-up?",
        "Third follow-up?",
      ]);
      act(() => result.current.appendUserMessage("Explain how solar panels store energy."));

      await act(async () => {
        await result.current.appendAssistantMessage(
          { id: "msg_solar_reply", role: "assistant", content: "Solar panels produce electricity.", createdAt: Date.now() },
          result.current.messages,
          "default",
          "fr"
        );
      });

      expect(generateFollowUpQuestions).toHaveBeenCalledWith(
        "Solar panels produce electricity.",
        "default",
        "fr",
        "Explain how solar panels store energy."
      );
      expect(result.current.activeFollowUps).toEqual([
        "Best follow-up?",
        "Second-best follow-up?",
      ]);
    });

    it("creates new conversation and derives title from first user message", async () => {
      const { result } = renderHook(() => useChatSession());

      act(() => {
        result.current.appendUserMessage("What is the speed of light?");
      });

      const assistantMsg: ChatMessage = {
        id: "msg_asst_1",
        role: "assistant",
        content: "The speed of light is approximately 299,792 km/s.",
        createdAt: Date.now(),
      };

      await act(async () => {
        await result.current.appendAssistantMessage(
          assistantMsg,
          result.current.messages,
          "default",
          "en"
        );
      });

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.activeConvId).not.toBeNull();

      const stored = await conversationService.list();
      expect(stored).toHaveLength(1);
      expect(stored[0].title).toBe("What is the speed of light?");
      expect(stored[0].messages).toHaveLength(2);
    });

    it("preserves conversation createdAt and pinned status on subsequent assistant turns", async () => {
      const initialCreatedAt = 500000;
      const existingConv: Conversation = {
        id: "conv_pinned_existing",
        title: "Important Topic",
        createdAt: initialCreatedAt,
        updatedAt: initialCreatedAt,
        pinned: true,
        messages: [
          {
            id: "msg_u1",
            role: "user",
            content: "First turn",
            createdAt: initialCreatedAt,
          },
          {
            id: "msg_a1",
            role: "assistant",
            content: "First reply",
            createdAt: initialCreatedAt + 100,
          },
        ],
      };
      await conversationService.save(existingConv);

      const { result } = renderHook(() => useChatSession());

      await act(async () => {
        result.current.selectConversation("conv_pinned_existing");
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(result.current.activeConvId).toBe("conv_pinned_existing");

      act(() => {
        result.current.appendUserMessage("Second turn");
      });

      const assistantMsg: ChatMessage = {
        id: "msg_a2",
        role: "assistant",
        content: "Second reply",
        createdAt: Date.now(),
      };

      await act(async () => {
        await result.current.appendAssistantMessage(
          assistantMsg,
          result.current.messages,
          "default",
          "en"
        );
      });

      const list = await conversationService.list();
      const updated = list.find((c) => c.id === "conv_pinned_existing");
      expect(updated).toBeDefined();
      expect(updated?.createdAt).toBe(initialCreatedAt);
      expect(updated?.pinned).toBe(true);
      expect(updated?.messages).toHaveLength(4);
    });
  });

  describe("5. deleteMessage", () => {
    it("deletes specified message from messages state and updates persistence", async () => {
      const { result } = renderHook(() => useChatSession());

      act(() => {
        result.current.appendUserMessage("Question 1");
      });

      const userMsgId = result.current.messages[0].id;

      const assistantMsg: ChatMessage = {
        id: "msg_asst_to_delete",
        role: "assistant",
        content: "Answer 1",
        createdAt: Date.now(),
      };

      await act(async () => {
        await result.current.appendAssistantMessage(
          assistantMsg,
          result.current.messages,
          "default",
          "en"
        );
      });

      expect(result.current.messages).toHaveLength(2);

      // Delete assistant message
      await act(async () => {
        await result.current.deleteMessage("msg_asst_to_delete");
      });

      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].id).toBe(userMsgId);

      // Verify persistence
      const list = await conversationService.list();
      const saved = list.find((c) => c.id === result.current.activeConvId);
      expect(saved?.messages).toHaveLength(1);
      expect(saved?.messages[0].id).toBe(userMsgId);
    });

    it("gracefully ignores non-existent message ID", async () => {
      const { result } = renderHook(() => useChatSession());

      act(() => {
        result.current.appendUserMessage("Test query");
      });

      await act(async () => {
        await result.current.deleteMessage("non_existent_id");
      });

      expect(result.current.messages).toHaveLength(1);
    });

    it("clears active follow-up questions upon message deletion", async () => {
      const { result } = renderHook(() => useChatSession());

      act(() => {
        result.current.appendUserMessage("Question");
      });

      await act(async () => {
        await result.current.appendAssistantMessage(
          { id: "msg_a", role: "assistant", content: "Reply", createdAt: Date.now() },
          result.current.messages,
          "default",
          "en"
        );
      });

      await act(async () => {
        await result.current.deleteMessage("msg_a");
      });

      expect(result.current.activeFollowUps).toEqual([]);
    });
  });

  describe("6. editUserMessage", () => {
    it("updates prompt text and slices away subsequent messages for resubmission", async () => {
      const { result } = renderHook(() => useChatSession());

      act(() => {
        result.current.appendUserMessage("Initial prompt");
      });
      const firstUserId = result.current.messages[0].id;

      await act(async () => {
        await result.current.appendAssistantMessage(
          { id: "msg_a1", role: "assistant", content: "Reply 1", createdAt: Date.now() },
          result.current.messages,
          "default",
          "en"
        );
      });

      act(() => {
        result.current.appendUserMessage("Second prompt");
      });
      const secondUserId = result.current.messages[2].id;

      await act(async () => {
        await result.current.appendAssistantMessage(
          { id: "msg_a2", role: "assistant", content: "Reply 2", createdAt: Date.now() },
          result.current.messages,
          "default",
          "en"
        );
      });

      expect(result.current.messages).toHaveLength(4);

      // Edit the first user message
      let sliced: ChatMessage[] = [];
      await act(async () => {
        sliced = await result.current.editUserMessage(firstUserId, "Refined initial prompt");
      });

      // Subsequent turns (msg_a1, second prompt, msg_a2) must be sliced away
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].id).toBe(firstUserId);
      expect(result.current.messages[0].content).toBe("Refined initial prompt");
      expect(sliced).toEqual(result.current.messages);

      // Verify persistence was updated and title was recalculated
      const list = await conversationService.list();
      const saved = list.find((c) => c.id === result.current.activeConvId);
      expect(saved?.messages).toHaveLength(1);
      expect(saved?.title).toBe("Refined initial prompt");
    });

    it("defensive guard: refuses to edit assistant message", async () => {
      const { result } = renderHook(() => useChatSession());

      act(() => {
        result.current.appendUserMessage("Prompt");
      });

      await act(async () => {
        await result.current.appendAssistantMessage(
          { id: "msg_asst_uneditable", role: "assistant", content: "Answer", createdAt: Date.now() },
          result.current.messages,
          "default",
          "en"
        );
      });

      let returned: ChatMessage[] = [];
      await act(async () => {
        returned = await result.current.editUserMessage("msg_asst_uneditable", "Hacked answer");
      });

      expect(result.current.messages[1].content).toBe("Answer");
      expect(returned).toEqual(result.current.messages);
    });
  });

  describe("7. setMessageFeedback", () => {
    it("sets positive feedback on assistant message and persists", async () => {
      const { result } = renderHook(() => useChatSession());

      act(() => {
        result.current.appendUserMessage("Tell me a fact");
      });

      await act(async () => {
        await result.current.appendAssistantMessage(
          { id: "msg_a_fact", role: "assistant", content: "Honey never spoils.", createdAt: Date.now() },
          result.current.messages,
          "default",
          "en"
        );
      });

      await act(async () => {
        await result.current.setMessageFeedback("msg_a_fact", "positive");
      });

      expect(result.current.messages[1].feedback).toBe("positive");

      const list = await conversationService.list();
      const saved = list.find((c) => c.id === result.current.activeConvId);
      expect(saved?.messages[1].feedback).toBe("positive");
    });

    it("toggles sentiment back to null when clicking same feedback rating", async () => {
      const { result } = renderHook(() => useChatSession());

      act(() => {
        result.current.appendUserMessage("Fact");
      });

      await act(async () => {
        await result.current.appendAssistantMessage(
          { id: "msg_a_fact", role: "assistant", content: "Fact text", createdAt: Date.now() },
          result.current.messages,
          "default",
          "en"
        );
      });

      // First click: positive
      await act(async () => {
        await result.current.setMessageFeedback("msg_a_fact", "positive");
      });
      expect(result.current.messages[1].feedback).toBe("positive");

      // Second click: positive again toggles to null
      await act(async () => {
        await result.current.setMessageFeedback("msg_a_fact", "positive");
      });
      expect(result.current.messages[1].feedback).toBeNull();
    });

    it("switches sentiment between positive and negative seamlessly", async () => {
      const { result } = renderHook(() => useChatSession());

      act(() => {
        result.current.appendUserMessage("Query");
      });

      await act(async () => {
        await result.current.appendAssistantMessage(
          { id: "msg_a_switch", role: "assistant", content: "Content", createdAt: Date.now() },
          result.current.messages,
          "default",
          "en"
        );
      });

      await act(async () => {
        await result.current.setMessageFeedback("msg_a_switch", "positive");
      });
      expect(result.current.messages[1].feedback).toBe("positive");

      await act(async () => {
        await result.current.setMessageFeedback("msg_a_switch", "negative");
      });
      expect(result.current.messages[1].feedback).toBe("negative");
    });
  });

  describe("8. Conversation Lifecycle (newChat, select, pin, delete)", () => {
    it("switches conversations cleanly via selectConversation", async () => {
      const conv1: Conversation = {
        id: "conv_1",
        title: "Chat 1",
        createdAt: 100,
        updatedAt: 100,
        pinned: false,
        messages: [{ id: "m1", role: "user", content: "In chat 1", createdAt: 100 }],
      };
      const conv2: Conversation = {
        id: "conv_2",
        title: "Chat 2",
        createdAt: 200,
        updatedAt: 200,
        pinned: false,
        messages: [{ id: "m2", role: "user", content: "In chat 2", createdAt: 200 }],
      };
      await conversationService.save(conv1);
      await conversationService.save(conv2);

      const { result } = renderHook(() => useChatSession());

      await act(async () => {
        result.current.selectConversation("conv_2");
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(result.current.activeConvId).toBe("conv_2");
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe("In chat 2");

      act(() => {
        result.current.newChat();
      });

      expect(result.current.activeConvId).toBeNull();
      expect(result.current.messages).toEqual([]);
    });

    it("toggles pin status on conversation", async () => {
      const conv: Conversation = {
        id: "conv_pin_me",
        title: "Pin test",
        createdAt: 100,
        updatedAt: 100,
        pinned: false,
        messages: [],
      };
      await conversationService.save(conv);

      const { result } = renderHook(() => useChatSession());

      await act(async () => {
        await result.current.togglePin("conv_pin_me");
      });

      const list = await conversationService.list();
      expect(list.find((c) => c.id === "conv_pin_me")?.pinned).toBe(true);
    });

    it("deletes active conversation and resets to new chat", async () => {
      const conv: Conversation = {
        id: "conv_to_delete",
        title: "Delete active",
        createdAt: 100,
        updatedAt: 100,
        pinned: false,
        messages: [{ id: "m", role: "user", content: "Test", createdAt: 100 }],
      };
      await conversationService.save(conv);

      const { result } = renderHook(() => useChatSession());

      await act(async () => {
        result.current.selectConversation("conv_to_delete");
        await new Promise((r) => setTimeout(r, 20));
      });

      expect(result.current.activeConvId).toBe("conv_to_delete");

      await act(async () => {
        await result.current.deleteConversation("conv_to_delete");
      });

      expect(result.current.activeConvId).toBeNull();
      expect(result.current.messages).toEqual([]);

      const list = await conversationService.list();
      expect(list.find((c) => c.id === "conv_to_delete")).toBeUndefined();
    });
  });

  describe("9. ChatMessage Type Structure Validation", () => {
    it("supports optional feedback and errorDetails properties", () => {
      const errorMsg: ChatMessage = {
        id: "msg_err_1",
        role: "assistant",
        content: "Rate limit error encountered.",
        createdAt: Date.now(),
        isError: true,
        errorDetails: "HTTP 429: Rate limit exceeded. Try again in 10s.",
        feedback: null,
      };

      expect(errorMsg.isError).toBe(true);
      expect(errorMsg.errorDetails).toContain("HTTP 429");
      expect(errorMsg.feedback).toBeNull();
    });
  });
});
