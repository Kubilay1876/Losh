import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, normalizePath } from 'vite';
import preact from '@preact/preset-vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const here = path.dirname(fileURLToPath(import.meta.url));
const pdfjsDir = path.dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json'));

export default defineConfig({
  // Relative URLs so the site works on loshreader.vercel.app today and on a custom domain later.
  base: './',
  plugins: [
    preact(),
    // pdf.js needs these at runtime (CJK fonts, standard fonts, image decoders); serve them locally, never from a CDN.
    viteStaticCopy({
      targets: ['cmaps', 'standard_fonts', 'wasm', 'iccs'].map((dir) => ({
        src: `${normalizePath(path.join(pdfjsDir, dir))}/*`,
        dest: `pdfjs/${dir}`,
        rename: { stripBase: true },
      })),
    }),
  ],
  build: {
    rolldownOptions: {
      input: {
        home: path.join(here, 'index.html'),
        app: path.join(here, 'app/index.html'),
      },
    },
  },
});
