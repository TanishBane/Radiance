import { describe, expect, it } from "vitest";
import type { Conversation } from "@/lib/types/chat";
import { createWelcomeSuggestions } from "@/lib/chat/welcome-suggestions";

function conversation(id: string, messages: Array<{ role: "user" | "assistant"; content: string }>): Conversation {
  return {
    id,
    title: "Chat",
    createdAt: 1,
    updatedAt: 1,
    pinned: false,
    messages: messages.map((message, index) => ({ ...message, id: `${id}-${index}`, createdAt: index })),
  };
}

describe("personalized welcome suggestions", () => {
  it("uses interests found in user-authored conversation history", () => {
    const suggestions = createWelcomeSuggestions([
      conversation("recent", [
        { role: "user", content: "Help me learn React and TypeScript." },
        { role: "assistant", content: "Let's also discuss gardening and houseplants." },
      ]),
    ], [], () => 0);

    expect(suggestions[0].items.every((item) => item.id.includes("technology"))).toBe(true);
    expect(suggestions.flatMap((column) => column.items).some((item) => /React|TypeScript/.test(item.prompt))).toBe(false);
    expect(suggestions).toHaveLength(3);
    expect(suggestions.every((column) => column.items.length === 3)).toBe(true);
  });

  it("chooses new prompt variants instead of repeating the previous session", () => {
    const history = [conversation("recent", [{ role: "user", content: "I enjoy cooking recipes." }])];
    const previous = createWelcomeSuggestions(history, [], () => 0);
    const next = createWelcomeSuggestions(
      history,
      previous.flatMap((column) => column.items.map((item) => item.id)),
      () => 0
    );

    const previousIds = new Set(previous.flatMap((column) => column.items.map((item) => item.id)));
    expect(next.flatMap((column) => column.items.map((item) => item.id)).every((id) => !previousIds.has(id))).toBe(true);
  });

  it("returns useful varied suggestions with no saved history", () => {
    const suggestions = createWelcomeSuggestions([], [], () => 0.4);
    const items = suggestions.flatMap((column) => column.items);

    expect(items).toHaveLength(9);
    expect(new Set(items.map((item) => item.id)).size).toBe(9);
    expect(items.every((item) => item.label.trim() && item.prompt.trim())).toBe(true);
    expect(items.every((item) => item.label.length <= 32)).toBe(true);
    expect(items.every((item) => !Object.hasOwn(item, "badge"))).toBe(true);
  });
});
