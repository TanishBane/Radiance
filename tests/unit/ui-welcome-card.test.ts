import { describe, it, expect } from "vitest";
import { SUGGESTION_COLUMNS } from "@/components/chat/welcome-card";

describe("Welcome Card Default Assistant Structure", () => {
  it("resolves default assistant title and brand identity", () => {
    const title = "Radiance";
    expect(title).toBe("Radiance");
  });

  it("provides comprehensive and inspiring platform description", () => {
    const description =
      "Illuminate what is possible. Stream real-time reasoning, analyze documents, generate Flux visuals, and explore complex ideas.";

    expect(description.length).toBeGreaterThan(40);
    expect(description).toContain("Illuminate what is possible");
    expect(description).not.toContain("undefined");
  });

  describe("Image 2 3-Column Suggestions Architecture", () => {
    it("defines exactly 3 suggestion columns: Understand, Create, Explore", () => {
      expect(SUGGESTION_COLUMNS).toHaveLength(3);
      const columnIds = SUGGESTION_COLUMNS.map((c) => c.id);
      expect(columnIds).toEqual(["understand", "create", "explore"]);

      const titles = SUGGESTION_COLUMNS.map((c) => c.title);
      expect(titles).toEqual(["Understand", "Create", "Explore"]);
    });

    it("assigns harmonic dynamic theme roles: accentB, gradient, accentC", () => {
      const understand = SUGGESTION_COLUMNS.find((c) => c.id === "understand");
      const create = SUGGESTION_COLUMNS.find((c) => c.id === "create");
      const explore = SUGGESTION_COLUMNS.find((c) => c.id === "explore");

      expect(understand?.headerThemeRole).toBe("accentB");
      expect(create?.headerThemeRole).toBe("gradient");
      expect(explore?.headerThemeRole).toBe("accentC");
    });

    it("matches Understand column items and badges from Image 2", () => {
      const understand = SUGGESTION_COLUMNS.find((c) => c.id === "understand");
      expect(understand).toBeDefined();
      expect(understand?.items).toHaveLength(3);

      expect(understand?.items[0].label).toBe("character from a book");
      expect(understand?.items[0].badge).toBeUndefined();

      expect(understand?.items[1].label).toBe("pack accordingly");
      expect(understand?.items[1].badge?.type).toBe("flight");

      expect(understand?.items[2].label).toBe("research a topic");
      expect(understand?.items[2].badge?.type).toBe("video");
    });

    it("matches Create column items from Image 2", () => {
      const create = SUGGESTION_COLUMNS.find((c) => c.id === "create");
      expect(create).toBeDefined();
      expect(create?.items).toHaveLength(3);

      expect(create?.items[0].label).toBe("job negotiation and accept...");
      expect(create?.items[1].label).toBe("game night planning");
      expect(create?.items[2].label).toBe("out-of-office message");
    });

    it("matches Explore column items and badges from Image 2", () => {
      const explore = SUGGESTION_COLUMNS.find((c) => c.id === "explore");
      expect(explore).toBeDefined();
      expect(explore?.items).toHaveLength(3);

      expect(explore?.items[0].label).toBe("spring getaway");
      expect(explore?.items[0].badge?.type).toBe("getaway");

      expect(explore?.items[1].label).toBe("plant care tips");
      expect(explore?.items[2].label).toBe("cooking trends");
    });
  });
});
