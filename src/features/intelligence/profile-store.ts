import {
  PersonalIntelligenceProfileSchema,
  type MemoryCategory,
  type MemorySource,
  type PersonalIntelligenceProfile,
  type PersonalMemory,
  type PersonalizationScope,
  type PreferenceSignal,
} from "./profile-schema";

export const INTELLIGENCE_STORAGE_KEY = "radiance_personal_intelligence_v1";
const MAX_MEMORIES = 100;
const MAX_FEEDBACK = 200;
const TEMPORARY_MEMORY_MS = 30 * 24 * 60 * 60 * 1000;

export interface AddMemoryInput {
  content: string;
  category: MemoryCategory;
  importance: number;
  source: MemorySource;
  expiresAt?: number | null;
}

export type AddMemoryResult =
  | { ok: true; profile: PersonalIntelligenceProfile; memory: PersonalMemory }
  | { ok: false; reason: "invalid" | "sensitive" | "duplicate" | "limit"; existingId?: string };

function getBrowserStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

function createId(): string {
  try {
    return crypto.randomUUID();
  } catch {
    return `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 12)}`;
  }
}

export function createDefaultIntelligenceProfile(profileId = createId()): PersonalIntelligenceProfile {
  return {
    version: 1,
    profileId,
    updatedAt: Date.now(),
    personalizationEnabled: false,
    memories: [],
    preferenceFeedback: [],
  };
}

export function loadIntelligenceProfile(storage: Storage | null = getBrowserStorage()): PersonalIntelligenceProfile {
  if (!storage) return createDefaultIntelligenceProfile();
  try {
    const raw = storage.getItem(INTELLIGENCE_STORAGE_KEY);
    if (!raw) return createDefaultIntelligenceProfile();
    const parsed: unknown = JSON.parse(raw);
    const result = PersonalIntelligenceProfileSchema.safeParse(parsed);
    return result.success ? result.data : createDefaultIntelligenceProfile();
  } catch {
    return createDefaultIntelligenceProfile();
  }
}

export function saveIntelligenceProfile(
  profile: unknown,
  storage: Storage | null = getBrowserStorage()
): boolean {
  if (!storage) return false;
  const parsed = PersonalIntelligenceProfileSchema.safeParse(profile);
  if (!parsed.success) return false;
  try {
    storage.setItem(INTELLIGENCE_STORAGE_KEY, JSON.stringify(parsed.data));
    return true;
  } catch {
    return false;
  }
}

export function clearIntelligenceProfile(storage: Storage | null = getBrowserStorage()): boolean {
  if (!storage) return false;
  try {
    storage.removeItem(INTELLIGENCE_STORAGE_KEY);
    return true;
  } catch {
    return false;
  }
}

