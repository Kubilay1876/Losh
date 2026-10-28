import { isModeId, type ModeId } from './modes';

export const LOCALES = ['tr', 'en'] as const;
export type Locale = (typeof LOCALES)[number];

export interface Settings {
  mode: ModeId;
  /** Warm light overlay strength, 0–100. */
  warmth: number;
  /** Percent, 50–150 (100 = unchanged). */
  brightness: number;
  /** Percent, 50–150 (100 = unchanged). */
  contrast: number;
  /** In inverted modes, show colourful photos in natural colours (diagrams and scans still invert). */
  preserveImages: boolean;
  locale: Locale;
  breakReminder: {
    enabled: boolean;
    intervalMinutes: number;
    /** Whether the user has already been asked to turn it on. */
    asked: boolean;
  };
}

export const SETTINGS_LIMITS = {
  warmth: { min: 0, max: 100 },
  brightness: { min: 50, max: 150 },
  contrast: { min: 50, max: 150 },
  intervalMinutes: { min: 5, max: 120 },
} as const;

export const DEFAULT_SETTINGS: Settings = {
  mode: 'sepia',
  warmth: 0,
  brightness: 100,
  contrast: 100,
  preserveImages: true,
  locale: 'tr',
  breakReminder: { enabled: false, intervalMinutes: 20, asked: false },
};

function clampNumber(value: unknown, limits: { min: number; max: number }, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) return fallback;
  return Math.min(limits.max, Math.max(limits.min, Math.round(value)));
}

function bool(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback;
}

/** Turns anything read from storage into valid settings, filling gaps with defaults. */
export function sanitizeSettings(raw: unknown): Settings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const br = (r.breakReminder && typeof r.breakReminder === 'object' ? r.breakReminder : {}) as Record<string, unknown>;
  const d = DEFAULT_SETTINGS;
  return {
    mode: isModeId(r.mode) ? r.mode : d.mode,
    warmth: clampNumber(r.warmth, SETTINGS_LIMITS.warmth, d.warmth),
    brightness: clampNumber(r.brightness, SETTINGS_LIMITS.brightness, d.brightness),
    contrast: clampNumber(r.contrast, SETTINGS_LIMITS.contrast, d.contrast),
    preserveImages: bool(r.preserveImages, d.preserveImages),
    locale: (LOCALES as readonly unknown[]).includes(r.locale) ? (r.locale as Locale) : d.locale,
    breakReminder: {
      enabled: bool(br.enabled, d.breakReminder.enabled),
      intervalMinutes: clampNumber(br.intervalMinutes, SETTINGS_LIMITS.intervalMinutes, d.breakReminder.intervalMinutes),
      asked: bool(br.asked, d.breakReminder.asked),
    },
  };
}
