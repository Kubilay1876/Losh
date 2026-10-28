import { createRequire } from 'node:module';
import path from 'node:path';
import { defineConfig, normalizePath } from 'vite';
import preact from '@preact/preset-vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const pdfjsDir = path.dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json'));

export default defineConfig({
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
    outDir: '../dist-demo',
    emptyOutDir: true,
  },
});