function normalizeText(value: string): string {
  return value.normalize("NFKC").toLowerCase().replace(/[\u0000-\u001f\u007f]/g, " ").replace(/[^\p{L}\p{N}+#]+/gu, " ").trim().replace(/\s+/g, " ");
}

function hasLuhnValidCardNumber(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 13 || digits.length > 19) return false;
  let sum = 0;
  let doubleDigit = false;
  for (let index = digits.length - 1; index >= 0; index -= 1) {
    let digit = Number(digits[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }
  return sum % 10 === 0;
}

export function containsBlockedSensitiveValue(value: string): boolean {
  const secretPatterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/i,
    /\b(?:password|passwd|secret|api[_ -]?key|access[_ -]?token|refresh[_ -]?token)\s*[:=]\s*\S+/i,
    /\bBearer\s+[A-Za-z0-9._~+/-]+=*/i,
    /\b(?:sk-(?:proj-)?[A-Za-z0-9_-]{16,}|gh[pousr]_[A-Za-z0-9]{20,}|glpat-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{12,}|AIza[0-9A-Za-z_-]{30,})\b/i,
    /\b\d{3}-\d{2}-\d{4}\b/,
  ];
  return secretPatterns.some((pattern) => pattern.test(value)) || hasLuhnValidCardNumber(value);
}

function duplicateMemory(memories: PersonalMemory[], candidate: string): PersonalMemory | undefined {
  const normalized = normalizeText(candidate);
  const tokens = new Set(normalized.split(" ").filter(Boolean));
  if (tokens.size === 0) return undefined;
  return memories.find((memory) => {
    const existingNormalized = normalizeText(memory.content);
    if (existingNormalized === normalized) return true;
    const existingTokens = new Set(existingNormalized.split(" ").filter(Boolean));
    const intersection = [...tokens].filter((token) => existingTokens.has(token)).length;
    const union = new Set([...tokens, ...existingTokens]).size;
    return union > 0 && intersection / union >= 0.8;
  });
}

export function addMemory(
  profile: PersonalIntelligenceProfile,
  input: AddMemoryInput,
  options: { now?: number; id?: () => string } = {}
): AddMemoryResult {
  const content = input.content.replace(/\u0000/g, "").trim().replace(/\s+/g, " ");
  if (!content || content.length > 500 || !Number.isInteger(input.importance) || input.importance < 1 || input.importance > 5) {
    return { ok: false, reason: "invalid" };
  }
  if (containsBlockedSensitiveValue(content)) return { ok: false, reason: "sensitive" };
  const existing = duplicateMemory(profile.memories, content);
  if (existing) return { ok: false, reason: "duplicate", existingId: existing.id };
  if (profile.memories.length >= MAX_MEMORIES) return { ok: false, reason: "limit" };

  const now = options.now ?? Date.now();
  const memory: PersonalMemory = {
    id: (options.id ?? createId)(),
    content,
    category: input.category,
    importance: input.importance,
    confidence: "user-confirmed",
    createdAt: now,
    updatedAt: now,
    expiresAt: input.expiresAt === undefined
      ? input.category === "temporary" ? now + TEMPORARY_MEMORY_MS : null
      : input.expiresAt,
    source: input.source,
  };
  const validated = PersonalIntelligenceProfileSchema.safeParse({
    ...profile,
    updatedAt: now,
    memories: [...profile.memories, memory],
  });
  if (!validated.success) return { ok: false, reason: "invalid" };
  return { ok: true, profile: validated.data, memory };
}

export function updateMemory(
  profile: PersonalIntelligenceProfile,
  id: string,
  changes: Partial<Pick<PersonalMemory, "content" | "category" | "importance" | "expiresAt">>,
  now = Date.now()
): PersonalIntelligenceProfile | null {
  const existing = profile.memories.find((memory) => memory.id === id);
  if (!existing) return null;
  const content = (changes.content ?? existing.content).replace(/\u0000/g, "").trim().replace(/\s+/g, " ");
  if (!content || content.length > 500 || containsBlockedSensitiveValue(content)) return null;
  const duplicate = profile.memories.find((memory) => memory.id !== id && duplicateMemory([memory], content));
  if (duplicate) return null;
  const memories = profile.memories.map((memory) => memory.id === id ? {
    ...memory,
    ...changes,
    content,
    updatedAt: now,
  } : memory);
  const validated = PersonalIntelligenceProfileSchema.safeParse({ ...profile, updatedAt: now, memories });
  return validated.success ? validated.data : null;
}

export function deleteMemory(profile: PersonalIntelligenceProfile, id: string): PersonalIntelligenceProfile {
  return { ...profile, updatedAt: Date.now(), memories: profile.memories.filter((memory) => memory.id !== id) };
}

export function setPersonalizationEnabled(
  profile: PersonalIntelligenceProfile,
  enabled: boolean,
  now = Date.now()
): PersonalIntelligenceProfile {
  return { ...profile, personalizationEnabled: enabled, updatedAt: now };
}

export function recordPreferenceFeedback(
  profile: PersonalIntelligenceProfile,
  input: { signal: PreferenceSignal; scope: PersonalizationScope; sourceMessageId?: string },
  options: { now?: number; id?: () => string } = {}
): PersonalIntelligenceProfile {
  const now = options.now ?? Date.now();
  const event = {
    ...input,
    id: (options.id ?? createId)(),
    createdAt: now,
  };
  const preferenceFeedback = [...profile.preferenceFeedback, event].slice(-MAX_FEEDBACK);
  const validated = PersonalIntelligenceProfileSchema.safeParse({ ...profile, updatedAt: now, preferenceFeedback });
  return validated.success ? validated.data : profile;
}

export function removePreferenceFeedback(
  profile: PersonalIntelligenceProfile,
  feedbackId: string,
  now = Date.now()
): PersonalIntelligenceProfile {
  return {
    ...profile,
    updatedAt: now,
    preferenceFeedback: profile.preferenceFeedback.filter((feedback) => feedback.id !== feedbackId),
  };
}

export function clearPreferenceFeedback(profile: PersonalIntelligenceProfile, now = Date.now()): PersonalIntelligenceProfile {
  return { ...profile, updatedAt: now, preferenceFeedback: [] };
}
