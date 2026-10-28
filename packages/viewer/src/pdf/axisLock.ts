/** Finger travel (px) before deciding whether a swipe goes down or sideways. */
const DECIDE_PX = 10;
/** A swipe counts as sideways only when it is clearly more sideways than vertical. */
const SIDEWAYS_RATIO = 1.2;
/** How quickly a sideways fling slows down, per frame. */
const FLING_FRICTION = 0.92;

/**
 * Keeps one-finger scrolling on one axis, so reading down a zoomed page does not drift sideways.
 * The browser does the vertical scrolling itself (`touch-action: pan-y` on the element: native and smooth);
 * sideways moves are done here, and only for swipes that are clearly sideways.
 */
export function enableAxisLock(el: HTMLElement): () => void {
  let tracking = false;
  let axis: 'x' | 'y' | null = null;
  let startX = 0;
  let startY = 0;
  let startLeft = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;
  let fling = 0;

  const onStart = (e: TouchEvent) => {
    cancelAnimationFrame(fling);
    tracking = e.touches.length === 1;
    if (!tracking) return;
    axis = null;
    startX = lastX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    startLeft = el.scrollLeft;
    lastTime = e.timeStamp;
    velocity = 0;
  };
  const onMove = (e: TouchEvent) => {
    if (!tracking || e.touches.length !== 1) return;
    const { clientX, clientY } = e.touches[0];
    const dx = clientX - startX;
    const dy = clientY - startY;
    if (!axis) {
      if (Math.hypot(dx, dy) < DECIDE_PX) return;
      axis = Math.abs(dx) > Math.abs(dy) * SIDEWAYS_RATIO ? 'x' : 'y';
    }
    if (axis !== 'x') return;
    if (e.cancelable) e.preventDefault();
    el.scrollLeft = startLeft - dx;
    const dt = e.timeStamp - lastTime;
    if (dt > 0) velocity = 0.8 * ((clientX - lastX) / dt) + 0.2 * velocity;
    lastX = clientX;
    lastTime = e.timeStamp;
  };
  const onEnd = (e: TouchEvent) => {
    if (!tracking || e.touches.length) return;
    tracking = false;
    if (axis !== 'x' || e.timeStamp - lastTime > 80) return; // the finger rested before lifting: no fling
    let step = velocity * 16; // px per frame
    const glide = () => {
      if (Math.abs(step) < 0.5) return;
      el.scrollLeft -= step;
      step *= FLING_FRICTION;
      fling = requestAnimationFrame(glide);
    };
    fling = requestAnimationFrame(glide);
  };

  el.addEventListener('touchstart', onStart, { passive: true });
  el.addEventListener('touchmove', onMove, { passive: false });
  el.addEventListener('touchend', onEnd);
  el.addEventListener('touchcancel', onEnd);
  return () => {
    cancelAnimationFrame(fling);
    el.removeEventListener('touchstart', onStart);
    el.removeEventListener('touchmove', onMove);
    el.removeEventListener('touchend', onEnd);
    el.removeEventListener('touchcancel', onEnd);
  };
}
