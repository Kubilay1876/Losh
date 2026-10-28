// Must be imported before 'pdfjs-dist/web/pdf_viewer.mjs': that module reads globalThis.pdfjsLib at load time.
import * as pdfjs from 'pdfjs-dist';
import workerUrl from 'pdfjs-dist/build/pdf.worker.min.mjs?url';

pdfjs.GlobalWorkerOptions.workerSrc = workerUrl;
(globalThis as unknown as { pdfjsLib: typeof pdfjs }).pdfjsLib = pdfjs;

export { pdfjs };
