import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import { GET as getHealth } from "@/app/api/health/route";
import { POST as postImage } from "@/app/api/image/route";
import { POST as postFollowups } from "@/app/api/followups/route";
import { POST as postChat } from "@/app/api/chat/route";
import { circuitBreaker } from "@/lib/ai/circuit-breaker";

// Mock providers to avoid requiring live production API keys in integration tests
vi.mock("@/lib/ai/providers", () => ({
  getModelInstance: vi.fn().mockReturnValue({}),
}));

// Mock AI SDK streamText for chat route integration tests
vi.mock("ai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("ai")>();
  return {
    ...actual,
    streamText: vi.fn().mockImplementation(() => ({
      toDataStreamResponse: (options?: { headers?: Record<string, string> }) =>
        new Response('0:"Test response token"\n', {
          status: 200,
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            ...(options?.headers || {}),
          },
        }),
    })),
    generateText: vi.fn().mockResolvedValue({
      text: '["What are the best practices?", "How can we scale this?", "Can you provide tests?"]',
    }),
  };
});

describe("API Route Handlers Integration & Resilience Specifications", () => {
  beforeEach(() => {
    circuitBreaker.resetAll();
    vi.clearAllMocks();
  });

  describe("1. GET /api/health", () => {
    it("returns healthy status, platform info, and registered models with circuit status", async () => {
      const res = await getHealth();
      expect(res.status).toBe(200);

      const data = await res.json();
      expect(data.status).toBe("healthy");
      expect(data.platform).toBe("RADIANCE");
      expect(data.version).toBe("1.0.0");
      expect(typeof data.uptime).toBe("number");
      expect(Array.isArray(data.models)).toBe(true);
      expect(data.models.length).toBeGreaterThan(0);
      expect(data.models[0]).toHaveProperty("id");
      expect(data.models[0]).toHaveProperty("provider");
      expect(data.models[0]).toHaveProperty("isExhausted");
    });
  });

  describe("2. POST /api/image", () => {
    it("rejects invalid JSON payloads with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/image", {
        method: "POST",
        body: "invalid-json{",
        headers: { "Content-Type": "application/json" },
      });

      const res = await postImage(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Invalid JSON payload");
    });

    it("rejects empty prompt with HTTP 400 validation error", async () => {
      const req = new NextRequest("http://localhost:3000/api/image", {
        method: "POST",
        body: JSON.stringify({ prompt: "" }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await postImage(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Validation failed");
    });

    it("rejects prompts exceeding maximum length with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/image", {
        method: "POST",
        body: JSON.stringify({ prompt: "x".repeat(1001) }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await postImage(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Validation failed");
    });

    it("generates structured image target and seed for valid prompt", async () => {
      const req = new NextRequest("http://localhost:3000/api/image", {
        method: "POST",
        body: JSON.stringify({
          prompt: "A serene bioluminescent garden at midnight",
          width: 512,
          height: 512,
          seed: 42,
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await postImage(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.imageUrl).toContain("pollinations.ai");
      expect(data.imageUrl).toContain("bioluminescent");
      expect(data.seed).toBe(42);
      expect(data.dimensions).toEqual({ width: 512, height: 512 });
    });
  });

  describe("3. POST /api/followups", () => {
    it("rejects malformed requests with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/followups", {
        method: "POST",
        body: "bad-body",
        headers: { "Content-Type": "application/json" },
      });

      const res = await postFollowups(req);
      expect(res.status).toBe(400);
    });

    it("rejects missing assistant reply with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/followups", {
        method: "POST",
        body: JSON.stringify({ userTurn: "Hello" }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await postFollowups(req);
      expect(res.status).toBe(400);
    });

    it("returns contextual follow-up questions for valid response turn", async () => {
      const req = new NextRequest("http://localhost:3000/api/followups", {
        method: "POST",
        body: JSON.stringify({
          userTurn: "Explain transformer models",
          assistantReply: "Transformers use multi-head self-attention mechanisms to process sequence data.",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await postFollowups(req);
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(Array.isArray(data.questions)).toBe(true);
      expect(data.questions.length).toBe(3);
    });
  });

  describe("4. POST /api/chat", () => {
    it("rejects invalid JSON payloads with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: "invalid-json",
        headers: { "Content-Type": "application/json" },
      });

      const res = await postChat(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Invalid JSON payload");
    });

    it("rejects request missing messages array with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({ modelId: "groq-llama-3.3-70b" }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await postChat(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Validation error");
    });

    it("rejects request with empty messages array with HTTP 400", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: [] }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await postChat(req);
      expect(res.status).toBe(400);
      const data = await res.json();
      expect(data.error).toBe("Validation error");
    });

    it("returns streaming text response with provider headers on valid prompt", async () => {
      const req = new NextRequest("http://localhost:3000/api/chat", {
        method: "POST",
        body: JSON.stringify({
          messages: [
            {
              id: "msg_user_1",
              role: "user",
              content: "Hello Radiance",
              createdAt: Date.now(),
            },
          ],
          modelId: "groq-fast",
          mode: "build",
          tone: "default",
          language: "en",
        }),
        headers: { "Content-Type": "application/json" },
      });

      const res = await postChat(req);
      expect(res.status).toBe(200);
      expect(res.headers.get("X-Radiance-Provider")).toBe("groq");
      expect(res.headers.get("X-Radiance-Model")).toBe("groq-fast");

      const bodyText = await res.text();
      expect(bodyText).toContain('0:"Test response token"');
    });
  });
});
