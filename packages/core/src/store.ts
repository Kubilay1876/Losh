/** Minimal async key-value storage, implemented per platform (localStorage, chrome.storage…). */
export interface KeyValueStore {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set(key: string, value: unknown): Promise<void>;
  remove(key: string): Promise<void>;
}

export const STORAGE_KEYS = {
  settings: 'losh.settings',
  position: (docKey: string) => `losh.pos.${docKey}`,
} as const;

export function createMemoryStore(initial: Record<string, unknown> = {}): KeyValueStore {
  const data = new Map(Object.entries(initial));
  return {
    async get<T>(key: string) {
      return data.get(key) as T | undefined;
    },
    async set(key, value) {
      data.set(key, value);
    },
    async remove(key) {
      data.delete(key);
    },
  };
}
