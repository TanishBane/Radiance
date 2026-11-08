import { describe, it, expect, beforeEach } from "vitest";
import { conversationService } from "@/lib/db/conversations";
import { Conversation } from "@/lib/types/chat";
import { safeLocalStorage } from "@/lib/utils/storage";

describe("Conversation Persistence Service", () => {
  beforeEach(() => {
    safeLocalStorage.deleteAllConversations();
  });

  it("saves and lists conversations locally and resiliently", async () => {
    const testConv: Conversation = {
      id: "conv_test_123",
      title: "Test Persistence",
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: "msg_1",
          role: "user",
          content: "Hello Radiance",
          createdAt: Date.now(),
        },
      ],
    };

    await conversationService.save(testConv);
    const list = await conversationService.list();

    expect(list.length).toBe(1);
    expect(list[0].id).toBe("conv_test_123");
    expect(list[0].title).toBe("Test Persistence");
    expect(list[0].messages.length).toBe(1);
  });

  it("toggles pinned state on conversations", async () => {
    const testConv: Conversation = {
      id: "conv_pin_test",
      title: "Pinned Chat",
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    await conversationService.save(testConv);
    await conversationService.togglePin("conv_pin_test", false);

    const list = await conversationService.list();
    const updated = list.find((c) => c.id === "conv_pin_test");
    expect(updated?.pinned).toBe(true);
  });

  it("deletes a conversation cleanly", async () => {
    const testConv: Conversation = {
      id: "conv_delete_test",
      title: "Delete Me",
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [],
    };

    await conversationService.save(testConv);
    await conversationService.delete("conv_delete_test");

    const list = await conversationService.list();
    expect(list.find((c) => c.id === "conv_delete_test")).toBeUndefined();
  });

  it("safely handles conversations with adversarial or injection IDs (SEC-08)", async () => {
    const maliciousConv: Conversation = {
      id: "conv_malicious_123",
      title: "Adversarial Injection Attempt",
      pinned: false,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messages: [
        {
          id: "msg_valid_1",
          role: "user",
          content: "Valid message",
          createdAt: Date.now(),
        },
        {
          id: "msg_2),id.neq.0", // PostgREST URL filter parameter injection attempt
          role: "assistant",
          content: "Injected ID message",
          createdAt: Date.now(),
        },
      ],
    };

    // Should not throw or crash
    await expect(conversationService.save(maliciousConv, "user_123")).resolves.not.toThrow();

    // Verify local storage was saved properly
    const local = safeLocalStorage.getConversation("conv_malicious_123");
    expect(local).not.toBeNull();
    expect(local?.id).toBe("conv_malicious_123");
  });
});
