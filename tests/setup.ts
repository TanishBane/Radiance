// Vitest setup for JSDOM and Node 22 compatibility

function createStorage() {
  const map = new Map<string, string>();
  const storage: Record<string, any> = {
    getItem(key: string) {
      return map.has(key) ? map.get(key)! : null;
    },
    setItem(key: string, value: string) {
      const strVal = String(value);
      map.set(key, strVal);
      storage[key] = strVal;
    },
    removeItem(key: string) {
      map.delete(key);
      delete storage[key];
    },
    clear() {
      map.clear();
      for (const k of Object.keys(storage)) {
        if (!["getItem", "setItem", "removeItem", "clear", "key", "length"].includes(k)) {
          delete storage[k];
        }
      }
    },
    key(index: number) {
      return Array.from(map.keys())[index] ?? null;
    },
    get length() {
      return map.size;
    },
  };
  return storage;
}

if (typeof window !== "undefined") {
  const mockStorage = createStorage();
  try {
    Object.defineProperty(window, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  } catch {
    (window as any).localStorage = mockStorage;
  }
}

if (typeof globalThis !== "undefined") {
  const mockStorage = createStorage();
  try {
    Object.defineProperty(globalThis, "localStorage", {
      value: mockStorage,
      writable: true,
      configurable: true,
    });
  } catch {
    (globalThis as any).localStorage = mockStorage;
  }
}
