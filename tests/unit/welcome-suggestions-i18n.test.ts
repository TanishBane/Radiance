import { describe, expect, it } from "vitest";
import { UI_LANGUAGES } from "@/lib/i18n/ui";
import { localizeWelcomeSuggestion } from "@/lib/i18n/welcome-suggestions";
import { createWelcomeSuggestions } from "@/lib/chat/welcome-suggestions";

describe("welcome suggestion localization", () => {
  it("translates dynamic titles and full prompts for every supported UI language", () => {
    const item = createWelcomeSuggestions([
      {
        id: "history",
        title: "History",
        createdAt: 1,
        updatedAt: 1,
        pinned: false,
        messages: [{ id: "user", role: "user", content: "I enjoy React and coding.", createdAt: 1 }],
      },
    ], [], () => 0)[0].items[0];

    expect(localizeWelcomeSuggestion(item, "en")).toEqual(item);
    for (const language of UI_LANGUAGES.filter((code) => code !== "en")) {
      const translated = localizeWelcomeSuggestion(item, language);
      expect(translated.label).not.toBe(item.label);
      expect(translated.prompt).not.toBe(item.prompt);
      expect(translated.label).not.toContain("{topic}");
    }
  });
});
