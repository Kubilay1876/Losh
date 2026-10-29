// Losh service worker: keeps the whole site on the device so it opens without internet.
// The build replaces the two placeholders below with the file lists (see apps/web/vite.config.ts).
// Nothing here ever sends a PDF anywhere: shared files are only parked in a local cache for the reader.

const APP = self.__LOSH_APP__;
const PDFJS = self.__LOSH_PDFJS__;

const APP_CACHE = `losh-app-${APP.version}`;
// pdf.js fonts and decoders rarely change, so they live in their own cache and survive app updates.
const PDFJS_CACHE = `losh-pdfjs-${PDFJS.version}`;
const SHARE_CACHE = 'losh-share';
const PAGE_TIMEOUT_MS = 3000;

const inScope = (path) => new URL(path, self.registration.scope).href;

async function fill(cacheName, files) {
  const cache = await caches.open(cacheName);
  const have = new Set((await cache.keys()).map((r) => r.url));
  await Promise.all(
    files.map(inScope).filter((url) => !have.has(url)).map(async (url) => {
      const res = await fetch(url, { cache: 'reload' });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      await cache.put(url, res);
    }),
  );
}

self.addEventListener('install', (event) => {
  event.waitUntil(Promise.all([fill(APP_CACHE, APP.files), fill(PDFJS_CACHE, PDFJS.files)]).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const names = await caches.keys(); // in creation order
      const apps = names.filter((n) => n.startsWith('losh-app-') && n !== APP_CACHE);
      // Keep the previous app version for a page that is still open on it and loads a file late.
      const previous = apps.at(-1);
      const keep = new Set([APP_CACHE, PDFJS_CACHE, SHARE_CACHE, previous]);
      await Promise.all(names.filter((n) => n.startsWith('losh-') && !keep.has(n)).map((n) => caches.delete(n)));
      await self.clients.claim();
    })(),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.method === 'POST' && url.href === inScope('./app/share')) {
    event.respondWith(receiveShare(req));
    return;
  }
  if (req.method !== 'GET') return;

  if (req.mode === 'navigate') {
    event.respondWith(page(req));
    return;
  }
  event.respondWith(
    caches.match(req, { ignoreSearch: true }).then(async (hit) => {
      if (hit) return hit;
      const res = await fetch(req);
      // pdf.js files left out of the first download (see onFirstUse in vite.config.ts): keep them once used.
      if (res.ok && url.href.startsWith(inScope('./pdfjs/'))) {
        const copy = res.clone();
        event.waitUntil(caches.open(PDFJS_CACHE).then((cache) => cache.put(url.href, copy)));
      }
      return res;
    }),
  );
});

/**
 * Pages: fresh from the network when it answers quickly (so updates show up), otherwise from the device.
 * A wrong address gets the server's "not found" page while online.
 */
async function page(req) {
  try {
    const res = await Promise.race([
      fetch(req),
      new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), PAGE_TIMEOUT_MS)),
    ]);
    if (res.ok || res.status === 404) return res;
  } catch {
    // offline or slow: fall through to the copy on the device
  }
  return (await caches.match(req, { ignoreSearch: true })) || (await caches.match(inScope('./'))) || Response.error();
}

/** Android "Share → Losh": park the PDF locally, then open the reader, which picks it up. */
async function receiveShare(req) {
  try {
    const file = (await req.formData()).get('pdf');
    if (file && typeof file !== 'string') {
      const cache = await caches.open(SHARE_CACHE);
      await cache.put(
        inScope('./app/shared.pdf'),
        new Response(file, { headers: { 'Content-Type': 'application/pdf', 'X-File-Name': encodeURIComponent(file.name || 'shared.pdf') } }),
      );
    }
  } catch (err) {
    console.error(err);
  }
  return Response.redirect(inScope('./app/?shared=1'), 303);
}
