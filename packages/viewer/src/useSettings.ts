import { useCallback, useEffect, useRef, useState } from 'preact/hooks';
import { DEFAULT_SETTINGS, detectLocale, sanitizeSettings, STORAGE_KEYS, type KeyValueStore, type Settings } from '@losh/core';

const SAVE_DELAY_MS = 300;

/** Loads settings once, then saves changes with a short delay (sliders fire many events). */
export function useSettings(store: KeyValueStore): [Settings, (patch: Partial<Settings>) => void, boolean] {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [loaded, setLoaded] = useState(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout>>(undefined);

  useEffect(() => {
    let cancelled = false;
    store.get(STORAGE_KEYS.settings).then((raw) => {
      if (cancelled) return;
      const s = sanitizeSettings(raw);
      if (raw === undefined) s.locale = detectLocale(navigator.languages ?? []);
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
