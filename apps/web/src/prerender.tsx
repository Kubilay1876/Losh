// Runs at build time, in Node (see `prerender` in vite.config.ts): the pages as finished HTML, in Turkish.
import { renderToString } from 'preact-render-to-string';
import { DEFAULT_SETTINGS, type KeyValueStore } from '@losh/core';
import { Home } from './home/Home';
import { Privacy } from './privacy/Privacy';
import { NotFound } from './notfound/NotFound';

const store: KeyValueStore = { get: async () => undefined, set: async () => {}, remove: async () => {} };
const initial = DEFAULT_SETTINGS;

/** Each built HTML file and the element its page is drawn into. */
export const PAGES = [
  { file: 'index.html', root: 'home', html: () => renderToString(<Home store={store} initial={initial} />) },
  { file: 'privacy/index.html', root: 'privacy', html: () => renderToString(<Privacy store={store} initial={initial} />) },
  { file: '404.html', root: 'notfound', html: () => renderToString(<NotFound store={store} initial={initial} />) },
];
