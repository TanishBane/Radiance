import mammoth from "mammoth";
import { Attachment } from "@/lib/types/chat";

export interface ParsedDocumentResult {
  text: string;
  wordCount: number;
  format: "docx" | "pdf" | "text" | "csv" | "unknown";
  error?: string;
}

/**
 * Validates file signature (magic bytes) to prevent extension spoofing.
 */
export function validateFileMagicBytes(buffer: ArrayBuffer, mime: string): boolean {
  const bytes = new Uint8Array(buffer.slice(0, 8));

  // PDF: %PDF (0x25, 0x50, 0x44, 0x46)
  if (mime === "application/pdf") {
    return bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46;
  }

  // DOCX: PK.. (ZIP archive 0x50, 0x4B, 0x03, 0x04)
  if (
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    mime.includes("word")
  ) {
    return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04;
  }

  // PNG: 0x89 0x50 0x4E 0x47
  if (mime === "image/png") {
    return bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
  }

  // JPEG: 0xFF 0xD8 0xFF
  if (mime === "image/jpeg") {
    return bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  }

  // Plain text / CSV doesn't have strict magic bytes
  return true;
}

/**
 * Parses binary or text file into structured text content for model injection.
 */
export async function parseDocumentFile(
  file: File | { name: string; buffer: ArrayBuffer; mime: string }
): Promise<ParsedDocumentResult> {
  const name = "name" in file ? file.name : "unnamed";
  const mime = "type" in file ? file.type : file.mime;
  const buffer = "arrayBuffer" in file ? await file.arrayBuffer() : file.buffer;

  // 1. Check file size (10MB limit)
  if (buffer.byteLength > 10 * 1024 * 1024) {
    return {
      text: "",
      wordCount: 0,
      format: "unknown",
      error: "File size exceeds the 10MB limit.",
    };
  }

  // 2. Validate Magic Bytes
  if (!validateFileMagicBytes(buffer, mime)) {
    return {
      text: "",
      wordCount: 0,
      format: "unknown",
      error: "File content does not match the claimed file type signature.",
    };
  }

  // 3. Process DOCX with Mammoth
  if (
    name.endsWith(".docx") ||
    mime === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
  ) {
    try {
      const result = await mammoth.extractRawText({ arrayBuffer: buffer });
      const cleanText = result.value.trim().replace(/\u0000/g, "");
      const words = cleanText ? cleanText.split(/\s+/).length : 0;
      return {
        text: cleanText,
        wordCount: words,
        format: "docx",
      };
    } catch (err) {
      return {
        text: "",
        wordCount: 0,
        format: "docx",
        error: `Failed to extract text from DOCX archive: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  // 4. Process Plain Text / CSV / Markdown
  if (
    name.endsWith(".txt") ||
    name.endsWith(".csv") ||
    name.endsWith(".md") ||
    name.endsWith(".json") ||
    mime.startsWith("text/") ||
    mime === "application/json"
  ) {
    try {
      const decoder = new TextDecoder("utf-8");
      const decoded = decoder.decode(buffer);
      const cleanText = decoded.trim().replace(/\u0000/g, "");
      const words = cleanText ? cleanText.split(/\s+/).length : 0;
      return {
        text: cleanText,
        wordCount: words,
        format: name.endsWith(".csv") ? "csv" : "text",
      };
    } catch (err) {
      return {
        text: "",
        wordCount: 0,
        format: "text",
        error: `Failed to decode text file: ${err instanceof Error ? err.message : String(err)}`,
      };
    }
  }

  // 5. PDF Documents: Mark for native multimodal model processing
  if (name.endsWith(".pdf") || mime === "application/pdf") {
    return {
      text: `[PDF Document: ${name} (${(buffer.byteLength / 1024).toFixed(1)} KB)]`,
      wordCount: 0,
      format: "pdf",
    };
  }

  return {
    text: "",
    wordCount: 0,
    format: "unknown",
    error: "Unsupported file format for text extraction.",
  };
}

/**
 * Normalizes an uploaded file into an Attachment object.
 */
export async function createAttachmentFromFile(file: File): Promise<Attachment> {
  const isImage = file.type.startsWith("image/");
  const isPdf = file.type === "application/pdf" || file.name.endsWith(".pdf");
  const isDoc = file.name.endsWith(".docx");
  const isCsv = file.name.endsWith(".csv");

  let type: Attachment["type"] = "text";
  if (isImage) type = "image";
  else if (isPdf) type = "pdf";
  else if (isDoc) type = "doc";
  else if (isCsv) type = "csv";

  let dataUrl: string | undefined = undefined;
  let extractedText: string | undefined = undefined;

  if (isImage || isPdf) {
    try {
      // Generate ephemeral preview dataUrl for images and base64 for PDFs
      dataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error("Failed to read file preview"));
        reader.readAsDataURL(file);
      });
    } catch {
      // Non-fatal if dataUrl generation fails
    }
  }

  if (!isImage) {
    // Extract document text
    const parsed = await parseDocumentFile(file);
    if (!parsed.error) {
      extractedText = parsed.text;
    }
  }

  return {
    id: `att_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: file.name,
    type,
    mime: file.type || "application/octet-stream",
    size: file.size,
    dataUrl,
    extractedText,
  };
}
