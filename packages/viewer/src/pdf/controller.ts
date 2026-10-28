import { pdfjs } from './setup';
import { EventBus, PDFFindController, PDFLinkService, PDFViewer } from 'pdfjs-dist/legacy/web/pdf_viewer.mjs';
import type { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { classifyPageImages } from './imageClassifier';

/** 'text-width': the text column, without the empty page margins, fills the screen width. */
export type ZoomValue = 'page-fit' | 'page-width' | 'text-width' | number;

export interface SearchState {
  query: string;
  current: number;
  total: number;
  notFound: boolean;
}

export interface ControllerEvents {
  onPageChange(page: number, total: number): void;
  onZoomChange(scale: number, preset: ZoomValue): void;
  onSearchChange(state: SearchState): void;
}

/** Images smaller than this (PDF points) are treated as decoration and not tracked. */
const MIN_TRACKED_IMAGE_SIZE = 24;
const ZOOM_STEPS = [0.5, 0.67, 0.8, 0.9, 1, 1.1, 1.25, 1.5, 1.75, 2, 2.5, 3, 4];
/** Room left beside the text in 'text-width' zoom, in CSS pixels. */
const TEXT_MARGIN_PX = 10;
/** Pages looked at to find where the text column sits. */
const TEXT_SAMPLE_PAGES = 8;

/** Thin wrapper around pdf.js' PDFViewer: lazy page rendering, text layer, search and zoom come from pdf.js. */
export class ReaderController {
  private readonly eventBus = new EventBus();
  private readonly linkService = new PDFLinkService({ eventBus: this.eventBus });
  private readonly findController = new PDFFindController({ eventBus: this.eventBus, linkService: this.linkService });
  private readonly viewer: PDFViewer;
  private doc: PDFDocumentProxy | null = null;
  private zoomPreset: ZoomValue = 'page-width';
  /** Left and right edge of the text column, as fractions of the page width; measured once per document. */
  private textBounds: Promise<[number, number] | null> | null = null;
  private search: SearchState = { query: '', current: 0, total: 0, notFound: false };

  constructor(container: HTMLDivElement, private readonly assetsBase: string, private readonly events: ControllerEvents) {
    this.viewer = new PDFViewer({
      container,
      eventBus: this.eventBus,
      linkService: this.linkService,
      findController: this.findController,
      // Makes pdf.js record image positions; we use them to un-invert photos in night modes.
      imagesRightClickMinSize: MIN_TRACKED_IMAGE_SIZE,
    });
    this.linkService.setViewer(this.viewer);

    // Decide per image whether night modes show it natural (photos) or inverted (diagrams, scans).
    const classify = (e: { source: { div: HTMLElement; canvas?: HTMLCanvasElement | null } }) => classifyPageImages(e.source.div, e.source.canvas);
    this.eventBus.on('textlayerrendered', classify);
    this.eventBus.on('pagerendered', classify);

    this.eventBus.on('pagechanging', (e: { pageNumber: number }) => {
      this.events.onPageChange(e.pageNumber, this.viewer.pagesCount);
    });
    this.eventBus.on('scalechanging', (e: { scale: number; presetValue?: string }) => {
      this.events.onZoomChange(e.scale, this.zoomPreset);
    });
    this.eventBus.on('updatefindmatchescount', (e: { matchesCount: { current: number; total: number } }) => {
      this.search = { ...this.search, current: e.matchesCount.current, total: e.matchesCount.total };
      this.events.onSearchChange(this.search);
    });
    this.eventBus.on('updatefindcontrolstate', (e: { state: number; matchesCount: { current: number; total: number } }) => {
      // FindState: 0 found, 1 not found, 2 wrapped, 3 pending
      this.search = {
        ...this.search,
        notFound: e.state === 1,
        current: e.matchesCount?.current ?? this.search.current,
        total: e.matchesCount?.total ?? this.search.total,
      };
      this.events.onSearchChange(this.search);
    });
  }

  /** Opens a PDF. `data` is consumed (transferred to the worker). */
  async open(data: Uint8Array, startPage = 1, zoom: ZoomValue = this.zoomPreset): Promise<number> {
    await this.close();
    this.zoomPreset = zoom;
    const base = new URL(this.assetsBase, document.baseURI).href;
    const doc = await pdfjs.getDocument({
      data,
      cMapUrl: `${base}cmaps/`,
      cMapPacked: true,
      standardFontDataUrl: `${base}standard_fonts/`,
      wasmUrl: `${base}wasm/`,
      iccUrl: `${base}iccs/`,
    }).promise;
    this.doc = doc;

    const ready = new Promise<void>((resolve) => this.eventBus.on('pagesinit', () => resolve(), { once: true }));
    this.viewer.setDocument(doc);
    this.linkService.setDocument(doc);
    await ready;
    this.applyZoom(this.zoomPreset);
    if (startPage > 1 && startPage <= doc.numPages) this.viewer.currentPageNumber = startPage;
    if (this.zoomPreset === 'text-width') await this.fitText();
    this.events.onPageChange(this.viewer.currentPageNumber, doc.numPages);
    return doc.numPages;
  }

  async close(): Promise<void> {
    if (!this.doc) return;
    const doc = this.doc;
    this.doc = null;
    this.textBounds = null;
    this.viewer.setDocument(null as unknown as PDFDocumentProxy);
    this.linkService.setDocument(null);
    await doc.loadingTask.destroy();
  }

  get pageCount(): number {
    return this.doc?.numPages ?? 0;
  }

  get currentPage(): number {
    return this.viewer.currentPageNumber;
  }

  goToPage(page: number): void {
    if (!this.doc) return;
    this.viewer.currentPageNumber = Math.min(this.doc.numPages, Math.max(1, Math.round(page)));
  }

  nextPage(): void {
    this.viewer.nextPage();
  }

  previousPage(): void {
    this.viewer.previousPage();
  }

  setZoom(value: ZoomValue): void {
    this.zoomPreset = value;
    if (!this.doc) return;
    if (value === 'text-width') void this.fitText();
    else this.applyZoom(value);
  }

  private applyZoom(value: ZoomValue): void {
    // Until the text column is measured, 'text-width' starts out as page width.
    this.viewer.currentScaleValue = value === 'text-width' ? 'page-width' : typeof value === 'number' ? String(value) : value;
  }

  /** Zooms so the text column fills the screen width and lines it up with the left edge. */
  private async fitText(): Promise<void> {
    const doc = this.doc;
    if (!doc) return;
    this.textBounds ??= measureTextBounds(doc, this.viewer.currentPageNumber, this.viewer.container).catch((err: unknown) => {
      // Never let this stop a PDF from opening: page width is a fine fallback.
      console.error(err);
      return null;
    });
    const bounds = await this.textBounds;
    if (doc !== this.doc || this.zoomPreset !== 'text-width') return;
    if (!bounds) {
      // Try again next time: a scan can only be measured once its pages are drawn.
      this.textBounds = null;
      this.viewer.currentScaleValue = 'page-width';
      return;
    }
    const container = this.viewer.container;
    const pageView = this.viewer.getPageView(this.viewer.currentPageNumber - 1);
    const textWidth = (bounds[1] - bounds[0]) * pageView.viewport.width;
    const wanted = (this.viewer.currentScale * (container.clientWidth - 2 * TEXT_MARGIN_PX)) / textWidth;
    this.viewer.currentScaleValue = String(Math.min(ZOOM_STEPS[ZOOM_STEPS.length - 1], wanted));
    // Every page shares the width, so lining up the current one lines up all of them.
    const page = pageView.div.getBoundingClientRect();
    const textLeft = page.left + pageView.div.clientLeft + bounds[0] * pageView.viewport.width;
    container.scrollLeft += textLeft - container.getBoundingClientRect().left - TEXT_MARGIN_PX;
  }

  zoomIn(): void {
    const next = ZOOM_STEPS.find((s) => s > this.viewer.currentScale + 0.001);
    this.setZoom(next ?? ZOOM_STEPS[ZOOM_STEPS.length - 1]);
  }

  zoomOut(): void {
    const prev = [...ZOOM_STEPS].reverse().find((s) => s < this.viewer.currentScale - 0.001);
    this.setZoom(prev ?? ZOOM_STEPS[0]);
  }

  /** How far pinch zoom may scale from the current zoom, as [smallest, largest] factor. */
  zoomRange(): [number, number] {
    if (!this.doc) return [1, 1];
    const current = this.viewer.currentScale;
    return [ZOOM_STEPS[0] / current, ZOOM_STEPS[ZOOM_STEPS.length - 1] / current];
  }

  /** Pinch zoom: scales by `factor` around a point in viewport coordinates, within the zoom steps' range. */
  zoomBy(factor: number, origin: [number, number]): void {
    if (!this.doc) return;
    const current = this.viewer.currentScale;
    const target = Math.min(ZOOM_STEPS[ZOOM_STEPS.length - 1], Math.max(ZOOM_STEPS[0], current * factor));
    if (Math.abs(target - current) < 0.005) return;
    this.zoomPreset = Math.round(target * 100) / 100;
    // Remember which spot of which page is under the fingers; pdf.js only roughly keeps it there.
    const pageDiv = document.elementFromPoint(origin[0], origin[1])?.closest<HTMLElement>('.page');
    const before = pageDiv?.getBoundingClientRect();
    // The delay lets pdf.js show the stretched pages at once and redraw them sharply a moment later.
    this.viewer.updateScale({ scaleFactor: target / current, drawingDelay: 300, origin });
    if (!pageDiv || !before) return;
    const after = pageDiv.getBoundingClientRect();
    const container = this.viewer.container;
    container.scrollLeft += after.left + ((origin[0] - before.left) / before.width) * after.width - origin[0];
    container.scrollTop += after.top + ((origin[1] - before.top) / before.height) * after.height - origin[1];
  }

  find(query: string, options: { again?: boolean; previous?: boolean } = {}): void {
    this.search = { ...this.search, query };
    this.eventBus.dispatch('find', {
      source: this,
      type: options.again ? 'again' : '',
      query,
      caseSensitive: false,
      entireWord: false,
      highlightAll: true,
      findPrevious: !!options.previous,
      matchDiacritics: false,
    });
  }

  clearSearch(): void {
    this.search = { query: '', current: 0, total: 0, notFound: false };
    this.eventBus.dispatch('findbarclose', { source: this });
    this.events.onSearchChange(this.search);
  }

  destroy(): void {
    void this.close();
  }
}

/**
 * Where the text column sits on the page, as [left, right] fractions of the page width.
 * Uses the PDF's text on pages near `around`; scans without text fall back to the ink on the rendered pages.
 * Pages are combined loosely (25th/75th percentile) so one odd page, like a wide table, does not decide for all.
 */
async function measureTextBounds(doc: PDFDocumentProxy, around: number, container: HTMLElement): Promise<[number, number] | null> {
  const first = Math.max(1, Math.min(around - 2, doc.numPages - TEXT_SAMPLE_PAGES + 1));
  const last = Math.min(doc.numPages, first + TEXT_SAMPLE_PAGES - 1);
  const found: [number, number][] = [];
  for (let n = first; n <= last; n++) {
    const page = await doc.getPage(n);
    if (page.rotate % 180 !== 0) continue;
    const [x0, , x1] = page.view;
    let left = Infinity;
    let right = -Infinity;
    for (const item of (await page.getTextContent()).items) {
      if (!('str' in item) || !item.str.trim() || item.width <= 0) continue;
      left = Math.min(left, item.transform[4]);
      right = Math.max(right, item.transform[4] + item.width);
    }
    if (right > left) found.push([(left - x0) / (x1 - x0), (right - x0) / (x1 - x0)]);
  }
  if (!found.length) {
    for (const canvas of container.querySelectorAll<HTMLCanvasElement>('.page canvas')) {
      const ink = inkBounds(canvas);
      if (ink) found.push(ink);
    }
  }
  if (!found.length) return null;
  const lefts = found.map((b) => b[0]).sort((a, b) => a - b);
  const rights = found.map((b) => b[1]).sort((a, b) => b - a);
  const i = Math.floor((found.length - 1) / 4);
  const left = Math.max(0, lefts[i]);
  const right = Math.min(1, rights[i]);
  // Not worth it when the text already spans almost the whole page.
  return right - left > 0.2 && right - left < 0.95 ? [left, right] : null;
}

/** Left and right edge of the dark marks on a rendered page, from a small copy of it. */
function inkBounds(canvas: HTMLCanvasElement): [number, number] | null {
  if (!canvas.width || !canvas.height) return null;
  const w = 200;
  const h = Math.max(1, Math.round((canvas.height / canvas.width) * w));
  const small = document.createElement('canvas');
  small.width = w;
  small.height = h;
  const ctx = small.getContext('2d', { willReadFrequently: true });
  if (!ctx) return null;
  ctx.drawImage(canvas, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  const minInk = Math.max(2, h * 0.004);
  let left = -1;
  let right = -1;
  for (let x = 0; x < w; x++) {
    let dark = 0;
    for (let y = 0; y < h; y++) {
      const p = (y * w + x) * 4;
      if (data[p] * 0.3 + data[p + 1] * 0.59 + data[p + 2] * 0.11 < 160) dark++;
    }
    if (dark >= minInk) {
      if (left < 0) left = x;
      right = x + 1;
    }
  }
  return left < 0 ? null : [left / w, right / w];
}
