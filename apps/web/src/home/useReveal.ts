import { useEffect } from 'preact/hooks';
import type { RefObject } from 'preact';

/**
 * Fades elements marked with `data-reveal` in as they scroll into view.
 * Content stays visible without JavaScript: elements are only hidden once the root gets `reveal-ready`,
 * and the CSS does nothing at all for people who prefer reduced motion.
 */
export function useReveal(root: RefObject<HTMLElement | null>, enabled: boolean): void {
  useEffect(() => {
    const el = root.current;
    if (!enabled || !el || !('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.12 },
    );
    el.querySelectorAll('[data-reveal]').forEach((node) => observer.observe(node));
    el.classList.add('reveal-ready');
    return () => observer.disconnect();
  }, [root, enabled]);
}
