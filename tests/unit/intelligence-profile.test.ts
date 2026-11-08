import { beforeEach, describe, expect, it } from "vitest";
import {
  addMemory,
  clearIntelligenceProfile,
  createDefaultIntelligenceProfile,
  deleteMemory,
  loadIntelligenceProfile,
  recordPreferenceFeedback,
  saveIntelligenceProfile,
  updateMemory,
  INTELLIGENCE_STORAGE_KEY,
} from "@/features/intelligence/profile-store";
import { buildPersonalizationContext } from "@/features/intelligence/retrieval";

describe("local Personal Intelligence profile", () => {
  beforeEach(() => window.localStorage.clear());

  it("defaults personalization off and round-trips a versioned local profile", () => {
    const profile = createDefaultIntelligenceProfile("profile-test");
    expect(profile.personalizationEnabled).toBe(false);
    expect(profile.memories).toEqual([]);
    expect(profile.preferenceFeedback).toEqual([]);
    expect(saveIntelligenceProfile(profile)).toBe(true);
    expect(window.localStorage.getItem(INTELLIGENCE_STORAGE_KEY)).toContain('"version":1');
    expect(loadIntelligenceProfile()).toEqual(profile);
  });

  it("stores explicitly saved memory with provenance and does not silently replace a duplicate", () => {
    const profile = createDefaultIntelligenceProfile("profile-test");
    const first = addMemory(profile, {
      content: "I use Python for data analysis.",
      category: "knowledge",
      importance: 3,
      source: { type: "conversation", conversationId: "conv_a", messageId: "msg_a" },
    }, { now: 100, id: () => "memory-a" });
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(first.memory.source).toEqual({ type: "conversation", conversationId: "conv_a", messageId: "msg_a" });

    const duplicate = addMemory(first.profile, {
      content: "  I USE Python for data analysis! ",
      category: "knowledge",
      importance: 5,
      source: { type: "manual" },
    }, { now: 200, id: () => "memory-b" });
    expect(duplicate).toMatchObject({ ok: false, reason: "duplicate", existingId: "memory-a" });
    expect(first.profile.memories[0].importance).toBe(3);
    expect(first.profile.memories).toHaveLength(1);
  });

  it.each([
    "password: sunflower123",
    "Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxIn0.signature",
    "-----BEGIN PRIVATE KEY-----\\nMIIEvQIBADANBgkqhkiG9w0BAQEFAASC",
    "api_key = sk-proj-123456789012345678901234",
    "My SSN is 123-45-6789",
  ])("rejects credential-like or government-ID content (%s)", (content) => {
    const result = addMemory(createDefaultIntelligenceProfile("profile-test"), {
      content,
      category: "context",
      importance: 3,
      source: { type: "manual" },
    });
    expect(result).toMatchObject({ ok: false, reason: "sensitive" });
  });

  it("updates a saved item while preserving its source, and deletes it explicitly", () => {
    const created = addMemory(createDefaultIntelligenceProfile("profile-test"), {
      content: "Use metric units.", category: "preference", importance: 3, source: { type: "manual" },
    }, { now: 100, id: () => "memory-a" });
    if (!created.ok) throw new Error("fixture was rejected");

    const edited = updateMemory(created.profile, "memory-a", {
      content: "Use metric units and include examples.", importance: 5,
    }, 300);
    expect(edited?.memories[0]).toMatchObject({
      id: "memory-a", content: "Use metric units and include examples.", importance: 5,
      createdAt: 100, updatedAt: 300, source: { type: "manual" },
    });
    expect(deleteMemory(edited!, "memory-a").memories).toEqual([]);
  });

  it("rejects malformed persisted data and reports failed browser writes", () => {
    window.localStorage.setItem(INTELLIGENCE_STORAGE_KEY, JSON.stringify({ version: 9, memories: [{ content: "bad" }] }));
    expect(loadIntelligenceProfile()).toMatchObject({ version: 1, personalizationEnabled: false, memories: [] });

    const storage = {
      getItem: () => null,
      setItem: () => { throw new Error("quota"); },
      removeItem: () => undefined,
      clear: () => undefined,
      key: () => null,
      get length() { return 0; },
    } as unknown as Storage;
    expect(saveIntelligenceProfile(createDefaultIntelligenceProfile("profile-test"), storage)).toBe(false);
  });

  it("deletes the complete profile without touching conversation records", () => {
    const profile = createDefaultIntelligenceProfile("profile-test");
    const memory = addMemory(profile, {
      content: "Working on a gardening project.", category: "project", importance: 3, source: { type: "manual" },
    }, { now: 100, id: () => "memory-a" });
    if (!memory.ok) throw new Error("fixture was rejected");
    saveIntelligenceProfile(memory.profile);
    window.localStorage.setItem("radiance_chat_keep", "conversation");

    expect(clearIntelligenceProfile()).toBe(true);
    expect(loadIntelligenceProfile()).toMatchObject({ personalizationEnabled: false, memories: [], preferenceFeedback: [] });
    expect(window.localStorage.getItem("radiance_chat_keep")).toBe("conversation");
  });

  it("records explicit response directions and supersedes older directions only in the effective view", () => {
    const first = recordPreferenceFeedback(createDefaultIntelligenceProfile("profile-test"), {
      signal: "more-concise", scope: "build", sourceMessageId: "assistant-a",
    }, { now: 100, id: () => "feedback-a" });
    const second = recordPreferenceFeedback(first, {
      signal: "more-detailed", scope: "build", sourceMessageId: "assistant-b",
    }, { now: 200, id: () => "feedback-b" });
    expect(second.preferenceFeedback).toHaveLength(2);
    expect(buildPersonalizationContext({ ...second, personalizationEnabled: true }, "How do I debug Python?", "build", 300))
      .toMatchObject({ preferences: [{ id: "feedback-b", signal: "more-detailed", scope: "build" }] });
  });

  it("does not apply another task scope or expired feedback", () => {
    const profile = recordPreferenceFeedback(createDefaultIntelligenceProfile("profile-test"), {
      signal: "more-examples", scope: "plan", sourceMessageId: "assistant-a",
    }, { now: 1_000, id: () => "feedback-a" });
    expect(buildPersonalizationContext({ ...profile, personalizationEnabled: true }, "Explain a Python error", "build", 2_000).preferences)
      .toEqual([]);
    expect(buildPersonalizationContext({ ...profile, personalizationEnabled: true }, "Explain a Python error", "plan", 300 * 24 * 60 * 60 * 1000).preferences)
      .toEqual([]);
  });

  it("sends only opt-in, relevant, non-expired memory facts within the retrieval bound", () => {
    let profile = createDefaultIntelligenceProfile("profile-test");
    const records = [
      ["python", "I use Python for data analysis and prefer practical examples."],
      ["garden", "I am planning a small herb garden on a sunny balcony."],
      ["expired", "I am temporarily learning Rust for a short course."],
    ] as const;
    for (const [id, content] of records) {
      const result = addMemory(profile, {
        content, category: "context", importance: 3,
        source: { type: "manual" },
        ...(id === "expired" ? { expiresAt: 500 } : {}),
      }, { now: 100, id: () => id });
      if (!result.ok) throw new Error(`fixture ${id} was rejected`);
      profile = result.profile;
    }

    expect(buildPersonalizationContext(profile, "Python data examples", "build", 600).memories).toEqual([]);
    const enabled = { ...profile, personalizationEnabled: true };
    const context = buildPersonalizationContext(enabled, "Python data examples", "build", 600);
    expect(context.memories.map((memory) => memory.id)).toEqual(["python"]);
    expect(JSON.stringify(context)).not.toContain("sunny balcony");
    expect(JSON.stringify(context)).not.toContain("Rust");
  });

  it("caps provider context and ignores generic queries with no useful token overlap", () => {
    let profile = { ...createDefaultIntelligenceProfile("profile-test"), personalizationEnabled: true };
    for (let index = 0; index < 20; index += 1) {
      const result = addMemory(profile, {
        content: `Python project note ${index} includes analysis and practical examples topicword${index}.`,
        category: "project", importance: 3, source: { type: "manual" },
      }, { now: index + 1, id: () => `memory-${index}` });
      if (result.ok) profile = result.profile;
    }
    expect(buildPersonalizationContext(profile, "Hello", "build", 100).memories).toEqual([]);
    expect(buildPersonalizationContext(profile, "Python project analysis examples", "build", 100).memories).toHaveLength(5);
  });
});
