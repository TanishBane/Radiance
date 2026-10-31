import { describe, it, expect } from "vitest";
import {
  validateFileMagicBytes,
  parseDocumentFile,
} from "@/lib/documents/parser";

describe("Document Ingestion & File Signature Validation", () => {
  it("validates PDF magic bytes correctly (%PDF)", () => {
    // 0x25, 0x50, 0x44, 0x46
    const validPdfBytes = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x37]).buffer;
    expect(validateFileMagicBytes(validPdfBytes, "application/pdf")).toBe(true);

    const fakePdfBytes = new Uint8Array([0x00, 0x11, 0x22, 0x33, 0x44, 0x55, 0x66, 0x77]).buffer;
    expect(validateFileMagicBytes(fakePdfBytes, "application/pdf")).toBe(false);
  });

  it("validates PNG magic bytes correctly", () => {
    // 0x89, 0x50, 0x4E, 0x47
    const validPngBytes = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).buffer;
    expect(validateFileMagicBytes(validPngBytes, "image/png")).toBe(true);
  });

  it("parses plain text documents safely", async () => {
    const encoder = new TextEncoder();
    const textBuffer = encoder.encode("Radiance AI Architecture Specification\nVersion 2.0").buffer;

    const result = await parseDocumentFile({
      name: "architecture.txt",
      mime: "text/plain",
      buffer: textBuffer,
    });

    expect(result.error).toBeUndefined();
    expect(result.format).toBe("text");
    expect(result.text).toContain("Radiance AI Architecture");
    expect(result.wordCount).toBe(6);
  });

  it("rejects files exceeding the 10MB size limit", async () => {
    // Simulate oversized buffer (>10MB)
    const oversizedBuffer = new ArrayBuffer(11 * 1024 * 1024);

    const result = await parseDocumentFile({
      name: "huge.txt",
      mime: "text/plain",
      buffer: oversizedBuffer,
    });

    expect(result.error).toContain("10MB");
  });
});
