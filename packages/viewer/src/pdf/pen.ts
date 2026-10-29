export type PenTool = 'pen' | 'eraser';

export interface PenTarget {
  /** The tool in hand, or null when the highlighter is off (then the page scrolls and selects as usual). */
  tool(): PenTool | null;
  /** A stroke is under way on `page` (the pdf.js page element); `points` are in client coordinates. */
  draw(page: HTMLElement, points: [number, number][], tool: PenTool): void;
  /** The finger lifted: keep the stroke (a mark, or what the eraser rubbed out). */
  commit(page: HTMLElement, points: [number, number][], tool: PenTool): void;
  /** The stroke was dropped (a second finger came: that is a pinch or a scroll). */
  cancel(): void;
}

/**
 * Highlighter and eraser strokes with one finger, the mouse or a stylus. Both work the same way: the
 * eraser rubs out only what it goes over. While the highlighter is on, the page does not scroll under
 * one finger (`touch-action: none`, set in CSS); two fingers still pinch and scroll.
 */
export function enablePen(el: HTMLElement, target: PenTarget): () => void {
  let stroke: { id: number; page: HTMLElement; tool: PenTool; points: [number, number][] } | null = null;
  const fingers = new Set<number>();
  let frame = 0;

  const drop = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (stroke) target.cancel();
    stroke = null;
  };

  const onDown = (e: PointerEvent) => {
    const tool = target.tool();
    if (!tool) return;
    if (e.pointerType === 'touch') fingers.add(e.pointerId);
    if (fingers.size > 1) return drop();
    if (e.button !== 0) return;
    const page = (e.target as Element | null)?.closest<HTMLElement>('.page');
    if (!page) return;
    // No text selection, no link clicks, no long-press menu while marking.
    e.preventDefault();
    el.setPointerCapture?.(e.pointerId);
    stroke = { id: e.pointerId, page, tool, points: [[e.clientX, e.clientY]] };
  };

  const onMove = (e: PointerEvent) => {
    if (!stroke || e.pointerId !== stroke.id) return;
    stroke.points.push([e.clientX, e.clientY]);
    // One update per frame, however fast the events come.
    if (!frame) {
      frame = requestAnimationFrame(() => {
        frame = 0;
        if (stroke) target.draw(stroke.page, stroke.points, stroke.tool);
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
    done.points.push([e.clientX, e.clientY]);
    target.commit(done.page, done.points, done.tool);
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
