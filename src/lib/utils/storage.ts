import { Conversation } from "@/lib/types/chat";

const CONV_PREFIX = "radiance_chat_";

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

  listConversations(): Conversation[] {
    if (typeof window === "undefined") return [];
    try {
      const keys = Object.keys(window.localStorage).filter((k) => k.startsWith(CONV_PREFIX));
      const convs: Conversation[] = [];
      for (const k of keys) {
        const item = safeLocalStorage.get<Conversation | null>(k, null);
        if (item && item.id && Array.isArray(item.messages)) {
          convs.push(item);
        }
      }
      return convs.sort((a, b) => b.updatedAt - a.updatedAt);
    } catch {
      return [];
    }
  },

  getConversation(id: string): Conversation | null {
    return this.get<Conversation | null>(`${CONV_PREFIX}${id}`, null);
  },

  saveConversation(conv: Conversation): boolean {
    return this.set(`${CONV_PREFIX}${conv.id}`, conv);
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
};
