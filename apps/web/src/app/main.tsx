import { createLocalStore, mountReader } from '@losh/viewer';

mountReader(document.getElementById('app')!, {
  store: createLocalStore(),
  pdfAssetsBase: '../pdfjs/',
  homeHref: '../',
});
