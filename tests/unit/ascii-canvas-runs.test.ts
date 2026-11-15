import { describe, expect, it } from "vitest";
import { drawAsciiRuns } from "@/components/background/arctic-icebergs-background";

describe("ASCII canvas run renderer", () => {
  it("batches adjacent cells with the same color into one draw call", () => {
    const calls: Array<{ text: string; color: string; x: number; y: number }> = [];
    const mockContext = { fillStyle: "" } as {
      fillStyle: string;
      fillText: (text: string, x: number, y: number) => void;
    };
    mockContext.fillText = (text, x, y) => {
      calls.push({ text, color: mockContext.fillStyle, x, y });
    };
    const ctx = mockContext as unknown as CanvasRenderingContext2D;

    drawAsciiRuns(ctx, 4, 1, 10, 20, (i) => ["A", "B", "C", " "][i], (i) => i < 2 ? "red" : "blue");

    expect(calls).toEqual([
      { text: "AB", color: "red", x: 10, y: 10 },
      { text: "C ", color: "blue", x: 30, y: 10 },
    ]);
  });

  it("does not draw blank-only runs", () => {
    const calls: string[] = [];
    const ctx = { fillStyle: "", fillText: (text: string) => calls.push(text) } as unknown as CanvasRenderingContext2D;
    drawAsciiRuns(ctx, 3, 1, 8, 12, () => " ", () => "white");
    expect(calls).toEqual([]);
  });
});
