/**
 * Two-finger pinch on the pages zooms the PDF (sharp re-render) instead of blowing up the whole app.
 * iOS ignores `user-scalable=no`, so its own gesture events are cancelled here as well.
 */
export function enablePinchZoom(el: HTMLElement, zoomBy: (factor: number, origin: [number, number]) => void): () => void {
  let last = 0;
  const distance = (t: TouchList) => Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const onStart = (e: TouchEvent) => {
    if (e.touches.length === 2) last = distance(e.touches);
  };
  const onMove = (e: TouchEvent) => {
    if (e.touches.length !== 2 || !last) return;
    if (e.cancelable) e.preventDefault();
    const d = distance(e.touches);
    // Skip finger jitter; small steps add up until they are worth a zoom.
    if (Math.abs(d / last - 1) < 0.03) return;
    const [a, b] = [e.touches[0], e.touches[1]];
    zoomBy(d / last, [(a.clientX + b.clientX) / 2, (a.clientY + b.clientY) / 2]);
    last = d;
  };
  const onEnd = (e: TouchEvent) => {
    if (e.touches.length < 2) last = 0;
  };
  const cancel = (e: Event) => e.preventDefault();

  el.addEventListener('touchstart', onStart, { passive: true });
  el.addEventListener('touchmove', onMove, { passive: false });
  el.addEventListener('touchend', onEnd);
  el.addEventListener('touchcancel', onEnd);
  el.addEventListener('gesturestart', cancel);
  el.addEventListener('gesturechange', cancel);
  return () => {
    el.removeEventListener('touchstart', onStart);
    el.removeEventListener('touchmove', onMove);
    el.removeEventListener('touchend', onEnd);
    el.removeEventListener('touchcancel', onEnd);
    el.removeEventListener('gesturestart', cancel);
    el.removeEventListener('gesturechange', cancel);
  };
}
