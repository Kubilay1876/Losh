import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { DEFAULT_SETTINGS, detectLocale, sanitizeSettings, STORAGE_KEYS, type KeyValueStore, type Settings } from '@losh/core';

const SAVE_DELAY_MS = 300;

/** The saved settings; a first visit gets the browser's language. */
export async function loadSettings(store: KeyValueStore): Promise<Settings> {
  const raw = await store.get(STORAGE_KEYS.settings);
  const s = sanitizeSettings(raw);
  if (raw === undefined) s.locale = detectLocale(navigator.languages ?? []);
  return s;
}

/**
 * Loads settings once, then saves changes with a short delay (sliders fire many events).
 * Pages that loaded the settings before drawing (the prerendered welcome page) pass them as `initial`.
 */
export function useSettings(store: KeyValueStore, initial?: Settings): [Settings, (patch: Partial<Settings>) => void, boolean] {
  const [settings, setSettings] = useState<Settings>(initial ?? DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(!!initial);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    if (initial) return;
    let cancelled = false;
    void loadSettings(store).then((s) => {
      if (cancelled) return;
      setSettings(s);
      setLoaded(true);
    });
    return () => {
      cancelled = true;
    };
  }, [store]);

  const update = useCallback(
    (patch: Partial<Settings>) => {
      setSettings((prev) => {
        const next = sanitizeSettings({ ...prev, ...patch });
        clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(() => void store.set(STORAGE_KEYS.settings, next), SAVE_DELAY_MS);
        return next;
      });
    },
    [store],
  );

  return [settings, update, loaded];
}
