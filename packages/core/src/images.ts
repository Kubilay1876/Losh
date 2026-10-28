/** What to do with an image in an inverted (night) mode. */
export type ImageTreatment = 'natural' | 'invert';

export interface ImageStats {
  /** Image area divided by page area (0–1). */
  areaRatio: number;
  /** Average chroma (max(r,g,b) − min(r,g,b)) over sampled pixels, 0–255. */
  meanChroma: number;
  /** Share of sampled pixels that are clearly coloured (0–1). */
  colorfulRatio: number;
}

/** An image covering more than this share of the page is treated as a scanned page. */
export const SCANNED_PAGE_AREA = 0.6;
/** A pixel counts as coloured above this chroma. */
export const COLORFUL_PIXEL_CHROMA = 32;
const PHOTO_COLORFUL_RATIO = 0.12;
const PHOTO_MEAN_CHROMA = 20;

/**
 * Night mode rule:
 * - scanned pages (one big image) invert with the text, otherwise night mode would show a white page;
 * - grey images (diagrams, charts, black-and-white figures) invert so no white box glares;
 * - colourful images (photos) are shown in natural colours.
 */
export function classifyImage(stats: ImageStats): ImageTreatment {
  if (stats.areaRatio > SCANNED_PAGE_AREA) return 'invert';
  if (stats.colorfulRatio > PHOTO_COLORFUL_RATIO || stats.meanChroma > PHOTO_MEAN_CHROMA) return 'natural';
  return 'invert';
}

/** Computes colour statistics from RGBA pixel data (e.g. ImageData.data). */
export function pixelStats(rgba: ArrayLike<number>): { meanChroma: number; colorfulRatio: number } {
  let sum = 0;
  let colorful = 0;
  let count = 0;
  for (let i = 0; i + 3 < rgba.length; i += 4) {
    if (rgba[i + 3] === 0) continue; // fully transparent
    const r = rgba[i], g = rgba[i + 1], b = rgba[i + 2];
    const chroma = Math.max(r, g, b) - Math.min(r, g, b);
    sum += chroma;
    if (chroma > COLORFUL_PIXEL_CHROMA) colorful++;
    count++;
  }
  return count ? { meanChroma: sum / count, colorfulRatio: colorful / count } : { meanChroma: 0, colorfulRatio: 0 };
}
