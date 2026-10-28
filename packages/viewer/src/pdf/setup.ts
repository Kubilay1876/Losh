// Must be imported before 'pdfjs-dist/legacy/web/pdf_viewer.mjs': that module reads globalThis.pdfjsLib at load time.
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

// Safari cannot loop over a stream with `for await` yet, and pdf.js' getTextContent (search, "Fit text")
// relies on it without a fallback. Teach streams that loop here, only where it is missing.
const streamProto = globalThis.ReadableStream?.prototype as unknown as Record<symbol, unknown> | undefined;
if (streamProto && !streamProto[Symbol.asyncIterator]) {
  streamProto[Symbol.asyncIterator] = async function* (this: ReadableStream) {
    const reader = this.getReader();
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) return;
        yield value;
      }
    } finally {
      reader.releaseLock();
    }
  };
}

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
(globalThis as unknown as { pdfjsLib: typeof pdfjs }).pdfjsLib = pdfjs;

export { pdfjs };
