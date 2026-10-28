import { pdfjs } from './setup';
import { EventBus, PDFFindController, PDFLinkService, PDFViewer } from 'pdfjs-dist/legacy/web/pdf_viewer.mjs';
import type { PDFDocumentProxy } from 'pdfjs-dist/legacy/build/pdf.mjs';
import { classifyPageImages } from './imageClassifier';

export type ZoomValue = 'page-fit' | 'page-width' | number;

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

/** Thin wrapper around pdf.js' PDFViewer: lazy page rendering, text layer, search and zoom come from pdf.js. */
export class ReaderController {
  private readonly eventBus = new EventBus();
  private readonly linkService = new PDFLinkService({ eventBus: this.eventBus });
  private readonly findController = new PDFFindController({ eventBus: this.eventBus, linkService: this.linkService });
  private readonly viewer: PDFViewer;
  private doc: PDFDocumentProxy | null = null;
  private zoomPreset: ZoomValue = 'page-width';
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
  async open(data: Uint8Array, startPage = 1): Promise<number> {
    await this.close();
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
    this.viewer.currentScaleValue = this.zoomPreset === 'page-fit' || this.zoomPreset === 'page-width' ? this.zoomPreset : String(this.zoomPreset);
    if (startPage > 1 && startPage <= doc.numPages) this.viewer.currentPageNumber = startPage;
    this.events.onPageChange(this.viewer.currentPageNumber, doc.numPages);
    return doc.numPages;
  }

  async close(): Promise<void> {
    if (!this.doc) return;
    const doc = this.doc;
    this.doc = null;
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
    this.viewer.currentScaleValue = typeof value === 'number' ? String(value) : value;
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
