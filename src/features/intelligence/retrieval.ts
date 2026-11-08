import type { PersonalIntelligenceProfile, PersonalMemory, PersonalizationScope, PreferenceFeedback } from "./profile-schema";

export interface PersonalizationContext {
  memories: Array<Pick<PersonalMemory, "id" | "category" | "content">>;
  preferences: PreferenceFeedback[];
}

const MAX_RETRIEVED_MEMORIES = 5;
const MAX_CONTEXT_CHARS = 1_800;
const PREFERENCE_MAX_AGE_MS = 180 * 24 * 60 * 60 * 1000;
const STOP_WORDS = new Set([
  "about", "after", "also", "and", "are", "can", "for", "from", "how", "into", "its", "just", "more", "not", "our", "the", "their", "then", "there", "these", "this", "those", "through", "use", "using", "was", "what", "when", "where", "which", "with", "would", "you", "your",
]);

function tokens(value: string): Set<string> {
  return new Set(
    value.normalize("NFKC").toLowerCase().match(/[\p{L}\p{N}+#]{2,}/gu)?.filter((token) => !STOP_WORDS.has(token)) ?? []
  );
}

function preferenceAxis(signal: PreferenceFeedback["signal"]): string {
  if (signal === "more-concise" || signal === "more-detailed") return "length";
  if (signal === "more-technical" || signal === "simpler-language") return "complexity";
  if (signal === "more-examples") return "examples";
  return "practicality";
}

function relevantPreferences(
  profile: PersonalIntelligenceProfile,
  scope: PersonalizationScope,
  now: number
): PreferenceFeedback[] {
  const eligible = profile.preferenceFeedback
    .filter((event) => (event.scope === "global" || event.scope === scope) && now - event.createdAt <= PREFERENCE_MAX_AGE_MS)
    .sort((left, right) => right.createdAt - left.createdAt);
  const latestByAxis = new Map<string, PreferenceFeedback>();
  for (const event of eligible) {
    const axis = preferenceAxis(event.signal);
    if (!latestByAxis.has(axis)) latestByAxis.set(axis, event);
  }
  return [...latestByAxis.values()].slice(0, 4);
}

function memoryScore(queryTokens: Set<string>, memory: PersonalMemory, now: number): number {
  const memoryTokens = tokens(memory.content);
  if (memoryTokens.size === 0) return 0;
  let intersection = 0;
  for (const token of queryTokens) if (memoryTokens.has(token)) intersection += 1;
  if (intersection === 0) return 0;
  const queryCoverage = intersection / queryTokens.size;
  const memoryCoverage = intersection / memoryTokens.size;
  const ageDays = Math.max(0, now - memory.updatedAt) / (24 * 60 * 60 * 1000);
  const recency = Math.exp(-ageDays / 180);
  const importance = memory.importance / 5;
  return queryCoverage * 0.65 + memoryCoverage * 0.2 + recency * 0.1 + importance * 0.05;
}

export function buildPersonalizationContext(
  profile: PersonalIntelligenceProfile,
  query: string,
  scope: PersonalizationScope,
  now = Date.now()
): PersonalizationContext {
  if (!profile.personalizationEnabled) return { memories: [], preferences: [] };
  const queryTokens = tokens(query);
  const preferences = relevantPreferences(profile, scope, now);
  if (queryTokens.size === 0) return { memories: [], preferences };

  const ranked = profile.memories
    .filter((memory) => memory.expiresAt === null || memory.expiresAt > now)
    .map((memory) => ({ memory, score: memoryScore(queryTokens, memory, now) }))
    .filter(({ score }) => score >= 0.2)
    .sort((left, right) => right.score - left.score || right.memory.importance - left.memory.importance || right.memory.updatedAt - left.memory.updatedAt);

  const memories: PersonalizationContext["memories"] = [];
  let totalChars = 0;
  for (const { memory } of ranked) {
    if (memories.length >= MAX_RETRIEVED_MEMORIES) break;
    const cost = memory.content.length + memory.category.length;
    if (totalChars + cost > MAX_CONTEXT_CHARS) continue;
    memories.push({ id: memory.id, category: memory.category, content: memory.content });
    totalChars += cost;
  }
  return { memories, preferences };
}

export function toProviderPersonalization(context: PersonalizationContext) {
  return {
    memories: context.memories.map(({ category, content }) => ({ category, content })),
    preferences: context.preferences.map(({ signal }) => signal),
  };
}
