// "Recently read": PDFs the user chose to keep on the device (IndexedDB), so they open again offline.
// Nothing leaves the device. File bytes and the small list entries live in separate stores,
// so showing the list never loads whole books into memory.

export interface RecentEntry {
  /** Same document key as reading positions (SHA-256 of the bytes). */
  key: string;
  name: string;
  size: number;
  openedAt: number;
}

export interface RecentLibrary {
  /** Newest first. */
  list(): Promise<RecentEntry[]>;
  /** Stores (or replaces) a file and drops the oldest ones beyond the limit. */
  save(entry: RecentEntry, data: ArrayBuffer): Promise<void>;
  /** Marks an already stored file as just opened. Returns false if it is not stored. */
  touch(key: string): Promise<boolean>;
  load(key: string): Promise<File | null>;
  remove(key: string): Promise<void>;
  clear(): Promise<void>;
}

/** How many PDFs are kept at most; the oldest is removed when a new one comes in. */
export const RECENT_LIMIT = 12;

const DB_NAME = 'losh';
const DB_VERSION = 1;
const ENTRIES = 'recent';
const FILES = 'files';

function request<T>(req: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function finished(tx: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = tx.onerror = () => reject(tx.error);
  });
}

export function createRecentLibrary(): RecentLibrary {
  let db: Promise<IDBDatabase> | null = null;
  const open = () =>
    (db ??= new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = () => {
        req.result.createObjectStore(ENTRIES, { keyPath: 'key' });
        req.result.createObjectStore(FILES);
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => {
        db = null;
        reject(req.error);
      };
    }));

  const list = async () => {
    const tx = (await open()).transaction(ENTRIES);
    const all = await request(tx.objectStore(ENTRIES).getAll() as IDBRequest<RecentEntry[]>);
    return all.sort((a, b) => b.openedAt - a.openedAt);
  };

  const removeMany = async (keys: string[]) => {
    if (!keys.length) return;
    const tx = (await open()).transaction([ENTRIES, FILES], 'readwrite');
    for (const key of keys) {
      tx.objectStore(ENTRIES).delete(key);
      tx.objectStore(FILES).delete(key);
    }
    await finished(tx);
  };

  return {
    list,

    async save(entry, data) {
      const tx = (await open()).transaction([ENTRIES, FILES], 'readwrite');
      tx.objectStore(FILES).put(data, entry.key);
      tx.objectStore(ENTRIES).put(entry);
      await finished(tx);
      const extra = (await list()).slice(RECENT_LIMIT);
      await removeMany(extra.map((e) => e.key));
    },

    async touch(key) {
      const tx = (await open()).transaction(ENTRIES, 'readwrite');
      const store = tx.objectStore(ENTRIES);
      const entry = await request(store.get(key) as IDBRequest<RecentEntry | undefined>);
      if (entry) store.put({ ...entry, openedAt: Date.now() });
      await finished(tx);
      return !!entry;
    },

    async load(key) {
      const tx = (await open()).transaction([ENTRIES, FILES]);
      const [entry, data] = await Promise.all([
        request(tx.objectStore(ENTRIES).get(key) as IDBRequest<RecentEntry | undefined>),
        request(tx.objectStore(FILES).get(key) as IDBRequest<ArrayBuffer | undefined>),
      ]);
      return entry && data ? new File([data], entry.name, { type: 'application/pdf' }) : null;
    },

    remove: (key) => removeMany([key]),

    async clear() {
      const tx = (await open()).transaction([ENTRIES, FILES], 'readwrite');
      tx.objectStore(ENTRIES).clear();
      tx.objectStore(FILES).clear();
      await finished(tx);
    },
  };
}
