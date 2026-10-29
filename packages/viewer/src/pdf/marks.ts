import { groupLines, inkLines, padBoxes, snapToText, type Box, type Line, type Mark, type MarkRect } from '@losh/core';

/** Scans are read at this width (pixels) to find their lines: sharp enough for small print, quick on phones. */
const INK_WIDTH = 700;
/** Line height assumed for marks away from any text, as a fraction of the page height. */
const FALLBACK_LINE = 0.016;
/** Shorter strokes (CSS pixels) are taps, not marks. */
const MIN_STROKE_PX = 6;

/** Where a page's content box is on screen (pdf.js pages have a border). */
function pageFrame(div: HTMLElement) {
  const r = div.getBoundingClientRect();
  return { left: r.left + div.clientLeft, top: r.top + div.clientTop, width: div.clientWidth, height: div.clientHeight };
}
type Frame = ReturnType<typeof pageFrame>;

/** Word boxes from the PDF's own text (the invisible text layer pdf.js lays over the page), in reading order. */
function textWords(div: HTMLElement, frame: Frame): Box[] {
  const layer = div.querySelector('.textLayer');
  if (!layer) return [];
  const words: Box[] = [];
  const range = document.createRange();
  const walker = document.createTreeWalker(layer, NodeFilter.SHOW_TEXT);
  for (let node = walker.nextNode() as Text | null; node; node = walker.nextNode() as Text | null) {
    for (const m of node.data.matchAll(/\S+/g)) {
      range.setStart(node, m.index);
      range.setEnd(node, m.index + m[0].length);
      const r = range.getBoundingClientRect();
      if (r.width > 0 && r.height > 0) words.push({ x0: r.left - frame.left, y0: r.top - frame.top, x1: r.right - frame.left, y1: r.bottom - frame.top });
    }
  }
  return words;
}

/** Lines found in the ink of the drawn page, for scans that carry no text. */
function inkPageLines(div: HTMLElement, frame: Frame): Line[] {
  const canvas = div.querySelector<HTMLCanvasElement>('.canvasWrapper > canvas');
  if (!canvas?.width || !frame.width) return [];
  const w = INK_WIDTH;
  const h = Math.max(1, Math.round((frame.height / frame.width) * w));
  const small = document.createElement('canvas');
  small.width = w;
  small.height = h;
  const ctx = small.getContext('2d', { willReadFrequently: true });
  if (!ctx) return [];
  ctx.drawImage(canvas, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  const lum = new Uint8Array(w * h);
  for (let i = 0; i < lum.length; i++) lum[i] = (data[i * 4] * 77 + data[i * 4 + 1] * 151 + data[i * 4 + 2] * 28) >> 8;
  const k = frame.width / w;
  return inkLines(lum, w, h).map((l) => ({
    x0: l.x0 * k,
    y0: l.y0 * k,
    x1: l.x1 * k,
    y1: l.y1 * k,
    words: l.words.map((b) => ({ x0: b.x0 * k, y0: b.y0 * k, x1: b.x1 * k, y1: b.y1 * k })),
  }));
}

/**
 * Snaps strokes on one page to its lines of text. Looks at the page once (when the stroke starts)
 * and then answers quickly for every finger move, so the mark can follow live.
 * With `tap`, a touch without movement counts too and means the word under it (the eraser's dab).
 */
export function createSnapper(div: HTMLElement): (points: [number, number][], tap?: boolean) => MarkRect[] | null {
  const frame = pageFrame(div);
  let text: Line[] | null = null;
  let ink: Line[] | null = null;
  return (points, tap = false) => {
    if (points.length < 2) return null;
    const local = points.map(([x, y]): [number, number] => [x - frame.left, y - frame.top]);
    const xs = local.map((p) => p[0]);
    const ys = local.map((p) => p[1]);
    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const height = Math.max(...ys) - Math.min(...ys);
    const still = maxX - minX < MIN_STROKE_PX && height < MIN_STROKE_PX;
    if (still && !tap) return null;
    const start = local[0];
    const end = local[local.length - 1];
    text ??= groupLines(textWords(div, frame));
    let boxes = snapToText(text, start, end, height);
    if (!boxes) {
      ink ??= inkPageLines(div, frame);
      boxes = snapToText(ink, start, end, height);
    }
    if (!boxes && still) return null;
    if (!boxes) {
      // Nothing to snap to (a picture, the margin): a straight band along the stroke.
      const mid = [...ys].sort((a, b) => a - b)[Math.floor(ys.length / 2)];
      const half = (FALLBACK_LINE * frame.height) / 2;
      boxes = [{ x0: minX, y0: mid - half, x1: maxX, y1: mid + half }];
    }
    return padBoxes(boxes).map((b) => toRect(b, frame));
  };
}

const round = (n: number) => Math.round(n * 10000) / 10000;

function toRect(b: Box, frame: Frame): MarkRect {
  const x0 = Math.max(0, b.x0 / frame.width);
  const y0 = Math.max(0, b.y0 / frame.height);
  const x1 = Math.min(1, b.x1 / frame.width);
  const y1 = Math.min(1, b.y1 / frame.height);
  return [round(x0), round(y0), round(x1 - x0), round(y1 - y0)];
}

/**
 * Draws marks onto pages. Each page gets one layer inside its picture (the canvas wrapper), so the
 * reading mode's filter colours marks just like the paper: in night mode a yellow mark turns into
 * a dark yellow band behind light text. pdf.js keeps that wrapper while zooming, so marks never blink.
 */
export class MarkPainter {
  private byPage = new Map<number, Mark[]>();

  constructor(private readonly viewer: HTMLElement) {}

  /** Shows these marks. Only pages whose marks changed are redrawn, so it can follow a finger. */
  set(marks: Mark[]): void {
    const old = this.byPage;
    this.byPage = new Map();
    for (const m of marks) this.byPage.set(m.page, [...(this.byPage.get(m.page) ?? []), m]);
    for (const page of new Set([...old.keys(), ...this.byPage.keys()])) {
      const a = old.get(page) ?? [];
      const b = this.byPage.get(page) ?? [];
      if (a.length !== b.length || a.some((m, i) => m !== b[i])) this.paintPage(page);
    }
  }

  private paintPage(page: number): void {
    const div = this.viewer.querySelector<HTMLElement>(`.page[data-page-number="${page}"]`);
    if (div) this.paint(div);
  }

  /** Draws one page's marks (again); called whenever pdf.js has drawn the page. */
  paint(div: HTMLElement): void {
    const marks = this.byPage.get(Number(div.dataset.pageNumber)) ?? [];
    const wrapper = div.querySelector<HTMLElement>('.canvasWrapper');
    let layer = div.querySelector<HTMLElement>('.losh-marks');
    if (!marks.length) {
      layer?.remove();
      return;
    }
    if (!wrapper) return;
    if (!layer || layer.parentElement !== wrapper) {
      layer?.remove();
      layer = document.createElement('div');
      layer.className = 'losh-marks';
      layer.setAttribute('aria-hidden', 'true');
    }
    // Last in the wrapper: above the page canvases, which pdf.js always puts first.
    if (layer !== wrapper.lastElementChild) wrapper.append(layer);
    layer.replaceChildren(...marks.map(markElement));
  }
}

function markElement(m: Mark): HTMLElement {
  const el = document.createElement('div');
  el.className = 'losh-mark';
  el.dataset.color = m.color;
  for (const [l, t, w, h] of m.rects) {
    const r = document.createElement('i');
    r.style.cssText = `left:${l * 100}%;top:${t * 100}%;width:${w * 100}%;height:${h * 100}%`;
    el.append(r);
  }
  return el;
}
