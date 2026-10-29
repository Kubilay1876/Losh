// Highlighter ("işaretleyici"): marks snap to the lines of text under the finger, so they never spill
// over. Everything here is plain geometry; the viewer feeds it word boxes from the PDF's text or,
// for scans, from the ink on the rendered page.

export const MARK_COLORS = ['yellow', 'green', 'pink', 'blue'] as const;
export type MarkColor = (typeof MARK_COLORS)[number];

export function isMarkColor(value: unknown): value is MarkColor {
  return (MARK_COLORS as readonly unknown[]).includes(value);
}

/** [left, top, width, height] as fractions of the page's width and height, so zoom never moves it. */
export type MarkRect = [number, number, number, number];

export interface Mark {
  id: string;
  /** 1-based page number. */
  page: number;
  color: MarkColor;
  rects: MarkRect[];
}

/** An axis-aligned box: x0/y0 top left, x1/y1 bottom right. */
export interface Box {
  x0: number;
  y0: number;
  x1: number;
  y1: number;
}

/** One line of text: its height and its words, left to right. Lines come in reading order. */
export interface Line extends Box {
  words: Box[];
}

/** Turns anything read from storage into valid marks, dropping what is broken. */
export function sanitizeMarks(raw: unknown): Mark[] {
  if (!Array.isArray(raw)) return [];
  const fraction = (n: unknown) => typeof n === 'number' && Number.isFinite(n) && n >= -0.01 && n <= 1.01;
  const marks: Mark[] = [];
  for (const m of raw) {
    if (!m || typeof m !== 'object') continue;
    const { id, page, color, rects } = m as Record<string, unknown>;
    if (typeof id !== 'string' || !Number.isInteger(page) || (page as number) < 1 || !isMarkColor(color) || !Array.isArray(rects)) continue;
    const good = rects.filter((r): r is MarkRect => Array.isArray(r) && r.length === 4 && r.every(fraction));
    if (good.length) marks.push({ id, page: page as number, color, rects: good });
  }
  return marks;
}

/**
 * Groups word boxes (in reading order) into lines. A new line starts when a word does not sit at the
 * height of the previous one, goes back to the left, or lies past a gap as wide as a column gutter.
 * Words closer than a sliver of the line height are glued together (letters drawn one by one).
 */
export function groupLines(words: Box[]): Line[] {
  const lines: Line[] = [];
  let line: Line | null = null;
  for (const w of words) {
    if (w.x1 <= w.x0 || w.y1 <= w.y0) continue;
    const last = line?.words[line.words.length - 1];
    const h = line ? line.y1 - line.y0 : 0;
    const mid = (w.y0 + w.y1) / 2;
    const sameLine = line && last && mid > line.y0 && mid < line.y1 && w.x0 > last.x0 && w.x0 - last.x1 < h * 2.5;
    if (!line || !last || !sameLine) {
      line = { ...w, words: [{ ...w }] };
      lines.push(line);
      continue;
    }
    if (w.x0 - last.x1 < h * 0.12) last.x1 = Math.max(last.x1, w.x1);
    else line.words.push({ ...w });
    line.x1 = Math.max(line.x1, w.x1);
    line.y0 = Math.min(line.y0, w.y0);
    line.y1 = Math.max(line.y1, w.y1);
  }
  return lines;
}

interface Spot {
  line: number;
  word: number;
}

/** The word nearest to a point, or null when no line is close enough to mean it. */
function wordAt(lines: Line[], x: number, y: number, only?: number): Spot | null {
  let best: Spot | null = null;
  let bestDist = Infinity;
  for (let i = 0; i < lines.length; i++) {
    if (only !== undefined && i !== only) continue;
    const l = lines[i];
    const h = l.y1 - l.y0;
    const dy = Math.max(0, l.y0 - y, y - l.y1);
    const dx = Math.max(0, l.x0 - x, x - l.x1);
    if (only === undefined && (dy > h * 0.9 || dx > h * 2)) continue;
    // Being at the right height matters more than being at the right place along the line.
    const dist = dy * 2 + dx;
    if (dist < bestDist) {
      bestDist = dist;
      best = { line: i, word: 0 };
    }
  }
  if (!best) return null;
  const words = lines[best.line].words;
  let wordDist = Infinity;
  words.forEach((w, j) => {
    const d = Math.max(0, w.x0 - x, x - w.x1);
    if (d < wordDist) {
      wordDist = d;
      best!.word = j;
    }
  });
  return best;
}

/**
 * The boxes to paint for a stroke from `start` to `end`: whole words, from the word under the start to
 * the word under the end in reading order, one box per line, the height of that line.
 * A stroke that stays within about one line's height counts as one line, even if the hand drifted.
 * Returns null when the stroke does not start on text.
 */
