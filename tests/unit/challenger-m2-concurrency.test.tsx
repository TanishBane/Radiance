import React from "react";
import { render, screen, fireEvent, act } from "@testing-library/react";
import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { ChatComposer } from "@/components/chat/chat-composer";
import { useChatSession } from "@/features/chat/hooks/use-chat-session";
import {
  generateMessageId,
  generateConversationId,
  ChatMessage,
} from "@/lib/types/chat";
import { safeLocalStorage } from "@/lib/utils/storage";
import { conversationService } from "@/lib/db/conversations";

vi.mock("@/lib/ai/followups", () => ({
  generateFollowUpQuestions: vi.fn().mockResolvedValue(["Next question?"]),
}));

describe("Milestone 2 Challenger: Concurrency, Truncation & Session State", () => {
  beforeEach(() => {
    safeLocalStorage.deleteAllConversations();
    vi.clearAllMocks();
  });

  // =========================================================================
  // 1. Stress test generateMessageId() for collision rate across 10,000 rapid calls
  // =========================================================================
  describe("1. ID Generation Collision & Uniformity Stress Tests", () => {
    it("produces 0 collisions across 10,000 rapid calls under normal clock", () => {
      const ids = new Set<string>();
      const count = 10000;
      for (let i = 0; i < count; i++) {
        const id = generateMessageId();
        expect(ids.has(id)).toBe(false);
        ids.add(id);
      }
      expect(ids.size).toBe(count);
    });

    it("produces 0 collisions across 10,000 rapid calls in the EXACT SAME millisecond (frozen timestamp)", () => {
      const fixedTimestamp = 1730000000000;
      const originalNow = Date.now;
      Date.now = () => fixedTimestamp;

      try {
        const ids = new Set<string>();
        const count = 10000;
        for (let i = 0; i < count; i++) {
          const id = generateMessageId();
          expect(ids.has(id)).toBe(false);
          ids.add(id);
        }
        expect(ids.size).toBe(count);
      } finally {
        Date.now = originalNow;
      }
    });

    it("validates that all 10,000 generated IDs conform strictly to format and length constraints", () => {
      const count = 10000;
      const idRegex = /^msg_\d+_[a-z0-9]{5,10}$/;
      for (let i = 0; i < count; i++) {
        const id = generateMessageId();
        expect(id).toMatch(idRegex);
        const parts = id.split("_");
        expect(parts).toHaveLength(3);
        expect(parts[0]).toBe("msg");
        expect(Number(parts[1])).toBeGreaterThan(0);
        expect(parts[2].length).toBeGreaterThanOrEqual(6);
      }
    });

    it("produces 0 collisions across 10,000 rapid generateConversationId calls with frozen timestamp", () => {
      const fixedTimestamp = 1730000000000;
      const originalNow = Date.now;
      Date.now = () => fixedTimestamp;

      try {
        const ids = new Set<string>();
        const count = 10000;
        const convRegex = /^conv_\d+_[a-z0-9]{5,10}$/;
        for (let i = 0; i < count; i++) {
          const id = generateConversationId();
          expect(ids.has(id)).toBe(false);
          expect(id).toMatch(convRegex);
          ids.add(id);
        }
        expect(ids.size).toBe(count);
      } finally {
        Date.now = originalNow;
      }
    });
  });

  // =========================================================================
  // 2. Stress test editUserMessage() across multi-turn histories
  // =========================================================================
  describe("2. editUserMessage() Multi-Turn Truncation & Title Updates", () => {
    // Helper to seed an 8-message (4-turn) conversation
    async function seedMultiTurnConversation(result: { current: ReturnType<typeof useChatSession> }) {
      const turns = [
        { u: "Turn 0: First question about physics", a: "Reply 0: Physics is the study of matter." },
        { u: "Turn 1: Second question about relativity", a: "Reply 1: General relativity explains gravity." },
        { u: "Turn 2: Third question about black holes", a: "Reply 2: Black holes have event horizons." },
        { u: "Turn 3: Fourth question about Hawking radiation", a: "Reply 3: Hawking radiation causes decay." },
      ];

      for (const turn of turns) {
        let currentMsgs: ChatMessage[] = [];
        act(() => {
          currentMsgs = result.current.appendUserMessage(turn.u);
        });
        const asstMsg: ChatMessage = {
          id: generateMessageId(),
          role: "assistant",
          content: turn.a,
          createdAt: Date.now(),
        };
        await act(async () => {
          await result.current.appendAssistantMessage(asstMsg, currentMsgs, "default", "en");
        });
      }
    }

    it("cleanly slices multi-turn history when editing an intermediate user turn", async () => {
      const { result } = renderHook(() => useChatSession());
      await seedMultiTurnConversation(result);

      expect(result.current.messages).toHaveLength(8);
      const userTurn1Id = result.current.messages[2].id; // Turn 1 user message
      expect(result.current.messages[2].content).toBe("Turn 1: Second question about relativity");

      // Edit Turn 1 user message
      let sliced: ChatMessage[] = [];
      await act(async () => {
        sliced = await result.current.editUserMessage(userTurn1Id, "Edited Turn 1: Special relativity only");
      });

      // Must slice away subsequent turns: Turn 1 asst, Turn 2 user, Turn 2 asst, Turn 3 user, Turn 3 asst
      // Resulting history must have exactly 3 messages: [Turn 0 user, Turn 0 asst, Turn 1 user (edited)]
      expect(result.current.messages).toHaveLength(3);
      expect(sliced).toHaveLength(3);
      expect(result.current.messages[0].content).toBe("Turn 0: First question about physics");
      expect(result.current.messages[1].content).toBe("Reply 0: Physics is the study of matter.");
      expect(result.current.messages[2].id).toBe(userTurn1Id);
      expect(result.current.messages[2].content).toBe("Edited Turn 1: Special relativity only");

      // Verify persistence matches sliced state
      const list = await conversationService.list();
      const savedConv = list.find((c) => c.id === result.current.activeConvId);
      expect(savedConv?.messages).toHaveLength(3);
      expect(savedConv?.messages[2].content).toBe("Edited Turn 1: Special relativity only");

      // Title must remain the original Turn 0 title, NOT changed by Turn 1 edit
      expect(savedConv?.title).toBe("Turn 0: First question about physics");
    });

    it("updates conversation title and truncates all subsequent turns when editing Turn 0", async () => {
      const { result } = renderHook(() => useChatSession());
      await seedMultiTurnConversation(result);

      expect(result.current.messages).toHaveLength(8);
      const userTurn0Id = result.current.messages[0].id;

      let sliced: ChatMessage[] = [];
      await act(async () => {
        sliced = await result.current.editUserMessage(userTurn0Id, "Overhauled Physics Concept");
      });

      // Entire downstream conversation (7 messages) must be sliced away
      expect(result.current.messages).toHaveLength(1);
      expect(sliced).toHaveLength(1);
      expect(result.current.messages[0].id).toBe(userTurn0Id);
      expect(result.current.messages[0].content).toBe("Overhauled Physics Concept");

      // Title must update to the new Turn 0 content
      const list = await conversationService.list();
      const savedConv = list.find((c) => c.id === result.current.activeConvId);
      expect(savedConv?.messages).toHaveLength(1);
      expect(savedConv?.title).toBe("Overhauled Physics Concept");
    });

    it("truncates conversation title to 36 chars when editing Turn 0 with long text", async () => {
      const { result } = renderHook(() => useChatSession());
      await seedMultiTurnConversation(result);

      const userTurn0Id = result.current.messages[0].id;
      const longPrompt = "A".repeat(120) + " End of prompt";

      await act(async () => {
        await result.current.editUserMessage(userTurn0Id, longPrompt);
      });

      const list = await conversationService.list();
      const savedConv = list.find((c) => c.id === result.current.activeConvId);
      expect(savedConv?.title).toBe("A".repeat(36));
      expect(savedConv?.title.length).toBe(36);
    });

    it("falls back to 'New Chat' title when editing Turn 0 with empty or whitespace-only content", async () => {
      const { result } = renderHook(() => useChatSession());
      await seedMultiTurnConversation(result);

      const userTurn0Id = result.current.messages[0].id;

      await act(async () => {
        await result.current.editUserMessage(userTurn0Id, "     ");
      });

      const list = await conversationService.list();
      const savedConv = list.find((c) => c.id === result.current.activeConvId);
      expect(savedConv?.title).toBe("New Chat");
    });

    it("defensively rejects edits to assistant messages and non-existent IDs without mutating state", async () => {
      const { result } = renderHook(() => useChatSession());
      await seedMultiTurnConversation(result);

      const initialMessages = [...result.current.messages];
      const asstMsgId = initialMessages[1].id;

      // Attempt to edit assistant message
      await act(async () => {
        const returned = await result.current.editUserMessage(asstMsgId, "Malicious assistant modification");
        expect(returned).toEqual(initialMessages);
      });
      expect(result.current.messages).toEqual(initialMessages);

      // Attempt to edit non-existent message ID
      await act(async () => {
        const returned = await result.current.editUserMessage("non_existent_msg_xyz", "Ghost edit");
        expect(returned).toEqual(initialMessages);
      });
      expect(result.current.messages).toEqual(initialMessages);
    });

    it("handles rapid consecutive edits across different turns without state corruption", async () => {
      const { result } = renderHook(() => useChatSession());
      await seedMultiTurnConversation(result);

      const userTurn2Id = result.current.messages[4].id;
      const userTurn1Id = result.current.messages[2].id;
      const userTurn0Id = result.current.messages[0].id;

      // First: edit turn 2 -> slices to 5 messages
      await act(async () => {
        await result.current.editUserMessage(userTurn2Id, "Edited Turn 2");
      });
      expect(result.current.messages).toHaveLength(5);

      // Second: edit turn 1 -> slices to 3 messages
      await act(async () => {
        await result.current.editUserMessage(userTurn1Id, "Edited Turn 1");
      });
      expect(result.current.messages).toHaveLength(3);

      // Third: edit turn 0 -> slices to 1 message
      await act(async () => {
        await result.current.editUserMessage(userTurn0Id, "Final Turn 0");
      });
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe("Final Turn 0");

      const list = await conversationService.list();
      const savedConv = list.find((c) => c.id === result.current.activeConvId);
      expect(savedConv?.messages).toHaveLength(1);
      expect(savedConv?.title).toBe("Final Turn 0");
    });

    it("handles editUserMessage when activeConvId is null (single user prompt before assistant reply)", async () => {
      const { result } = renderHook(() => useChatSession());

      let currentMsgs: ChatMessage[] = [];
      act(() => {
        currentMsgs = result.current.appendUserMessage("Single prompt without assistant reply");
      });

      expect(result.current.activeConvId).toBeNull();
      const userMsgId = currentMsgs[0].id;

      let sliced: ChatMessage[] = [];
      await act(async () => {
        sliced = await result.current.editUserMessage(userMsgId, "Updated single prompt");
      });

      expect(sliced).toHaveLength(1);
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].content).toBe("Updated single prompt");
    });

    it("correctly preserves multi-byte CJK characters in conversation title upon Turn 0 edit", async () => {
      const { result } = renderHook(() => useChatSession());
      await seedMultiTurnConversation(result);

      const userTurn0Id = result.current.messages[0].id;
      const cjkTitle = "量子コンピューティングと人工知能の未来";

      await act(async () => {
        await result.current.editUserMessage(userTurn0Id, cjkTitle);
      });

      const list = await conversationService.list();
      const savedConv = list.find((c) => c.id === result.current.activeConvId);
      expect(savedConv?.title).toBe(cjkTitle);
    });

    it("rapidly appends 100 messages maintaining exact chronological ref synchronization", async () => {
      const { result } = renderHook(() => useChatSession());
      await act(async () => {
        await new Promise((r) => setTimeout(r, 20));
      });

      act(() => {
        for (let i = 0; i < 100; i++) {
          result.current.appendUserMessage(`Message ${i}`);
        }
      });

      expect(result.current.messages).toHaveLength(100);
      for (let i = 0; i < 100; i++) {
        expect(result.current.messages[i].content).toBe(`Message ${i}`);
      }
    });
  });

  // =========================================================================
  // 3. Stress test ChatComposer rapid double-submit events in the same tick
  // =========================================================================
  describe("3. ChatComposer Rapid Double-Submit Concurrency", () => {
    it("drops rapid double click in the same execution tick, invoking onSend once", () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      const sendButton = screen.getByTestId("send-button");

      fireEvent.change(textarea, { target: { value: "Rapid double click message" } });

      act(() => {
        fireEvent.click(sendButton);
        fireEvent.click(sendButton);
      });

      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledWith("Rapid double click message", []);
    });

    it("drops 10 rapid spam clicks in the same execution frame, invoking onSend once", () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      const sendButton = screen.getByTestId("send-button");

      fireEvent.change(textarea, { target: { value: "Spam click message" } });

      act(() => {
        for (let i = 0; i < 10; i++) {
          fireEvent.click(sendButton);
        }
      });

      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledWith("Spam click message", []);
    });

    it("drops rapid simultaneous Enter keydown and Send button click in same tick", () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      const sendButton = screen.getByTestId("send-button");

      fireEvent.change(textarea, { target: { value: "Enter and click simultaneously" } });

      act(() => {
        fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
        fireEvent.click(sendButton);
      });

      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledWith("Enter and click simultaneously", []);
    });

    it("drops rapid triple Enter keydown events in same tick", () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);

      fireEvent.change(textarea, { target: { value: "Triple Enter spam" } });

      act(() => {
        fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
        fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
        fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      });

      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledWith("Triple Enter spam", []);
    });

    it("recovers submission lock after 300ms safety fallback timeout", () => {
      vi.useFakeTimers();
      try {
        const onSend = vi.fn();
        const onStop = vi.fn();
        render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

        const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
        const sendButton = screen.getByTestId("send-button");

        fireEvent.change(textarea, { target: { value: "Fallback timer test" } });

        act(() => {
          fireEvent.click(sendButton);
        });
        expect(onSend).toHaveBeenCalledTimes(1);

        // Immediate second click is blocked by ref
        act(() => {
          fireEvent.click(sendButton);
        });
        expect(onSend).toHaveBeenCalledTimes(1);

        // Fast-forward past the 300ms fallback timeout
        act(() => {
          vi.advanceTimersByTime(350);
        });

        // Set input again and click
        fireEvent.change(textarea, { target: { value: "After timeout test" } });
        act(() => {
          fireEvent.click(sendButton);
        });
        expect(onSend).toHaveBeenCalledTimes(2);
      } finally {
        vi.useRealTimers();
      }
    });

    it("allows subsequent legitimate messages after input changes", () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      const sendButton = screen.getByTestId("send-button");

      // First message
      fireEvent.change(textarea, { target: { value: "First message" } });
      act(() => {
        fireEvent.click(sendButton);
      });
      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenLastCalledWith("First message", []);

      // Second message
      fireEvent.change(textarea, { target: { value: "Second message" } });
      act(() => {
        fireEvent.click(sendButton);
      });
      expect(onSend).toHaveBeenCalledTimes(2);
      expect(onSend).toHaveBeenLastCalledWith("Second message", []);
    });

    it("drops submissions when isGenerating is true (even on rapid Enter keydowns)", () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={true} />);

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      fireEvent.change(textarea, { target: { value: "Message during generation" } });

      act(() => {
        fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
        fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      });

      expect(onSend).not.toHaveBeenCalled();
    });

    it("drops submissions when disabled is true (even on rapid Enter keydowns)", () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} disabled={true} />);

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      fireEvent.change(textarea, { target: { value: "Disabled message" } });

      act(() => {
        fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
        fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
      });

      expect(onSend).not.toHaveBeenCalled();
    });

    it("ignores rapid Enter spam when input contains only whitespace", () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      fireEvent.change(textarea, { target: { value: "   \n\t   " } });

      act(() => {
        for (let i = 0; i < 5; i++) {
          fireEvent.keyDown(textarea, { key: "Enter", shiftKey: false });
        }
      });

      expect(onSend).not.toHaveBeenCalled();
    });
  });

  // =========================================================================
  // 4. Stress test CJK IME composition edge cases
  // =========================================================================
  describe("4. CJK IME Composition Edge Cases", () => {
    it("rejects Enter keydown with isComposing: true across various keyCodes", () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      fireEvent.change(textarea, { target: { value: "nihon" } });

      // Test 1: Enter with isComposing = true (Standard Chrome/Edge/Firefox)
      const imeEvent1 = new KeyboardEvent("keydown", {
        key: "Enter",
        keyCode: 13,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(imeEvent1, "isComposing", { value: true, configurable: true });
      act(() => {
        textarea.dispatchEvent(imeEvent1);
      });
      expect(onSend).not.toHaveBeenCalled();

      // Test 2: Enter with isComposing = true and keyCode = 229
      const imeEvent2 = new KeyboardEvent("keydown", {
        key: "Enter",
        keyCode: 229,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(imeEvent2, "isComposing", { value: true, configurable: true });
      act(() => {
        textarea.dispatchEvent(imeEvent2);
      });
      expect(onSend).not.toHaveBeenCalled();
    });

    it("rejects Enter keydown with keyCode: 229 even when isComposing is false (Windows Korean/Japanese IME)", () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      fireEvent.change(textarea, { target: { value: "hangul" } });

      // Some Windows IMEs fire keyCode: 229 while isComposing property is false on the native event
      const imeEvent = new KeyboardEvent("keydown", {
        key: "Enter",
        keyCode: 229,
        which: 229,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(imeEvent, "isComposing", { value: false, configurable: true });
      act(() => {
        textarea.dispatchEvent(imeEvent);
      });
      expect(onSend).not.toHaveBeenCalled();
    });

    it("rejects 'Process' key (standard IME Process key identifier)", () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      fireEvent.change(textarea, { target: { value: "kanji" } });

      const processEvent = new KeyboardEvent("keydown", {
        key: "Process",
        keyCode: 229,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(processEvent, "isComposing", { value: true, configurable: true });
      act(() => {
        textarea.dispatchEvent(processEvent);
      });
      expect(onSend).not.toHaveBeenCalled();
    });

    it("simulates full Japanese IME workflow: multi-candidate selection followed by final confirmation Enter", () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);

      // User types phonetic text
      fireEvent.change(textarea, { target: { value: "とうきょう" } });

      // User presses Enter 3 times to confirm Kanji candidate "東京" while isComposing: true
      for (let i = 0; i < 3; i++) {
        const candidateConfirm = new KeyboardEvent("keydown", {
          key: "Enter",
          keyCode: 13,
          bubbles: true,
          cancelable: true,
        });
        Object.defineProperty(candidateConfirm, "isComposing", { value: true, configurable: true });
        act(() => {
          textarea.dispatchEvent(candidateConfirm);
        });
      }
      expect(onSend).not.toHaveBeenCalled();

      // IME composition ends, text is now "東京"
      fireEvent.change(textarea, { target: { value: "東京" } });

      // User presses final Enter to submit the confirmed message
      const finalSubmit = new KeyboardEvent("keydown", {
        key: "Enter",
        keyCode: 13,
        bubbles: true,
        cancelable: true,
      });
      Object.defineProperty(finalSubmit, "isComposing", { value: false, configurable: true });
      act(() => {
        textarea.dispatchEvent(finalSubmit);
      });

      expect(onSend).toHaveBeenCalledTimes(1);
      expect(onSend).toHaveBeenCalledWith("東京", []);
    });

    it("ensures Shift+Enter during or after IME composition never submits", () => {
      const onSend = vi.fn();
      const onStop = vi.fn();
      render(<ChatComposer onSend={onSend} onStop={onStop} isGenerating={false} />);

      const textarea = screen.getByPlaceholderText(/Ask RADIANCE anything/i);
      fireEvent.change(textarea, { target: { value: "Line 1" } });

      // Shift+Enter with isComposing: true
      const shiftIme = new KeyboardEvent("keydown", {
        key: "Enter",
        shiftKey: true,
        keyCode: 13,
        bubbles: true,
      });
      Object.defineProperty(shiftIme, "isComposing", { value: true, configurable: true });
      act(() => {
        textarea.dispatchEvent(shiftIme);
      });
      expect(onSend).not.toHaveBeenCalled();

      // Shift+Enter with isComposing: false
      const shiftNormal = new KeyboardEvent("keydown", {
        key: "Enter",
        shiftKey: true,
        keyCode: 13,
        bubbles: true,
      });
      Object.defineProperty(shiftNormal, "isComposing", { value: false, configurable: true });
      act(() => {
        textarea.dispatchEvent(shiftNormal);
      });
      expect(onSend).not.toHaveBeenCalled();
    });
  });
});
