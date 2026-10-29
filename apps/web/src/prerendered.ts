import { render, type VNode } from 'preact';
import type { KeyValueStore, Settings } from '@losh/core';
import { loadSettings } from '@losh/viewer/settings';

/**
 * Pages built ahead of time (see `prerender` in vite.config.ts) arrive as finished Turkish HTML, so search
 * engines and link previews can read them. Here the page draws itself again in the reader's language, in one go.
 * Until then the one-line script in <head> keeps the ready-made copy out of sight, so nothing flickers.
 */
export function wake(id: string, store: KeyValueStore, view: (store: KeyValueStore, initial: Settings) => VNode): void {
  const root = document.getElementById(id)!;
  void loadSettings(store).then((initial) => {
    root.replaceChildren();
    render(view(store, initial), root);
    document.documentElement.classList.remove('losh-boot');
  });
}
