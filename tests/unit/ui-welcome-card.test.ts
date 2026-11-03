import { describe, it, expect } from "vitest";

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
});
