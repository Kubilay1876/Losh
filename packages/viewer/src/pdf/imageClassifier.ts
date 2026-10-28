import { classifyImage, pixelStats } from '@losh/core';

/** Each image area is scaled down to SAMPLE×SAMPLE pixels before measuring colour. */
const SAMPLE = 48;
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

  if (!scratch) {
    const c = document.createElement('canvas');
    c.width = c.height = SAMPLE;
    scratch = c.getContext('2d', { willReadFrequently: true });
    if (!scratch) return;
  }

  for (const ph of placeholders) {
    const r = ph.getBoundingClientRect();
    const sx = Math.max(0, ((r.left - cv.left) / cv.width) * canvas.width);
    const sy = Math.max(0, ((r.top - cv.top) / cv.height) * canvas.height);
    const sw = Math.min(canvas.width - sx, (r.width / cv.width) * canvas.width);
    const sh = Math.min(canvas.height - sy, (r.height / cv.height) * canvas.height);
    if (sw < 1 || sh < 1) continue;

    scratch.clearRect(0, 0, SAMPLE, SAMPLE);
    scratch.drawImage(canvas, sx, sy, sw, sh, 0, 0, SAMPLE, SAMPLE);
    const stats = pixelStats(scratch.getImageData(0, 0, SAMPLE, SAMPLE).data);
    ph.dataset.loshImage = classifyImage({ areaRatio: (r.width * r.height) / (cv.width * cv.height), ...stats });
  }
}
