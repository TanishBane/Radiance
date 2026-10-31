import { Conversation } from "@/lib/types/chat";

const CONV_PREFIX = "radiance_chat_";
const LEGACY_PREFIX = "chat_";

export const safeLocalStorage = {
  get<T>(key: string, defaultValue: T): T {
    if (typeof window === "undefined") return defaultValue;
    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): boolean {
    if (typeof window === "undefined") return false;
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.warn(`[Radiance Storage] Storage quota reached or write failed for key: ${key}`, e);
      return false;
    }
  },

  remove(key: string): void {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.removeItem(key);
    } catch {}
  },

  /**
   * Saves a conversation, deliberately sanitizing heavy base64 strings
   * so localStorage never exceeds the 5MB browser quota.
   */
  saveConversation(conv: Conversation): boolean {
    const sanitized: Conversation = {
      ...conv,
      messages: conv.messages.map((m) => ({
        ...m,
        attachments: m.attachments?.map((a) => ({
          ...a,
          dataUrl: undefined, // Strip ephemeral base64 to protect storage quota
        })),
      })),
    };
    return this.set(`${CONV_PREFIX}${conv.id}`, sanitized);
  },

  getConversation(id: string): Conversation | null {
    return this.get<Conversation | null>(`${CONV_PREFIX}${id}`, null);
  },

  listConversations(): Conversation[] {
    if (typeof window === "undefined") return [];
    try {
      const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(CONV_PREFIX));
      const convs = keys
        .map((k) => safeLocalStorage.get<Conversation | null>(k, null))
        .filter((c): c is Conversation => c !== null);

      return convs.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return b.updatedAt - a.updatedAt;
      });
    } catch {
      return [];
    }
  },

  deleteConversation(id: string): void {
    this.remove(`${CONV_PREFIX}${id}`);
  },

  deleteAllConversations(): void {
    if (typeof window === "undefined") return;
    try {
      const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(CONV_PREFIX));
      keys.forEach((k) => window.localStorage.removeItem(k));
    } catch {}
  },

  /**
   * Scans for legacy Tanix AI chats stored under `chat_*`
   * and allows safe migration into Radiance format without losing historical conversations.
   */
  listLegacyChats(): Array<{ id: string; title: string; ts: number; messageCount: number }> {
    if (typeof window === "undefined") return [];
    try {
      const legacyKeys = Object.keys(window.localStorage).filter((k) => k.startsWith(LEGACY_PREFIX));
      return legacyKeys.map((k) => {
        const raw = safeLocalStorage.get<{ id: string; title?: string; ts?: number; history?: unknown[] }>(k, { id: k });
        return {
          id: raw.id || k,
          title: raw.title || "Legacy Chat",
          ts: raw.ts || Date.now(),
          messageCount: Array.isArray(raw.history) ? raw.history.length : 0,
        };
      });
    } catch {
      return [];
    }
  },

  importLegacyChat(legacyId: string): Conversation | null {
    if (typeof window === "undefined") return null;
    try {
      const raw = safeLocalStorage.get<{ id: string; title?: string; ts?: number; pinned?: boolean; history?: Array<{ role: string; text?: string; name?: string }> }>(
        legacyId.startsWith(LEGACY_PREFIX) ? legacyId : `${LEGACY_PREFIX}${legacyId}`,
        { id: legacyId }
      );
      if (!raw || !Array.isArray(raw.history)) return null;

      const newId = `imported_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const imported: Conversation = {
        id: newId,
        title: raw.title || "Imported Legacy Chat",
        createdAt: raw.ts || Date.now(),
        updatedAt: raw.ts || Date.now(),
        pinned: !!raw.pinned,
        messages: raw.history.map((m, idx) => ({
          id: `${newId}_msg_${idx}`,
          role: m.role === "user" ? "user" : "assistant",
          content: m.text || "",
          createdAt: (raw.ts || Date.now()) + idx * 1000,
        })),
      };

      this.saveConversation(imported);
      return imported;
    } catch {
      return null;
    }
  },
};
