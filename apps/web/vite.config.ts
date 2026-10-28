import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, normalizePath, type Plugin } from 'vite';
import preact from '@preact/preset-vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

const here = path.dirname(fileURLToPath(import.meta.url));
const pdfjsDir = path.dirname(createRequire(import.meta.url).resolve('pdfjs-dist/package.json'));

/** All files under `dir`, as sorted forward-slash paths relative to it (sorted so hashes match on every OS). */
function listFiles(dir: string): string[] {
  return readdirSync(dir, { recursive: true, withFileTypes: true })
    .filter((e) => e.isFile())
    .map((e) => path.relative(dir, path.join(e.parentPath, e.name)).split(path.sep).join('/'))
    .sort();
}

/**
 * Writes dist/sw.js from sw/sw.js with the list of files to keep on the device.
 * Each list gets a content hash as its version, so the browser re-downloads only after a real change.
 */
function serviceWorker(): Plugin {
  let outDir = '';
  return {
    name: 'losh-service-worker',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle() {
      // Guide screenshots are only for people reading the install guide; they are not kept on every device.
      const files = listFiles(outDir).filter((f) => f !== 'sw.js' && !f.startsWith('guide/'));
      const describe = (list: string[]) => {
        const hash = createHash('sha256');
        for (const f of list) hash.update(f).update(readFileSync(path.join(outDir, f)));
        // index.html files are cached under their folder URL, which is what people actually open.
        const urls = list.map((f) => (f === 'index.html' ? './' : f.endsWith('/index.html') ? `./${f.slice(0, -'index.html'.length)}` : `./${f}`));
        return { version: hash.digest('hex').slice(0, 12), files: urls };
      };
      const app = describe(files.filter((f) => !f.startsWith('pdfjs/')));
      const pdfjs = describe(files.filter((f) => f.startsWith('pdfjs/')));
      const source = readFileSync(path.join(here, 'sw/sw.js'), 'utf8')
        .replace('self.__LOSH_APP__', JSON.stringify(app))
        .replace('self.__LOSH_PDFJS__', JSON.stringify(pdfjs));
      writeFileSync(path.join(outDir, 'sw.js'), source);
    },
  };
}

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
    serviceWorker(),
  ],
  build: {
    rolldownOptions: {
      input: {
        home: path.join(here, 'index.html'),
        app: path.join(here, 'app/index.html'),
        privacy: path.join(here, 'privacy/index.html'),
      },
    },
  },
});
