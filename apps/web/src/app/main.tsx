import { detectLocale, translate } from '@losh/core';

const root = document.getElementById('app')!;

// Loaded lazily so that a browser too old for the reader shows a message instead of a blank screen.
import('@losh/viewer')
  .then(({ createLocalStore, mountReader }) =>
    mountReader(root, {
      store: createLocalStore(),
      pdfAssetsBase: '../pdfjs/',
      homeHref: '../',
    }),
  )
  .catch((error: unknown) => {
    console.error(error);
    const message = document.createElement('p');
    message.className = 'losh-boot-error';
    message.textContent = translate(detectLocale(navigator.languages ?? [navigator.language]), 'error.unsupported');
    root.replaceChildren(message);
  });
