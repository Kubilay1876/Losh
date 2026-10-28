import type { KeyValueStore } from '@losh/core';

/** KeyValueStore on top of localStorage. Survives blocked storage (private mode) by doing nothing. */
export function createLocalStore(): KeyValueStore {
  return {
    async get<T>(key: string) {
      try {
        const raw = localStorage.getItem(key);
        return raw === null ? undefined : (JSON.parse(raw) as T);
      } catch {
        return undefined;
      }
    },
    async set(key, value) {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // Storage full or blocked: settings simply won't persist.
      }
    },
    async remove(key) {
      try {
        localStorage.removeItem(key);
      } catch {
        // ignore
      }
    },
  };
}
