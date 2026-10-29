import { detectLocale, translate, type MessageKey } from '@losh/core';
import { registerServiceWorker } from '../registerServiceWorker';

const root = document.getElementById('app')!;
registerServiceWorker('../sw.js', '../');

/**
 * Files that open the reader from outside: Android's share sheet and desktop "Open with → Losh".
 * A share lands on ?shared=1 either way: through the service worker with the file parked, or, when the service
 * worker was not running, through the server's redirect (vercel.json) without it; then the reader says so.
 */
function connectFiles(open: (file: File) => void, notify: (message: MessageKey) => void): void {
  if (new URLSearchParams(location.search).has('shared')) {
    history.replaceState(null, '', location.pathname);
    void takeSharedFile()
      .catch(() => null)
      .then((file) => (file ? open(file) : notify('share.missing')));
  }
  const launchQueue = (window as { launchQueue?: { setConsumer(fn: (params: { files: FileSystemFileHandle[] }) => void): void } }).launchQueue;
  launchQueue?.setConsumer(async ({ files }) => {
    if (files[0]) open(await files[0].getFile());
  });
}

/** The service worker parks a shared PDF in a local cache (see sw/sw.js); take it out once. */
async function takeSharedFile(): Promise<File | null> {
  if (!('caches' in window)) return null;
  const cache = await caches.open('losh-share');
  const url = new URL('./shared.pdf', location.href).href;
  const res = await cache.match(url);
  if (!res) return null;
  await cache.delete(url);
  const name = decodeURIComponent(res.headers.get('X-File-Name') ?? 'shared.pdf');
  return new File([await res.blob()], name, { type: 'application/pdf' });
}

// Loaded lazily so that a browser too old for the reader shows a message instead of a blank screen.
import('@losh/viewer')
  .then(({ createLocalStore, createRecentLibrary, mountReader }) =>
    mountReader(root, {
      store: createLocalStore(),
      pdfAssetsBase: '../pdfjs/',
      homeHref: '../',
      library: 'indexedDB' in window ? createRecentLibrary() : undefined,
      connectFiles,
    }),
  )
  .catch((error: unknown) => {
    console.error(error);
    const message = document.createElement('p');
    message.className = 'losh-boot-error';
    message.textContent = translate(detectLocale(navigator.languages ?? [navigator.language]), 'error.unsupported');
    root.replaceChildren(message);
  });
