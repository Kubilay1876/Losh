import { createLocalStore, mountReader } from '../src';

mountReader(document.getElementById('app')!, {
  store: createLocalStore(),
  pdfAssetsBase: './pdfjs/',
});
