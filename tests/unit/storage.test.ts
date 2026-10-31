import { describe, it, expect, beforeEach } from "vitest";
import { safeLocalStorage } from "@/lib/utils/storage";
import { Conversation } from "@/lib/types/chat";

describe("Storage Utilities & Quota Protection (Fixes BUG-04)", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("strips heavy base64 data URLs to protect 5MB localStorage quota", () => {
    const conv: Conversation = {
      id: "test_conv_1",
      title: "Test with Image Attachment",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      pinned: false,
      messages: [
        {
          id: "msg_1",
          role: "user",
          content: "What is in this picture?",
          createdAt: Date.now(),
          attachments: [
            {
              id: "att_1",
              name: "large_image.png",
              type: "image",
              mime: "image/png",
              size: 2 * 1024 * 1024,
              dataUrl: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
            },
          ],
        },
      ],
    };

    const success = safeLocalStorage.saveConversation(conv);
    expect(success).toBe(true);

    const retrieved = safeLocalStorage.getConversation("test_conv_1");
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe("Test with Image Attachment");
    // The ephemeral base64 should have been safely stripped upon persistence
    expect(retrieved?.messages[0].attachments?.[0].dataUrl).toBeUndefined();
    // But attachment metadata must be preserved
    expect(retrieved?.messages[0].attachments?.[0].name).toBe("large_image.png");
  });

  it("safely lists and imports legacy Tanix AI chats", () => {
    // Populate mock legacy chat in localStorage
    window.localStorage.setItem(
      "chat_1714000000000",
      JSON.stringify({
        id: "chat_1714000000000",
        title: "Legacy Chat about Board Exams",
        ts: 1714000000000,
        pinned: true,
        history: [
          { role: "user", text: "How to prepare for HSC exams?" },
          { role: "model", text: "Consistency beats intensity every time." },
        ],
      })
    );

    const legacyList = safeLocalStorage.listLegacyChats();
    expect(legacyList.length).toBe(1);
    expect(legacyList[0].title).toBe("Legacy Chat about Board Exams");

    const imported = safeLocalStorage.importLegacyChat("chat_1714000000000");
    expect(imported).not.toBeNull();
    expect(imported?.title).toBe("Legacy Chat about Board Exams");
    expect(imported?.messages.length).toBe(2);
    expect(imported?.messages[0].role).toBe("user");
    expect(imported?.messages[1].role).toBe("assistant");
    expect(imported?.pinned).toBe(true);
  });
});