export function snapToText(lines: Line[], start: [number, number], end: [number, number], strokeHeight: number): Box[] | null {
  const a = wordAt(lines, start[0], start[1]);
  if (!a) return null;
  const startLine = lines[a.line];
  const oneLine = strokeHeight < (startLine.y1 - startLine.y0) * 0.9;
  const b = (oneLine ? null : wordAt(lines, end[0], end[1])) ?? wordAt(lines, end[0], end[1], a.line)!;
  const [from, to] = b.line < a.line || (b.line === a.line && b.word < a.word) ? [b, a] : [a, b];
  const boxes: Box[] = [];
  for (let i = from.line; i <= to.line; i++) {
    const l = lines[i];
    const first = l.words[i === from.line ? from.word : 0];
    const last = l.words[i === to.line ? to.word : l.words.length - 1];
    boxes.push({ x0: first.x0, y0: l.y0, x1: last.x1, y1: l.y1 });
  }
  return boxes;
}

/** Grows boxes a little, like the soft edge of a real highlighter: sideways by `x`, up and down by `y` (fractions of each box's height). */
export function padBoxes(boxes: Box[], x = 0.12, y = 0.08): Box[] {
  return boxes.map((b) => {
    const h = b.y1 - b.y0;
    return { x0: b.x0 - h * x, y0: b.y0 - h * y, x1: b.x1 + h * x, y1: b.y1 + h * y };
  });
}

/**
 * Finds lines and words in a picture of a page (scans: no text in the PDF), as word boxes in pixels.
 * `lum` holds one brightness value (0–255) per pixel, row by row.
 * Columns are split at gutters first, so lines of two columns are never joined; pictures (blocks
 * much taller than a line) are left out.
 */
export function inkLines(lum: ArrayLike<number>, w: number, h: number): Line[] {
  if (w < 8 || h < 8) return [];
  // Paper is the bright end of the page; ink is anything clearly darker.
  const sample: number[] = [];
  const step = Math.max(1, Math.floor((w * h) / 4000));
  for (let i = 0; i < w * h; i += step) sample.push(lum[i]);
  sample.sort((p, q) => p - q);
  const paper = sample[Math.floor(sample.length * 0.9)];
  const limit = Math.min(200, paper * 0.62);
  const dark = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) dark[i] = lum[i] < limit ? 1 : 0;

  const colInk = new Uint32Array(w);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) colInk[x] += dark[y * w + x];

  // Column regions: ink areas separated by gutters (almost no ink from top to bottom).
  const gutterMax = h * 0.03;
  const minGutter = Math.max(3, Math.round(w * 0.025));
  const regions: [number, number][] = [];
  let x = 0;
  while (x < w) {
    while (x < w && colInk[x] === 0) x++;
    if (x >= w) break;
    const from = x;
    let gap = 0;
    let end = x;
    while (x < w) {
      if (colInk[x] <= gutterMax) gap++;
      else {
        if (gap >= minGutter) break;
        gap = 0;
        end = x + 1;
      }
      x++;
    }
    regions.push([from, end]);
    x = end + gap;
  }

  const lines: Line[] = [];
  for (const [rx0, rx1] of regions) {
    // Rows with ink, joined into bands; tiny gaps (dots, accents) do not split a line.
    const bands: [number, number][] = [];
    let open = -1;
    for (let y = 0; y <= h; y++) {
      let count = 0;
      if (y < h) for (let xx = rx0; xx < rx1; xx++) count += dark[y * w + xx];
      if (count >= 2 && open < 0) open = y;
      else if (count < 2 && open >= 0) {
        bands.push([open, y]);
        open = -1;
      }
    }
    if (!bands.length) continue;
    const heights = bands.map(([a, b]) => b - a).sort((p, q) => p - q);
    const typical = heights[Math.floor(heights.length / 2)];
    const merged: [number, number][] = [];
    for (const band of bands) {
      const prev = merged[merged.length - 1];
      if (prev && band[0] - prev[1] <= Math.max(1, typical * 0.25)) prev[1] = band[1];
      else merged.push([...band]);
    }
    const lineH = merged.map(([a, b]) => b - a).sort((p, q) => p - q)[Math.floor(merged.length / 2)];

    for (const [y0, y1] of merged) {
      const bh = y1 - y0;
      if (bh < 3 || bh > lineH * 2.6) continue; // specks and pictures
      const cols = new Uint8Array(rx1 - rx0);
      for (let y = y0; y < y1; y++) for (let xx = rx0; xx < rx1; xx++) if (dark[y * w + xx]) cols[xx - rx0] = 1;
      const words: Box[] = [];
      let start = -1;
      let lastInk = -1;
      for (let i = 0; i <= cols.length; i++) {
        if (i < cols.length && cols[i]) {
          if (start < 0) start = i;
          else if (i - lastInk - 1 > bh * 0.35) {
            words.push({ x0: rx0 + start, y0, x1: rx0 + lastInk + 1, y1 });
            start = i;
          }
          lastInk = i;
        }
      }
      if (start >= 0) words.push({ x0: rx0 + start, y0, x1: rx0 + lastInk + 1, y1 });
      lines.push(...groupLines(words));
    }
  }
  return lines;
}
