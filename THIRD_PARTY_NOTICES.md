# Third-party notices

Losh bundles the following open-source software:

| Package | License | Notes |
|---|---|---|
| [pdf.js](https://github.com/mozilla/pdf.js) (`pdfjs-dist`) | Apache-2.0 | PDF rendering, text layer, search. Its bundled decoders (OpenJPEG, JBIG2, QCMS) keep their own licenses; see `pdfjs/wasm/LICENSE_*` in the build output. |
| [Preact](https://preactjs.com) | MIT | User interface |

The full license texts ship inside each package in `node_modules/` and are included with release builds.
