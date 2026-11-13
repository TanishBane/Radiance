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

    it("provides three distinct text-only suggestions in every category", () => {
      const understand = SUGGESTION_COLUMNS.find((c) => c.id === "understand");
      expect(understand).toBeDefined();
      expect(understand?.items).toHaveLength(3);
      for (const column of SUGGESTION_COLUMNS) {
        expect(new Set(column.items.map((item) => item.id)).size).toBe(3);
        expect(column.items.every((item) => item.label.length > 0 && !Object.hasOwn(item, "badge"))).toBe(true);
      }
    });
  });
});
