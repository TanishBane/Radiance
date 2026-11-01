import { describe, it, expect, beforeEach } from "vitest";
import { safeLocalStorage } from "@/lib/utils/storage";
import { Conversation } from "@/lib/types/chat";

describe("Storage Utilities & Quota Protection", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("safely saves and retrieves conversations", () => {
    const conv: Conversation = {
      id: "test_conv_1",
      title: "Test Conversation",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      messages: [
        {
          id: "msg_1",
          role: "user",
          content: "Hello Radiance",
          createdAt: Date.now(),
        },
      ],
    };

    const success = safeLocalStorage.saveConversation(conv);
    expect(success).toBe(true);

    const retrieved = safeLocalStorage.getConversation("test_conv_1");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe("Test Conversation");
    expect(retrieved?.messages[0].content).toBe("Hello Radiance");
  });

  it("lists and deletes stored conversations correctly", () => {
    const conv1: Conversation = {
      id: "conv_a",
      title: "Alpha Chat",
      createdAt: 1000,
      updatedAt: 1000,
      pinned: false,
      messages: [],
    };
    const conv2: Conversation = {
      id: "conv_b",
      title: "Beta Chat",
      createdAt: 2000,
      updatedAt: 2000,
      pinned: true,
      messages: [],
    };

    safeLocalStorage.saveConversation(conv1);
    safeLocalStorage.saveConversation(conv2);

    const list = safeLocalStorage.listConversations();
    expect(list.length).toBe(2);
    expect(list[0].id).toBe("conv_b"); // Sorted by updatedAt descending

    safeLocalStorage.deleteConversation("conv_a");
    expect(safeLocalStorage.listConversations().length).toBe(1);

    safeLocalStorage.deleteAllConversations();
    expect(safeLocalStorage.listConversations().length).toBe(0);
  });
});
