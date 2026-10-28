// Must be imported before 'pdfjs-dist/legacy/web/pdf_viewer.mjs': that module reads globalThis.pdfjsLib at load time.
import * as pdfjs from 'pdfjs-dist/legacy/build/pdf.mjs';
import workerUrl from 'pdfjs-dist/legacy/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
(globalThis as unknown as { pdfjsLib: typeof pdfjs }).pdfjsLib = pdfjs;

export { pdfjs };
