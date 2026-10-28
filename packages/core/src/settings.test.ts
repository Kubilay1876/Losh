import { describe, expect, it } from 'vitest';
import { DEFAULT_SETTINGS, sanitizeSettings } from './settings';

describe('sanitizeSettings', () => {
  it('returns defaults for missing or broken input', () => {
    expect(sanitizeSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings('garbage')).toEqual(DEFAULT_SETTINGS);
    expect(sanitizeSettings({ mode: 'neon', locale: 'de' })).toEqual(DEFAULT_SETTINGS);
  });

  it('defaults to the sepia (paper) mode', () => {
    expect(DEFAULT_SETTINGS.mode).toBe('sepia');
  });

  it('keeps valid values', () => {
    const s = sanitizeSettings({ mode: 'night', warmth: 30, locale: 'en', preserveImages: true });
    expect(s.mode).toBe('night');
    expect(s.warmth).toBe(30);
    expect(s.locale).toBe('en');
    expect(s.preserveImages).toBe(true);
  });

  it('clamps and rounds numbers into range', () => {
    const s = sanitizeSettings({ warmth: 500, brightness: 10, contrast: 99.6, breakReminder: { intervalMinutes: 1 } });
    expect(s.warmth).toBe(100);
    expect(s.brightness).toBe(50);
    expect(s.contrast).toBe(100);
    expect(s.breakReminder.intervalMinutes).toBe(5);
  });

  it('rejects NaN and wrong types', () => {
    const s = sanitizeSettings({ warmth: Number.NaN, brightness: '120', breakReminder: { enabled: 'yes' } });
    expect(s.warmth).toBe(DEFAULT_SETTINGS.warmth);
    expect(s.brightness).toBe(DEFAULT_SETTINGS.brightness);
    expect(s.breakReminder.enabled).toBe(false);
  });

  it('shows photos in natural colours by default', () => {
    expect(DEFAULT_SETTINGS.preserveImages).toBe(true);
    expect(sanitizeSettings({ preserveImages: false }).preserveImages).toBe(false);
  });

  it('keeps the break reminder off by default', () => {
    expect(DEFAULT_SETTINGS.breakReminder.enabled).toBe(false);
    expect(DEFAULT_SETTINGS.breakReminder.intervalMinutes).toBe(20);
  });

  it('asks before keeping PDFs on the device', () => {
    expect(DEFAULT_SETTINGS.keepRecent).toBe('ask');
    expect(sanitizeSettings({ keepRecent: 'always' }).keepRecent).toBe('always');
    expect(sanitizeSettings({ keepRecent: 'sometimes' }).keepRecent).toBe('ask');
  });

  it('opens PDFs at page width unless "fit text" was chosen', () => {
    expect(DEFAULT_SETTINGS.fitText).toBe(false);
    expect(sanitizeSettings({ fitText: true }).fitText).toBe(true);
    expect(sanitizeSettings({ fitText: 'yes' }).fitText).toBe(false);
  });
});
