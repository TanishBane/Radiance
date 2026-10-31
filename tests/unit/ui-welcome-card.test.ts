import { describe, it, expect } from "vitest";
import { PersonaMode } from "@/lib/types/chat";

describe("Welcome Card Mode Resolution & Content Structure", () => {
  const modes: PersonaMode[] = ["default", "portfolio", "student"];

  it("resolves correct persona title for each mode", () => {
    const titles = {
      default: "Radiance",
      portfolio: "Tanish Bane",
      student: "Mumbai Student AI",
    };

    modes.forEach((mode) => {
      const title =
        mode === "portfolio"
          ? "Tanish Bane"
          : mode === "student"
          ? "Mumbai Student AI"
          : "Radiance";
      expect(title).toBe(titles[mode]);
    });
  });

  it("provides distinctive descriptions per persona mode", () => {
    modes.forEach((mode) => {
      const description =
        mode === "portfolio"
          ? "Explore AI & Data Science engineering projects, full-stack architectures, published research, and technical credentials."
          : mode === "student"
          ? "Mumbai collegiate academic guide, syllabus navigator, engineering career strategies, and collegiate resources."
          : "Illuminate what is possible. Stream real-time reasoning, analyze documents, generate Flux visuals, or explore dedicated persona modes.";

      expect(description.length).toBeGreaterThan(40);
      expect(description).not.toContain("undefined");
    });
  });
});
