import { describe, expect, it } from 'vitest';
import { createMemoryStore, STORAGE_KEYS } from './store';

describe('store', () => {
  it('reads back what it wrote and forgets removed keys', async () => {
    const store = createMemoryStore();
    await store.set('a', { page: 3 });
    expect(await store.get('a')).toEqual({ page: 3 });
    await store.remove('a');
    expect(await store.get('a')).toBeUndefined();
  });

  it('namespaces reading positions by document key', () => {
    expect(STORAGE_KEYS.position('abc')).toBe('losh.pos.abc');
  });
});
