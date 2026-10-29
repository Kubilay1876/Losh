export interface PinchTarget {
  /** How far the zoom may go from the current scale, as [smallest, largest] factor. */
  range(): [number, number];
  /** Applies the final zoom once the fingers lift. `origin` is in client coordinates. */
  zoomBy(factor: number, origin: [number, number]): void;
}

/**
 * Two-finger pinch on the pages zooms the PDF (sharp re-render) instead of blowing up the whole app,
 * and two fingers moving together scroll (the only way to scroll while the highlighter is on).
 * While the fingers move, the pages are only stretched like a picture (cheap, smooth); the real
 * zoom, which re-lays out every page, happens once at the end.
 * iOS ignores `user-scalable=no`, so its own gesture events are cancelled here as well.
 */
export function enablePinchZoom(el: HTMLElement, content: HTMLElement, target: PinchTarget): () => void {
  let startDistance = 0;
  let origin: [number, number] = [0, 0];
  let range: [number, number] = [1, 1];
  let factor = 1;
  let last: [number, number] = [0, 0];
  let startScroll: [number, number] = [0, 0];
  const distance = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const reset = () => {
    content.style.transform = '';
    content.style.transformOrigin = '';
    content.style.willChange = '';
  };

  const onStart = (e: TouchEvent) => {
    if (e.touches.length !== 2) return;
    const [a, b] = [e.touches[0], e.touches[1]];
    startDistance = distance(e.touches);
    origin = [(a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2];
    last = origin;
    startScroll = [el.scrollLeft, el.scrollTop];
    range = target.range();
    factor = 1;
    const box = content.getBoundingClientRect();
    content.style.transformOrigin = `${origin[0] - box.left}px ${origin[1] - box.top}px`;
    content.style.willChange = 'transform';
  };
  const onMove = (e: TouchEvent) => {
    if (e.touches.length !== 2 || !startDistance) return;
    if (e.cancelable) e.preventDefault();
    const [a, b] = [e.touches[0], e.touches[1]];
    const mid: [number, number] = [(a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2];
    el.scrollLeft -= mid[0] - last[0];
    el.scrollTop -= mid[1] - last[1];
    last = mid;
    factor = Math.min(range[1], Math.max(range[0], distance(e.touches) / startDistance));
    // Fingers sliding together never hold exactly the same distance: no wobble while just scrolling.
    content.style.transform = Math.abs(factor - 1) < 0.03 ? '' : `scale(${factor})`;
  };
  const onEnd = (e: TouchEvent) => {
    if (e.touches.length >= 2 || !startDistance) return;
    startDistance = 0;
    reset();
    // Skip finger jitter that is not a real zoom. The spot that was under the fingers has moved with the scrolling.
    if (Math.abs(factor - 1) >= 0.03) target.zoomBy(factor, [origin[0] - (el.scrollLeft - startScroll[0]), origin[1] - (el.scrollTop - startScroll[1])]);
  };
  const cancel = (e: Event) => e.preventDefault();

  el.addEventListener('touchstart', onStart, { passive: true });
  el.addEventListener('touchmove', onMove, { passive: false });
  el.addEventListener('touchend', onEnd);
  el.addEventListener('touchcancel', onEnd);
  el.addEventListener('gesturestart', cancel);
  el.addEventListener('gesturechange', cancel);
  return () => {
    reset();
    el.removeEventListener('touchstart', onStart);
    el.removeEventListener('touchmove', onMove);
    el.removeEventListener('touchend', onEnd);
    el.removeEventListener('touchcancel', onEnd);
    el.removeEventListener('gesturestart', cancel);
    el.removeEventListener('gesturechange', cancel);
  };
}
