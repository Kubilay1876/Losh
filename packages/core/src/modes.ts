export const MODE_IDS = ['normal', 'sepia', 'night', 'darkSepia'] as const;
export type ModeId = (typeof MODE_IDS)[number];

export interface ModeDef {
  id: ModeId;
  /** CSS filter applied to the rendered page canvas. */
  pageFilter: string;
  /** Colour multiplied onto the page before the filter (white paper → this colour, black ink stays black). */
  pageTint: string | null;
  /** Page colour shown while a page is still rendering (avoids a white flash). */
  pageBg: string;
  /** Background around the pages. */
  viewerBg: string;
  /** True when the mode inverts lightness (dark page, light text). */
  inverted: boolean;
}

export const MODES: Record<ModeId, ModeDef> = {
  normal: {
    id: 'normal',
    pageFilter: '',
    pageTint: null,
    pageBg: '#ffffff',
    viewerBg: '#3a3733',
    inverted: false,
  },
  sepia: {
    id: 'sepia',
    pageFilter: 'contrast(0.94)',
    pageTint: '#f4e4c6',
    pageBg: '#efe0c4',
    viewerBg: '#4a4239',
    inverted: false,
  },
  night: {
    id: 'night',
    pageFilter: 'invert(0.9) hue-rotate(180deg)',
    pageTint: null,
    pageBg: '#1a1a1a',
    viewerBg: '#121212',
    inverted: true,
  },
  darkSepia: {
    id: 'darkSepia',
    pageFilter: 'invert(0.88) hue-rotate(180deg) sepia(0.45)',
    pageTint: null,
    pageBg: '#2a241d',
    viewerBg: '#17130f',
    inverted: true,
  },
};

export function isModeId(value: unknown): value is ModeId {
  return typeof value === 'string' && (MODE_IDS as readonly string[]).includes(value);
}
