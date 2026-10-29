export type PenTool = 'pen' | 'eraser';

export interface PenTarget {
  /** The tool in hand, or null when the highlighter is off (then the page scrolls and selects as usual). */
  tool(): PenTool | null;
  /** A stroke is under way on `page` (the pdf.js page element); `points` are in client coordinates. */
  draw(page: HTMLElement, points: [number, number][]): void;
  /** The finger lifted: keep the stroke. */
  commit(page: HTMLElement, points: [number, number][]): void;
  /** The stroke was dropped (a second finger came: that is a pinch or a scroll). */
  cancel(): void;
  /** The eraser touched a point. */
  erase(page: HTMLElement, x: number, y: number): void;
}

/**
 * Highlighter strokes with one finger, the mouse or a stylus. While the highlighter is on, the page
 * does not scroll under one finger (`touch-action: none`, set in CSS); two fingers still pinch and scroll.
 */
export function enablePen(el: HTMLElement, target: PenTarget): () => void {
  let stroke: { id: number; page: HTMLElement; points: [number, number][] } | null = null;
  const fingers = new Set<number>();
  let frame = 0;

  const pageAt = (e: PointerEvent) => (e.target as Element | null)?.closest<HTMLElement>('.page') ?? null;

  const drop = () => {
    cancelAnimationFrame(frame);
    if (stroke) target.cancel();
    stroke = null;
  };

  const onDown = (e: PointerEvent) => {
    const tool = target.tool();
    if (!tool) return;
    if (e.pointerType === 'touch') fingers.add(e.pointerId);
    if (fingers.size > 1) return drop();
    if (e.button !== 0) return;
    const page = pageAt(e);
    if (!page) return;
    // No text selection, no link clicks, no long-press menu while marking.
    e.preventDefault();
    el.setPointerCapture?.(e.pointerId);
    if (tool === 'eraser') {
      stroke = { id: e.pointerId, page, points: [] };
      target.erase(page, e.clientX, e.clientY);
      return;
    }
    stroke = { id: e.pointerId, page, points: [[e.clientX, e.clientY]] };
  };

  const onMove = (e: PointerEvent) => {
    if (!stroke || e.pointerId !== stroke.id) return;
    if (target.tool() === 'eraser') {
      const page = (document.elementFromPoint(e.clientX, e.clientY) as Element | null)?.closest<HTMLElement>('.page');
      if (page) target.erase(page, e.clientX, e.clientY);
      return;
    }
    stroke.points.push([e.clientX, e.clientY]);
    // One update per frame, however fast the events come.
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (stroke) target.draw(stroke.page, stroke.points);
      });
    }
  };

  const onUp = (e: PointerEvent) => {
    fingers.delete(e.pointerId);
    if (!stroke || e.pointerId !== stroke.id) return;
    cancelAnimationFrame(frame);
    frame = 0;
    const done = stroke;
    stroke = null;
    if (target.tool() === 'pen') {
      done.points.push([e.clientX, e.clientY]);
      target.commit(done.page, done.points);
    }
  };

  const onCancel = (e: PointerEvent) => {
    fingers.delete(e.pointerId);
    if (stroke && e.pointerId === stroke.id) drop();
  };

  el.addEventListener('pointerdown', onDown);
  el.addEventListener('pointermove', onMove);
  el.addEventListener('pointerup', onUp);
  el.addEventListener('pointercancel', onCancel);
  return () => {
    drop();
    el.removeEventListener('pointerdown', onDown);
    el.removeEventListener('pointermove', onMove);
    el.removeEventListener('pointerup', onUp);
    el.removeEventListener('pointercancel', onCancel);
  };
}
