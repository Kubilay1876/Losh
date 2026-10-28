import { describe, expect, it } from 'vitest';
import { computeFilters, WARM_COLOR } from './filters';
import { DEFAULT_SETTINGS, type Settings } from './settings';

const make = (patch: Partial<Settings>): Settings => ({ ...DEFAULT_SETTINGS, ...patch });

describe('computeFilters', () => {
  it('returns no filter for normal mode with neutral sliders', () => {
    const f = computeFilters(make({ mode: 'normal' }));
    expect(f.pageFilter).toBe('none');
    expect(f.warmOverlay.opacity).toBe(0);
    expect(f.imageRestoreFilter).toBeNull();
  });

  it('tints the page cream in the default paper mode', () => {
    const f = computeFilters(DEFAULT_SETTINGS);
    expect(f.pageTint).toMatch(/^#[0-9a-f]{6}$/i);
    expect(computeFilters(make({ mode: 'normal' })).pageTint).toBe('transparent');
  });

  it('inverts and rotates hue in night mode so colours keep their hue', () => {
    const f = computeFilters(make({ mode: 'night' }));
    expect(f.pageFilter).toMatch(/^invert\([\d.]+\) hue-rotate\(180deg\)/);
  });

  it('appends brightness and contrast only when they differ from 100', () => {
    const f = computeFilters(make({ mode: 'normal', brightness: 80, contrast: 120 }));
    expect(f.pageFilter).toBe('brightness(0.8) contrast(1.2)');
  });

  it('scales the warm overlay with warmth', () => {
    const half = computeFilters(make({ warmth: 50 }));
    const full = computeFilters(make({ warmth: 100 }));
    expect(half.warmOverlay.color).toBe(WARM_COLOR);
    expect(full.warmOverlay.opacity).toBeGreaterThan(half.warmOverlay.opacity);
    expect(full.warmOverlay.opacity).toBeLessThanOrEqual(0.5);
  });

  it('restores images only in inverted modes when enabled', () => {
    expect(computeFilters(make({ mode: 'night', preserveImages: true })).imageRestoreFilter).not.toBeNull();
    expect(computeFilters(make({ mode: 'darkSepia', preserveImages: true })).imageRestoreFilter).not.toBeNull();
    expect(computeFilters(make({ mode: 'sepia', preserveImages: true })).imageRestoreFilter).toBeNull();
    expect(computeFilters(make({ mode: 'night', preserveImages: false })).imageRestoreFilter).toBeNull();
  });
});
