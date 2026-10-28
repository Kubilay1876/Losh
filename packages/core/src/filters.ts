import { MODES } from './modes';
import type { Settings } from './settings';

/** Candle-like warm colour (~1900 K) used for the warm light overlay. */
export const WARM_COLOR = 'rgb(255, 147, 41)';
const WARM_MAX_OPACITY = 0.45;

export interface FilterResult {
  /** CSS `filter` for the page canvas ('none' when nothing changes). */
  pageFilter: string;
  /** Colour multiplied onto the page ('transparent' when none). */
  pageTint: string;
  /** CSS `backdrop-filter` that undoes the inversion over image areas, or null. */
  imageRestoreFilter: string | null;
  warmOverlay: { color: string; opacity: number };
  pageBg: string;
  viewerBg: string;
}

export function computeFilters(s: Settings): FilterResult {
  const mode = MODES[s.mode];
  const parts: string[] = [];
  if (mode.pageFilter) parts.push(mode.pageFilter);
  if (s.brightness !== 100) parts.push(`brightness(${s.brightness / 100})`);
  if (s.contrast !== 100) parts.push(`contrast(${s.contrast / 100})`);

  return {
    pageFilter: parts.length ? parts.join(' ') : 'none',
    pageTint: mode.pageTint ?? 'transparent',
    imageRestoreFilter: mode.inverted && s.preserveImages ? 'invert(1) hue-rotate(180deg)' : null,
    warmOverlay: {
      color: WARM_COLOR,
      opacity: Math.round((s.warmth / 100) * WARM_MAX_OPACITY * 1000) / 1000,
    },
    pageBg: mode.pageBg,
    viewerBg: mode.viewerBg,
  };
}
