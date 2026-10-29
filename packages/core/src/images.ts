/** What to do with an image in an inverted (night) mode. */
export type ImageTreatment = 'natural' | 'invert';

export interface ImageStats {
  /** Image area divided by page area (0–1). */
  areaRatio: number;
  /** Average chroma (max(r,g,b) − min(r,g,b)) over sampled pixels, 0–255. */
  meanChroma: number;
  /** Share of sampled pixels that are clearly coloured (0–1). */
  colorfulRatio: number;
  /** Share of sampled pixels at the image's plain background (paper) brightness (0–1). */
  paperShare: number;
}

/** An image covering more than this share of the page is treated as a scanned page. */
export const SCANNED_PAGE_AREA = 0.6;
/** A pixel counts as coloured above this chroma. */
export const COLORFUL_PIXEL_CHROMA = 32;
const PHOTO_COLORFUL_RATIO = 0.12;
const PHOTO_MEAN_CHROMA = 20;
/**
 * Pages of text and drawings are mostly plain paper (scans measure 75–85 %); photos have soft tones
 * everywhere (a cookbook cover: 5 %). Below this share an image is a photo, colourful or not.
 */
export const PHOTO_PAPER_SHARE = 0.4;
/** A pixel counts as paper this close (0–255) to the paper's brightness. */
const PAPER_TOLERANCE = 18;

/**
 * Night mode rule:
 * - photos (soft tones everywhere, little plain paper) are shown in natural colours, even black-and-white
 *   ones and even when they fill the page (a book cover);
 * - scanned pages (one big image, mostly paper) invert with the text, otherwise night mode would show a white page;
 * - grey images on paper (diagrams, charts) invert so no white box glares;
 * - colourful images on paper (coloured charts, illustrations) are shown in natural colours.
 */
export function classifyImage(stats: ImageStats): ImageTreatment {
  if (stats.paperShare < PHOTO_PAPER_SHARE) return 'natural';
  if (stats.areaRatio > SCANNED_PAGE_AREA) return 'invert';
  if (stats.colorfulRatio > PHOTO_COLORFUL_RATIO || stats.meanChroma > PHOTO_MEAN_CHROMA) return 'natural';
  return 'invert';
}

/** Computes colour statistics from RGBA pixel data (e.g. ImageData.data). */
export function pixelStats(rgba: ArrayLike<number>): Omit<ImageStats, 'areaRatio'> {
  let sum = 0;
  let colorful = 0;
  const lum: number[] = [];
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue; // fully transparent
    const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    sum += chroma;
    if (chroma > COLORFUL_PIXEL_CHROMA) colorful++;
    lum.push(r * 0.3 + g * 0.59 + b * 0.11);
  }
  const count = lum.length;
  if (!count) return { meanChroma: 0, colorfulRatio: 0, paperShare: 1 };
  // Paper is the bright end of the image.
  const paper = [...lum].sort((a, b) => a - b)[Math.floor(count * 0.9)];
  const plain = lum.filter((v) => Math.abs(v - paper) < PAPER_TOLERANCE).length;
  return { meanChroma: sum / count, colorfulRatio: colorful / count, paperShare: plain / count };
}
