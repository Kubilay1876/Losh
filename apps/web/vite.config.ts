import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig, normalizePath, runnerImport, type Plugin } from 'vite';
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
 * pdf.js files that only some PDFs or browsers need, so the first visit does not download them (about 2.2 MB):
 * - cmaps: character maps for Chinese, Japanese and Korean fonts without their own;
 * - *_nowasm_fallback.js: image decoders for browsers without WebAssembly;
 * - quickjs-eval.*: the engine for scripts inside PDFs, which Losh never runs;
 * - licence texts.
 * The service worker keeps each one on the device the first time it is used. Standard fonts (common in Latin
 * books) and the decoders for scanned pages stay in the first download, so those books open offline at once.
 */
const onFirstUse = (f: string) => f.startsWith('pdfjs/cmaps/') || /nowasm_fallback|quickjs-eval|LICENSE/.test(f);

/**
 * Fills the welcome, privacy and 404 pages with their finished HTML (Turkish), so search engines and link previews
 * that do not run JavaScript can read them. The reader (/app/) stays a plain app page.
 * Also checks that every inline <script> in the built pages is allowed by the CSP in vercel.json.
 */
function prerender(): Plugin {
  let outDir = '';
  return {
    name: 'losh-prerender',
    apply: 'build',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    closeBundle: {
      // Before the service worker lists and hashes the files.
      order: 'pre',
      sequential: true,
      async handler() {
        const { module } = await runnerImport<typeof import('./src/prerender')>(path.join(here, 'src/prerender.tsx'), {
          configFile: false,
          root: here,
          logLevel: 'error',
          oxc: { jsx: { runtime: 'automatic', importSource: 'preact' } },
        });
        for (const page of module.PAGES) {
          const file = path.join(outDir, page.file);
          const empty = `<div id="${page.root}" data-prerendered></div>`;
          const html = readFileSync(file, 'utf8');
          if (!html.includes(empty)) throw new Error(`prerender: no empty ${empty} in ${page.file}`);
          writeFileSync(file, html.replace(empty, () => `<div id="${page.root}" data-prerendered>${page.html()}</div>`));
        }

        const csp = (JSON.parse(readFileSync(path.join(here, '../../vercel.json'), 'utf8')) as { headers: { headers: { key: string; value: string }[] }[] }).headers
          .flatMap((h) => h.headers)
          .find((h) => h.key === 'Content-Security-Policy')!.value;
        for (const f of listFiles(outDir).filter((f) => f.endsWith('.html'))) {
          for (const [, code] of readFileSync(path.join(outDir, f), 'utf8').matchAll(/<script(?![^>]*\bsrc=)[^>]*>([\s\S]*?)<\/script>/g)) {
            const hash = `'sha256-${createHash('sha256').update(code).digest('base64')}'`;
            if (!csp.includes(hash)) throw new Error(`${f}: inline script not allowed by the CSP in vercel.json; add ${hash} to script-src`);
          }
        }
      },
    },
  };
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
      // Guide screenshots and the share preview are for people reading the guide or sharing a link; not kept on every device.
      // The 404 page is only ever shown by the server; offline, a wrong address opens the welcome page instead.
      const files = listFiles(outDir).filter((f) => f !== 'sw.js' && !f.startsWith('guide/') && f !== 'og-image.jpg' && f !== '404.html');
      // `list` is what the version covers; `stored` is what gets downloaded at install (the rest is kept on first use).
      const describe = (list: string[], stored = list) => {
        const hash = createHash('sha256');
        for (const f of list) hash.update(f).update(readFileSync(path.join(outDir, f)));
        // index.html files are cached under their folder URL, which is what people actually open.
        const urls = stored.map((f) => (f === 'index.html' ? './' : f.endsWith('/index.html') ? `./${f.slice(0, -'index.html'.length)}` : `./${f}`));
        return { version: hash.digest('hex').slice(0, 12), files: urls };
      };
      const app = describe(files.filter((f) => !f.startsWith('pdfjs/')));
      const pdfjsFiles = files.filter((f) => f.startsWith('pdfjs/'));
      const pdfjs = describe(pdfjsFiles, pdfjsFiles.filter((f) => !onFirstUse(f)));
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
    prerender(),
    serviceWorker(),
  ],
  build: {
    rolldownOptions: {
      input: {
        home: path.join(here, 'index.html'),
        app: path.join(here, 'app/index.html'),
        privacy: path.join(here, 'privacy/index.html'),
        notFound: path.join(here, '404.html'),
      },
    },
  },
});
