export interface PinchTarget {
  /** How far the zoom may go from the current scale, as [smallest, largest] factor. */
  range(): [number, number];
  /** Applies the final zoom once the fingers lift. `origin` is in client coordinates. */
  zoomBy(factor: number, origin: [number, number]): void;
}

/**
 * Two-finger pinch on the pages zooms the PDF (sharp re-render) instead of blowing up the whole app.
 * While the fingers move, the pages are only stretched like a picture (cheap, smooth); the real
 * zoom, which re-lays out every page, happens once at the end.
 * iOS ignores `user-scalable=no`, so its own gesture events are cancelled here as well.
 */
export function enablePinchZoom(el: HTMLElement, content: HTMLElement, target: PinchTarget): () => void {
  let startDistance = 0;
  let origin: [number, number] = [0, 0];
  let range: [number, number] = [1, 1];
  let factor = 1;
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
    range = target.range();
    factor = 1;
    const box = content.getBoundingClientRect();
    content.style.transformOrigin = `${origin[0] - box.left}px ${origin[1] - box.top}px`;
    content.style.willChange = 'transform';
  };
  const onMove = (e: TouchEvent) => {
    if (e.touches.length !== 2 || !startDistance) return;
    if (e.cancelable) e.preventDefault();
    factor = Math.min(range[1], Math.max(range[0], distance(e.touches) / startDistance));
    content.style.transform = `scale(${factor})`;
  };
  const onEnd = (e: TouchEvent) => {
    if (e.touches.length >= 2 || !startDistance) return;
    startDistance = 0;
    reset();
    // Skip finger jitter that is not a real zoom.
    if (Math.abs(factor - 1) >= 0.03) target.zoomBy(factor, origin);
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
