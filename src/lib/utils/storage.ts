import { Conversation } from "@/lib/types/chat";

const CONV_PREFIX = "radiance_chat_";

const memoryStore = new Map<string, string>();

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    if (window.localStorage && typeof window.localStorage.getItem === "function") {
      return window.localStorage;
    }
  } catch {}
  return null;
}

export const safeLocalStorage = {
  get<T>(key: string, defaultValue: T): T {
    try {
      const storage = getStorage();
      const item = storage ? storage.getItem(key) : memoryStore.get(key);
      return item ? (JSON.parse(item) as T) : defaultValue;
    } catch {
      return defaultValue;
    }
  },

  set<T>(key: string, value: T): boolean {
    try {
      const serialized = JSON.stringify(value);
      const storage = getStorage();
      if (storage) {
        storage.setItem(key, serialized);
      } else {
        memoryStore.set(key, serialized);
      }
      return true;
    } catch (e) {
      console.warn(`[Radiance Storage] Storage quota reached or write failed for key: ${key}`, e);
      return false;
    }
  },

  remove(key: string): void {
    try {
      const storage = getStorage();
      if (storage) {
        storage.removeItem(key);
      } else {
        memoryStore.delete(key);
      }
    } catch {}
  },

  listConversations(): Conversation[] {
    try {
      const storage = getStorage();
      const keys = storage
        ? Object.keys(storage).filter((k) => k.startsWith(CONV_PREFIX))
        : Array.from(memoryStore.keys()).filter((k) => k.startsWith(CONV_PREFIX));
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
    try {
      const storage = getStorage();
      if (storage) {
        const keys = Object.keys(storage).filter((k) => k.startsWith(CONV_PREFIX));
        keys.forEach((k) => storage.removeItem(k));
      } else {
        const keys = Array.from(memoryStore.keys()).filter((k) => k.startsWith(CONV_PREFIX));
        keys.forEach((k) => memoryStore.delete(k));
      }
    } catch {}
  },
};
