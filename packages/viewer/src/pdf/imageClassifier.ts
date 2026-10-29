import { classifyImage, pixelStats } from '@losh/core';

/**
 * Each image is scaled down to at most this width (keeping its shape) before measuring. Sharp enough
 * that the lines of a scanned page stay apart from the paper between them, small enough to be quick.
 */
const SAMPLE_WIDTH = 120;
let scratch: CanvasRenderingContext2D | null = null;

/**
 * Tags pdf.js image placeholders on a page with data-losh-image="natural" | "invert",
 * based on the rendered (unfiltered) page canvas. Already tagged placeholders are skipped.
 */
export function classifyPageImages(pageDiv: HTMLElement, canvas: HTMLCanvasElement | null | undefined): void {
  const placeholders = pageDiv.querySelectorAll<HTMLElement>('.textLayerImagePlaceholder:not([data-losh-image])');
  if (!placeholders.length || !canvas?.width || !canvas.height) return;
  const cv = canvas.getBoundingClientRect();
  if (!cv.width || !cv.height) return;

  scratch ??= document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  if (!scratch) return;

  for (const ph of placeholders) {
    const r = ph.getBoundingClientRect();
    const sx = Math.max(0, ((r.left - cv.left) / cv.width) * canvas.width);
    const sy = Math.max(0, ((r.top - cv.top) / cv.height) * canvas.height);
    const sw = Math.min(canvas.width - sx, (r.width / cv.width) * canvas.width);
    const sh = Math.min(canvas.height - sy, (r.height / cv.height) * canvas.height);
    if (sw < 1 || sh < 1) continue;

    const w = Math.max(1, Math.round(Math.min(SAMPLE_WIDTH, sw)));
    const h = Math.max(1, Math.round((sh / sw) * w));
    scratch.canvas.width = w;
    scratch.canvas.height = h;
    scratch.drawImage(canvas, sx, sy, sw, sh, 0, 0, w, h);
    const stats = pixelStats(scratch.getImageData(0, 0, w, h).data);
    ph.dataset.loshImage = classifyImage({ areaRatio: (r.width * r.height) / (cv.width * cv.height), ...stats });
  }
}
